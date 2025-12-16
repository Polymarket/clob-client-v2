import { afterEach, describe, expect, it, vi } from "vitest";

import {
	type BuilderApiKeyCreds,
	BuilderConfig,
	type BuilderHeaderPayload,
	BuilderType,
} from "../../src/builder-signing";
import * as httpHelpers from "../../src/builder-signing/http-helpers";

describe("builder config", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("isValid", () => {
		let builderConfig: BuilderConfig;
		const creds: BuilderApiKeyCreds = {
			key: "019894b9-cb40-79c4-b2bd-6aecb6f8c6c5",
			secret: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
			passphrase:
				"1816e5ed89518467ffa78c65a2d6a62d240f6fd6d159cba7b2c4dc510800f75a",
		};
		// isValid false
		builderConfig = new BuilderConfig();

		// isValid true
		builderConfig = new BuilderConfig({ localBuilderCreds: creds });
		expect(builderConfig.isValid()).toBe(true);
	});

	it("getBuilderType", async () => {
		let builderConfig: BuilderConfig;
		const creds: BuilderApiKeyCreds = {
			key: "019894b9-cb40-79c4-b2bd-6aecb6f8c6c5",
			secret: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
			passphrase:
				"1816e5ed89518467ffa78c65a2d6a62d240f6fd6d159cba7b2c4dc510800f75a",
		};
		builderConfig = new BuilderConfig({ localBuilderCreds: creds });
		expect(builderConfig.getBuilderType()).toBe(BuilderType.LOCAL);

		builderConfig = new BuilderConfig({
			remoteBuilderConfig: { url: "http://localhost:3000/sign" },
		});
		expect(builderConfig.getBuilderType()).toBe(BuilderType.REMOTE);

		builderConfig = new BuilderConfig();
		expect(builderConfig.getBuilderType()).toBe(BuilderType.UNAVAILABLE);

		// if both local is preferred
		builderConfig = new BuilderConfig({
			localBuilderCreds: creds,
			remoteBuilderConfig: { url: "http://localhost:3000/sign" },
		});
		expect(builderConfig.getBuilderType()).toBe(BuilderType.LOCAL);
	});

	it("generateBuilderHeaders", async () => {
		const creds: BuilderApiKeyCreds = {
			key: "019894b9-cb40-79c4-b2bd-6aecb6f8c6c5",
			secret: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
			passphrase:
				"1816e5ed89518467ffa78c65a2d6a62d240f6fd6d159cba7b2c4dc510800f75a",
		};
		const builderConfig: BuilderConfig = new BuilderConfig({
			localBuilderCreds: creds,
		});

		const requestPath = "/order";
		const requestBody = `{"deferExec":false,"order":{"salt":718139292476,"maker":"0x6e0c80c90ea6c15917308F820Eac91Ce2724B5b5","signer":"0x6e0c80c90ea6c15917308F820Eac91Ce2724B5b5","taker":"0x0000000000000000000000000000000000000000","tokenId":"15871154585880608648532107628464183779895785213830018178010423617714102767076","makerAmount":"5000000","takerAmount":"10000000","side":"BUY","expiration":"0","nonce":"0","feeRateBps":"1000","signatureType":0,"signature":"0x64a2b097cf14f9a24403748b4060bedf8f33f3dbe2a38e5f85bc2a5f2b841af633a2afcc9c4d57e60e4ff1d58df2756b2ca469f984ecfd46cb0c8baba8a0d6411b"},"owner":"5d1c266a-ed39-b9bd-c1f5-f24ae3e14a7b","orderType":"GTC"}`;
		const requestMethod = "POST";
		const timestamp = 1758744060;
		const headers: BuilderHeaderPayload =
			(await builderConfig.generateBuilderHeaders(
				requestMethod,
				requestPath,
				requestBody,
				timestamp,
			)) as BuilderHeaderPayload;

		expect(headers).not.toBeNull();
		expect(headers).toBeDefined();
		expect(headers.POLY_BUILDER_API_KEY).toBe(
			"019894b9-cb40-79c4-b2bd-6aecb6f8c6c5",
		);
		expect(headers.POLY_BUILDER_PASSPHRASE).toBe(
			"1816e5ed89518467ffa78c65a2d6a62d240f6fd6d159cba7b2c4dc510800f75a",
		);
		expect(headers.POLY_BUILDER_TIMESTAMP).toBe("1758744060");
		expect(headers.POLY_BUILDER_SIGNATURE).toBe(
			"8xh8d0qZHhBcLLYbsKNeiOW3Z0W2N5yNEq1kCVMe5QE=",
		);
	});

	it("generateHeaders - remote", async () => {
		// Mock remote signer endpoint
		const remoteSignerUrl = "http://localhost:3000/sign";
		const mockResponse: BuilderHeaderPayload = {
			POLY_BUILDER_API_KEY: "test-api-key",
			POLY_BUILDER_TIMESTAMP: "1758744060",
			POLY_BUILDER_PASSPHRASE: "test-passphrase",
			POLY_BUILDER_SIGNATURE: "test-signature",
		};

		vi.spyOn(httpHelpers, "post").mockResolvedValue(mockResponse);

		// Create config with remote signer URL
		const builderConfig = new BuilderConfig({
			remoteBuilderConfig: { url: remoteSignerUrl },
		});

		expect(builderConfig.getBuilderType()).toBe(BuilderType.REMOTE);

		const requestMethod = "POST";
		const requestPath = "/order";
		const requestBody = `{"deferExec":false,"order":{"salt":718139292476,"maker":"0x6e0c80c90ea6c15917308F820Eac91Ce2724B5b5","signer":"0x6e0c80c90ea6c15917308F820Eac91Ce2724B5b5","taker":"0x0000000000000000000000000000000000000000","tokenId":"15871154585880608648532107628464183779895785213830018178010423617714102767076","makerAmount":"5000000","takerAmount":"10000000","side":"BUY","expiration":"0","nonce":"0","feeRateBps":"1000","signatureType":0,"signature":"0x64a2b097cf14f9a24403748b4060bedf8f33f3dbe2a38e5f85bc2a5f2b841af633a2afcc9c4d57e60e4ff1d58df2756b2ca469f984ecfd46cb0c8baba8a0d6411b"},"owner":"5d1c266a-ed39-b9bd-c1f5-f24ae3e14a7b","orderType":"GTC"}`;
		const timestamp = 1758744060;

		const headers = await builderConfig.generateBuilderHeaders(
			requestMethod,
			requestPath,
			requestBody,
			timestamp,
		);

		// Verify the response
		expect(headers).not.toBeNull();
		expect(headers).toBeDefined();
		expect(headers).toEqual(mockResponse);
		expect(headers!.POLY_BUILDER_API_KEY).toBe("test-api-key");
		expect(headers!.POLY_BUILDER_TIMESTAMP).toBe("1758744060");
		expect(headers!.POLY_BUILDER_PASSPHRASE).toBe("test-passphrase");
		expect(headers!.POLY_BUILDER_SIGNATURE).toBe("test-signature");
	});
});
