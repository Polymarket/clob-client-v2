import { Wallet } from "@ethersproject/wallet";
import { beforeEach, describe, expect, it } from "vitest";
import { ExchangeOrderBuilderV1 } from "../../src/order-utils/exchangeOrderBuilderV1";
import type { OrderDataV1 } from "../../src/order-utils/model/orderDataV1";
import { Side } from "../../src/order-utils/model/side";
import { generateOrderSalt } from "../../src/order-utils/utils";

describe("exchangeOrderBuilderV1", () => {
	describe("CTFexchange", () => {
		let wallet: Wallet;
		let exchangeOrderBuilder: ExchangeOrderBuilderV1;

		beforeEach(async () => {
			const chainId = 80002;

			// exchange address
			const exchangeAddress = "0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40";

			// publicly known private key
			const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
			wallet = new Wallet(privateKey);

			exchangeOrderBuilder = new ExchangeOrderBuilderV1(
				exchangeAddress,
				chainId,
				wallet,
				generateOrderSalt,
			);
		});

		describe("buildOrder", () => {
			it("random salt", async () => {
				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				expect(order.salt).not.toBe("");
				expect(order.maker).toBe(wallet.address);
				expect(order.signer).toBe(wallet.address);
				expect(order.taker).toBe("0x0000000000000000000000000000000000000000");
				expect(order.tokenId).toBe("1234");
				expect(order.makerAmount).toBe("100000000");
				expect(order.takerAmount).toBe("50000000");
				expect(order.side).toBe(Side.BUY);
				expect(order.expiration).toBe("0");
				expect(order.nonce).toBe("0");
				expect(order.feeRateBps).toBe("100");
				expect(order.signatureType).toBe(0);
			});

			it("specific salt", async () => {
				(exchangeOrderBuilder as any).generateSalt = () => {
					return "479249096354";
				};

				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				expect(order).toEqual({
					salt: "479249096354",
					maker: wallet.address,
					signer: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					expiration: "0",
					nonce: "0",
					feeRateBps: "100",
					side: Side.BUY,
					signatureType: 0,
				});
			});
		});

		describe("buildLimitOrderTypedData", () => {
			it("random salt", async () => {
				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				expect(orderTypedData).toEqual({
					primaryType: "Order",
					types: {
						EIP712Domain: [
							{ name: "name", type: "string" },
							{ name: "version", type: "string" },
							{ name: "chainId", type: "uint256" },
							{ name: "verifyingContract", type: "address" },
						],
						Order: [
							{ name: "salt", type: "uint256" },
							{ name: "maker", type: "address" },
							{ name: "signer", type: "address" },
							{ name: "taker", type: "address" },
							{ name: "tokenId", type: "uint256" },
							{ name: "makerAmount", type: "uint256" },
							{ name: "takerAmount", type: "uint256" },
							{ name: "expiration", type: "uint256" },
							{ name: "nonce", type: "uint256" },
							{ name: "feeRateBps", type: "uint256" },
							{ name: "side", type: "uint8" },
							{ name: "signatureType", type: "uint8" },
						],
					},
					domain: {
						name: "Polymarket CTF Exchange",
						version: "1",
						chainId: 80002,
						verifyingContract: "0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40",
					},
					message: {
						salt: orderTypedData.message.salt,
						maker: wallet.address,
						signer: wallet.address,
						taker: "0x0000000000000000000000000000000000000000",
						tokenId: "1234",
						makerAmount: "100000000",
						takerAmount: "50000000",
						expiration: "0",
						nonce: "0",
						feeRateBps: "100",
						side: 0,
						signatureType: 0,
					},
				});
			});

			it("specific salt", async () => {
				(exchangeOrderBuilder as any).generateSalt = () => {
					return "479249096354";
				};

				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				expect(orderTypedData).toEqual({
					primaryType: "Order",
					types: {
						EIP712Domain: [
							{ name: "name", type: "string" },
							{ name: "version", type: "string" },
							{ name: "chainId", type: "uint256" },
							{ name: "verifyingContract", type: "address" },
						],
						Order: [
							{ name: "salt", type: "uint256" },
							{ name: "maker", type: "address" },
							{ name: "signer", type: "address" },
							{ name: "taker", type: "address" },
							{ name: "tokenId", type: "uint256" },
							{ name: "makerAmount", type: "uint256" },
							{ name: "takerAmount", type: "uint256" },
							{ name: "expiration", type: "uint256" },
							{ name: "nonce", type: "uint256" },
							{ name: "feeRateBps", type: "uint256" },
							{ name: "side", type: "uint8" },
							{ name: "signatureType", type: "uint8" },
						],
					},
					domain: {
						name: "Polymarket CTF Exchange",
						version: "1",
						chainId: 80002,
						verifyingContract: "0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40",
					},
					message: {
						salt: "479249096354",
						maker: wallet.address,
						signer: wallet.address,
						taker: "0x0000000000000000000000000000000000000000",
						tokenId: "1234",
						makerAmount: "100000000",
						takerAmount: "50000000",
						expiration: "0",
						nonce: "0",
						feeRateBps: "100",
						side: 0,
						signatureType: 0,
					},
				});
			});
		});

		describe("buildOrderSignature", () => {
			it("random salt", async () => {
				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				const orderSignature =
					await exchangeOrderBuilder.buildOrderSignature(orderTypedData);
				expect(orderSignature).not.toBeNull();
				expect(orderSignature).toBeDefined();
				expect(orderSignature).not.toBe("");
			});

			it("specific salt", async () => {
				(exchangeOrderBuilder as any).generateSalt = () => {
					return "479249096354";
				};

				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				const orderSignature =
					await exchangeOrderBuilder.buildOrderSignature(orderTypedData);
				expect(orderSignature).not.toBeNull();
				expect(orderSignature).toBeDefined();
				expect(orderSignature).not.toBe("");

				expect(orderSignature).toBe(
					"0x302cd9abd0b5fcaa202a344437ec0b6660da984e24ae9ad915a592a90facf5a51bb8a873cd8d270f070217fea1986531d5eec66f1162a81f66e026db653bf7ce1c",
				);
			});
		});

		describe("buildOrderHash", () => {
			it("random salt", async () => {
				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				const orderHash = exchangeOrderBuilder.buildOrderHash(orderTypedData);
				expect(orderHash).not.toBeNull();
				expect(orderHash).toBeDefined();
			});

			it("specific salt", async () => {
				(exchangeOrderBuilder as any).generateSalt = () => {
					return "479249096354";
				};

				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				const orderHash = exchangeOrderBuilder.buildOrderHash(orderTypedData);
				expect(orderHash).not.toBeNull();
				expect(orderHash).toBeDefined();

				expect(orderHash).toBe(
					"0x02ca1d1aa31103804173ad1acd70066cb6c1258a4be6dada055111f9a7ea4e55",
				);
			});
		});

		describe("buildSignedOrder", () => {
			it("random salt", async () => {
				const signedOrder = await exchangeOrderBuilder.buildSignedOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe(wallet.address);
				expect(signedOrder.signer).toBe(wallet.address);
				expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000000");
				expect(signedOrder.tokenId).toBe("1234");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("50000000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.nonce).toBe("0");
				expect(signedOrder.feeRateBps).toBe("100");
				expect(signedOrder.signatureType).toBe(0);
				expect(signedOrder.signature).not.toBe("");
			});

			it("specific salt", async () => {
				(exchangeOrderBuilder as any).generateSalt = () => {
					return "479249096354";
				};

				const signedOrder = await exchangeOrderBuilder.buildSignedOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder).toEqual({
					salt: "479249096354",
					maker: wallet.address,
					signer: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					expiration: "0",
					nonce: "0",
					feeRateBps: "100",
					signatureType: 0,
					signature:
						"0x302cd9abd0b5fcaa202a344437ec0b6660da984e24ae9ad915a592a90facf5a51bb8a873cd8d270f070217fea1986531d5eec66f1162a81f66e026db653bf7ce1c",
				});
			});
		});
	});

	describe("Neg Risk CTFExchange", () => {
		let wallet: Wallet;
		let exchangeOrderBuilder: ExchangeOrderBuilderV1;

		beforeEach(async () => {
			const chainId = 80002;

			// exchange address
			const negRiskExchangeAddress = "0xC5d563A36AE78145C45a50134d48A1215220f80a";

			// publicly known private key
			const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
			wallet = new Wallet(privateKey);

			exchangeOrderBuilder = new ExchangeOrderBuilderV1(
				negRiskExchangeAddress,
				chainId,
				wallet,
				generateOrderSalt,
			);
		});

		describe("buildOrder", () => {
			it("random salt", async () => {
				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				expect(order.salt).not.toBe("");
				expect(order.maker).toBe(wallet.address);
				expect(order.signer).toBe(wallet.address);
				expect(order.taker).toBe("0x0000000000000000000000000000000000000000");
				expect(order.tokenId).toBe("1234");
				expect(order.makerAmount).toBe("100000000");
				expect(order.takerAmount).toBe("50000000");
				expect(order.side).toBe(Side.BUY);
				expect(order.expiration).toBe("0");
				expect(order.nonce).toBe("0");
				expect(order.feeRateBps).toBe("100");
				expect(order.signatureType).toBe(0);
			});

			it("specific salt", async () => {
				(exchangeOrderBuilder as any).generateSalt = () => {
					return "479249096354";
				};

				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				} as OrderDataV1);

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				expect(order).toEqual({
					salt: "479249096354",
					maker: wallet.address,
					signer: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					expiration: "0",
					nonce: "0",
					feeRateBps: "100",
					side: Side.BUY,
					signatureType: 0,
				});
			});
		});

		describe("buildLimitOrderTypedData", () => {
			it("random salt", async () => {
				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				expect(orderTypedData).toEqual({
					primaryType: "Order",
					types: {
						EIP712Domain: [
							{ name: "name", type: "string" },
							{ name: "version", type: "string" },
							{ name: "chainId", type: "uint256" },
							{ name: "verifyingContract", type: "address" },
						],
						Order: [
							{ name: "salt", type: "uint256" },
							{ name: "maker", type: "address" },
							{ name: "signer", type: "address" },
							{ name: "taker", type: "address" },
							{ name: "tokenId", type: "uint256" },
							{ name: "makerAmount", type: "uint256" },
							{ name: "takerAmount", type: "uint256" },
							{ name: "expiration", type: "uint256" },
							{ name: "nonce", type: "uint256" },
							{ name: "feeRateBps", type: "uint256" },
							{ name: "side", type: "uint8" },
							{ name: "signatureType", type: "uint8" },
						],
					},
					domain: {
						name: "Polymarket CTF Exchange",
						version: "1",
						chainId: 80002,
						verifyingContract: "0xC5d563A36AE78145C45a50134d48A1215220f80a",
					},
					message: {
						salt: orderTypedData.message.salt,
						maker: wallet.address,
						signer: wallet.address,
						taker: "0x0000000000000000000000000000000000000000",
						tokenId: "1234",
						makerAmount: "100000000",
						takerAmount: "50000000",
						expiration: "0",
						nonce: "0",
						feeRateBps: "100",
						side: 0,
						signatureType: 0,
					},
				});
			});

			it("specific salt", async () => {
				(exchangeOrderBuilder as any).generateSalt = () => {
					return "479249096354";
				};

				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				expect(orderTypedData).toEqual({
					primaryType: "Order",
					types: {
						EIP712Domain: [
							{ name: "name", type: "string" },
							{ name: "version", type: "string" },
							{ name: "chainId", type: "uint256" },
							{ name: "verifyingContract", type: "address" },
						],
						Order: [
							{ name: "salt", type: "uint256" },
							{ name: "maker", type: "address" },
							{ name: "signer", type: "address" },
							{ name: "taker", type: "address" },
							{ name: "tokenId", type: "uint256" },
							{ name: "makerAmount", type: "uint256" },
							{ name: "takerAmount", type: "uint256" },
							{ name: "expiration", type: "uint256" },
							{ name: "nonce", type: "uint256" },
							{ name: "feeRateBps", type: "uint256" },
							{ name: "side", type: "uint8" },
							{ name: "signatureType", type: "uint8" },
						],
					},
					domain: {
						name: "Polymarket CTF Exchange",
						version: "1",
						chainId: 80002,
						verifyingContract: "0xC5d563A36AE78145C45a50134d48A1215220f80a",
					},
					message: {
						salt: "479249096354",
						maker: wallet.address,
						signer: wallet.address,
						taker: "0x0000000000000000000000000000000000000000",
						tokenId: "1234",
						makerAmount: "100000000",
						takerAmount: "50000000",
						expiration: "0",
						nonce: "0",
						feeRateBps: "100",
						side: 0,
						signatureType: 0,
					},
				});
			});
		});

		describe("buildOrderSignature", () => {
			it("random salt", async () => {
				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				const orderSignature =
					await exchangeOrderBuilder.buildOrderSignature(orderTypedData);
				expect(orderSignature).not.toBeNull();
				expect(orderSignature).toBeDefined();
				expect(orderSignature).not.toBe("");
			});

			it("specific salt", async () => {
				(exchangeOrderBuilder as any).generateSalt = () => {
					return "479249096354";
				};

				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				const orderSignature =
					await exchangeOrderBuilder.buildOrderSignature(orderTypedData);
				expect(orderSignature).not.toBeNull();
				expect(orderSignature).toBeDefined();
				expect(orderSignature).not.toBe("");

				expect(orderSignature).toBe(
					"0x1b3646ef347e5bd144c65bd3357ba19c12c12abaeedae733cf8579bc51a2752c0454c3bc6b236957e393637982c769b8dc0706c0f5c399983d933850afd1cbcd1c",
				);
			});
		});

		describe("buildOrderHash", () => {
			it("random salt", async () => {
				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				const orderHash = exchangeOrderBuilder.buildOrderHash(orderTypedData);
				expect(orderHash).not.toBeNull();
				expect(orderHash).toBeDefined();
			});

			it("specific salt", async () => {
				(exchangeOrderBuilder as any).generateSalt = () => {
					return "479249096354";
				};

				const order = await exchangeOrderBuilder.buildOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});

				expect(order).not.toBeNull();
				expect(order).toBeDefined();

				const orderTypedData = exchangeOrderBuilder.buildOrderTypedData(order);
				expect(orderTypedData).not.toBeNull();
				expect(orderTypedData).toBeDefined();

				const orderHash = exchangeOrderBuilder.buildOrderHash(orderTypedData);
				expect(orderHash).not.toBeNull();
				expect(orderHash).toBeDefined();

				expect(orderHash).toBe(
					"0xf15790d3edc4b5aed427b0b543a9206fcf4b1a13dfed016d33bfb313076263b8",
				);
			});
		});

		describe("buildSignedOrder", () => {
			it("random salt", async () => {
				const signedOrder = await exchangeOrderBuilder.buildSignedOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe(wallet.address);
				expect(signedOrder.signer).toBe(wallet.address);
				expect(signedOrder.taker).toBe("0x0000000000000000000000000000000000000000");
				expect(signedOrder.tokenId).toBe("1234");
				expect(signedOrder.makerAmount).toBe("100000000");
				expect(signedOrder.takerAmount).toBe("50000000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.nonce).toBe("0");
				expect(signedOrder.feeRateBps).toBe("100");
				expect(signedOrder.signatureType).toBe(0);
				expect(signedOrder.signature).not.toBe("");
			});

			it("specific salt", async () => {
				(exchangeOrderBuilder as any).generateSalt = () => {
					return "479249096354";
				};

				const signedOrder = await exchangeOrderBuilder.buildSignedOrder({
					maker: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					feeRateBps: "100",
					nonce: "0",
				});
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder).toEqual({
					salt: "479249096354",
					maker: wallet.address,
					signer: wallet.address,
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "1234",
					makerAmount: "100000000",
					takerAmount: "50000000",
					side: Side.BUY,
					expiration: "0",
					nonce: "0",
					feeRateBps: "100",
					signatureType: 0,
					signature:
						"0x1b3646ef347e5bd144c65bd3357ba19c12c12abaeedae733cf8579bc51a2752c0454c3bc6b236957e393637982c769b8dc0706c0f5c399983d933850afd1cbcd1c",
				});
			});
		});
	});
});
