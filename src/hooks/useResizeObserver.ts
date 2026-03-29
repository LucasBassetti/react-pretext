import { type RefObject, useEffect, useState } from "react";

export interface Size {
	width: number;
	height: number;
}

/**
 * Tracks the content box dimensions of a DOM element via ResizeObserver.
 * Returns { width: 0, height: 0 } until the element mounts.
 */
export function useResizeObserver(ref: RefObject<Element | null>): Size {
	const [size, setSize] = useState<Size>({ width: 0, height: 0 });

	useEffect(() => {
		const element = ref.current;
		if (element === null) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry === undefined) return;
			const { width, height } = entry.contentRect;
			setSize((prev) => {
				if (prev.width === width && prev.height === height) return prev;
				return { width, height };
			});
		});

		observer.observe(element);
		return () => observer.disconnect();
	}, [ref]);

	return size;
}
