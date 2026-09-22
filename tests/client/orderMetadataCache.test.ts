import { Wallet } from "@ethersproject/wallet";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClobClient } from "../../src/client.js";
import { ApiError } from "../../src/errors.js";
import type { SignedOrderV1 } from "../../src/order-utils/index.js";
import { Chain, type MarketDetails, Side } from "../../src/types/index.js";

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
const mismatch = { error: "order_version_mismatch" };
const placed = { success: true, orderID: "0xorder", status: "matched" };
// Signing and posting are stubbed, so only the shape of the order matters.
const signedOrder = { salt: "1", tokenId: "a-yes" } as unknown as SignedOrderV1;

// Trading client with stubbed signing and http layers. `posts` are the responses of the
// first POSTs, after which every POST reports a placed order.
const makeClient = (posts: unknown[] = [], throwOnError = false) => {
	const client = new ClobClient({
		host: "http://localhost:8080",
		chain: Chain.AMOY,
		signer: new Wallet("0x0000000000000000000000000000000000000000000000000000000000000001"),
		creds: { key: "key", secret: "c2VjcmV0LXNlY3JldC1zZWNyZXQ=", passphrase: "passphrase" },
		throwOnError,
	});
	vi.spyOn(client.orderBuilder, "buildOrder").mockResolvedValue(signedOrder);
	vi.spyOn(client.orderBuilder, "buildMarketOrder").mockResolvedValue(signedOrder);
	const post = vi.spyOn(client as any, "post").mockResolvedValue(placed);
	for (const response of posts) post.mockResolvedValueOnce(response);
	return client;
};

// Routes the private GET helper to canned metadata. `version` and `details` may return a
// pending promise or throw to model slow or failing endpoints.
const mockGet = (
	client: ClobClient,
	version: () => unknown = () => ({ version: 2 }),
	details: () => unknown = () => market,
) =>
	vi.spyOn(client as any, "get").mockImplementation(async (url: unknown) => {
		if (String(url).endsWith("/version")) return version();
		if (String(url).includes("/clob-markets/")) return details();
		return { condition_id: "market-a" };
	});

const calls = (get: ReturnType<typeof mockGet>, path: string) =>
	get.mock.calls.filter(([url]) => String(url).includes(path)).length;
const posts = (client: ClobClient) =>
	((client as any).post as ReturnType<typeof vi.fn>).mock.calls.length;
const builtVersions = (client: ClobClient) =>
	vi.mocked(client.orderBuilder.buildMarketOrder).mock.calls.map(call => call[2]);
const marketOrder = (client: ClobClient, tokenID = "a-yes") =>
	client.createAndPostMarketOrder({ tokenID, amount: 10, side: Side.BUY, price: 0.5 });
const deferred = <T>() => {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>(res => {
		resolve = res;
	});
	return { promise, resolve };
};
const tick = () => new Promise(resolve => setTimeout(resolve, 10));

afterEach(() => vi.restoreAllMocks());

describe("order metadata caches", () => {
	it("primes the version and market caches so orders skip metadata requests", async () => {
		const client = makeClient();
		const get = mockGet(client, () => ({ version: 3 }));

		await Promise.all([client.getVersion(), client.getClobMarketInfo("market-a")]);
		await marketOrder(client);
		await marketOrder(client, "a-no");
		await client.createAndPostOrder({ tokenID: "a-yes", price: 0.5, size: 20, side: Side.BUY });

		expect(get).toHaveBeenCalledTimes(2);
		expect(builtVersions(client)).toEqual([3, 3]);
		expect(client.tickSizes["a-no"]).toBe("0.01");
		expect(client.feeInfos["a-no"]).toEqual({ rate: 0.25, exponent: 2 });
	});

	it("refreshes market parameters on every getClobMarketInfo call", async () => {
		const client = makeClient();
		const details = vi
			.fn()
			.mockReturnValueOnce(market)
			.mockReturnValue({ ...market, mts: 0.001 });
		mockGet(client, undefined, details);

		await client.getClobMarketInfo("market-a");
		await client.getClobMarketInfo("market-a");

		expect(client.tickSizes["a-yes"]).toBe("0.001");
	});

	it("adopts the default version when the version request fails and posts the order once", async () => {
		const client = makeClient();
		const version = vi
			.fn()
			.mockReturnValueOnce({ error: "unavailable", status: 503 })
			.mockReturnValue({ version: 3 });
		const get = mockGet(client, version);

		await expect(client.getVersion()).resolves.toBe(2);
		await expect(marketOrder(client)).resolves.toEqual(placed);

		expect(calls(get, "/version")).toBe(1);
		expect(builtVersions(client)).toEqual([2]);
		expect(posts(client)).toBe(1);
	});

	it("propagates ApiError from getVersion under throwOnError and leaves the cache empty", async () => {
		const client = makeClient([], true);
		const failure = new ApiError("unavailable", 503);
		const version = vi.fn().mockRejectedValueOnce(failure).mockReturnValue({ version: 3 });
		const get = mockGet(client, version);

		await expect(client.getVersion()).rejects.toBe(failure);
		await marketOrder(client);

		expect(calls(get, "/version")).toBe(2);
		expect(builtVersions(client)).toEqual([3]);
	});

	it("shares one in-flight version request between concurrent orders and getVersion", async () => {
		const client = makeClient();
		const version = deferred<unknown>();
		const get = mockGet(client, () => version.promise);

		const orders = Promise.all([marketOrder(client), marketOrder(client, "a-no")]);
		await vi.waitFor(() => expect(calls(get, "/version")).toBe(1));
		const poll = client.getVersion();
		version.resolve({ version: 3 });

		await expect(poll).resolves.toBe(3);
		await orders;
		expect(calls(get, "/version")).toBe(1);
		expect(calls(get, "/clob-markets/")).toBe(1);
		expect(builtVersions(client)).toEqual([3, 3]);
	});

	it("retries every concurrent order with the refreshed version after a mismatch", async () => {
		const client = makeClient([mismatch, mismatch]);
		const first = deferred<unknown>();
		const second = deferred<unknown>();
		const version = vi
			.fn()
			.mockReturnValueOnce({ version: 2 })
			.mockReturnValueOnce(first.promise)
			.mockReturnValue(second.promise);
		const get = mockGet(client, version);
		await Promise.all([client.getVersion(), client.getClobMarketInfo("market-a")]);

		const orders = Promise.all([marketOrder(client), marketOrder(client, "a-no")]);
		// Both forced refreshes are in flight. The first settles while the second is pending.
		await vi.waitFor(() => expect(calls(get, "/version")).toBe(3));
		first.resolve({ version: 3 });
		await tick();
		second.resolve({ version: 3 });

		expect(await orders).toEqual([placed, placed]);
		expect(builtVersions(client)).toEqual([2, 2, 3, 3]);
	});

	it("retries once after a mismatch under throwOnError", async () => {
		const client = makeClient([mismatch], true);
		mockGet(
			client,
			vi.fn().mockReturnValueOnce({ version: 2 }).mockReturnValue({ version: 3 }),
		);

		await expect(marketOrder(client)).resolves.toEqual(placed);

		expect(builtVersions(client)).toEqual([2, 3]);
	});

	it("returns the mismatch response when the retry is rejected again", async () => {
		const client = makeClient([mismatch, mismatch]);
		mockGet(
			client,
			vi.fn().mockReturnValueOnce({ version: 2 }).mockReturnValue({ version: 3 }),
		);

		await expect(marketOrder(client)).resolves.toEqual(mismatch);

		expect(posts(client)).toBe(2);
		expect(builtVersions(client)).toEqual([2, 3]);
	});
});
