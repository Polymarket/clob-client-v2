import {
	ExchangeOrderBuilderV1,
	ExchangeOrderBuilderV2,
	type OrderDataV1,
	type OrderDataV2,
	type SignedOrderV1,
	type SignedOrderV2,
} from "../../order-utils/index.js";
import type { ClobSigner } from "../../signing/signer.js";

/**
 * Generate and sign a order
 *
 * @param signer
 * @param exchangeAddress ctf exchange contract address
 * @param chainId
 * @param OrderData
 * @returns SignedOrder
 */
export const buildOrder = async (
	signer: ClobSigner,
	exchangeAddress: string,
	chainId: number,
	orderData: OrderDataV1 | OrderDataV2,
	version: number = 2,
): Promise<SignedOrderV1 | SignedOrderV2> => {
	switch (version) {
		case 1:
			return buildOrderV1(signer, exchangeAddress, chainId, orderData as OrderDataV1);
		case 2:
			return buildOrderV2(signer, exchangeAddress, chainId, orderData as OrderDataV2);
		default:
			throw new Error(`unsupported order version ${version}`);
	}
};

export const buildOrderV1 = async (
	signer: ClobSigner,
	exchangeAddress: string,
	chainId: number,
	orderData: OrderDataV1,
): Promise<SignedOrderV1> => {
	const ctfExchangeOrderBuilder = new ExchangeOrderBuilderV1(exchangeAddress, chainId, signer);
	return ctfExchangeOrderBuilder.buildSignedOrder(orderData);
};

export const buildOrderV2 = async (
	signer: ClobSigner,
	exchangeAddress: string,
	chainId: number,
	orderData: OrderDataV2,
): Promise<SignedOrderV2> => {
	const ctfExchangeOrderBuilder = new ExchangeOrderBuilderV2(exchangeAddress, chainId, signer);
	return ctfExchangeOrderBuilder.buildSignedOrder(orderData);
};
