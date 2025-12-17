import { describe, it, expect } from "vitest";

import { UserMarketOrder, Side } from "../../../src/types";
import { buildMarketOrderCreationArgs, ROUNDING_CONFIG } from "../../../src/order-builder/helpers";
import { roundDown } from "../../../src/utilities";
import { OrderDataV2, SignatureTypeV2 } from "../../../src/order-utils";

describe("buildMarketOrderCreationArgs", () => {
	describe("market buy order", () => {
		it("0.1", async () => {
			const order: UserMarketOrder = {
				side: Side.BUY,
				tokenID: "123",
				price: 0.5,
				amount: 100,
				feeRateBps: 111,
				nonce: 123,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x0000000000000000000000000000000000000000",
				tokenId: "123",
				makerAmount: "100000000",
				takerAmount: "200000000",
				side: Side.BUY,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.EOA,
			});
		});

		it("0.01", async () => {
			const order: UserMarketOrder = {
				side: Side.BUY,
				tokenID: "123",
				price: 0.56,
				amount: 100,
				feeRateBps: 111,
				nonce: 123,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x0000000000000000000000000000000000000000",
				tokenId: "123",
				makerAmount: "100000000",
				takerAmount: "178571400",
				side: Side.BUY,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.EOA,
			});
		});

		it("0.001", async () => {
			const order: UserMarketOrder = {
				side: Side.BUY,
				tokenID: "123",
				price: 0.056,
				amount: 100,
				feeRateBps: 111,
				nonce: 123,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.001"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x0000000000000000000000000000000000000000",
				tokenId: "123",
				makerAmount: "100000000",
				takerAmount: "1785714280",
				side: Side.BUY,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.EOA,
			});
		});

		it("0.0001", async () => {
			const order: UserMarketOrder = {
				side: Side.BUY,
				tokenID: "123",
				price: 0.0056,
				amount: 100,
				feeRateBps: 111,
				nonce: 123,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.0001"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x0000000000000000000000000000000000000000",
				tokenId: "123",
				makerAmount: "100000000",
				takerAmount: "17857142857",
				side: Side.BUY,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.EOA,
			});
		});
	});

	describe("market sell order", () => {
		it("0.1", async () => {
			const order: UserMarketOrder = {
				side: Side.SELL,
				tokenID: "123",
				price: 0.5,
				amount: 100,
				feeRateBps: 111,
				nonce: 123,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x0000000000000000000000000000000000000000",
				tokenId: "123",
				makerAmount: "100000000",
				takerAmount: "50000000",
				side: Side.SELL,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.EOA,
			});
		});

		it("0.01", async () => {
			const order: UserMarketOrder = {
				side: Side.SELL,
				tokenID: "123",
				price: 0.56,
				amount: 100,
				feeRateBps: 111,
				nonce: 123,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x0000000000000000000000000000000000000000",
				tokenId: "123",
				makerAmount: "100000000",
				takerAmount: "56000000",
				side: Side.SELL,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.EOA,
			});
		});

		it("0.001", async () => {
			const order: UserMarketOrder = {
				side: Side.SELL,
				tokenID: "123",
				price: 0.056,
				amount: 100,
				feeRateBps: 111,
				nonce: 123,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.001"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x0000000000000000000000000000000000000000",
				tokenId: "123",
				makerAmount: "100000000",
				takerAmount: "5600000",
				side: Side.SELL,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.EOA,
			});
		});

		it("0.0001", async () => {
			const order: UserMarketOrder = {
				side: Side.SELL,
				tokenID: "123",
				price: 0.0056,
				amount: 100,
				feeRateBps: 111,
				nonce: 123,
			};
			const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.EOA,
				order,
				ROUNDING_CONFIG["0.0001"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x0000000000000000000000000000000000000000",
				tokenId: "123",
				makerAmount: "100000000",
				takerAmount: "560000",
				side: Side.SELL,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.EOA,
			});
		});
	});

	describe("real cases", () => {
		describe("0.1", () => {
			it("market buy order with a different price", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.5,
					amount: 100,
					feeRateBps: 111,
					nonce: 123,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"0x0000000000000000000000000000000000000001",
					"0x0000000000000000000000000000000000000002",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.1"],
				);
				expect(orderData).toEqual({
					maker: "0x0000000000000000000000000000000000000002",
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "123",
					makerAmount: "100000000",
					takerAmount: "200000000",
					side: Side.BUY,
					feeRateBps: "111",
					nonce: "123",
					signer: "0x0000000000000000000000000000000000000001",
					expiration: "0",
					signatureType: SignatureTypeV2.EOA,
				});
			});

			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.5,
					amount: 21.04,
					feeRateBps: 100,
					nonce: 0,
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
				expect(price).to.equal(0.5);
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.5);
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserMarketOrder = {
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

				expect(orderData.makerAmount).to.equal("119000000");
				expect(orderData.takerAmount).to.equal("170000000");

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					2,
				);
				expect(price).to.equal(0.7);
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.7);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("82800000");
				expect(orderData.takerAmount).to.equal("103500000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.8);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("9990000");
				expect(orderData.takerAmount).to.equal("14271000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.7);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("949990000");
				expect(orderData.takerAmount).to.equal("3166633000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.3);
			});

			it("correctly rounds price amounts for validity buy - 6", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("1000000");
				expect(orderData.takerAmount).to.equal("2000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.5);
			});

			it("correctly rounds price amounts for validity buy - 7", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("1000000");
				expect(orderData.takerAmount).to.equal("2000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.5);
			});
		});

		describe("0.01", () => {
			it("market buy order with a different price", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.05,
					amount: 100,
					feeRateBps: 111,
					nonce: 123,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"0x0000000000000000000000000000000000000001",
					"0x0000000000000000000000000000000000000002",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.01"],
				);
				expect(orderData).toEqual({
					maker: "0x0000000000000000000000000000000000000002",
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "123",
					makerAmount: "100000000",
					takerAmount: "2000000000",
					side: Side.BUY,
					feeRateBps: "111",
					nonce: "123",
					signer: "0x0000000000000000000000000000000000000001",
					expiration: "0",
					signatureType: SignatureTypeV2.EOA,
				});
			});

			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.56,
					amount: 21.04,
					feeRateBps: 100,
					nonce: 0,
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
				expect(price).to.equal(0.56);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).to.greaterThan(0.56);
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserMarketOrder = {
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

				expect(orderData.makerAmount).to.equal("119000000");
				expect(orderData.takerAmount).to.equal("1700000000");

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					2,
				);
				expect(price).to.equal(0.07);
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.07);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("82820000");
				expect(orderData.takerAmount).to.equal("101000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.82);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("9990000");
				expect(orderData.takerAmount).to.equal("12807600");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.78);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("949990000");
				expect(orderData.takerAmount).to.equal("2435871700");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.39);
			});

			it("correctly rounds price amounts for validity buy - 6", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("1000000");
				expect(orderData.takerAmount).to.equal("1785700");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.56);
			});

			it("correctly rounds price amounts for validity buy - 7", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("1000000");
				expect(orderData.takerAmount).to.equal("1754300");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.57);
			});
		});

		describe("0.001", () => {
			it("market buy order with a different price", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.005,
					amount: 100,
					feeRateBps: 111,
					nonce: 123,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"0x0000000000000000000000000000000000000001",
					"0x0000000000000000000000000000000000000002",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.001"],
				);
				expect(orderData).toEqual({
					maker: "0x0000000000000000000000000000000000000002",
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "123",
					makerAmount: "100000000",
					takerAmount: "20000000000",
					side: Side.BUY,
					feeRateBps: "111",
					nonce: "123",
					signer: "0x0000000000000000000000000000000000000001",
					expiration: "0",
					signatureType: SignatureTypeV2.EOA,
				});
			});

			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.056,
					amount: 21.04,
					feeRateBps: 100,
					nonce: 0,
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
				expect(price).to.equal(0.056);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).to.greaterThan(0.056);
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserMarketOrder = {
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

				expect(orderData.makerAmount).to.equal("119000000");
				expect(orderData.takerAmount).to.equal("17000000000");

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					6,
				);
				expect(price).to.equal(0.007);
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.007);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("82820000");
				expect(orderData.takerAmount).to.equal("1010000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.082);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("9990000");
				expect(orderData.takerAmount).to.equal("128076920");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.078);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("949990000");
				expect(orderData.takerAmount).to.equal("24358717940");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.039);
			});

			it("correctly rounds price amounts for validity buy - 6", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("1000000");
				expect(orderData.takerAmount).to.equal("17857140");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.056);
			});

			it("correctly rounds price amounts for validity buy - 7", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("1000000");
				expect(orderData.takerAmount).to.equal("17543850");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.057);
			});
		});

		describe("0.0001", () => {
			it("market buy order with a different price", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0005,
					amount: 100,
					feeRateBps: 111,
					nonce: 123,
				};
				const orderData: OrderDataV2 = await buildMarketOrderCreationArgs(
					"0x0000000000000000000000000000000000000001",
					"0x0000000000000000000000000000000000000002",
					SignatureTypeV2.EOA,
					order,
					ROUNDING_CONFIG["0.0001"],
				);
				expect(orderData).toEqual({
					maker: "0x0000000000000000000000000000000000000002",
					taker: "0x0000000000000000000000000000000000000000",
					tokenId: "123",
					makerAmount: "100000000",
					takerAmount: "200000000000",
					side: Side.BUY,
					feeRateBps: "111",
					nonce: "123",
					signer: "0x0000000000000000000000000000000000000001",
					expiration: "0",
					signatureType: SignatureTypeV2.EOA,
				});
			});

			it("correctly rounds price amounts for validity buy", async () => {
				const order: UserMarketOrder = {
					side: Side.BUY,
					tokenID: "123",
					price: 0.0056,
					amount: 21.04,
					feeRateBps: 100,
					nonce: 0,
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
				expect(price).to.equal(0.0056);
				expect(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
				).to.greaterThan(0.0056);
			});

			it("correctly rounds price amounts for validity buy - 2", async () => {
				const order: UserMarketOrder = {
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

				expect(orderData.makerAmount).to.equal("119000000");
				expect(orderData.takerAmount).to.equal("170000000000");

				const price = roundDown(
					Number(orderData.makerAmount) / Number(orderData.takerAmount),
					8,
				);
				expect(price).to.equal(0.0007);
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0007,
				);
			});

			it("correctly rounds price amounts for validity buy - 3", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("82820000");
				expect(orderData.takerAmount).to.equal("10100000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0082,
				);
			});

			it("correctly rounds price amounts for validity buy - 4", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("9990000");
				expect(orderData.takerAmount).to.equal("1280769230");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0078,
				);
			});

			it("correctly rounds price amounts for validity buy - 5", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("949990000");
				expect(orderData.takerAmount).to.equal("243587179487");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0039,
				);
			});

			it("correctly rounds price amounts for validity buy - 6", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("1000000");
				expect(orderData.takerAmount).to.equal("178571428");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0056,
				);
			});

			it("correctly rounds price amounts for validity buy - 7", async () => {
				const order: UserMarketOrder = {
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
				expect(orderData.makerAmount).to.equal("1000000");
				expect(orderData.takerAmount).to.equal("175438596");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0057,
				);
			});
		});
	});
});
