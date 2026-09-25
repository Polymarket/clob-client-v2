import { Wallet } from "@ethersproject/wallet";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClobClient } from "../../src/client.js";
import { getContractConfig } from "../../src/config.js";
import { bytes32Zero } from "../../src/constants.js";
import { Chain, type OrderAsset, OrderType, Side } from "../../src/types/index.js";

const host = "http://localhost:8080";
const positionID = "456";
const placed = { success: true, orderID: "0xorder", status: "live" };

const makeClient = () => {
	const signer = new Wallet("0x0000000000000000000000000000000000000000000000000000000000000001");
	const sign = vi.spyOn(signer, "_signTypedData");
	const client = new ClobClient({
		host,
		chain: Chain.AMOY,
		signer,
		creds: { key: "key", secret: "c2VjcmV0LXNlY3JldC1zZWNyZXQ=", passphrase: "passphrase" },
	});
	// Mock only HTTP: metadata caching, price/fee calculations, signing and serialization are real.
	const get = vi.spyOn(client as any, "get").mockImplementation(async (url: unknown) => {
		switch (url) {
			case `${host}/version`:
				return { version: 2 };
			case `${host}/tick-size`:
				return { minimum_tick_size: 0.01 };
			case `${host}/neg-risk`:
				return { neg_risk: false };
			case `${host}/fee-rate`:
				return { base_fee: 0 };
			case `${host}/markets-by-token/${positionID}`:
				return { condition_id: "market-a" };
			case `${host}/clob-markets/market-a`:
				return {
					c: "market-a",
					t: [{ t: positionID, o: "Yes" }],
					mts: 0.01,
					nr: true,
					fd: { r: 0.2, e: 1 },
					r: null,
				};
			case `${host}/book`:
				return {
					asks: [{ price: "0.5", size: "100" }],
					bids: [{ price: "0.4", size: "100" }],
				};
			default:
				throw new Error(`Unexpected GET ${url}`);
		}
	});
	const post = vi.spyOn(client as any, "post").mockResolvedValue(placed);
	return { client, signer, sign, get, post };
};

afterEach(() => vi.restoreAllMocks());

