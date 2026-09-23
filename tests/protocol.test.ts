import { expect, it } from "vitest";
import { isV2PositionId } from "../src/protocol.js";

it.each([
	["0", true],
	[(1n << 39n).toString(), true],
	[(1n << 40n).toString(), false],
	[(1n << 103n).toString(), false],
	[(1n << 104n).toString(), true],
	["0x1", true],
	["", false],
	[" ", false],
	["invalid", false],
	["-1", false],
	[((1n << 256n) - 1n).toString(), false],
	[(1n << 256n).toString(), false],
] as const)("classifies token ID %j as V2: %s", (tokenID, expected) => {
	expect(isV2PositionId(tokenID)).toBe(expected);
});
