import { describe, it, expect, beforeEach } from "vitest";

import { UserOrder, Side, Chain } from "../../../src/types";
import {
	buildOrderCreationArgs,
	buildOrder,
	ROUNDING_CONFIG,
} from "../../../src/order-builder/helpers";
import { Wallet } from "@ethersproject/wallet";
import { ContractConfig, getContractConfig } from "../../../src/config";
import { OrderDataV2, SignatureTypeV2 } from "../../../src/order-utils";

describe("buildOrder", () => {
	const chainId = Chain.AMOY;
	let wallet: Wallet;
	let contractConfig: ContractConfig;
	beforeEach(() => {
		// publicly known private key
		const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
		wallet = new Wallet(privateKey);
		contractConfig = getContractConfig(chainId);
	});

	describe("buy order", () => {
		it("0.1", async () => {
			const order: UserOrder = {
				tokenID: "123",
				price: 0.5,
				size: 21.04,
				side: Side.BUY,
				feeRateBps: 111,
				nonce: 123,
				expiration: 50000,
				taker: "0x0000000000000000000000000000000000000003",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData).not.toBeNull();
			expect(orderData).toBeDefined();

			const signedOrder = await buildOrder(
				wallet,
				contractConfig.exchange,
				chainId,
				orderData,
			);
			expect(signedOrder).not.toBeNull();
			expect(signedOrder).toBeDefined();

			expect(signedOrder.salt).not.toBe("");
			expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000003");
			expect(signedOrder.tokenId).toBe("123");
			expect(signedOrder.makerAmount).toBe("10520000");
			expect(signedOrder.takerAmount).toBe("21040000");
			expect(signedOrder.side).toBe(Side.BUY);
			expect(signedOrder.expiration).toBe("50000");
			expect(signedOrder.nonce).toBe("123");
			expect(signedOrder.feeRateBps).toBe("111");
			expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
			expect(signedOrder.signature).not.toBe("");
		});

		it("0.01", async () => {
			const order: UserOrder = {
				tokenID: "123",
				price: 0.56,
				size: 21.04,
				side: Side.BUY,
				feeRateBps: 111,
				nonce: 123,
				expiration: 50000,
				taker: "0x0000000000000000000000000000000000000003",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData).not.toBeNull();
			expect(orderData).toBeDefined();

			const signedOrder = await buildOrder(
				wallet,
				contractConfig.exchange,
				chainId,
				orderData,
			);
			expect(signedOrder).not.toBeNull();
			expect(signedOrder).toBeDefined();

			expect(signedOrder.salt).not.toBe("");
			expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000003");
			expect(signedOrder.tokenId).toBe("123");
			expect(signedOrder.makerAmount).toBe("11782400");
			expect(signedOrder.takerAmount).toBe("21040000");
			expect(signedOrder.side).toBe(Side.BUY);
			expect(signedOrder.expiration).toBe("50000");
			expect(signedOrder.nonce).toBe("123");
			expect(signedOrder.feeRateBps).toBe("111");
			expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
			expect(signedOrder.signature).not.toBe("");
		});

		it("0.001", async () => {
			const order: UserOrder = {
				tokenID: "123",
				price: 0.056,
				size: 21.04,
				side: Side.BUY,
				feeRateBps: 111,
				nonce: 123,
				expiration: 50000,
				taker: "0x0000000000000000000000000000000000000003",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.001"],
			);
			expect(orderData).not.toBeNull();
			expect(orderData).toBeDefined();

			const signedOrder = await buildOrder(
				wallet,
				contractConfig.exchange,
				chainId,
				orderData,
			);
			expect(signedOrder).not.toBeNull();
			expect(signedOrder).toBeDefined();

			expect(signedOrder.salt).not.toBe("");
			expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000003");
			expect(signedOrder.tokenId).toBe("123");
			expect(signedOrder.makerAmount).toBe("1178240");
			expect(signedOrder.takerAmount).toBe("21040000");
			expect(signedOrder.side).toBe(Side.BUY);
			expect(signedOrder.expiration).toBe("50000");
			expect(signedOrder.nonce).toBe("123");
			expect(signedOrder.feeRateBps).toBe("111");
			expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
			expect(signedOrder.signature).not.toBe("");
		});

		it("0.0001", async () => {
			const order: UserOrder = {
				tokenID: "123",
				price: 0.0056,
				size: 21.04,
				side: Side.BUY,
				feeRateBps: 111,
				nonce: 123,
				expiration: 50000,
				taker: "0x0000000000000000000000000000000000000003",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.0001"],
			);
			expect(orderData).not.toBeNull();
			expect(orderData).toBeDefined();

			const signedOrder = await buildOrder(
				wallet,
				contractConfig.exchange,
				chainId,
				orderData,
			);
			expect(signedOrder).not.toBeNull();
			expect(signedOrder).toBeDefined();

			expect(signedOrder.salt).not.toBe("");
			expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000003");
			expect(signedOrder.tokenId).toBe("123");
			expect(signedOrder.makerAmount).toBe("117824");
			expect(signedOrder.takerAmount).toBe("21040000");
			expect(signedOrder.side).toBe(Side.BUY);
			expect(signedOrder.expiration).toBe("50000");
			expect(signedOrder.nonce).toBe("123");
			expect(signedOrder.feeRateBps).toBe("111");
			expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
			expect(signedOrder.signature).not.toBe("");
		});

		it("precision", async () => {
			const order: UserOrder = {
				tokenID: "123",
				price: 0.82,
				size: 20.0,
				side: Side.BUY,
				feeRateBps: 0,
				nonce: 123,
				expiration: 50000,
				taker: "0x0000000000000000000000000000000000000003",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData).not.toBeNull();
			expect(orderData).toBeDefined();

			const signedOrder = await buildOrder(
				wallet,
				contractConfig.exchange,
				chainId,
				orderData,
			);
			expect(signedOrder).not.toBeNull();
			expect(signedOrder).toBeDefined();

			expect(signedOrder.salt).not.toBe("");
			expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000003");
			expect(signedOrder.tokenId).toBe("123");
			expect(signedOrder.makerAmount).toBe("16400000");
			expect(signedOrder.takerAmount).toBe("20000000");
			expect(signedOrder.side).toBe(Side.BUY);
			expect(signedOrder.expiration).toBe("50000");
			expect(signedOrder.nonce).toBe("123");
			expect(signedOrder.feeRateBps).toBe("0");
			expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
			expect(signedOrder.signature).not.toBe("");
		});
	});

	describe("sell order", () => {
		it("0.1", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.5,
				size: 21.04,
				side: Side.SELL,
				feeRateBps: 0,
				nonce: 0,
				taker: "0x0000000000000000000000000000000000000003",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData).not.toBeNull();
			expect(orderData).toBeDefined();

			const signedOrder = await buildOrder(
				wallet,
				contractConfig.exchange,
				chainId,
				orderData,
			);
			expect(signedOrder).not.toBeNull();
			expect(signedOrder).toBeDefined();

			expect(signedOrder.salt).not.toBe("");
			expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000003");
			expect(signedOrder.tokenId).toBe("5");
			expect(signedOrder.makerAmount).toBe("21040000");
			expect(signedOrder.takerAmount).toBe("10520000");
			expect(signedOrder.side).toBe(Side.SELL);
			expect(signedOrder.expiration).toBe("0");
			expect(signedOrder.nonce).toBe("0");
			expect(signedOrder.feeRateBps).toBe("0");
			expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_PROXY);
			expect(signedOrder.signature).not.toBe("");
		});

		it("0.01", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.56,
				size: 21.04,
				side: Side.SELL,
				feeRateBps: 0,
				nonce: 0,
				taker: "0x0000000000000000000000000000000000000003",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData).not.toBeNull();
			expect(orderData).toBeDefined();

			const signedOrder = await buildOrder(
				wallet,
				contractConfig.exchange,
				chainId,
				orderData,
			);
			expect(signedOrder).not.toBeNull();
			expect(signedOrder).toBeDefined();

			expect(signedOrder.salt).not.toBe("");
			expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000003");
			expect(signedOrder.tokenId).toBe("5");
			expect(signedOrder.makerAmount).toBe("21040000");
			expect(signedOrder.takerAmount).toBe("11782400");
			expect(signedOrder.side).toBe(Side.SELL);
			expect(signedOrder.expiration).toBe("0");
			expect(signedOrder.nonce).toBe("0");
			expect(signedOrder.feeRateBps).toBe("0");
			expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_PROXY);
			expect(signedOrder.signature).not.toBe("");
		});

		it("0.001", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.056,
				size: 21.04,
				side: Side.SELL,
				feeRateBps: 0,
				nonce: 0,
				taker: "0x0000000000000000000000000000000000000003",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.001"],
			);
			expect(orderData).not.toBeNull();
			expect(orderData).toBeDefined();

			const signedOrder = await buildOrder(
				wallet,
				contractConfig.exchange,
				chainId,
				orderData,
			);
			expect(signedOrder).not.toBeNull();
			expect(signedOrder).toBeDefined();

			expect(signedOrder.salt).not.toBe("");
			expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000003");
			expect(signedOrder.tokenId).toBe("5");
			expect(signedOrder.makerAmount).toBe("21040000");
			expect(signedOrder.takerAmount).toBe("1178240");
			expect(signedOrder.side).toBe(Side.SELL);
			expect(signedOrder.expiration).toBe("0");
			expect(signedOrder.nonce).toBe("0");
			expect(signedOrder.feeRateBps).toBe("0");
			expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_PROXY);
			expect(signedOrder.signature).not.toBe("");
		});

		it("0.0001", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.0056,
				size: 21.04,
				side: Side.SELL,
				feeRateBps: 0,
				nonce: 0,
				taker: "0x0000000000000000000000000000000000000003",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.0001"],
			);
			expect(orderData).not.toBeNull();
			expect(orderData).toBeDefined();

			const signedOrder = await buildOrder(
				wallet,
				contractConfig.exchange,
				chainId,
				orderData,
			);
			expect(signedOrder).not.toBeNull();
			expect(signedOrder).toBeDefined();

			expect(signedOrder.salt).not.toBe("");
			expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
			expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000003");
			expect(signedOrder.tokenId).toBe("5");
			expect(signedOrder.makerAmount).toBe("21040000");
			expect(signedOrder.takerAmount).toBe("117824");
			expect(signedOrder.side).toBe(Side.SELL);
			expect(signedOrder.expiration).toBe("0");
			expect(signedOrder.nonce).toBe("0");
			expect(signedOrder.feeRateBps).toBe("0");
			expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_PROXY);
			expect(signedOrder.signature).not.toBe("");
		});
	});
});
