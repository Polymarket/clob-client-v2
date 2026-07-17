import { Wallet } from "@ethersproject/wallet";
import { describe, expect, it } from "vitest";
import { adjustBuyAmountForFees, ClobClient } from "../../src/client.js";
import { Chain, Side, type UserMarketOrderV2, type UserOrderV2 } from "../../src/types/index.js";

/*
 * Platform fee helper used by the tests:
 * feeBaseShares = amountUSD / price
 * feeRateComponent = feeRate * (price * (1 - price))^feeExponent
 * platformFee = feeBaseShares * feeRateComponent
 * feeSlippage pads only the platform fee:
 * paddedPlatformFee = platformFee * (1 + feeSlippage / 100)
 */
const calculatePlatformFee = (
	amountUSD: number,
	price: number,
	feeRate: number,
	feeExponent: number,
	feeSlippage = 0,
): number => {
	const platformFeeRate = feeRate * (price * (1 - price)) ** feeExponent;
	return (amountUSD / price) * platformFeeRate * (1 + feeSlippage / 100);
};

/*
 * Builder fee helper used by the tests:
 * builderTakerFeeRate is a decimal rate, for example 100 bps is 0.01.
 * builderFee = amountUSD * builderTakerFeeRate
 */
const calculateBuilderFee = (amountUSD: number, builderTakerFeeRate: number): number => {
	return amountUSD * builderTakerFeeRate;
};

const roundTo = (value: number, decimals = 12): number => Number(value.toFixed(decimals));

