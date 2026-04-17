import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: resolve(import.meta.dirname, "../../.env") });

import { WebSocket } from "ws";

const YES_TOKEN_ID =
	"71321045679252212594626385532706912750332728571942532289631379312455583992563";
const NO_TOKEN_ID = "52114319501245915516055106046884209969926127482827954674443846427813813222426";

async function main() {
	const host = process.env.WS_URL || "ws://localhost:8081";
	console.log(`${host}/ws/market`);
	const ws = new WebSocket(`${host}/ws/market`);

	const subscriptionMessage = {
		type: "market",
		markets: [] as string[],
		assets_ids: [NO_TOKEN_ID, YES_TOKEN_ID],
		initial_dump: true,
	};

	ws.on("error", (err: Error) => {
		console.log("error SOCKET", "error", err);
		process.exit(1);
	});
	ws.on("close", (code: number, reason: Buffer) => {
		console.log("disconnected SOCKET", "code", code, "reason", reason.toString());
		process.exit(1);
	});

	ws.on("open", (ev: any) => {
		ws.send(JSON.stringify(subscriptionMessage), (err?: Error) => {
			if (err) {
				console.log("send error", err);
				process.exit(1);
			}
		});

		setInterval(() => {
			console.log("PINGING");
			ws.send("PING");
		}, 50000);

		if (ev) {
			console.log("open", ev);
		}
	});

	ws.onmessage = (msg: any) => {
		console.log(msg.data);
	};
}

main();
