import { formatUnits, parseUnits } from "viem";
import { describe, expect, it } from "vitest";
import { getMarketOrderRawAmounts, ROUNDING_CONFIG } from "../../../src/order-builder/helpers";
import { Side, type TickSize } from "../../../src/types";
import { decimalPlaces, roundNormal } from "../../../src/utilities";

// Test a representative sample of size/price combinations instead of exhaustive loops
const TEST_SIZES = [0.01, 0.1, 1, 10, 100];
const TEST_PRICES_01 = [0.1, 0.3, 0.5, 0.7, 0.9, 1];
const TEST_PRICES_001 = [0.01, 0.1, 0.25, 0.5, 0.75, 0.99];
const TEST_PRICES_0001 = [0.001, 0.01, 0.1, 0.5, 0.999];
const TEST_PRICES_00001 = [0.0001, 0.001, 0.01, 0.1, 0.5, 0.9999];

const SCALE = 1_000_000n;
const MIN_MARKET_BUY_AMOUNT = 990_000n;
const TICK_SIZES = Object.keys(ROUNDING_CONFIG) as TickSize[];

const toAtoms = (value: number): bigint => parseUnits(value.toString(), 6);

const amountUnit = (tickSize: TickSize): bigint =>
	10n ** BigInt(6 - ROUNDING_CONFIG[tickSize].amount);

// Truncates a decimal budget to the amount precision of the tick, in base units.
const budgetAtoms = (value: number, tickSize: TickSize): bigint => {
	const [whole, fraction = ""] = value.toString().split(".");
	const atoms = BigInt(whole + fraction.padEnd(6, "0").slice(0, 6));
	return atoms - (atoms % amountUnit(tickSize));
};

const marketBuy = (amount: number, price: number, tickSize: TickSize) => {
	const { side, rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
		Side.BUY,
		amount,
		price,
		ROUNDING_CONFIG[tickSize],
	);
	expect(side).toBe(Side.BUY);
	return { maker: toAtoms(rawMakerAmt), taker: toAtoms(rawTakerAmt) };
};

// Largest collateral within the budget that buys a whole number of share units
// at exactly the price, with collateral in whole units too. Walks the share
// count down one unit at a time from the most the budget could buy.
const exactBuyBySearch = (
	budget: bigint,
	price: bigint,
	tickSize: TickSize,
): { maker: bigint; taker: bigint } => {
	const unit = amountUnit(tickSize);
	for (let shares = ((budget * SCALE) / price / unit) * unit; shares > 0n; shares -= unit) {
		const scaled = shares * price;
		const collateral = scaled / SCALE;
		if (scaled % SCALE === 0n && collateral % unit === 0n && collateral <= budget) {
			return { maker: collateral, taker: shares };
		}
	}
	return { maker: 0n, taker: 0n };
};

const expectExactMarketBuy = (
	amounts: { maker: bigint; taker: bigint },
	budget: bigint,
	price: bigint,
	tickSize: TickSize,
) => {
	const unit = amountUnit(tickSize);
	expect(amounts.maker * SCALE).toBe(amounts.taker * price);
	expect(amounts.maker).toBeLessThanOrEqual(budget);
	expect(amounts.maker).toBeGreaterThanOrEqual(MIN_MARKET_BUY_AMOUNT);
	expect(amounts.maker % unit).toBe(0n);
	expect(amounts.taker % unit).toBe(0n);
};

