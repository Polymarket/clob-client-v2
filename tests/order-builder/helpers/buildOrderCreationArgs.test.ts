import { describe, it, expect } from "vitest";

import { UserOrder, Side } from "../../../src/types";
import { buildOrderCreationArgs, ROUNDING_CONFIG } from "../../../src/order-builder/helpers";
import { OrderDataV2, SignatureTypeV2 } from "../../../src/order-utils";

describe("buildOrderCreationArgs", () => {
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
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
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
				makerAmount: "10520000",
				takerAmount: "21040000",
				side: Side.BUY,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "50000",
				signatureType: SignatureTypeV2.EOA,
			});
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
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
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
				makerAmount: "11782400",
				takerAmount: "21040000",
				side: Side.BUY,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "50000",
				signatureType: SignatureTypeV2.EOA,
			});
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
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
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
				makerAmount: "1178240",
				takerAmount: "21040000",
				side: Side.BUY,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "50000",
				signatureType: SignatureTypeV2.EOA,
			});
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
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
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
				makerAmount: "117824",
				takerAmount: "21040000",
				side: Side.BUY,
				feeRateBps: "111",
				nonce: "123",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "50000",
				signatureType: SignatureTypeV2.EOA,
			});
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
				taker: "0x000000000000000000000000000000000000000A",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.1"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x000000000000000000000000000000000000000A",
				tokenId: "5",
				takerAmount: "10520000",
				makerAmount: "21040000",
				side: Side.SELL,
				feeRateBps: "0",
				nonce: "0",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.POLY_PROXY,
			});
		});

		it("0.01", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.56,
				size: 21.04,
				side: Side.SELL,
				feeRateBps: 0,
				nonce: 0,
				taker: "0x000000000000000000000000000000000000000A",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.01"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x000000000000000000000000000000000000000A",
				tokenId: "5",
				takerAmount: "11782400",
				makerAmount: "21040000",
				side: Side.SELL,
				feeRateBps: "0",
				nonce: "0",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.POLY_PROXY,
			});
		});

		it("0.001", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.056,
				size: 21.04,
				side: Side.SELL,
				feeRateBps: 0,
				nonce: 0,
				taker: "0x000000000000000000000000000000000000000A",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.001"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x000000000000000000000000000000000000000A",
				tokenId: "5",
				takerAmount: "1178240",
				makerAmount: "21040000",
				side: Side.SELL,
				feeRateBps: "0",
				nonce: "0",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.POLY_PROXY,
			});
		});

		it("0.0001", async () => {
			const order: UserOrder = {
				tokenID: "5",
				price: 0.0056,
				size: 21.04,
				side: Side.SELL,
				feeRateBps: 0,
				nonce: 0,
				taker: "0x000000000000000000000000000000000000000A",
			};
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				"0x0000000000000000000000000000000000000001",
				"0x0000000000000000000000000000000000000002",
				SignatureTypeV2.POLY_PROXY,
				order,
				ROUNDING_CONFIG["0.0001"],
			);
			expect(orderData).toEqual({
				maker: "0x0000000000000000000000000000000000000002",
				taker: "0x000000000000000000000000000000000000000A",
				tokenId: "5",
				takerAmount: "117824",
				makerAmount: "21040000",
				side: Side.SELL,
				feeRateBps: "0",
				nonce: "0",
				signer: "0x0000000000000000000000000000000000000001",
				expiration: "0",
				signatureType: SignatureTypeV2.POLY_PROXY,
			});
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
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.5);
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
				expect(orderData.makerAmount).to.equal("119000000");
				expect(orderData.takerAmount).to.equal("170000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.7);
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
				expect(orderData.makerAmount).to.equal("80800000");
				expect(orderData.takerAmount).to.equal("101000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.8);
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
				expect(orderData.makerAmount).to.equal("8974000");
				expect(orderData.takerAmount).to.equal("12820000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.7);
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
				expect(orderData.makerAmount).to.equal("730767000");
				expect(orderData.takerAmount).to.equal("2435890000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.3);
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
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.equal(0.5);
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
				expect(orderData.takerAmount).to.equal("119000000");
				expect(orderData.makerAmount).to.equal("170000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.7);
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
				expect(orderData.makerAmount).to.equal("101000000");
				expect(orderData.takerAmount).to.equal("80800000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.8);
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
				expect(orderData.makerAmount).to.equal("12820000");
				expect(orderData.takerAmount).to.equal("8974000");
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.gte(0.7);
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
				expect(orderData.makerAmount).to.equal("2435890000");
				expect(orderData.takerAmount).to.equal("730767000");
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.gte(0.3);
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
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.56);
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
				expect(orderData.makerAmount).to.equal("119000000");
				expect(orderData.takerAmount).to.equal("170000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.7);
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
				expect(orderData.makerAmount).to.equal("82820000");
				expect(orderData.takerAmount).to.equal("101000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.82);
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
				expect(orderData.makerAmount).to.equal("9999600");
				expect(orderData.takerAmount).to.equal("12820000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.78);
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
				expect(orderData.makerAmount).to.equal("949997100");
				expect(orderData.takerAmount).to.equal("2435890000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.39);
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
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.equal(
					0.56,
				);
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
				expect(orderData.takerAmount).to.equal("119000000");
				expect(orderData.makerAmount).to.equal("170000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.7);
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
				expect(orderData.makerAmount).to.equal("101000000");
				expect(orderData.takerAmount).to.equal("82820000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.82);
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
				expect(orderData.makerAmount).to.equal("12820000");
				expect(orderData.takerAmount).to.equal("9999600");
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.gte(0.78);
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
				expect(orderData.makerAmount).to.equal("2435890000");
				expect(orderData.takerAmount).to.equal("949997100");
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.gte(0.39);
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
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.056);
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
				expect(orderData.makerAmount).to.equal("1190000");
				expect(orderData.takerAmount).to.equal("170000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.007);
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
				expect(orderData.makerAmount).to.equal("8282000");
				expect(orderData.takerAmount).to.equal("101000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.082);
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
				expect(orderData.makerAmount).to.equal("999960");
				expect(orderData.takerAmount).to.equal("12820000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.078);
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
				expect(orderData.makerAmount).to.equal("94999710");
				expect(orderData.takerAmount).to.equal("2435890000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.039);
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
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.equal(
					0.056,
				);
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
				expect(orderData.takerAmount).to.equal("1190000");
				expect(orderData.makerAmount).to.equal("170000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.007);
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
				expect(orderData.makerAmount).to.equal("101000000");
				expect(orderData.takerAmount).to.equal("8282000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(0.082);
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
				expect(orderData.makerAmount).to.equal("12820000");
				expect(orderData.takerAmount).to.equal("999960");
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.gte(0.078);
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
				expect(orderData.makerAmount).to.equal("2435890000");
				expect(orderData.takerAmount).to.equal("94999710");
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.gte(0.039);
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
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0056,
				);
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
				expect(orderData.makerAmount).to.equal("119000");
				expect(orderData.takerAmount).to.equal("170000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0007,
				);
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
				expect(orderData.makerAmount).to.equal("828200");
				expect(orderData.takerAmount).to.equal("101000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0082,
				);
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
				expect(orderData.makerAmount).to.equal("99996");
				expect(orderData.takerAmount).to.equal("12820000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0078,
				);
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
				expect(orderData.makerAmount).to.equal("9499971");
				expect(orderData.takerAmount).to.equal("2435890000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0039,
				);
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
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.equal(
					0.0056,
				);
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
				expect(orderData.takerAmount).to.equal("119000");
				expect(orderData.makerAmount).to.equal("170000000");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0007,
				);
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
				expect(orderData.makerAmount).to.equal("101000000");
				expect(orderData.takerAmount).to.equal("828200");
				expect(Number(orderData.makerAmount) / Number(orderData.takerAmount)).to.gte(
					0.0082,
				);
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
				expect(orderData.makerAmount).to.equal("12820000");
				expect(orderData.takerAmount).to.equal("99996");
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.gte(
					0.0078,
				);
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
				expect(orderData.makerAmount).to.equal("2435890000");
				expect(orderData.takerAmount).to.equal("9499971");
				expect(Number(orderData.takerAmount) / Number(orderData.makerAmount)).to.gte(
					0.0039,
				);
			});
		});
	});
});