describe("fee calculations", () => {
	const feeRate = 0.25;
	const feeExponent = 2;

	/*
	 * These platform fee examples keep contracts fixed at 100 and vary price.
	 * amountUSD changes with price because amountUSD = contracts * price.
	 */
	describe("platform fee (builder fee = 0)", () => {
		const feeRate = 0.25;
		const feeExponent = 2;
		const contracts = 100;

		it("price=0.5 → fee = 1.5625", () => {
			const price = 0.5;
			/*
			 * amountUSD = contracts * price = 100 * 0.5 = 50
			 * feeBaseShares = amountUSD / price = 50 / 0.5 = 100
			 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2
			 * feeRateComponent = 0.25 * (0.5 * 0.5)^2 = 0.015625
			 * platformFee = feeBaseShares * feeRateComponent = 100 * 0.015625 = 1.5625
			 */
			expect(
				roundTo(calculatePlatformFee(contracts * price, price, feeRate, feeExponent)),
			).toBe(1.5625);
		});

		it("price=0.3 → fee = 1.1025", () => {
			const price = 0.3;
			/*
			 * amountUSD = contracts * price = 100 * 0.3 = 30
			 * feeBaseShares = amountUSD / price = 30 / 0.3 = 100
			 * feeRateComponent = 0.25 * (0.3 * (1 - 0.3))^2
			 * feeRateComponent = 0.25 * (0.3 * 0.7)^2 = 0.011025
			 * platformFee = feeBaseShares * feeRateComponent = 100 * 0.011025 = 1.1025
			 */
			expect(
				roundTo(calculatePlatformFee(contracts * price, price, feeRate, feeExponent)),
			).toBe(1.1025);
		});

		it("price=0.1 → fee = 0.2025", () => {
			const price = 0.1;
			/*
			 * amountUSD = contracts * price = 100 * 0.1 = 10
			 * feeBaseShares = amountUSD / price = 10 / 0.1 = 100
			 * feeRateComponent = 0.25 * (0.1 * (1 - 0.1))^2
			 * feeRateComponent = 0.25 * (0.1 * 0.9)^2 = 0.002025
			 * platformFee = feeBaseShares * feeRateComponent = 100 * 0.002025 = 0.2025
			 */
			expect(
				roundTo(calculatePlatformFee(contracts * price, price, feeRate, feeExponent)),
			).toBe(0.2025);
		});

		it("price=0.05 → fee = 0.05640625", () => {
			const price = 0.05;
			/*
			 * amountUSD = contracts * price = 100 * 0.05 = 5
			 * feeBaseShares = amountUSD / price = 5 / 0.05 = 100
			 * feeRateComponent = 0.25 * (0.05 * (1 - 0.05))^2
			 * feeRateComponent = 0.25 * (0.05 * 0.95)^2 = 0.0005640625
			 * platformFee = feeBaseShares * feeRateComponent = 100 * 0.0005640625 = 0.05640625
			 */
			expect(
				roundTo(calculatePlatformFee(contracts * price, price, feeRate, feeExponent)),
			).toBe(0.05640625);
		});

		it("price=0.01 → fee = 0.00245025", () => {
			const price = 0.01;
			/*
			 * amountUSD = contracts * price = 100 * 0.01 = 1
			 * feeBaseShares = amountUSD / price = 1 / 0.01 = 100
			 * feeRateComponent = 0.25 * (0.01 * (1 - 0.01))^2
			 * feeRateComponent = 0.25 * (0.01 * 0.99)^2 = 0.0000245025
			 * platformFee = feeBaseShares * feeRateComponent = 100 * 0.0000245025 = 0.00245025
			 */
			expect(
				roundTo(calculatePlatformFee(contracts * price, price, feeRate, feeExponent)),
			).toBe(0.00245025);
		});

		it("price=0.7 → fee = 1.1025 (symmetric with 0.3)", () => {
			const price = 0.7;
			/*
			 * amountUSD = contracts * price = 100 * 0.7 = 70
			 * feeBaseShares = amountUSD / price = 70 / 0.7 = 100
			 * feeRateComponent = 0.25 * (0.7 * (1 - 0.7))^2
			 * feeRateComponent = 0.25 * (0.7 * 0.3)^2 = 0.011025
			 * platformFee = feeBaseShares * feeRateComponent = 100 * 0.011025 = 1.1025
			 */
			expect(
				roundTo(calculatePlatformFee(contracts * price, price, feeRate, feeExponent)),
			).toBe(1.1025);
		});

		it("price=0.9 → fee = 0.2025 (symmetric with 0.1)", () => {
			const price = 0.9;
			/*
			 * amountUSD = contracts * price = 100 * 0.9 = 90
			 * feeBaseShares = amountUSD / price = 90 / 0.9 = 100
			 * feeRateComponent = 0.25 * (0.9 * (1 - 0.9))^2
			 * feeRateComponent = 0.25 * (0.9 * 0.1)^2 = 0.002025
			 * platformFee = feeBaseShares * feeRateComponent = 100 * 0.002025 = 0.2025
			 */
			expect(
				roundTo(calculatePlatformFee(contracts * price, price, feeRate, feeExponent)),
			).toBe(0.2025);
		});

		it("price=0.95 → fee = 0.05640625 (symmetric with 0.05)", () => {
			const price = 0.95;
			/*
			 * amountUSD = contracts * price = 100 * 0.95 = 95
			 * feeBaseShares = amountUSD / price = 95 / 0.95 = 100
			 * feeRateComponent = 0.25 * (0.95 * (1 - 0.95))^2
			 * feeRateComponent = 0.25 * (0.95 * 0.05)^2 = 0.0005640625
			 * platformFee = feeBaseShares * feeRateComponent = 100 * 0.0005640625 = 0.05640625
			 */
			expect(
				roundTo(calculatePlatformFee(contracts * price, price, feeRate, feeExponent)),
			).toBe(0.05640625);
		});

		it("price=0.99 → fee = 0.00245025 (symmetric with 0.01)", () => {
			const price = 0.99;
			/*
			 * amountUSD = contracts * price = 100 * 0.99 = 99
			 * feeBaseShares = amountUSD / price = 99 / 0.99 = 100
			 * feeRateComponent = 0.25 * (0.99 * (1 - 0.99))^2
			 * feeRateComponent = 0.25 * (0.99 * 0.01)^2 = 0.0000245025
			 * platformFee = feeBaseShares * feeRateComponent = 100 * 0.0000245025 = 0.00245025
			 */
			expect(
				roundTo(calculatePlatformFee(contracts * price, price, feeRate, feeExponent)),
			).toBe(0.00245025);
		});

		it("price=0.5, C=125.5 → fee = 1.9609375", () => {
			const price = 0.5;
			const c = 125.5;
			/*
			 * amountUSD = contracts * price = 125.5 * 0.5 = 62.75
			 * feeBaseShares = amountUSD / price = 62.75 / 0.5 = 125.5
			 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
			 * platformFee = feeBaseShares * feeRateComponent = 125.5 * 0.015625 = 1.9609375
			 */
			expect(roundTo(calculatePlatformFee(c * price, price, feeRate, feeExponent))).toBe(
				1.9609375,
			);
		});
	});

	// builderTakerFeeRate is in decimal (bps / 10000), e.g. 100 bps → 0.01
	describe("builder fee (platform fee = 0)", () => {
		it("1% on 100 tokens at 50c → fee = 0.5", () => {
			const price = 0.5;
			const contracts = 100;
			const builderTakerFeeRate = 0.01; // 100 bps
			/*
			 * amountUSD = contracts * price = 100 * 0.5 = 50
			 * builderTakerFeeRate = 100 bps = 0.01
			 * builderFee = amountUSD * builderTakerFeeRate = 50 * 0.01 = 0.5
			 */
			expect(calculateBuilderFee(contracts * price, builderTakerFeeRate)).toBe(0.5);
		});

		it("5% on 200 tokens at 75c → fee = 7.5", () => {
			const price = 0.75;
			const contracts = 200;
			const builderTakerFeeRate = 0.05; // 500 bps
			/*
			 * amountUSD = contracts * price = 200 * 0.75 = 150
			 * builderTakerFeeRate = 500 bps = 0.05
			 * builderFee = amountUSD * builderTakerFeeRate = 150 * 0.05 = 7.5
			 */
			expect(calculateBuilderFee(contracts * price, builderTakerFeeRate)).toBe(7.5);
		});
	});

	/*
	 * Combined fee tests keep the platform and builder fee bases explicit.
	 * Platform fee uses shares: amountUSD / price.
	 * Builder fee uses cash notional directly: amountUSD.
	 */
	describe("combined platform + builder fee", () => {
		it("matches sum of separate fees", () => {
			const price = 0.5;
			const contracts = 100;
			const feeRate = 0.25;
			const feeExponent = 2;
			const builderTakerFeeRate = 0.01;
			const amountUSD = contracts * price;
			/*
			 * amountUSD = contracts * price = 100 * 0.5 = 50
			 *
			 * Platform fee:
			 * feeBaseShares = amountUSD / price = 50 / 0.5 = 100
			 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
			 * platformFee = 100 * 0.015625 = 1.5625
			 *
			 * Builder fee:
			 * builderTakerFeeRate = 0.01
			 * builderFee = amountUSD * builderTakerFeeRate = 50 * 0.01 = 0.5
			 *
			 * totalFee = platformFee + builderFee = 1.5625 + 0.5 = 2.0625
			 */

			const platformFee = calculatePlatformFee(amountUSD, price, feeRate, feeExponent);
			const builderFee = calculateBuilderFee(amountUSD, builderTakerFeeRate);

			expect(platformFee).toBe(1.5625);
			expect(builderFee).toBe(0.5);
			expect(platformFee + builderFee).toBe(2.0625);
		});
	});

	describe("adjustBuyAmountForFees", () => {
		describe("no adjustment when balance covers amount + fees", () => {
			it("exact balance equal to amount (no fees) → no adjustment", () => {
				const amount = 50;
				/*
				 * amount is BUY cash notional, so amount=50 means the user is trying to spend
				 * 50 USDC on the order before fees.
				 *
				 * feeRate = 0 and builderTakerFeeRate = 0
				 * platformFee = 0
				 * builderFee = 0
				 * totalCost = amount + platformFee + builderFee = 50 + 0 + 0 = 50
				 * balance = amount = 50
				 * adjusted = balance - platformFee - builderFee = 50 - 0 - 0 = 50
				 */
				const result = adjustBuyAmountForFees(amount, 0.5, amount, 0, 0, 0);
				expect(result).toBe(amount);
			});

			it("balance strictly greater than totalCost → returns amount unchanged", () => {
				const amount = 50;
				const price = 0.5;
				const platformFee = calculatePlatformFee(amount, price, feeRate, feeExponent);
				const totalCost = amount + platformFee;
				const balance = totalCost + 1; // comfortably above
				const result = adjustBuyAmountForFees(
					amount,
					price,
					balance,
					feeRate,
					feeExponent,
					0,
				);
				expect(result).toBe(amount);
			});

			it("balance exactly equal to amount + reserved fee → returns amount unchanged", () => {
				const amount = 50;
				const price = 0.5;
				const platformFee = calculatePlatformFee(amount, price, feeRate, feeExponent);
				const totalCost = amount + platformFee;
				/*
				 * amount is BUY cash notional, so amount=50 means the user is trying to spend
				 * 50 USDC on the order before fees.
				 *
				 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
				 * feeBaseShares = amount / price = 50 / 0.5 = 100
				 * platformFee = feeBaseShares * feeRateComponent = 100 * 0.015625 = 1.5625
				 *
				 * totalCost = amount + platformFee = 50 + 1.5625 = 51.5625
				 * balance = totalCost = 51.5625
				 *
				 * The implementation uses userUSDCBalance <= totalCost for the adjustment branch,
				 * so equality does enter that branch. The returned value is still unchanged:
				 * adjusted = balance - platformFee = 51.5625 - 1.5625 = 50
				 */
				const result = adjustBuyAmountForFees(
					amount,
					price,
					totalCost,
					feeRate,
					feeExponent,
					0,
				);
				expect(platformFee).toBe(1.5625);
				expect(totalCost).toBe(51.5625);
				expect(result).toBe(50);
			});
		});

		describe("adjustment applied when balance is insufficient", () => {
			it("platform fee only: reserves the original requested fee", () => {
				const amount = 50;
				const price = 0.5;
				/*
				 * amount is BUY cash notional, so amount=50 means the user is trying to spend
				 * 50 USDC on the order before fees. Balance is also 50, so the user cannot
				 * cover both the requested notional and the fee.
				 *
				 * feeBaseAmount = min(amount, balance) = min(50, 50) = 50
				 * feeBaseShares = feeBaseAmount / price = 50 / 0.5 = 100
				 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
				 * reservedPlatformFee = feeBaseShares * feeRateComponent = 100 * 0.015625 = 1.5625
				 *
				 * adjusted = balance - reservedPlatformFee = 50 - 1.5625 = 48.4375
				 *
				 * Fee on the signed adjusted notional is lower than the reserved fee:
				 * adjustedFeeBaseShares = adjusted / price = 48.4375 / 0.5 = 96.875
				 * adjustedPlatformFee = 96.875 * 0.015625 = 1.513671875
				 * signedCostWithFee = adjusted + adjustedPlatformFee = 48.4375 + 1.513671875 = 49.951171875
				 */
				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					amount,
					feeRate,
					feeExponent,
					0,
				);
				const originalFee = calculatePlatformFee(amount, price, feeRate, feeExponent);
				const adjustedFee = calculatePlatformFee(adjusted, price, feeRate, feeExponent);
				expect(originalFee).toBe(1.5625);
				expect(adjusted).toBe(48.4375);
				expect(adjustedFee).toBe(1.513671875);
				expect(adjusted + adjustedFee).toBe(49.951171875);
			});

			it("builder fee only: reserves the original requested fee", () => {
				const amount = 50;
				const price = 0.5;
				const builderTakerFeeRate = 0.01;
				/*
				 * amount is BUY cash notional and balance is also 50.
				 *
				 * feeBaseAmount = min(amount, balance) = min(50, 50) = 50
				 * builderTakerFeeRate = 0.01
				 * reservedBuilderFee = feeBaseAmount * builderTakerFeeRate = 50 * 0.01 = 0.5
				 *
				 * adjusted = balance - reservedBuilderFee = 50 - 0.5 = 49.5
				 *
				 * Fee on the signed adjusted notional is lower than the reserved fee:
				 * adjustedBuilderFee = adjusted * builderTakerFeeRate = 49.5 * 0.01 = 0.495
				 * signedCostWithFee = adjusted + adjustedBuilderFee = 49.5 + 0.495 = 49.995
				 */
				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					amount,
					0,
					0,
					builderTakerFeeRate,
				);
				const originalFee = calculateBuilderFee(amount, builderTakerFeeRate);
				const adjustedFee = calculateBuilderFee(adjusted, builderTakerFeeRate);
				expect(originalFee).toBe(0.5);
				expect(adjusted).toBe(49.5);
				expect(adjustedFee).toBe(0.495);
				expect(adjusted + adjustedFee).toBe(49.995);
			});

			it("platform + builder fee: reserves the original requested fees", () => {
				const amount = 50;
				const price = 0.5;
				const builderTakerFeeRate = 0.01;
				/*
				 * amount is BUY cash notional and balance is also 50.
				 *
				 * feeBaseAmount = min(amount, balance) = min(50, 50) = 50
				 *
				 * Platform reserve:
				 * feeBaseShares = feeBaseAmount / price = 50 / 0.5 = 100
				 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
				 * reservedPlatformFee = 100 * 0.015625 = 1.5625
				 *
				 * Builder reserve:
				 * builderTakerFeeRate = 0.01
				 * reservedBuilderFee = feeBaseAmount * builderTakerFeeRate = 50 * 0.01 = 0.5
				 *
				 * adjusted = balance - reservedPlatformFee - reservedBuilderFee
				 * adjusted = 50 - 1.5625 - 0.5 = 47.9375
				 *
				 * Fee on the signed adjusted notional:
				 * adjustedPlatformFee = (47.9375 / 0.5) * 0.015625 = 1.498046875
				 * adjustedBuilderFee = 47.9375 * 0.01 = 0.479375
				 * signedCostWithFee = 47.9375 + 1.498046875 + 0.479375 = 49.914921875
				 */
				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					amount,
					feeRate,
					feeExponent,
					builderTakerFeeRate,
				);
				const originalPlatformFee = calculatePlatformFee(
					amount,
					price,
					feeRate,
					feeExponent,
				);
				const originalBuilderFee = calculateBuilderFee(amount, builderTakerFeeRate);
				const adjustedPlatformFee = calculatePlatformFee(
					adjusted,
					price,
					feeRate,
					feeExponent,
				);
				const adjustedBuilderFee = calculateBuilderFee(adjusted, builderTakerFeeRate);
				expect(originalPlatformFee).toBe(1.5625);
				expect(originalBuilderFee).toBe(0.5);
				expect(adjusted).toBe(47.9375);
				expect(adjustedPlatformFee).toBe(1.498046875);
				expect(adjustedBuilderFee).toBe(0.479375);
				expect(adjusted + adjustedPlatformFee + adjustedBuilderFee).toBe(49.914921875);
			});

			it("adjusted amount is strictly less than original", () => {
				const amount = 50;
				const adjusted = adjustBuyAmountForFees(
					amount,
					0.5,
					amount,
					feeRate,
					feeExponent,
					0,
				);
				/*
				 * amount is BUY cash notional and balance is also 50.
				 *
				 * feeBaseAmount = min(amount, balance) = 50
				 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
				 * reservedPlatformFee = (50 / 0.5) * 0.015625 = 1.5625
				 * adjusted = balance - reservedPlatformFee = 50 - 1.5625 = 48.4375
				 */
				expect(adjusted).toBe(48.4375);
			});

			it("price=0.3, platform+builder: reserves the original requested fees", () => {
				const amount = 30;
				const price = 0.3;
				const builderTakerFeeRate = 0.02;
				/*
				 * amount is BUY cash notional and balance is also 30.
				 *
				 * feeBaseAmount = min(amount, balance) = min(30, 30) = 30
				 *
				 * Platform reserve:
				 * feeRateComponent = 0.25 * (0.3 * (1 - 0.3))^2
				 * feeRateComponent = 0.25 * (0.3 * 0.7)^2 = 0.011025
				 * reservedPlatformFee = (30 / 0.3) * 0.011025 = 1.1025
				 *
				 * Builder reserve:
				 * builderTakerFeeRate = 0.02
				 * reservedBuilderFee = 30 * 0.02 = 0.6
				 *
				 * adjusted = balance - reservedPlatformFee - reservedBuilderFee
				 * adjusted = 30 - 1.1025 - 0.6 = 28.2975
				 *
				 * Fee on the signed adjusted notional:
				 * adjustedPlatformFee = (28.2975 / 0.3) * 0.011025 = 1.039933125
				 * adjustedBuilderFee = 28.2975 * 0.02 = 0.56595
				 * signedCostWithFee = 28.2975 + 1.039933125 + 0.56595 = 29.903383125
				 */
				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					amount,
					feeRate,
					feeExponent,
					builderTakerFeeRate,
				);
				const originalPlatformFee = calculatePlatformFee(
					amount,
					price,
					feeRate,
					feeExponent,
				);
				const originalBuilderFee = calculateBuilderFee(amount, builderTakerFeeRate);
				const adjustedPlatformFee = calculatePlatformFee(
					adjusted,
					price,
					feeRate,
					feeExponent,
				);
				const adjustedBuilderFee = calculateBuilderFee(adjusted, builderTakerFeeRate);
				expect(roundTo(originalPlatformFee)).toBe(1.1025);
				expect(originalBuilderFee).toBe(0.6);
				expect(adjusted).toBe(28.2975);
				expect(roundTo(adjustedPlatformFee)).toBe(1.039933125);
				expect(adjustedBuilderFee).toBe(0.56595);
				expect(roundTo(adjusted + adjustedPlatformFee + adjustedBuilderFee)).toBe(
					29.903383125,
				);
			});

			it("uses balance as the fee base when requested amount exceeds balance", () => {
				const amount = 100;
				const price = 0.3;
				const userUSDCBalance = 1;
				const rate = 0.072;
				const exponent = 1;
				/*
				 * amount is BUY cash notional, so amount=100 means the user requested a
				 * 100 USDC buy. Balance is only 1 USDC.
				 *
				 * The conservative reserve is capped at available balance instead of using
				 * the unaffordable original request:
				 * feeBaseAmount = min(amount, balance) = min(100, 1) = 1
				 *
				 * feeRateComponent = 0.072 * (0.3 * (1 - 0.3))^1
				 * feeRateComponent = 0.072 * (0.3 * 0.7) = 0.01512
				 * reservedPlatformFee = (feeBaseAmount / price) * feeRateComponent
				 * reservedPlatformFee = (1 / 0.3) * 0.01512 = 0.0504
				 *
				 * adjusted = balance - reservedPlatformFee = 1 - 0.0504 = 0.9496
				 *
				 * Fee on the signed adjusted notional:
				 * adjustedPlatformFee = (0.9496 / 0.3) * 0.01512 = 0.04785984
				 * signedCostWithFee = 0.9496 + 0.04785984 = 0.99745984
				 */

				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					userUSDCBalance,
					rate,
					exponent,
					0,
				);
				const reservedFee = calculatePlatformFee(userUSDCBalance, price, rate, exponent);
				const adjustedFee = calculatePlatformFee(adjusted, price, rate, exponent);

				expect(roundTo(reservedFee)).toBe(0.0504);
				expect(adjusted).toBe(0.9496);
				expect(roundTo(adjustedFee)).toBe(0.04785984);
				expect(roundTo(adjusted + adjustedFee)).toBe(0.99745984);
			});
		});

		describe("fee slippage", () => {
			it("pads only the platform fee by the configured percentage", () => {
				const amount = 50;
				const price = 0.5;
				const builderTakerFeeRate = 0.01;
				const feeSlippage = 20;
				/*
				 * amount is BUY cash notional and balance is also 50.
				 *
				 * Unpadded platform reserve:
				 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
				 * unpaddedPlatformFee = (50 / 0.5) * 0.015625 = 1.5625
				 *
				 * feeSlippage is a percentage, so 20 means add 20% to the platform reserve:
				 * paddedPlatformFee = unpaddedPlatformFee * (1 + 20 / 100)
				 * paddedPlatformFee = 1.5625 * 1.2 = 1.875
				 *
				 * Builder reserve is not padded:
				 * builderFee = 50 * 0.01 = 0.5
				 *
				 * adjusted = balance - paddedPlatformFee - builderFee
				 * adjusted = 50 - 1.875 - 0.5 = 47.625
				 *
				 * Fee on the signed adjusted notional:
				 * adjustedPlatformFee = (47.625 / 0.5) * 0.015625 * 1.2 = 1.7859375
				 * adjustedBuilderFee = 47.625 * 0.01 = 0.47625
				 * signedCostWithFee = 47.625 + 1.7859375 + 0.47625 = 49.8871875
				 */

				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					amount,
					feeRate,
					feeExponent,
					builderTakerFeeRate,
					feeSlippage,
				);
				const originalPlatformFee = calculatePlatformFee(
					amount,
					price,
					feeRate,
					feeExponent,
					feeSlippage,
				);
				const originalBuilderFee = calculateBuilderFee(amount, builderTakerFeeRate);
				const adjustedPlatformFee = calculatePlatformFee(
					adjusted,
					price,
					feeRate,
					feeExponent,
					feeSlippage,
				);
				const adjustedBuilderFee = calculateBuilderFee(adjusted, builderTakerFeeRate);

				expect(originalPlatformFee).toBe(1.875);
				expect(originalBuilderFee).toBe(0.5);
				expect(adjusted).toBe(47.625);
				expect(adjustedPlatformFee).toBe(1.7859375);
				expect(adjustedBuilderFee).toBe(0.47625);
				expect(adjusted + adjustedPlatformFee + adjustedBuilderFee).toBe(49.8871875);
			});

			it("adjusts when balance covers unpadded fees but not padded fees", () => {
				const amount = 50;
				const price = 0.5;
				const platformFee = calculatePlatformFee(amount, price, feeRate, feeExponent);
				const paddedPlatformFee = calculatePlatformFee(
					amount,
					price,
					feeRate,
					feeExponent,
					20,
				);
				const balance = amount + platformFee + (paddedPlatformFee - platformFee) / 2;
				/*
				 * amount is BUY cash notional.
				 *
				 * Unpadded fee:
				 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
				 * platformFee = (50 / 0.5) * 0.015625 = 1.5625
				 *
				 * Padded fee with feeSlippage=20:
				 * paddedPlatformFee = 1.5625 * 1.2 = 1.875
				 *
				 * Test balance is halfway between the unpadded and padded total costs:
				 * balance = 50 + 1.5625 + ((1.875 - 1.5625) / 2)
				 * balance = 50 + 1.5625 + 0.15625 = 51.71875
				 *
				 * Unpadded totalCost = 50 + 1.5625 = 51.5625, so balance would pass without slippage.
				 * Padded totalCost = 50 + 1.875 = 51.875, so balance fails with slippage.
				 * adjusted = balance - paddedPlatformFee = 51.71875 - 1.875 = 49.84375
				 */

				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					balance,
					feeRate,
					feeExponent,
					0,
					20,
				);

				expect(platformFee).toBe(1.5625);
				expect(paddedPlatformFee).toBe(1.875);
				expect(balance).toBe(51.71875);
				expect(adjusted).toBe(49.84375);
			});

			it("accepts percentage floats between 1 and 100", () => {
				const amount = 50;
				const price = 0.5;
				/*
				 * amount is BUY cash notional and balance is also 50.
				 *
				 * Base platform reserve:
				 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
				 * unpaddedPlatformFee = (50 / 0.5) * 0.015625 = 1.5625
				 *
				 * feeSlippage=1.5 is valid because it is a percentage float between 1 and 100:
				 * paddedPlatformFee = 1.5625 * (1 + 1.5 / 100)
				 * paddedPlatformFee = 1.5625 * 1.015 = 1.5859375
				 *
				 * adjusted = balance - paddedPlatformFee = 50 - 1.5859375 = 48.4140625
				 *
				 * Fee on the signed adjusted notional:
				 * adjustedPlatformFee = (48.4140625 / 0.5) * 0.015625 * 1.015
				 * adjustedPlatformFee = 1.535633544921875
				 * signedCostWithFee = 48.4140625 + 1.535633544921875 = 49.949696044921875
				 */
				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					amount,
					feeRate,
					feeExponent,
					0,
					1.5,
				);
				const platformFee = calculatePlatformFee(
					adjusted,
					price,
					feeRate,
					feeExponent,
					1.5,
				);
				const originalPlatformFee = calculatePlatformFee(
					amount,
					price,
					feeRate,
					feeExponent,
					1.5,
				);

				expect(roundTo(originalPlatformFee)).toBe(1.5859375);
				expect(adjusted).toBe(48.4140625);
				expect(roundTo(platformFee)).toBe(1.535633544922);
				expect(roundTo(adjusted + platformFee)).toBe(49.949696044922);
			});

			it("rejects fractional percentages below 1 and values over 100", () => {
				expect(() =>
					adjustBuyAmountForFees(50, 0.5, 50, feeRate, feeExponent, 0, 0.5),
				).toThrow("feeSlippage must be 0 or a percentage between 1 and 100");
				expect(() =>
					adjustBuyAmountForFees(50, 0.5, 50, feeRate, feeExponent, 0, 101),
				).toThrow("feeSlippage must be 0 or a percentage between 1 and 100");
			});
		});
	});

	describe("ClobClient feeSlippage", () => {
		// publicly known private key
		const wallet = new Wallet(
			"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
		);

		it("defaults to zero", () => {
			const client = new ClobClient({
				host: "https://clob.polymarket.com",
				chain: Chain.AMOY,
				signer: wallet,
			});

			expect(client.feeSlippage).toBe(0);
		});

		it("accepts percentage floats between 1 and 100", () => {
			const client = new ClobClient({
				host: "https://clob.polymarket.com",
				chain: Chain.AMOY,
				signer: wallet,
				feeSlippage: 12.5,
			});

			expect(client.feeSlippage).toBe(12.5);
		});

		it("rejects invalid percentage values during initialization", () => {
			const createClient = (feeSlippage: number) =>
				new ClobClient({
					host: "https://clob.polymarket.com",
					chain: Chain.AMOY,
					signer: wallet,
					feeSlippage,
				});

			expect(() => createClient(0.5)).toThrow(
				"feeSlippage must be 0 or a percentage between 1 and 100",
			);
			expect(() => createClient(101)).toThrow(
				"feeSlippage must be 0 or a percentage between 1 and 100",
			);
			expect(() => createClient(Number.NaN)).toThrow(
				"feeSlippage must be 0 or a percentage between 1 and 100",
			);
		});
	});

	describe("client order fee adjustment", () => {
		const tokenID = "123";
		// publicly known private key
		const wallet = new Wallet(
			"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
		);

		const createCachedClient = (feeSlippage = 0): ClobClient => {
			const client = new ClobClient({
				host: "https://clob.polymarket.com",
				chain: Chain.AMOY,
				signer: wallet,
				feeSlippage,
			});

			client.tickSizes[tokenID] = "0.01";
			client.negRisk[tokenID] = false;
			client.feeInfos[tokenID] = {
				rate: feeRate,
				exponent: feeExponent,
			};
			(client as any).cachedVersion = 2;

			return client;
		};

		it("adjusts V2 BUY limit size when userUSDCBalance is provided", async () => {
			const client = createCachedClient(20);
			const order: UserOrderV2 = {
				tokenID,
				price: 0.5,
				size: 100,
				side: Side.BUY,
				userUSDCBalance: 50,
			};

			const signedOrder = await client.createOrder(order, { tickSize: "0.01" });
			/*
			 * Limit BUY amount is cash notional derived from size * price.
			 *
			 * requestedNotional = size * price = 100 * 0.5 = 50
			 * feeBaseAmount = min(requestedNotional, balance) = min(50, 50) = 50
			 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
			 * paddedPlatformFee = (50 / 0.5) * 0.015625 * 1.2 = 1.875
			 *
			 * adjustedNotional = balance - paddedPlatformFee = 50 - 1.875 = 48.125
			 * adjustedSize = adjustedNotional / price = 48.125 / 0.5 = 96.25
			 *
			 * Order builder BUY raw amounts:
			 * rawTakerAmt = roundDown(adjustedSize, 2) = roundDown(96.25, 2) = 96.25
			 * rawMakerAmt = rawTakerAmt * price = 96.25 * 0.5 = 48.125
			 * makerAmount = 48.125 * 1e6 = 48125000
			 * takerAmount = 96.25 * 1e6 = 96250000
			 */
			expect(signedOrder.makerAmount).toBe("48125000");
			expect(signedOrder.takerAmount).toBe("96250000");
			expect(order.size).toBe(100);
		});

		it("does not poison builder fee cache when fee lookup returns an API error", async () => {
			const builderCode =
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
			const client = createCachedClient(20);
			let feeLookups = 0;
			(client as any).get = async (endpoint: string) => {
				if (endpoint.includes("/fees/builder-fees/")) {
					feeLookups += 1;
					return { error: "builder code not found", status: 404 };
				}
				throw new Error(`unexpected GET ${endpoint}`);
			};

			const order: UserOrderV2 = {
				tokenID,
				price: 0.5,
				size: 100,
				side: Side.BUY,
				userUSDCBalance: 50,
				builderCode,
			};

			const signedOrder = await client.createOrder(order, { tickSize: "0.01" });

			expect(signedOrder.makerAmount).toBe("48125000");
			expect(signedOrder.takerAmount).toBe("96250000");
			expect(client.builderFeeRates[builderCode]).toBeUndefined();
			expect(feeLookups).toBe(1);
		});

		it("does not cache malformed builder fee responses with missing rates", async () => {
			const builderCode =
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
			const client = createCachedClient(20);
			let feeLookups = 0;
			(client as any).get = async (endpoint: string) => {
				if (endpoint.includes("/fees/builder-fees/")) {
					feeLookups += 1;
					return { status: "pending" };
				}
				throw new Error(`unexpected GET ${endpoint}`);
			};

			const order: UserOrderV2 = {
				tokenID,
				price: 0.5,
				size: 100,
				side: Side.BUY,
				userUSDCBalance: 50,
				builderCode,
			};

			const signedOrder = await client.createOrder(order, { tickSize: "0.01" });

			expect(signedOrder.makerAmount).toBe("48125000");
			expect(signedOrder.takerAmount).toBe("96250000");
			expect(client.builderFeeRates[builderCode]).toBeUndefined();
			expect(feeLookups).toBe(1);
		});

		it("keeps adjusted V2 BUY limit within balance when price rounds up to tick", async () => {
			const client = createCachedClient(20);
			const balance = 50;
			const order: UserOrderV2 = {
				tokenID,
				price: 0.505,
				size: 100,
				side: Side.BUY,
				userUSDCBalance: balance,
			};

			const signedOrder = await client.createOrder(order, { tickSize: "0.01" });
			const signedNotional = Number(signedOrder.makerAmount) / 1_000_000;
			const signedShares = Number(signedOrder.takerAmount) / 1_000_000;
			const signedPrice = signedNotional / signedShares;
			/*
			 * Input price 0.505 rounds to 0.51 for a 0.01 limit tick before fee adjustment.
			 *
			 * requestedNotional = size * roundedPrice = 100 * 0.51 = 51
			 * balance = 50
			 * feeBaseAmount = min(requestedNotional, balance) = min(51, 50) = 50
			 *
			 * feeRateComponent = 0.25 * (0.51 * (1 - 0.51))^2
			 * feeRateComponent = 0.25 * (0.51 * 0.49)^2 = 0.0156125025
			 * paddedFeeRateComponent = feeRateComponent * 1.2 = 0.018735003
			 * paddedPlatformFee = (feeBaseAmount / roundedPrice) * paddedFeeRateComponent
			 * paddedPlatformFee = (50 / 0.51) * 0.018735003 = 1.836765
			 *
			 * adjustedNotional = balance - paddedPlatformFee = 50 - 1.836765 = 48.163235
			 * adjustedSize = adjustedNotional / roundedPrice = 48.163235 / 0.51 = 94.43771568627452
			 *
			 * Order builder BUY raw amounts:
			 * rawTakerAmt = roundDown(adjustedSize, 2) = roundDown(94.43771568627452, 2) = 94.43
			 * rawMakerAmt = rawTakerAmt * roundedPrice = 94.43 * 0.51 = 48.1593
			 * makerAmount = 48.1593 * 1e6 = 48159300
			 * takerAmount = 94.43 * 1e6 = 94430000
			 *
			 * Fee on the actual signed notional:
			 * signedPlatformFee = (48.1593 / 0.51) * 0.018735003 = 1.76914633329
			 * signedCostWithFee = 48.1593 + 1.76914633329 = 49.92844633329
			 */
			const platformFee = calculatePlatformFee(
				signedNotional,
				signedPrice,
				feeRate,
				feeExponent,
				20,
			);

			expect(signedOrder.makerAmount).toBe("48159300");
			expect(signedOrder.takerAmount).toBe("94430000");
			expect(signedNotional).toBe(48.1593);
			expect(signedShares).toBe(94.43);
			expect(roundTo(signedPrice)).toBe(0.51);
			expect(roundTo(platformFee)).toBe(1.76914633329);
			expect(roundTo(signedNotional + platformFee)).toBe(49.92844633329);
			expect(order.price).toBe(0.505);
		});

		it("adjusts V2 BUY market amount when userUSDCBalance is provided", async () => {
			const client = createCachedClient(20);
			const order: UserMarketOrderV2 = {
				tokenID,
				price: 0.5,
				amount: 50,
				side: Side.BUY,
				userUSDCBalance: 50,
			};

			const signedOrder = await client.createMarketOrder(order, { tickSize: "0.01" });
			/*
			 * Market BUY amount is already cash notional.
			 *
			 * requestedNotional = amount = 50
			 * feeBaseAmount = min(requestedNotional, balance) = min(50, 50) = 50
			 * feeRateComponent = 0.25 * (0.5 * (1 - 0.5))^2 = 0.015625
			 * paddedPlatformFee = (50 / 0.5) * 0.015625 * 1.2 = 1.875
			 *
			 * adjustedNotional = balance - paddedPlatformFee = 50 - 1.875 = 48.125
			 *
			 * Market BUY raw amounts:
			 * rawMakerAmt = roundDown(adjustedNotional, 2) = roundDown(48.125, 2) = 48.12
			 * rawPrice = roundDown(price, 2) = 0.5
			 * rawTakerAmt = rawMakerAmt / rawPrice = 48.12 / 0.5 = 96.24
			 * makerAmount = 48.12 * 1e6 = 48120000
			 * takerAmount = 96.24 * 1e6 = 96240000
			 */

			expect(signedOrder.makerAmount).toBe("48120000");
			expect(signedOrder.takerAmount).toBe("96240000");
			expect(order.amount).toBe(50);
		});

		it("leaves V2 BUY limit size unchanged without userUSDCBalance", async () => {
			const client = createCachedClient(20);
			const order: UserOrderV2 = {
				tokenID,
				price: 0.5,
				size: 100,
				side: Side.BUY,
			};

			const signedOrder = await client.createOrder(order, { tickSize: "0.01" });

			expect(signedOrder.makerAmount).toBe("50000000");
			expect(signedOrder.takerAmount).toBe("100000000");
		});

		it("leaves V2 SELL limit size unchanged with userUSDCBalance", async () => {
			const client = createCachedClient(20);
			const order: UserOrderV2 = {
				tokenID,
				price: 0.5,
				size: 100,
				side: Side.SELL,
				userUSDCBalance: 50,
			};

			const signedOrder = await client.createOrder(order, { tickSize: "0.01" });

			expect(signedOrder.makerAmount).toBe("100000000");
			expect(signedOrder.takerAmount).toBe("50000000");
		});
	});
});

