import type { Chain } from "../types/index.js";

import { MSG_TO_SIGN } from "./constants.js";
import { type ClobSigner, getSignerAddress, signTypedDataWithSigner } from "./signer.js";

/**
 * Builds the canonical Polymarket CLOB EIP712 signature
 * @param signer
 * @param ts
 * @returns string
 */
export const buildClobEip712Signature = async (
	signer: ClobSigner,
	chainId: Chain,
	timestamp: number,
	nonce: number,
	address?: string,
): Promise<string> => {
	const resolvedAddress = address ?? (await getSignerAddress(signer));
	const ts = timestamp.toString();

	const domain = {
		name: "ClobAuthDomain",
		version: "1",
		chainId: chainId,
	};

	const types = {
		ClobAuth: [
			{ name: "address", type: "address" },
			{ name: "timestamp", type: "string" },
			{ name: "nonce", type: "uint256" },
			{ name: "message", type: "string" },
		],
	};
	const value = {
		address: resolvedAddress,
		timestamp: ts,
		nonce,
		message: MSG_TO_SIGN,
	};
	const sig = await signTypedDataWithSigner({
		signer,
		domain,
		types,
		value,
		primaryType: "ClobAuth",
	});
	return sig;
};
