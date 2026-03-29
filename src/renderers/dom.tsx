import type { CSSProperties } from "react";
import type { PretextLayoutResult } from "../core/types.js";

export interface DomRendererProps {
	layout: PretextLayoutResult;
	className?: string;
	style?: CSSProperties;
}

export function DomRenderer({ layout, className, style }: DomRendererProps) {
	return (
		<div
			className={className}
			style={{
				position: "relative",
				height: layout.height,
				...style,
			}}
		>
			{layout.lines.map((line) => (
				<div
					key={line.key}
					style={{
						position: "absolute",
						top: line.y,
						left: 0,
						whiteSpace: "pre",
					}}
				>
					{line.text}
				</div>
			))}
		</div>
	);
}
