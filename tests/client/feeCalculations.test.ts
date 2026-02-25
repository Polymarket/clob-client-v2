import { describe, expect, it } from "vitest";

// Formula from ClobClient._calculateTotalFeeRate
const calculateTotalFeeRate = (
	price: number,
	feeRate: number,
	feeExponent: number,
	builderTakerFeeRate = 0,
): number => {
	// platform_fee = C * rate * (p*(1-p))^exp
	const platformFeeRate = feeRate * (price * (1 - price)) ** feeExponent;
	// builder_fee is flat % on notional, no exponent
	return platformFeeRate + builderTakerFeeRate;
};

describe("fee calculations", () => {
	// Matches https://github.com/Polymarket/clob-v2/blob/74851ea2dd5592cc7efb97deab0c6c19682200a4/packages/fees/pkg/app/platform_fee_test.go#L11
	// rate=0.25, exp=2, C=100 contracts
	// expected = Go rawFee * price (cash fee in collateral)
	describe("platform fee (builder fee = 0)", () => {
		const feeRate = 0.25;
		const feeExponent = 2;
		const contracts = 100;

		it("price=0.5 → cash fee = 0.78125", () => {
			const price = 0.5;
			const amountUSD = contracts * price;
			const fee = amountUSD * calculateTotalFeeRate(price, feeRate, feeExponent);
			expect(fee).toBeCloseTo(0.78125, 6);
		});

		it("price=0.3 → cash fee = 0.33075", () => {
			const price = 0.3;
			const amountUSD = contracts * price;
			const fee = amountUSD * calculateTotalFeeRate(price, feeRate, feeExponent);
			expect(fee).toBeCloseTo(0.33075, 6);
		});

		it("price=0.1 → cash fee = 0.02025", () => {
			const price = 0.1;
			const amountUSD = contracts * price;
			const fee = amountUSD * calculateTotalFeeRate(price, feeRate, feeExponent);
			expect(fee).toBeCloseTo(0.02025, 6);
		});

		it("price=0.7 → cash fee = 0.77175 (symmetric with 0.3)", () => {
			const price = 0.7;
			const amountUSD = contracts * price;
			const fee = amountUSD * calculateTotalFeeRate(price, feeRate, feeExponent);
			expect(fee).toBeCloseTo(0.77175, 6);
		});

		it("price=0.9 → cash fee = 0.18225 (symmetric with 0.1)", () => {
			const price = 0.9;
			const amountUSD = contracts * price;
			const fee = amountUSD * calculateTotalFeeRate(price, feeRate, feeExponent);
			expect(fee).toBeCloseTo(0.18225, 6);
		});
	});

	// Matches https://github.com/Polymarket/clob-v2/blob/74851ea2dd5592cc7efb97deab0c6c19682200a4/packages/fees/pkg/app/builder_fee_test.go#L31
	// builderTakerFeeRate is in decimal (bps / 10000), e.g. 100 bps → 0.01
	describe("builder fee (platform fee = 0)", () => {
		it("1% on 100 tokens at 50c → fee = 0.5", () => {
			const price = 0.5;
			const contracts = 100;
			const builderTakerFeeRate = 0.01; // 100 bps
			const amountUSD = contracts * price;
			const fee = amountUSD * calculateTotalFeeRate(price, 0, 0, builderTakerFeeRate);
			expect(fee).toBeCloseTo(0.5, 6);
		});

		it("5% on 200 tokens at 75c → fee = 7.5", () => {
			const price = 0.75;
			const contracts = 200;
			const builderTakerFeeRate = 0.05; // 500 bps
			const amountUSD = contracts * price;
			const fee = amountUSD * calculateTotalFeeRate(price, 0, 0, builderTakerFeeRate);
			expect(fee).toBeCloseTo(7.5, 6);
		});
	});

	// Combined: total fee = platform fee + builder fee
	describe("combined platform + builder fee", () => {
		it("matches sum of separate fees", () => {
			// platform: rate=0.25, exp=2, price=0.5, C=100 → platform fee = 0.78125
			// builder: 1% (100 bps), price=0.5, C=100 → builder fee = 0.5
			const price = 0.5;
			const contracts = 100;
			const feeRate = 0.25;
			const feeExponent = 2;
			const builderTakerFeeRate = 0.01;
			const amountUSD = contracts * price;

			const platformFee = amountUSD * calculateTotalFeeRate(price, feeRate, feeExponent, 0);
			const builderFee = amountUSD * calculateTotalFeeRate(price, 0, 0, builderTakerFeeRate);
			const combinedFee =
				amountUSD * calculateTotalFeeRate(price, feeRate, feeExponent, builderTakerFeeRate);

			expect(platformFee).toBeCloseTo(0.78125, 6);
			expect(builderFee).toBeCloseTo(0.5, 6);
			expect(combinedFee).toBeCloseTo(platformFee + builderFee, 10);
		});
	});
});
