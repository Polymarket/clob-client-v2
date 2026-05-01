import {
	type Address,
	encodeAbiParameters,
	hashTypedData,
	keccak256,
	type LocalAccount,
	toHex,
	type WalletClient,
} from "viem";

import { bytes32Zero, SESSION_SIGNER_MAGIC } from "../constants.js";
import { type ClobSigner, getSignerAddress, signTypedDataWithSigner } from "../signing/signer.js";
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

const ORDER_TYPE_STRING =
	"Order(uint256 salt,address maker,address signer,uint256 tokenId,uint256 makerAmount,uint256 takerAmount,uint8 side,uint8 signatureType,uint256 timestamp,bytes32 metadata,bytes32 builder)";

const ORDER_TYPE_HASH = keccak256(toHex(ORDER_TYPE_STRING));
const ORDER_TYPE_HEX = toHex(ORDER_TYPE_STRING).slice(2);
const ORDER_TYPE_LEN_HEX = ORDER_TYPE_STRING.length.toString(16).padStart(4, "0");

const DOMAIN_TYPE_HASH = keccak256(
	toHex("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
);

const SOLADY_TYPE_HASH = keccak256(
	toHex(
		`TypedDataSign(Order contents,string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)${ORDER_TYPE_STRING}`,
	),
);

const DEPOSIT_WALLET_NAME_HASH = keccak256(toHex("DepositWallet"));
const DEPOSIT_WALLET_VERSION_HASH = keccak256(toHex("1"));
const CTF_EXCHANGE_NAME_HASH = keccak256(toHex(CTF_EXCHANGE_V2_DOMAIN_NAME));
const CTF_EXCHANGE_VERSION_HASH = keccak256(toHex(CTF_EXCHANGE_V2_DOMAIN_VERSION));

export class ExchangeOrderBuilderV2 {
	private readonly appDomainSep: `0x${string}`;

	constructor(
		private readonly contractAddress: string,
		private readonly chainId: number,
		private readonly signer: ClobSigner,
		private readonly generateSalt = generateOrderSalt,
		private readonly sessionSigner?: LocalAccount,
	) {
		this.appDomainSep = keccak256(
			encodeAbiParameters(
				[
					{ type: "bytes32" },
					{ type: "bytes32" },
					{ type: "bytes32" },
					{ type: "uint256" },
					{ type: "address" },
				],
				[
					DOMAIN_TYPE_HASH,
					CTF_EXCHANGE_NAME_HASH,
					CTF_EXCHANGE_VERSION_HASH,
					BigInt(chainId),
					contractAddress as Address,
				],
			),
		);
	}

	async buildSignedOrder(orderData: OrderDataV2): Promise<SignedOrderV2> {
		const order = await this.buildOrder(orderData);
		const orderTypedData = this.buildOrderTypedData(order);
		const orderSignature = await this.buildOrderSignature(orderTypedData);

		return {
			...order,
			signature: orderSignature,
		} as SignedOrderV2;
	}

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
		expiration,
	}: OrderDataV2): Promise<OrderV2> {
		if (!signer) {
			signer = maker;
		}

		// For POLY_1271 (deposit wallets), signer is the wallet contract — skip EOA address check
		if (signatureType !== SignatureTypeV2.POLY_1271) {
			const signerAddress = await getSignerAddress(this.signer);
			if (signer !== signerAddress) {
				throw new Error("signer does not match");
			}
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
			timestamp: timestamp ?? Date.now().toString(),
			expiration: expiration ?? "0",
		};
	}

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

	async buildOrderSignature(typedData: EIP712TypedData): Promise<OrderSignature> {
		delete typedData.types.EIP712Domain;

		const msg = typedData.message;

		if ((msg.signatureType as number) !== SignatureTypeV2.POLY_1271) {
			return signTypedDataWithSigner({
				signer: this.signer,
				domain: typedData.domain,
				types: typedData.types,
				value: typedData.message,
				primaryType: typedData.primaryType,
			});
		}

		const contentsHash = keccak256(
			encodeAbiParameters(
				[
					{ type: "bytes32" },
					{ type: "uint256" },
					{ type: "address" },
					{ type: "address" },
					{ type: "uint256" },
					{ type: "uint256" },
					{ type: "uint256" },
					{ type: "uint8" },
					{ type: "uint8" },
					{ type: "uint256" },
					{ type: "bytes32" },
					{ type: "bytes32" },
				],
				[
					ORDER_TYPE_HASH,
					BigInt(msg.salt as string),
					msg.maker as Address,
					msg.signer as Address,
					BigInt(msg.tokenId as string),
					BigInt(msg.makerAmount as string),
					BigInt(msg.takerAmount as string),
					msg.side as number,
					msg.signatureType as number,
					BigInt(msg.timestamp as string),
					msg.metadata as `0x${string}`,
					msg.builder as `0x${string}`,
				],
			),
		);

		const typedDataSignStructHash = keccak256(
			encodeAbiParameters(
				[
					{ type: "bytes32" },
					{ type: "bytes32" },
					{ type: "bytes32" },
					{ type: "bytes32" },
					{ type: "uint256" },
					{ type: "address" },
					{ type: "bytes32" },
				],
				[
					SOLADY_TYPE_HASH,
					contentsHash,
					DEPOSIT_WALLET_NAME_HASH,
					DEPOSIT_WALLET_VERSION_HASH,
					BigInt(this.chainId),
					msg.signer as Address,
					bytes32Zero as `0x${string}`,
				],
			),
		);

		// digest = keccak256(0x1901 || appDomainSep || structHash)
		const digest = keccak256(
			`0x1901${this.appDomainSep.slice(2)}${typedDataSignStructHash.slice(2)}` as `0x${string}`,
		);

		if (this.sessionSigner) {
			if (!this.sessionSigner.sign) {
				throw new Error("sessionSigner must support raw hash signing (sign method)");
			}
			const innerSig = await this.sessionSigner.sign({ hash: digest });
			const nestedSig = this.buildNestedSig(innerSig, contentsHash);

			// abi.encode(sessionSignerAsBytes32, bytes32(0), nestedSig) || SESSION_SIGNER_MAGIC
			const sessionSignerBytes32 =
				`0x${this.sessionSigner.address.slice(2).toLowerCase().padStart(64, "0")}` as `0x${string}`;
			const encoded = encodeAbiParameters(
				[{ type: "bytes32" }, { type: "bytes32" }, { type: "bytes" }],
				[sessionSignerBytes32, bytes32Zero as `0x${string}`, nestedSig],
			);
			return `${encoded}${SESSION_SIGNER_MAGIC}`;
		}

		const localAccount = (this.signer as WalletClient).account as LocalAccount | undefined;
		if (!localAccount?.sign) {
			throw new Error("POLY_1271 requires either a sessionSigner or a WalletClient with a local account");
		}
		const innerSig = await localAccount.sign({ hash: digest });
		return this.buildNestedSig(innerSig, contentsHash);
	}

	buildOrderHash(orderTypedData: EIP712TypedData): OrderHash {
		return hashTypedData(orderTypedData);
	}

	private buildNestedSig(innerSig: string, contentsHash: string): `0x${string}` {
		// innerSig (65) || appDomainSep (32) || contentsHash (32) || contentsType || uint16_BE(len)
		return `0x${innerSig.slice(2)}${this.appDomainSep.slice(2)}${contentsHash.slice(2)}${ORDER_TYPE_HEX}${ORDER_TYPE_LEN_HEX}`;
	}
}
