import { Wallet } from "@ethersproject/wallet";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClobClient } from "../../src/client.js";
import { END_CURSOR } from "../../src/constants.js";
import { ApiError } from "../../src/errors.js";
import { Chain } from "../../src/types/index.js";

const makeClient = (overrides: Record<string, unknown> = {}) =>
	new ClobClient({
		host: "http://localhost:8080",
		chain: Chain.AMOY,
		signer: new Wallet("0x0000000000000000000000000000000000000000000000000000000000000001"),
		creds: { key: "key", secret: "c2VjcmV0LXNlY3JldC1zZWNyZXQ=", passphrase: "passphrase" },
		...overrides,
	});

// reaches into the private http layer so tests exercise the real pagination loop
const mockRawGet = (
	client: ClobClient,
	impl: (endpoint: string, options: any) => unknown | Promise<unknown>,
) => vi.spyOn(client as any, "get").mockImplementation(impl as any);

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("pagination auth headers", () => {
	it("rebuilds L2 headers for every page so the HMAC timestamp never goes stale", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-05T00:00:00.000Z"));

		const client = makeClient();
		const capturedHeaders: any[] = [];
		let page = 0;
		mockRawGet(client, (_endpoint, options) => {
			capturedHeaders.push(options.headers);
			const current = page++;
			// simulate time passing between page fetches (a long pagination run)
			vi.setSystemTime(new Date(`2026-08-05T00:0${current + 1}:00.000Z`));
			return current === 0
				? { data: [{ id: `t${current}` }], next_cursor: "next" }
				: { data: [{ id: `t${current}` }], next_cursor: END_CURSOR };
		});

		const trades = await client.getTrades();

		expect(trades).toHaveLength(2);
		expect(capturedHeaders).toHaveLength(2);
		// distinct timestamps prove the headers were regenerated per page
		expect(capturedHeaders[0].POLY_TIMESTAMP).not.toEqual(capturedHeaders[1].POLY_TIMESTAMP);
		// and a fresh timestamp means a fresh HMAC signature
		expect(capturedHeaders[0].POLY_SIGNATURE).not.toEqual(capturedHeaders[1].POLY_SIGNATURE);
	});
});

describe("pagination error handling", () => {
	it("surfaces the real API error mid-pagination instead of a misleading TypeError", async () => {
		const client = makeClient();
		let page = 0;
		mockRawGet(client, () => {
			const current = page++;
			// first page succeeds, second page returns the { error, status } shape
			return current === 0
				? { data: [{ id: "t0" }], next_cursor: "next" }
				: { error: "unauthorized", status: 401 };
		});

		const err = await client.getTrades().catch((e: unknown) => e);

		expect(err).toBeInstanceOf(ApiError);
		expect((err as ApiError).message).toBe("unauthorized");
		expect((err as ApiError).status).toBe(401);
		// the failure is the actual API error, not "undefined is not iterable"
		expect((err as Error).message).not.toContain("is not iterable");
	});

	it("stringifies non-string API errors surfaced during pagination", async () => {
		const client = makeClient();
		mockRawGet(client, () => ({ error: { code: "RATE_LIMIT" }, status: 429 }));

		const err = await client.getOpenOrders().catch((e: unknown) => e);

		expect(err).toBeInstanceOf(ApiError);
		expect((err as ApiError).status).toBe(429);
		expect((err as ApiError).message).toContain("RATE_LIMIT");
	});

	it("throws a descriptive ApiError when a page lacks a data array", async () => {
		const client = makeClient();
		mockRawGet(client, () => ({ next_cursor: END_CURSOR }));

		const err = await client.getEarningsForUserForDay("2026-08-05").catch((e: unknown) => e);

		expect(err).toBeInstanceOf(ApiError);
		expect((err as Error).message).toContain("data array");
	});
});
