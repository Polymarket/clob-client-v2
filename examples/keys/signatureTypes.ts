import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

import { type ApiKeyCreds, Chain, ClobClient, SignatureTypeV2 } from "../../src";

dotenvConfig({ path: resolve(import.meta.dirname, "../../.env") });

async function main() {
	const account = privateKeyToAccount(`${process.env.PK}` as `0x${string}`);
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const chain = chainId === Chain.POLYGON ? polygon : polygonAmoy;
	const walletClient = createWalletClient({ account, chain, transport: http() });
	console.log(`Address: ${account.address}, chainId: ${chainId}`);

	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const creds: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY}`,
		secret: `${process.env.CLOB_SECRET}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE}`,
	};

	// Client used with an EOA: Signature type 0
	const clobClient = new ClobClient({ host, chain: chainId, signer: walletClient, creds });

	// Client used with a Polymarket Proxy Wallet: Signature type 1
	const proxyWalletAddress = "0x...";
	const polyProxyClient = new ClobClient({
		host,
		chain: chainId,
		signer: walletClient,
		creds,
		signatureType: SignatureTypeV2.POLY_PROXY,
		funderAddress: proxyWalletAddress,
	});

	// Client used with a Polymarket Gnosis safe: Signature Type 2
	const gnosisSafeAddress = "0x...";
	const polyGnosisSafeClient = new ClobClient({
		host,
		chain: chainId,
		signer: walletClient,
		creds,
		signatureType: SignatureTypeV2.POLY_GNOSIS_SAFE,
		funderAddress: gnosisSafeAddress,
	});
}

main();
