import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useResizeObserver } from "../hooks/useResizeObserver.js";

type ResizeCallback = (entries: Array<{ contentRect: { width: number; height: number } }>) => void;

let mockObserverInstances: Array<{
	callback: ResizeCallback;
	observe: ReturnType<typeof vi.fn>;
	disconnect: ReturnType<typeof vi.fn>;
}>;

beforeEach(() => {
	mockObserverInstances = [];

	const MockResizeObserver = vi.fn().mockImplementation((callback: ResizeCallback) => {
		const instance = {
			callback,
			observe: vi.fn(),
			disconnect: vi.fn(),
			unobserve: vi.fn(),
		};
		mockObserverInstances.push(instance);
		return instance;
	});

	vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("useResizeObserver", () => {
	it("returns { width: 0, height: 0 } initially", () => {
		const ref = { current: document.createElement("div") };
		const { result } = renderHook(() => useResizeObserver(ref));
		expect(result.current).toEqual({ width: 0, height: 0 });
	});

	it("updates size when ResizeObserver fires", () => {
		const ref = { current: document.createElement("div") };
		const { result } = renderHook(() => useResizeObserver(ref));

		expect(mockObserverInstances).toHaveLength(1);
		const observer = mockObserverInstances[0];
		expect(observer.observe).toHaveBeenCalledWith(ref.current);

		// Simulate a resize
		act(() => {
			observer.callback([{ contentRect: { width: 300, height: 150 } }]);
		});

		expect(result.current).toEqual({ width: 300, height: 150 });
	});

	it("disconnects observer on unmount", () => {
		const ref = { current: document.createElement("div") };
		const { unmount } = renderHook(() => useResizeObserver(ref));

		expect(mockObserverInstances).toHaveLength(1);
		const observer = mockObserverInstances[0];

		unmount();
		expect(observer.disconnect).toHaveBeenCalled();
	});
});
