const UINT256_MAX = (1n << 256n) - 1n;
const V2_RESERVED_BITS_MASK = ((1n << 64n) - 1n) << 40n;

/**
 * Classifies the protocol V2 position namespace. Registered CTF token IDs do
 * not occupy this namespace; CLOB still validates that the asset exists.
 * @internal
 */
export function isV2PositionId(tokenID: string): boolean {
	try {
		if (tokenID.trim().length === 0) return false;
		const value = BigInt(tokenID);
		return value >= 0n && value <= UINT256_MAX && (value & V2_RESERVED_BITS_MASK) === 0n;
	} catch {
		return false;
	}
}
