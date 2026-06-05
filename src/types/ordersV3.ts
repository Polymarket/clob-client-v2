import type { Side } from "./clob.js";

/**
 * ExchangeV3 order expressed directly in token base units.
 *
 * This is intended for callers that already performed exact integer sizing and
 * must not pass through the price/tick rounding used by the CLOB order API.
 */
export interface ExchangeV3OrderAmounts {
	/**
	 * TokenID of the Conditional token asset being traded
	 */
	tokenID: string;

	/**
	 * Exact maker amount in base units
	 */
	makerAmount: string;

	/**
	 * Exact taker amount in base units
	 */
	takerAmount: string;

	/**
	 * Side of the order
	 */
	side: Side;

	/**
	 * Metadata (bytes32)
	 */
	metadata?: string;

	/**
	 * Builder code (bytes32)
	 */
	builderCode?: string;

	/**
	 * Expiration timestamp (unix seconds). Defaults to 0 (no expiration).
	 */
	expiration?: number;
}
