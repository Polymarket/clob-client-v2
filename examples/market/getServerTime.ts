import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";

import { Chain, ClobClient } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

async function main() {
	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const clobClient = new ClobClient({ host, chain: chainId });

	console.log(`Server time: ${await clobClient.getServerTime()}`);
}

main();
