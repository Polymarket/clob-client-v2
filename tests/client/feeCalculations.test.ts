import { describe, expect, it } from "vitest";

// platform_fee = C * rate * (p*(1-p))^exp, where C = amountUSD / price (already in USD)
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
	// Matches https://github.com/Polymarket/clob-v2/blob/74851ea2dd5592cc7efb97deab0c6c19682200a4/packages/fees/pkg/app/platform_fee_test.go
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

	// Matches https://github.com/Polymarket/clob-v2/blob/74851ea2dd5592cc7efb97deab0c6c19682200a4/packages/fees/pkg/app/builder_fee_test.go#L31
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

	// fee-adjusted amount: effective + fees = budget
	// effective = budget / (1 + platformFeeRate/price + builderTakerFeeRate)
	describe("fee-adjusted effective amount", () => {
		const calculateEffective = (
			budget: number,
			price: number,
			feeRate: number,
			feeExponent: number,
			builderTakerFeeRate = 0,
		): number => {
			const platformFeeRate = feeRate * (price * (1 - price)) ** feeExponent;
			return budget / (1 + platformFeeRate / price + builderTakerFeeRate);
		};

		it("platform fee only: effective + platformFee = budget", () => {
			const budget = 50;
			const price = 0.5;
			const feeRate = 0.25;
			const feeExponent = 2;

			const effective = calculateEffective(budget, price, feeRate, feeExponent);
			const platformFee = calculatePlatformFee(effective, price, feeRate, feeExponent);

			expect(effective + platformFee).toBeCloseTo(budget, 10);
		});

		it("builder fee only: effective + builderFee = budget", () => {
			const budget = 50;
			const price = 0.5;
			const builderTakerFeeRate = 0.01;

			const effective = calculateEffective(budget, price, 0, 0, builderTakerFeeRate);
			const builderFee = calculateBuilderFee(effective, builderTakerFeeRate);

			expect(effective + builderFee).toBeCloseTo(budget, 10);
		});

		it("combined: effective + platformFee + builderFee = budget", () => {
			const budget = 50;
			const price = 0.5;
			const feeRate = 0.25;
			const feeExponent = 2;
			const builderTakerFeeRate = 0.01;

			const effective = calculateEffective(
				budget,
				price,
				feeRate,
				feeExponent,
				builderTakerFeeRate,
			);
			const platformFee = calculatePlatformFee(effective, price, feeRate, feeExponent);
			const builderFee = calculateBuilderFee(effective, builderTakerFeeRate);

			expect(effective + platformFee + builderFee).toBeCloseTo(budget, 10);
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
});
