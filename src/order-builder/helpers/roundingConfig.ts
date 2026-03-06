import type { RoundConfig, TickSize } from "../../types/index.js";

export const ROUNDING_CONFIG: Record<TickSize, RoundConfig> = {
	"0.1": {
		price: 1,
		size: 2,
		amount: 3,
	},
	"0.01": {
		price: 2,
		size: 2,
		amount: 4,
	},
	"0.001": {
		price: 3,
		size: 2,
		amount: 5,
	},
	"0.0001": {
		price: 4,
		size: 2,
		amount: 6,
	},
};
