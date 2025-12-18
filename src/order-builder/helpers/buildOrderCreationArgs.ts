import { parseUnits } from "viem";

import { SignatureTypeV2 } from "../../order-utils";
import { UserOrder } from "../../types";
import { RoundConfig } from "../../types";
import { OrderDataV2 } from "../../order-utils";
import { getOrderRawAmounts } from "./getOrderRawAmounts";
import { COLLATERAL_TOKEN_DECIMALS } from "../../config";
import { bytes32Zero } from "../../constants";
/**
 * Translate simple user order to args used to generate Orders
 */
export const buildOrderCreationArgs = async (
	signer: string,
	maker: string,
	signatureType: SignatureTypeV2,
	userOrder: UserOrder,
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
		expiration: userOrder.expiration ? userOrder.expiration.toString() : "0",
		signatureType,
		maxFee: "0",
		timestamp: Math.floor(Date.now() / 1000).toString(),
		metadata: bytes32Zero,
		builder: bytes32Zero,
	};
};
