import { describe, expect, it } from "vitest";
import { createCache } from "../core/cache.js";
import type { PretextLayoutResult } from "../core/types.js";

function makeResult(lineCount: number): PretextLayoutResult {
	return {
		height: lineCount * 20,
		lineCount,
		lines: [],
	};
}

describe("LayoutCache", () => {
	it("returns undefined for missing keys", () => {
		const cache = createCache();
		expect(cache.get("nonexistent")).toBeUndefined();
	});

	it("stores and retrieves values", () => {
		const cache = createCache();
		const result = makeResult(3);
		cache.set("key1", result);
		expect(cache.get("key1")).toBe(result);
		expect(cache.size).toBe(1);
	});

	it("evicts oldest entry when capacity is exceeded", () => {
		const cache = createCache(3);
		cache.set("a", makeResult(1));
		cache.set("b", makeResult(2));
		cache.set("c", makeResult(3));
		cache.set("d", makeResult(4));

		expect(cache.get("a")).toBeUndefined();
		expect(cache.get("b")).toBeDefined();
		expect(cache.get("d")).toBeDefined();
		expect(cache.size).toBe(3);
	});

	it("promotes accessed entries (LRU behavior)", () => {
		const cache = createCache(3);
		cache.set("a", makeResult(1));
		cache.set("b", makeResult(2));
		cache.set("c", makeResult(3));

		// Access "a" to promote it
		cache.get("a");

		// Add "d" — should evict "b" (now oldest)
		cache.set("d", makeResult(4));

		expect(cache.get("a")).toBeDefined();
		expect(cache.get("b")).toBeUndefined();
		expect(cache.get("c")).toBeDefined();
		expect(cache.get("d")).toBeDefined();
	});

	it("clears all entries", () => {
		const cache = createCache();
		cache.set("a", makeResult(1));
		cache.set("b", makeResult(2));
		cache.clear();
		expect(cache.size).toBe(0);
		expect(cache.get("a")).toBeUndefined();
	});

	it("overwrites existing keys without growing size", () => {
		const cache = createCache();
		cache.set("a", makeResult(1));
		cache.set("a", makeResult(2));
		expect(cache.size).toBe(1);
		expect(cache.get("a")?.lineCount).toBe(2);
	});
});
