import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: resolve(import.meta.dirname, "../../.env") });

import { WebSocket } from "ws";

const CONDITION_ID = "0x5f65177b394277fd294cd75650044e32ba009a95022d88a0c1d565897d72f8f1";

async function main() {
	const host = process.env.WS_URL || "ws://localhost:8081";
	console.log(`${host}/ws/user`);
	const ws = new WebSocket(`${host}/ws/user`);

	const subscriptionMessage = {
		auth: {
			apiKey: `${process.env.CLOB_API_KEY}`,
			secret: `${process.env.CLOB_SECRET}`,
			passphrase: `${process.env.CLOB_PASS_PHRASE}`,
		},
		type: "user",
		markets: [CONDITION_ID],
		assets_ids: [] as string[],
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
