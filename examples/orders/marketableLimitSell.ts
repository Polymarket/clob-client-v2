import { config as dotenvConfig } from "dotenv";
import { ethers } from "ethers";
import { resolve } from "path";

import { type ApiKeyCreds, Chain, ClobClient, OrderType, Side } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

// A marketable limit sell crosses the spread and fills immediately against resting bids.
// CLOB blocks self-trading, so a second wallet seeds the bid that wallet1 will fill against.

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
const PRICE = 0.5;
const SIZE = 100;

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

	// Wallet2 seeds a resting bid at PRICE
	const bid = await client2.createAndPostOrder(
		{ tokenID: YES, price: PRICE, side: Side.BUY, size: SIZE },
		{ tickSize: "0.01" },
		OrderType.GTC,
	);
	console.log("seeded bid", bid);

	// Wallet1 sells at the same price — crosses the spread and matches immediately
	const resp = await client1.createAndPostOrder(
		{ tokenID: YES, price: PRICE, side: Side.SELL, size: SIZE },
		{ tickSize: "0.01" },
		OrderType.GTC,
	);
	console.log(resp);
}

main();