describe.each(["limit", "market"] as const)("public %s position orders", kind => {
	it.each([undefined, 1, 2, 3])("signs against V3 with version override %s", async version => {
		const { client, sign, get } = makeClient();
		const options = { version, negRisk: true };
		const order =
			kind === "limit"
				? await client.createOrder(
						{ positionID, side: Side.BUY, price: 0.5, size: 20 },
						options,
					)
				: await client.createMarketOrder(
						{ positionID, side: Side.BUY, price: 0.5, amount: 10 },
						options,
					);

		expect(sign).toHaveBeenCalledExactlyOnceWith(
			{
				name: "Polymarket CTF Exchange",
				version: "3",
				chainId: Chain.AMOY,
				verifyingContract: getContractConfig(Chain.AMOY).exchangeV3,
			},
			expect.any(Object),
			expect.objectContaining({
				tokenId: positionID,
				makerAmount: "10000000",
				takerAmount: "20000000",
			}),
		);
		expect(order.tokenId).toBe(positionID);
		expect(order.signature).toMatch(/^0x[0-9a-f]{130}$/i);
		expect(get.mock.calls.map(([url]) => url)).not.toContain(`${host}/version`);
		expect(get.mock.calls.map(([url]) => url)).not.toContain(`${host}/neg-risk`);
		expect(get.mock.calls.map(([url]) => url)).not.toContain(`${host}/fee-rate`);
		if (kind === "limit") {
			expect(get).toHaveBeenCalledWith(`${host}/tick-size`, {
				params: { token_id: positionID },
			});
		}
	});

	it("uses the position ID for fee and book lookups", async () => {
		const { client, get } = makeClient();
		const order =
			kind === "limit"
				? await client.createOrder({
						positionID,
						side: Side.BUY,
						price: 0.5,
						size: 20,
						userUSDCBalance: 10,
					})
				: await client.createMarketOrder({
						positionID,
						side: Side.BUY,
						amount: 10,
						userUSDCBalance: 10,
					});

		expect(get).toHaveBeenCalledWith(`${host}/markets-by-token/${positionID}`);
		expect(get).toHaveBeenCalledWith(`${host}/clob-markets/market-a`);
		expect(client.feeInfos[positionID]).toEqual({ rate: 0.2, exponent: 1 });
		// A $10 balance reserves $1 in fees at a 0.5 price, leaving $9 for 18 shares.
		expect(order).toMatchObject({
			tokenId: positionID,
			makerAmount: "9000000",
			takerAmount: "18000000",
		});
		if (kind === "market") {
			expect(get).toHaveBeenCalledWith(`${host}/book`, { params: { token_id: positionID } });
		}
	});

	it("posts the signed position under the wire tokenId field", async () => {
		const { client, signer, sign, post } = makeClient();
		const response =
			kind === "limit"
				? await client.createAndPostOrder({
						positionID,
						side: Side.BUY,
						price: 0.5,
						size: 20,
					})
				: await client.createAndPostMarketOrder({ positionID, side: Side.BUY, amount: 10 });
		const signedMessage = sign.mock.calls[0][2];

		expect(response).toEqual(placed);
		expect(post).toHaveBeenCalledExactlyOnceWith(
			`${host}/order`,
			{
				headers: expect.any(Object),
				data: {
					owner: "key",
					orderType: kind === "limit" ? OrderType.GTC : OrderType.FOK,
					postOnly: false,
					deferExec: false,
					order: {
						salt: Number(signedMessage.salt),
						maker: signer.address,
						signer: signer.address,
						taker: undefined,
						tokenId: positionID,
						makerAmount: "10000000",
						takerAmount: "20000000",
						side: Side.BUY,
						signatureType: 0,
						timestamp: signedMessage.timestamp,
						expiration: "0",
						metadata: bytes32Zero,
						builder: bytes32Zero,
						signature: await sign.mock.results[0].value,
					},
				},
			},
			true,
		);
	});

	it.each([
		{},
		{ tokenID: "123", positionID },
		{ tokenID: "123", positionID: null },
		{ tokenID: null, positionID },
		{ positionID: null },
		{ positionID: "" },
		{ positionID: 456 },
	])("rejects invalid identifiers before HTTP or signing: %j", async identifiers => {
		const { client, get, post, sign } = makeClient();
		const asset = identifiers as unknown as OrderAsset;
		const creating =
			kind === "limit"
				? client.createAndPostOrder({ ...asset, side: Side.BUY, price: 0.5, size: 20 })
				: client.createAndPostMarketOrder({ ...asset, side: Side.BUY, amount: 10 });
		await expect(creating).rejects.toThrow(
			"Exactly one of tokenID or positionID must be provided as a non-empty string",
		);
		expect(get).not.toHaveBeenCalled();
		expect(post).not.toHaveBeenCalled();
		expect(sign).not.toHaveBeenCalled();
	});
});

describe("token order compatibility", () => {
	it.each([undefined, 1, 2, 3])("preserves version selection %s", async version => {
		const { client, sign } = makeClient();
		await client.createOrder(
			{ tokenID: "123", side: Side.BUY, price: 0.5, size: 20 },
			{ version },
		);
		const selectedVersion = version ?? 2;
		const contracts = getContractConfig(Chain.AMOY);
		expect(sign.mock.calls[0][0]).toMatchObject({
			version: String(selectedVersion),
			verifyingContract:
				selectedVersion === 1
					? contracts.exchange
					: selectedVersion === 2
						? contracts.exchangeV2
						: contracts.exchangeV3,
		});
		expect(sign.mock.calls[0][2].tokenId).toBe("123");
	});
});
