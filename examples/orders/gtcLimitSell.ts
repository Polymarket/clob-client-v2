import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

import { type ApiKeyCreds, Chain, ClobClient, OrderType, Side } from "../../src";

dotenvConfig({ path: resolve(import.meta.dirname, "../../.env") });

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";

async function main() {
	const account = privateKeyToAccount(`${process.env.PK}` as `0x${string}`);
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const chain = chainId === Chain.POLYGON ? polygon : polygonAmoy;
	const walletClient = createWalletClient({ account, chain, transport: http() });
	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const creds: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY}`,
		secret: `${process.env.CLOB_SECRET}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE}`,
	};
	const client = new ClobClient({ host, chain: chainId, signer: walletClient, creds });

	// Resting limit sell — sits in the book until filled or cancelled
	const resp = await client.createAndPostOrder(
		{
			tokenID: YES,
			price: 0.6,
			side: Side.SELL,
			size: 100,
		},
		{ tickSize: "0.01" },
		OrderType.GTC,
	);
	console.log(resp);
}

main();
