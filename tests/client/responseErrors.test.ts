import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Wallet } from "@ethersproject/wallet";
import { afterEach, describe, expect, it } from "vitest";
import { ClobClient } from "../../src/client.js";
import { END_CURSOR, INITIAL_CURSOR } from "../../src/constants.js";
import {
	GET_BUILDER_FEES,
	GET_EARNINGS_FOR_USER_FOR_DAY,
	GET_FEE_RATE,
	GET_NEG_RISK,
	GET_OPEN_ORDERS,
	GET_PRE_MIGRATION_ORDERS,
	GET_REWARDS_EARNINGS_PERCENTAGES,
	GET_REWARDS_MARKETS,
	GET_REWARDS_MARKETS_CURRENT,
	GET_TICK_SIZE,
	GET_TRADES,
} from "../../src/endpoints.js";
import { ApiError } from "../../src/errors.js";
import { Chain } from "../../src/types/index.js";

// These tests run the client against a real HTTP server, so a failed request takes the
// same axios and error-mapping path it takes against the CLOB.

type Reply = { status: number; body: unknown };
type Request = { path: string; query: Record<string, string> };

const internalError: Reply = { status: 500, body: { error: "Internal server error" } };
const page = (data: unknown[], next_cursor = END_CURSOR): Reply => ({
	status: 200,
	body: { data, next_cursor, limit: 300, count: data.length },
});

let server: Server | undefined;

afterEach(async () => {
	server?.closeAllConnections();
	await new Promise(resolve => server?.close(resolve));
	server = undefined;
});

// Serves `replies` in order, one per request, answering 500 once they run out.
const serve = async (replies: Reply[]) => {
	const requests: Request[] = [];
	server = createServer((req: IncomingMessage, res) => {
		const url = new URL(req.url ?? "/", "http://localhost");
		requests.push({ path: url.pathname, query: Object.fromEntries(url.searchParams) });
		const reply = replies.shift() ?? { status: 500, body: { error: "no reply queued" } };
		res.writeHead(reply.status, { "Content-Type": "application/json" });
		res.end(JSON.stringify(reply.body));
	});
	await new Promise<void>(resolve => server?.listen(0, "127.0.0.1", resolve));
	const { port } = server.address() as AddressInfo;
	return { host: `http://127.0.0.1:${port}`, requests };
};

const makeClient = (host: string, throwOnError = false) =>
	new ClobClient({
		host,
		chain: Chain.AMOY,
		signer: new Wallet("0x0000000000000000000000000000000000000000000000000000000000000001"),
		creds: { key: "key", secret: "c2VjcmV0LXNlY3JldC1zZWNyZXQ=", passphrase: "passphrase" },
		throwOnError,
	});

const rejection = async (promise: Promise<unknown>): Promise<unknown> => {
	try {
		await promise;
	} catch (err) {
		return err;
	}
	throw new Error("expected the call to reject");
};

const listMethods: [string, string, (client: ClobClient) => Promise<unknown[]>][] = [
	["getTrades", GET_TRADES, client => client.getTrades()],
	["getOpenOrders", GET_OPEN_ORDERS, client => client.getOpenOrders()],
	["getPreMigrationOrders", GET_PRE_MIGRATION_ORDERS, client => client.getPreMigrationOrders()],
	[
		"getEarningsForUserForDay",
		GET_EARNINGS_FOR_USER_FOR_DAY,
		client => client.getEarningsForUserForDay("2026-11-12"),
	],
	[
		"getUserEarningsAndMarketsConfig",
		GET_REWARDS_EARNINGS_PERCENTAGES,
		client => client.getUserEarningsAndMarketsConfig("2026-11-12"),
	],
	["getCurrentRewards", GET_REWARDS_MARKETS_CURRENT, client => client.getCurrentRewards()],
	[
		"getRawRewardsForMarket",
		`${GET_REWARDS_MARKETS}0xcondition`,
		client => client.getRawRewardsForMarket("0xcondition"),
	],
];

