import type { ReactNode } from "react";
import { PretextContext } from "../core/context.js";
import type { PretextConfig } from "../core/types.js";

export interface PretextProviderProps extends PretextConfig {
	children: ReactNode;
}

export function PretextProvider({ children, ...config }: PretextProviderProps) {
	return <PretextContext.Provider value={config}>{children}</PretextContext.Provider>;
}
