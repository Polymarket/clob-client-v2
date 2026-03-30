import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: resolve(__dirname, "../.env") });

import { WebSocket } from "ws";

import type { ApiKeyCreds } from "../src";

const YES_TOKEN_ID =
	"71321045679252212594626385532706912750332728571942532289631379312455583992563";
const NO_TOKEN_ID = "52114319501245915516055106046884209969926127482827954674443846427813813222426";
const CONDITION_ID = "0x5f65177b394277fd294cd75650044e32ba009a95022d88a0c1d565897d72f8f1";

interface subscriptionMessage {
	// only necessary for 'user' subscriptions
	auth?: { apiKey: string; secret: string; passphrase: string };
	type: string;
	markets: string[];
	assets_ids: string[];
	initial_dump?: boolean;
}

async function main(type: "user" | "market") {
	const host = process.env.WS_URL || "ws://localhost:8081";
	console.log(`${host}/ws/${type}`);
	const ws = new WebSocket(`${host}/ws/${type}`);

	let subscriptionMessage: subscriptionMessage = {} as subscriptionMessage;

	let creds: ApiKeyCreds | undefined;
	if (type === "user") {
		creds = {
			key: `${process.env.CLOB_API_KEY}`,
			secret: `${process.env.CLOB_SECRET}`,
			passphrase: `${process.env.CLOB_PASS_PHRASE}`,
		};
	}

	subscriptionMessage = {
		auth:
			type === "user" && creds
				? {
						apiKey: creds.key,
						secret: creds.secret,
						passphrase: creds.passphrase,
					}
				: undefined,
		type,
		markets: [] as string[],
		assets_ids: [] as string[],
		initial_dump: true,
	};

	if (type === "user") {
		subscriptionMessage.markets = [CONDITION_ID];
	} else {
		subscriptionMessage.assets_ids = [NO_TOKEN_ID, YES_TOKEN_ID];
	}

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

main("market");
