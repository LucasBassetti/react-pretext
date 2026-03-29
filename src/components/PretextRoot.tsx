import type { ReactNode } from "react";
import { LayoutContext, usePretextConfig } from "../core/context.js";
import type { PretextLayoutResult } from "../core/types.js";
import { usePretextLayout } from "../hooks/usePretextLayout.js";

export interface PretextRootProps {
	text: string;
	width: number;
	font?: string;
	lineHeight?: number;
	locale?: string;
	children: ReactNode | ((layout: PretextLayoutResult) => ReactNode);
}

export function PretextRoot({ text, width, font, lineHeight, locale, children }: PretextRootProps) {
	const config = usePretextConfig();
	const layout = usePretextLayout({
		text,
		maxWidth: width,
		font: font ?? config?.font,
		lineHeight: lineHeight ?? config?.lineHeight,
		locale,
	});

	if (typeof children === "function") {
		return <>{children(layout)}</>;
	}

	return <LayoutContext.Provider value={layout}>{children}</LayoutContext.Provider>;
}
