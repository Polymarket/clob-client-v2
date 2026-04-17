import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

import { type ApiKeyCreds, Chain, ClobClient, Side } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

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

	const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
	const yes_bid = await clobClient.createOrder({
		tokenID: YES,
		price: 0.4,
		side: Side.BUY,
		size: 100,
	});
	console.log("creating order", yes_bid);
	await clobClient.postOrder(yes_bid);

	const yes_ask = await clobClient.createOrder({
		tokenID: YES,
		price: 0.6,
		side: Side.SELL,
		size: 100,
	});
	console.log("creating order", yes_ask);
	await clobClient.postOrder(yes_ask);

	const NO = "52114319501245915516055106046884209969926127482827954674443846427813813222426";
	const no_bid = await clobClient.createOrder({
		tokenID: NO,
		price: 0.4,
		side: Side.BUY,
		size: 100,
	});
	console.log("creating order", no_bid);
	await clobClient.postOrder(no_bid);

	const no_ask = await clobClient.createOrder({
		tokenID: NO,
		price: 0.6,
		side: Side.SELL,
		size: 100,
	});
	console.log("creating order", no_ask);
	await clobClient.postOrder(no_ask);

	console.log(`Done!`);
}

main();
