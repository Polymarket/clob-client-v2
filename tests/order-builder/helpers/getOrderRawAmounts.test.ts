import { describe, it, expect } from "vitest";

import { Side } from "../../../src/types";
import { getOrderRawAmounts, ROUNDING_CONFIG } from "../../../src/order-builder/helpers";
import { decimalPlaces, roundNormal } from "../../../src/utilities";

// Test a representative sample of size/price combinations instead of exhaustive loops
const TEST_SIZES = [0.01, 0.1, 1, 10, 100];
const TEST_PRICES_01 = [0.1, 0.3, 0.5, 0.7, 0.9, 1];
const TEST_PRICES_001 = [0.01, 0.1, 0.25, 0.5, 0.75, 0.99];
const TEST_PRICES_0001 = [0.001, 0.01, 0.1, 0.5, 0.999];
const TEST_PRICES_00001 = [0.0001, 0.001, 0.01, 0.1, 0.5, 0.9999];

describe("getOrderRawAmounts", () => {
	describe("buy", () => {
		it("0.1", () => {
			for (const size of TEST_SIZES) {
				for (const price of TEST_PRICES_01) {
					const { rawMakerAmt, rawTakerAmt } = getOrderRawAmounts(
						Side.BUY,
						size,
						price,
						ROUNDING_CONFIG["0.1"],
					);

					expect(decimalPlaces(rawMakerAmt)).to.lte(3);
					expect(decimalPlaces(rawTakerAmt)).to.lte(2);
					expect(roundNormal(rawMakerAmt / rawTakerAmt, 2)).to.gte(roundNormal(price, 2));
				}
			}
		});

		it("0.01", () => {
			for (const size of TEST_SIZES) {
				for (const price of TEST_PRICES_001) {
					const { rawMakerAmt, rawTakerAmt } = getOrderRawAmounts(
						Side.BUY,
						size,
						price,
						ROUNDING_CONFIG["0.01"],
					);

					expect(decimalPlaces(rawMakerAmt)).to.lte(4);
					expect(decimalPlaces(rawTakerAmt)).to.lte(2);
					expect(roundNormal(rawMakerAmt / rawTakerAmt, 4)).to.gte(roundNormal(price, 4));
				}
			}
		});

		it("0.001", () => {
			for (const size of TEST_SIZES.slice(0, 4)) {
				for (const price of TEST_PRICES_0001) {
					const { rawMakerAmt, rawTakerAmt } = getOrderRawAmounts(
						Side.BUY,
						size,
						price,
						ROUNDING_CONFIG["0.001"],
					);

					expect(decimalPlaces(rawMakerAmt)).to.lte(5);
					expect(decimalPlaces(rawTakerAmt)).to.lte(2);
					expect(roundNormal(rawMakerAmt / rawTakerAmt, 6)).to.gte(roundNormal(price, 6));
				}
			}
		});

		it("0.0001", () => {
			for (const size of TEST_SIZES.slice(0, 3)) {
				for (const price of TEST_PRICES_00001) {
					const { rawMakerAmt, rawTakerAmt } = getOrderRawAmounts(
						Side.BUY,
						size,
						price,
						ROUNDING_CONFIG["0.0001"],
					);

					expect(decimalPlaces(rawMakerAmt)).to.lte(6);
					expect(decimalPlaces(rawTakerAmt)).to.lte(2);
					expect(roundNormal(rawMakerAmt / rawTakerAmt, 8)).to.gte(roundNormal(price, 8));
				}
			}
		});
	});

	describe("sell", () => {
		it("0.1", () => {
			for (const size of TEST_SIZES) {
				for (const price of TEST_PRICES_01) {
					const { rawMakerAmt, rawTakerAmt } = getOrderRawAmounts(
						Side.SELL,
						size,
						price,
						ROUNDING_CONFIG["0.1"],
					);

					expect(decimalPlaces(rawMakerAmt)).to.lte(2);
					expect(decimalPlaces(rawTakerAmt)).to.lte(3);
					expect(roundNormal(rawTakerAmt / rawMakerAmt, 2)).to.lte(roundNormal(price, 2));
				}
			}
		});

		it("0.01", () => {
			for (const size of TEST_SIZES) {
				for (const price of TEST_PRICES_001) {
					const { rawMakerAmt, rawTakerAmt } = getOrderRawAmounts(
						Side.SELL,
						size,
						price,
						ROUNDING_CONFIG["0.01"],
					);

					expect(decimalPlaces(rawMakerAmt)).to.lte(2);
					expect(decimalPlaces(rawTakerAmt)).to.lte(4);
					expect(roundNormal(rawTakerAmt / rawMakerAmt, 4)).to.lte(roundNormal(price, 4));
				}
			}
		});

		it("0.001", () => {
			for (const size of TEST_SIZES.slice(0, 4)) {
				for (const price of TEST_PRICES_0001) {
					const { rawMakerAmt, rawTakerAmt } = getOrderRawAmounts(
						Side.SELL,
						size,
						price,
						ROUNDING_CONFIG["0.001"],
					);

					expect(decimalPlaces(rawMakerAmt)).to.lte(2);
					expect(decimalPlaces(rawTakerAmt)).to.lte(5);
					expect(roundNormal(rawTakerAmt / rawMakerAmt, 6)).to.lte(roundNormal(price, 6));
				}
			}
		});

		it("0.0001", () => {
			for (const size of TEST_SIZES.slice(0, 3)) {
				for (const price of TEST_PRICES_00001) {
					const { rawMakerAmt, rawTakerAmt } = getOrderRawAmounts(
						Side.SELL,
						size,
						price,
						ROUNDING_CONFIG["0.0001"],
					);

					expect(decimalPlaces(rawMakerAmt)).to.lte(2);
					expect(decimalPlaces(rawTakerAmt)).to.lte(6);
					expect(roundNormal(rawTakerAmt / rawMakerAmt, 8)).to.lte(roundNormal(price, 8));
				}
			}
		});
	});
});
