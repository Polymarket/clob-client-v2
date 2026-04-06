import { describe, expect, it } from "vitest";
import { adjustBuyAmountForFees } from "../../src/client.js";

// platform_fee = C * rate * (p*(1-p))^exp, where C = amountUSD / price
const calculatePlatformFee = (
	amountUSD: number,
	price: number,
	feeRate: number,
	feeExponent: number,
): number => {
	const platformFeeRate = feeRate * (price * (1 - price)) ** feeExponent;
	return (amountUSD / price) * platformFeeRate;
};

// builder_fee = amountUSD * builderTakerFeeRate (flat % on notional)
const calculateBuilderFee = (amountUSD: number, builderTakerFeeRate: number): number => {
	return amountUSD * builderTakerFeeRate;
};

describe("fee calculations", () => {
	// rate=0.25, exp=2, C=100 contracts
	describe("platform fee (builder fee = 0)", () => {
		const feeRate = 0.25;
		const feeExponent = 2;
		const contracts = 100;

		it("price=0.5 → fee = 1.5625", () => {
			const price = 0.5;
			expect(
				calculatePlatformFee(contracts * price, price, feeRate, feeExponent),
			).toBeCloseTo(1.5625, 6);
		});

		it("price=0.3 → fee = 1.1025", () => {
			const price = 0.3;
			expect(
				calculatePlatformFee(contracts * price, price, feeRate, feeExponent),
			).toBeCloseTo(1.1025, 6);
		});

		it("price=0.1 → fee = 0.2025", () => {
			const price = 0.1;
			expect(
				calculatePlatformFee(contracts * price, price, feeRate, feeExponent),
			).toBeCloseTo(0.2025, 6);
		});

		it("price=0.05 → fee = 0.05640625", () => {
			const price = 0.05;
			expect(
				calculatePlatformFee(contracts * price, price, feeRate, feeExponent),
			).toBeCloseTo(0.05640625, 6);
		});

		it("price=0.01 → fee = 0.00245025", () => {
			const price = 0.01;
			expect(
				calculatePlatformFee(contracts * price, price, feeRate, feeExponent),
			).toBeCloseTo(0.00245025, 6);
		});

		it("price=0.7 → fee = 1.1025 (symmetric with 0.3)", () => {
			const price = 0.7;
			expect(
				calculatePlatformFee(contracts * price, price, feeRate, feeExponent),
			).toBeCloseTo(1.1025, 6);
		});

		it("price=0.9 → fee = 0.2025 (symmetric with 0.1)", () => {
			const price = 0.9;
			expect(
				calculatePlatformFee(contracts * price, price, feeRate, feeExponent),
			).toBeCloseTo(0.2025, 6);
		});

		it("price=0.95 → fee = 0.05640625 (symmetric with 0.05)", () => {
			const price = 0.95;
			expect(
				calculatePlatformFee(contracts * price, price, feeRate, feeExponent),
			).toBeCloseTo(0.05640625, 6);
		});

		it("price=0.99 → fee = 0.00245025 (symmetric with 0.01)", () => {
			const price = 0.99;
			expect(
				calculatePlatformFee(contracts * price, price, feeRate, feeExponent),
			).toBeCloseTo(0.00245025, 6);
		});

		it("price=0.5, C=125.5 → fee = 1.9609375", () => {
			const price = 0.5;
			const c = 125.5;
			expect(calculatePlatformFee(c * price, price, feeRate, feeExponent)).toBeCloseTo(
				1.9609375,
				6,
			);
		});
	});

	// builderTakerFeeRate is in decimal (bps / 10000), e.g. 100 bps → 0.01
	describe("builder fee (platform fee = 0)", () => {
		it("1% on 100 tokens at 50c → fee = 0.5", () => {
			const price = 0.5;
			const contracts = 100;
			const builderTakerFeeRate = 0.01; // 100 bps
			expect(calculateBuilderFee(contracts * price, builderTakerFeeRate)).toBeCloseTo(0.5, 6);
		});

		it("5% on 200 tokens at 75c → fee = 7.5", () => {
			const price = 0.75;
			const contracts = 200;
			const builderTakerFeeRate = 0.05; // 500 bps
			expect(calculateBuilderFee(contracts * price, builderTakerFeeRate)).toBeCloseTo(7.5, 6);
		});
	});

	// Combined: total fee = platform fee + builder fee (different bases)
	describe("combined platform + builder fee", () => {
		it("matches sum of separate fees", () => {
			// platform: rate=0.25, exp=2, price=0.5, C=100 → platform fee = 1.5625
			// builder: 1% (100 bps), price=0.5, C=100 → builder fee = 0.5
			const price = 0.5;
			const contracts = 100;
			const feeRate = 0.25;
			const feeExponent = 2;
			const builderTakerFeeRate = 0.01;
			const amountUSD = contracts * price;

			const platformFee = calculatePlatformFee(amountUSD, price, feeRate, feeExponent);
			const builderFee = calculateBuilderFee(amountUSD, builderTakerFeeRate);

			expect(platformFee).toBeCloseTo(1.5625, 6);
			expect(builderFee).toBeCloseTo(0.5, 6);
			expect(platformFee + builderFee).toBeCloseTo(2.0625, 6);
		});
	});

	describe("adjustBuyAmountForFees", () => {
		const feeRate = 0.25;
		const feeExponent = 2;

		describe("no adjustment when balance covers amount + fees", () => {
			it("exact balance equal to amount (no fees) → no adjustment", () => {
				// feeRate=0, builderRate=0: totalCost = amount, balance = amount → no adjustment
				const amount = 50;
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

			it("balance exactly equal to totalCost → no adjustment (boundary: not strictly less)", () => {
				const amount = 50;
				const price = 0.5;
				const platformFee = calculatePlatformFee(amount, price, feeRate, feeExponent);
				const totalCost = amount + platformFee;
				// balance === totalCost: condition is `balance <= totalCost`, so adjustment fires
				// This checks the boundary is `<=`, not `<`
				const result = adjustBuyAmountForFees(
					amount,
					price,
					totalCost,
					feeRate,
					feeExponent,
					0,
				);
				// balance === totalCost triggers adjustment
				const platformFeeRate = feeRate * (price * (1 - price)) ** feeExponent;
				const expected = totalCost / (1 + platformFeeRate / price);
				expect(result).toBeCloseTo(expected, 10);
			});
		});

		describe("adjustment applied when balance is insufficient", () => {
			it("platform fee only: adjusted amount + fee = original amount", () => {
				const amount = 50;
				const price = 0.5;
				// balance = amount (no room for fees)
				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					amount,
					feeRate,
					feeExponent,
					0,
				);
				const fee = calculatePlatformFee(adjusted, price, feeRate, feeExponent);
				expect(adjusted + fee).toBeCloseTo(amount, 10);
			});

			it("builder fee only: adjusted amount + fee = original amount", () => {
				const amount = 50;
				const price = 0.5;
				const builderTakerFeeRate = 0.01;
				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					amount,
					0,
					0,
					builderTakerFeeRate,
				);
				const fee = calculateBuilderFee(adjusted, builderTakerFeeRate);
				expect(adjusted + fee).toBeCloseTo(amount, 10);
			});

			it("platform + builder fee: adjusted amount + both fees = original amount", () => {
				const amount = 50;
				const price = 0.5;
				const builderTakerFeeRate = 0.01;
				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					amount,
					feeRate,
					feeExponent,
					builderTakerFeeRate,
				);
				const platformFee = calculatePlatformFee(adjusted, price, feeRate, feeExponent);
				const builderFee = calculateBuilderFee(adjusted, builderTakerFeeRate);
				expect(adjusted + platformFee + builderFee).toBeCloseTo(amount, 10);
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
				expect(adjusted).toBeLessThan(amount);
			});

			it("price=0.3, platform+builder: adjusted + fees = amount", () => {
				const amount = 30;
				const price = 0.3;
				const builderTakerFeeRate = 0.02;
				const adjusted = adjustBuyAmountForFees(
					amount,
					price,
					amount,
					feeRate,
					feeExponent,
					builderTakerFeeRate,
				);
				const platformFee = calculatePlatformFee(adjusted, price, feeRate, feeExponent);
				const builderFee = calculateBuilderFee(adjusted, builderTakerFeeRate);
				expect(adjusted + platformFee + builderFee).toBeCloseTo(amount, 10);
			});
		});
	});
});
