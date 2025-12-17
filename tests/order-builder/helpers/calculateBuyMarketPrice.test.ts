import { describe, it, expect } from "vitest";

import { OrderSummary, OrderType } from "../../../src/types";
import { calculateBuyMarketPrice } from "../../../src/order-builder/helpers";

describe("calculateBuyMarketPrice FOK", () => {
	it("empty orderbook", () => {
		expect(() => calculateBuyMarketPrice([], 100, OrderType.FOK)).to.throw("no match");
	});
	it("not enough", () => {
		const positions = [
			{ price: "0.5", size: "100" },
			{ price: "0.4", size: "100" },
		] as OrderSummary[];
		expect(() => calculateBuyMarketPrice(positions, 100, OrderType.FOK)).to.throw("no match");
	});
	it("ok", () => {
		let positions = [
			{ price: "0.5", size: "100" },
			{ price: "0.4", size: "100" },
			{ price: "0.3", size: "100" },
		] as OrderSummary[];
		expect(calculateBuyMarketPrice(positions, 100, OrderType.FOK)).toBe(0.5);

		positions = [
			{ price: "0.5", size: "100" },
			{ price: "0.4", size: "200" },
			{ price: "0.3", size: "100" },
		] as OrderSummary[];
		expect(calculateBuyMarketPrice(positions, 100, OrderType.FOK)).toBe(0.4);

		positions = [
			{ price: "0.5", size: "120" },
			{ price: "0.4", size: "100" },
			{ price: "0.3", size: "100" },
		] as OrderSummary[];
		expect(calculateBuyMarketPrice(positions, 100, OrderType.FOK)).toBe(0.5);

		positions = [
			{ price: "0.5", size: "200" },
			{ price: "0.4", size: "100" },
			{ price: "0.3", size: "100" },
		] as OrderSummary[];
		expect(calculateBuyMarketPrice(positions, 100, OrderType.FOK)).toBe(0.5);
	});
});

describe("calculateBuyMarketPrice FAK", () => {
	it("empty orderbook", () => {
		expect(() => calculateBuyMarketPrice([], 100, OrderType.FAK)).to.throw("no match");
	});
	it("not enough", () => {
		let positions = [
			{ price: "0.5", size: "100" },
			{ price: "0.4", size: "100" },
		] as OrderSummary[];
		expect(calculateBuyMarketPrice(positions, 100, OrderType.FAK)).toBe(0.5);
		positions = [
			{ price: "0.6", size: "100" },
			{ price: "0.55", size: "100" },
			{ price: "0.5", size: "100" },
		] as OrderSummary[];
		expect(calculateBuyMarketPrice(positions, 200, OrderType.FAK)).toBe(0.6);
	});
	it("ok", () => {
		let positions = [
			{ price: "0.5", size: "100" },
			{ price: "0.4", size: "100" },
			{ price: "0.3", size: "100" },
		] as OrderSummary[];
		expect(calculateBuyMarketPrice(positions, 100, OrderType.FAK)).toBe(0.5);

		positions = [
			{ price: "0.5", size: "100" },
			{ price: "0.4", size: "200" },
			{ price: "0.3", size: "100" },
		] as OrderSummary[];
		expect(calculateBuyMarketPrice(positions, 100, OrderType.FAK)).toBe(0.4);

		positions = [
			{ price: "0.5", size: "120" },
			{ price: "0.4", size: "100" },
			{ price: "0.3", size: "100" },
		] as OrderSummary[];
		expect(calculateBuyMarketPrice(positions, 100, OrderType.FAK)).toBe(0.5);

		positions = [
			{ price: "0.5", size: "200" },
			{ price: "0.4", size: "100" },
			{ price: "0.3", size: "100" },
		] as OrderSummary[];
		expect(calculateBuyMarketPrice(positions, 100, OrderType.FAK)).toBe(0.5);
	});
});
