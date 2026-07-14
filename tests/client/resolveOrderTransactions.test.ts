import { describe, expect, it, vi } from "vitest";
import { ClobClient } from "../../src/client.js";
import type { OrderResponse, Trade } from "../../src/types/index.js";
import { Chain, Side } from "../../src/types/index.js";

const makeClient = () => new ClobClient({ host: "http://localhost:8080", chain: Chain.AMOY });

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

describe("resolveOrderTransactions", () => {
	it("returns hashes from the response without polling when present (sync server)", async () => {
		const client = makeClient();
		const getTrades = vi.spyOn(client, "getTrades");

		const result = await client.resolveOrderTransactions(
			makeOrderResponse({ transactionsHashes: ["0xaaa", "0xbbb"], tradeIDs: ["trade-1"] }),
		);

		expect(result.transactionsHashes).toEqual(["0xaaa", "0xbbb"]);
		expect(result.trades).toEqual([]);
		expect(result.failedTrades).toEqual([]);
		expect(getTrades).not.toHaveBeenCalled();
	});

	it("returns an empty result for orders that did not match", async () => {
		const client = makeClient();
		const getTrades = vi.spyOn(client, "getTrades");

		const result = await client.resolveOrderTransactions(makeOrderResponse({ status: "live" }));

		expect(result).toEqual({ transactionsHashes: [], trades: [], failedTrades: [] });
		expect(getTrades).not.toHaveBeenCalled();
	});

	it("polls trades until a transaction hash appears (async server)", async () => {
		const client = makeClient();
		const pendingTrade = makeTrade();
		const executedTrade = makeTrade({ status: "MINED", transaction_hash: "0xccc" });
		const getTrades = vi
			.spyOn(client, "getTrades")
			.mockResolvedValueOnce([pendingTrade])
			.mockResolvedValueOnce([executedTrade]);

		const result = await client.resolveOrderTransactions(
			makeOrderResponse({ tradeIDs: ["trade-1"] }),
			{ pollIntervalMs: 1, timeoutMs: 1000 },
		);

		expect(result.transactionsHashes).toEqual(["0xccc"]);
		expect(result.trades).toEqual([executedTrade]);
		expect(result.failedTrades).toEqual([]);
		expect(getTrades).toHaveBeenCalledTimes(2);
		expect(getTrades).toHaveBeenCalledWith({ id: "trade-1" }, true);
	});

	it("classifies failed trades and excludes them from the hashes", async () => {
		const client = makeClient();
		const failedTrade = makeTrade({ status: "FAILED" });
		vi.spyOn(client, "getTrades").mockResolvedValue([failedTrade]);

		const result = await client.resolveOrderTransactions(
			makeOrderResponse({ tradeIDs: ["trade-1"] }),
			{ pollIntervalMs: 1, timeoutMs: 1000 },
		);

		expect(result.transactionsHashes).toEqual([]);
		expect(result.trades).toEqual([]);
		expect(result.failedTrades).toEqual([failedTrade]);
	});

	it("resolves multiple trades across poll rounds", async () => {
		const client = makeClient();
		const first = makeTrade({ id: "trade-1", status: "CONFIRMED", transaction_hash: "0x111" });
		const second = makeTrade({ id: "trade-2", status: "MINED", transaction_hash: "0x222" });
		let trade2Lookups = 0;
		vi.spyOn(client, "getTrades").mockImplementation(async params => {
			if (params?.id === "trade-1") return [first];
			// trade-2 resolves only from the second poll round onwards
			trade2Lookups += 1;
			return trade2Lookups >= 2 ? [second] : [makeTrade({ id: "trade-2" })];
		});

		const result = await client.resolveOrderTransactions(
			makeOrderResponse({ tradeIDs: ["trade-1", "trade-2"] }),
			{ pollIntervalMs: 1, timeoutMs: 1000 },
		);

		expect(result.transactionsHashes).toEqual(["0x111", "0x222"]);
		expect(result.trades).toEqual([first, second]);
	});

	it("throws when trades do not resolve within the timeout", async () => {
		const client = makeClient();
		vi.spyOn(client, "getTrades").mockResolvedValue([makeTrade()]);

		await expect(
			client.resolveOrderTransactions(makeOrderResponse({ tradeIDs: ["trade-1"] }), {
				pollIntervalMs: 1,
				timeoutMs: 10,
			}),
		).rejects.toThrow(/timed out waiting for trades to resolve: trade-1/);
	});
});

describe("waitForTrades", () => {
	it("returns immediately for an empty trade id list", async () => {
		const client = makeClient();
		const getTrades = vi.spyOn(client, "getTrades");

		await expect(client.waitForTrades([])).resolves.toEqual([]);
		expect(getTrades).not.toHaveBeenCalled();
	});

	it("deduplicates trade ids before polling", async () => {
		const client = makeClient();
		const executed = makeTrade({ status: "MINED", transaction_hash: "0xccc" });
		const getTrades = vi.spyOn(client, "getTrades").mockResolvedValue([executed]);

		const trades = await client.waitForTrades(["trade-1", "trade-1"], {
			pollIntervalMs: 1,
			timeoutMs: 1000,
		});

		expect(trades).toEqual([executed]);
		expect(getTrades).toHaveBeenCalledTimes(1);
	});

	it("does not treat unrelated resolved trades as satisfying requested ids", async () => {
		const client = makeClient();
		const unrelated = makeTrade({
			id: "trade-other",
			status: "MINED",
			transaction_hash: "0xother",
		});
		const executed = makeTrade({
			id: "trade-2",
			status: "MINED",
			transaction_hash: "0x222",
		});
		let trade1Lookups = 0;
		vi.spyOn(client, "getTrades").mockImplementation(async params => {
			if (params?.id === "trade-1") {
				trade1Lookups += 1;
				return trade1Lookups >= 2
					? [makeTrade({ id: "trade-1", status: "MINED", transaction_hash: "0x111" })]
					: [unrelated];
			}
			return [executed];
		});

		const trades = await client.waitForTrades(["trade-1", "trade-2"], {
			pollIntervalMs: 1,
			timeoutMs: 1000,
		});

		expect(trades).toEqual([
			makeTrade({ id: "trade-1", status: "MINED", transaction_hash: "0x111" }),
			executed,
		]);
	});
});
