import { useMemo } from "react";
import { usePretextConfig } from "../core/context.js";
import { computeVariableLayout } from "../core/layout.js";
import type { ComputeVariableLayoutOptions, VariableLayoutResult } from "../core/types.js";

export type UsePretextVariableLayoutOptions = Omit<
	ComputeVariableLayoutOptions,
	"font" | "lineHeight"
> & {
	font?: string;
	lineHeight?: number;
};

export function usePretextVariableLayout(
	options: UsePretextVariableLayoutOptions,
): VariableLayoutResult {
	const config = usePretextConfig();
	const font = options.font ?? config?.font;
	const lineHeight = options.lineHeight ?? config?.lineHeight;

	if (font === undefined) {
		throw new Error(
			"usePretextVariableLayout: font is required. Pass it directly or provide it via <Pretext.Provider>.",
		);
	}
	if (lineHeight === undefined) {
		throw new Error(
			"usePretextVariableLayout: lineHeight is required. Pass it directly or provide it via <Pretext.Provider>.",
		);
	}

	const { text, getMaxWidth, locale, whiteSpace, maxLines } = options;

	return useMemo(
		() =>
			computeVariableLayout({
				text,
				font,
				lineHeight,
				getMaxWidth,
				locale: locale ?? config?.locale,
				whiteSpace,
				maxLines,
			}),
		[text, font, lineHeight, getMaxWidth, locale, config?.locale, whiteSpace, maxLines],
	);
}
