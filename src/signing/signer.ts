import type { JsonRpcSigner } from "@ethersproject/providers";
import type { Wallet } from "@ethersproject/wallet";
import type { WalletClient } from "viem";

export type ClobSigner = Wallet | JsonRpcSigner | WalletClient;

function isViemWalletClient(signer: ClobSigner): signer is WalletClient {
	return (
		typeof (signer as WalletClient).signTypedData === "function" &&
		typeof (signer as Wallet | JsonRpcSigner)._signTypedData !== "function"
	);
}

export const getSignerAddress = async (signer: ClobSigner): Promise<string> => {
	if (isViemWalletClient(signer)) {
		if (signer.account?.address) {
			return signer.account.address;
		}
		const addresses = await signer.getAddresses();
		return addresses[0];
	}
	return signer.getAddress();
};

export const signTypedData = async (
	signer: ClobSigner,
	domain: Record<string, unknown>,
	types: Record<string, { name: string; type: string }[]>,
	message: Record<string, unknown>,
): Promise<string> => {
	if (isViemWalletClient(signer)) {
		const account = signer.account ?? (await signer.getAddresses())[0];
		const primaryType = Object.keys(types)[0];
		return signer.signTypedData({
			account,
			domain,
			types,
			primaryType,
			message,
		} as Parameters<WalletClient["signTypedData"]>[0]);
	}
	// eslint-disable-next-line no-underscore-dangle
	return signer._signTypedData(domain, types, message);
};
