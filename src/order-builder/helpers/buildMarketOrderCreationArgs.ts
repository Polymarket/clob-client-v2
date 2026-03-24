import { parseUnits } from "viem";

import { COLLATERAL_TOKEN_DECIMALS } from "../../config.js";
import { bytes32Zero } from "../../constants.js";
import type { OrderDataV2, SignatureTypeV2 } from "../../order-utils/index.js";
import type { RoundConfig, UserMarketOrderV2 } from "../../types/index.js";

import { getMarketOrderRawAmounts } from "./index.js";

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
		signatureType,
		timestamp: Date.now().toString(),
		metadata: userMarketOrder.metadata ?? bytes32Zero,
		builder: userMarketOrder.builderCode ?? bytes32Zero,
	};
};
