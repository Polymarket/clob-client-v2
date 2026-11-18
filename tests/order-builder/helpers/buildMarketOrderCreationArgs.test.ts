import { describe, expect, it } from "vitest";
import { bytes32Zero } from "../../../src/constants";
import { buildMarketOrderCreationArgs, ROUNDING_CONFIG } from "../../../src/order-builder/helpers";
import { type OrderDataV2, SignatureTypeV2 } from "../../../src/order-utils";
import { Side, type UserMarketOrderV1, type UserMarketOrderV2 } from "../../../src/types";
import { roundDown } from "../../../src/utilities";

describe("buildMarketOrderCreationArgs", () => {
	it("encodes a position ID in the protocol tokenId field", async () => {
		const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
			"0x0000000000000000000000000000000000000001",
			"0x0000000000000000000000000000000000000002",
			SignatureTypeV2.EOA,
			{
				positionID: "456",
				price: 0.5,
				amount: 100,
				side: Side.BUY,
			},
			ROUNDING_CONFIG["0.01"],
			3,
		);

		expect(orderData.tokenId).toBe("456");
	});

	describe("market buy order", () => {
		it("0.1", async () => {
			const order: UserMarketOrderV1 = {
				side: Side.BUY,
				tokenID: "123",
				price: 0.5,
				amount: 100,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("100000000");
			expect(orderData.takerAmount).toBe("200000000");
			expect(orderData.side).toBe(Side.BUY);
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});

		it("0.01", async () => {
			const order: UserMarketOrderV1 = {
				side: Side.BUY,
				tokenID: "123",
				price: 0.56,
				amount: 100,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("99999200");
			expect(orderData.takerAmount).toBe("178570000");
			expect(orderData.side).toBe(Side.BUY);
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});

		it("0.001", async () => {
			const order: UserMarketOrderV1 = {
				side: Side.BUY,
				tokenID: "123",
				price: 0.056,
				amount: 100,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.001"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("99999970");
			expect(orderData.takerAmount).toBe("1785713750");
			expect(orderData.side).toBe(Side.BUY);
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});

		it("0.0001", async () => {
			const order: UserMarketOrderV1 = {
				side: Side.BUY,
				tokenID: "123",
				price: 0.0056,
				amount: 100,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.0001"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("99999998");
			expect(orderData.takerAmount).toBe("17857142500");
			expect(orderData.side).toBe(Side.BUY);
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});
	});

	describe("market sell order", () => {
		it("0.1", async () => {
			const order: UserMarketOrderV1 = {
				side: Side.SELL,
				tokenID: "123",
				price: 0.5,
				amount: 100,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("100000000");
			expect(orderData.takerAmount).toBe("50000000");
			expect(orderData.side).toBe(Side.SELL);
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});

		it("0.01", async () => {
			const order: UserMarketOrderV1 = {
				side: Side.SELL,
				tokenID: "123",
				price: 0.56,
				amount: 100,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("100000000");
			expect(orderData.takerAmount).toBe("56000000");
			expect(orderData.side).toBe(Side.SELL);
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});

		it("0.001", async () => {
			const order: UserMarketOrderV1 = {
				side: Side.SELL,
				tokenID: "123",
				price: 0.056,
				amount: 100,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.001"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("100000000");
			expect(orderData.takerAmount).toBe("5600000");
			expect(orderData.side).toBe(Side.SELL);
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});

		it("0.0001", async () => {
			const order: UserMarketOrderV1 = {
				side: Side.SELL,
				tokenID: "123",
				price: 0.0056,
				amount: 100,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.0001"],
			);
			expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
			expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
			expect(orderData.tokenId).toBe("123");
			expect(orderData.makerAmount).toBe("100000000");
			expect(orderData.takerAmount).toBe("560000");
			expect(orderData.side).toBe(Side.SELL);
			expect(orderData.timestamp).toBeDefined();
			expect(orderData.builder).toBe(bytes32Zero);
			expect(orderData.metadata).toBe(bytes32Zero);
			expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
		});
	});

	describe("real cases", () => {
		describe("0.1", () => {
			it("market buy order with a different price", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.5,
					amount: 100,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"0x0000000000000000000000000000000000000001",
					"0x0000000000000000000000000000000000000002",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
				expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
				expect(orderData.tokenId).toBe("123");
				expect(orderData.makerAmount).toBe("100000000");
				expect(orderData.takerAmount).toBe("200000000");
				expect(orderData.side).toBe(Side.BUY);
				expect(orderData.timestamp).toBeDefined();
				expect(orderData.builder).toBe(bytes32Zero);
				expect(orderData.metadata).toBe(bytes32Zero);
				expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
			});

			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.5,
					amount: 21.04,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					2,
				);
				expect(price).toBe(0.5);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.5);
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.7,
					amount: 119,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);

				expect(orderData.makerAmount).toBe("119000000");
				expect(orderData.takerAmount).toBe("170000000");

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					2,
				);
				expect(price).toBe(0.7);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.7);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.8,
					amount: 82.8,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("82800000");
				expect(orderData.takerAmount).toBe("103500000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.8);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.7,
					amount: 9.9996,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("9996000");
				expect(orderData.takerAmount).toBe("14280000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.7);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.3,
					amount: 949.9971,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("949995000");
				expect(orderData.takerAmount).toBe("3166650000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.3);
			});

			it("correctly rounds price amounts for validity buy - 6", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.5,
					amount: 1,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData.makerAmount).toBe("1000000");
				expect(orderData.takerAmount).toBe("2000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.5);
			});

			it("correctly rounds price amounts for validity buy - 7", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.5,
					amount: 1,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.makerAmount).toBe("1000000");
				expect(orderData.takerAmount).toBe("2000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.5);
			});
		});

		describe("0.01", () => {
			it("market buy order with a different price", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.05,
					amount: 100,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"0x0000000000000000000000000000000000000001",
					"0x0000000000000000000000000000000000000002",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
				expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
				expect(orderData.tokenId).toBe("123");
				expect(orderData.makerAmount).toBe("100000000");
				expect(orderData.takerAmount).toBe("2000000000");
				expect(orderData.side).toBe(Side.BUY);
				expect(orderData.timestamp).toBeDefined();
				expect(orderData.builder).toBe(bytes32Zero);
				expect(orderData.metadata).toBe(bytes32Zero);
				expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
			});

			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.56,
					amount: 21.04,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					2,
				);
				expect(price).toBe(0.56);
				expect(orderData.makerAmount).toBe("21039200");
				expect(orderData.takerAmount).toBe("37570000");
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.07,
					amount: 119,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);

				expect(orderData.makerAmount).toBe("119000000");
				expect(orderData.takerAmount).toBe("1700000000");

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					2,
				);
				expect(price).toBe(0.07);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.07);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.82,
					amount: 82.82,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
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
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.78,
					amount: 9.9996,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
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
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.39,
					amount: 949.9971,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
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

			it("correctly rounds price amounts for validity buy - 6", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.56,
					amount: 1,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.makerAmount).toBe("999600");
				expect(orderData.takerAmount).toBe("1785000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.56);
			});

			it("correctly rounds price amounts for validity buy - 7", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.57,
					amount: 1,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData.makerAmount).toBe("997500");
				expect(orderData.takerAmount).toBe("1750000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.57);
			});
		});

		describe("0.001", () => {
			it("market buy order with a different price", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.005,
					amount: 100,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"0x0000000000000000000000000000000000000001",
					"0x0000000000000000000000000000000000000002",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
				expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
				expect(orderData.tokenId).toBe("123");
				expect(orderData.makerAmount).toBe("100000000");
				expect(orderData.takerAmount).toBe("20000000000");
				expect(orderData.side).toBe(Side.BUY);
				expect(orderData.timestamp).toBeDefined();
				expect(orderData.builder).toBe(bytes32Zero);
				expect(orderData.metadata).toBe(bytes32Zero);
				expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
			});

			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.056,
					amount: 21.04,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					6,
				);
				expect(price).toBe(0.056);
				expect(orderData.makerAmount).toBe("21039970");
				expect(orderData.takerAmount).toBe("375713750");
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.007,
					amount: 119,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);

				expect(orderData.makerAmount).toBe("119000000");
				expect(orderData.takerAmount).toBe("17000000000");

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					6,
				);
				expect(price).toBe(0.007);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.007);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.082,
					amount: 82.82,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("82820000");
				expect(orderData.takerAmount).toBe("1010000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.082);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.078,
					amount: 9.9996,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("9999600");
				expect(orderData.takerAmount).toBe("128200000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.078);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.039,
					amount: 949.9971,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("949997100");
				expect(orderData.takerAmount).toBe("24358900000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.039);
			});

			it("correctly rounds price amounts for validity buy - 6", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.056,
					amount: 1,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("999950");
				expect(orderData.takerAmount).toBe("17856250");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.056);
			});

			it("correctly rounds price amounts for validity buy - 7", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.057,
					amount: 1,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData.makerAmount).toBe("999780");
				expect(orderData.takerAmount).toBe("17540000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.057);
			});
		});

		describe("0.0001", () => {
			it("market buy order with a different price", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0005,
					amount: 100,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"0x0000000000000000000000000000000000000001",
					"0x0000000000000000000000000000000000000002",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.maker).toBe("0x0000000000000000000000000000000000000002");
				expect(orderData.signer).toBe("0x0000000000000000000000000000000000000001");
				expect(orderData.tokenId).toBe("123");
				expect(orderData.makerAmount).toBe("100000000");
				expect(orderData.takerAmount).toBe("200000000000");
				expect(orderData.side).toBe(Side.BUY);
				expect(orderData.timestamp).toBeDefined();
				expect(orderData.builder).toBe(bytes32Zero);
				expect(orderData.metadata).toBe(bytes32Zero);
				expect(orderData.signatureType).toBe(SignatureTypeV2.EOA);
			});

			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0056,
					amount: 21.04,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					8,
				);
				expect(price).toBe(0.0056);
				expect(orderData.makerAmount).toBe("21039998");
				expect(orderData.takerAmount).toBe("3757142500");
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0007,
					amount: 119,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);

				expect(orderData.makerAmount).toBe("119000000");
				expect(orderData.takerAmount).toBe("170000000000");

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					8,
				);
				expect(price).toBe(0.0007);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0007);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0082,
					amount: 82.82,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("82820000");
				expect(orderData.takerAmount).toBe("10100000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0082);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0078,
					amount: 9.9996,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("9999600");
				expect(orderData.takerAmount).toBe("1282000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0078);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0039,
					amount: 949.9971,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("949997100");
				expect(orderData.takerAmount).toBe("243589000000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0039);
			});

			it("correctly rounds price amounts for validity buy - 6", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0056,
					amount: 1,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("999999");
				expect(orderData.takerAmount).toBe("178571250");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0056);
			});

			it("correctly rounds price amounts for validity buy - 7", async () => {
				const order: UserMarketOrderV1 = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0057,
					amount: 1,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"",
					"",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData.makerAmount).toBe("999951");
				expect(orderData.takerAmount).toBe("175430000");
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).toBeGreaterThanOrEqual(0.0057);
			});
		});
	});

	describe("builderCode", () => {
		const base: UserMarketOrderV2 = {
			tokenID: "123",
			price: 0.5,
			amount: 100,
			side: Side.BUY,
		};

		it("no builderCode → builder = bytes32Zero", async () => {
			const orderData = await buildMarketOrderCreationArgs(
				"",
				"",
				SignatureTypeV2.EOA,
				base,
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData.builder).toBe(bytes32Zero);
		});

		it("builderCode set → builder = builderCode", async () => {
			const builderCode =
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
			const orderData = await buildMarketOrderCreationArgs(
				"",
				"",
				SignatureTypeV2.EOA,
				{ ...base, builderCode },
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData.builder).toBe(builderCode);
		});

		it("builderCode = bytes32Zero → builder = bytes32Zero", async () => {
			const orderData = await buildMarketOrderCreationArgs(
				"",
				"",
				SignatureTypeV2.EOA,
				{ ...base, builderCode: bytes32Zero },
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData.builder).toBe(bytes32Zero);
		});
	});
});
