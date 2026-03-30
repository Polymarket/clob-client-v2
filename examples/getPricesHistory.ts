import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

import { Chain, ClobClient, type PriceHistoryFilterParams, PriceHistoryInterval } from "../src";

dotenvConfig({ path: resolve(__dirname, "../.env") });

const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
const NO = "52114319501245915516055106046884209969926127482827954674443846427813813222426";

async function main() {
	const host = process.env.CLOB_API_URL || "http://localhost:8080";
	const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
	const clobClient = new ClobClient({ host, chain: chainId });

	// By time range
	const now = Date.now() / 1000;
	console.log(
		await clobClient.getPricesHistory({
			startTs: now - 1000,
			endTs: now,
			market: YES,
		} as PriceHistoryFilterParams),
	);
	console.log(
		await clobClient.getPricesHistory({
			startTs: now - 1000,
			endTs: now,
			market: NO,
		} as PriceHistoryFilterParams),
	);

	// By interval
	console.log(
		await clobClient.getPricesHistory({
			market: YES,
			interval: PriceHistoryInterval.ONE_HOUR,
			fidelity: 1,
		} as PriceHistoryFilterParams),
	);
	console.log(
		await clobClient.getPricesHistory({
			market: YES,
			interval: PriceHistoryInterval.SIX_HOURS,
			fidelity: 3,
		} as PriceHistoryFilterParams),
	);
	console.log(
		await clobClient.getPricesHistory({
			market: YES,
			interval: PriceHistoryInterval.ONE_DAY,
			fidelity: 5,
		} as PriceHistoryFilterParams),
	);
	console.log(
		await clobClient.getPricesHistory({
			market: YES,
			interval: PriceHistoryInterval.ONE_WEEK,
			fidelity: 10,
		} as PriceHistoryFilterParams),
	);
}

main();
