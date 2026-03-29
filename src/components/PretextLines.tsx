import type { ReactNode } from "react";
import { useLayoutResult } from "../core/context.js";
import type { PretextLineInfo } from "../core/types.js";

export interface PretextLinesProps {
	children: (line: PretextLineInfo, index: number) => ReactNode;
}

export function PretextLines({ children }: PretextLinesProps) {
	const layout = useLayoutResult();
	return <>{layout.lines.map((line, index) => children(line, index))}</>;
}
