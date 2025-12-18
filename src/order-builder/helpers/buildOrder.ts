import type { JsonRpcSigner } from "@ethersproject/providers";
import type { Wallet } from "@ethersproject/wallet";

import { ExchangeOrderBuilderV2, type OrderDataV2, type SignedOrderV2 } from "../../order-utils";

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
	signer: Wallet | JsonRpcSigner,
	exchangeAddress: string,
	chainId: number,
	orderData: OrderDataV2,
): Promise<SignedOrderV2> => {
	const ctfExchangeOrderBuilder = new ExchangeOrderBuilderV2(exchangeAddress, chainId, signer);
	return ctfExchangeOrderBuilder.buildSignedOrder(orderData);
};
