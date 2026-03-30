import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { ethers } from "ethers";

import { type ApiKeyCreds, Chain, ClobClient, Side } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

// CLOB blocks self-trading: a bid and ask from the same address will never match.
// This example uses two separate wallets (PK and PK2) with their own API credentials
// so the orders can actually fill against each other.

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";

async function main() {
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const host = process.env.CLOB_API_URL || "http://localhost:8080";

	const wallet1 = new ethers.Wallet(`${process.env.PK}`);
	const creds1: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY}`,
		secret: `${process.env.CLOB_SECRET}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE}`,
	};
	const client1 = new ClobClient({ host, chain: chainId, signer: wallet1, creds: creds1 });

	const wallet2 = new ethers.Wallet(`${process.env.PK2}`);
	const creds2: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY_2}`,
		secret: `${process.env.CLOB_SECRET_2}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE_2}`,
	};
	const client2 = new ClobClient({ host, chain: chainId, signer: wallet2, creds: creds2 });

	console.log(`Wallet 1: ${await wallet1.getAddress()}`);
	console.log(`Wallet 2: ${await wallet2.getAddress()}`);

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
