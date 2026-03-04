import type { SignatureTypeV1, SignedOrderV1 } from "../order-utils/index.js";

import type { OrderType, Side } from "./clob.js";

export interface PostOrdersV1Args {
	order: SignedOrderV1;
	orderType: OrderType;
}

export interface NewOrderV1<T extends OrderType> {
	readonly order: {
		readonly salt: number;
		readonly maker: string;
		readonly signer: string;
		readonly taker: string;
		readonly tokenId: string;
		readonly makerAmount: string;
		readonly takerAmount: string;
		readonly expiration: string;
		readonly nonce: string;
		readonly feeRateBps: string;
		readonly side: string;
		readonly signatureType: SignatureTypeV1;
		readonly signature: string;
	};
	readonly owner: string;
	readonly orderType: T;
	readonly deferExec: boolean;
}

// Simplified order for users
export interface UserOrderV1 {
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
	 * Fee rate, in basis points, charged to the order maker, charged on proceeds
	 */
	feeRateBps?: number;

	/**
	 * Nonce used for onchain cancellations
	 */
	nonce?: number;

	/**
	 * Timestamp after which the order is expired.
	 */
	expiration?: number;

	/**
	 * Address of the order taker. The zero address is used to indicate a public order
	 */
	taker?: string;

	/**
	 * Builder code (bytes32)
	 */
	builderCode?: string;
}

// Simplified market order for users
export interface UserMarketOrderV1 {
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
	 * Fee rate, in basis points, charged to the order maker, charged on proceeds
	 */
	feeRateBps?: number;

	/**
	 * Nonce used for onchain cancellations
	 */
	nonce?: number;

	/**
	 * Address of the order taker. The zero address is used to indicate a public order
	 */
	taker?: string;

	/**
	 * Specifies the type of order execution:
	 * - FOK (Fill or Kill): The order must be filled entirely or not at all.
	 * - FAK (Fill and Kill): The order can be partially filled, and any unfilled portion is canceled.
	 */
	orderType?: OrderType.FOK | OrderType.FAK;

	/**
	 * Builder code (bytes32)
	 */
	builderCode?: string;
}
