# Polymarket Infrastructure Tools — Companion Toolkit for `clob-client-v2`

A reference for developers building production systems on top of `@polymarket/clob-client-v2`. This document describes six open-source infrastructure tools that solve the operational problems that come up once you move past basic order placement: on-chain data reconciliation, position tracking, market making, large order execution, cross-venue arbitrage, and local strategy testing.

**Repo:** https://github.com/osr21/polymarket-infra-tools  
**Live dashboard:** https://polymarket-hub.replit.app/infra-tools/

---

## Why this exists

`clob-client-v2` handles the *mechanics* of interacting with Polymarket's CLOB — signing orders, managing API keys, posting fills. But developers building anything beyond a one-off script immediately need answers to harder operational questions:

| Problem | How it surfaces |
|---------|----------------|
| Did my matched order actually settle on-chain? | `status=MATCHED` doesn't mean on-chain settlement — see #34 |
| My balance shows 0 after 20 FAK fills | Server-side `sum_of_matched_orders` cache saturation |
| I want to place $5,000 without moving the market | Need TWAP/VWAP slicing logic |
| Kalshi is pricing the same event differently | Cross-venue arb opportunity — how do I detect it? |
| I want to test a strategy without real capital | Need a local matching engine with real-time order book |

The infra tools address all of these directly.

---

## Tool Overview

### 1. CLOB Indexer — ground-truth fill settlement

Streams `OrderFilled` events from the Polymarket Exchange contract on Polygon via `eth_getLogs`. Stores every fill in a local database, independently of the CLOB API.

**Why it matters:** The CLOB API's `status=MATCHED` is not proof of on-chain settlement (see issue #34 — ghost fills). An indexer watching the actual Polygon contract gives you settlement confirmation that can't be faked by an API-layer bug.

```typescript
// Detect ghost fills by cross-checking CLOB API fills against on-chain indexed fills
const clobFills  = await client.getTrades({ status: 'MATCHED' });
const indexedTxs = await indexer.getFillsByMaker(myWallet);

const ghosts = clobFills.filter(f =>
  !indexedTxs.find(ix => ix.txHash === f.transactionHash)
);
// ghosts = fills that the CLOB marked MATCHED but never appeared on-chain
```

**Endpoints:** `GET /infra/indexer/status` · `GET /infra/indexer/fills` · `GET /infra/indexer/stats`

---

### 2. Order Management System (OMS) — P&L and position reconciliation

Tracks positions, cost basis, realized/unrealized P&L, and a double-entry ledger for all trading activity. Reconciles against on-chain fills from the Indexer.

**Why it matters for `clob-client-v2` users:**

