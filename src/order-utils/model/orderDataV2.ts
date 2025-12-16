import type { Side } from "../../types.ts";

import type { EIP712Object } from "./eip712.ts";
import type { SignatureTypeV2 } from "./signatureTypeV2.ts";

export type OrderSignature = string;

export type OrderHash = string;

export interface OrderDataV2 {
	/**
	 * Maker of the order, i.e the source of funds for the order
	 */
	maker: string;

	/**
	 * Token Id of the CTF ERC1155 asset to be bought or sold.
	 * If BUY, this is the tokenId of the asset to be bought, i.e the makerAssetId
	 * If SELL, this is the tokenId of the asset to be sold, i.e the  takerAssetId
	 */
	tokenId: string;

	/**
	 * Maker amount, i.e the max amount of tokens to be sold
	 */
	makerAmount: string;

	/**
	 * Taker amount, i.e the minimum amount of tokens to be received
	 */
	takerAmount: string;

	/**
	 * The side of the order, BUY or SELL
	 */
	side: Side;

	maxFee?: string;

	/**
	 * Signer of the order. Optional, if it is not present the signer is the maker of the order.
	 */
	signer?: string;

	/**
	 * Timestamp after which the order is expired.
	 * Optional, if it is not present the value is '0' (no expiration)
	 */
	expiration?: string;

	/**
	 * Signature type used by the Order. Default value 'EOA'
	 */
	signatureType?: SignatureTypeV2;

	/**
	 * Timestamp of the order
	 */
	timestamp?: string;

	/**
	 * Metadata of the order
	 */
	readonly metadata?: string;

	/**
	 * Builder of the order
	 */
	readonly builder?: string;
}

export interface OrderV2 extends EIP712Object {
	/**
	 *  Unique salt to ensure entropy
	 */
	readonly salt: string;

	/**
	 * Maker of the order, i.e the source of funds for the order
	 */
	readonly maker: string;

	/**
	 * Signer of the order
	 */
	readonly signer: string;

	/**
	 * Token Id of the CTF ERC1155 asset to be bought or sold.
	 * If BUY, this is the tokenId of the asset to be bought, i.e the makerAssetId
	 * If SELL, this is the tokenId of the asset to be sold, i.e the  takerAssetId
	 */
	readonly tokenId: string;

	/**
	 * Maker amount, i.e the max amount of tokens to be sold
	 */
	readonly makerAmount: string;

	/**
	 * Taker amount, i.e the minimum amount of tokens to be received
	 */
	readonly takerAmount: string;

	/**
	 * Timestamp after which the order is expired
	 */
	readonly expiration: string;

	/**
	 * Maximum fee charged to the order maker, charged in USDC
	 */
	readonly maxFee: string;

	/**
	 * The side of the order, BUY or SELL
	 */
	readonly side: Side;

	/**
	 * Signature type used by the Order
	 */
	readonly signatureType: SignatureTypeV2;

	/**
	 * Timestamp of the order
	 */
	readonly timestamp: string;

	/**
	 * Metadata of the order
	 */
	readonly metadata: string;

	/**
	 * Builder of the order
	 */
	readonly builder: string;
}

export interface SignedOrderV2 extends OrderV2 {
	/**
	 * The order signature
	 */
	readonly signature: OrderSignature;
}
