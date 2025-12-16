import { describe, expect, it } from "vitest";
import { generateOrderSalt } from "../../src/order-utils/utils";

describe("generateOrderSalt", () => {
	it("gets a salt", () => {
		const salt = generateOrderSalt();
		expect(salt).not.toBeNull();
		expect(salt).toBeDefined();
		expect(salt).not.toBe("");
	});

	it("gets new salt each time", () => {
		for (let i = 0; i < 100; i++) {
			expect(generateOrderSalt()).not.toBe(generateOrderSalt());
		}

		const salts: string[] = [];

		for (let i = 0; i < 100; i++) {
			salts.push(generateOrderSalt());
		}
		salts.forEach((s1: string, i1) => {
			salts.forEach((s2: string, i2) => {
				if (i1 !== i2) {
					expect(s1).not.toBe(s2);
				}
			});
		});
	});
});
