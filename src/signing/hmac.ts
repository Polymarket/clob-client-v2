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
	let message = timestamp + method + requestPath;
	if (body !== undefined) {
		message += body;
	}

	const binarySecret = atob(secret);
	const keyBytes = new Uint8Array(binarySecret.length);
	for (let i = 0; i < binarySecret.length; i++) {
		keyBytes[i] = binarySecret.charCodeAt(i);
	}

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
