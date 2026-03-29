import { useMemo } from "react";
import { computeHeight } from "../core/layout.js";
import type {
	PretextVirtualizerOptions,
	PretextVirtualizerResult,
	VirtualItem,
} from "../core/types.js";

const DEFAULT_OVERSCAN = 3;

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

export function usePretextVirtualizer(
	options: PretextVirtualizerOptions,
): PretextVirtualizerResult {
	const { items, width, lineHeight, scrollTop, viewportHeight, font } = options;
	const overscan = options.overscan ?? DEFAULT_OVERSCAN;

	// Compute heights using the fast path (prepare + layout, no line materialization).
	// computeHeight uses its own 20k-entry cache, so even large lists stay fast.
	const { offsets, heights, totalHeight } = useMemo(() => {
		const heights: number[] = [];
		const offsets: number[] = [];
		let cumulative = 0;

		for (const item of items) {
			offsets.push(cumulative);
			const itemFont = item.font ?? font;
			if (itemFont === undefined) {
				throw new Error(
					"usePretextVirtualizer: font is required for each item or as a default option.",
				);
			}
			const height = computeHeight({
				text: item.text,
				font: itemFont,
				maxWidth: width,
				lineHeight,
			});
			heights.push(height);
			cumulative += height;
		}

		return { offsets, heights, totalHeight: cumulative };
	}, [items, width, lineHeight, font]);

	// Compute visible range — just binary search + array slice, very cheap
	return useMemo(() => {
		if (items.length === 0) {
			return { virtualItems: [], totalHeight: 0, startIndex: 0, endIndex: 0 };
		}

		const rawStart = binarySearchOffset(offsets, scrollTop);
		const rawEnd = binarySearchOffset(offsets, scrollTop + viewportHeight);

		const startIndex = Math.max(0, rawStart - overscan);
		const endIndex = Math.min(items.length - 1, rawEnd + overscan);

		const virtualItems: VirtualItem[] = [];
		for (let i = startIndex; i <= endIndex; i++) {
			virtualItems.push({
				index: i,
				key: String(i),
				offsetTop: offsets[i],
				height: heights[i],
				data: items[i],
			});
		}

		return { virtualItems, totalHeight, startIndex, endIndex };
	}, [items, offsets, heights, totalHeight, scrollTop, viewportHeight, overscan]);
}
