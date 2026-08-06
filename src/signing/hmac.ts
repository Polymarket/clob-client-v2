const decodeBase64Secret = (secret: string): Uint8Array<ArrayBuffer> => {
	const normalized = secret.replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
	const binary = atob(padded);
	const buffer = new ArrayBuffer(binary.length);
	const bytes = new Uint8Array(buffer);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
};

/**
 * Builds the canonical Polymarket CLOB HMAC signature
 * @param secret
 * @param timestamp
 * @param method
 * @param requestPath
 * @param body
 * @returns string
 */
export const buildPolyHmacSignature = async (
	secret: string,
	timestamp: number,
	method: string,
	requestPath: string,
	body?: string,
): Promise<string> => {
	if (!secret) {
		throw new Error("buildPolyHmacSignature: secret is empty");
	}
	if (!globalThis.crypto?.subtle) {
		throw new Error(
			"buildPolyHmacSignature: globalThis.crypto.subtle is unavailable. Requires Node >=20 or a secure browser context (HTTPS or localhost).",
		);
	}

	let message = timestamp + method + requestPath;
	if (body !== undefined) {
		message += body;
	}

	const keyBytes = decodeBase64Secret(secret);

	const key = await globalThis.crypto.subtle.importKey(
		"raw",
		keyBytes,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const sigBuffer = await globalThis.crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(message),
	);

	const sigBytes = new Uint8Array(sigBuffer);
	let binary = "";
	for (let i = 0; i < sigBytes.length; i++) {
		binary += String.fromCharCode(sigBytes[i]);
	}
	// NOTE: Must be url safe base64 encoding, but keep base64 "=" suffix
	// Convert '+' to '-'
	// Convert '/' to '_'
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_");
};
