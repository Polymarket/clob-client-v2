import { describe, expect, it } from "vitest";
import {
	resolveOrderAssetID,
	resolveOrderRouting,
} from "../../../src/order-builder/helpers/orderAsset";
import type { OrderAsset } from "../../../src/types/index.js";

describe("order asset validation", () => {
	it.each([
		{},
		{ tokenID: "123", positionID: "456" },
		{ tokenID: "123", positionID: null },
		{ tokenID: null, positionID: "456" },
		{ tokenID: null },
		{ positionID: null },
		{ tokenID: "" },
		{ positionID: " " },
		{ tokenID: 123 },
		{ positionID: 456 },
		{ tokenID: false },
		{ positionID: {} },
	])("rejects invalid identifiers: %j", asset => {
		for (const resolve of [resolveOrderAssetID, resolveOrderRouting]) {
			expect(() => resolve(asset as unknown as OrderAsset)).toThrow(
				"Exactly one of tokenID or positionID must be provided as a non-empty string",
			);
		}
	});

	it.each([
		{ tokenID: "123", positionID: undefined },
		{ positionID: "123", tokenID: undefined },
	])("accepts an undefined unused identifier: %j", asset => {
		expect(resolveOrderAssetID(asset)).toBe("123");
	});
});

describe("resolveOrderRouting", () => {
	it("routes position IDs through Exchange V3", () => {
		expect(resolveOrderRouting({ positionID: "456" }, 2)).toEqual({
			assetID: "456",
			exchangeVersion: 3,
		});
	});

	it("preserves token order version selection", () => {
		expect(resolveOrderRouting({ tokenID: "123" }, 2)).toEqual({
			assetID: "123",
			exchangeVersion: 2,
		});
	});
});
