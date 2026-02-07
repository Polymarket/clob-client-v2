export const CTF_EXCHANGE_V2_DOMAIN_NAME = "Polymarket CTF Exchange";

export const CTF_EXCHANGE_V2_DOMAIN_VERSION = "2";

export const CTF_EXCHANGE_V2_ORDER_STRUCT = [
	{ name: "salt", type: "uint256" },
	{ name: "maker", type: "address" },
	{ name: "signer", type: "address" },
	{ name: "tokenId", type: "uint256" },
	{ name: "makerAmount", type: "uint256" },
	{ name: "takerAmount", type: "uint256" },
	{ name: "side", type: "uint8" },
	{ name: "signatureType", type: "uint8" },
	{ name: "timestamp", type: "uint256" },
	{ name: "metadata", type: "bytes32" },
	{ name: "builder", type: "bytes32" },
];
