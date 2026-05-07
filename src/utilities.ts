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
export const generateOrderBookSummaryHash = async (
	orderbook: OrderBookSummary,
): Promise<string> => {
	orderbook.hash = "";
	const data = new TextEncoder().encode(JSON.stringify(orderbook));
	const hashBuffer = await globalThis.crypto.subtle.digest("SHA-1", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
	orderbook.hash = hash;
	return hash;
};

export const isTickSizeSmaller = (a: TickSize, b: TickSize): boolean => {
	return parseFloat(a) < parseFloat(b);
};

export const priceValid = (price: number, tickSize: TickSize): boolean => {
	return price >= parseFloat(tickSize) && price <= 1 - parseFloat(tickSize);
};
