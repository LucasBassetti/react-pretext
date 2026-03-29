import { describe, expect, it } from "vitest";
import { computeLayout } from "../core/layout.js";

describe("computeLayout", () => {
	it("returns layout for simple text", () => {
		const result = computeLayout({
			text: "Hello world",
			font: "16px sans-serif",
			maxWidth: 200,
			lineHeight: 20,
		});

		expect(result.lineCount).toBeGreaterThan(0);
		expect(result.height).toBe(result.lineCount * 20);
		expect(result.lines.length).toBe(result.lineCount);
	});

	it("assigns correct y offsets to lines", () => {
		const result = computeLayout({
			text: "Hello world this is a longer text that should wrap",
			font: "16px sans-serif",
			maxWidth: 100,
			lineHeight: 20,
		});

		for (let i = 0; i < result.lines.length; i++) {
			expect(result.lines[i].y).toBe(i * 20);
			expect(result.lines[i].index).toBe(i);
			expect(result.lines[i].key).toBe(String(i));
		}
	});

	it("handles empty text", () => {
		const result = computeLayout({
			text: "",
			font: "16px sans-serif",
			maxWidth: 200,
			lineHeight: 20,
		});

		expect(result.lineCount).toBe(0);
		expect(result.height).toBe(0);
		expect(result.lines).toEqual([]);
	});

	it("returns cached results for identical inputs", () => {
		const options = {
			text: "Cache test",
			font: "16px sans-serif",
			maxWidth: 200,
			lineHeight: 20,
		};

		const result1 = computeLayout(options);
		const result2 = computeLayout(options);

		// Same reference from cache
		expect(result1).toBe(result2);
	});

	it("produces different results for different widths", () => {
		const base = {
			text: "Hello world this is text",
			font: "16px sans-serif",
			lineHeight: 20,
		};

		const narrow = computeLayout({ ...base, maxWidth: 50 });
		const wide = computeLayout({ ...base, maxWidth: 500 });

		expect(narrow.lineCount).toBeGreaterThanOrEqual(wide.lineCount);
	});

	it("lines contain non-empty text", () => {
		const result = computeLayout({
			text: "Hello world",
			font: "16px sans-serif",
			maxWidth: 200,
			lineHeight: 20,
		});

		for (const line of result.lines) {
			expect(line.text.length).toBeGreaterThan(0);
			expect(line.width).toBeGreaterThan(0);
		}
	});
});
