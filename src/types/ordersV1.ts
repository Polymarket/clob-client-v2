import type { SignatureTypeV1, SignedOrderV1 } from "../order-utils";

import type { OrderType, Side } from "./clob";

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
		readonly side: Side; // string
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
}
