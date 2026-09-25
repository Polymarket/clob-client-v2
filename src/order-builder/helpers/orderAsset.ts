import type { OrderAsset } from "../../types/index.js";

export type OrderRouting = {
	assetID: string;
	exchangeVersion: number | undefined;
};

export function resolveOrderAssetID(asset: OrderAsset): string {
	const assetID = asset.positionID === undefined ? asset.tokenID : asset.positionID;
	if (
		(asset.tokenID !== undefined) === (asset.positionID !== undefined) ||
		typeof assetID !== "string" ||
		assetID.trim().length === 0
	) {
		throw new Error(
			"Exactly one of tokenID or positionID must be provided as a non-empty string",
		);
	}
	return assetID;
}

export function resolveOrderRouting(asset: OrderAsset, requestedVersion?: number): OrderRouting {
	return {
		assetID: resolveOrderAssetID(asset),
		exchangeVersion: asset.positionID === undefined ? requestedVersion : 3,
	};
}
