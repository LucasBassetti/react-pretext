// Compound component
export { Pretext } from "./components/index.js";
export { PretextRoot } from "./components/PretextRoot.js";
export { PretextLines } from "./components/PretextLines.js";
export { PretextLine } from "./components/PretextLine.js";
export { PretextProvider } from "./components/PretextProvider.js";

// Hooks
export { usePretextLayout } from "./hooks/usePretextLayout.js";
export { usePretextVirtualizer } from "./hooks/usePretextVirtualizer.js";
export { useFontReady } from "./hooks/useFontReady.js";
export { useResizeObserver } from "./hooks/useResizeObserver.js";

// Core
export { computeLayout, computeHeight } from "./core/layout.js";
export { createCache, clearLayoutCache } from "./core/cache.js";

// Renderers
export { DomRenderer } from "./renderers/dom.js";
export { SvgRenderer } from "./renderers/svg.js";
export { renderToCanvas } from "./renderers/canvas.js";

// Types
export type {
	PretextLayoutOptions,
	PretextLayoutResult,
	PretextLineInfo,
	PretextConfig,
	PretextVirtualizerOptions,
	PretextVirtualizerResult,
	VirtualItem,
	PreparedText,
	PreparedTextWithSegments,
	LayoutLine,
	LayoutCursor,
	LayoutResult,
	LayoutLinesResult,
} from "./core/types.js";

export type { PretextHeightOptions } from "./core/layout.js";
export type { LayoutCache } from "./core/cache.js";
export type { PretextRootProps } from "./components/PretextRoot.js";
export type { PretextLinesProps } from "./components/PretextLines.js";
export type { PretextLineProps } from "./components/PretextLine.js";
export type { PretextProviderProps } from "./components/PretextProvider.js";
export type { UsePretextLayoutOptions } from "./hooks/usePretextLayout.js";
export type { Size } from "./hooks/useResizeObserver.js";
export type { DomRendererProps } from "./renderers/dom.js";
export type { SvgRendererProps } from "./renderers/svg.js";
export type { CanvasRenderOptions } from "./renderers/canvas.js";
