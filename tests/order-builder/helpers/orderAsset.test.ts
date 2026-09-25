import { describe, expect, it } from "vitest";
import { resolveOrderRouting } from "../../../src/order-builder/helpers/orderAsset";

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
