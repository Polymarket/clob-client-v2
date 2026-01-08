import { parseUnits } from "viem";

import { COLLATERAL_TOKEN_DECIMALS } from "../../config";
import { bytes32Zero } from "../../constants";
import type { OrderDataV2, SignatureTypeV2 } from "../../order-utils";
import type { RoundConfig, UserMarketOrderV2 } from "../../types";

import { getMarketOrderRawAmounts } from ".";

/**
 * Translate simple user market order to args used to generate Orders
 */
export const buildMarketOrderCreationArgs = async (
	signer: string,
	maker: string,
	signatureType: SignatureTypeV2,
	userMarketOrder: UserMarketOrderV2,
	roundConfig: RoundConfig,
): Promise<OrderDataV2> => {
	const { side, rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
		userMarketOrder.side,
		userMarketOrder.amount,
		userMarketOrder.price || 1,
		roundConfig,
	);

	const makerAmount = parseUnits(rawMakerAmt.toString(), COLLATERAL_TOKEN_DECIMALS).toString();
	const takerAmount = parseUnits(rawTakerAmt.toString(), COLLATERAL_TOKEN_DECIMALS).toString();

	return {
		maker,
		tokenId: userMarketOrder.tokenID,
		makerAmount,
		takerAmount,
		side,
		signer,
		expiration: "0",
		signatureType,
		timestamp: Math.floor(Date.now() / 1000).toString(),
		metadata: bytes32Zero,
		builder: bytes32Zero,
	};
};
