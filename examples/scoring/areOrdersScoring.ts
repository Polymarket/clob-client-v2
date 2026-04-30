import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

import { type ApiKeyCreds, Chain, ClobClient } from "../../src";

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
	const clobClient = new ClobClient({ host, chain: chainId, signer: walletClient, creds });

	const scoring = await clobClient.areOrdersScoring({
		orderIds: [
			"0x9355abd8ac2f9144ec19d31756ca92a8738a20c5ad65125cc2e8ea3f58d589aa",
			"0xde0c7c616190e34a81ce05adb3414d7f1e865bfea1f1cc40f6cc1d6fbd7b6345",
		],
	});
	console.log(scoring);
}

main();
