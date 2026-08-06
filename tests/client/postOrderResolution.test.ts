import { Wallet } from "@ethersproject/wallet";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClobClient } from "../../src/client.js";
import type { SignedOrderV1 } from "../../src/order-utils/index.js";
import type { OrderResponse, Trade } from "../../src/types/index.js";
import { Chain, OrderType, Side } from "../../src/types/index.js";

const makeClient = () =>
	new ClobClient({
		host: "http://localhost:8080",
		chain: Chain.AMOY,
		signer: new Wallet("0x0000000000000000000000000000000000000000000000000000000000000001"),
		creds: { key: "key", secret: "c2VjcmV0LXNlY3JldC1zZWNyZXQ=", passphrase: "passphrase" },
	});

const makeSignedOrder = (): SignedOrderV1 =>
	({
		salt: "1000",
		maker: "0xmaker",
		signer: "0xsigner",
		taker: "0xtaker",
		tokenId: "123",
		makerAmount: "50",
		takerAmount: "100",
		side: Side.BUY,
		expiration: "0",
		nonce: "0",
		feeRateBps: "0",
		signatureType: 0,
		signature: "0xsig",
	}) as unknown as SignedOrderV1;

const makeOrderResponse = (overrides: Partial<OrderResponse> = {}): OrderResponse => ({
	success: true,
	errorMsg: "",
	orderID: "0xorder",
	status: "matched",
	takingAmount: "100",
	makingAmount: "50",
	...overrides,
});

const makeTrade = (overrides: Partial<Trade> = {}): Trade => ({
	id: "trade-1",
	taker_order_id: "0xorder",
	market: "0xmarket",
	asset_id: "123",
	side: Side.BUY,
	size: "100",
	fee_rate_bps: "0",
	price: "0.5",
	status: "MATCHED",
	match_time: "1752500000",
	last_update: "1752500000",
	outcome: "YES",
	bucket_index: 0,
	owner: "owner",
	maker_address: "0xmaker",
	maker_orders: [],
	trader_side: "TAKER",
	...overrides,
});

// reaches into the private http layer so tests exercise the real postOrder flow
const mockRawPostResponse = (client: ClobClient, response: unknown) =>
	vi.spyOn(client as any, "post").mockResolvedValue(response);

/**
 * Advances fake timers in small steps until the promise settles, so the
 * polling loop always gets its pending sleep timers fired regardless of how
 * many microtask ticks it needs between polls.
 */
