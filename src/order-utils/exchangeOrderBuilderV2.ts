import type { JsonRpcSigner } from "@ethersproject/providers";
import type { Wallet } from "@ethersproject/wallet";
import { hashTypedData } from "viem";

import { bytes32Zero } from "../constants.js";
import {
	CTF_EXCHANGE_V2_DOMAIN_NAME,
	CTF_EXCHANGE_V2_DOMAIN_VERSION,
	CTF_EXCHANGE_V2_ORDER_STRUCT,
} from "./model/ctfExchangeV2TypedData.js";
import { EIP712_DOMAIN, type EIP712TypedData } from "./model/eip712.js";
import type { OrderHash, OrderSignature } from "./model/order.js";
import type { OrderDataV2, OrderV2, SignedOrderV2 } from "./model/orderDataV2.js";
import { SignatureTypeV2 } from "./model/signatureTypeV2.js";
import { generateOrderSalt } from "./utils.js";

export class ExchangeOrderBuilderV2 {
	constructor(
		private readonly contractAddress: string,
		private readonly chainId: number,
		private readonly signer: Wallet | JsonRpcSigner,
		private readonly generateSalt = generateOrderSalt,
	) {}

	/**
	 * build an order object including the signature.
	 * @param orderData
	 * @returns a SignedOrder object (order + signature)
	 */
	async buildSignedOrder(orderData: OrderDataV2): Promise<SignedOrderV2> {
		const order = await this.buildOrder(orderData);
		const orderTypedData = this.buildOrderTypedData(order);
		const orderSignature = await this.buildOrderSignature(orderTypedData);

		return {
			...order,
			signature: orderSignature,
		} as SignedOrderV2;
	}

	/**
	 * Creates an Order object from order data.
	 * @param OrderData
	 * @returns a Order object (not signed)
	 */
	async buildOrder({
		maker,
		tokenId,
		makerAmount,
		takerAmount,
		side,
		signer,
		signatureType,
		timestamp,
		metadata,
		builder,
	}: OrderDataV2): Promise<OrderV2> {
		if (!signer) {
			signer = maker;
		}

		const signerAddress = await this.signer.getAddress();
		if (signer !== signerAddress) {
			throw new Error("signer does not match");
		}

		return {
			salt: this.generateSalt(),
			maker,
			signer,
			tokenId,
			makerAmount,
			takerAmount,
			side,
			signatureType: signatureType ?? SignatureTypeV2.EOA,
			metadata: metadata ?? bytes32Zero,
			builder: builder ?? bytes32Zero,
			timestamp: timestamp ?? Math.floor(Date.now() / 1000).toString(),
		};
	}

	/**
	 * Parses an Order object to EIP712 typed data
	 * @param order
	 * @returns a EIP712TypedData object
	 */
	buildOrderTypedData(order: OrderV2): EIP712TypedData {
		return {
			primaryType: "Order",
			types: {
				EIP712Domain: EIP712_DOMAIN,
				Order: CTF_EXCHANGE_V2_ORDER_STRUCT,
			},
			domain: {
				name: CTF_EXCHANGE_V2_DOMAIN_NAME,
				version: CTF_EXCHANGE_V2_DOMAIN_VERSION,
				chainId: this.chainId,
				verifyingContract: this.contractAddress,
			},
			message: {
				salt: order.salt,
				maker: order.maker,
				signer: order.signer,
				tokenId: order.tokenId,
				makerAmount: order.makerAmount,
				takerAmount: order.takerAmount,
				timestamp: order.timestamp,
				side: order.side === "BUY" ? 0 : 1,
				signatureType: order.signatureType,
				metadata: order.metadata,
				builder: order.builder,
			},
		};
	}

	/**
	 * Generates order's signature from a EIP712TypedData object + the signer address
	 * @param typedData
	 * @returns a OrderSignature that is an string
	 */
	buildOrderSignature(typedData: EIP712TypedData): Promise<OrderSignature> {
		delete typedData.types.EIP712Domain;
		return this.signer._signTypedData(typedData.domain, typedData.types, typedData.message);
	}

	/**
	 * Generates the hash of the order from a EIP712TypedData object.
	 * @param orderTypedData
	 * @returns a OrderHash that is an string
	 */
	buildOrderHash(orderTypedData: EIP712TypedData): OrderHash {
		const digest = hashTypedData(orderTypedData);
		return digest;
	}
}
