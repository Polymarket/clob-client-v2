import { describe, it, expect, beforeEach } from "vitest";

import { UserMarketOrder, Side, Chain } from "../../../src/types";
import { createMarketOrder } from "../../../src/order-builder/helpers";
import { Wallet } from "@ethersproject/wallet";
import { SignatureTypeV2 } from "../../../src/order-utils";
import { bytes32Zero } from "../../../src/constants";

describe("createMarketOrder", () => {
	let wallet: Wallet;
	beforeEach(() => {
		const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
		wallet = new Wallet(privateKey);
	});

	describe("CTF Exchange", () => {
		describe("buy order", () => {
			it("0.1", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.5,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.1", negRisk: false },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("200000000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.01", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.56,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.01", negRisk: false },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("178571400");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.001", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.056,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.001", negRisk: false },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("1785714280");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.0001", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0056,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.0001", negRisk: false },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("17857142857");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});
		});

		describe("sell order", () => {
			it("0.1", async () => {
				const order: UserMarketOrder = {
					side: Side.SELL,
					tokenID: "123",
					price: 0.5,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.1", negRisk: false },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("50000000");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.01", async () => {
				const order: UserMarketOrder = {
					side: Side.SELL,
					tokenID: "123",
					price: 0.56,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.01", negRisk: false },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("56000000");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.001", async () => {
				const order: UserMarketOrder = {
					side: Side.SELL,
					tokenID: "123",
					price: 0.056,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.001", negRisk: false },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("5600000");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.0001", async () => {
				const order: UserMarketOrder = {
					side: Side.SELL,
					tokenID: "123",
					price: 0.0056,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.0001", negRisk: false },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("560000");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});
		});
	});

	describe("Neg Risk CTF Exchange", () => {
		describe("buy order", () => {
			it("0.1", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.5,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.1", negRisk: true },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("200000000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.01", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.56,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.01", negRisk: true },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("178571400");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.001", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.056,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.001", negRisk: true },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("1785714280");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.0001", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0056,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.0001", negRisk: true },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("17857142857");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});
		});

		describe("sell order", () => {
			it("0.1", async () => {
				const order: UserMarketOrder = {
					side: Side.SELL,
					tokenID: "123",
					price: 0.5,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.1", negRisk: true },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("50000000");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.01", async () => {
				const order: UserMarketOrder = {
					side: Side.SELL,
					tokenID: "123",
					price: 0.56,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.01", negRisk: true },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("56000000");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.001", async () => {
				const order: UserMarketOrder = {
					side: Side.SELL,
					tokenID: "123",
					price: 0.056,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.001", negRisk: true },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("5600000");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.0001", async () => {
				const order: UserMarketOrder = {
					side: Side.SELL,
					tokenID: "123",
					price: 0.0056,
					amount: 100,
				};

				const signedOrder = await createMarketOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.0001", negRisk: true },
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("560000");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.maxFee).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});
		});
	});
});
