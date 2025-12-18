import { describe, expect, it } from "vitest";
import { getMarketOrderRawAmounts, ROUNDING_CONFIG } from "../../../src/order-builder/helpers";
import { Side } from "../../../src/types";
import { decimalPlaces, roundNormal } from "../../../src/utilities";

// Test a representative sample of size/price combinations instead of exhaustive loops
const TEST_SIZES = [0.01, 0.1, 1, 10, 100];
const TEST_PRICES_01 = [0.1, 0.3, 0.5, 0.7, 0.9, 1];
const TEST_PRICES_001 = [0.01, 0.1, 0.25, 0.5, 0.75, 0.99];
const TEST_PRICES_0001 = [0.001, 0.01, 0.1, 0.5, 0.999];
const TEST_PRICES_00001 = [0.0001, 0.001, 0.01, 0.1, 0.5, 0.9999];

describe("getMarketOrderRawAmounts", () => {
	describe("market buy", () => {
		it("0.1", () => {
			for (const size of TEST_SIZES) {
				for (const price of TEST_PRICES_01) {
					const { rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
						Side.BUY,
						size,
						price,
						ROUNDING_CONFIG["0.1"],
					);

					expect(decimalPlaces(rawMakerAmt)).toBeLessThanOrEqual(2);
					expect(decimalPlaces(rawTakerAmt)).toBeLessThanOrEqual(3);
					expect(roundNormal(rawMakerAmt / rawTakerAmt, 2)).toBeGreaterThanOrEqual(
						roundNormal(price, 2),
					);
				}
			}
		});

		it("0.01", () => {
			for (const size of TEST_SIZES) {
				for (const price of TEST_PRICES_001) {
					const { rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
						Side.BUY,
						size,
						price,
						ROUNDING_CONFIG["0.01"],
					);

					expect(decimalPlaces(rawMakerAmt)).toBeLessThanOrEqual(2);
					expect(decimalPlaces(rawTakerAmt)).toBeLessThanOrEqual(4);
					expect(roundNormal(rawMakerAmt / rawTakerAmt, 4)).toBeGreaterThanOrEqual(
						roundNormal(price, 4),
					);
				}
			}
		});

		it("0.001", () => {
			for (const size of TEST_SIZES.slice(0, 4)) {
				for (const price of TEST_PRICES_0001) {
					const { rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
						Side.BUY,
						size,
						price,
						ROUNDING_CONFIG["0.001"],
					);

					expect(decimalPlaces(rawMakerAmt)).toBeLessThanOrEqual(2);
					expect(decimalPlaces(rawTakerAmt)).toBeLessThanOrEqual(5);
					expect(roundNormal(rawMakerAmt / rawTakerAmt, 6)).toBeGreaterThanOrEqual(
						roundNormal(price, 6),
					);
				}
			}
		});

		it("0.0001", () => {
			for (const size of TEST_SIZES.slice(0, 3)) {
				for (const price of TEST_PRICES_00001) {
					const { rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
						Side.BUY,
						size,
						price,
						ROUNDING_CONFIG["0.0001"],
					);

					expect(decimalPlaces(rawMakerAmt)).toBeLessThanOrEqual(2);
					expect(decimalPlaces(rawTakerAmt)).toBeLessThanOrEqual(6);
					expect(roundNormal(rawMakerAmt / rawTakerAmt, 8)).toBeGreaterThanOrEqual(
						roundNormal(price, 8),
					);
				}
			}
		});
	});

	describe("market sell", () => {
		it("0.1", () => {
			for (const size of TEST_SIZES) {
				for (const price of TEST_PRICES_01) {
					const { rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
						Side.SELL,
						size,
						price,
						ROUNDING_CONFIG["0.1"],
					);

					expect(decimalPlaces(rawMakerAmt)).toBeLessThanOrEqual(2);
					expect(decimalPlaces(rawTakerAmt)).toBeLessThanOrEqual(3);
					expect(roundNormal(rawTakerAmt / rawMakerAmt, 2)).toBeLessThanOrEqual(
						roundNormal(price, 2),
					);
				}
			}
		});

		it("0.01", () => {
			for (const size of TEST_SIZES) {
				for (const price of TEST_PRICES_001) {
					const { rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
						Side.SELL,
						size,
						price,
						ROUNDING_CONFIG["0.01"],
					);

					expect(decimalPlaces(rawMakerAmt)).toBeLessThanOrEqual(2);
					expect(decimalPlaces(rawTakerAmt)).toBeLessThanOrEqual(4);
					expect(roundNormal(rawTakerAmt / rawMakerAmt, 4)).toBeLessThanOrEqual(
						roundNormal(price, 4),
					);
				}
			}
		});

		it("0.001", () => {
			for (const size of TEST_SIZES.slice(0, 4)) {
				for (const price of TEST_PRICES_0001) {
					const { rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
						Side.SELL,
						size,
						price,
						ROUNDING_CONFIG["0.001"],
					);

					expect(decimalPlaces(rawMakerAmt)).toBeLessThanOrEqual(2);
					expect(decimalPlaces(rawTakerAmt)).toBeLessThanOrEqual(5);
					expect(roundNormal(rawTakerAmt / rawMakerAmt, 6)).toBeLessThanOrEqual(
						roundNormal(price, 6),
					);
				}
			}
		});

		it("0.0001", () => {
			for (const size of TEST_SIZES.slice(0, 3)) {
				for (const price of TEST_PRICES_00001) {
					const { rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
						Side.SELL,
						size,
						price,
						ROUNDING_CONFIG["0.0001"],
					);

					expect(decimalPlaces(rawMakerAmt)).toBeLessThanOrEqual(2);
					expect(decimalPlaces(rawTakerAmt)).toBeLessThanOrEqual(6);
					expect(roundNormal(rawTakerAmt / rawMakerAmt, 8)).toBeLessThanOrEqual(
						roundNormal(price, 8),
					);
				}
			}
		});
	});
});
