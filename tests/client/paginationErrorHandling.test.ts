import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/headers/index.js", () => ({
	createL1Headers: vi.fn(),
	createL2Headers: vi.fn(async () => ({})),
}));

import { Chain, ClobClient } from "../../src";

const makeClient = () =>
	new ClobClient({
		host: "http://localhost:8080",
		chain: Chain.AMOY,
		signer: {} as any,
		creds: {
			key: "key",
			secret: "secret",
			passphrase: "passphrase",
		},
	});

describe("pagination error handling", () => {
	it("preserves structured errors for getOpenOrders", async () => {
		const client = makeClient();
		vi.spyOn(client as any, "get").mockResolvedValue({ error: "boom", status: 500 });

		await expect(client.getOpenOrders()).resolves.toMatchObject({
			error: "boom",
			status: 500,
		});
	});

	it("preserves structured errors for getCurrentRewards", async () => {
		const client = makeClient();
		vi.spyOn(client as any, "get").mockResolvedValue({ error: "boom", status: 503 });

		await expect(client.getCurrentRewards()).resolves.toMatchObject({
			error: "boom",
			status: 503,
		});
	});
});
