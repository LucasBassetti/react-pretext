import { describe, expect, it } from "vitest";
import { computeLayout, computePreparedText, computeVariableLayout } from "../core/layout.js";

describe("computePreparedText", () => {
	it("returns a PreparedTextWithSegments with segments", () => {
		const prepared = computePreparedText({ text: "Hello world", font: "16px sans-serif" });
		expect(prepared).toBeDefined();
		expect(prepared.segments).toBeDefined();
		expect(Array.isArray(prepared.segments)).toBe(true);
	});

	it("handles empty text", () => {
		const prepared = computePreparedText({ text: "", font: "16px sans-serif" });
		expect(prepared).toBeDefined();
	});
});

describe("computeVariableLayout", () => {
	it("matches computeLayout when getMaxWidth returns constant", () => {
		const text = "Hello world this is a longer text that should wrap";
		const font = "16px sans-serif";
		const lineHeight = 20;
		const maxWidth = 100;

		const fixed = computeLayout({ text, font, maxWidth, lineHeight });
		const variable = computeVariableLayout({
			text,
			font,
			lineHeight,
			getMaxWidth: () => maxWidth,
		});

		expect(variable.lineCount).toBe(fixed.lineCount);
		expect(variable.height).toBe(fixed.height);
		expect(variable.lines.length).toBe(fixed.lines.length);

		for (let i = 0; i < fixed.lines.length; i++) {
			expect(variable.lines[i].text).toBe(fixed.lines[i].text);
			expect(variable.lines[i].y).toBe(fixed.lines[i].y);
			expect(variable.lines[i].index).toBe(i);
			expect(variable.lines[i].key).toBe(String(i));
			expect(variable.lines[i].maxWidth).toBe(maxWidth);
		}
	});

	it("produces more lines with narrower widths", () => {
		const text = "Hello world this is a longer text that should wrap";
		const font = "16px sans-serif";
		const lineHeight = 20;

		const wide = computeVariableLayout({
			text,
			font,
			lineHeight,
			getMaxWidth: () => 500,
		});
		const narrow = computeVariableLayout({
			text,
			font,
			lineHeight,
			getMaxWidth: () => 50,
		});

		expect(narrow.lineCount).toBeGreaterThan(wide.lineCount);
	});

	it("respects maxLines safety limit", () => {
		const text = "a ".repeat(1000);
		const result = computeVariableLayout({
			text,
			font: "16px sans-serif",
			lineHeight: 20,
			getMaxWidth: () => 20,
			maxLines: 5,
		});

		expect(result.lineCount).toBeLessThanOrEqual(5);
	});

	it("handles empty text", () => {
		const result = computeVariableLayout({
			text: "",
			font: "16px sans-serif",
			lineHeight: 20,
			getMaxWidth: () => 200,
		});

		expect(result.lineCount).toBe(0);
		expect(result.height).toBe(0);
		expect(result.lines).toEqual([]);
	});

	it("passes correct lineIndex and y to getMaxWidth", () => {
		const calls: Array<{ lineIndex: number; y: number }> = [];
		computeVariableLayout({
			text: "Hello world this is text",
			font: "16px sans-serif",
			lineHeight: 20,
			getMaxWidth: (lineIndex, y) => {
				calls.push({ lineIndex, y });
				return 100;
			},
		});

		for (let i = 0; i < calls.length; i++) {
			expect(calls[i].lineIndex).toBe(i);
			expect(calls[i].y).toBe(i * 20);
		}
	});

	it("includes font and lineHeight in result", () => {
		const result = computeVariableLayout({
			text: "Hello",
			font: "16px sans-serif",
			lineHeight: 24,
			getMaxWidth: () => 200,
		});

		expect(result.font).toBe("16px sans-serif");
		expect(result.lineHeight).toBe(24);
	});
});
