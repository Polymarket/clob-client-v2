import type { SignatureTypeV2, SignedOrderV2 } from "../order-utils";

import type { OrderType, Side } from "./clob";

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
		readonly expiration: string;
		readonly side: Side; // string
		readonly signatureType: SignatureTypeV2;
		readonly timestamp: string;
		readonly metadata: string;
		readonly builder: string;
		readonly signature: string;
	};
	readonly owner: string;
	readonly orderType: T;
	readonly deferExec: boolean;
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
	 * Timestamp after which the order is expired.
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
}
