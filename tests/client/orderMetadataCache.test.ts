import { Wallet } from "@ethersproject/wallet";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClobClient } from "../../src/client.js";
import { ApiError } from "../../src/errors.js";
import type { SignedOrderV1 } from "../../src/order-utils/index.js";
import { Chain, type MarketDetails, type OrderResponse, Side } from "../../src/types/index.js";

const host = "http://localhost:8080";

const market: MarketDetails = {
	c: "market-a",
	t: [
		{ t: "a-yes", o: "Yes" },
		{ t: "a-no", o: "No" },
	],
	mts: 0.01,
	nr: true,
	fd: { r: 0.25, e: 2 },
	r: null,
};

const signedOrder = {
	salt: "1000",
	maker: "0xmaker",
	signer: "0xsigner",
	taker: "0xtaker",
	tokenId: "a-yes",
	makerAmount: "50",
	takerAmount: "100",
	side: Side.BUY,
	expiration: "0",
	nonce: "0",
	feeRateBps: "0",
	signatureType: 0,
	signature: "0xsig",
} as unknown as SignedOrderV1;

const orderResponse: OrderResponse = {
	success: true,
	errorMsg: "",
	orderID: "0xorder",
	status: "matched",
	takingAmount: "100",
	makingAmount: "50",
};

const versionMismatch = { error: "order_version_mismatch" };

type Responder = () => unknown;

const makeClient = (options: { throwOnError?: boolean } = {}) => {
	const client = new ClobClient({
		host,
		chain: Chain.AMOY,
		signer: new Wallet("0x0000000000000000000000000000000000000000000000000000000000000001"),
		creds: { key: "key", secret: "c2VjcmV0LXNlY3JldC1zZWNyZXQ=", passphrase: "passphrase" },
		...options,
	});
	// Signing is out of scope. The version handed to the builder is what these tests check.
	vi.spyOn(client.orderBuilder, "buildOrder").mockResolvedValue(signedOrder);
	vi.spyOn(client.orderBuilder, "buildMarketOrder").mockResolvedValue(signedOrder);
	vi.spyOn(client as any, "post").mockResolvedValue(orderResponse);
	return client;
};

// The private http layer is stubbed so the real order and cache paths run.
const postSpy = (client: ClobClient) => (client as any).post as ReturnType<typeof vi.fn>;

// Routes the private GET helper to canned public metadata. A route responder may
// return a pending promise or throw to simulate slow or failing endpoints.
const mockGet = (
	client: ClobClient,
	routes: { version?: Responder; market?: Responder; token?: Responder } = {},
) =>
	vi.spyOn(client as any, "get").mockImplementation(async (endpoint: unknown) => {
		const url = String(endpoint);
		if (url.endsWith("/version")) return routes.version ? routes.version() : { version: 2 };
		if (url.includes("/clob-markets/")) return routes.market ? routes.market() : market;
		if (url.includes("/markets-by-token/")) {
			return routes.token ? routes.token() : { condition_id: "market-a" };
		}
		throw new Error(`unexpected request ${url}`);
	});

const requests = (get: ReturnType<typeof mockGet>, path: string) =>
	get.mock.calls.filter(([url]) => String(url).includes(path)).length;

const buildVersions = (client: ClobClient) =>
	vi.mocked(client.orderBuilder.buildMarketOrder).mock.calls.map(call => call[2]);

const marketOrder = (client: ClobClient, tokenID = "a-yes") =>
	client.createAndPostMarketOrder({ tokenID, amount: 10, side: Side.BUY, price: 0.5 });

// Runs the responders in order, then keeps running the last one.
const sequence = (...steps: Responder[]): Responder => {
	let index = 0;
	return () => {
		const step = steps[Math.min(index, steps.length - 1)];
		index += 1;
		return step ? step() : undefined;
	};
};

const deferred = <T>() => {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>(res => {
		resolve = res;
	});
	return { promise, resolve };
};

const settle = () => new Promise(resolve => setTimeout(resolve, 10));

afterEach(() => vi.restoreAllMocks());

describe("getVersion", () => {
	it("adopts the server version for the orders that follow", async () => {
		const client = makeClient();
		const get = mockGet(client, { version: () => ({ version: 3 }) });

		await expect(client.getVersion()).resolves.toBe(3);
		await marketOrder(client);

		expect(requests(get, "/version")).toBe(1);
		expect(buildVersions(client)).toEqual([3]);
	});

	it("returns the default version for an error response without caching it", async () => {
		const client = makeClient();
		const get = mockGet(client, {
			version: sequence(
				() => ({ error: "unavailable", status: 503 }),
				() => ({ version: 3 }),
			),
		});

		await expect(client.getVersion()).resolves.toBe(2);
		await marketOrder(client);

		expect(requests(get, "/version")).toBe(2);
		expect(buildVersions(client)).toEqual([3]);
	});

	it("propagates ApiError under throwOnError and leaves the cache empty", async () => {
		const client = makeClient({ throwOnError: true });
		const failure = new ApiError("unavailable", 503, { error: "unavailable", status: 503 });
		const get = mockGet(client, {
			version: sequence(
				() => {
					throw failure;
				},
				() => ({ version: 3 }),
			),
		});

		await expect(client.getVersion()).rejects.toBe(failure);
		await marketOrder(client);

		expect(requests(get, "/version")).toBe(2);
		expect(buildVersions(client)).toEqual([3]);
	});

	it("does not overwrite a forced refresh with a version fetched earlier", async () => {
		const client = makeClient();
		const older = deferred<unknown>();
		const get = mockGet(client, {
			version: sequence(
				() => older.promise,
				() => ({ version: 3 }),
			),
		});
		await client.getClobMarketInfo("market-a");

		// The order starts a version request. Before it resolves, a mismatch on a
		// separately posted order forces a refresh that returns a newer version.
		const pending = client.createMarketOrder({
			tokenID: "a-yes",
			amount: 10,
			side: Side.BUY,
			price: 0.5,
		});
		await vi.waitFor(() => expect(requests(get, "/version")).toBe(1));
		postSpy(client).mockResolvedValueOnce(versionMismatch);
		await client.postOrder(signedOrder);
		older.resolve({ version: 2 });
		await pending;
		await client.createMarketOrder({ tokenID: "a-no", amount: 10, side: Side.BUY, price: 0.5 });

		expect(requests(get, "/version")).toBe(2);
		expect(buildVersions(client)).toEqual([3, 3]);
	});
});

