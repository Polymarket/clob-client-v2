import { describe, it, expect } from "vitest";

import { OrderSummary, OrderType } from "../../../src/types";
import { calculateSellMarketPrice } from "../../../src/order-builder/helpers";

describe("calculateSellMarketPrice FOK", () => {
	it("empty orderbook", () => {
		expect(() => calculateSellMarketPrice([], 100, OrderType.FOK)).to.throw("no match");
	});
	it("not enough", () => {
		const positions = [
			{ price: "0.4", size: "10" },
			{ price: "0.5", size: "10" },
		] as OrderSummary[];
		expect(() => calculateSellMarketPrice(positions, 100, OrderType.FOK)).to.throw("no match");
	});
	it("ok", () => {
		let positions = [
			{ price: "0.3", size: "100" },
			{ price: "0.4", size: "100" },
			{ price: "0.5", size: "100" },
		] as OrderSummary[];
		expect(calculateSellMarketPrice(positions, 100, OrderType.FOK)).toBe(0.5);

		positions = [
			{ price: "0.3", size: "100" },
			{ price: "0.4", size: "100" },
			{ price: "0.5", size: "100" },
		] as OrderSummary[];
		expect(calculateSellMarketPrice(positions, 300, OrderType.FOK)).toBe(0.3);

		positions = [
			{ price: "0.3", size: "100" },
			{ price: "0.4", size: "200" },
			{ price: "0.5", size: "100" },
		] as OrderSummary[];
		expect(calculateSellMarketPrice(positions, 300, OrderType.FOK)).toBe(0.4);

		positions = [
			{ price: "0.3", size: "334" },
			{ price: "0.4", size: "100" },
			{ price: "0.5", size: "1000" },
		] as OrderSummary[];
		expect(calculateSellMarketPrice(positions, 600, OrderType.FOK)).toBe(0.5);
	});
});

describe("calculateSellMarketPrice FAK", () => {
	it("empty orderbook", () => {
		expect(() => calculateSellMarketPrice([], 100, OrderType.FAK)).to.throw("no match");
	});
	it("not enough", () => {
		const positions = [
			{ price: "0.4", size: "10" },
			{ price: "0.5", size: "10" },
		] as OrderSummary[];
		expect(calculateSellMarketPrice(positions, 100, OrderType.FAK)).toBe(0.4);
	});
	it("ok", () => {
		let positions = [
			{ price: "0.3", size: "100" },
			{ price: "0.4", size: "100" },
			{ price: "0.5", size: "100" },
		] as OrderSummary[];
		expect(calculateSellMarketPrice(positions, 100, OrderType.FAK)).toBe(0.5);

		positions = [
			{ price: "0.3", size: "100" },
			{ price: "0.4", size: "100" },
			{ price: "0.5", size: "100" },
		] as OrderSummary[];
		expect(calculateSellMarketPrice(positions, 300, OrderType.FAK)).toBe(0.3);

		positions = [
			{ price: "0.3", size: "100" },
			{ price: "0.4", size: "200" },
			{ price: "0.5", size: "100" },
		] as OrderSummary[];
		expect(calculateSellMarketPrice(positions, 300, OrderType.FAK)).toBe(0.4);

		positions = [
			{ price: "0.3", size: "334" },
			{ price: "0.4", size: "100" },
			{ price: "0.5", size: "1000" },
		] as OrderSummary[];
		expect(calculateSellMarketPrice(positions, 600, OrderType.FAK)).toBe(0.5);
	});
});
