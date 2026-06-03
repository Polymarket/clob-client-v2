import { Wallet } from "@ethersproject/wallet";
import { describe, expect, it } from "vitest";

import { bytes32Zero } from "../../src/constants";
import { ExchangeOrderBuilderV2, ExchangeOrderBuilderV3 } from "../../src/order-utils";
import { SignatureTypeV2 } from "../../src/order-utils/model/signatureTypeV2";
import { Side } from "../../src/types";

describe("exchangeOrderBuilderV2", () => {
	const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
	const wallet = new Wallet(privateKey);
	const chainId = 80002;
	const exchangeV2 = "0xE111180000d2663C0091e4f400237545B87B996B";
	const exchangeV3 = "0x9fE6e61422AdB6F610d8597F9684b16912D50C3D";
	const generateSalt = () => "479249096354";

	it("uses ExchangeV3's EIP-712 domain while preserving the V2 order schema", async () => {
		const orderData = {
			maker: wallet.address,
			signer: wallet.address,
			tokenId: "1234",
			makerAmount: "100000000",
			takerAmount: "50000000",
			side: Side.BUY,
			signatureType: SignatureTypeV2.EOA,
			timestamp: "1780449126",
			metadata: bytes32Zero,
			builder: bytes32Zero,
		};
		const v2Builder = new ExchangeOrderBuilderV2(exchangeV2, chainId, wallet, generateSalt);
		const v3Builder = new ExchangeOrderBuilderV3(exchangeV3, chainId, wallet, generateSalt);

		const v2Order = await v2Builder.buildOrder(orderData);
		const v3Order = await v3Builder.buildOrder(orderData);
		const v2TypedData = v2Builder.buildOrderTypedData(v2Order);
		const v3TypedData = v3Builder.buildOrderTypedData(v3Order);

		expect(v2TypedData.types.Order).toEqual(v3TypedData.types.Order);
		expect(v2TypedData.message).toEqual(v3TypedData.message);
		expect(v2TypedData.domain).toMatchObject({
			name: "Polymarket CTF Exchange",
			version: "2",
			chainId,
			verifyingContract: exchangeV2,
		});
		expect(v3TypedData.domain).toMatchObject({
			name: "Polymarket CTF Exchange",
			version: "3",
			chainId,
			verifyingContract: exchangeV3,
		});
	});
});
