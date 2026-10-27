import { formatUnits, parseUnits } from "viem";
import { COLLATERAL_TOKEN_DECIMALS } from "../../config.js";
import { type RoundConfig, Side } from "../../types/index.js";
import { decimalPlaces, roundDown, roundUp } from "../../utilities.js";

/**
 * Smallest collateral amount, in base units, that a market BUY may spend.
 * It is 0.99 USDC, not 1 USDC, because an exact-price spend of a 1 USDC amount
 * can land just below 1 USDC.
 */
const MIN_MARKET_BUY_AMOUNT = 990_000n;

const gcd = (a: bigint, b: bigint): bigint => {
	let x = a;
	let y = b;
	while (y !== 0n) {
		[x, y] = [y, x % y];
	}
	return x;
};

const toBaseUnits = (value: number, decimals: number): bigint =>
	parseUnits(value.toFixed(decimals), COLLATERAL_TOKEN_DECIMALS);

const formatBaseUnits = (value: bigint): string => formatUnits(value, COLLATERAL_TOKEN_DECIMALS);

/**
 * Returns the largest collateral and share amounts within `amount` whose ratio
 * is exactly `price`. Both amounts have at most `roundConfig.amount` decimals.
 *
 * The exchange reads the order price as collateral / shares, so the pair must
 * encode `price` exactly. Both amounts then move in fixed steps: the smallest
 * share amount that meets the precision at this price, and the collateral it
 * costs.
 *
 * The raw amounts are numbers parsed from exact decimal strings, so
 * `parseUnits(raw.toString(), 6)` gives back the exact base units.
 */
const getMarketBuyRawAmounts = (
	amount: number,
	price: number,
	roundConfig: RoundConfig,
): { rawMakerAmt: number; rawTakerAmt: number } => {
	const scale = 10n ** BigInt(COLLATERAL_TOKEN_DECIMALS);
	const unit = 10n ** BigInt(COLLATERAL_TOKEN_DECIMALS - roundConfig.amount);
	const budget = toBaseUnits(roundDown(amount, roundConfig.amount), roundConfig.amount);
	const scaledPrice = toBaseUnits(price, roundConfig.price);
	if (scaledPrice <= 0n) {
		throw new Error(`invalid price (${price})`);
	}

	// price = num / den in lowest terms.
	const priceGcd = gcd(scaledPrice, scale);
	const num = scaledPrice / priceGcd;
	const den = scale / priceGcd;

	// Shares must be a whole number of units, and so must
	// collateral = shares * num / den.
	const minShares = (den * unit) / gcd(den * unit, num);
	const shareStep = (minShares / gcd(minShares, unit)) * unit;
	const collateralStep = (shareStep * num) / den;

	const steps = budget / collateralStep;
	const collateral = steps * collateralStep;

	if (collateral < MIN_MARKET_BUY_AMOUNT) {
		const minimumSteps = (MIN_MARKET_BUY_AMOUNT + collateralStep - 1n) / collateralStep;
		throw new Error(
			`BUY amount ${formatBaseUnits(budget)} cannot be spent exactly at price ${formatBaseUnits(scaledPrice)}. At this price the amount is used in steps of ${formatBaseUnits(collateralStep)}; use at least ${formatBaseUnits(minimumSteps * collateralStep)}.`,
		);
	}

	return {
		rawMakerAmt: Number(formatBaseUnits(collateral)),
		rawTakerAmt: Number(formatBaseUnits(steps * shareStep)),
	};
};

export const getMarketOrderRawAmounts = (
	side: Side,
	amount: number,
	price: number,
	roundConfig: RoundConfig,
): { side: Side; rawMakerAmt: number; rawTakerAmt: number } => {
	// force 2 decimals places
	const rawPrice = roundDown(price, roundConfig.price);

	if (side === Side.BUY) {
		return {
			side: Side.BUY,
			...getMarketBuyRawAmounts(amount, rawPrice, roundConfig),
		};
	} else {
		const rawMakerAmt = roundDown(amount, roundConfig.size);
		let rawTakerAmt = rawMakerAmt * rawPrice;
		if (decimalPlaces(rawTakerAmt) > roundConfig.amount) {
			rawTakerAmt = roundUp(rawTakerAmt, roundConfig.amount + 4);
			if (decimalPlaces(rawTakerAmt) > roundConfig.amount) {
				rawTakerAmt = roundDown(rawTakerAmt, roundConfig.amount);
			}
		}

		return {
			side: Side.SELL,
			rawMakerAmt,
			rawTakerAmt,
		};
	}
};
