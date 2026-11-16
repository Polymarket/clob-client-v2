export const L1_AUTH_UNAVAILABLE_ERROR = new Error(
	"Signer is needed to interact with this endpoint!",
);

export const L2_AUTH_NOT_AVAILABLE = new Error(
	"API Credentials are needed to interact with this endpoint!",
);

/**
 * What a request resolves to when it fails on a client created without `throwOnError`:
 * the server's error, plus the HTTP status when the server answered.
 */
export type ApiErrorResponse = { error: unknown; status?: number };

/**
 * Tells a failed request's result apart from data on a client created without
 * `throwOnError`, whose methods resolve a failure to an {@link ApiErrorResponse}.
 */
export const isApiErrorResponse = (result: unknown): result is ApiErrorResponse =>
	typeof result === "object" && result !== null && !Array.isArray(result) && "error" in result;

export class ApiError extends Error {
	readonly status?: number;
	readonly data?: unknown;

	constructor(message: string, status?: number, data?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
	}
}