describe("getMarketOrderRawAmounts", () => {
	describe("market buy", () => {
		it("signs $9.9996 for 15.384 shares when $10 buys at 0.65", () => {
			// 0.0013 USDC buys exactly 0.002 shares at 0.65; $10 holds 7692 such steps.
			expect(marketBuy(10, 0.65, "0.01")).toEqual({ maker: 9_999_600n, taker: 15_384_000n });
		});

		it("returns raw amounts that convert to the exact base units", () => {
			const { rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
				Side.BUY,
				10,
				0.65,
				ROUNDING_CONFIG["0.01"],
			);
			expect(rawMakerAmt).toBe(9.9996);
			expect(rawTakerAmt).toBe(15.384);
		});

		it.each([
			{ price: 0.7, tickSize: "0.1", maker: 994_000n },
			{ price: 0.65, tickSize: "0.01", maker: 999_700n },
			{ price: 0.07, tickSize: "0.01", maker: 999_600n },
			{ price: 0.335, tickSize: "0.005", maker: 999_640n },
			{ price: 0.4325, tickSize: "0.0025", maker: 999_940n },
			{ price: 0.962, tickSize: "0.001", maker: 995_670n },
			{ price: 0.9999, tickSize: "0.0001", maker: 999_900n },
		] as const)("keeps a $1 BUY at $price on tick $tickSize above the minimum", ({
			price,
			tickSize,
			maker,
		}) => {
			const amounts = marketBuy(1, price, tickSize);
			expect(amounts.maker).toBe(maker);
			expectExactMarketBuy(amounts, SCALE, toAtoms(price), tickSize);
		});

		it.each(TICK_SIZES)("accepts a $1 BUY at every price on tick %s", tickSize => {
			const tick = toAtoms(Number(tickSize));
			for (let price = tick; price < SCALE; price += tick) {
				const amounts = marketBuy(1, Number(formatUnits(price, 6)), tickSize);
				expectExactMarketBuy(amounts, SCALE, price, tickSize);
			}
		});

		it("accepts a BUY of exactly the minimum", () => {
			expect(marketBuy(0.99, 0.5, "0.01")).toEqual({ maker: 990_000n, taker: 1_980_000n });
		});

		it("rejects a BUY just below the minimum", () => {
			expect(() => marketBuy(0.9899, 0.5, "0.01")).toThrow(
				"BUY amount 0.9899 cannot be spent exactly at price 0.5. At this price the amount is used in steps of 0.0001; use at least 0.99.",
			);
		});

		it("rejects a $0.99 BUY at 0.65 whose steps fall below the minimum", () => {
			// 761 steps of 0.0013 make 0.9893.
			expect(() => marketBuy(0.99, 0.65, "0.01")).toThrow(
				"BUY amount 0.99 cannot be spent exactly at price 0.65. At this price the amount is used in steps of 0.0013; use at least 0.9906.",
			);
		});

		it.each([0.001, 0.01, 0.5])("rejects a BUY of %s, below the minimum", amount => {
			expect(() => marketBuy(amount, 0.65, "0.01")).toThrow(
				"steps of 0.0013; use at least 0.9906.",
			);
		});

		it("rounds the BUY amount down to the amount precision first", () => {
			// 12.34999 rounds down to 12.3499, then steps down to 12.3469 for 33.37 shares.
			expect(marketBuy(12.34999, 0.37, "0.01")).toEqual({
				maker: 12_346_900n,
				taker: 33_370_000n,
			});
		});

		it.each(TICK_SIZES)("spends the most an exact price allows on tick %s", tickSize => {
			const tick = toAtoms(Number(tickSize));
			const ticks = SCALE / tick;
			const stride = ticks / 97n > 0n ? ticks / 97n : 1n;
			const budgets = [
				0.5, 0.98, 0.99, 0.9999, 1, 1.01, 3.33, 10, 25.5, 48.12345678, 99.99, 250, 1000,
				123456.789,
			];
			for (let index = 1n; index < ticks; index += stride) {
				const price = index * tick;
				for (const budget of budgets) {
					const scaledBudget = budgetAtoms(budget, tickSize);
					const expected = exactBuyBySearch(scaledBudget, price, tickSize);
					const compute = () =>
						marketBuy(budget, Number(formatUnits(price, 6)), tickSize);

					if (expected.maker < MIN_MARKET_BUY_AMOUNT) {
						expect(compute).toThrow("cannot be spent exactly");
						continue;
					}
					const amounts = compute();
					expect(amounts).toEqual(expected);
					expectExactMarketBuy(amounts, scaledBudget, price, tickSize);
				}
			}
		});

		it("keeps the sampled sizes and prices exact or rejected", () => {
			const cases = [
				["0.1", TEST_PRICES_01],
				["0.01", TEST_PRICES_001],
				["0.001", TEST_PRICES_0001],
				["0.0001", TEST_PRICES_00001],
			] as const;
			for (const [tickSize, prices] of cases) {
				for (const size of TEST_SIZES) {
					for (const price of prices) {
						if (size < 0.99) {
							expect(() => marketBuy(size, price, tickSize)).toThrow(
								"cannot be spent exactly",
							);
							continue;
						}
						const amounts = marketBuy(size, price, tickSize);
						expectExactMarketBuy(amounts, toAtoms(size), toAtoms(price), tickSize);
					}
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
