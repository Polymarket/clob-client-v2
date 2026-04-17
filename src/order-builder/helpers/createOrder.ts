import { getContractConfig } from "../../config.js";
import type { SignedOrderV1, SignedOrderV2 } from "../../order-utils/index.js";
import { SignatureTypeV2 } from "../../order-utils/index.js";
import { type ClobSigner, getSignerAddress } from "../../signing/signer.js";
import type { Chain, CreateOrderOptions, UserOrderV1, UserOrderV2 } from "../../types/index.js";
import { buildOrder } from "./buildOrder.js";
import { buildOrderCreationArgs } from "./buildOrderCreationArgs.js";
import { ROUNDING_CONFIG } from "./roundingConfig.js";

export const createOrder = async (
	eoaSigner: ClobSigner,
	chainId: Chain,
	signatureType: SignatureTypeV2,
	funderAddress: string | undefined,
	userOrder: UserOrderV1 | UserOrderV2,
	options: CreateOrderOptions,
	version: number,
): Promise<SignedOrderV1 | SignedOrderV2> => {
	const eoaSignerAddress = await getSignerAddress(eoaSigner);

	// If funder address is not given, use the signer address
	const maker = funderAddress === undefined ? eoaSignerAddress : funderAddress;
	const contractConfig = getContractConfig(chainId);

	const orderData = await buildOrderCreationArgs(
		eoaSignerAddress,
		maker,
		signatureType,
		userOrder,
		ROUNDING_CONFIG[options.tickSize],
		version,
	);
	let exchangeContract: string;
	switch (version) {
		case 1:
			if (signatureType === SignatureTypeV2.POLY_1271) {
				throw new Error(`signature type POLY_1271 is not supported for v1 orders`);
			}
			exchangeContract = options.negRisk
				? contractConfig.negRiskExchange
				: contractConfig.exchange;
			break;
		case 2:
			exchangeContract = options.negRisk
				? contractConfig.negRiskExchangeV2
				: contractConfig.exchangeV2;
			break;
		default:
			throw new Error(`unsupported order version ${version}`);
	}
	return buildOrder(eoaSigner, exchangeContract, chainId, orderData, version);
};