const settleWithFakeTimers = async <T>(promise: Promise<T>): Promise<T> => {
	let settled = false;
	const tracked = promise.finally(() => {
		settled = true;
	});
	while (!settled) {
		await vi.advanceTimersByTimeAsync(250);
	}
	return tracked;
};

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("postOrder transaction hash resolution", () => {
	it("returns sync responses as-is without polling (hashes present)", async () => {
		const client = makeClient();
		mockRawPostResponse(
			client,
			makeOrderResponse({ transactionsHashes: ["0xaaa"], tradeIDs: ["trade-1"] }),
		);
		const getTrades = vi.spyOn(client, "getTrades");

		const res = await client.postOrder(makeSignedOrder(), OrderType.FOK);

		expect(res.transactionsHashes).toEqual(["0xaaa"]);
		expect(getTrades).not.toHaveBeenCalled();
	});

	it("resolves hashes by polling trades when the server responds with tradeIDs only (FOK)", async () => {
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse({ tradeIDs: ["trade-1"] }));
		const pendingTrade = makeTrade();
		const executedTrade = makeTrade({ status: "MINED", transaction_hash: "0xccc" });
		const getTrades = vi
			.spyOn(client, "getTrades")
			.mockResolvedValueOnce([pendingTrade])
			.mockResolvedValueOnce([executedTrade]);

		const res = await client.postOrder(makeSignedOrder(), OrderType.FOK);

		expect(res.transactionsHashes).toEqual(["0xccc"]);
		expect(res.tradeIDs).toEqual(["trade-1"]);
		expect(getTrades).toHaveBeenCalledTimes(2);
		expect(getTrades).toHaveBeenCalledWith({ id: "trade-1" }, true);
	});

	it("resolves hashes for FAK orders", async () => {
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse({ tradeIDs: ["trade-1"] }));
		vi.spyOn(client, "getTrades").mockResolvedValue([
			makeTrade({ status: "CONFIRMED", transaction_hash: "0xddd" }),
		]);

		const res = await client.postOrder(makeSignedOrder(), OrderType.FAK);

		expect(res.transactionsHashes).toEqual(["0xddd"]);
	});

	it("resolves hashes for limit orders that matched on placement", async () => {
		const client = makeClient();
		// partial fill: matched portion produced a trade, remainder rests on the book
		mockRawPostResponse(client, makeOrderResponse({ tradeIDs: ["trade-1"] }));
		vi.spyOn(client, "getTrades").mockResolvedValue([
			makeTrade({ status: "MINED", transaction_hash: "0xeee" }),
		]);

		const res = await client.postOrder(makeSignedOrder(), OrderType.GTC);

		expect(res.transactionsHashes).toEqual(["0xeee"]);
	});

	it("does not poll for limit orders that rest on the book (no tradeIDs)", async () => {
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse({ status: "live" }));
		const getTrades = vi.spyOn(client, "getTrades");

		const res = await client.postOrder(makeSignedOrder(), OrderType.GTC);

		expect(res.transactionsHashes).toBeUndefined();
		expect(getTrades).not.toHaveBeenCalled();
	});

	it("does not poll for deferExec orders", async () => {
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse({ tradeIDs: ["trade-1"] }));
		const getTrades = vi.spyOn(client, "getTrades");

		const res = await client.postOrder(makeSignedOrder(), OrderType.FOK, false, true);

		expect(res.transactionsHashes).toBeUndefined();
		expect(getTrades).not.toHaveBeenCalled();
	});

	it("does not poll for unmatched orders (no tradeIDs)", async () => {
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse());
		const getTrades = vi.spyOn(client, "getTrades");

		const res = await client.postOrder(makeSignedOrder(), OrderType.FOK);

		expect(res.transactionsHashes).toBeUndefined();
		expect(getTrades).not.toHaveBeenCalled();
	});

	it("excludes failed trades from the resolved hashes", async () => {
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse({ tradeIDs: ["trade-1", "trade-2"] }));
		vi.spyOn(client, "getTrades").mockImplementation(async params =>
			params?.id === "trade-1"
				? [makeTrade({ id: "trade-1", status: "FAILED" })]
				: [makeTrade({ id: "trade-2", status: "MINED", transaction_hash: "0x222" })],
		);

		const res = await client.postOrder(makeSignedOrder(), OrderType.FOK);

		expect(res.transactionsHashes).toEqual(["0x222"]);
	});

	it("returns the response without hashes when every trade failed", async () => {
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse({ tradeIDs: ["trade-1"] }));
		vi.spyOn(client, "getTrades").mockResolvedValue([makeTrade({ status: "FAILED" })]);

		const res = await client.postOrder(makeSignedOrder(), OrderType.FOK);

		expect(res.transactionsHashes).toBeUndefined();
		expect(res.tradeIDs).toEqual(["trade-1"]);
	});

	it("is best-effort: returns the response unchanged instead of throwing on timeout", async () => {
		vi.useFakeTimers();
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse({ tradeIDs: ["trade-1"] }));
		// trade never resolves
		vi.spyOn(client, "getTrades").mockResolvedValue([makeTrade()]);

		const res = await settleWithFakeTimers(client.postOrder(makeSignedOrder(), OrderType.FOK));

		expect(res.transactionsHashes).toBeUndefined();
		expect(res.tradeIDs).toEqual(["trade-1"]);
		expect(res.status).toBe("matched");
	});

	it("returns partially resolved hashes when only some trades resolve in time", async () => {
		vi.useFakeTimers();
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse({ tradeIDs: ["trade-1", "trade-2"] }));
		vi.spyOn(client, "getTrades").mockImplementation(
			async params =>
				params?.id === "trade-1"
					? [makeTrade({ id: "trade-1", status: "MINED", transaction_hash: "0x111" })]
					: [makeTrade({ id: "trade-2" })], // never resolves
		);

		const res = await settleWithFakeTimers(client.postOrder(makeSignedOrder(), OrderType.FOK));

		expect(res.transactionsHashes).toEqual(["0x111"]);
	});

	it("retries after transient trade polling failures", async () => {
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse({ tradeIDs: ["trade-1"] }));
		const getTrades = vi
			.spyOn(client, "getTrades")
			.mockRejectedValueOnce(new Error("trades api unavailable"))
			.mockResolvedValueOnce([makeTrade({ status: "MINED", transaction_hash: "0xfff" })]);

		const res = await client.postOrder(makeSignedOrder(), OrderType.FOK);

		expect(res.transactionsHashes).toEqual(["0xfff"]);
		expect(getTrades).toHaveBeenCalledTimes(2);
	});

	it("never rejects a successful post when trade polling keeps failing", async () => {
		vi.useFakeTimers();
		const client = makeClient();
		mockRawPostResponse(client, makeOrderResponse({ tradeIDs: ["trade-1"] }));
		vi.spyOn(client, "getTrades").mockRejectedValue(new Error("trades api unavailable"));

		const res = await settleWithFakeTimers(client.postOrder(makeSignedOrder(), OrderType.FOK));

		expect(res.transactionsHashes).toBeUndefined();
		expect(res.tradeIDs).toEqual(["trade-1"]);
		expect(res.status).toBe("matched");
	});
});

describe("postOrders transaction hash resolution", () => {
	it("resolves hashes for matched entries and skips unmatched ones", async () => {
		const client = makeClient();
		mockRawPostResponse(client, [
			makeOrderResponse({ orderID: "0xorder-1", tradeIDs: ["trade-1"] }),
			makeOrderResponse({ orderID: "0xorder-2", status: "live" }),
		]);
		const getTrades = vi
			.spyOn(client, "getTrades")
			.mockResolvedValue([makeTrade({ status: "MINED", transaction_hash: "0x111" })]);

		const res = await client.postOrders([
			{ order: makeSignedOrder(), orderType: OrderType.FOK },
			{ order: makeSignedOrder(), orderType: OrderType.GTC },
		]);

		expect(res[0]?.transactionsHashes).toEqual(["0x111"]);
		expect(res[1]?.transactionsHashes).toBeUndefined();
		expect(getTrades).toHaveBeenCalledTimes(1);
		expect(getTrades).toHaveBeenCalledWith({ id: "trade-1" }, true);
	});

	it("does not poll when posting with deferExec", async () => {
		const client = makeClient();
		mockRawPostResponse(client, [makeOrderResponse({ tradeIDs: ["trade-1"] })]);
		const getTrades = vi.spyOn(client, "getTrades");

		const res = await client.postOrders(
			[{ order: makeSignedOrder(), orderType: OrderType.FOK }],
			false,
			true,
		);

		expect(res[0]?.transactionsHashes).toBeUndefined();
		expect(getTrades).not.toHaveBeenCalled();
	});
});
