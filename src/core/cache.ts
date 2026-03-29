import type { PretextLayoutResult } from "./types.js";

const DEFAULT_CAPACITY = 500;

export interface LayoutCache {
	get(key: string): PretextLayoutResult | undefined;
	set(key: string, value: PretextLayoutResult): void;
	clear(): void;
	readonly size: number;
}

export function createCache(capacity = DEFAULT_CAPACITY): LayoutCache {
	const map = new Map<string, PretextLayoutResult>();

	return {
		get(key: string): PretextLayoutResult | undefined {
			const value = map.get(key);
			if (value === undefined) return undefined;
			// Move to end (most recently used)
			map.delete(key);
			map.set(key, value);
			return value;
		},

		set(key: string, value: PretextLayoutResult): void {
			if (map.has(key)) {
				map.delete(key);
			} else if (map.size >= capacity) {
				// Evict oldest entry (first key in insertion order)
				const firstKey = map.keys().next().value;
				if (firstKey !== undefined) {
					map.delete(firstKey);
				}
			}
			map.set(key, value);
		},

		clear(): void {
			map.clear();
		},

		get size(): number {
			return map.size;
		},
	};
}

export function buildCacheKey(
	text: string,
	font: string,
	maxWidth: number,
	lineHeight: number,
): string {
	return `${font}|${maxWidth}|${lineHeight}|${text}`;
}

// Singleton cache shared across all hook instances
let globalCache: LayoutCache | null = null;

export function getGlobalCache(): LayoutCache {
	if (globalCache === null) {
		globalCache = createCache();
	}
	return globalCache;
}

export function clearLayoutCache(): void {
	globalCache?.clear();
}
