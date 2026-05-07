import { describe, expect, it } from "vitest";
import { buildPolyHmacSignature } from "../../src/signing/hmac";

describe("hmac", () => {
	it("buildPolyHmacSignature", async () => {
		const signature = await buildPolyHmacSignature(
			"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
			1000000,
			"test-sign",
			"/orders",
			'{"hash": "0x123"}',
		);
		expect(signature).not.toBeNull();
		expect(signature).toBeDefined();
		expect(signature).not.toBe("");
		expect(signature).toBe("ZwAdJKvoYRlEKDkNMwd5BuwNNtg93kNaR_oU2HrfVvc=");
	});
});
