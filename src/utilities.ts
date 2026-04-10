import { createHash } from "node:crypto";
import { Big } from "ts-big-lib";
import type { OrderBookSummary, TickSize } from "./types/index.js";

export const roundNormal = (num: number, decimals: number): number => {
	if (decimalPlaces(num) <= decimals) {
		return num;
	}
	return Math.round((num + Number.EPSILON) * 10 ** decimals) / 10 ** decimals;
};

export const roundDown = (num: number, decimals: number): number => {
	if (decimalPlaces(num) <= decimals) {
		return num;
	}
	return Math.floor(num * 10 ** decimals) / 10 ** decimals;
};

export const roundUp = (num: number, decimals: number): number => {
	if (decimalPlaces(num) <= decimals) {
		return num;
	}
	return Math.ceil(num * 10 ** decimals) / 10 ** decimals;
};

export const decimalPlaces = (num: number): number => {
	if (Number.isInteger(num)) {
		return 0;
	}

	const arr = num.toString().split(".");
	if (arr.length <= 1) {
		return 0;
	}

	return arr[1].length;
};

/**
 * Calculates the hash for the given orderbook
 * @param orderbook
 * @returns
 */
export const generateOrderBookSummaryHash = (orderbook: OrderBookSummary): string => {
	orderbook.hash = "";
	const hash = createHash("sha1").update(JSON.stringify(orderbook)).digest("hex");
	orderbook.hash = hash;
	return hash;
};

export const isTickSizeSmaller = (a: TickSize, b: TickSize): boolean => {
	return Big(a).lt(Big(b));
};

export const priceValid = (price: number, tickSize: TickSize): boolean => {
	const p = Big(String(price));
	const tick = Big(tickSize);
	return p.gte(tick) && p.lte(Big("1").minus(tick));
};
