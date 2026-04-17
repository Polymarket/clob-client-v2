import { parseUnits, zeroAddress } from "viem";

import { COLLATERAL_TOKEN_DECIMALS } from "../../config.js";
import { bytes32Zero } from "../../constants.js";
import type {
	OrderDataV1,
	OrderDataV2,
	SignatureTypeV1,
	SignatureTypeV2,
} from "../../order-utils/index.js";
import type { RoundConfig, UserMarketOrderV1, UserMarketOrderV2 } from "../../types/index.js";

import { getMarketOrderRawAmounts } from "./index.js";

export async function buildMarketOrderCreationArgs(
	signer: string,
	maker: string,
	signatureType: SignatureTypeV2,
	userMarketOrder: UserMarketOrderV1 | UserMarketOrderV2,
	roundConfig: RoundConfig,
	version: 1,
): Promise<OrderDataV1>;
export async function buildMarketOrderCreationArgs(
	signer: string,
	maker: string,
	signatureType: SignatureTypeV2,
	userMarketOrder: UserMarketOrderV1 | UserMarketOrderV2,
	roundConfig: RoundConfig,
	version?: 2,
): Promise<OrderDataV2>;
export async function buildMarketOrderCreationArgs(
	signer: string,
	maker: string,
	signatureType: SignatureTypeV2,
	userMarketOrder: UserMarketOrderV1 | UserMarketOrderV2,
	roundConfig: RoundConfig,
	version: number,
): Promise<OrderDataV1 | OrderDataV2>;
export async function buildMarketOrderCreationArgs(
	signer: string,
	maker: string,
	signatureType: SignatureTypeV2,
	userMarketOrder: UserMarketOrderV1 | UserMarketOrderV2,
	roundConfig: RoundConfig,
	version: number = 2,
): Promise<OrderDataV1 | OrderDataV2> {
	const { side, rawMakerAmt, rawTakerAmt } = getMarketOrderRawAmounts(
		userMarketOrder.side,
		userMarketOrder.amount,
		userMarketOrder.price || 1,
		roundConfig,
	);

	const makerAmount = parseUnits(rawMakerAmt.toString(), COLLATERAL_TOKEN_DECIMALS).toString();
	const takerAmount = parseUnits(rawTakerAmt.toString(), COLLATERAL_TOKEN_DECIMALS).toString();

	if (version === 1) {
		const v1Order = userMarketOrder as UserMarketOrderV1;
		return {
			maker,
			taker: v1Order.taker ?? zeroAddress,
			tokenId: userMarketOrder.tokenID,
			makerAmount,
			takerAmount,
			side,
			signer,
			signatureType: signatureType as unknown as SignatureTypeV1,
			feeRateBps: v1Order.feeRateBps?.toString() ?? "0",
			nonce: v1Order.nonce?.toString() ?? "0",
		};
	}

	return {
		maker,
		tokenId: userMarketOrder.tokenID,
		makerAmount,
		takerAmount,
		side,
		signer,
		signatureType,
		timestamp: Date.now().toString(),
		metadata:
			"metadata" in userMarketOrder ? (userMarketOrder.metadata ?? bytes32Zero) : bytes32Zero,
		builder: userMarketOrder.builderCode ?? bytes32Zero,
	};
}
