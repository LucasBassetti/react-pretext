import { createContext, useContext } from "react";
import type { PretextConfig, PretextLayoutResult } from "./types.js";

export const PretextContext = createContext<PretextConfig | null>(null);

export const LayoutContext = createContext<PretextLayoutResult | null>(null);

export function usePretextConfig(): PretextConfig | null {
	return useContext(PretextContext);
}

export function useLayoutResult(): PretextLayoutResult {
	const layout = useContext(LayoutContext);
	if (layout === null) {
		throw new Error("useLayoutResult must be used within a <Pretext.Root> component");
	}
	return layout;
}
