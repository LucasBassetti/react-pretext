import type { CSSProperties, ReactNode } from "react";
import { usePretextConfig } from "../core/context.js";
import type { PretextLineInfo } from "../core/types.js";

export interface PretextLineProps {
	line: PretextLineInfo;
	children?: ReactNode | ((line: PretextLineInfo) => ReactNode);
	debug?: boolean;
}

const debugStyle: CSSProperties = {
	position: "relative",
	outline: "1px solid rgba(255, 0, 0, 0.3)",
};

export function PretextLine({ line, children, debug }: PretextLineProps) {
	const config = usePretextConfig();
	const showDebug = debug ?? config?.debug ?? false;

	const content = typeof children === "function" ? children(line) : (children ?? line.text);

	if (showDebug) {
		return (
			<div style={debugStyle} data-pretext-line={line.index}>
				{content}
				<span
					style={{
						position: "absolute",
						top: 0,
						right: 0,
						fontSize: "10px",
						color: "rgba(255, 0, 0, 0.5)",
						pointerEvents: "none",
					}}
				>
					{Math.round(line.width)}px
				</span>
			</div>
		);
	}

	return <>{content}</>;
}
