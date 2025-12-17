import { OrderSummary, OrderType } from "../../types";

/**
 * calculateBuyMarketPrice calculates the market price to buy a $$ amount
 * @param positions
 * @param amountToMatch worth to buy
 * @returns
 */
export const calculateBuyMarketPrice = (
	positions: OrderSummary[],
	amountToMatch: number,
	orderType: OrderType,
) => {
	if (!positions.length) {
		throw new Error("no match");
	}
	let sum = 0;
	/*
    Asks:
    [
        { price: '0.6', size: '100' },
        { price: '0.55', size: '100' },
        { price: '0.5', size: '100' }
    ]
    So, if the amount to match is $150 that will be reached at first position so price will be 0.6
    */
	for (let i = positions.length - 1; i >= 0; i--) {
		const p = positions[i];
		sum += parseFloat(p.size) * parseFloat(p.price);
		if (sum >= amountToMatch) {
			return parseFloat(p.price);
		}
	}
	if (orderType === OrderType.FOK) {
		throw new Error("no match");
	}
	return parseFloat(positions[0].price);
};
