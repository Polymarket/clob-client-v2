import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

import {
	type ApiKeyCreds,
	Chain,
	ClobClient,
	OrderType,
	type PostOrdersArgs,
	Side,
} from "../../src";

dotenvConfig({ path: resolve(import.meta.dirname, "../../.env") });

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";

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

	await clobClient.cancelAll();

	const orders: PostOrdersArgs[] = [
		{
			order: await clobClient.createOrder({
				tokenID: YES,
				price: 0.4,
				side: Side.BUY,
				size: 100,
			}),
			orderType: OrderType.GTC,
		},
		{
			order: await clobClient.createOrder({
				tokenID: YES,
				price: 0.45,
				side: Side.BUY,
				size: 100,
			}),
			orderType: OrderType.GTC,
		},
		{
			order: await clobClient.createOrder({
				tokenID: YES,
				price: 0.55,
				side: Side.SELL,
				size: 100,
			}),
			orderType: OrderType.GTC,
		},
		{
			order: await clobClient.createOrder({
				tokenID: YES,
				price: 0.6,
				side: Side.SELL,
				size: 100,
			}),
			orderType: OrderType.GTC,
		},
	];

	const resp = await clobClient.postOrders(orders);
	console.log(resp);
}

main();
