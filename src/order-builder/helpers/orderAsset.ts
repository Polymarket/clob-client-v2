import type { OrderAsset } from "../../types/index.js";

export type OrderRouting = {
	assetID: string;
	exchangeVersion: number | undefined;
};

export function resolveOrderAssetID(asset: OrderAsset): string {
	return asset.positionID ?? asset.tokenID;
}

export function resolveOrderRouting(asset: OrderAsset, requestedVersion?: number): OrderRouting {
	return {
		assetID: resolveOrderAssetID(asset),
		exchangeVersion: asset.positionID === undefined ? requestedVersion : 3,
	};
}