describe("order version resolution", () => {
	it("shares one in-flight version request between concurrent orders", async () => {
		const client = makeClient();
		const version = deferred<unknown>();
		const get = mockGet(client, { version: () => version.promise });
		await client.getClobMarketInfo("market-a");

		const orders = Promise.all([marketOrder(client), marketOrder(client, "a-no")]);
		await vi.waitFor(() => expect(requests(get, "/version")).toBe(1));
		await settle();
		version.resolve({ version: 2 });
		await orders;

		expect(requests(get, "/version")).toBe(1);
		expect(buildVersions(client)).toEqual([2, 2]);
	});

	it("retries every concurrent order after an order version mismatch", async () => {
		const client = makeClient();
		const first = deferred<unknown>();
		const second = deferred<unknown>();
		const get = mockGet(client, {
			version: sequence(
				() => ({ version: 2 }),
				() => first.promise,
				() => second.promise,
			),
		});
		await Promise.all([client.getVersion(), client.getClobMarketInfo("market-a")]);
		postSpy(client)
			.mockResolvedValueOnce(versionMismatch)
			.mockResolvedValueOnce(versionMismatch);

		const orders = Promise.all([marketOrder(client), marketOrder(client, "a-no")]);
		// Both forced refreshes are in flight. The first settles while the second is pending.
		await vi.waitFor(() => expect(requests(get, "/version")).toBe(3));
		first.resolve({ version: 3 });
		await settle();
		second.resolve({ version: 3 });

		expect(await orders).toEqual([orderResponse, orderResponse]);
		expect(buildVersions(client)).toEqual([2, 2, 3, 3]);
	});
});

describe("getClobMarketInfo", () => {
	it("caches both outcomes so primed orders need no metadata requests", async () => {
		const client = makeClient();
		const get = mockGet(client);

		await Promise.all([client.getVersion(), client.getClobMarketInfo("market-a")]);
		for (const token of ["a-yes", "a-no"]) {
			expect(client.tickSizes[token]).toBe("0.01");
			expect(client.negRisk[token]).toBe(true);
			expect(client.feeInfos[token]).toEqual({ rate: 0.25, exponent: 2 });
		}

		await marketOrder(client);
		await marketOrder(client, "a-no");
		await client.createAndPostOrder({ tokenID: "a-yes", price: 0.5, size: 20, side: Side.BUY });

		expect(get).toHaveBeenCalledTimes(2);
	});

	it("shares one in-flight request per condition and retries after a failure", async () => {
		const client = makeClient();
		const details = deferred<MarketDetails>();
		const get = mockGet(client, {
			market: sequence(
				() => details.promise,
				() => ({ error: "unavailable" }),
				() => market,
			),
		});

		const shared = Promise.all([
			client.getClobMarketInfo("market-a"),
			client.getClobMarketInfo("market-a"),
		]);
		details.resolve(market);
		expect(await shared).toEqual([market, market]);
		expect(requests(get, "/clob-markets/")).toBe(1);

		await expect(client.getClobMarketInfo("market-a")).rejects.toThrow(
			"failed to fetch market info",
		);
		await expect(client.getClobMarketInfo("market-a")).resolves.toEqual(market);
		expect(requests(get, "/clob-markets/")).toBe(3);
	});

	it("refreshes cached parameters on every call", async () => {
		const client = makeClient();
		mockGet(client, {
			market: sequence(
				() => market,
				() => ({ ...market, mts: 0.001, fd: { r: 0.1, e: 1 } }),
			),
		});

		await client.getClobMarketInfo("market-a");
		await client.getClobMarketInfo("market-a");

		expect(client.tickSizes["a-yes"]).toBe("0.001");
		expect(client.feeInfos["a-no"]).toEqual({ rate: 0.1, exponent: 1 });
	});

	it("is not fetched again by an order whose token resolved while the market was priming", async () => {
		const client = makeClient();
		const condition = deferred<unknown>();
		const get = mockGet(client, { token: () => condition.promise });

		const order = marketOrder(client);
		await vi.waitFor(() => expect(requests(get, "/markets-by-token/")).toBe(1));
		await client.getClobMarketInfo("market-a");
		condition.resolve({ condition_id: "market-a" });
		await order;

		expect(requests(get, "/clob-markets/")).toBe(1);
	});

	it("keeps caches per client instance", async () => {
		const first = makeClient();
		const second = makeClient();
		const firstGet = mockGet(first);
		const secondGet = mockGet(second);

		await Promise.all([first.getVersion(), first.getClobMarketInfo("market-a")]);
		await marketOrder(second);

		expect(firstGet).toHaveBeenCalledTimes(2);
		expect(requests(secondGet, "/version")).toBe(1);
		expect(requests(secondGet, "/clob-markets/")).toBe(1);
	});
});
