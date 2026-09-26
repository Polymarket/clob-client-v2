import { type RoundConfig, Side } from "../../types/index.js";
import { decimalPlaces, roundDown, roundUp } from "../../utilities.js";

/** API max precision for market-order taker amounts */
const MAX_TAKER_DECIMALS = 4;

export const getMarketOrderRawAmounts = (
	side: Side,
	amount: number,
	price: number,
	roundConfig: RoundConfig,
): { side: Side; rawMakerAmt: number; rawTakerAmt: number } => {
	// force 2 decimals places
	const rawPrice = roundDown(price, roundConfig.price);

	if (side === Side.BUY) {
		const rawMakerAmt = roundDown(amount, roundConfig.size);
		let rawTakerAmt = rawMakerAmt / rawPrice;
		if (decimalPlaces(rawTakerAmt) > roundConfig.amount) {
			rawTakerAmt = roundUp(rawTakerAmt, roundConfig.amount + 4);
			if (decimalPlaces(rawTakerAmt) > roundConfig.amount) {
				rawTakerAmt = roundDown(rawTakerAmt, roundConfig.amount);
			}
		}
		// Cap taker amount at API max precision (4 decimals)
		if (decimalPlaces(rawTakerAmt) > MAX_TAKER_DECIMALS) {
			rawTakerAmt = roundDown(rawTakerAmt, MAX_TAKER_DECIMALS);
		}
		return {
			side: Side.BUY,
			rawMakerAmt,
			rawTakerAmt,
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
		// Cap taker amount at API max precision (4 decimals)
		if (decimalPlaces(rawTakerAmt) > MAX_TAKER_DECIMALS) {
			rawTakerAmt = roundDown(rawTakerAmt, MAX_TAKER_DECIMALS);
		}
		return {
			side: Side.SELL,
			rawMakerAmt,
			rawTakerAmt,
		};
	}
};