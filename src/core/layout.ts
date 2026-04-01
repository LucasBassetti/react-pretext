import {
	layout,
	layoutWithLines,
	prepare,
	prepareWithSegments,
	setLocale,
} from "@chenglou/pretext";
import { type LayoutCache, buildCacheKey, getGlobalCache } from "./cache.js";
import type { PretextLayoutOptions, PretextLayoutResult, PretextLineInfo } from "./types.js";

export type PretextHeightOptions = Pick<
	PretextLayoutOptions,
	"text" | "font" | "maxWidth" | "lineHeight" | "locale"
>;

const SSR_AVG_CHAR_WIDTH = 8;

function estimateLayoutSSR(options: PretextLayoutOptions): PretextLayoutResult {
	const avgCharWidth = SSR_AVG_CHAR_WIDTH;
	const charsPerLine = Math.max(1, Math.floor(options.maxWidth / avgCharWidth));
	const lineCount = Math.max(1, Math.ceil(options.text.length / charsPerLine));
	const lines: PretextLineInfo[] = [];

	for (let i = 0; i < lineCount; i++) {
		const start = i * charsPerLine;
		const text = options.text.slice(start, start + charsPerLine);
		lines.push({
			key: String(i),
			text,
			width: text.length * avgCharWidth,
			y: i * options.lineHeight,
			index: i,
		});
	}

	return {
		height: lineCount * options.lineHeight,
		lineCount,
		lines,
		font: options.font,
		lineHeight: options.lineHeight,
	};
}

export function computeLayout(
	options: PretextLayoutOptions,
	cache?: LayoutCache,
): PretextLayoutResult {
	// SSR: pretext requires canvas for prepare()
	if (typeof document === "undefined") {
		return estimateLayoutSSR(options);
	}

	const layoutCache = cache ?? getGlobalCache();
	const key = buildCacheKey(options.text, options.font, options.maxWidth, options.lineHeight);

	const cached = layoutCache.get(key);
	if (cached !== undefined) {
		return cached;
	}

	if (options.locale !== undefined) {
		setLocale(options.locale);
	}

	const prepared = prepareWithSegments(options.text, options.font);
	const raw = layoutWithLines(prepared, options.maxWidth, options.lineHeight);

	const lines: PretextLineInfo[] = raw.lines.map((line, index) => ({
		key: String(index),
		text: line.text,
		width: line.width,
		y: index * options.lineHeight,
		index,
	}));

	const result: PretextLayoutResult = {
		height: raw.height,
		lineCount: raw.lineCount,
		lines,
		font: options.font,
		lineHeight: options.lineHeight,
	};

	layoutCache.set(key, result);
	return result;
}

// Height-only cache keyed separately to avoid pollution of the full layout cache.
const heightCache = new Map<string, number>();
const HEIGHT_CACHE_CAPACITY = 20_000;

/**
 * Fast path: computes only height using prepare() + layout().
 * ~10x faster than computeLayout() because it skips line materialization.
 * Use this when you only need dimensions (e.g., virtualizer height computation).
 */
export function computeHeight(options: PretextHeightOptions): number {
	if (typeof document === "undefined") {
		const charsPerLine = Math.max(1, Math.floor(options.maxWidth / SSR_AVG_CHAR_WIDTH));
		const lineCount = Math.max(1, Math.ceil(options.text.length / charsPerLine));
		return lineCount * options.lineHeight;
	}

	const key = buildCacheKey(options.text, options.font, options.maxWidth, options.lineHeight);
	const cached = heightCache.get(key);
	if (cached !== undefined) return cached;

	if (options.locale !== undefined) {
		setLocale(options.locale);
	}

	const prepared = prepare(options.text, options.font);
	const result = layout(prepared, options.maxWidth, options.lineHeight);

	// Evict oldest when full
	if (heightCache.size >= HEIGHT_CACHE_CAPACITY) {
		const firstKey = heightCache.keys().next().value;
		if (firstKey !== undefined) heightCache.delete(firstKey);
	}
	heightCache.set(key, result.height);

	return result.height;
}
