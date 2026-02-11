import type { JsonRpcSigner } from "@ethersproject/providers";
import type { Wallet } from "@ethersproject/wallet";
import { hashTypedData } from "viem";
import {
	CTF_EXCHANGE_V1_DOMAIN_NAME,
	CTF_EXCHANGE_V1_DOMAIN_VERSION,
	CTF_EXCHANGE_V1_ORDER_STRUCT,
} from "./model/ctfExchangeV1TypedData";
import { EIP712_DOMAIN, type EIP712TypedData } from "./model/eip712";
import type { OrderHash, OrderSignature } from "./model/order";
import type { OrderDataV1, OrderV1, SignedOrderV1 } from "./model/orderDataV1.js";
import { SignatureTypeV1 } from "./model/signatureTypeV1.js";
import { generateOrderSalt } from "./utils";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export class ExchangeOrderBuilderV1 {
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
	async buildSignedOrder(orderData: OrderDataV1): Promise<SignedOrderV1> {
		const order = await this.buildOrder(orderData);
		console.log("created order: ", order);
		const orderTypedData = this.buildOrderTypedData(order);
		console.log("orderTypedData: ", orderTypedData);
		const orderSignature = await this.buildOrderSignature(orderTypedData);
		console.log("orderSignature: ", orderSignature);
		return {
			...order,
			signature: orderSignature,
		} as SignedOrderV1;
	}

	/**
	 * Creates an Order object from order data.
	 * @param OrderData
	 * @returns a Order object (not signed)
	 */
	async buildOrder({
		maker,
		taker,
		tokenId,
		makerAmount,
		takerAmount,
		side,
		feeRateBps,
		nonce,
		signer,
		expiration,
		signatureType,
	}: OrderDataV1): Promise<OrderV1> {
		if (!signer) {
			signer = maker;
		}

		const signerAddress = await this.signer.getAddress();
		if (signer !== signerAddress) {
			throw new Error("signer does not match");
		}

		if (!expiration) {
			expiration = "0";
		}

		if (!signatureType) {
			// Default to EOA 712 sig type
			signatureType = SignatureTypeV1.EOA;
		}

		let takerAddress: string;
		if (typeof taker !== "undefined" && taker) {
			takerAddress = taker;
		} else {
			takerAddress = ZERO_ADDRESS;
		}

		let feeRateBpsResolved: string;
		if (typeof feeRateBps !== "undefined" && feeRateBps) {
			feeRateBpsResolved = feeRateBps.toString();
		} else {
			feeRateBpsResolved = "0";
		}

		let nonceResolved: string;
		if (typeof nonce !== "undefined" && nonce) {
			nonceResolved = nonce.toString();
		} else {
			nonceResolved = "0";
		}

		return {
			salt: this.generateSalt(),
			maker,
			signer,
			taker: takerAddress,
			tokenId,
			makerAmount,
			takerAmount,
			expiration,
			nonce: nonceResolved,
			feeRateBps: feeRateBpsResolved,
			side,
			signatureType,
		};
	}

	/**
	 * Parses an Order object to EIP712 typed data
	 * @param order
	 * @returns a EIP712TypedData object
	 */
	buildOrderTypedData(order: OrderV1): EIP712TypedData {
		return {
			primaryType: "Order",
			types: {
				EIP712Domain: EIP712_DOMAIN,
				Order: CTF_EXCHANGE_V1_ORDER_STRUCT,
			},
			domain: {
				name: CTF_EXCHANGE_V1_DOMAIN_NAME,
				version: CTF_EXCHANGE_V1_DOMAIN_VERSION,
				chainId: this.chainId,
				verifyingContract: this.contractAddress,
			},
			message: {
				salt: order.salt,
				maker: order.maker,
				signer: order.signer,
				taker: order.taker,
				tokenId: order.tokenId,
				makerAmount: order.makerAmount,
				takerAmount: order.takerAmount,
				expiration: order.expiration,
				nonce: order.nonce,
				feeRateBps: order.feeRateBps,
				side: order.side,
				signatureType: order.signatureType,
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
