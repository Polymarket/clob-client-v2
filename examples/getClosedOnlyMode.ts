import { config as dotenvConfig } from "dotenv";
import { ethers } from "ethers";
import { resolve } from "path";

import { type ApiKeyCreds, Chain, ClobClient } from "../src";

dotenvConfig({ path: resolve(__dirname, "../.env") });

async function main() {
	const wallet = new ethers.Wallet(`${process.env.PK}`);
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	console.log(`Address: ${await wallet.getAddress()}, chainId: ${chainId}`);

	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const creds: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY}`,
		secret: `${process.env.CLOB_SECRET}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE}`,
	};
	const clobClient = new ClobClient({ host, chain: chainId, signer: wallet, creds });

	const resp = await clobClient.getClosedOnlyMode();
	console.log(resp);
}

main();
