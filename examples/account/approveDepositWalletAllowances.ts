import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { createPublicClient, encodeFunctionData, http, maxUint256, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

import { Chain } from "../../src";
import { getContractConfig } from "../../src/config";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

const WALLET_ABI = parseAbi(["function nonce() view returns (uint256)"]);
const ERC20_ABI = parseAbi([
	"function allowance(address,address) view returns (uint256)",
	"function approve(address,uint256) returns (bool)",
]);
const CTF_ABI = parseAbi([
	"function isApprovedForAll(address,address) view returns (bool)",
	"function setApprovalForAll(address,bool)",
]);

const BATCH_EIP712_TYPES = {
	Batch: [
		{ name: "wallet", type: "address" },
		{ name: "nonce", type: "uint256" },
		{ name: "deadline", type: "uint256" },
		{ name: "calls", type: "Call[]" },
	],
	Call: [
		{ name: "target", type: "address" },
		{ name: "value", type: "uint256" },
		{ name: "data", type: "bytes" },
	],
} as const;

const DEADLINE_OFFSET = 240n; // 4 min; relayer max is 300s

async function gammaLogin(
	account: ReturnType<typeof privateKeyToAccount>,
	chainId: number,
	gammaUrl: string,
): Promise<string> {
	const nonceRes = await fetch(`${gammaUrl}/nonce`);
	if (!nonceRes.ok) throw new Error(`/nonce ${nonceRes.status}`);
	const { nonce } = (await nonceRes.json()) as { nonce: string };
	const nonceCookies = parseCookies(nonceRes.headers);

	const issuedAt = new Date().toISOString();
	const expiration = new Date(Date.now() + 7 * 24 * 3_600_000).toISOString();
	const domain = "polymarket.com";

	const siweMessage = [
		`${domain} wants you to sign in with your Ethereum account:`,
		account.address,
		"",
		"Welcome to Polymarket! Sign to connect.",
		"",
		`URI: https://${domain}`,
		"Version: 1",
		`Chain ID: ${chainId}`,
		`Nonce: ${nonce}`,
		`Issued At: ${issuedAt}`,
		`Expiration Time: ${expiration}`,
	].join("\n");

	const signature = await account.signMessage({ message: siweMessage });

	const jsonPayload = JSON.stringify({
		domain,
		address: account.address,
		statement: "Welcome to Polymarket! Sign to connect.",
		uri: `https://${domain}`,
		version: "1",
		chainId,
		nonce,
		issuedAt,
		expirationTime: expiration,
	});
	const authToken = Buffer.from(`${jsonPayload}:::${signature}`).toString("base64");

	const loginRes = await fetch(`${gammaUrl}/login`, {
		headers: { Authorization: `Bearer ${authToken}`, Cookie: nonceCookies },
	});
	if (!loginRes.ok) throw new Error(`/login ${loginRes.status}: ${await loginRes.text()}`);

	const loginCookies = parseCookies(loginRes.headers);
	console.log("Gamma login successful");
	return mergeCookies(nonceCookies, loginCookies);
}

async function submitBatch(
	account: ReturnType<typeof privateKeyToAccount>,
	chainId: number,
	wallet: `0x${string}`,
	factory: `0x${string}`,
	nonce: bigint,
	calls: Array<{ target: `0x${string}`; value: bigint; data: `0x${string}` }>,
	cookies: string,
	relayerUrl: string,
): Promise<string> {
	const deadline = BigInt(Math.floor(Date.now() / 1000)) + DEADLINE_OFFSET;

	const sig = await account.signTypedData({
		domain: { name: "DepositWallet", version: "1", chainId, verifyingContract: wallet },
		types: BATCH_EIP712_TYPES,
		primaryType: "Batch",
		message: { wallet, nonce, deadline, calls },
	});

	const resp = await fetch(`${relayerUrl}/submit`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Cookie: cookies },
		body: JSON.stringify({
			type: "WALLET",
			from: account.address,
			to: factory,
			nonce: nonce.toString(),
			signature: sig,
			depositWalletParams: {
				depositWallet: wallet,
				deadline: deadline.toString(),
				calls: calls.map((c) => ({ target: c.target, value: c.value.toString(), data: c.data })),
			},
		}),
	});
	if (!resp.ok) throw new Error(`Submit failed ${resp.status}: ${await resp.text()}`);

	const result = (await resp.json()) as { transactionID: string; state: string };
	console.log(`  submitted txnID=${result.transactionID}  state=${result.state}`);
	return result.transactionID;
}

async function pollConfirmed(txnId: string, relayerUrl: string): Promise<void> {
	while (true) {
		const resp = await fetch(`${relayerUrl}/transaction?id=${txnId}`);
		const data = (await resp.json()) as Array<{ state: string; transactionHash?: string }>;
		const state = data[0]?.state ?? "UNKNOWN";
		console.log(`  state=${state}`);
		if (state === "STATE_CONFIRMED") {
			console.log(`  txHash=${data[0]?.transactionHash}`);
			return;
		}
		if (state === "STATE_FAILED") throw new Error(`Transaction ${txnId} failed`);
		await new Promise((r) => setTimeout(r, 3000));
	}
}