describe.each(listMethods)("%s", (_name, path, list) => {
	it("collects every page, following next_cursor", async () => {
		const { host, requests } = await serve([page([1, 2], "MTAw"), page([3])]);

		await expect(list(makeClient(host))).resolves.toEqual([1, 2, 3]);
		expect(requests.map(request => [request.path, request.query.next_cursor])).toEqual([
			[path, INITIAL_CURSOR],
			[path, "MTAw"],
		]);
	});

	it.each([
		false,
		true,
	])("rejects with the server's ApiError when a page fails (throwOnError: %s)", async throwOnError => {
		const { host } = await serve([internalError]);

		const err = await rejection(list(makeClient(host, throwOnError)));

		expect(err).toBeInstanceOf(ApiError);
		expect(err).toMatchObject({
			message: "Internal server error",
			status: 500,
			data: { error: "Internal server error", status: 500 },
		});
	});

	it("rejects instead of returning a partial list when a later page fails", async () => {
		const { host, requests } = await serve([page([1, 2], "MTAw"), internalError]);

		const err = await rejection(list(makeClient(host)));

		expect(err).toBeInstanceOf(ApiError);
		expect((err as ApiError).status).toBe(500);
		expect(requests).toHaveLength(2);
	});

	it("rejects with an ApiError naming the endpoint when a page has no data array", async () => {
		const { host } = await serve([{ status: 200, body: { trades: [] } }]);

		const err = await rejection(list(makeClient(host)));

		expect(err).toBeInstanceOf(ApiError);
		expect((err as ApiError).message).toBe(
			`unexpected response from ${path}: expected a page with a data array`,
		);
		expect((err as ApiError).status).toBeUndefined();
		expect((err as ApiError).data).toEqual({ trades: [] });
	});

	it("stops after a page that has no next_cursor", async () => {
		const { host, requests } = await serve([
			{ status: 200, body: { data: [1], limit: 300, count: 1 } },
			page([2]),
		]);

		await expect(list(makeClient(host))).resolves.toEqual([1]);
		expect(requests).toHaveLength(1);
	});
});

describe("cursor arguments of the list methods", () => {
	it("passes the filters along with the cursor on every page", async () => {
		const { host, requests } = await serve([page([1], "MTAw"), page([2])]);

		await makeClient(host).getTrades({ market: "0xmarket", maker_address: "0xmaker" });

		expect(requests.map(request => request.query)).toEqual([
			{ market: "0xmarket", maker_address: "0xmaker", next_cursor: INITIAL_CURSOR },
			{ market: "0xmarket", maker_address: "0xmaker", next_cursor: "MTAw" },
		]);
	});

	it("fetches only the first page when asked to", async () => {
		const { host, requests } = await serve([page([1], "MTAw"), page([2])]);

		await expect(makeClient(host).getOpenOrders(undefined, true)).resolves.toEqual([1]);
		expect(requests).toHaveLength(1);
	});

	it("fetches the page at the given cursor when asked for one page from a cursor", async () => {
		const { host, requests } = await serve([page([2], "MjAw"), page([3])]);

		await expect(makeClient(host).getTrades(undefined, true, "MTAw")).resolves.toEqual([2]);
		expect(requests.map(request => request.query.next_cursor)).toEqual(["MTAw"]);
	});

	it("continues from the given cursor to the last page", async () => {
		const { host, requests } = await serve([page([2], "MjAw"), page([3])]);

		await expect(makeClient(host).getTrades(undefined, false, "MTAw")).resolves.toEqual([2, 3]);
		expect(requests.map(request => request.query.next_cursor)).toEqual(["MTAw", "MjAw"]);
	});

	it("requests nothing when started at the end cursor", async () => {
		const { host, requests } = await serve([page([1])]);

		await expect(makeClient(host).getTrades(undefined, false, END_CURSOR)).resolves.toEqual([]);
		expect(requests).toHaveLength(0);
	});
});

