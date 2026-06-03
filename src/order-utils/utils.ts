export function generateOrderSalt(): string {
	return `${Math.round(Math.random() * Date.now())}`;
}

export function currentUnixTimestampSeconds(): string {
	return Math.floor(Date.now() / 1000).toString();
}
