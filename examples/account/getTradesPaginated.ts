import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { type ApiKeyCreds, Chain, ClobClient } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

async function main() {
	const account = privateKeyToAccount(`${process.env.PK}` as `0x${string}`);
	const walletClient = createWalletClient({ account, transport: http() });
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	console.log(`Address: ${account.address}, chainId: ${chainId}`);

	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const creds: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY}`,
		secret: `${process.env.CLOB_SECRET}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE}`,
	};
	const clobClient = new ClobClient({ host, chain: chainId, signer: walletClient, creds });

	// only first page
	console.log(
		await clobClient.getTradesPaginated({
			market: "0x5f65177b394277fd294cd75650044e32ba009a95022d88a0c1d565897d72f8f1",
			maker_address: account.address,
		}),
	);

	// fetch only second page
	console.log(
		await clobClient.getTradesPaginated(
			{
				market: "0x5f65177b394277fd294cd75650044e32ba009a95022d88a0c1d565897d72f8f1",
				maker_address: account.address,
			},
			"MzAw",
		),
	);
}

main();
