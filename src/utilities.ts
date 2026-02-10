import { createHash } from "node:crypto";
import type { SignedOrderV2 } from "./order-utils";
import type { SignedOrderV1 } from "./order-utils/model/orderDataV1";
import type { NewOrderV1, NewOrderV2, OrderBookSummary, OrderType, TickSize } from "./types";

export function orderToJsonV1<T extends OrderType>(
	order: SignedOrderV1,
	owner: string,
	orderType: T,
	deferExec = false,
): NewOrderV1<T> {
	return {
		deferExec,
		order: {
			salt: parseInt(order.salt, 10),
			maker: order.maker,
			signer: order.signer,
			taker: order.taker,
			tokenId: order.tokenId,
			makerAmount: order.makerAmount,
			takerAmount: order.takerAmount,
			side: order.side,
			expiration: order.expiration,
			nonce: order.nonce,
			feeRateBps: order.feeRateBps,
			signatureType: order.signatureType,
			signature: order.signature,
		},
		owner,
		orderType,
	} as NewOrderV1<T>;
}

export function orderToJsonV2<T extends OrderType>(
	order: SignedOrderV2,
	owner: string,
	orderType: T,
	deferExec = false,
): NewOrderV2<T> {
	let side: string;
	// TODO: use actual enum string
	if (order.side === 0) {
		side = "BUY";
	} else {
		side = "SELL";
	}

	return {
		deferExec,
		order: {
			salt: parseInt(order.salt, 10),
			maker: order.maker,
			signer: order.signer,
			taker: order.taker,
			tokenId: order.tokenId,
			makerAmount: order.makerAmount,
			takerAmount: order.takerAmount,
			side: side,
			expiration: order.expiration,
			signatureType: order.signatureType,
			timestamp: order.timestamp,
			metadata: order.metadata,
			builder: order.builder,
			signature: order.signature,
		},
		owner,
		orderType,
	} as NewOrderV2<T>;
}

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
	return parseFloat(a) < parseFloat(b);
};

export const priceValid = (price: number, tickSize: TickSize): boolean => {
	return price >= parseFloat(tickSize) && price <= 1 - parseFloat(tickSize);
};
