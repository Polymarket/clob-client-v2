import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { createPublicClient, createWalletClient, http, maxUint256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

import { Chain } from "../../src";
import { getContractConfig } from "../../src/config";
import { ctfAbi } from "../abi/ctfAbi";
import { usdcAbi } from "../abi/usdcAbi";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

/**
 * NegRisk markets require separate allowances
 * for the NegRiskCtfExchange and the NegRiskAdapter.
 */

function getClients(chainId: Chain) {
	const pk = process.env.PK as `0x${string}`;
	const rpcToken = process.env.RPC_TOKEN as string;
	const rpcUrl = chainId === Chain.POLYGON
		? `https://polygon-mainnet.g.alchemy.com/v2/${rpcToken}`
		: `https://polygon-amoy.g.alchemy.com/v2/${rpcToken}`;
	const chain = chainId === Chain.POLYGON ? polygon : polygonAmoy;
	const account = privateKeyToAccount(pk);
	const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
	const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
	return { account, walletClient, publicClient };
}

async function main() {
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const { account, walletClient, publicClient } = getClients(chainId);
	console.log(`Address: ${account.address}, chainId: ${chainId}`);

	const contractConfig = getContractConfig(chainId);

	console.log(`usdc: ${contractConfig.collateral}`);
	console.log(`ctf: ${contractConfig.conditionalTokens}`);

	const usdcAllowanceNegRiskAdapter = await publicClient.readContract({
		address: contractConfig.collateral as `0x${string}`,
		abi: usdcAbi,
		functionName: "allowance",
		args: [account.address, contractConfig.negRiskAdapter as `0x${string}`],
	});
	console.log(`usdcAllowanceNegRiskAdapter: ${usdcAllowanceNegRiskAdapter}`);

	const usdcAllowanceNegRiskExchange = await publicClient.readContract({
		address: contractConfig.collateral as `0x${string}`,
		abi: usdcAbi,
		functionName: "allowance",
		args: [account.address, contractConfig.negRiskExchange as `0x${string}`],
	});

	const conditionalTokensAllowanceNegRiskExchange = await publicClient.readContract({
		address: contractConfig.conditionalTokens as `0x${string}`,
		abi: ctfAbi,
		functionName: "isApprovedForAll",
		args: [account.address, contractConfig.negRiskExchange as `0x${string}`],
	});

	const conditionalTokensAllowanceNegRiskAdapter = await publicClient.readContract({
		address: contractConfig.conditionalTokens as `0x${string}`,
		abi: ctfAbi,
		functionName: "isApprovedForAll",
		args: [account.address, contractConfig.negRiskAdapter as `0x${string}`],
	});

	// for splitting through the NegRiskAdapter
	if (!(usdcAllowanceNegRiskAdapter > 0n)) {
		const hash = await walletClient.writeContract({
			address: contractConfig.collateral as `0x${string}`,
			abi: usdcAbi,
			functionName: "approve",
			args: [contractConfig.negRiskAdapter as `0x${string}`, maxUint256],
			gasPrice: BigInt(100_000_000_000),
			gas: BigInt(200_000),
		});
		console.log(`Setting USDC allowance for NegRiskAdapter: ${hash}`);
	}
	if (!(usdcAllowanceNegRiskExchange > 0n)) {
		const hash = await walletClient.writeContract({
			address: contractConfig.collateral as `0x${string}`,
			abi: usdcAbi,
			functionName: "approve",
			args: [contractConfig.negRiskExchange as `0x${string}`, maxUint256],
			gasPrice: BigInt(100_000_000_000),
			gas: BigInt(200_000),
		});
		console.log(`Setting USDC allowance for NegRiskExchange: ${hash}`);
	}
	if (!conditionalTokensAllowanceNegRiskExchange) {
		const hash = await walletClient.writeContract({
			address: contractConfig.conditionalTokens as `0x${string}`,
			abi: ctfAbi,
			functionName: "setApprovalForAll",
			args: [contractConfig.negRiskExchange as `0x${string}`, true],
			gasPrice: BigInt(100_000_000_000),
			gas: BigInt(200_000),
		});
		console.log(`Setting Conditional Tokens allowance for NegRiskExchange: ${hash}`);
	}
	if (!conditionalTokensAllowanceNegRiskAdapter) {
		const hash = await walletClient.writeContract({
			address: contractConfig.conditionalTokens as `0x${string}`,
			abi: ctfAbi,
			functionName: "setApprovalForAll",
			args: [contractConfig.negRiskAdapter as `0x${string}`, true],
			gasPrice: BigInt(100_000_000_000),
			gas: BigInt(200_000),
		});
		console.log(`Setting Conditional Tokens allowance for NegRiskAdapter: ${hash}`);
	}
	console.log("Allowances set");
}

main();
