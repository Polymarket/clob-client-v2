import { BigNumber, constants, ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";
import { createWriteStream, type WriteStream } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { Chain, ClobClient, OrderType, Side, type TickSize } from "../../src/index.js";
import { getContractConfig } from "../../src/config.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

dotenvConfig({ path: resolve(__dirname, "../../.env") });

const outStream: WriteStream = createWriteStream(resolve(__dirname, "../../output.txt"), { flags: "w" });

const _log = console.log.bind(console);
const _warn = console.warn.bind(console);
const _error = console.error.bind(console);

console.log = (...args: unknown[]) => { _log(...args); outStream.write(args.join(" ") + "\n"); };
console.warn = (...args: unknown[]) => { _warn(...args); outStream.write("WARN: " + args.join(" ") + "\n"); };
console.error = (...args: unknown[]) => { _error(...args); outStream.write("ERROR: " + args.join(" ") + "\n"); };

async function getGas(wallet: ethers.Wallet): Promise<{ gasPrice: ethers.BigNumber; gasLimit: number }> {
	const gasPrice = (await wallet.provider!.getGasPrice()).mul(130).div(100);
	return { gasPrice, gasLimit: 500_000 };
}

const ERC20_ABI = [
	"function balanceOf(address) view returns (uint256)",
	"function allowance(address,address) view returns (uint256)",
	"function approve(address,uint256) returns (bool)",
];

const WRAPPER_ABI = ["function wrap(address from, address to, uint256 amount)"];

const NEG_RISK_ADAPTER_ABI = [
	"function splitPosition(bytes32 conditionId, uint256 amount) external",
];

async function splitCollateral(
	wallet: ethers.Wallet,
	chainId: number,
	conditionId: string,
	amount: number,
): Promise<void> {
	const contracts = getContractConfig(chainId);
	const usdc = new ethers.Contract(contracts.collateral, ERC20_ABI, wallet);
	const adapter = new ethers.Contract(contracts.negRiskAdapter, NEG_RISK_ADAPTER_ABI, wallet);
	const amountBN = ethers.utils.parseUnits(amount.toFixed(6), 6);
	const usdcBal: BigNumber = await usdc.balanceOf(wallet.address);
	console.log(`USDC.e balance for split: ${ethers.utils.formatUnits(usdcBal, 6)}`);
	const splitAmt = amountBN.gt(usdcBal) ? usdcBal : amountBN;
	if (splitAmt.isZero()) {
		console.log("No USDC.e available — skipping split");
		return;
	}
	const allowance: BigNumber = await usdc.allowance(wallet.address, contracts.negRiskAdapter);
	if (allowance.lt(splitAmt)) {
		console.log("Approving USDC.e for NegRiskAdapter...");
		const tx = await usdc.approve(contracts.negRiskAdapter, constants.MaxUint256, await getGas(wallet));
		await tx.wait();
	}
	const splitAmtHuman = ethers.utils.formatUnits(splitAmt, 6);
	console.log(`Splitting ${splitAmtHuman} USDC.e → YES/NO tokens for condition ${conditionId.slice(0, 10)}...`);
	const tx = await adapter.splitPosition(conditionId, splitAmt, await getGas(wallet));
	await tx.wait();
	console.log("Split done.");
}

const ERC1155_ABI = [
	"function isApprovedForAll(address,address) view returns (bool)",
	"function setApprovalForAll(address,bool)",
	"function balanceOf(address,uint256) view returns (uint256)",
];

async function ensureTokenApprovals(wallet: ethers.Wallet, chainId: number, negRisk: boolean): Promise<void> {
	const contracts = getContractConfig(chainId);
	const exchange = negRisk ? contracts.negRiskExchangeV2 : contracts.exchangeV2;

	const ctf = new ethers.Contract(contracts.conditionalTokens, ERC1155_ABI, wallet);
	if (!await ctf.isApprovedForAll(wallet.address, exchange)) {
		console.log(`Approving CTF tokens for exchange...`);
		const tx = await ctf.setApprovalForAll(exchange, true, await getGas(wallet));
		await tx.wait();
	}

	if (negRisk) {
		try {
			const adapter = new ethers.Contract(contracts.negRiskAdapter, ERC1155_ABI, wallet);
			if (!await adapter.isApprovedForAll(wallet.address, exchange)) {
				console.log(`Approving NegRiskAdapter tokens for exchange...`);
				const tx = await adapter.setApprovalForAll(exchange, true, await getGas(wallet));
				await tx.wait();
			}
		} catch {
			// NegRiskAdapter may use a custom trust model — skip if unsupported
		}
	}

	console.log("Token approvals verified.");
}

async function getTokenBalance(wallet: ethers.Wallet, chainId: number, tokenID: string, negRisk = false): Promise<number> {
	const contracts = getContractConfig(chainId);
	// For negRisk markets tokens live in the NegRiskAdapter's ERC1155, not the CTF.
	const tokenContract = negRisk ? contracts.negRiskAdapter : contracts.conditionalTokens;
	const erc1155 = new ethers.Contract(tokenContract, ERC1155_ABI, wallet);
	const bal: BigNumber = await erc1155.balanceOf(wallet.address, tokenID);
	return parseFloat(ethers.utils.formatUnits(bal, 6));
}

const log = (label: string, result: unknown) => {
	console.log(`\n── ${label} ──`);
	console.log(JSON.stringify(result, null, 2));
};

async function ensurePmct(wallet: ethers.Wallet, chainId: number, splitReserve = 0): Promise<number> {
	const pmctAddress = process.env.COLLATERAL_TOKEN_ADDRESS;
	const wrapperAddress = process.env.WRAPPER_ADDRESS;

	if (!pmctAddress || !wrapperAddress) {
		console.log("COLLATERAL_TOKEN_ADDRESS or WRAPPER_ADDRESS not set — skipping PMCT check");
		return 0;
	}

	const contracts = getContractConfig(chainId);

	const pmct = new ethers.Contract(pmctAddress, ERC20_ABI, wallet);
	const usdc = new ethers.Contract(contracts.collateral, ERC20_ABI, wallet);
	const wrapper = new ethers.Contract(wrapperAddress, WRAPPER_ABI, wallet);

	let pmctBal: BigNumber = await pmct.balanceOf(wallet.address);
	console.log(`\nPMCT balance: ${ethers.utils.formatUnits(pmctBal, 6)}`);

	const usdcBal: BigNumber = await usdc.balanceOf(wallet.address);
	console.log(`USDC.e balance: ${ethers.utils.formatUnits(usdcBal, 6)}`);

	const reserveBN = ethers.utils.parseUnits(splitReserve.toFixed(6), 6);
	const wrapAmount = usdcBal.gt(reserveBN) ? usdcBal.sub(reserveBN) : ethers.BigNumber.from(0);

	if (wrapAmount.isZero()) {
		console.log(`No USDC.e to wrap (reserving ${splitReserve} for split)`);
	} else {
		const allowance: BigNumber = await usdc.allowance(wallet.address, wrapperAddress);
		if (allowance.lt(wrapAmount)) {
			console.log("Approving USDC.e for wrapper...");
			const tx = await usdc.approve(wrapperAddress, constants.MaxUint256, await getGas(wallet));
			await tx.wait();
		}

		console.log(`Wrapping ${ethers.utils.formatUnits(wrapAmount, 6)} USDC.e → PMCT (reserving ${splitReserve} for split)...`);
		const tx = await wrapper.wrap(contracts.collateral, wallet.address, wrapAmount, await getGas(wallet));
		await tx.wait();

		pmctBal = await pmct.balanceOf(wallet.address);
		console.log(`PMCT balance after wrap: ${ethers.utils.formatUnits(pmctBal, 6)}`);
	}

	return parseFloat(ethers.utils.formatUnits(pmctBal, 6));
}

async function main() {
	const rpcUrl = process.env.RPC_URL;
	const pk = `${process.env.PK}`;
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const tokenID = `${process.env.TOKEN_ID}`;
	const builderCode = process.env.BUILDER_CODE;

	const wallet = rpcUrl
		? new ethers.Wallet(pk, new ethers.providers.JsonRpcProvider(rpcUrl))
		: new ethers.Wallet(pk);

	console.log(`Address: ${await wallet.getAddress()}, chainId: ${chainId}`);

	// ── Counterparty wallet (PK2) — provides opposite-side liquidity ──────────
	// Same-wallet self-trading is blocked by the exchange for all order types,
	// so all steps that cross the spread require a separate counterparty wallet.
	const pk2 = process.env.PK2;
	let client2: ClobClient | null = null;
	let wallet2: ethers.Wallet | null = null;
	const w2PendingOrders: string[] = [];

	if (pk2) {
		wallet2 = rpcUrl
			? new ethers.Wallet(pk2, new ethers.providers.JsonRpcProvider(rpcUrl))
			: new ethers.Wallet(pk2);
		console.log(`Counterparty: ${await wallet2.getAddress()}`);
		const authClient2 = new ClobClient({ host, chain: chainId, signer: wallet2 });
		let creds2 = await authClient2.deriveApiKey();
		if (!creds2?.key) creds2 = await authClient2.createApiKey();
		client2 = new ClobClient({ host, chain: chainId, signer: wallet2, creds: creds2 });
	}

	const authClient = new ClobClient({ host, chain: chainId, signer: wallet });
	let creds = await authClient.deriveApiKey();
	if (!creds?.key) {
		creds = await authClient.createApiKey();
	}
	console.log(`API key: ${creds.key}`);

	const client = new ClobClient({
		host,
		chain: chainId,
		signer: wallet,
		creds,
		...(builderCode ? { builderConfig: { builderCode } } : {}),
	});

	// ── Market discovery ──────────────────────────────────────────────────────
	const book = await client.getOrderBook(tokenID);
	const conditionId = book.market;
	const tickSize = book.tick_size as TickSize;
	const negRisk = book.neg_risk;
	const tick = parseFloat(tickSize);

	await client.getClobMarketInfo(conditionId);

	const minOrderSize = parseFloat(book.min_order_size);
	const orderSizeUSDC = process.env.ORDER_SIZE ? parseFloat(process.env.ORDER_SIZE) : minOrderSize;

	// ── On-chain setup ────────────────────────────────────────────────────────
	// Reserve USDC.e for splitting: enough for 4 sell steps at orderSizeUSDC each.
	// ensurePmct is called after getOrderBook so orderSizeUSDC is known.
	const splitReserve = orderSizeUSDC * 4;
	const pmctBalance = rpcUrl
		? await ensurePmct(wallet, chainId, splitReserve)
		: (console.log("RPC_URL not set — skipping PMCT balance check"), 0);

	if (rpcUrl) {
		await ensureTokenApprovals(wallet, chainId, negRisk);
	}

	if (rpcUrl && wallet2) {
		await ensureTokenApprovals(wallet2, chainId, negRisk);
		const pmctAddress = process.env.COLLATERAL_TOKEN_ADDRESS;
		if (pmctAddress) {
			const contracts = getContractConfig(chainId);
			const exchange = negRisk ? contracts.negRiskExchangeV2 : contracts.exchangeV2;
			const pmct = new ethers.Contract(pmctAddress, ERC20_ABI, wallet2);
			const allowance: BigNumber = await pmct.allowance(wallet2.address, exchange);
			if (allowance.isZero()) {
				console.log("Approving PMCT for counterparty...");
				const tx = await pmct.approve(exchange, constants.MaxUint256, await getGas(wallet2));
				await tx.wait();
			}
		}
	}

	// ── Token balance pre-setup ───────────────────────────────────────────────
	// Split USDC.e → YES/NO tokens only if wallet1 doesn't already have enough
	// for the 4 sell steps (3, 5, 7, 9).
	let tokenBal = rpcUrl ? await getTokenBalance(wallet, chainId, tokenID, negRisk) : 0;
	const tokensNeeded = (orderSizeUSDC / (1 - tick)) * 4;
	if (rpcUrl && tokenBal < tokensNeeded) {
		const splitAmt = parseFloat((tokensNeeded - tokenBal).toFixed(6));
		await splitCollateral(wallet, chainId, conditionId, splitAmt);
		await new Promise(r => setTimeout(r, 3000));
		tokenBal = await getTokenBalance(wallet, chainId, tokenID, negRisk);
	}

	const bestAsk = book.asks?.[0] ? parseFloat(book.asks[0].price) : null;
	const bestBid = book.bids?.[0] ? parseFloat(book.bids[0].price) : null;

	console.log(`\nMarket:    ${conditionId}`);
	console.log(`Token:     ${tokenID}`);
	console.log(`TickSize:  ${tickSize} | NegRisk: ${negRisk}`);
	console.log(`Best bid:  ${bestBid ?? "none"} | Best ask: ${bestAsk ?? "none"}`);
	console.log(`Min order: ${minOrderSize} USDC | Using: ${orderSizeUSDC} USDC`);
	console.log(`Token balance: ${tokenBal}`);

	const safeBuyPrice = tick;
	const safeSellPrice = 1 - tick;
	const limitBuyShares = parseFloat((orderSizeUSDC / safeBuyPrice).toFixed(2));
	const limitSellShares = parseFloat((orderSizeUSDC / safeSellPrice).toFixed(2));

	const pendingOrders: string[] = [];

	// ── Helpers ───────────────────────────────────────────────────────────────

	const freshBid = async (): Promise<number | null> => {
		const b = await client.getOrderBook(tokenID);
		return b.bids?.[0] ? parseFloat(b.bids[0].price) : null;
	};
	const freshAsk = async (): Promise<number | null> => {
		const b = await client.getOrderBook(tokenID);
		return b.asks?.[0] ? parseFloat(b.asks[0].price) : null;
	};

	const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

	const run = async (label: string, fn: () => Promise<unknown>): Promise<unknown> => {
		try {
			const result = await fn();
			log(label, result);
			return result;
		} catch (err) {
			log(label, { error: err instanceof Error ? err.message : String(err) });
			return null;
		}
	};

	// Minimum seed price given available shares (so notional >= minOrderSize)
	const minSeedPrice = (availableShares: number): number =>
		Math.ceil((minOrderSize / availableShares) / tick) * tick;

	// Seed a GTC SELL from wallet1 to seed ask side; returns orderID or null
	const seedAsk = async (seedPrice: number, seedShares: number): Promise<string | null> => {
		console.log(`\n  [seed] GTC SELL ${seedShares} @ ${seedPrice} to seed ask...`);
		const result = await run("SEED ASK", () =>
			client.createAndPostOrder(
				{ tokenID, price: seedPrice, size: seedShares, side: Side.SELL },
				{ tickSize, negRisk },
				OrderType.GTC,
			),
		) as { orderID?: string } | null;
		if (result?.orderID) {
			console.log(`  [seed] ask seeded: ${result.orderID}`);
			return result.orderID;
		}
		return null;
	};

	// Seed a GTC BUY from wallet1 to seed bid side; returns orderID or null
	const seedBid = async (seedPrice: number, seedShares: number): Promise<string | null> => {
		console.log(`\n  [seed] GTC BUY ${seedShares} @ ${seedPrice} to seed bid...`);
		const result = await run("SEED BID", () =>
			client.createAndPostOrder(
				{ tokenID, price: seedPrice, size: seedShares, side: Side.BUY },
				{ tickSize, negRisk },
				OrderType.GTC,
			),
		) as { orderID?: string } | null;
		if (result?.orderID) {
			console.log(`  [seed] bid seeded: ${result.orderID}`);
			return result.orderID;
		}
		return null;
	};

	// Seed a GTC BID from wallet2 at (1-tick) price; returns orderID or null.
	// wallet2 starts with PMCT so this always has funds available.
	const w2SeedBid = async (): Promise<string | null> => {
		if (!client2) return null;
		const seedPrice = parseFloat((1 - tick).toFixed(3));
		const seedShares = parseFloat((orderSizeUSDC / seedPrice).toFixed(2));
		console.log(`\n  [w2] GTC BUY ${seedShares} @ ${seedPrice}...`);
		try {
			const result = await client2.createAndPostOrder(
				{ tokenID, price: seedPrice, size: seedShares, side: Side.BUY },
				{ tickSize, negRisk },
				OrderType.GTC,
			) as { orderID?: string } | null;
			if (result?.orderID) {
				console.log(`  [w2] bid seeded: ${result.orderID}`);
				w2PendingOrders.push(result.orderID);
				await delay(2000);
				return result.orderID;
			}
		} catch (e) {
			console.log(`  [w2] seed bid failed: ${e instanceof Error ? e.message : String(e)}`);
		}
		return null;
	};

	// Seed a GTC ASK from wallet2 using its current token balance; returns orderID or null.
	// wallet2 receives tokens when its GTC BIDs are filled, but on-chain settlement is async —
	// check balance first and wait once if tokens haven't landed yet.
	const w2SeedAsk = async (): Promise<string | null> => {
		if (!client2 || !wallet2) return null;
		let w2Bal = rpcUrl ? await getTokenBalance(wallet2, chainId, tokenID, negRisk) : 0;
		if (w2Bal <= 0) {
			await delay(5000);
			w2Bal = rpcUrl ? await getTokenBalance(wallet2, chainId, tokenID, negRisk) : 0;
		}
		if (w2Bal <= 0) {
			console.log(`  [w2] no token balance for ask seed`);
			return null;
		}
		const seedPrice = parseFloat((1 - tick).toFixed(3));
		const seedShares = parseFloat(Math.min(orderSizeUSDC / seedPrice, w2Bal).toFixed(2));
		console.log(`\n  [w2] GTC SELL ${seedShares} @ ${seedPrice}...`);
		try {
			const result = await client2.createAndPostOrder(
				{ tokenID, price: seedPrice, size: seedShares, side: Side.SELL },
				{ tickSize, negRisk },
				OrderType.GTC,
			) as { orderID?: string } | null;
			if (result?.orderID) {
				console.log(`  [w2] ask seeded: ${result.orderID}`);
				w2PendingOrders.push(result.orderID);
				await delay(2000);
				return result.orderID;
			}
		} catch (e) {
			console.log(`  [w2] seed ask failed: ${e instanceof Error ? e.message : String(e)}`);
		}
		return null;
	};

	// ── 1. Limit BUY ──────────────────────────────────────────────────────────
	const limitBuy = await run("1. Limit BUY", () =>
		client.createAndPostOrder(
			{ tokenID, price: safeBuyPrice, size: limitBuyShares, side: Side.BUY },
			{ tickSize, negRisk },
			OrderType.GTC,
		),
	) as { orderID?: string } | null;
	if (limitBuy?.orderID) pendingOrders.push(limitBuy.orderID);

	// ── 2. Marketable Limit BUY ───────────────────────────────────────────────
	// wallet2 seeds the ask (needs tokens); may be skipped on first run if w2 has none.
	if (!client2) {
		console.log("\n── 2. Marketable Limit BUY ── SKIPPED (no counterparty)");
	} else {
		await w2SeedAsk();
		const ask2 = await freshAsk();
		if (ask2 === null) {
			console.log("\n── 2. Marketable Limit BUY ── SKIPPED (no ask liquidity)");
		} else {
			const shares2 = parseFloat((orderSizeUSDC / ask2).toFixed(2));
			const result2 = await run("2. Marketable Limit BUY", () =>
				client.createAndPostOrder(
					{ tokenID, price: ask2, size: shares2, side: Side.BUY },
					{ tickSize, negRisk },
					OrderType.GTC,
				),
			) as { orderID?: string; status?: string; takingAmount?: string } | null;
			if (result2?.status === "matched" && result2.takingAmount) {
				tokenBal += parseFloat(result2.takingAmount);
			} else if (result2?.orderID) {
				pendingOrders.push(result2.orderID);
			}
		}
	}

	// ── 3. Marketable Limit SELL ──────────────────────────────────────────────
	// wallet2 seeds the bid (needs PMCT — always available from start).
	if (!client2) {
		console.log("\n── 3. Marketable Limit SELL ── SKIPPED (no counterparty)");
	} else if (tokenBal <= 0) {
		console.log("\n── 3. Marketable Limit SELL ── SKIPPED (no token balance)");
	} else {
		await w2SeedBid();
		const bid3 = await freshBid();
		if (bid3 === null) {
			console.log("\n── 3. Marketable Limit SELL ── SKIPPED (no bid liquidity)");
		} else {
			const shares3 = parseFloat(Math.min(orderSizeUSDC / bid3, tokenBal).toFixed(2));
			const result3 = await run("3. Marketable Limit SELL", () =>
				client.createAndPostOrder(
					{ tokenID, price: bid3, size: shares3, side: Side.SELL },
					{ tickSize, negRisk },
					OrderType.GTC,
				),
			) as { orderID?: string; status?: string; makingAmount?: string } | null;
			if (result3?.status === "matched" && result3.makingAmount) {
				tokenBal = Math.max(0, tokenBal - parseFloat(result3.makingAmount));
			} else if (result3?.orderID) {
				pendingOrders.push(result3.orderID);
			}
		}
	}

	// ── 4. Market BUY ─────────────────────────────────────────────────────────
	// wallet2 seeds the ask using tokens it received from step 3's matched bid.
	if (!client2) {
		console.log("\n── 4. Market BUY ── SKIPPED (no counterparty)");
	} else {
		await w2SeedAsk();
		const ask4 = await freshAsk();
		if (ask4 === null) {
			console.log("\n── 4. Market BUY ── SKIPPED (no ask liquidity)");
		} else {
			const result4 = await run("4. Market BUY", () =>
				client.createAndPostMarketOrder(
					{ tokenID, amount: orderSizeUSDC, side: Side.BUY, orderType: OrderType.FOK },
					{ tickSize, negRisk },
					OrderType.FOK,
				),
			) as { status?: string; takingAmount?: string } | null;
			if (result4?.status === "matched" && result4.takingAmount) {
				tokenBal += parseFloat(result4.takingAmount);
			}
		}
	}

	// ── 5. Market SELL ────────────────────────────────────────────────────────
	if (!client2) {
		console.log("\n── 5. Market SELL ── SKIPPED (no counterparty)");
	} else if (tokenBal <= 0) {
		console.log("\n── 5. Market SELL ── SKIPPED (no token balance)");
	} else {
		await w2SeedBid();
		const bid5 = await freshBid();
		if (bid5 === null) {
			console.log("\n── 5. Market SELL ── SKIPPED (no bid liquidity)");
		} else {
			const shares5 = parseFloat(Math.min(orderSizeUSDC / bid5, tokenBal).toFixed(2));
			const result5 = await run("5. Market SELL", () =>
				client.createAndPostMarketOrder(
					{ tokenID, amount: shares5, side: Side.SELL, orderType: OrderType.FOK },
					{ tickSize, negRisk },
					OrderType.FOK,
				),
			) as { status?: string; makingAmount?: string } | null;
			if (result5?.status === "matched" && result5.makingAmount) {
				tokenBal = Math.max(0, tokenBal - parseFloat(result5.makingAmount));
			}
		}
	}

	// ── 6. Market BUY with fees ───────────────────────────────────────────────
	if (!client2) {
		console.log("\n── 6. Market BUY with fees ── SKIPPED (no counterparty)");
	} else {
		await w2SeedAsk();
		const ask6 = await freshAsk();
		if (ask6 === null) {
			console.log("\n── 6. Market BUY with fees ── SKIPPED (no ask liquidity)");
		} else {
			const result6 = await run("6. Market BUY with fees", () =>
				client.createAndPostMarketOrder(
					{
						tokenID,
						amount: orderSizeUSDC,
						side: Side.BUY,
						orderType: OrderType.FOK,
						...(pmctBalance > 0 ? { userUSDCBalance: pmctBalance } : {}),
					},
					{ tickSize, negRisk },
					OrderType.FOK,
				),
			) as { status?: string; takingAmount?: string } | null;
			if (result6?.status === "matched" && result6.takingAmount) {
				tokenBal += parseFloat(result6.takingAmount);
			}
		}
	}

	// ── 7. Market SELL with fees ──────────────────────────────────────────────
	if (!client2) {
		console.log("\n── 7. Market SELL with fees ── SKIPPED (no counterparty)");
	} else if (tokenBal <= 0) {
		console.log("\n── 7. Market SELL with fees ── SKIPPED (no token balance)");
	} else {
		await w2SeedBid();
		const bid7 = await freshBid();
		if (bid7 === null) {
			console.log("\n── 7. Market SELL with fees ── SKIPPED (no bid liquidity)");
		} else {
			const shares7 = parseFloat(Math.min(orderSizeUSDC / bid7, tokenBal).toFixed(2));
			const result7 = await run("7. Market SELL with fees", () =>
				client.createAndPostMarketOrder(
					{
						tokenID,
						amount: shares7,
						side: Side.SELL,
						orderType: OrderType.FOK,
						...(pmctBalance > 0 ? { userUSDCBalance: pmctBalance } : {}),
					},
					{ tickSize, negRisk },
					OrderType.FOK,
				),
			) as { status?: string; makingAmount?: string } | null;
			if (result7?.status === "matched" && result7.makingAmount) {
				tokenBal = Math.max(0, tokenBal - parseFloat(result7.makingAmount));
			}
		}
	}

	// ── 8. Market BUY with fees + builder code ────────────────────────────────
	if (!builderCode) {
		console.log("\n── 8. Market BUY with fees + builder code ── SKIPPED (no BUILDER_CODE in env)");
	} else if (!client2) {
		console.log("\n── 8. Market BUY with fees + builder code ── SKIPPED (no counterparty)");
	} else {
		await w2SeedAsk();
		const ask8 = await freshAsk();
		if (ask8 === null) {
			console.log("\n── 8. Market BUY with fees + builder code ── SKIPPED (no ask liquidity)");
		} else {
			const result8 = await run("8. Market BUY with fees + builder code", () =>
				client.createAndPostMarketOrder(
					{
						tokenID,
						amount: orderSizeUSDC,
						side: Side.BUY,
						orderType: OrderType.FOK,
						builderCode,
						...(pmctBalance > 0 ? { userUSDCBalance: pmctBalance } : {}),
					},
					{ tickSize, negRisk },
					OrderType.FOK,
				),
			) as { status?: string; takingAmount?: string } | null;
			if (result8?.status === "matched" && result8.takingAmount) {
				tokenBal += parseFloat(result8.takingAmount);
			}
		}
	}

	// ── 9. Market SELL with fees + builder code ───────────────────────────────
	if (!builderCode) {
		console.log("\n── 9. Market SELL with fees + builder code ── SKIPPED (no BUILDER_CODE in env)");
	} else if (!client2) {
		console.log("\n── 9. Market SELL with fees + builder code ── SKIPPED (no counterparty)");
	} else if (tokenBal <= 0) {
		console.log("\n── 9. Market SELL with fees + builder code ── SKIPPED (no token balance)");
	} else {
		await w2SeedBid();
		const bid9 = await freshBid();
		if (bid9 === null) {
			console.log("\n── 9. Market SELL with fees + builder code ── SKIPPED (no bid liquidity)");
		} else {
			const shares9 = parseFloat(Math.min(orderSizeUSDC / bid9, tokenBal).toFixed(2));
			const result9 = await run("9. Market SELL with fees + builder code", () =>
				client.createAndPostMarketOrder(
					{
						tokenID,
						amount: shares9,
						side: Side.SELL,
						orderType: OrderType.FOK,
						builderCode,
						...(pmctBalance > 0 ? { userUSDCBalance: pmctBalance } : {}),
					},
					{ tickSize, negRisk },
					OrderType.FOK,
				),
			) as { status?: string; makingAmount?: string } | null;
			if (result9?.status === "matched" && result9.makingAmount) {
				tokenBal = Math.max(0, tokenBal - parseFloat(result9.makingAmount));
			}
		}
	}

	// ── 10. Limit SELL ────────────────────────────────────────────────────────
	if (tokenBal <= 0) {
		console.log("\n── 10. Limit SELL ── SKIPPED (no token balance)");
	} else {
		const limitSellSize = parseFloat(Math.min(limitSellShares, tokenBal).toFixed(2));
		const limitSell = await run("10. Limit SELL", () =>
			client.createAndPostOrder(
				{ tokenID, price: safeSellPrice, size: limitSellSize, side: Side.SELL },
				{ tickSize, negRisk },
				OrderType.GTC,
			),
		) as { orderID?: string } | null;
		if (limitSell?.orderID) pendingOrders.push(limitSell.orderID);
	}

	// ── Cleanup ───────────────────────────────────────────────────────────────
	if (pendingOrders.length > 0) {
		console.log(`\nCancelling ${pendingOrders.length} resting limit order(s)...`);
		for (const id of pendingOrders) {
			const cancel = await client.cancelOrder({ orderID: id });
			console.log(`  Cancelled ${id}:`, JSON.stringify(cancel));
		}
	}

	if (w2PendingOrders.length > 0 && client2) {
		console.log(`\nCancelling ${w2PendingOrders.length} counterparty order(s)...`);
		for (const id of w2PendingOrders) {
			try {
				const cancel = await client2.cancelOrder({ orderID: id });
				console.log(`  Cancelled ${id}:`, JSON.stringify(cancel));
			} catch (e) {
				console.log(`  Cancel ${id} failed (may already be filled): ${e instanceof Error ? e.message : String(e)}`);
			}
		}
	}

	console.log("\nDone.");
}

main()
	.catch(console.error)
	.finally(() => outStream.end());
