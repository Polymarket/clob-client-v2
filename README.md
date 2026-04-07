# Polymarket CLOB Client V2

<a href='https://www.npmjs.com/package/@polymarket/clob-client-v2'>
    <img src='https://img.shields.io/npm/v/@polymarket/clob-client-v2.svg' alt='NPM'/>
</a>

TypeScript client for the Polymarket CLOB (v2)

### Usage

```ts
// npm install @polymarket/clob-client-v2
// npm install viem

import { ApiKeyCreds, Chain, ClobClient, OrderType, Side } from "@polymarket/clob-client-v2";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const host = "https://clob-v2.polymarket.com";
const chainId = Chain.POLYGON; // or Chain.AMOY for testnet

const account = privateKeyToAccount("0x..."); // your private key
const walletClient = createWalletClient({ account, transport: http() });

// Step 1: obtain API credentials using your wallet (L1 auth)
const clobClient = new ClobClient({ host, chain: chainId, signer: walletClient });
const creds = await clobClient.createOrDeriveApiKey();

// Step 2: initialize a fully-authenticated client (L1 + L2)
const client = new ClobClient({ host, chain: chainId, signer: walletClient, creds });

// Place a resting limit buy (GTC)
const resp = await client.createAndPostOrder(
    {
        tokenID: "", // token ID of the market outcome — get from https://docs.polymarket.com
        price: 0.4,
        side: Side.BUY,
        size: 100,
    },
    { tickSize: "0.01" },
    OrderType.GTC,
);
console.log(resp);
```

See [examples](examples/) for more information.

### Market Orders

```ts
// Market buy — amount is in USDC
// OrderType.FOK: entire order must fill immediately or it is cancelled
// OrderType.FAK: fills as much as possible, remainder is cancelled
const resp = await client.createAndPostMarketOrder(
    {
        tokenID: "",
        amount: 100, // USDC
        side: Side.BUY,
        orderType: OrderType.FOK,
    },
    { tickSize: "0.01" },
    OrderType.FOK,
);
console.log(resp);
```

### Authentication

The client has two authentication levels:

**L1** — wallet signature (EIP-712). Required to create or derive API keys.

```ts
const client = new ClobClient({ host, chain: chainId, signer: walletClient });
const creds = await client.createOrDeriveApiKey();
```

**L2** — HMAC with API credentials. Required for order placement, cancellation, and account data.

```ts
const creds: ApiKeyCreds = {
    key: process.env.CLOB_API_KEY,
    secret: process.env.CLOB_SECRET,
    passphrase: process.env.CLOB_PASS_PHRASE,
};
const client = new ClobClient({ host, chain: chainId, signer: walletClient, creds });
```

### Error Handling

By default, API errors are returned as `{ error: "...", status: ... }` objects. To have the client throw instead, pass `throwOnError: true`:

```ts
import { ApiError, ClobClient } from "@polymarket/clob-client-v2";

const client = new ClobClient({ host, chain: chainId, signer: walletClient, creds, throwOnError: true });

try {
    const book = await client.getOrderBook(tokenID);
} catch (e) {
    if (e instanceof ApiError) {
        console.log(e.message); // "No orderbook exists for the requested token id"
        console.log(e.status);  // 404
        console.log(e.data);    // full error response object
    }
}
```
