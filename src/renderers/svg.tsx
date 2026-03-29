import type { PretextLayoutResult } from "../core/types.js";

export interface SvgRendererProps {
	layout: PretextLayoutResult;
	font?: string;
	className?: string;
	title?: string;
}

export function SvgRenderer({ layout, font, className, title = "Text layout" }: SvgRendererProps) {
	return (
		<svg
			className={className}
			width="100%"
			height={layout.height}
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label={title}
		>
			<title>{title}</title>
			{layout.lines.map((line) => (
				<text
					key={line.key}
					x={0}
					y={line.y}
					dominantBaseline="hanging"
					style={font ? { font } : undefined}
				>
					{line.text}
				</text>
			))}
		</svg>
	);
}
