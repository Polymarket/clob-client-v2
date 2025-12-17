import { JsonRpcSigner } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

import { getContractConfig } from "../../config";
import { SignatureTypeV2, SignedOrderV2 } from "../../order-utils";
import { Chain, CreateOrderOptions, UserOrder } from "../../types";

import { buildOrderCreationArgs } from "./buildOrderCreationArgs";
import { ROUNDING_CONFIG } from "./roundingConfig";
import { buildOrder } from "./buildOrder";

export const createOrder = async (
	eoaSigner: Wallet | JsonRpcSigner,
	chainId: Chain,
	signatureType: SignatureTypeV2,
	funderAddress: string | undefined,
	userOrder: UserOrder,
	options: CreateOrderOptions,
): Promise<SignedOrderV2> => {
	const eoaSignerAddress = await eoaSigner.getAddress();

	// If funder address is not given, use the signer address
	const maker = funderAddress === undefined ? eoaSignerAddress : funderAddress;
	const contractConfig = getContractConfig(chainId);

	const orderData = await buildOrderCreationArgs(
		eoaSignerAddress,
		maker,
		signatureType,
		userOrder,
		ROUNDING_CONFIG[options.tickSize],
	);

	const exchangeContract = options.negRisk
		? contractConfig.negRiskExchange
		: contractConfig.exchange;

	return buildOrder(eoaSigner, exchangeContract, chainId, orderData);
};
