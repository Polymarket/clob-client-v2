import { Wallet } from "@ethersproject/wallet";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClobClient } from "../../src/client.js";
import { get } from "../../src/http-helpers/index.js";
import type { SignedOrderV1 } from "../../src/order-utils/index.js";
import { Chain, type MarketDetails, Side } from "../../src/types/index.js";

vi.mock("../../src/http-helpers/index.js", async importOriginal => ({
	...(await importOriginal<typeof import("../../src/http-helpers/index.js")>()),
	get: vi.fn(),
}));

const host = "https://clob.example.test";
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
const signedOrder: SignedOrderV1 = {
	salt: "1",
	maker: "0xmaker",
	signer: "0xsigner",
	taker: "0xtaker",
	tokenId: "a-yes",
	makerAmount: "100",
	takerAmount: "200",
	side: Side.BUY,
	expiration: "0",
	nonce: "0",
	feeRateBps: "0",
	signatureType: 0,
	signature: "0xsig",
};

function tradingClient() {
	const client = new ClobClient({
		host,
		chain: Chain.AMOY,
		signer: new Wallet("0x0000000000000000000000000000000000000000000000000000000000000001"),
		creds: { key: "key", secret: "c2VjcmV0", passphrase: "passphrase" },
	});
	vi.spyOn(client.orderBuilder, "buildMarketOrder").mockResolvedValue(signedOrder);
	vi.spyOn(client.orderBuilder, "buildOrder").mockResolvedValue(signedOrder);
	vi.spyOn(client, "postOrder").mockResolvedValue({
		success: true,
		errorMsg: "",
		orderID: "order-1",
		status: "matched",
		takingAmount: "200",
		makingAmount: "100",
	});
	return client;
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason: Error) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

function createMarketOrder(client: ClobClient, tokenID = "a-yes") {
	return client.createAndPostMarketOrder({ tokenID, amount: 10, side: Side.BUY, price: 0.5 });
}

beforeEach(() => {
	vi.mocked(get)
		.mockReset()
		.mockImplementation(async endpoint => {
			if (endpoint === `${host}/version`) return { version: 2 };
			if (endpoint === `${host}/clob-markets/market-a`) return market;
			if (endpoint.startsWith(`${host}/markets-by-token/`))
				return { condition_id: "market-a" };
			throw new Error(`Unexpected request: ${endpoint}`);
		});
});

afterEach(() => vi.restoreAllMocks());

