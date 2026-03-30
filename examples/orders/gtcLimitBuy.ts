import { config as dotenvConfig } from "dotenv";
import { ethers } from "ethers";
import { resolve } from "path";

import { ApiKeyCreds, Chain, ClobClient, OrderType, Side } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";

async function main() {
	const wallet = new ethers.Wallet(`${process.env.PK}`);
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const creds: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY}`,
		secret: `${process.env.CLOB_SECRET}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE}`,
	};
	const client = new ClobClient({ host, chain: chainId, signer: wallet, creds });

	const resp = await client.createAndPostOrder(
		{
			tokenID: YES,
			price: 0.4,
			side: Side.BUY,
			size: 100,
		},
		{ tickSize: "0.01" },
		OrderType.GTC,
	);
	console.log(resp);
}

main();
