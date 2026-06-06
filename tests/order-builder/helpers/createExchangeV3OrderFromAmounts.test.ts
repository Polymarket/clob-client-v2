import { Wallet } from "@ethersproject/wallet";
import { describe, expect, it } from "vitest";

import { createExchangeV3OrderFromAmounts } from "../../../src/order-builder/helpers/createExchangeV3OrderFromAmounts";
import { SignatureTypeV2 } from "../../../src/order-utils";
import { Chain, Side } from "../../../src/types";

describe("createExchangeV3OrderFromAmounts", () => {
	const wallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");

	it("preserves exact ExchangeV3 amounts without tick rounding", async () => {
		const signedOrder = await createExchangeV3OrderFromAmounts(
			wallet,
			Chain.AMOY,
			SignatureTypeV2.EOA,
			wallet.address,
			{
				tokenID: "123",
				makerAmount: "1000000",
				takerAmount: "8000000",
				side: Side.BUY,
			},
		);

		expect(signedOrder.makerAmount).toBe("1000000");
		expect(signedOrder.takerAmount).toBe("8000000");
		expect(signedOrder.side).toBe(Side.BUY);
		expect(signedOrder.signature).not.toBe("");
	});

	it.each([
		["EOA", SignatureTypeV2.EOA],
		["proxy", SignatureTypeV2.POLY_PROXY],
		["Safe", SignatureTypeV2.POLY_GNOSIS_SAFE],
	])("preserves ExchangeV2 %s maker and signer semantics", async (_, signatureType) => {
		const funder = "0x1111111111111111111111111111111111111111";
		const signedOrder = await createExchangeV3OrderFromAmounts(
			wallet,
			Chain.AMOY,
			signatureType,
			funder,
			{
				tokenID: "123",
				makerAmount: "1000000",
				takerAmount: "8000000",
				side: Side.BUY,
			},
		);

		expect(signedOrder.maker).toBe(funder);
		expect(signedOrder.signer).toBe(wallet.address);
		expect(signedOrder.signatureType).toBe(signatureType);
		expect(signedOrder.signature).not.toBe("");
	});

	it("rejects zero amounts", async () => {
		await expect(
			createExchangeV3OrderFromAmounts(
				wallet,
				Chain.AMOY,
				SignatureTypeV2.EOA,
				wallet.address,
				{
					tokenID: "123",
					makerAmount: "0",
					takerAmount: "8000000",
					side: Side.BUY,
				},
			),
		).rejects.toThrow("makerAmount and takerAmount must be positive decimal integers");
	});

	it("rejects non-decimal amounts", async () => {
		await expect(
			createExchangeV3OrderFromAmounts(
				wallet,
				Chain.AMOY,
				SignatureTypeV2.EOA,
				wallet.address,
				{
					tokenID: "123",
					makerAmount: "1.25",
					takerAmount: "8000000",
					side: Side.BUY,
				},
			),
		).rejects.toThrow("makerAmount and takerAmount must be positive decimal integers");
	});

	it("preserves deposit-wallet maker and signer semantics", async () => {
		const depositWallet = "0x1111111111111111111111111111111111111111";
		const signedOrder = await createExchangeV3OrderFromAmounts(
			wallet,
			Chain.AMOY,
			SignatureTypeV2.POLY_1271,
			depositWallet,
			{
				tokenID: "123",
				makerAmount: "1000000",
				takerAmount: "8000000",
				side: Side.BUY,
			},
		);

		expect(signedOrder.maker).toBe(depositWallet);
		expect(signedOrder.signer).toBe(depositWallet);
		expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_1271);
		expect(signedOrder.signature).not.toBe("");
	});
});
