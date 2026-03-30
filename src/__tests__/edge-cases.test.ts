import { describe, expect, it } from "vitest";
import { computeLayout } from "../core/layout.js";

const FONT = "16px sans-serif";
const LINE_HEIGHT = 20;

function layout(text: string, maxWidth: number) {
	return computeLayout({ text, font: FONT, maxWidth, lineHeight: LINE_HEIGHT });
}

describe("computeLayout edge cases", () => {
	it("handles a single character", () => {
		const result = layout("a", 200);

		expect(result.lineCount).toBe(1);
		expect(result.lines).toHaveLength(1);
		expect(result.lines[0].text).toBe("a");
		expect(result.height).toBe(LINE_HEIGHT);
	});

	it("handles a very long word with no spaces", () => {
		// "abcdefghijklmnopqrstuvwxyz" = 26 chars * 8px = 208px
		// maxWidth 80 fits 10 chars, but mock doesn't break within words
		const result = layout("abcdefghijklmnopqrstuvwxyz", 80);

		expect(result.lineCount).toBe(1);
		expect(result.lines).toHaveLength(1);
		expect(result.lines[0].width).toBe(26 * 8);
		// The single word exceeds maxWidth but is placed on one line
		expect(result.lines[0].width).toBeGreaterThan(80);
	});

	it("handles only whitespace without crashing", () => {
		const result = layout("   ", 200);

		// Should not throw; exact output depends on mock splitting behavior
		expect(result).toBeDefined();
		expect(result.lineCount).toBeGreaterThanOrEqual(0);
		expect(result.height).toBeGreaterThanOrEqual(0);
	});

	it("handles a very narrow container", () => {
		const result = layout("hello", 1);

		// Even with maxWidth=1, non-empty text should produce at least 1 line
		expect(result.lineCount).toBeGreaterThanOrEqual(1);
		expect(result.lines.length).toBeGreaterThanOrEqual(1);
	});

	it("handles a very wide container", () => {
		const result = layout("short text", 10000);

		expect(result.lineCount).toBe(1);
		expect(result.lines).toHaveLength(1);
		expect(result.lines[0].text).toBe("short text");
	});

	it("handles repeated spaces between words", () => {
		const result = layout("hello    world", 200);

		expect(result).toBeDefined();
		expect(result.lineCount).toBeGreaterThanOrEqual(1);
		// Verify all lines have valid structure
		for (const line of result.lines) {
			expect(line.key).toBeDefined();
			expect(typeof line.width).toBe("number");
			expect(typeof line.y).toBe("number");
		}
	});

	it("wraps a single word repeated many times", () => {
		// "word" = 4 chars = 32px, "word word" = 9 chars = 72px
		// maxWidth 40 fits 5 chars -> each "word" (4 chars = 32px) fits alone
		// but "word word" (9 chars = 72px) exceeds 40px
		const result = layout("word word word word word", 40);

		expect(result.lineCount).toBeGreaterThan(1);
		expect(result.height).toBe(result.lineCount * LINE_HEIGHT);
		// Verify y offsets are sequential
		for (let i = 0; i < result.lines.length; i++) {
			expect(result.lines[i].y).toBe(i * LINE_HEIGHT);
			expect(result.lines[i].index).toBe(i);
		}
	});

	it("handles unicode and emoji characters without crashing", () => {
		const result = layout("Hello 🌍 world 🎉 test", 200);

		expect(result).toBeDefined();
		expect(result.lineCount).toBeGreaterThanOrEqual(1);
		// Combined text should contain the emoji
		const allText = result.lines.map((l) => l.text).join(" ");
		expect(allText).toContain("🌍");
		expect(allText).toContain("🎉");
	});

	it("handles newline characters in text without crashing", () => {
		const result = layout("hello\nworld", 200);

		expect(result).toBeDefined();
		expect(result.lineCount).toBeGreaterThanOrEqual(1);
		expect(result.height).toBeGreaterThanOrEqual(LINE_HEIGHT);
	});

	it("handles large text input", () => {
		// Generate 1000 characters: "word " repeated 200 times
		const largeText = "word ".repeat(200).trim();
		expect(largeText.length).toBe(999);

		const result = layout(largeText, 200);

		expect(result.lineCount).toBeGreaterThan(1);
		expect(result.height).toBe(result.lineCount * LINE_HEIGHT);
		expect(result.lines.length).toBe(result.lineCount);

		// Verify structural integrity of all lines
		for (let i = 0; i < result.lines.length; i++) {
			const line = result.lines[i];
			expect(line.key).toBe(String(i));
			expect(line.index).toBe(i);
			expect(line.y).toBe(i * LINE_HEIGHT);
			expect(line.text.length).toBeGreaterThan(0);
			expect(line.width).toBeGreaterThan(0);
		}
	});
});