// The client caches market metadata, so a failed lookup must reject instead of leaving a
// value that every later order would be built with.
const metadataLookups: [
	string,
	string,
	Reply,
	(client: ClobClient) => Promise<unknown>,
	unknown,
][] = [
	[
		"getTickSize",
		GET_TICK_SIZE,
		{ status: 200, body: { minimum_tick_size: 0.01 } },
		client => client.getTickSize("123"),
		"0.01",
	],
	[
		"getNegRisk",
		GET_NEG_RISK,
		{ status: 200, body: { neg_risk: true } },
		client => client.getNegRisk("123"),
		true,
	],
	[
		"getFeeRateBps",
		GET_FEE_RATE,
		{ status: 200, body: { base_fee: 30 } },
		client => client.getFeeRateBps("123"),
		30,
	],
];

describe.each(metadataLookups)("%s", (_name, path, success, lookup, value) => {
	it.each([
		false,
		true,
	])("rejects with the server's ApiError and caches nothing when the lookup fails (throwOnError: %s)", async throwOnError => {
		const { host, requests } = await serve([internalError, success]);
		const client = makeClient(host, throwOnError);

		const err = await rejection(lookup(client));

		expect(err).toBeInstanceOf(ApiError);
		expect(err).toMatchObject({ message: "Internal server error", status: 500 });
		await expect(lookup(client)).resolves.toEqual(value);
		expect(requests.map(request => request.path)).toEqual([path, path]);
	});

	it("rejects and caches nothing when the response lacks the value", async () => {
		const { host, requests } = await serve([{ status: 200, body: {} }, success]);
		const client = makeClient(host);

		const err = await rejection(lookup(client));

		expect(err).toBeInstanceOf(ApiError);
		expect((err as ApiError).message).toMatch(`unexpected response from ${path}: missing `);
		await expect(lookup(client)).resolves.toEqual(value);
		expect(requests).toHaveLength(2);
	});

	it("caches a successful lookup", async () => {
		const { host, requests } = await serve([success]);
		const client = makeClient(host);

		await expect(lookup(client)).resolves.toEqual(value);
		await expect(lookup(client)).resolves.toEqual(value);
		expect(requests).toHaveLength(1);
	});
});

describe("builder fee rates", () => {
	const builderCode = `0x${"ab".repeat(32)}`;
	const rates: Reply = {
		status: 200,
		body: { builder_maker_fee_rate_bps: 10, builder_taker_fee_rate_bps: 25 },
	};
	const cacheRates = (client: ClobClient) =>
		(client as any).ensureBuilderFeeRateCached(builderCode) as Promise<void>;

	it("rejects with the server's ApiError and caches nothing when the lookup fails", async () => {
		const { host, requests } = await serve([internalError, rates]);
		const client = makeClient(host);

		const err = await rejection(cacheRates(client));

		expect(err).toBeInstanceOf(ApiError);
		expect((err as ApiError).status).toBe(500);
		expect(client.builderFeeRates).toEqual({});
		await cacheRates(client);
		expect(client.builderFeeRates[builderCode]).toEqual({ maker: 0.001, taker: 0.0025 });
		expect(requests.map(request => request.path)).toEqual([
			`${GET_BUILDER_FEES}${builderCode}`,
			`${GET_BUILDER_FEES}${builderCode}`,
		]);
	});

	it("rejects and caches nothing when a rate is missing", async () => {
		const { host } = await serve([{ status: 200, body: { builder_maker_fee_rate_bps: 10 } }]);
		const client = makeClient(host);

		const err = await rejection(cacheRates(client));

		expect(err).toBeInstanceOf(ApiError);
		expect((err as ApiError).message).toBe(
			`unexpected response from ${GET_BUILDER_FEES}${builderCode}: missing builder_taker_fee_rate_bps`,
		);
		expect(client.builderFeeRates).toEqual({});
	});
});
