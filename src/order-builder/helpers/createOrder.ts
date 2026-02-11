import type { JsonRpcSigner } from "@ethersproject/providers";
import type { Wallet } from "@ethersproject/wallet";

import { getContractConfig } from "../../config";
import type { SignatureTypeV2, SignedOrderV1, SignedOrderV2 } from "../../order-utils";
import type { Chain, CreateOrderOptions, UserOrderV2 } from "../../types";

import { buildOrder } from "./buildOrder";
import { buildOrderCreationArgs } from "./buildOrderCreationArgs";
import { ROUNDING_CONFIG } from "./roundingConfig";

export const createOrder = async (
	eoaSigner: Wallet | JsonRpcSigner,
	chainId: Chain,
	signatureType: SignatureTypeV2,
	funderAddress: string | undefined,
	userOrder: UserOrderV2,
	options: CreateOrderOptions,
	version: number,
): Promise<SignedOrderV1 | SignedOrderV2> => {
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
		? contractConfig.negRiskExchangeV2
		: contractConfig.exchangeV2;

	return buildOrder(eoaSigner, exchangeContract, chainId, orderData, version);
};
