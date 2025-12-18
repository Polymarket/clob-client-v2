import { describe, expect, it } from "vitest";
import { buildHmacSignature } from "../../src/builder-signing";

describe("hmac", () => {
	it("buildHmacSignature", () => {
		const signature = buildHmacSignature(
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
