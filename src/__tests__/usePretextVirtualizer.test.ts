import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePretextVirtualizer } from "../hooks/usePretextVirtualizer.js";

describe("usePretextVirtualizer", () => {
	const items = Array.from({ length: 100 }, (_, i) => ({
		text: `Item ${i}: Some text content that varies`,
	}));

	it("returns visible items within viewport", () => {
		const { result } = renderHook(() =>
			usePretextVirtualizer({
				items,
				width: 200,
				lineHeight: 20,
				scrollTop: 0,
				viewportHeight: 100,
				font: "16px sans-serif",
			}),
		);

		expect(result.current.virtualItems.length).toBeGreaterThan(0);
		expect(result.current.totalHeight).toBeGreaterThan(0);
		expect(result.current.startIndex).toBe(0);
	});

	it("handles empty items", () => {
		const { result } = renderHook(() =>
			usePretextVirtualizer({
				items: [],
				width: 200,
				lineHeight: 20,
				scrollTop: 0,
				viewportHeight: 100,
				font: "16px sans-serif",
			}),
		);

		expect(result.current.virtualItems).toEqual([]);
		expect(result.current.totalHeight).toBe(0);
	});

	it("applies overscan", () => {
		const { result: noOverscan } = renderHook(() =>
			usePretextVirtualizer({
				items,
				width: 200,
				lineHeight: 20,
				scrollTop: 200,
				viewportHeight: 100,
				font: "16px sans-serif",
				overscan: 0,
			}),
		);

		const { result: withOverscan } = renderHook(() =>
			usePretextVirtualizer({
				items,
				width: 200,
				lineHeight: 20,
				scrollTop: 200,
				viewportHeight: 100,
				font: "16px sans-serif",
				overscan: 5,
			}),
		);

		expect(withOverscan.current.virtualItems.length).toBeGreaterThanOrEqual(
			noOverscan.current.virtualItems.length,
		);
	});

	it("virtual items have correct structure", () => {
		const { result } = renderHook(() =>
			usePretextVirtualizer({
				items,
				width: 200,
				lineHeight: 20,
				scrollTop: 0,
				viewportHeight: 100,
				font: "16px sans-serif",
			}),
		);

		for (const item of result.current.virtualItems) {
			expect(item).toHaveProperty("index");
			expect(item).toHaveProperty("key");
			expect(item).toHaveProperty("offsetTop");
			expect(item).toHaveProperty("height");
			expect(item).toHaveProperty("data");
			expect(item.height).toBeGreaterThan(0);
		}
	});
});
