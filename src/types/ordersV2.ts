import type { SignatureTypeV2, SignedOrderV2 } from "../order-utils/index.js";

import type { OrderType, Side } from "./clob.js";

export function orderToJsonV2<T extends OrderType>(
	order: SignedOrderV2,
	owner: string,
	orderType: T,
	postOnly = false,
	deferExec = false,
): NewOrderV2<T> {
	return {
		deferExec,
		postOnly,
		order: {
			salt: parseInt(order.salt, 10),
			maker: order.maker,
			signer: order.signer,
			taker: order.taker,
			tokenId: order.tokenId,
			makerAmount: order.makerAmount,
			takerAmount: order.takerAmount,
			side: order.side,
			signatureType: order.signatureType,
			timestamp: order.timestamp,
			expiration: order.expiration,
			metadata: order.metadata,
			builder: order.builder,
			signature: order.signature,
		},
		owner,
		orderType,
	} as NewOrderV2<T>;
}

export interface PostOrdersV2Args {
	order: SignedOrderV2;
	orderType: OrderType;
}

export interface NewOrderV2<T extends OrderType> {
	readonly order: {
		readonly salt: number;
		readonly maker: string;
		readonly signer: string;
		readonly taker: string;
		readonly tokenId: string;
		readonly makerAmount: string;
		readonly takerAmount: string;
		readonly side: string;
		readonly signatureType: SignatureTypeV2;
		readonly timestamp: string;
		readonly expiration: string;
		readonly metadata: string;
		readonly builder: string;
		readonly signature: string;
	};
	readonly owner: string;
	readonly orderType: T;
	readonly deferExec: boolean;
	readonly postOnly: boolean;
}

// Simplified order for users
export interface UserOrderV2 {
	/**
	 * TokenID of the Conditional token asset being traded
	 */
	tokenID: string;

	/**
	 * Price used to create the order
	 */
	price: number;

	/**
	 * Size in terms of the ConditionalToken
	 */
	size: number;

	/**
	 * Side of the order
	 */
	side: Side;

	/**
	 * Metadata (bytes32)
	 */
	metadata?: string;

	/**
	 * Builder code (bytes32)
	 */
	builderCode?: string;

	/**
	 * Expiration timestamp (unix seconds). Defaults to 0 (no expiration).
	 */
	expiration?: number;
}

// Simplified market order for users
export interface UserMarketOrderV2 {
	/**
	 * TokenID of the Conditional token asset being traded
	 */
	tokenID: string;

	/**
	 * Price used to create the order
	 * If it is not present the market price will be used.
	 */
	price?: number;

	/**
	 * BUY orders: $$$ Amount to buy
	 * SELL orders: Shares to sell
	 */
	amount: number;

	/**
	 * Side of the order
	 */
	side: Side;

	/**
	 * Specifies the type of order execution:
	 * - FOK (Fill or Kill): The order must be filled entirely or not at all.
	 * - FAK (Fill and Kill): The order can be partially filled, and any unfilled portion is canceled.
	 */
	orderType?: OrderType.FOK | OrderType.FAK;

	/**
	 * User's USDC balance. If provided and sufficient to cover amount + fees, the order
	 * amount is used as-is. Otherwise fees are deducted from the amount.
	 * If this field is left empty, the default flow is to use the order amount as-is
	 */
	userUSDCBalance?: number;

	/**
	 * Metadata (bytes32)
	 */
	metadata?: string;

	/**
	 * Builder code (bytes32)
	 */
	builderCode?: string;
}
