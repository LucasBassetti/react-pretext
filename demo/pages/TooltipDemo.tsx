import { useCallback, useRef, useState } from "react";
import { computeLayout, DomRenderer, usePretextLayout } from "react-pretext";

const FONT = "14px Inter, system-ui, sans-serif";
const LINE_HEIGHT = 20;
const TOOLTIP_MAX_WIDTH = 260;
const TOOLTIP_PADDING = 12;

const TRIGGERS = [
	{
		label: "Deterministic",
		tooltip:
			"Text layout is computed without any DOM reads. Heights and line breaks are known before the first render.",
	},
	{
		label: "Cached",
		tooltip:
			"Character widths are measured once per font and cached. Subsequent layout calls for the same font are nearly instant, even for thousands of text blocks.",
	},
	{
		label: "Virtualized",
		tooltip: "The built-in virtualizer uses precomputed heights for zero-layout-shift scrolling.",
	},
	{
		label: "Canvas",
		tooltip:
			"Render text to a canvas element for maximum performance. The same layout result works with DOM, SVG, and canvas renderers interchangeably.",
	},
	{
		label: "SSR Ready",
		tooltip:
			"Falls back to character-width estimation when canvas is unavailable on the server. Hydration works seamlessly.",
	},
	{
		label: "Zero Thrashing",
		tooltip:
			"No layout thrashing, ever. Because pretext computes text dimensions with pure arithmetic, there are no forced reflows when positioning tooltips, popovers, or any measured UI element.",
	},
];

function precomputeTooltipHeight(text: string): number {
	const layout = computeLayout({
		text,
		font: FONT,
		maxWidth: TOOLTIP_MAX_WIDTH - TOOLTIP_PADDING * 2,
		lineHeight: LINE_HEIGHT,
	});
	return layout.height;
}

type TooltipState = {
	index: number;
	x: number;
	y: number;
} | null;

function Tooltip({ text }: { text: string }) {
	const layout = usePretextLayout({
		text,
		maxWidth: TOOLTIP_MAX_WIDTH - TOOLTIP_PADDING * 2,
		font: FONT,
		lineHeight: LINE_HEIGHT,
	});

	return (
		<div
			style={{
				boxSizing: "content-box",
				width: TOOLTIP_MAX_WIDTH - TOOLTIP_PADDING * 2,
				height: layout.height,
				padding: TOOLTIP_PADDING,
				background: "var(--color-bg)",
				border: "1px solid var(--color-border)",
				borderRadius: 6,
				boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
			}}
		>
			<DomRenderer layout={layout} />
		</div>
	);
}

export function TooltipDemo() {
	const [active, setActive] = useState<TooltipState>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const handleMouseEnter = useCallback(
		(index: number, event: React.MouseEvent<HTMLButtonElement>) => {
			const button = event.currentTarget;
			const container = containerRef.current;
			if (!container) return;

			const buttonRect = button.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();

			const tooltipHeight =
				precomputeTooltipHeight(TRIGGERS[index].tooltip) + TOOLTIP_PADDING * 2;

			const x = buttonRect.left - containerRect.left + buttonRect.width / 2 - TOOLTIP_MAX_WIDTH / 2;
			const y = buttonRect.top - containerRect.top - tooltipHeight - 8;

			setActive({ index, x, y });
		},
		[],
	);

	const handleMouseLeave = useCallback(() => {
		setActive(null);
	}, []);

	return (
		<div>
			<h2 style={{ margin: "0 0 12px" }}>Precomputed Tooltip Positioning</h2>
			<p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 16px" }}>
				Tooltip height is precomputed with <code>computeHeight</code> before positioning, so the
				tooltip appears in the correct position on the first frame. No measure-then-position cycle,
				no layout thrashing.
			</p>

			<div
				ref={containerRef}
				style={{
					position: "relative",
					padding: "80px 20px 40px",
					border: "1px solid var(--color-border)",
					borderRadius: 8,
					background: "var(--color-bg-secondary)",
				}}
			>
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						gap: 12,
						justifyContent: "center",
					}}
				>
					{TRIGGERS.map((trigger, index) => (
						<button
							key={trigger.label}
							type="button"
							onMouseEnter={(e) => handleMouseEnter(index, e)}
							onMouseLeave={handleMouseLeave}
							style={{
								padding: "8px 20px",
								border: "1px solid var(--color-border)",
								borderRadius: 6,
								background:
									active?.index === index
										? "var(--color-text)"
										: "var(--color-surface)",
								color:
									active?.index === index
										? "var(--color-surface)"
										: "var(--color-text)",
								cursor: "pointer",
								fontSize: 14,
								transition: "background 0.15s, color 0.15s",
							}}
						>
							{trigger.label}
						</button>
					))}
				</div>

				{active !== null && (
					<div
						style={{
							position: "absolute",
							left: Math.max(8, active.x),
							top: active.y,
							zIndex: 10,
							pointerEvents: "none",
						}}
					>
						<Tooltip text={TRIGGERS[active.index].tooltip} />
					</div>
				)}
			</div>

			<div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 8 }}>
				Hover over the buttons to see tooltips. Heights are computed via computeHeight() — no DOM
				measurement needed.
			</div>
		</div>
	);
}
