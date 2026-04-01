import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { type ApiKeyCreds, AssetType, Chain, ClobClient } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

async function main() {
	const account = privateKeyToAccount(`${process.env.PK}` as `0x${string}`);
	const walletClient = createWalletClient({ account, transport: http() });
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	console.log(`Address: ${account.address}, chainId: ${chainId}`);

	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const creds: ApiKeyCreds = {
		key: `${process.env.CLOB_API_KEY}`,
		secret: `${process.env.CLOB_SECRET}`,
		passphrase: `${process.env.CLOB_PASS_PHRASE}`,
	};
	const clobClient = new ClobClient({ host, chain: chainId, signer: walletClient, creds });

	// USDC
	await clobClient.updateBalanceAllowance({ asset_type: AssetType.COLLATERAL });

	// YES
	await clobClient.updateBalanceAllowance({
		asset_type: AssetType.CONDITIONAL,
		token_id: "71321045679252212594626385532706912750332728571942532289631379312455583992563",
	});

	// NO
	await clobClient.updateBalanceAllowance({
		asset_type: AssetType.CONDITIONAL,
		token_id: "52114319501245915516055106046884209969926127482827954674443846427813813222426",
	});
}

main();
