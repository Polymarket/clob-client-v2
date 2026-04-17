export const L1_AUTH_UNAVAILABLE_ERROR = new Error(
	"Signer is needed to interact with this endpoint!",
);

export const L2_AUTH_NOT_AVAILABLE = new Error(
	"API Credentials are needed to interact with this endpoint!",
);

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
