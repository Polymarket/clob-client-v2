import type { SignedOrderV1, SignedOrderV2 } from "../order-utils";
import type { PostOrdersV1Args, UserMarketOrderV1, UserOrderV1 } from "./ordersV1";
import type { PostOrdersV2Args, UserMarketOrderV2, UserOrderV2 } from "./ordersV2";

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

export function isV2Order(order: SignedOrder | VersionedSignedOrder): order is SignedOrderV2 {
	if ("version" in order && "order" in order) {
		// VersionedSignedOrder type
		return order.version === 2;
	}
	// Check for V2-specific fields
	return "timestamp" in order && "metadata" in order && "builder" in order;
}
