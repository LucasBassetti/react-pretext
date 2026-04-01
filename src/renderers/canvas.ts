import type { PretextLayoutResult } from "../core/types.js";

export interface CanvasRenderOptions {
	x?: number;
	y?: number;
	font?: string;
	color?: string;
}

/**
 * Renders layout lines onto a canvas 2D context.
 * Call this inside a useEffect or useLayoutEffect.
 */
export function renderToCanvas(
	ctx: CanvasRenderingContext2D,
	layout: PretextLayoutResult,
	options?: CanvasRenderOptions,
): void {
	const offsetX = options?.x ?? 0;
	const offsetY = options?.y ?? 0;

	ctx.font = options?.font ?? layout.font;
	if (options?.color) {
		ctx.fillStyle = options.color;
	}

	ctx.textBaseline = "top";

	for (const line of layout.lines) {
		ctx.fillText(line.text, offsetX, offsetY + line.y);
	}
}