- `getBalanceAllowance()` returning 0 (issue #344 in the archived client, #64 in `rs-clob-client-v2`) is a server-side cache issue. The OMS maintains a local position view that remains accurate regardless of what the CLOB API reports.
- The double-entry ledger catches SELL `makerAmount` calculation errors (a common source of the `balance: 0` error) by comparing expected vs actual USDC flows.

```typescript
// OMS P&L endpoint
GET /infra/oms/pnl
// → { realizedPnl, unrealizedPnl, winRate, sharpeRatio, totalTrades }

// Ledger catches mis-priced orders:
GET /infra/oms/ledger
// → double-entry entries where debit !== expected for a given fill price
```

---

### 3. Market Making Framework — two-sided quoting with kill switch

Posts BUY and SELL quotes around a fair-value price with configurable spread and inventory skew. Includes a hard kill switch that cancels all resting quotes instantly.

**Directly relevant to `poly-market-maker` users** who hit the archived client's `FilterParams` and `order_version_mismatch` bugs — this is a ground-up TypeScript implementation targeting V2.

```typescript
// Quote pricing (simplified):
const halfSpread = spreadBps / 10_000 / 2;
const inventoryAdj = (netInventoryUsdc / maxPositionUsdc) * inventorySkewFactor * halfSpread;
const bid = fairValue - halfSpread - inventoryAdj;
const ask = fairValue + halfSpread + inventoryAdj;
```

**Endpoints:** `GET /infra/mm/status` · `PUT /infra/mm/config` · `POST /infra/mm/kill` · `POST /infra/mm/resume`

---

### 4. Smart Order Router (SOR) — TWAP and VWAP for large positions

Breaks large orders into time-sliced child orders to minimize market impact. Supports both TWAP (equal-sized slices at fixed intervals) and VWAP (volume-proportional slices).

**When you need this:** Placing a $5,000+ order as a single market order on a thin Polymarket book will move the price significantly. TWAP over 10 slices spaced 30 seconds apart typically improves average fill by 1–3 percentage points on mid-liquidity markets.

```typescript
// Submit a $1,000 TWAP order over 10 slices × 30s
POST /infra/sor/orders
{
  "tokenId": "0xabc...",
  "side": "BUY",
  "strategy": "TWAP",
  "totalSizeUsdc": 1000,
  "slices": 10,
  "intervalMs": 30000
}
```

**Endpoints:** `POST /infra/sor/orders` · `GET /infra/sor/orders/:id` (with child fills) · `DELETE /infra/sor/orders/:id`

---

### 5. Cross-Market Arbitrage Engine — Kalshi, Manifold, PredictIt

Monitors Polymarket outcomes alongside equivalent markets on other venues. Surfaces spread opportunities when price divergence exceeds a configurable threshold.

**Venue APIs used (all public, no auth):**
- Kalshi: `https://api.kalshi.com/trade-api/v2/markets/{ticker}`
- Manifold: `https://manifold.markets/api/v0/slug/{slug}`
- PredictIt: `https://www.predictit.org/api/marketdata/markets/{id}`

```typescript
// Configure a market pair to monitor
POST /infra/arb/markets
{
  "questionSlug": "trump-wins-2024",
  "polymarketTokenId": "0x...",
  "counterpartyVenue": "kalshi",
  "counterpartySlug": "trump-wins",
  "minSpreadPct": 1.5
}

// Poll live opportunities
GET /infra/arb/opportunities
// → [{ spreadPct: 4.2, direction: "BUY_POLY_SELL_OTHER", estimatedEdgePct: 3.7, ... }]
```

---

### 6. Local CLOB Simulator — test strategies without capital risk

An in-memory price-time-priority matching engine that accepts Polymarket-style orders and generates realistic fills. Pre-seeded with a two-sided order book.

**Critical for `clob-client-v2` developers:** Testing signing logic, fee calculations, and order construction against the live CLOB burns real gas and real USDC. The simulator accepts the same order format the live CLOB does — if your order passes the simulator, the structure is correct.

```typescript
// Simulator uses same wire format as live CLOB
POST /infra/sim/orders
{
  "tokenId": "sim_tok_001",
  "side": "BUY",
  "price": 0.65,
  "size": 100,
  "orderType": "LIMIT"
}
// → { status: "FILLED", avgFillPrice: 0.635, usdcAmount: 63.50 }

// Compare single large order vs 10-slice SOR:
// Single: avgFillPrice = 0.678 (swept 3 levels)
// TWAP:   avgFillPrice = 0.651 (each slice fills near best ask)
```

---

## POLY_1271 Deposit Wallet: What These Tools Add

The biggest unresolved issue cluster across `clob-client-v2`, `py-clob-client-v2`, and `rs-clob-client-v2` is POLY_1271 deposit wallet support (issues #97, #95, #75, #73, #67, #66 in this repo alone). While that's fixed at the SDK layer, the infra tools add an operational layer on top:

1. **API key verification** — the OMS logs every order's `signer` field against the expected deposit wallet address, catching `signer != api_key` errors before they hit the CLOB.
2. **Settlement confirmation** — the CLOB Indexer confirms on-chain settlement independently of the API, critical for POLY_1271 accounts where ghost fills are more common (see issue #34 in `py-clob-client-v2`).
3. **Simulator testing** — validate your POLY_1271 signing flow locally before sending a real order. The simulator rejects orders with an incorrect `signatureType` field, giving immediate feedback.

---

## Getting Started

```bash
git clone https://github.com/osr21/polymarket-infra-tools
# Full docs: README.md + individual tool guides (clob-indexer.md, oms.md, etc.)
```

All six tools share a single Postgres database schema and a Fastify/Express API server. The frontend is a React dashboard at `/infra-tools/`.

**Full documentation:** https://github.com/osr21/polymarket-infra-tools

---

## Related Issues Addressed

| This repo | Root cause | Infra tool that helps |
|-----------|-----------|----------------------|
| #34 (ghost fills) | NegRisk settlement reverts | CLOB Indexer (on-chain confirmation) |
| #87 (tick precision rejection) | `roundNormal` vs `roundDown` | Simulator (catches before live submission) |
| #97, #95, #75, #73 (POLY_1271 signer) | L1 auth EOA vs deposit wallet mismatch | OMS signer audit log |
| #63 (sig type auto-detection) | No on-chain type check | OMS wallet type resolver |
| #91 (postOrder error type) | Missing error shape in return type | OMS wraps postOrder with typed error handling |
