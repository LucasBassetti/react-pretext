import { bench, describe } from "vitest";
import { computeHeight } from "../core/layout.js";

const MAX_WIDTH = 600;
const LINE_HEIGHT = 20;
const FONT = "16px sans-serif";
const VIEWPORT_HEIGHT = 800;

type Item = { text: string };

function generateItems(count: number): Item[] {
	const items: Item[] = [];
	for (let i = 0; i < count; i++) {
		// Vary text length to simulate realistic content (20-200 chars).
		const wordCount = 4 + (i % 20);
		const words: string[] = [];
		for (let w = 0; w < wordCount; w++) {
			words.push(`word${w}`);
		}
		items.push({ text: words.join(" ") });
	}
	return items;
}

/**
 * Binary search identical to the one in usePretextVirtualizer.
 * Finds the index of the last offset that is <= target.
 */
function binarySearchOffset(offsets: number[], target: number): number {
	let low = 0;
	let high = offsets.length - 1;
	while (low <= high) {
		const mid = (low + high) >>> 1;
		if (offsets[mid] <= target) {
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}
	return Math.max(0, low - 1);
}

function computeOffsetsAndTotalHeight(items: Item[]): { offsets: number[]; totalHeight: number } {
	const offsets: number[] = [];
	let cumulative = 0;

	for (const item of items) {
		offsets.push(cumulative);
		cumulative += computeHeight({
			text: item.text,
			font: FONT,
			maxWidth: MAX_WIDTH,
			lineHeight: LINE_HEIGHT,
		});
	}

	return { offsets, totalHeight: cumulative };
}

describe("virtualizer - total height computation", () => {
	const counts = [1_000, 10_000, 100_000] as const;

	for (const count of counts) {
		const items = generateItems(count);

		bench(`${count.toLocaleString()} items`, () => {
			// Each item gets a unique-ish counter suffix to bust the heightCache.
			let offset = 0;
			for (const item of items) {
				computeHeight({
					text: item.text + String(offset++),
					font: FONT,
					maxWidth: MAX_WIDTH,
					lineHeight: LINE_HEIGHT,
				});
			}
		});
	}
});

describe("virtualizer - visible range (binary search)", () => {
	const counts = [1_000, 10_000, 100_000] as const;

	for (const count of counts) {
		const items = generateItems(count);
		// Pre-compute offsets once (this simulates a cached/memoized state).
		const { offsets, totalHeight } = computeOffsetsAndTotalHeight(items);
		const scrollTop = totalHeight * 0.5;

		bench(`${count.toLocaleString()} items - find visible at 50%`, () => {
			const startIdx = binarySearchOffset(offsets, scrollTop);
			const endIdx = binarySearchOffset(offsets, scrollTop + VIEWPORT_HEIGHT);

			// Simulate building the virtual items slice.
			const overscan = 3;
			const start = Math.max(0, startIdx - overscan);
			const end = Math.min(items.length - 1, endIdx + overscan);
			const _visibleCount = end - start + 1;
		});
	}
});
