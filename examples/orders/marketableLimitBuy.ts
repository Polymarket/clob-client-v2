import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

import { type ApiKeyCreds, Chain, ClobClient, OrderType, Side } from "../../src";

dotenvConfig({ path: resolve(import.meta.dirname, "../../.env") });

// A marketable limit buy crosses the spread and fills immediately against resting asks.
// CLOB blocks self-trading, so a second wallet seeds the ask that wallet1 will fill against.

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
const PRICE = 0.5;
const SIZE = 100;

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

	// Wallet2 seeds a resting ask at PRICE
	const ask = await client2.createAndPostOrder(
		{ tokenID: YES, price: PRICE, side: Side.SELL, size: SIZE },
		{ tickSize: "0.01" },
		OrderType.GTC,
	);
	console.log("seeded ask", ask);

	// Wallet1 buys at the same price — crosses the spread and matches immediately
	const resp = await client1.createAndPostOrder(
		{ tokenID: YES, price: PRICE, side: Side.BUY, size: SIZE },
		{ tickSize: "0.01" },
		OrderType.GTC,
	);
	console.log(resp);
}

main();
