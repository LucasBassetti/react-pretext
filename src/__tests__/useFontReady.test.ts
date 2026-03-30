import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFontReady } from "../hooks/useFontReady.js";

function createMockFonts({ checkReturn = true }: { checkReturn?: boolean } = {}) {
	const loadResolvers: Array<() => void> = [];
	let readyResolver: (() => void) | undefined;

	const readyPromise = new Promise<void>((resolve) => {
		readyResolver = resolve;
	});

	return {
		mock: {
			check: vi.fn().mockReturnValue(checkReturn),
			load: vi.fn().mockImplementation(
				() =>
					new Promise<void>((resolve) => {
						loadResolvers.push(resolve);
					}),
			),
			ready: readyPromise,
		},
		resolveLoad() {
			const resolver = loadResolvers.shift();
			if (resolver) resolver();
		},
		resolveReady() {
			if (readyResolver) readyResolver();
		},
	};
}

describe("useFontReady", () => {
	const originalFonts = document.fonts;

	afterEach(() => {
		// Restore original document.fonts
		Object.defineProperty(document, "fonts", {
			value: originalFonts,
			writable: true,
			configurable: true,
		});
	});

	it("returns true when the font is already loaded", () => {
		const { mock } = createMockFonts({ checkReturn: true });
		Object.defineProperty(document, "fonts", {
			value: mock,
			writable: true,
			configurable: true,
		});

		const { result } = renderHook(() => useFontReady("16px TestFont-AlreadyLoaded"));
		expect(result.current).toBe(true);
		expect(mock.check).toHaveBeenCalledWith("16px TestFont-AlreadyLoaded");
	});

	it("transitions to true after font loads", async () => {
		const { mock, resolveLoad } = createMockFonts({ checkReturn: false });
		Object.defineProperty(document, "fonts", {
			value: mock,
			writable: true,
			configurable: true,
		});

		// After load resolves, check should return true
		mock.load.mockImplementation(() => {
			return Promise.resolve().then(() => {
				mock.check.mockReturnValue(true);
			});
		});

		const { result } = renderHook(() => useFontReady("16px TestFont-Loading"));

		// Initially not ready
		expect(result.current).toBe(false);

		// Let the load promise resolve and flush microtasks
		await act(async () => {
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(result.current).toBe(true);
	});

	it("caches the store per font string", () => {
		const { mock } = createMockFonts({ checkReturn: true });
		Object.defineProperty(document, "fonts", {
			value: mock,
			writable: true,
			configurable: true,
		});

		const font = `16px TestFont-Cached-${Math.random()}`;
		const { result: result1 } = renderHook(() => useFontReady(font));
		const callCount = mock.check.mock.calls.length;

		// Rendering with the same font should reuse the store and not call check again
		const { result: result2 } = renderHook(() => useFontReady(font));
		// check should not have been called additional times for store creation
		expect(mock.check.mock.calls.length).toBe(callCount);

		expect(result1.current).toBe(true);
		expect(result2.current).toBe(true);
	});
});
