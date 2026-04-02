import {
	layout,
	layoutNextLine,
	layoutWithLines,
	prepare,
	prepareWithSegments,
	setLocale as pretextSetLocale,
	profilePrepare,
	walkLineRanges,
} from "@chenglou/pretext";
import type { PreparedTextWithSegments } from "@chenglou/pretext";
import { type LayoutCache, buildCacheKey, getGlobalCache, registerCacheClear } from "./cache.js";
import type {
	ComputeLineRangesOptions,
	ComputePreparedTextOptions,
	ComputeVariableLayoutOptions,
	PretextLayoutOptions,
	PretextLayoutResult,
	PretextLineInfo,
	ProfileLayoutOptions,
	VariableLayoutLine,
	VariableLayoutResult,
} from "./types.js";
import type { PrepareProfile } from "./types.js";

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
		pretextSetLocale(options.locale);
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
		pretextSetLocale(options.locale);
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

/**
 * Prepares text for layout with SSR fallback and locale handling.
 * Use the returned value with `layoutNextLine` for per-line variable widths.
 */
export function computePreparedText(options: ComputePreparedTextOptions): PreparedTextWithSegments {
	if (typeof document === "undefined") {
		// SSR fallback: build a mock PreparedTextWithSegments
		const words = options.text.split(/(\s+)/);
		return {
			segments: words,
		} as unknown as PreparedTextWithSegments;
	}

	if (options.locale !== undefined) {
		pretextSetLocale(options.locale);
	}

	const prepareOptions = options.whiteSpace ? { whiteSpace: options.whiteSpace } : undefined;
	return prepareWithSegments(options.text, options.font, prepareOptions);
}

const DEFAULT_MAX_LINES = 1000;

/**
 * Lays out text with a different maxWidth per line.
 * Handles SSR fallback, locale, and cursor management internally.
 */
export function computeVariableLayout(options: ComputeVariableLayoutOptions): VariableLayoutResult {
	const maxLines = options.maxLines ?? DEFAULT_MAX_LINES;

	if (typeof document === "undefined") {
		return estimateVariableLayoutSSR(options, maxLines);
	}

	if (options.locale !== undefined) {
		pretextSetLocale(options.locale);
	}

	const prepareOptions = options.whiteSpace ? { whiteSpace: options.whiteSpace } : undefined;
	const prepared = prepareWithSegments(options.text, options.font, prepareOptions);
	let cursor = { segmentIndex: 0, graphemeIndex: 0 };
	const lines: VariableLayoutLine[] = [];
	let y = 0;

	for (let i = 0; i < maxLines; i++) {
		const maxWidth = options.getMaxWidth(i, y);
		const line = layoutNextLine(prepared, cursor, maxWidth);
		if (line === null) break;

		lines.push({
			key: String(i),
			text: line.text,
			width: line.width,
			y,
			index: i,
			maxWidth,
		});

		cursor = line.end;
		y += options.lineHeight;
	}

	return {
		height: lines.length * options.lineHeight,
		lineCount: lines.length,
		lines,
		font: options.font,
		lineHeight: options.lineHeight,
	};
}

function estimateVariableLayoutSSR(
	options: ComputeVariableLayoutOptions,
	maxLines: number,
): VariableLayoutResult {
	const lines: VariableLayoutLine[] = [];
	let charOffset = 0;
	let y = 0;

	for (let i = 0; i < maxLines && charOffset < options.text.length; i++) {
		const maxWidth = options.getMaxWidth(i, y);
		const charsPerLine = Math.max(1, Math.floor(maxWidth / SSR_AVG_CHAR_WIDTH));
		const text = options.text.slice(charOffset, charOffset + charsPerLine);

		lines.push({
			key: String(i),
			text,
			width: text.length * SSR_AVG_CHAR_WIDTH,
			y,
			index: i,
			maxWidth,
		});

		charOffset += charsPerLine;
		y += options.lineHeight;
	}

	return {
		height: lines.length * options.lineHeight,
		lineCount: lines.length,
		lines,
		font: options.font,
		lineHeight: options.lineHeight,
	};
}

/**
 * Iterates over line ranges without materializing line text.
 * Useful for aggregate geometry calculations (e.g., computing total height at variable widths).
 */
export function computeLineRanges(options: ComputeLineRangesOptions): number {
	if (typeof document === "undefined") {
		const charsPerLine = Math.max(1, Math.floor(options.maxWidth / SSR_AVG_CHAR_WIDTH));
		const lineCount = Math.max(1, Math.ceil(options.text.length / charsPerLine));
		for (let i = 0; i < lineCount; i++) {
			options.onLine({
				width: Math.min(options.text.length - i * charsPerLine, charsPerLine) * SSR_AVG_CHAR_WIDTH,
				start: { segmentIndex: i, graphemeIndex: 0 },
				end: { segmentIndex: i + 1, graphemeIndex: 0 },
			});
		}
		return lineCount;
	}

	if (options.locale !== undefined) {
		pretextSetLocale(options.locale);
	}

	const prepareOptions = options.whiteSpace ? { whiteSpace: options.whiteSpace } : undefined;
	const prepared = prepareWithSegments(options.text, options.font, prepareOptions);
	return walkLineRanges(prepared, options.maxWidth, options.onLine);
}

/**
 * Returns performance profiling data for text preparation.
 * Useful for debugging and benchmarking.
 */
export function profileLayout(options: ProfileLayoutOptions): PrepareProfile {
	if (typeof document === "undefined") {
		return {
			analysisMs: 0,
			measureMs: 0,
			totalMs: 0,
			analysisSegments: 0,
			preparedSegments: 0,
			breakableSegments: 0,
		};
	}

	return profilePrepare(options.text, options.font);
}

registerCacheClear(() => heightCache.clear());

/**
 * Sets the locale for text analysis (word/grapheme segmentation).
 * Also clears pretext's internal caches.
 */
export function setLocale(locale?: string): void {
	pretextSetLocale(locale);
}
