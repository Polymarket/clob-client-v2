import { config as dotenvConfig } from "dotenv";
import { ethers } from "ethers";
import { resolve } from "path";

import { ApiKeyCreds, Chain, ClobClient, OrderType, Side } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

// Market sell — amount is in shares. Requires resting bids in the book to fill against.
// CLOB blocks self-trading, so a second wallet seeds the bid.
//
// OrderType.FOK (Fill Or Kill): the entire order must fill immediately or it is cancelled.
// OrderType.FAK (Fill And Kill): fills as much as possible immediately, remainder is cancelled.
// Swap FOK for FAK in createAndPostMarketOrder to use FAK instead.

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
const AMOUNT_SHARES = 100;
const SEED_PRICE = 0.5;
const SEED_SIZE = 150;

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

	// Wallet2 seeds a resting bid for wallet1 to fill against
	const bid = await client2.createAndPostOrder(
		{ tokenID: YES, price: SEED_PRICE, side: Side.BUY, size: SEED_SIZE },
		{ tickSize: "0.01" },
		OrderType.GTC,
	);
	console.log("seeded bid", bid);

	const resp = await client1.createAndPostMarketOrder(
		{
			tokenID: YES,
			amount: AMOUNT_SHARES,
			side: Side.SELL,
			orderType: OrderType.FOK,
			// userUSDCBalance: 500, // optional — if provided and <= totalCost, fee adjustment is applied
			// builderCode: process.env.BUILDER_CODE, // optional — attaches a builder code to the order
		},
		{ tickSize: "0.01" },
		OrderType.FOK,
	);
	console.log(resp);
}

main();
