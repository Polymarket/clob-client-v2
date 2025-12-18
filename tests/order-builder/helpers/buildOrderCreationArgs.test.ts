import { describe, expect, it } from "vitest";
import { bytes32Zero } from "../../../src/constants";
import { buildOrderCreationArgs, ROUNDING_CONFIG } from "../../../src/order-builder/helpers";
import { type OrderDataV2, SignatureTypeV2 } from "../../../src/order-utils";
import { Side, type UserOrder } from "../../../src/types";

describe("buildOrderCreationArgs", () => {
	describe("buy order", () => {
		it("0.1", async () => {
			const order: UserOrder = {
				tokenID: "123",
				price: 0.5,
				size: 21.04,
				side: Side.BUY,
				expiration: 50000,
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("10520000");
			expect(orderData.takerAmount).toBe("21040000");
			expect(orderData.side).toBe(Side.BUY);
			expect(orderData.expiration).toBe("50000");
			expect(orderData.maxFee).toBe("0");
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});

		it("0.01", async () => {
			const order: UserOrder = {
				tokenID: "123",
				price: 0.56,
				size: 21.04,
				side: Side.BUY,
				expiration: 50000,
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("11782400");
			expect(orderData.takerAmount).toBe("21040000");
			expect(orderData.side).toBe(Side.BUY);
			expect(orderData.expiration).toBe("50000");
			expect(orderData.maxFee).toBe("0");
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});

		it("0.001", async () => {
			const order: UserOrder = {
				tokenID: "123",
				price: 0.056,
				size: 21.04,
				side: Side.BUY,
				expiration: 50000,
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.001"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("1178240");
			expect(orderData.takerAmount).toBe("21040000");
			expect(orderData.side).toBe(Side.BUY);
			expect(orderData.expiration).toBe("50000");
			expect(orderData.maxFee).toBe("0");
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});

		it("0.0001", async () => {
			const order: UserOrder = {
				tokenID: "123",
				price: 0.0056,
				size: 21.04,
				side: Side.BUY,
				expiration: 50000,
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.0001"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("117824");
			expect(orderData.takerAmount).toBe("21040000");
			expect(orderData.side).toBe(Side.BUY);
			expect(orderData.expiration).toBe("50000");
			expect(orderData.maxFee).toBe("0");
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});
	});

	describe("sell order", () => {
		it("0.1", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.5,
				size: 21.04,
				side: Side.SELL,
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("5");
			expect(orderData.makerAmount).toBe("21040000");
			expect(orderData.takerAmount).toBe("10520000");
			expect(orderData.side).toBe(Side.SELL);
			expect(orderData.expiration).toBe("0");
			expect(orderData.maxFee).toBe("0");
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.POLY_PROXY);
		});

		it("0.01", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.56,
				size: 21.04,
				side: Side.SELL,
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("5");
			expect(orderData.makerAmount).toBe("21040000");
			expect(orderData.takerAmount).toBe("11782400");
			expect(orderData.side).toBe(Side.SELL);
			expect(orderData.expiration).toBe("0");
			expect(orderData.maxFee).toBe("0");
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.POLY_PROXY);
		});

		it("0.001", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.056,
				size: 21.04,
				side: Side.SELL,
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.001"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("5");
			expect(orderData.makerAmount).toBe("21040000");
			expect(orderData.takerAmount).toBe("1178240");
			expect(orderData.side).toBe(Side.SELL);
			expect(orderData.expiration).toBe("0");
			expect(orderData.maxFee).toBe("0");
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.POLY_PROXY);
		});

		it("0.0001", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.0056,
				size: 21.04,
				side: Side.SELL,
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.0001"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("5");
			expect(orderData.makerAmount).toBe("21040000");
			expect(orderData.takerAmount).toBe("117824");
			expect(orderData.side).toBe(Side.SELL);
			expect(orderData.expiration).toBe("0");
			expect(orderData.maxFee).toBe("0");
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.POLY_PROXY);
		});
	});

	describe("real cases", () => {
		describe("0.1", () => {
			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.5,
					size: 21.04,
					side: Side.BUY,
					feeRateBps: 100,
					nonce: 0,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.5);
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.7,
					size: 170,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("119000000");
				expect(orderData.takerAmount).toBe("170000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.7);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.8,
					size: 101,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("80800000");
				expect(orderData.takerAmount).toBe("101000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.8);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 12.8205,
					price: 0.7,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("8974000");
				expect(orderData.takerAmount).toBe("12820000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.7);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 2435.89,
					price: 0.3,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("730767000");
				expect(orderData.takerAmount).toBe("2435890000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.3);
			});

			it("correctly rounds price amounts for validity sell", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.5,
					size: 21.04,
					side: Side.SELL,
					feeRateBps: 100,
					nonce: 0,
				};

				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).toBe(0.5);
			});

			it("correctly rounds price amounts for validity sell - 2", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.7,
					size: 170,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.takerAmount).toBe("119000000");
				expect(orderData.makerAmount).toBe("170000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.7);
			});

			it("correctly rounds price amounts for validity sell - 3", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.8,
					size: 101,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("101000000");
				expect(orderData.takerAmount).toBe("80800000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.8);
			});

			it("correctly rounds price amounts for validity sell - 4", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 12.8205,
					price: 0.7,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("12820000");
				expect(orderData.takerAmount).toBe("8974000");
				expect(
					Number(orderData.takerAmount) / Number(orderData.makerAmount),
				).toBeGreaterThanOrEqual(0.7);
			});

			it("correctly rounds price amounts for validity sell - 5", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 2435.89,
					price: 0.3,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("2435890000");
				expect(orderData.takerAmount).toBe("730767000");
				expect(
					Number(orderData.takerAmount) / Number(orderData.makerAmount),
				).toBeGreaterThanOrEqual(0.3);
			});
		});

		describe("0.01", () => {
			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.56,
					size: 21.04,
					side: Side.BUY,
					feeRateBps: 100,
					nonce: 0,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.56);
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.7,
					size: 170,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.makerAmount).toBe("119000000");
				expect(orderData.takerAmount).toBe("170000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.7);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.82,
					size: 101,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.makerAmount).toBe("82820000");
				expect(orderData.takerAmount).toBe("101000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.82);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 12.8205,
					price: 0.78,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.makerAmount).toBe("9999600");
				expect(orderData.takerAmount).toBe("12820000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.78);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 2435.89,
					price: 0.39,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.makerAmount).toBe("949997100");
				expect(orderData.takerAmount).toBe("2435890000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.39);
			});

			it("correctly rounds price amounts for validity sell", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.56,
					size: 21.04,
					side: Side.SELL,
					feeRateBps: 100,
					nonce: 0,
				};

				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).toBe(0.56);
			});

			it("correctly rounds price amounts for validity sell - 2", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.7,
					size: 170,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.takerAmount).toBe("119000000");
				expect(orderData.makerAmount).toBe("170000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.7);
			});

			it("correctly rounds price amounts for validity sell - 3", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.82,
					size: 101,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.makerAmount).toBe("101000000");
				expect(orderData.takerAmount).toBe("82820000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.82);
			});

			it("correctly rounds price amounts for validity sell - 4", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 12.8205,
					price: 0.78,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.makerAmount).toBe("12820000");
				expect(orderData.takerAmount).toBe("9999600");
				expect(
					Number(orderData.takerAmount) / Number(orderData.makerAmount),
				).toBeGreaterThanOrEqual(0.78);
			});

			it("correctly rounds price amounts for validity sell - 5", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 2435.89,
					price: 0.39,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.makerAmount).toBe("2435890000");
				expect(orderData.takerAmount).toBe("949997100");
				expect(
					Number(orderData.takerAmount) / Number(orderData.makerAmount),
				).toBeGreaterThanOrEqual(0.39);
			});
		});

		describe("0.001", () => {
			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.056,
					size: 21.04,
					side: Side.BUY,
					feeRateBps: 100,
					nonce: 0,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.056);
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.007,
					size: 170,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("1190000");
				expect(orderData.takerAmount).toBe("170000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.007);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.082,
					size: 101,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("8282000");
				expect(orderData.takerAmount).toBe("101000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.082);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 12.8205,
					price: 0.078,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("999960");
				expect(orderData.takerAmount).toBe("12820000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.078);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 2435.89,
					price: 0.039,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("94999710");
				expect(orderData.takerAmount).toBe("2435890000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.039);
			});

			it("correctly rounds price amounts for validity sell", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.056,
					size: 21.04,
					side: Side.SELL,
					feeRateBps: 100,
					nonce: 0,
				};

				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).toBe(0.056);
			});

			it("correctly rounds price amounts for validity sell - 2", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.007,
					size: 170,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.takerAmount).toBe("1190000");
				expect(orderData.makerAmount).toBe("170000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.007);
			});

			it("correctly rounds price amounts for validity sell - 3", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.082,
					size: 101,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("101000000");
				expect(orderData.takerAmount).toBe("8282000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.082);
			});

			it("correctly rounds price amounts for validity sell - 4", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 12.8205,
					price: 0.078,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("12820000");
				expect(orderData.takerAmount).toBe("999960");
				expect(
					Number(orderData.takerAmount) / Number(orderData.makerAmount),
				).toBeGreaterThanOrEqual(0.078);
			});

			it("correctly rounds price amounts for validity sell - 5", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 2435.89,
					price: 0.039,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("2435890000");
				expect(orderData.takerAmount).toBe("94999710");
				expect(
					Number(orderData.takerAmount) / Number(orderData.makerAmount),
				).toBeGreaterThanOrEqual(0.039);
			});
		});

		describe("0.0001", () => {
			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.0056,
					size: 21.04,
					side: Side.BUY,
					feeRateBps: 100,
					nonce: 0,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0056);
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.0007,
					size: 170,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("119000");
				expect(orderData.takerAmount).toBe("170000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0007);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.0082,
					size: 101,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("828200");
				expect(orderData.takerAmount).toBe("101000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0082);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 12.8205,
					price: 0.0078,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("99996");
				expect(orderData.takerAmount).toBe("12820000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0078);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 2435.89,
					price: 0.0039,
					side: Side.BUY,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("9499971");
				expect(orderData.takerAmount).toBe("2435890000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0039);
			});

			it("correctly rounds price amounts for validity sell", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.0056,
					size: 21.04,
					side: Side.SELL,
					feeRateBps: 100,
					nonce: 0,
				};

				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).toBe(0.0056);
			});

			it("correctly rounds price amounts for validity sell - 2", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.0007,
					size: 170,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.takerAmount).toBe("119000");
				expect(orderData.makerAmount).toBe("170000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0007);
			});

			it("correctly rounds price amounts for validity sell - 3", async () => {
				const order: UserOrder = {
					tokenID: "123",
					price: 0.0082,
					size: 101,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("101000000");
				expect(orderData.takerAmount).toBe("828200");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0082);
			});

			it("correctly rounds price amounts for validity sell - 4", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 12.8205,
					price: 0.0078,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("12820000");
				expect(orderData.takerAmount).toBe("99996");
				expect(
					Number(orderData.takerAmount) / Number(orderData.makerAmount),
				).toBeGreaterThanOrEqual(0.0078);
			});

			it("correctly rounds price amounts for validity sell - 5", async () => {
				const order: UserOrder = {
					tokenID: "123",
					size: 2435.89,
					price: 0.0039,
					side: Side.SELL,
				};
				const orderData: OrderDataV2 = await buildOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("2435890000");
				expect(orderData.takerAmount).toBe("9499971");
				expect(
					Number(orderData.takerAmount) / Number(orderData.makerAmount),
				).toBeGreaterThanOrEqual(0.0039);
			});
		});
	});
});
