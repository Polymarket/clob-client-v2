import { Wallet } from "@ethersproject/wallet";
import { beforeEach, describe, expect, it } from "vitest";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

import { getContractConfig } from "../../src/config";
import {
	buildOrder,
	buildOrderCreationArgs,
	ROUNDING_CONFIG,
} from "../../src/order-builder/helpers";
import { SignatureTypeV2, type OrderDataV2 } from "../../src/order-utils";
import { buildClobEip712Signature } from "../../src/signing/eip712";
import { getSignerAddress, signTypedData } from "../../src/signing/signer";
import { Chain, Side } from "../../src/types";

const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const EXPECTED_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("signer adapter", () => {
	describe("ethers Wallet", () => {
		let wallet: Wallet;
		beforeEach(() => {
			wallet = new Wallet(PRIVATE_KEY);
		});

		it("getSignerAddress returns checksummed address", async () => {
			const address = await getSignerAddress(wallet);
			expect(address.toLowerCase()).toBe(EXPECTED_ADDRESS.toLowerCase());
		});

		it("signTypedData produces a signature", async () => {
			const domain = { name: "Test", version: "1", chainId: 80002 };
			const types = { Foo: [{ name: "bar", type: "string" }] };
			const message = { bar: "hello" };
			const sig = await signTypedData(wallet, domain, types, message);
			expect(sig).toMatch(/^0x[0-9a-f]{130}$/i);
		});
	});

	describe("viem WalletClient", () => {
		let walletClient: ReturnType<typeof createWalletClient>;
		beforeEach(() => {
			const account = privateKeyToAccount(PRIVATE_KEY);
			walletClient = createWalletClient({
				account,
				chain: polygon,
				transport: http(),
			});
		});

		it("getSignerAddress returns checksummed address", async () => {
			const address = await getSignerAddress(walletClient);
			expect(address.toLowerCase()).toBe(EXPECTED_ADDRESS.toLowerCase());
		});

		it("signTypedData produces a signature", async () => {
			const domain = { name: "Test", version: "1", chainId: 80002 };
			const types = { Foo: [{ name: "bar", type: "string" }] };
			const message = { bar: "hello" };
			const sig = await signTypedData(walletClient, domain, types, message);
			expect(sig).toMatch(/^0x[0-9a-f]{130}$/i);
		});

		it("ethers and viem produce the same EIP712 signature", async () => {
			const wallet = new Wallet(PRIVATE_KEY);
			const ethersSig = await buildClobEip712Signature(wallet, Chain.AMOY, 10000000, 23);
			const viemSig = await buildClobEip712Signature(walletClient, Chain.AMOY, 10000000, 23);
			expect(viemSig).toBe(ethersSig);
		});

		it("buildOrder signs correctly via viem WalletClient", async () => {
			const contractConfig = getContractConfig(Chain.AMOY);
			const orderData: OrderDataV2 = await buildOrderCreationArgs(
				EXPECTED_ADDRESS,
				EXPECTED_ADDRESS,
				SignatureTypeV2.EOA,
				{ tokenID: "123", price: 0.5, size: 10, side: Side.BUY },
				ROUNDING_CONFIG["0.01"],
			);

			const signedOrder = await buildOrder(
				walletClient,
				contractConfig.exchangeV2,
				Chain.AMOY,
				orderData,
				2,
			);

			expect(signedOrder.signature).toMatch(/^0x[0-9a-f]{130}$/i);
		});
	});
});
