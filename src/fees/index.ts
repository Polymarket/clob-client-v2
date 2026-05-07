const MIN_FEE_SLIPPAGE_PERCENTAGE = 1;
const MAX_FEE_SLIPPAGE_PERCENTAGE = 100;

export function validateFeeSlippage(feeSlippage: number): void {
	if (
		!Number.isFinite(feeSlippage) ||
		feeSlippage < 0 ||
		feeSlippage > MAX_FEE_SLIPPAGE_PERCENTAGE ||
		(feeSlippage > 0 && feeSlippage < MIN_FEE_SLIPPAGE_PERCENTAGE)
	) {
		throw new Error("feeSlippage must be 0 or a percentage between 1 and 100");
	}
}

export function adjustBuyAmountForFees(
	amount: number,
	price: number,
	userUSDCBalance: number,
	feeRate: number,
	feeExponent: number,
	builderTakerFeeRate: number,
	feeSlippage = 0,
): number {
	validateFeeSlippage(feeSlippage);
	const platformFeeRate = feeRate * (price * (1 - price)) ** feeExponent;
	const effectivePlatformFeeRate = platformFeeRate * (1 + feeSlippage / 100);
	const feeBaseAmount = Math.min(amount, userUSDCBalance);
	const platformFee = (feeBaseAmount / price) * effectivePlatformFeeRate;
	const builderFee = feeBaseAmount * builderTakerFeeRate;
	const totalCost = amount + platformFee + builderFee;

	if (userUSDCBalance <= totalCost) {
		return Math.max(userUSDCBalance - platformFee - builderFee, 0);
	}

	return amount;
}
