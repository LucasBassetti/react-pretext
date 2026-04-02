import { describe, expect, it } from "vitest";
import { clearAllCaches, clearLayoutCache, createCache } from "../core/cache.js";
import { computeLayout, computeLineRanges, profileLayout, setLocale } from "../core/layout.js";

describe("computeLineRanges", () => {
	it("calls onLine for each line", () => {
		const ranges: Array<{ width: number }> = [];
		const count = computeLineRanges({
			text: "Hello world this is a longer text that should wrap",
			font: "16px sans-serif",
			maxWidth: 100,
			onLine: (range) => ranges.push({ width: range.width }),
		});

		expect(count).toBeGreaterThan(0);
		expect(ranges.length).toBe(count);
		for (const r of ranges) {
			expect(r.width).toBeGreaterThan(0);
		}
	});

	it("returns 0 for empty text", () => {
		const ranges: unknown[] = [];
		const count = computeLineRanges({
			text: "",
			font: "16px sans-serif",
			maxWidth: 100,
			onLine: (range) => ranges.push(range),
		});

		expect(count).toBe(0);
		expect(ranges.length).toBe(0);
	});
});

describe("profileLayout", () => {
	it("returns profiling data", () => {
		const profile = profileLayout({
			text: "Hello world",
			font: "16px sans-serif",
		});

		expect(profile).toHaveProperty("analysisMs");
		expect(profile).toHaveProperty("measureMs");
		expect(profile).toHaveProperty("totalMs");
		expect(profile).toHaveProperty("analysisSegments");
		expect(profile).toHaveProperty("preparedSegments");
		expect(profile).toHaveProperty("breakableSegments");
	});
});

describe("clearAllCaches", () => {
	it("clears layout cache", () => {
		const options = {
			text: "Cache test for clearAll",
			font: "16px sans-serif",
			maxWidth: 200,
			lineHeight: 20,
		};

		const result1 = computeLayout(options);
		clearAllCaches();
		const result2 = computeLayout(options);

		// After clearing, should get a new object (not same reference)
		expect(result1).not.toBe(result2);
		// But same content
		expect(result1.lineCount).toBe(result2.lineCount);
	});
});

describe("setLocale", () => {
	it("does not throw", () => {
		expect(() => setLocale("en-US")).not.toThrow();
		expect(() => setLocale(undefined)).not.toThrow();
	});
});
