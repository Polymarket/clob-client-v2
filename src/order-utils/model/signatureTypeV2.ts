export enum SignatureTypeV2 {
	/**
	 * ECDSA EIP712 signatures signed by EOAs
	 */
	EOA = 0,

	/**
	 * EIP712 signatures signed by EOAs that own Polymarket Proxy wallets
	 */
	POLY_PROXY = 1,

	/**
	 * EIP712 signatures signed by EOAs that own Polymarket Gnosis safes
	 */
	POLY_GNOSIS_SAFE = 2,

	/**
	 * EIP1271 signatures signed by smart contracts. To be used by smart contract wallets or vaults
	 */
	POLY_1271 = 3,
}
