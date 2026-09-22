import { describe, expect, it } from "vitest";
import { isV2PositionId } from "../src/protocol.js";

describe("protocol V2 position namespace", () => {
	it.each([
		0n,
		1n,
		1n << 39n,
		1n << 104n,
		1n << 255n,
		(1n << 256n) - (1n << 104n),
	])("accepts uint256 %s with zero reserved bits without asserting asset existence", value => {
		expect(isV2PositionId(value.toString())).toBe(true);
		expect(isV2PositionId(`0x${value.toString(16)}`)).toBe(true);
	});
	it("rejects every reserved bit, including both boundaries", () => {
		for (let bit = 40n; bit <= 103n; bit++) {
			expect(isV2PositionId(((1n << 248n) | (1n << bit)).toString())).toBe(false);
		}
	});
	it.each([
		"",
		" ",
		"not-a-token",
		"1.5",
		"1e3",
		"0x",
		"-1",
		(1n << 256n).toString(),
		((1n << 256n) - 1n).toString(),
	])("does not route invalid or legacy identifier %j to V3", tokenID =>
		expect(isV2PositionId(tokenID)).toBe(false));
	it("matches the reference classifier's whitespace handling", () => {
		expect(isV2PositionId(" 1 ")).toBe(true);
	});
});
