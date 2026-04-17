import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

import { Chain, ClobClient } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

async function main() {
	const account = privateKeyToAccount(`${process.env.PK}` as `0x${string}`);
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const chain = chainId === Chain.POLYGON ? polygon : polygonAmoy;
	const walletClient = createWalletClient({ account, chain, transport: http() });
	console.log(`Address: ${account.address}, chainId: ${chainId}`);

	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const clobClient = new ClobClient({ host, chain: chainId, signer: walletClient });

	console.log(`Response: `);
	const resp = await clobClient.createApiKey();
	console.log(resp);
	console.log(`Complete!`);
}

main();
