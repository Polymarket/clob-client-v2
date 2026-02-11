import { SignedOrderV1, SignedOrderV2 } from "../order-utils";
import { PostOrdersV2Args, UserOrderV2, UserMarketOrderV2 } from "./ordersV2";
import { PostOrdersV1Args, UserOrderV1, UserMarketOrderV1 } from "./ordersV1";


export type SignedOrder = SignedOrderV1 | SignedOrderV2;

export type PostOrdersArgs = PostOrdersV1Args | PostOrdersV2Args;

export type VersionedSignedOrder =
	| { version: 1; order: SignedOrderV1 }
	| { version: 2; order: SignedOrderV2 };


export type VersionedUserOrder =
	| { version: 1; order: UserOrderV1 }
	| { version: 2; order: UserOrderV2 };


export type VersionedUserMarketOrder =
	| { version: 1; order: UserMarketOrderV1 }
	| { version: 2; order: UserMarketOrderV2 };

export type VersionedPostOrdersArgs =
	| { version: 1; args: PostOrdersV1Args }
	| { version: 2; args: PostOrdersV2Args };

// Type guards
export function isV1Order(order: SignedOrder | VersionedSignedOrder): order is SignedOrderV1 {
	if ('version' in order && 'order' in order) {
		// VersionedSignedOrder type
		return order.version === 1;
	}
	// Check for V1-specific fields
	return 'nonce' in order && 'feeRateBps' in order;
}

export function isV2Order(order: SignedOrder | VersionedSignedOrder): order is SignedOrderV2 {
	if ('version' in order && 'order' in order) {
		// VersionedSignedOrder type
		return order.version === 2;
	}
	// Check for V2-specific fields
	return 'timestamp' in order && 'metadata' in order && 'builder' in order;
}
