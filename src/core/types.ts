export type {
	PreparedText,
	PreparedTextWithSegments,
	LayoutLine,
	LayoutCursor,
	LayoutResult,
	LayoutLinesResult,
} from "@chenglou/pretext";

export interface PretextLayoutOptions {
	text: string;
	/** CSS font shorthand, e.g. "16px Inter" */
	font: string;
	maxWidth: number;
	lineHeight: number;
	locale?: string;
}

export interface PretextLineInfo {
	/** Stable key for React rendering */
	key: string;
	text: string;
	width: number;
	/** Vertical offset from the top of the layout block */
	y: number;
	index: number;
}

export interface PretextLayoutResult {
	height: number;
	lineCount: number;
	lines: PretextLineInfo[];
	/** CSS font shorthand used to compute this layout */
	font: string;
	/** Line height in pixels used to compute this layout */
	lineHeight: number;
}

export interface PretextConfig {
	font: string;
	lineHeight: number;
	locale?: string;
	debug?: boolean;
}

export interface PretextVirtualizerOptions {
	items: ReadonlyArray<{ text: string; font?: string }>;
	width: number;
	lineHeight: number;
	scrollTop: number;
	viewportHeight: number;
	/** Number of items to render above/below the visible range. Default: 3 */
	overscan?: number;
	/** Default font for items that don't specify one */
	font?: string;
}

export interface VirtualItem {
	index: number;
	key: string;
	offsetTop: number;
	height: number;
	data: { text: string; font?: string };
}

export interface PretextVirtualizerResult {
	virtualItems: VirtualItem[];
	totalHeight: number;
	startIndex: number;
	endIndex: number;
}
