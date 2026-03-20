import { parseUnits } from "viem";

import { COLLATERAL_TOKEN_DECIMALS } from "../../config.js";
import { bytes32Zero } from "../../constants.js";
import type { OrderDataV2, SignatureTypeV2 } from "../../order-utils/index.js";
import type { RoundConfig, UserOrderV2 } from "../../types/index.js";

import { getOrderRawAmounts } from "./getOrderRawAmounts.js";

/**
 * Translate simple user order to args used to generate Orders
 */
export const buildOrderCreationArgs = async (
	signer: string,
	maker: string,
	signatureType: SignatureTypeV2,
	userOrder: UserOrderV2,
	roundConfig: RoundConfig,
): Promise<OrderDataV2> => {
	const { side, rawMakerAmt, rawTakerAmt } = getOrderRawAmounts(
		userOrder.side,
		userOrder.size,
		userOrder.price,
		roundConfig,
	);

	const makerAmount = parseUnits(rawMakerAmt.toString(), COLLATERAL_TOKEN_DECIMALS).toString();
	const takerAmount = parseUnits(rawTakerAmt.toString(), COLLATERAL_TOKEN_DECIMALS).toString();

	return {
		maker,
		tokenId: userOrder.tokenID,
		makerAmount,
		takerAmount,
		side,
		signer,
		signatureType,
		timestamp: Math.floor(Date.now() / 1000).toString(),
		metadata: userOrder.metadata ?? bytes32Zero,
		builder: userOrder.builderCode ?? bytes32Zero,
		expiration: userOrder.expiration !== undefined ? userOrder.expiration.toString() : "0",
	};
};
