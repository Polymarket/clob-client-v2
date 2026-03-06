import { type OrderSummary, OrderType } from "../../types/index.js";

/**
 * calculateSellMarketPrice calculates the market price to sell a shares
 * @param positions
 * @param amountToMatch sells to share
 * @returns
 */
export const calculateSellMarketPrice = (
	positions: OrderSummary[],
	amountToMatch: number,
	orderType: OrderType,
) => {
	if (!positions.length) {
		throw new Error("no match");
	}
	let sum = 0;
	/*
    Bids:
    [
        { price: '0.4', size: '100' },
        { price: '0.45', size: '100' },
        { price: '0.5', size: '100' }
    ]
    So, if the amount to match is 300 that will be reached at the first position so price will be 0.4
    */
	for (let i = positions.length - 1; i >= 0; i--) {
		const p = positions[i];
		sum += parseFloat(p.size);
		if (sum >= amountToMatch) {
			return parseFloat(p.price);
		}
	}
	if (orderType === OrderType.FOK) {
		throw new Error("no match");
	}
	return parseFloat(positions[0].price);
};
