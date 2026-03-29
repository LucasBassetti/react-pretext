import { useCallback, useSyncExternalStore } from "react";

type FontReadyStore = {
	subscribe(callback: () => void): () => void;
	getSnapshot(): boolean;
	getServerSnapshot(): boolean;
};

const fontStores = new Map<string, FontReadyStore>();

function createFontStore(font: string): FontReadyStore {
	let ready = false;
	const listeners = new Set<() => void>();

	function check(): boolean {
		if (typeof document === "undefined") return true;
		try {
			return document.fonts.check(font);
		} catch {
			return true;
		}
	}

	function notify(): void {
		for (const listener of listeners) {
			listener();
		}
	}

	// Check immediately
	ready = check();

	// If not ready, start loading
	if (!ready && typeof document !== "undefined") {
		document.fonts.ready.then(() => {
			ready = check();
			if (ready) notify();
		});
		// Also try loading the specific font
		document.fonts
			.load(font)
			.then(() => {
				ready = check();
				if (ready) notify();
			})
			.catch(() => {
				// Font may not exist; mark as ready to avoid hanging
				ready = true;
				notify();
			});
	}

	return {
		subscribe(callback: () => void): () => void {
			listeners.add(callback);
			return () => listeners.delete(callback);
		},
		getSnapshot(): boolean {
			return ready;
		},
		getServerSnapshot(): boolean {
			return true;
		},
	};
}

function getFontStore(font: string): FontReadyStore {
	let store = fontStores.get(font);
	if (store === undefined) {
		store = createFontStore(font);
		fontStores.set(font, store);
	}
	return store;
}

/**
 * Returns true when the specified font is loaded and available for rendering.
 * On the server, always returns true to avoid hydration mismatches.
 */
export function useFontReady(font: string): boolean {
	const store = getFontStore(font);
	const subscribe = useCallback((callback: () => void) => store.subscribe(callback), [store]);
	return useSyncExternalStore(subscribe, store.getSnapshot, store.getServerSnapshot);
}
