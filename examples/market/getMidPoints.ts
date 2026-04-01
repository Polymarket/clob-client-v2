import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";

import { type BookParams, Chain, ClobClient } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
const NO = "52114319501245915516055106046884209969926127482827954674443846427813813222426";

async function main() {
	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const clobClient = new ClobClient({ host, chain: chainId });

	const midpoints = await clobClient.getMidpoints([
		{ token_id: YES },
		{ token_id: NO },
	] as BookParams[]);

	console.log(midpoints);
}

main();
