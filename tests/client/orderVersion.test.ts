import { Wallet } from "@ethersproject/wallet";
import { utils } from "ethers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClobClient } from "../../src/client.js";
import { getContractConfig } from "../../src/config.js";
import { ORDER_VERSION_MISMATCH_ERROR } from "../../src/constants.js";
import * as httpHelpers from "../../src/http-helpers/index.js";
import { Chain, type CreateOrderOptions, OrderType, Side } from "../../src/types/index.js";

const POSITION = ((1n << 248n) | (123n << 104n) | 1n).toString();
const CTF_TOKEN = ((1n << 200n) | (1n << 40n)).toString();
const options = { tickSize: "0.01", negRisk: false } as const;
const success = { success: true, errorMsg: "", orderID: "order", status: "live" };
const mismatch = { error: ORDER_VERSION_MISMATCH_ERROR, status: 400 };

function setup(chain = Chain.POLYGON, throwOnError = false) {
	const wallet = new Wallet("0x0000000000000000000000000000000000000000000000000000000000000001");
	const sign = vi.spyOn(wallet, "_signTypedData");
	const client = new ClobClient({
		host: "http://localhost:8080",
		chain,
		signer: wallet,
		throwOnError,
		creds: { key: "key", secret: "c2VjcmV0", passphrase: "passphrase" },
	});
	vi.spyOn(client, "getTickSize").mockResolvedValue("0.01");
	vi.spyOn(client, "getFeeRateBps").mockResolvedValue(0);
	// Seed the existing market fee cache; no market metadata is needed for routing.
	for (const tokenID of [POSITION, CTF_TOKEN]) {
		client.feeInfos[tokenID] = { rate: 0, exponent: 0 };
	}
	const getVersion = vi.spyOn(client, "getVersion").mockResolvedValue(2);
	// Exercise real public submission, serialization and mismatch handling.
	const post = vi.spyOn(httpHelpers, "post").mockResolvedValue(success);
	return { client, wallet, sign, getVersion, post };
}

const workflows = [
	{
		name: "limit",
		create: (
			client: ClobClient,
			tokenID: string,
			opts: Partial<CreateOrderOptions> = options,
		) => client.createOrder({ tokenID, price: 0.4, size: 100, side: Side.BUY }, opts),
		place: (client: ClobClient, tokenID: string, opts: Partial<CreateOrderOptions> = options) =>
			client.createAndPostOrder(
				{ tokenID, price: 0.4, size: 100, side: Side.BUY },
				opts,
				OrderType.GTD,
				true,
				true,
			),
		orderType: OrderType.GTD,
		postOnly: true,
	},
	{
		name: "market",
		create: (
			client: ClobClient,
			tokenID: string,
			opts: Partial<CreateOrderOptions> = options,
		) => client.createMarketOrder({ tokenID, price: 0.4, amount: 40, side: Side.BUY }, opts),
		place: (client: ClobClient, tokenID: string, opts: Partial<CreateOrderOptions> = options) =>
			client.createAndPostMarketOrder(
				{ tokenID, price: 0.4, amount: 40, side: Side.BUY },
				opts,
				OrderType.FAK,
				true,
			),
		orderType: OrderType.FAK,
		postOnly: false,
	},
];

afterEach(() => vi.restoreAllMocks());