describe("production fee rates — v2 (rate + exponent)", () => {
	const amount = 100;

	describe("fee value at representative prices", () => {
		describe("sports_fees_v2 (rate=0.03, exp=1)", () => {
			it("price=0.5 → $1.50", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.5
				 * feeBaseShares = amount / price = 100 / 0.5 = 200
				 * feeRateComponent = 0.03 * (0.5 * (1 - 0.5)) = 0.0075
				 * platformFee = 200 * 0.0075 = 1.5
				 */
				expect(calculatePlatformFee(amount, 0.5, 0.03, 1)).toBe(1.5);
			});
			it("price=0.3 → $2.10", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.3
				 * feeBaseShares = amount / price = 100 / 0.3 = 333.33333333333337
				 * feeRateComponent = 0.03 * (0.3 * (1 - 0.3)) = 0.0063
				 * platformFee = 333.33333333333337 * 0.0063 = 2.1
				 */
				expect(roundTo(calculatePlatformFee(amount, 0.3, 0.03, 1))).toBe(2.1);
			});
			it("price=0.7 → $0.90", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.7
				 * feeBaseShares = amount / price = 100 / 0.7 = 142.85714285714286
				 * feeRateComponent = 0.03 * (0.7 * (1 - 0.7)) = 0.0063
				 * platformFee = 142.85714285714286 * 0.0063 = 0.9
				 */
				expect(roundTo(calculatePlatformFee(amount, 0.7, 0.03, 1))).toBe(0.9);
			});
		});

		describe("politics_fees / tech_fees / finance_prices_fees / mentions_fees (rate=0.04, exp=1)", () => {
			it("price=0.5 → $2.00", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.5
				 * feeBaseShares = amount / price = 100 / 0.5 = 200
				 * feeRateComponent = 0.04 * (0.5 * (1 - 0.5)) = 0.01
				 * platformFee = 200 * 0.01 = 2
				 */
				expect(calculatePlatformFee(amount, 0.5, 0.04, 1)).toBe(2);
			});
			it("price=0.3 → $2.80", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.3
				 * feeBaseShares = amount / price = 100 / 0.3 = 333.33333333333337
				 * feeRateComponent = 0.04 * (0.3 * (1 - 0.3)) = 0.0084
				 * platformFee = 333.33333333333337 * 0.0084 = 2.8
				 */
				expect(roundTo(calculatePlatformFee(amount, 0.3, 0.04, 1))).toBe(2.8);
			});
			it("price=0.7 → $1.20", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.7
				 * feeBaseShares = amount / price = 100 / 0.7 = 142.85714285714286
				 * feeRateComponent = 0.04 * (0.7 * (1 - 0.7)) = 0.0084
				 * platformFee = 142.85714285714286 * 0.0084 = 1.2
				 */
				expect(roundTo(calculatePlatformFee(amount, 0.7, 0.04, 1))).toBe(1.2);
			});
		});

		describe("culture_fees / weather_fees / general_fees / economics_fees (rate=0.05, exp=1)", () => {
			it("price=0.5 → $2.50", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.5
				 * feeBaseShares = amount / price = 100 / 0.5 = 200
				 * feeRateComponent = 0.05 * (0.5 * (1 - 0.5)) = 0.0125
				 * platformFee = 200 * 0.0125 = 2.5
				 */
				expect(calculatePlatformFee(amount, 0.5, 0.05, 1)).toBe(2.5);
			});
			it("price=0.3 → $3.50", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.3
				 * feeBaseShares = amount / price = 100 / 0.3 = 333.33333333333337
				 * feeRateComponent = 0.05 * (0.3 * (1 - 0.3)) = 0.0105
				 * platformFee = 333.33333333333337 * 0.0105 = 3.5
				 */
				expect(roundTo(calculatePlatformFee(amount, 0.3, 0.05, 1))).toBe(3.5);
			});
			it("price=0.7 → $1.50", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.7
				 * feeBaseShares = amount / price = 100 / 0.7 = 142.85714285714286
				 * feeRateComponent = 0.05 * (0.7 * (1 - 0.7)) = 0.0105
				 * platformFee = 142.85714285714286 * 0.0105 = 1.5
				 */
				expect(roundTo(calculatePlatformFee(amount, 0.7, 0.05, 1))).toBe(1.5);
			});
		});

		describe("crypto_fees_v2 (rate=0.072, exp=1)", () => {
			it("price=0.5 → $3.60", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.5
				 * feeBaseShares = amount / price = 100 / 0.5 = 200
				 * feeRateComponent = 0.072 * (0.5 * (1 - 0.5)) = 0.018
				 * platformFee = 200 * 0.018 = 3.6
				 */
				expect(roundTo(calculatePlatformFee(amount, 0.5, 0.072, 1))).toBe(3.6);
			});
			it("price=0.3 → $5.04", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.3
				 * feeBaseShares = amount / price = 100 / 0.3 = 333.33333333333337
				 * feeRateComponent = 0.072 * (0.3 * (1 - 0.3)) = 0.01512
				 * platformFee = 333.33333333333337 * 0.01512 = 5.04
				 */
				expect(calculatePlatformFee(amount, 0.3, 0.072, 1)).toBe(5.04);
			});
			it("price=0.7 → $2.16", () => {
				/*
				 * amount = 100 USDC
				 * price = 0.7
				 * feeBaseShares = amount / price = 100 / 0.7 = 142.85714285714286
				 * feeRateComponent = 0.072 * (0.7 * (1 - 0.7)) = 0.01512
				 * platformFee = 142.85714285714286 * 0.01512 = 2.16
				 */
				expect(calculatePlatformFee(amount, 0.7, 0.072, 1)).toBe(2.16);
			});
		});
	});

	describe("balance = amount: adjusted reserves the original requested fee", () => {
		const cases = [
			{
				name: "sports_fees_v2",
				rate: 0.03,
				exponent: 1,
				expected: {
					0.3: { originalFee: 2.1, adjusted: 97.9, adjustedFee: 2.0559, final: 99.9559 },
					0.5: { originalFee: 1.5, adjusted: 98.5, adjustedFee: 1.4775, final: 99.9775 },
					0.7: { originalFee: 0.9, adjusted: 99.1, adjustedFee: 0.8919, final: 99.9919 },
				},
			},
			{
				name: "politics_fees / tech_fees / finance_prices_fees / mentions_fees",
				rate: 0.04,
				exponent: 1,
				expected: {
					0.3: { originalFee: 2.8, adjusted: 97.2, adjustedFee: 2.7216, final: 99.9216 },
					0.5: { originalFee: 2, adjusted: 98, adjustedFee: 1.96, final: 99.96 },
					0.7: { originalFee: 1.2, adjusted: 98.8, adjustedFee: 1.1856, final: 99.9856 },
				},
			},
			{
				name: "culture_fees / weather_fees / general_fees / economics_fees",
				rate: 0.05,
				exponent: 1,
				expected: {
					0.3: { originalFee: 3.5, adjusted: 96.5, adjustedFee: 3.3775, final: 99.8775 },
					0.5: { originalFee: 2.5, adjusted: 97.5, adjustedFee: 2.4375, final: 99.9375 },
					0.7: { originalFee: 1.5, adjusted: 98.5, adjustedFee: 1.4775, final: 99.9775 },
				},
			},
			{
				name: "crypto_fees_v2",
				rate: 0.072,
				exponent: 1,
				expected: {
					0.3: {
						originalFee: 5.04,
						adjusted: 94.96,
						adjustedFee: 4.785984,
						final: 99.745984,
					},
					0.5: { originalFee: 3.6, adjusted: 96.4, adjustedFee: 3.4704, final: 99.8704 },
					0.7: {
						originalFee: 2.16,
						adjusted: 97.84,
						adjustedFee: 2.113344,
						final: 99.953344,
					},
				},
			},
		];

		for (const { name, rate, exponent, expected } of cases) {
			describe(name, () => {
				for (const price of [0.3, 0.5, 0.7] as const) {
					it(`price=${price}`, () => {
						const expectedForPrice = expected[price];
						/*
						 * These production-rate cases all use balance=amount=100, so the reserved fee
						 * is taken on feeBaseAmount=100.
						 *
						 * originalFee = (100 / price) * (rate * (price * (1 - price))^exponent)
						 * adjusted = balance - originalFee = 100 - originalFee
						 * adjustedFee = (adjusted / price) * (rate * (price * (1 - price))^exponent)
						 * final = adjusted + adjustedFee
						 *
						 * The exact expected numbers for this price are pinned in the case table:
						 * originalFee = expectedForPrice.originalFee
						 * adjusted = expectedForPrice.adjusted
						 * adjustedFee = expectedForPrice.adjustedFee
						 * final = expectedForPrice.final
						 */
						const adjusted = adjustBuyAmountForFees(
							amount,
							price,
							amount,
							rate,
							exponent,
							0,
						);
						const originalFee = calculatePlatformFee(amount, price, rate, exponent);
						const adjustedFee = calculatePlatformFee(adjusted, price, rate, exponent);
						expect(roundTo(originalFee)).toBe(expectedForPrice.originalFee);
						expect(roundTo(adjusted)).toBe(expectedForPrice.adjusted);
						expect(roundTo(adjustedFee)).toBe(expectedForPrice.adjustedFee);
						expect(roundTo(adjusted + adjustedFee)).toBe(expectedForPrice.final);
					});
				}
			});
		}
	});
});
