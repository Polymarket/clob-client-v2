import { Wallet } from "@ethersproject/wallet";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClobClient } from "../../src/client.js";
import { getContractConfig } from "../../src/config.js";
import { ORDER_VERSION_MISMATCH_ERROR } from "../../src/constants.js";
import * as httpHelpers from "../../src/http-helpers/index.js";
import { Chain, type OrderVersion, Side } from "../../src/types/index.js";

const POSITION = ((1n << 248n) | 1n).toString();
const CTF_TOKEN = ((1n << 200n) | (1n << 40n)).toString();
const success = { success: true, orderID: "order", status: "live" };
const mismatch = { error: ORDER_VERSION_MISMATCH_ERROR, status: 400 };

afterEach(() => vi.restoreAllMocks());

describe.each(["createAndPostOrder", "createAndPostMarketOrder"] as const)("%s routing", method => {
	function setup() {
		const wallet = new Wallet(
			"0x0000000000000000000000000000000000000000000000000000000000000001",
		);
		const sign = vi.spyOn(wallet, "_signTypedData");
		const client = new ClobClient({
			host: "http://localhost:8080",
			chain: Chain.POLYGON,
			signer: wallet,
			creds: { key: "key", secret: "c2VjcmV0", passphrase: "passphrase" },
		});
		vi.spyOn(client, "getTickSize").mockResolvedValue("0.01");
		vi.spyOn(client, "getFeeRateBps").mockResolvedValue(0);
		for (const tokenID of [POSITION, CTF_TOKEN])
			client.feeInfos[tokenID] = { rate: 0, exponent: 0 };
		const getVersion = vi.spyOn(client, "getVersion").mockResolvedValue(2);
		const post = vi.spyOn(httpHelpers, "post").mockResolvedValue(success);
		const place = (tokenID: string, version?: OrderVersion) => {
			const order = { tokenID, price: 0.4, size: 100, amount: 40, side: Side.BUY };
			const options = { tickSize: "0.01", negRisk: false, version } as const;
			return method === "createAndPostOrder"
				? client.createAndPostOrder(order, options)
				: client.createAndPostMarketOrder(order, options);
		};
		return { sign, getVersion, post, place };
	}

	it("routes V2 positions without /version and keeps the legacy cache separate", async () => {
		const { sign, getVersion, place } = setup();
		expect(await place(POSITION)).toEqual(success);
		expect(getVersion).not.toHaveBeenCalled();
		expect(sign.mock.calls[0][0]).toMatchObject({
			version: "3",
			verifyingContract: getContractConfig(Chain.POLYGON).exchangeV3,
		});
		for (const tokenID of [CTF_TOKEN, POSITION, CTF_TOKEN]) await place(tokenID);
		expect(sign.mock.calls.map(([domain]) => domain.version)).toEqual(["3", "2", "3", "2"]);
		expect(getVersion).toHaveBeenCalledTimes(1);
	});

	it.each([1, 2, 3] as const)("honors explicit version %s without /version", async version => {
		const { sign, getVersion, place } = setup();
		await place(POSITION, version);
		expect(sign.mock.calls[0][0].version).toBe(String(version));
		expect(getVersion).not.toHaveBeenCalled();
	});

	it.each([
		{ tokenID: POSITION, version: undefined, signedVersions: ["3"] },
		{ tokenID: CTF_TOKEN, version: 3, signedVersions: ["3"] },
		{ tokenID: CTF_TOKEN, version: undefined, signedVersions: ["1", "2"] },
	] as const)("retries a migration mismatch only for automatic legacy routing: %j", async ({
		tokenID,
		version,
		signedVersions,
	}) => {
		const { sign, getVersion, post, place } = setup();
		getVersion.mockResolvedValueOnce(1).mockResolvedValue(2);
		post.mockResolvedValueOnce(mismatch).mockResolvedValue(success);
		await place(tokenID, version);
		expect(sign.mock.calls.map(([domain]) => domain.version)).toEqual(signedVersions);
		expect(post).toHaveBeenCalledTimes(signedVersions.length);
	});
});
