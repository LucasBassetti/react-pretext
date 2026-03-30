import { bench, describe } from "vitest";
import { clearLayoutCache, createCache } from "../core/cache.js";
import { computeLayout } from "../core/layout.js";

const MAX_WIDTH = 300;
const LINE_HEIGHT = 20;
const FONT = "16px monospace";

describe("cache hit", () => {
	const text = "The quick brown fox jumps over the lazy dog";

	bench(
		"repeated computeLayout with same args",
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
				// Warm the cache with a single call before the benchmark loop starts.
				clearLayoutCache();
				computeLayout({
					text,
					font: FONT,
					maxWidth: MAX_WIDTH,
					lineHeight: LINE_HEIGHT,
				});
			},
		},
	);
});

describe("cache miss", () => {
	let counter = 0;

	bench("computeLayout with unique text each call", () => {
		const uniqueText = `benchmark text iteration ${counter++}`;
		computeLayout({
			text: uniqueText,
			font: FONT,
			maxWidth: MAX_WIDTH,
			lineHeight: LINE_HEIGHT,
		});
	});
});

describe("cache eviction", () => {
	const CAPACITY = 10;

	bench("insertion causing eviction (capacity 10)", () => {
		const cache = createCache(CAPACITY);
		// Fill the cache to capacity.
		for (let i = 0; i < CAPACITY; i++) {
			computeLayout(
				{
					text: `fill entry ${i}`,
					font: FONT,
					maxWidth: MAX_WIDTH,
					lineHeight: LINE_HEIGHT,
				},
				cache,
			);
		}
		// Trigger evictions by inserting beyond capacity.
		for (let i = 0; i < CAPACITY; i++) {
			computeLayout(
				{
					text: `evict entry ${i}`,
					font: FONT,
					maxWidth: MAX_WIDTH,
					lineHeight: LINE_HEIGHT,
				},
				cache,
			);
		}
	});
});
