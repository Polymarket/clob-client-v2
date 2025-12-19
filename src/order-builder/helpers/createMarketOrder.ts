import type { JsonRpcSigner } from "@ethersproject/providers";
import type { Wallet } from "@ethersproject/wallet";

import { getContractConfig } from "../../config";
import type { SignatureTypeV2, SignedOrderV2 } from "../../order-utils";
import type { Chain, CreateOrderOptions, UserMarketOrderV2 } from "../../types";

import { buildOrder } from ".";
import { buildMarketOrderCreationArgs } from "./buildMarketOrderCreationArgs";
import { ROUNDING_CONFIG } from "./roundingConfig";

export const createMarketOrder = async (
	eoaSigner: Wallet | JsonRpcSigner,
	chainId: Chain,
	signatureType: SignatureTypeV2,
	funderAddress: string | undefined,
	userMarketOrder: UserMarketOrderV2,
	options: CreateOrderOptions,
): Promise<SignedOrderV2> => {
	const eoaSignerAddress = await eoaSigner.getAddress();

	// If funder address is not given, use the signer address
	const maker = funderAddress === undefined ? eoaSignerAddress : funderAddress;
	const contractConfig = getContractConfig(chainId);

	const orderData = await buildMarketOrderCreationArgs(
		eoaSignerAddress,
		maker,
		signatureType,
		userMarketOrder,
		ROUNDING_CONFIG[options.tickSize],
	);

	const exchangeContract = options.negRisk
		? contractConfig.negRiskExchange
		: contractConfig.exchange;

	return buildOrder(eoaSigner, exchangeContract, chainId, orderData);
};
