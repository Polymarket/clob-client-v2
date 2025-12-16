export const CTF_EXCHANGE_V1_DOMAIN_NAME = "Polymarket CTF Exchange";

export const CTF_EXCHANGE_V1_DOMAIN_VERSION = "1";

export const CTF_EXCHANGE_V1_ORDER_STRUCT = [
	{ name: "salt", type: "uint256" },
	{ name: "maker", type: "address" },
	{ name: "signer", type: "address" },
	{ name: "taker", type: "address" },
	{ name: "tokenId", type: "uint256" },
	{ name: "makerAmount", type: "uint256" },
	{ name: "takerAmount", type: "uint256" },
	{ name: "expiration", type: "uint256" },
	{ name: "nonce", type: "uint256" },
	{ name: "feeRateBps", type: "uint256" },
	{ name: "side", type: "uint8" },
	{ name: "signatureType", type: "uint8" },
];
