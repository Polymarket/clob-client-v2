import { type RoundConfig, Side } from "../../types/index.js";
import { decimalPlaces, roundDown, roundUp } from "../../utilities.js";

/**
 * Maximum decimal places the CLOB API accepts for market-order taker amounts.
 *
 * The API enforces: maker ≤ 2 decimals, taker ≤ 4 decimals.
 * ROUNDING_CONFIG may produce 5 or 6 decimals for fine tick-sizes
 * (e.g. tick 0.001 → amount: 5, tick 0.0001 → amount: 6). Amounts with
 * more than 4 taker decimals are rejected server-side:
 *   "invalid amounts, the market bu…"
 * Cap rawTakerAmt here before parseUnits so orders always reach the API
 * in an acceptable form regardless of tick size.
 *
 * See: https://github.com/Polymarket/clob-client-v2/issues/87
 */
const API_TAKER_MAX_DECIMALS = 4;

export const getMarketOrderRawAmounts = (
	side: Side,
	amount: number,
	price: number,
	roundConfig: RoundConfig,
): { side: Side; rawMakerAmt: number; rawTakerAmt: number } => {
	// force 2 decimal places on price
	const rawPrice = roundDown(price, roundConfig.price);

	if (side === Side.BUY) {
		const rawMakerAmt = roundDown(amount, roundConfig.size);
		let rawTakerAmt = rawMakerAmt / rawPrice;
		if (decimalPlaces(rawTakerAmt) > API_TAKER_MAX_DECIMALS) {
			rawTakerAmt = roundUp(rawTakerAmt, API_TAKER_MAX_DECIMALS + 4);
			if (decimalPlaces(rawTakerAmt) > API_TAKER_MAX_DECIMALS) {
				rawTakerAmt = roundDown(rawTakerAmt, API_TAKER_MAX_DECIMALS);
			}
		}
		return { side: Side.BUY, rawMakerAmt, rawTakerAmt };
	} else {
		const rawMakerAmt = roundDown(amount, roundConfig.size);
		let rawTakerAmt = rawMakerAmt * rawPrice;
		if (decimalPlaces(rawTakerAmt) > API_TAKER_MAX_DECIMALS) {
			rawTakerAmt = roundUp(rawTakerAmt, API_TAKER_MAX_DECIMALS + 4);
			if (decimalPlaces(rawTakerAmt) > API_TAKER_MAX_DECIMALS) {
				rawTakerAmt = roundDown(rawTakerAmt, API_TAKER_MAX_DECIMALS);
			}
		}
		return { side: Side.SELL, rawMakerAmt, rawTakerAmt };
	}
};
