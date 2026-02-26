import { Wallet } from "@ethersproject/wallet";
import { beforeEach, describe, expect, it } from "vitest";
import { bytes32Zero } from "../../../src/constants";
import { createOrder } from "../../../src/order-builder/helpers";
import { SignatureTypeV2 } from "../../../src/order-utils";
import { Chain, Side, type UserOrderV2 } from "../../../src/types";

describe("createOrder", () => {
	let wallet: Wallet;
	beforeEach(() => {
		const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
		wallet = new Wallet(privateKey);
	});

	describe("CTF Exchange", () => {
		describe("buy order", () => {
			it("0.1", async () => {
				const order: UserOrderV2 = {
					tokenID: "123",
					price: 0.5,
					size: 21.04,
					side: Side.BUY,
					expiration: 50000,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.1", negRisk: false },
					2,
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("10520000");
				expect(signedOrder.takerAmount).toBe("21040000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("50000");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.01", async () => {
				const order: UserOrderV2 = {
					tokenID: "123",
					price: 0.56,
					size: 21.04,
					side: Side.BUY,
					expiration: 50000,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.01", negRisk: false },
					2,
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("11782400");
				expect(signedOrder.takerAmount).toBe("21040000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("50000");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.001", async () => {
				const order: UserOrderV2 = {
					tokenID: "123",
					price: 0.056,
					size: 21.04,
					side: Side.BUY,
					expiration: 50000,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.001", negRisk: false },
					2,
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("1178240");
				expect(signedOrder.takerAmount).toBe("21040000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("50000");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.0001", async () => {
				const order: UserOrderV2 = {
					tokenID: "123",
					price: 0.0056,
					size: 21.04,
					side: Side.BUY,
					expiration: 50000,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.0001", negRisk: false },
					2,
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("117824");
				expect(signedOrder.takerAmount).toBe("21040000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("50000");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});
		});

		describe("sell order", () => {
			it("0.1", async () => {
				const order: UserOrderV2 = {
					tokenID: "5",
					price: 0.5,
					size: 21.04,
					side: Side.SELL,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.POLY_GNOSIS_SAFE,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.1", negRisk: false },
					2,
				);

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("5");
				expect(signedOrder.makerAmount).toBe("21040000");
				expect(signedOrder.takerAmount).toBe("10520000");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_GNOSIS_SAFE);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.01", async () => {
				const order: UserOrderV2 = {
					tokenID: "5",
					price: 0.56,
					size: 21.04,
					side: Side.SELL,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.POLY_GNOSIS_SAFE,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.01", negRisk: false },
					2,
				);

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("5");
				expect(signedOrder.makerAmount).toBe("21040000");
				expect(signedOrder.takerAmount).toBe("11782400");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_GNOSIS_SAFE);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.001", async () => {
				const order: UserOrderV2 = {
					tokenID: "5",
					price: 0.056,
					size: 21.04,
					side: Side.SELL,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.POLY_GNOSIS_SAFE,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.001", negRisk: false },
					2,
				);

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("5");
				expect(signedOrder.makerAmount).toBe("21040000");
				expect(signedOrder.takerAmount).toBe("1178240");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_GNOSIS_SAFE);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.0001", async () => {
				const order: UserOrderV2 = {
					tokenID: "5",
					price: 0.0056,
					size: 21.04,
					side: Side.SELL,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.POLY_GNOSIS_SAFE,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.0001", negRisk: false },
					2,
				);

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("5");
				expect(signedOrder.makerAmount).toBe("21040000");
				expect(signedOrder.takerAmount).toBe("117824");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_GNOSIS_SAFE);
				expect(signedOrder.signature).not.toBe("");
			});
		});
	});

	describe("Neg RiskCTF Exchange", () => {
		describe("buy order", () => {
			it("0.1", async () => {
				const order: UserOrderV2 = {
					tokenID: "123",
					price: 0.5,
					size: 21.04,
					side: Side.BUY,
					expiration: 50000,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.1", negRisk: true },
					2,
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("10520000");
				expect(signedOrder.takerAmount).toBe("21040000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("50000");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.01", async () => {
				const order: UserOrderV2 = {
					tokenID: "123",
					price: 0.56,
					size: 21.04,
					side: Side.BUY,
					expiration: 50000,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.01", negRisk: true },
					2,
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("11782400");
				expect(signedOrder.takerAmount).toBe("21040000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("50000");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.001", async () => {
				const order: UserOrderV2 = {
					tokenID: "123",
					price: 0.056,
					size: 21.04,
					side: Side.BUY,
					expiration: 50000,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.001", negRisk: true },
					2,
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("1178240");
				expect(signedOrder.takerAmount).toBe("21040000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("50000");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.0001", async () => {
				const order: UserOrderV2 = {
					tokenID: "123",
					price: 0.0056,
					size: 21.04,
					side: Side.BUY,
					expiration: 50000,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.EOA,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.0001", negRisk: true },
					2,
				);
				expect(signedOrder).not.toBeNull();
				expect(signedOrder).toBeDefined();

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("123");
				expect(signedOrder.makerAmount).toBe("117824");
				expect(signedOrder.takerAmount).toBe("21040000");
				expect(signedOrder.side).toBe(Side.BUY);
				expect(signedOrder.expiration).toBe("50000");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.EOA);
				expect(signedOrder.signature).not.toBe("");
			});
		});

		describe("sell order", () => {
			it("0.1", async () => {
				const order: UserOrderV2 = {
					tokenID: "5",
					price: 0.5,
					size: 21.04,
					side: Side.SELL,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.POLY_GNOSIS_SAFE,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.1", negRisk: true },
					2,
				);

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("5");
				expect(signedOrder.makerAmount).toBe("21040000");
				expect(signedOrder.takerAmount).toBe("10520000");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_GNOSIS_SAFE);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.01", async () => {
				const order: UserOrderV2 = {
					tokenID: "5",
					price: 0.56,
					size: 21.04,
					side: Side.SELL,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.POLY_GNOSIS_SAFE,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.01", negRisk: true },
					2,
				);

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("5");
				expect(signedOrder.makerAmount).toBe("21040000");
				expect(signedOrder.takerAmount).toBe("11782400");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_GNOSIS_SAFE);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.001", async () => {
				const order: UserOrderV2 = {
					tokenID: "5",
					price: 0.056,
					size: 21.04,
					side: Side.SELL,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.POLY_GNOSIS_SAFE,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.001", negRisk: true },
					2,
				);

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("5");
				expect(signedOrder.makerAmount).toBe("21040000");
				expect(signedOrder.takerAmount).toBe("1178240");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_GNOSIS_SAFE);
				expect(signedOrder.signature).not.toBe("");
			});

			it("0.0001", async () => {
				const order: UserOrderV2 = {
					tokenID: "5",
					price: 0.0056,
					size: 21.04,
					side: Side.SELL,
				};

				const signedOrder = await createOrder(
					wallet,
					Chain.AMOY,
					SignatureTypeV2.POLY_GNOSIS_SAFE,
					"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
					order,
					{ tickSize: "0.0001", negRisk: true },
					2,
				);

				expect(signedOrder.salt).not.toBe("");
				expect(signedOrder.maker).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.signer).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
				expect(signedOrder.tokenId).toBe("5");
				expect(signedOrder.makerAmount).toBe("21040000");
				expect(signedOrder.takerAmount).toBe("117824");
				expect(signedOrder.side).toBe(Side.SELL);
				expect(signedOrder.expiration).toBe("0");
				expect(signedOrder.timestamp).toBeDefined();
				expect(signedOrder.builder).toBe(bytes32Zero);
				expect(signedOrder.metadata).toBe(bytes32Zero);
				expect(signedOrder.signatureType).toBe(SignatureTypeV2.POLY_GNOSIS_SAFE);
				expect(signedOrder.signature).not.toBe("");
			});
		});
	});

	describe("builderCode", () => {
		const base: UserOrderV2 = {
			tokenID: "123",
			price: 0.5,
			size: 21.04,
			side: Side.BUY,
		};
		const maker = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

		it("no builderCode → builder = bytes32Zero", async () => {
			const signedOrder = await createOrder(
				wallet,
				Chain.AMOY,
				SignatureTypeV2.EOA,
				maker,
				base,
				{ tickSize: "0.1", negRisk: false },
				2,
			);
			expect(signedOrder.builder).toBe(bytes32Zero);
		});

		it("builderCode set → builder = builderCode", async () => {
			const builderCode =
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
			const signedOrder = await createOrder(
				wallet,
				Chain.AMOY,
				SignatureTypeV2.EOA,
				maker,
				{ ...base, builderCode },
				{ tickSize: "0.1", negRisk: false },
				2,
			);
			expect(signedOrder.builder).toBe(builderCode);
		});

		it("builderCode = bytes32Zero → builder = bytes32Zero", async () => {
			const signedOrder = await createOrder(
				wallet,
				Chain.AMOY,
				SignatureTypeV2.EOA,
				maker,
				{ ...base, builderCode: bytes32Zero },
				{ tickSize: "0.1", negRisk: false },
				2,
			);
			expect(signedOrder.builder).toBe(bytes32Zero);
		});
	});
});
