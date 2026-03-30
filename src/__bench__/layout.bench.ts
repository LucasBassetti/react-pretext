import { bench, describe } from "vitest";
import { clearLayoutCache } from "../core/cache.js";
import { computeHeight, computeLayout } from "../core/layout.js";

const MAX_WIDTH = 300;
const LINE_HEIGHT = 20;
const FONT = "16px monospace";

function makeText(charCount: number): string {
	return "a ".repeat(charCount / 2);
}

describe("computeLayout", () => {
	const sizes = [10, 100, 1_000, 10_000] as const;

	for (const size of sizes) {
		const text = makeText(size);

		bench(
			`${size} chars`,
			() => {
				computeLayout({
					text,
					font: FONT,
					maxWidth: MAX_WIDTH,
					lineHeight: LINE_HEIGHT,
				});
			},
			{
				setup() {
					clearLayoutCache();
				},
			},
		);
	}
});

describe("computeHeight", () => {
	const sizes = [10, 100, 1_000, 10_000] as const;

	for (const size of sizes) {
		// Use a counter to vary text per iteration and bust the internal heightCache.
		let counter = 0;

		bench(
			`${size} chars`,
			() => {
				const suffix = String(counter++);
				const text = makeText(size) + suffix;
				computeHeight({
					text,
					font: FONT,
					maxWidth: MAX_WIDTH,
					lineHeight: LINE_HEIGHT,
				});
			},
			{
				setup() {
					clearLayoutCache();
				},
			},
		);
	}
});
