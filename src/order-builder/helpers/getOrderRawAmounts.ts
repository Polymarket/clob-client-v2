import { type RoundConfig, Side } from "../../types/index.js";
import { decimalPlaces, roundDown, roundNormal, roundUp } from "../../utilities.js";

export const getOrderRawAmounts = (
	side: Side,
	size: number,
	price: number,
	roundConfig: RoundConfig,
): { side: Side; rawMakerAmt: number; rawTakerAmt: number } => {
	const rawPrice = roundNormal(price, roundConfig.price);

	if (side === Side.BUY) {
		// force 2 decimals places
		const rawTakerAmt = roundDown(size, roundConfig.size);

		let rawMakerAmt = rawTakerAmt * rawPrice;
		if (decimalPlaces(rawMakerAmt) > roundConfig.amount) {
			rawMakerAmt = roundUp(rawMakerAmt, roundConfig.amount + 4);
			if (decimalPlaces(rawMakerAmt) > roundConfig.amount) {
				rawMakerAmt = roundDown(rawMakerAmt, roundConfig.amount);
			}
		}

		return {
			side: Side.BUY,
			rawMakerAmt,
			rawTakerAmt,
		};
	} else {
		const rawMakerAmt = roundDown(size, roundConfig.size);

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