describe("ClobClient.warmUp", () => {
	it("warms public metadata concurrently without a signer or credentials", async () => {
		const version = deferred<{ version: number }>();
		const details = deferred<MarketDetails>();
		vi.mocked(get).mockImplementation(endpoint =>
			endpoint.endsWith("/version") ? version.promise : details.promise,
		);
		const client = new ClobClient({ host, chain: Chain.AMOY });
		const warming = client.warmUp({ conditionID: "market-a" });
		expect(vi.mocked(get).mock.calls.map(([url]) => url)).toEqual([
			`${host}/version`,
			`${host}/clob-markets/market-a`,
		]);
		version.resolve({ version: 2 });
		details.resolve(market);
		await warming;
		for (const token of ["a-yes", "a-no"]) {
			expect(client.tickSizes[token]).toBe("0.01");
			expect(client.negRisk[token]).toBe(true);
			expect(client.feeInfos[token]).toEqual({ rate: 0.25, exponent: 2 });
		}
	});

	it("reuses version-only and market warm-ups for both market and limit orders", async () => {
		const client = tradingClient();
		await client.warmUp();
		await client.warmUp({ conditionID: "market-a" });
		await client.warmUp({ conditionID: "market-a" });
		await createMarketOrder(client);
		await createMarketOrder(client, "a-no");
		await client.createAndPostOrder({ tokenID: "a-yes", price: 0.5, size: 20, side: Side.BUY });
		expect(get).toHaveBeenCalledTimes(2);
		expect(client.postOrder).toHaveBeenCalledTimes(3);
	});

	it("shares overlapping warm-ups and an order's metadata requests", async () => {
		const client = tradingClient();
		const details = deferred<MarketDetails>();
		vi.mocked(get).mockImplementation(async endpoint => {
			if (endpoint.endsWith("/version")) return { version: 2 };
			if (endpoint.includes("/clob-markets/")) return details.promise;
			return { condition_id: "market-a" };
		});
		const first = client.warmUp({ conditionID: "market-a" });
		const second = client.warmUp({ conditionID: "market-a" });
		const order = createMarketOrder(client);
		await vi.waitFor(() =>
			expect(get).toHaveBeenCalledWith(`${host}/markets-by-token/a-yes`, undefined),
		);
		details.resolve(market);
		await Promise.all([first, second, order]);
		expect(get).toHaveBeenCalledTimes(3);
		expect(client.postOrder).toHaveBeenCalledTimes(1);
	});

	it("does not fetch metadata again when warm-up finishes during token resolution", async () => {
		const client = tradingClient();
		const condition = deferred<{ condition_id: string }>();
		const fetch = vi.mocked(get).getMockImplementation();
		if (!fetch) throw new Error("Missing HTTP mock");
		vi.mocked(get).mockImplementation((endpoint, options) =>
			endpoint.includes("/markets-by-token/") ? condition.promise : fetch(endpoint, options),
		);
		const order = createMarketOrder(client);
		await vi.waitFor(() =>
			expect(get).toHaveBeenCalledWith(`${host}/markets-by-token/a-yes`, undefined),
		);
		await client.warmUp({ conditionID: "market-a" });
		condition.resolve({ condition_id: "market-a" });
		await order;
		expect(get).toHaveBeenCalledTimes(3);
	});

	it("keeps explicit metadata refreshes working", async () => {
		const client = tradingClient();
		await client.warmUp({ conditionID: "market-a" });
		vi.mocked(get).mockResolvedValueOnce({ ...market, mts: 0.001, fd: { r: 0.1, e: 1 } });
		await client.getClobMarketInfo("market-a");
		await client.warmUp({ conditionID: "market-a" });
		expect(client.tickSizes["a-yes"]).toBe("0.001");
		expect(client.feeInfos["a-no"]).toEqual({ rate: 0.1, exponent: 1 });
		expect(get).toHaveBeenCalledTimes(3);
	});

	it.each([false, true])("retries failed warm-ups with throwOnError=%s", async throwOnError => {
		const client = new ClobClient({ host, chain: Chain.AMOY, throwOnError });
		vi.mocked(get).mockResolvedValueOnce({ error: "temporarily unavailable", status: 503 });
		await expect(client.warmUp()).rejects.toThrow();
		await client.warmUp();
		await client.warmUp();
		expect(get).toHaveBeenCalledTimes(2);
	});

	it("preserves successful version warming when market warming fails", async () => {
		const client = tradingClient();
		vi.mocked(get)
			.mockResolvedValueOnce({ version: 2 })
			.mockResolvedValueOnce({ error: "unavailable" });
		await expect(client.warmUp({ conditionID: "market-a" })).rejects.toThrow();
		await createMarketOrder(client);
		expect(vi.mocked(get).mock.calls.filter(([url]) => url.endsWith("/version"))).toHaveLength(
			1,
		);
		expect(client.postOrder).toHaveBeenCalledTimes(1);
	});

	it("discards rejected in-flight requests so the next warm-up can retry", async () => {
		const client = tradingClient();
		vi.mocked(get).mockRejectedValueOnce(new Error("network down"));
		await expect(client.warmUp()).rejects.toThrow("network down");
		await client.warmUp({ conditionID: "market-a" });
		await createMarketOrder(client);
		expect(get).toHaveBeenCalledTimes(3);
	});

	it("warms each client independently", async () => {
		const first = tradingClient();
		const second = tradingClient();
		await first.warmUp({ conditionID: "market-a" });
		await second.warmUp({ conditionID: "market-a" });
		expect(get).toHaveBeenCalledTimes(4);
	});

	it("warms a new market without refetching the version or a previous market", async () => {
		const client = tradingClient();
		await client.warmUp({ conditionID: "market-a" });
		vi.mocked(get).mockResolvedValueOnce({
			...market,
			c: "market-b",
			t: [
				{ t: "b-yes", o: "Yes" },
				{ t: "b-no", o: "No" },
			],
		});
		await client.warmUp({ conditionID: "market-b" });
		await client.warmUp({ conditionID: "market-a" });
		await createMarketOrder(client, "b-no");
		expect(get).toHaveBeenCalledTimes(3);
		expect(get).toHaveBeenLastCalledWith(`${host}/clob-markets/market-b`, undefined);
	});

	it("does not let an older warm-up overwrite a forced version refresh", async () => {
		const client = tradingClient();
		const olderVersion = deferred<{ version: number }>();
		vi.mocked(get).mockReturnValueOnce(olderVersion.promise);
		const warming = client.warmUp({ conditionID: "market-a" });
		vi.mocked(client.postOrder).mockRestore();
		// A separately submitted order can invalidate the version while warm-up is pending.
		vi.spyOn(client as any, "post").mockResolvedValue({ error: "order_version_mismatch" });
		vi.mocked(get).mockResolvedValueOnce({ version: 3 });
		await client.postOrder(signedOrder);
		olderVersion.resolve({ version: 2 });
		await warming;
		await client.createMarketOrder({ tokenID: "a-no", amount: 10, side: Side.BUY, price: 0.5 });
		expect(client.orderBuilder.buildMarketOrder).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			3,
		);
		expect(get).toHaveBeenCalledTimes(3);
	});

	it("refreshes a cached version after an order version mismatch", async () => {
		const client = tradingClient();
		await client.warmUp({ conditionID: "market-a" });
		vi.mocked(client.postOrder).mockRestore();
		// Stub only HTTP submission; exercise the real postOrder mismatch recovery.
		vi.spyOn(client as any, "post")
			.mockResolvedValueOnce({ error: "order_version_mismatch" })
			.mockResolvedValueOnce({ success: true, tradeIDs: [] });
		vi.mocked(get).mockResolvedValueOnce({ version: 3 });
		await createMarketOrder(client);
		expect(client.orderBuilder.buildMarketOrder).toHaveBeenNthCalledWith(
			1,
			expect.anything(),
			expect.anything(),
			2,
		);
		expect(client.orderBuilder.buildMarketOrder).toHaveBeenNthCalledWith(
			2,
			expect.anything(),
			expect.anything(),
			3,
		);
		await client.warmUp();
		expect(get).toHaveBeenCalledTimes(3);
	});
});
