import type { JsonRpcSigner } from "@ethersproject/providers";
import type { Wallet } from "@ethersproject/wallet";

import { SignatureTypeV2, type SignedOrderV1, type SignedOrderV2 } from "../order-utils";
import type {
	Chain,
	CreateOrderOptions,
	UserMarketOrderV1,
	UserMarketOrderV2,
	UserOrderV1,
	UserOrderV2,
} from "../types";

import { createMarketOrder, createOrder } from "./helpers";

export class OrderBuilder {
	readonly signer: Wallet | JsonRpcSigner;

	readonly chainId: Chain;

	// Signature type used sign orders, defaults to EOA type
	readonly signatureType: SignatureTypeV2;

	// Address which holds funds to be used.
	// Used for Polymarket proxy wallets and other smart contract wallets
	// If not provided, funderAddress is the signer address
	readonly funderAddress?: string;

	/**
	 * Optional function to dynamically resolve the signer.
	 * If provided, this function will be called to obtain a fresh signer instance
	 * (e.g., for smart contract wallets or when the signer may change).
	 * Should return a Wallet or JsonRpcSigner, or a Promise resolving to one.
	 * If not provided, the static `signer` property is used.
	 */
	private getSigner?: () => Promise<Wallet | JsonRpcSigner> | (Wallet | JsonRpcSigner);

	constructor(
		signer: Wallet | JsonRpcSigner,
		chainId: Chain,
		signatureType?: SignatureTypeV2,
		funderAddress?: string,
		getSigner?: () => Promise<Wallet | JsonRpcSigner> | (Wallet | JsonRpcSigner),
	) {
		this.signer = signer;
		this.chainId = chainId;
		this.signatureType = signatureType === undefined ? SignatureTypeV2.EOA : signatureType;
		this.funderAddress = funderAddress;
		this.getSigner = getSigner;
	}

	/**
	 * Generate and sign a order
	 */
	public async buildOrder(
		userOrder: UserOrderV1 | UserOrderV2,
		options: CreateOrderOptions,
		version: number,
	): Promise<SignedOrderV1 | SignedOrderV2> {
		const signer = await this.resolveSigner();
		return createOrder(
			signer,
			this.chainId,
			this.signatureType,
			this.funderAddress,
			userOrder,
			options,
			version,
		);
	}

	/**
	 * Generate and sign a market order
	 */
	public async buildMarketOrder(
		userMarketOrder: UserMarketOrderV1 | UserMarketOrderV2,
		options: CreateOrderOptions,
		version: number,
	): Promise<SignedOrderV1 | SignedOrderV2> {
		const signer = await this.resolveSigner();
		return createMarketOrder(
			signer,
			this.chainId,
			this.signatureType,
			this.funderAddress,
			userMarketOrder,
			options,
			version,
		);
	}

	/** Unified getter: use fresh signer if available */
	private async resolveSigner(): Promise<Wallet | JsonRpcSigner> {
		if (this.getSigner) {
			const s = await this.getSigner();
			if (!s) throw new Error("getSigner() function returned undefined or null");
			return s;
		}
		return this.signer;
	}
}
