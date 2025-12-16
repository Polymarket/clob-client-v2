import type { AxiosRequestHeaders } from "axios";

import { post } from "./http-helpers";
import { BuilderSigner } from "./signer";
import {
	type BuilderApiKeyCreds,
	type BuilderHeaderPayload,
	BuilderType,
	type RemoteBuilderConfig,
	type RemoteSignerPayload,
} from "./types";

export class BuilderConfig {
	readonly remoteBuilderConfig?: RemoteBuilderConfig;
	readonly localBuilderCreds?: BuilderApiKeyCreds;
	readonly signer?: BuilderSigner;

	constructor(config?: {
		remoteBuilderConfig?: RemoteBuilderConfig;
		localBuilderCreds?: BuilderApiKeyCreds;
	}) {
		if (config) {
			if (config.remoteBuilderConfig) {
				if (!BuilderConfig.hasValidRemoteUrl(config.remoteBuilderConfig.url)) {
					throw new Error("invalid remote url!");
				}
				if (config.remoteBuilderConfig.token !== undefined) {
					const tk = config.remoteBuilderConfig.token;
					if (tk.length === 0) {
						throw new Error("invalid auth token");
					}
				}
				this.remoteBuilderConfig = config.remoteBuilderConfig;
			}

			if (config.localBuilderCreds) {
				if (!BuilderConfig.hasValidLocalCreds(config.localBuilderCreds)) {
					throw new Error("invalid local builder credentials!");
				}
				this.localBuilderCreds = config.localBuilderCreds;
				this.signer = new BuilderSigner(config.localBuilderCreds);
			}
		}
	}

	/**
	 * Helper function to generate builder headers using the configured credential method
	 * @param method
	 * @param path
	 * @param body
	 */
	public async generateBuilderHeaders(
		method: string,
		path: string,
		body?: string,
		timestamp?: number,
	): Promise<BuilderHeaderPayload | undefined> {
		this.ensureValid();

		const builderType = this.getBuilderType();

		if (builderType === BuilderType.LOCAL) {
			return Promise.resolve(
				this.signer?.createBuilderHeaderPayload(method, path, body, timestamp),
			);
		}

		if (builderType === BuilderType.REMOTE) {
			const url: string = (this.remoteBuilderConfig as RemoteBuilderConfig).url;
			// Execute a POST to the remote signer url with the header arguments
			const payload: RemoteSignerPayload = {
				method: method,
				path: path,
				body: body,
				timestamp: timestamp,
			};

			try {
				const token = (this.remoteBuilderConfig as RemoteBuilderConfig).token;
				return await post(url, {
					data: payload,
					headers: {
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					} as AxiosRequestHeaders,
				});
			} catch (err) {
				console.error("error calling remote signer", err);
				return undefined;
			}
		}
		return undefined;
	}

	public isValid(): boolean {
		return this.getBuilderType() !== BuilderType.UNAVAILABLE;
	}

	public getBuilderType(): BuilderType {
		const local = this.localBuilderCreds;
		const remote = this.remoteBuilderConfig;
		if (local && remote) {
			// If both present, prefer local
			return BuilderType.LOCAL;
		}
		if (local) {
			return BuilderType.LOCAL;
		}
		if (remote) {
			return BuilderType.REMOTE;
		}
		return BuilderType.UNAVAILABLE;
	}

	private static hasValidLocalCreds(creds?: BuilderApiKeyCreds): boolean {
		if (!creds) return false;

		const { key, secret, passphrase } = creds;

		if (!key.trim()) return false;

		if (!secret.trim()) return false;

		if (!passphrase.trim()) return false;

		return true;
	}

	private static hasValidRemoteUrl(remoteUrl?: string): boolean {
		if (!remoteUrl?.trim()) return false;
		return remoteUrl.startsWith("http://") || remoteUrl.startsWith("https://");
	}

	private ensureValid(): void {
		if (this.getBuilderType() === BuilderType.UNAVAILABLE) {
			throw new Error("invalid builder creds configured!");
		}
	}
}
