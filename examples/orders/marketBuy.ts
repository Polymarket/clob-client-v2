import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { type ApiKeyCreds, Chain, ClobClient, OrderType, Side } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

// Market buy — amount is in USDC. Requires resting asks in the book to fill against.
// CLOB blocks self-trading, so a second wallet seeds the ask.
//
// OrderType.FOK (Fill Or Kill): the entire order must fill immediately or it is cancelled.
// OrderType.FAK (Fill And Kill): fills as much as possible immediately, remainder is cancelled.
// Swap FOK for FAK in createAndPostMarketOrder to use FAK instead.

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
const AMOUNT_USDC = 100;
const SEED_PRICE = 0.5;
const SEED_SIZE = 250; // enough shares to cover AMOUNT_USDC / SEED_PRICE

async function main() {
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const host = process.env.CLOB_API_URL || "http://localhost:8080";

	const account1 = privateKeyToAccount(`${process.env.PK}` as `0x${string}`);
	const walletClient1 = createWalletClient({ account: account1, transport: http() });
	const creds1: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY}`,
		secret: `${process.env.CLOB_SECRET}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE}`,
	};
	const client1 = new ClobClient({ host, chain: chainId, signer: walletClient1, creds: creds1 });

	const account2 = privateKeyToAccount(`${process.env.PK2}` as `0x${string}`);
	const walletClient2 = createWalletClient({ account: account2, transport: http() });
	const creds2: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY_2}`,
		secret: `${process.env.CLOB_SECRET_2}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE_2}`,
	};
	const client2 = new ClobClient({ host, chain: chainId, signer: walletClient2, creds: creds2 });

	// Wallet2 seeds a resting ask for wallet1 to fill against
	const ask = await client2.createAndPostOrder(
		{ tokenID: YES, price: SEED_PRICE, side: Side.SELL, size: SEED_SIZE },
		{ tickSize: "0.01" },
		OrderType.GTC,
	);
	console.log("seeded ask", ask);

	const resp = await client1.createAndPostMarketOrder(
		{
			tokenID: YES,
			amount: AMOUNT_USDC,
			side: Side.BUY,
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