describe.each(workflows)("$name order version selection", workflow => {
	it.each([
		Chain.POLYGON,
		Chain.AMOY,
	])("signs V2 positions against Exchange V3 on chain %s", async chain => {
		const { client, wallet, sign, getVersion } = setup(chain);
		for (const negRisk of [false, true]) {
			const order = await workflow.create(client, POSITION, { ...options, negRisk });
			const call = sign.mock.calls.at(-1);
			if (!call) throw new Error("Expected an order signature");
			const [domain, types, value] = call;
			expect(domain).toMatchObject({
				version: "3",
				chainId: chain,
				verifyingContract: getContractConfig(chain).exchangeV3,
			});
			expect(utils.verifyTypedData(domain, types, value, order.signature)).toBe(
				wallet.address,
			);
			expect(order).not.toHaveProperty("version");
		}
		expect(getVersion).not.toHaveBeenCalled();
	});

	it.each([
		1, 2, 3,
	] as const)("honors explicit version %s for both token generations", async version => {
		const { client, sign, getVersion } = setup();
		const contracts = getContractConfig(Chain.POLYGON);
		for (const tokenID of [POSITION, CTF_TOKEN]) {
			for (const negRisk of [false, true]) {
				await workflow.place(client, tokenID, { ...options, negRisk, version });
				const expected =
					version === 3
						? contracts.exchangeV3
						: version === 2
							? negRisk
								? contracts.negRiskExchangeV2
								: contracts.exchangeV2
							: negRisk
								? contracts.negRiskExchange
								: contracts.exchange;
				expect(sign.mock.calls.at(-1)?.[0]).toMatchObject({
					version: String(version),
					verifyingContract: expected,
				});
			}
		}
		expect(getVersion).not.toHaveBeenCalled();
	});

	it("keeps inferred V3 out of the global cache when alternating tokens", async () => {
		const { client, sign, getVersion } = setup();
		for (const tokenID of [POSITION, CTF_TOKEN, POSITION, CTF_TOKEN]) {
			await workflow.create(client, tokenID);
		}
		expect(sign.mock.calls.map(([domain]) => domain.version)).toEqual(["3", "2", "3", "2"]);
		expect(getVersion).toHaveBeenCalledTimes(1);
	});

	it("places an automatic V3 order without fetching the server version", async () => {
		const { client, getVersion, post, sign } = setup();
		getVersion.mockRejectedValue(new Error("/version unavailable"));
		expect(await workflow.place(client, POSITION)).toEqual(success);
		expect(getVersion).not.toHaveBeenCalled();
		expect(sign).toHaveBeenCalledTimes(1);
		expect(post).toHaveBeenCalledTimes(1);
		expect(post.mock.calls[0][1]?.data).toMatchObject({
			orderType: workflow.orderType,
			postOnly: workflow.postOnly,
			deferExec: true,
		});
	});

	it("recovers legacy automatic orders when the server version changes", async () => {
		const { client, sign, getVersion, post } = setup();
		getVersion.mockResolvedValueOnce(1).mockResolvedValue(2);
		post.mockResolvedValueOnce(mismatch).mockResolvedValue(success);
		expect(await workflow.place(client, CTF_TOKEN)).toEqual(success);
		expect(sign.mock.calls.map(([domain]) => domain.version)).toEqual(["1", "2"]);
		expect(post).toHaveBeenCalledTimes(2);
		expect(getVersion).toHaveBeenCalledTimes(2);
	});

	it("does not repeat a legacy mismatch when the server version is unchanged", async () => {
		const { client, post } = setup();
		post.mockResolvedValue(mismatch);
		expect(await workflow.place(client, CTF_TOKEN)).toEqual(mismatch);
		expect(post).toHaveBeenCalledTimes(1);
	});

	it.each([
		undefined,
		1,
		2,
		3,
	] as const)("does not rebuild a V3 position on mismatch with override %s", async version => {
		const { client, sign, getVersion, post } = setup();
		getVersion.mockResolvedValueOnce(1).mockResolvedValue(2);
		post.mockResolvedValue(mismatch);
		expect(await workflow.place(client, POSITION, { ...options, version })).toEqual(mismatch);
		expect(sign).toHaveBeenCalledTimes(1);
		expect(sign.mock.calls[0][0].version).toBe(String(version ?? 3));
		expect(post).toHaveBeenCalledTimes(1);
	});

	it("preserves throwOnError for V3 mismatches", async () => {
		const { client, post, sign } = setup(Chain.POLYGON, true);
		post.mockResolvedValue(mismatch);
		await expect(workflow.place(client, POSITION)).rejects.toThrow(
			ORDER_VERSION_MISMATCH_ERROR,
		);
		expect(sign).toHaveBeenCalledTimes(1);
		expect(post).toHaveBeenCalledTimes(1);
	});
});

it("preserves separately signed orders in individual submissions and mixed batches", async () => {
	const { client, sign, post, getVersion } = setup();
	const orders = [
		await client.createOrder(
			{ tokenID: CTF_TOKEN, price: 0.4, size: 100, side: Side.BUY },
			{ ...options, version: 1 },
		),
		await client.createOrder(
			{ tokenID: CTF_TOKEN, price: 0.4, size: 100, side: Side.BUY },
			options,
		),
		await client.createOrder(
			{ tokenID: POSITION, price: 0.4, size: 100, side: Side.BUY },
			options,
		),
	];
	const originals = structuredClone(orders);
	for (const order of orders) await client.postOrder(order);
	const individualPayloads = post.mock.calls.map(call => call[1]?.data);
	post.mockResolvedValue(orders.map(() => success));
	await client.postOrders(orders.map(order => ({ order, orderType: OrderType.GTC })));
	expect(post.mock.calls.at(-1)?.[1]?.data).toEqual(individualPayloads);
	for (const [index, payload] of individualPayloads.entries()) {
		expect(payload.order.signature).toBe(orders[index].signature);
		expect(payload.order.tokenId).toBe(orders[index].tokenId);
		expect(payload.order).not.toHaveProperty("version");
	}
	expect(orders).toEqual(originals);
	expect(sign).toHaveBeenCalledTimes(3);
	expect(getVersion).toHaveBeenCalledTimes(1);
});
