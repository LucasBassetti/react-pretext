import { useMemo } from "react";
import { usePretextConfig } from "../core/context.js";
import { computeLayout } from "../core/layout.js";
import type { PretextLayoutOptions, PretextLayoutResult } from "../core/types.js";

export type UsePretextLayoutOptions = Omit<PretextLayoutOptions, "font" | "lineHeight"> & {
	font?: string;
	lineHeight?: number;
};

export function usePretextLayout(options: UsePretextLayoutOptions): PretextLayoutResult {
	const config = usePretextConfig();
	const font = options.font ?? config?.font;
	const lineHeight = options.lineHeight ?? config?.lineHeight;

	if (font === undefined) {
		throw new Error(
			"usePretextLayout: font is required. Pass it directly or provide it via <Pretext.Provider>.",
		);
	}
	if (lineHeight === undefined) {
		throw new Error(
			"usePretextLayout: lineHeight is required. Pass it directly or provide it via <Pretext.Provider>.",
		);
	}

	const { text, maxWidth, locale } = options;

	return useMemo(
		() =>
			computeLayout({
				text,
				font,
				maxWidth,
				lineHeight,
				locale: locale ?? config?.locale,
			}),
		[text, font, maxWidth, lineHeight, locale, config?.locale],
	);
}