async function main() {
	const isMainnet = true;

	const pk = process.env.PK as `0x${string}`;
	const rpcUrl = process.env.RPC_URL as string;
	const wallet = process.env.DEPOSIT_WALLET as `0x${string}`;
	const factory = process.env.DEPOSIT_WALLET_FACTORY as `0x${string}`;
	const gammaUrl = process.env.GAMMA_API_URL as string;
	const relayerUrl = process.env.RELAYER_API_URL as string;

	if (!pk || !rpcUrl || !wallet || !factory || !gammaUrl || !relayerUrl) {
		throw new Error(
			"Missing required env: PK, RPC_URL, DEPOSIT_WALLET, DEPOSIT_WALLET_FACTORY, GAMMA_API_URL, RELAYER_API_URL",
		);
	}

	const chainId = isMainnet ? Chain.POLYGON : Chain.AMOY;
	const viemChain = isMainnet ? polygon : polygonAmoy;
	const contracts = getContractConfig(chainId);

	const account = privateKeyToAccount(pk);
	const publicClient = createPublicClient({ chain: viemChain, transport: http(rpcUrl) });

	console.log(`Signer:         ${account.address}`);
	console.log(`Deposit wallet: ${wallet}`);
	console.log(`Chain ID:       ${chainId}`);
	console.log(`USDC:           ${contracts.collateral}`);
	console.log(`CTF:            ${contracts.conditionalTokens}`);
	console.log(`Exchange V2:    ${contracts.exchangeV2}`);

	const usdc = contracts.collateral as `0x${string}`;
	const ctf = contracts.conditionalTokens as `0x${string}`;
	const exchange = contracts.exchangeV2 as `0x${string}`;

	const [usdcAllowanceCtf, usdcAllowanceExchange, ctfApprovedExchange] = await Promise.all([
		publicClient.readContract({ address: usdc, abi: ERC20_ABI, functionName: "allowance", args: [wallet, ctf] }),
		publicClient.readContract({ address: usdc, abi: ERC20_ABI, functionName: "allowance", args: [wallet, exchange] }),
		publicClient.readContract({ address: ctf, abi: CTF_ABI, functionName: "isApprovedForAll", args: [wallet, exchange] }),
	]);

	console.log(`\nCurrent state:`);
	console.log(`  USDC → CTF:         ${usdcAllowanceCtf}`);
	console.log(`  USDC → Exchange V2: ${usdcAllowanceExchange}`);
	console.log(`  CTF  → Exchange V2: ${ctfApprovedExchange}`);

	const needsUsdcCtf = usdcAllowanceCtf === 0n;
	const needsUsdcExchange = usdcAllowanceExchange === 0n;
	const needsCtfExchange = !ctfApprovedExchange;

	if (!needsUsdcCtf && !needsUsdcExchange && !needsCtfExchange) {
		console.log("\nAll approvals already set — nothing to do");
		return;
	}

	console.log("\nLogging into Gamma...");
	const cookies = await gammaLogin(account, chainId, gammaUrl);

	if (needsUsdcCtf) {
		console.log("\nApproving USDC → CTF...");
		const nonce = await publicClient.readContract({ address: wallet, abi: WALLET_ABI, functionName: "nonce" });
		const data = encodeFunctionData({ abi: ERC20_ABI, functionName: "approve", args: [ctf, maxUint256] });
		const txnId = await submitBatch(account, chainId, wallet, factory, nonce, [{ target: usdc, value: 0n, data }], cookies, relayerUrl);
		await pollConfirmed(txnId, relayerUrl);
	}

	if (needsUsdcExchange) {
		console.log("\nApproving USDC → Exchange V2...");
		const nonce = await publicClient.readContract({ address: wallet, abi: WALLET_ABI, functionName: "nonce" });
		const data = encodeFunctionData({ abi: ERC20_ABI, functionName: "approve", args: [exchange, maxUint256] });
		const txnId = await submitBatch(account, chainId, wallet, factory, nonce, [{ target: usdc, value: 0n, data }], cookies, relayerUrl);
		await pollConfirmed(txnId, relayerUrl);
	}

	if (needsCtfExchange) {
		console.log("\nSetting CTF approval for Exchange V2...");
		const nonce = await publicClient.readContract({ address: wallet, abi: WALLET_ABI, functionName: "nonce" });
		const data = encodeFunctionData({ abi: CTF_ABI, functionName: "setApprovalForAll", args: [exchange, true] });
		const txnId = await submitBatch(account, chainId, wallet, factory, nonce, [{ target: ctf, value: 0n, data }], cookies, relayerUrl);
		await pollConfirmed(txnId, relayerUrl);
	}

	console.log("\nAll approvals done");
}

function parseCookies(headers: Headers): string {
	const raw: string[] =
		typeof (headers as any).getSetCookie === "function"
			? (headers as any).getSetCookie()
			: (headers.get("set-cookie") ?? "").split(/,(?=[^ ])/).filter(Boolean);
	return raw.map((c) => c.split(";")[0]).join("; ");
}

function mergeCookies(a: string, b: string): string {
	const map = new Map<string, string>();
	for (const part of [...a.split("; "), ...b.split("; ")]) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		map.set(part.slice(0, eq).trim(), part.trim());
	}
	return [...map.values()].join("; ");
}

main();
