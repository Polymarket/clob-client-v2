import { getContractConfig } from "../../config.js";
import { bytes32Zero } from "../../constants.js";
import type { SignedOrderV2 } from "../../order-utils/index.js";
import { SignatureTypeV2 } from "../../order-utils/index.js";
import { type ClobSigner, getSignerAddress } from "../../signing/signer.js";
import type { Chain, ExchangeV3OrderAmounts } from "../../types/index.js";
import { buildOrder } from "./buildOrder.js";

export const createExchangeV3OrderFromAmounts = async (
	eoaSigner: ClobSigner,
	chainId: Chain,
	signatureType: SignatureTypeV2,
	funderAddress: string | undefined,
	userOrder: ExchangeV3OrderAmounts,
): Promise<SignedOrderV2> => {
	if (
		!isPositiveDecimalInteger(userOrder.makerAmount) ||
		!isPositiveDecimalInteger(userOrder.takerAmount)
	) {
		throw new Error("makerAmount and takerAmount must be positive decimal integers");
	}

	const eoaSignerAddress = await getSignerAddress(eoaSigner);
	const maker = funderAddress ?? eoaSignerAddress;
	const signerForOrder = signatureType === SignatureTypeV2.POLY_1271 ? maker : eoaSignerAddress;
	const contractConfig = getContractConfig(chainId);

	return (await buildOrder(
		eoaSigner,
		contractConfig.exchangeV3,
		chainId,
		{
			maker,
			signer: signerForOrder,
			tokenId: userOrder.tokenID,
			makerAmount: userOrder.makerAmount,
			takerAmount: userOrder.takerAmount,
			side: userOrder.side,
			signatureType,
			timestamp: Date.now().toString(),
			metadata: userOrder.metadata ?? bytes32Zero,
			builder: userOrder.builderCode ?? bytes32Zero,
			expiration: userOrder.expiration?.toString() ?? "0",
		},
		3,
	)) as SignedOrderV2;
};

const isPositiveDecimalInteger = (value: string): boolean =>
	/^[0-9]+$/.test(value) && BigInt(value) > 0n;
