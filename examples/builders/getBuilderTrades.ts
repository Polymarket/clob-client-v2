import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as dotenvConfig } from "dotenv";

import { ClobClient } from "../../src";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: resolve(__dirname, "../../.env") });

async function main() {
	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const builderCode = process.env.BUILDER_CODE;

	if (!builderCode) {
		throw new Error("BUILDER_CODE env var is required");
	}

	const clobClient = new ClobClient({ host });

	console.log(`Fetching builder trades for builder_code: ${builderCode}`);
	const resp = await clobClient.getBuilderTrades({ builder_code: builderCode });
	console.log(JSON.stringify(resp, null, 2));
}

main();
