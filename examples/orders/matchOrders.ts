import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

import { type ApiKeyCreds, Chain, ClobClient, Side } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

// CLOB blocks self-trading: a bid and ask from the same address will never match.
// This example uses two separate wallets (PK and PK2) with their own API credentials
// so the orders can actually fill against each other.

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";

async function main() {
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const chain = chainId === Chain.POLYGON ? polygon : polygonAmoy;
	const host = process.env.CLOB_API_URL || "http://localhost:8080";

	const account1 = privateKeyToAccount(`${process.env.PK}` as `0x${string}`);
	const walletClient1 = createWalletClient({ account: account1, chain, transport: http() });
	const creds1: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY}`,
		secret: `${process.env.CLOB_SECRET}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE}`,
	};
	const client1 = new ClobClient({ host, chain: chainId, signer: walletClient1, creds: creds1 });

	const account2 = privateKeyToAccount(`${process.env.PK2}` as `0x${string}`);
	const walletClient2 = createWalletClient({ account: account2, chain, transport: http() });
	const creds2: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY_2}`,
		secret: `${process.env.CLOB_SECRET_2}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE_2}`,
	};
	const client2 = new ClobClient({ host, chain: chainId, signer: walletClient2, creds: creds2 });

	console.log(`Wallet 1: ${account1.address}`);
	console.log(`Wallet 2: ${account2.address}`);

	const yes_bid = await client1.createOrder({
		tokenID: YES,
		price: 0.5,
		side: Side.BUY,
		size: 100,
	});
	console.log("posting bid from wallet1", yes_bid);
	await client1.postOrder(yes_bid);

	const yes_ask = await client2.createOrder({
		tokenID: YES,
		price: 0.5,
		side: Side.SELL,
		size: 100,
	});
	console.log("posting ask from wallet2", yes_ask);
	await client2.postOrder(yes_ask);

	console.log(`Done!`);
}

main();
