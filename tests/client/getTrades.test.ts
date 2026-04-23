import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock http-helpers so getTrades runs without network. We control the paged responses.
const getMock = vi.fn();
vi.mock("../../src/http-helpers/index.js", async () => {
	const actual = await vi.importActual<typeof import("../../src/http-helpers/index.js")>(
		"../../src/http-helpers/index.js",
	);
	return {
		...actual,
		get: (...args: unknown[]) => getMock(...args),
		post: vi.fn(),
		del: vi.fn(),
	};
});

// Mock header builders so we don't need a real signer.
vi.mock("../../src/headers/index.js", () => ({
	createL1Headers: vi.fn(async () => ({})),
	createL2Headers: vi.fn(async () => ({})),
}));

import { ClobClient } from "../../src/client.js";
import { END_CURSOR, INITIAL_CURSOR } from "../../src/constants.js";
import { Chain } from "../../src/types/index.js";

const makeClient = () =>
	new ClobClient({
		host: "https://clob.example",
		chain: Chain.POLYGON,
		// biome-ignore lint/suspicious/noExplicitAny: test-only stub signer
		signer: { getAddress: async () => "0xabc", _signTypedData: async () => "0xsig" } as any,
		creds: { key: "k", secret: "cw==", passphrase: "p" },
	});

const buildPagedResponses = (pages: number, perPage: number) => {
	const responses: Array<{ data: Array<{ id: number }>; next_cursor: string }> = [];
	for (let p = 0; p < pages; p++) {
		responses.push({
			data: Array.from({ length: perPage }, (_, i) => ({ id: p * perPage + i })),
			next_cursor: p === pages - 1 ? END_CURSOR : `cursor-${p + 1}`,
		});
	}
	return responses;
};

describe("ClobClient.getTrades pagination", () => {
	beforeEach(() => {
		getMock.mockReset();
	});

	it("accumulates trades across pages in order", async () => {
		const pages = buildPagedResponses(5, 4);
		getMock.mockImplementation(async () => pages.shift());

		const client = makeClient();
		const trades = await client.getTrades();

		expect(trades).toHaveLength(20);
		expect(trades.map(t => (t as unknown as { id: number }).id)).toEqual(
			Array.from({ length: 20 }, (_, i) => i),
		);
	});

	it("returns empty array when first page is terminal with no data", async () => {
		getMock.mockResolvedValueOnce({ data: [], next_cursor: END_CURSOR });
		const trades = await makeClient().getTrades();
		expect(trades).toEqual([]);
	});

	it("handles pages with undefined data without throwing", async () => {
		getMock
			.mockResolvedValueOnce({ data: undefined, next_cursor: "c1" })
			.mockResolvedValueOnce({ data: [{ id: 1 }], next_cursor: END_CURSOR });
		const trades = await makeClient().getTrades();
		expect(trades).toEqual([{ id: 1 }]);
	});

	it("respects only_first_page=true", async () => {
		getMock.mockResolvedValueOnce({
			data: [{ id: 0 }, { id: 1 }],
			next_cursor: "cursor-1",
		});
		const trades = await makeClient().getTrades(undefined, true);
		expect(trades).toHaveLength(2);
		expect(getMock).toHaveBeenCalledTimes(1);
	});

	it("uses INITIAL_CURSOR on first request", async () => {
		getMock.mockResolvedValueOnce({ data: [], next_cursor: END_CURSOR });
		await makeClient().getTrades();
		const firstCallParams = getMock.mock.calls[0][1].params;
		expect(firstCallParams.next_cursor).toBe(INITIAL_CURSOR);
	});

	it("scales linearly — 500 pages × 100 trades finishes well under a naive O(N^2) budget", async () => {
		const PAGES = 500;
		const PER_PAGE = 100;
		const pages = buildPagedResponses(PAGES, PER_PAGE);
		getMock.mockImplementation(async () => pages.shift());

		const start = performance.now();
		const trades = await makeClient().getTrades();
		const elapsedMs = performance.now() - start;

		expect(trades).toHaveLength(PAGES * PER_PAGE);
		// Naive [...a, ...b] would copy ~sum(k*P) = ~1.25B element ops here;
		// an append-based loop is under a few hundred ms even on slow CI.
		// Ceiling is deliberately loose to avoid flakes — purpose is to catch
		// a regression back to quadratic accumulation.
		expect(elapsedMs).toBeLessThan(2000);
	});
});
