import { describe, expect, it } from "vitest";
import type { DropNotificationParams, OrdersScoringParams } from "../../src";
import {
	parseDropNotificationParams,
	parseOrdersScoringParams,
} from "../../src/http-helpers/index";

describe("utilities", () => {
	describe("parseOrdersScoringParams", () => {
		it("checking params", () => {
			const params = parseOrdersScoringParams({
				orderIds: ["0x0", "0x1", "0x2"],
			} as OrdersScoringParams);
			expect(params).not.toBeNull();
			expect(params).toBeDefined();
			expect(params).not.toEqual({});
			expect(params).toEqual({ order_ids: "0x0,0x1,0x2" });
		});
	});
	describe("parseDropNotificationParams", () => {
		it("checking params", () => {
			const params = parseDropNotificationParams({
				ids: ["0", "1", "2"],
			} as DropNotificationParams);
			expect(params).not.toBeNull();
			expect(params).toBeDefined();
			expect(params).not.toEqual({});
			expect(params).toEqual({ ids: "0,1,2" });
		});
	});
});
