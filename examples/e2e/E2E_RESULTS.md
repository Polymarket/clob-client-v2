# E2E All Orders Tests

---

## Results

| # | Order Type | Description | Status | OrderID / TX Hash |
|---|-----------|-------------|--------|-------------------|
| 1 | Limit BUY (GTC) | Resting buy order that sits in the book until filled or cancelled | ✅ Passed | orderID: `0x44927bdff1dc145a9f466ccdeb6226bdf249e9f8278f5a91e983d6228e437f1b` |
| 2 | Marketable Limit BUY (GTC @ bestAsk) | Limit buy priced at the best ask, immediately crossing the spread | ✅ Passed | tx: `0x627abae6fdb1ef7b6ee9b8b5a5a5572c74d7ad66b4840b4975a05854ada4d20f` |
| 3 | Marketable Limit SELL (GTC @ bestBid) | Limit sell priced at the best bid, immediately crossing the spread | ✅ Passed | tx: `0x44881a9cab00df7f1a991a548572b495ab4c5732cd1affe617f03ffa84f7b0eb` |
| 4 | Market BUY (FOK) | Fill-or-kill buy executed at market price; fails if not fully filled instantly | ✅ Passed | tx: `0x5a8e41e7eea2297107d485308792ee429b875f561ee46f7b48e1ff13cf4ec58c` |
| 5 | Market SELL (FOK) | Fill-or-kill sell executed at market price; fails if not fully filled instantly | ✅ Passed | tx: `0xafa72397c0e3f8b045d51fd7357081a8e043cfbbe404cefd7162b899d4ae763e` |
| 6 | Market BUY with fees (FOK) | Market FOK buy with platform fee applied via `userUSDCBalance` for fee-adjusted sizing | ✅ Passed | tx: `0xc1a5ae687afa151bf65fdfe924b1dc5a5cf5a2db7b428e953c096c8c4365634c` |
| 7 | Market SELL with fees (FOK) | Market FOK sell with platform fee applied via `userUSDCBalance` | ✅ Passed | tx: `0xb5c0cf4ac3ed438799d81b1b8b582291a15007197af754d3d89ce7018b9c4d26` |
| 8 | Market BUY with fees + builder code (FOK) | Market FOK buy with both platform and builder taker fees, identified by builder code | ✅ Passed | tx: `0xfe290867f2801fcf7e1794789ce517668b0dcacd262e529a1df6913063586b0c` |
| 9 | Market SELL with fees + builder code (FOK) | Market FOK sell with both platform and builder taker fees, identified by builder code | ✅ Passed | tx: `0x8a58a62f8386e6a60a520a4d44011d304342e76c76a8b6503645628a50c1d5df` |
| 10 | Limit SELL (GTC) | Resting sell order that sits in the book until filled or cancelled | ✅ Passed | orderID: `0x61853508e7699fc04880961bd873c0b99fa28501c26d9086a597341c4eaff49e` (cancelled) |

---
