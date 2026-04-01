import { useRef } from "react";
import { DomRenderer, usePretextLayout, useResizeObserver } from "react-pretext";

const CARDS = [
	{
		title: "Deterministic Layout",
		body: "Text layout is computed using pure arithmetic on cached character widths. No DOM measurement is ever needed, which means layouts are identical across frames and renders.",
	},
	{
		title: "Zero Layout Thrashing",
		body: "Because pretext never reads from the DOM to compute text dimensions, it completely eliminates layout thrashing — even when measuring hundreds of text blocks simultaneously.",
	},
	{
		title: "Canvas Rendering",
		body: "Render text directly to a canvas element using fillText. Useful for games, data visualizations, and any scenario where DOM text nodes are too slow.",
	},
	{
		title: "Virtualization",
		body: "Built-in virtualizer that knows exact item heights before rendering. Scroll through 10,000 messages with zero layout shift and instant height computation.",
	},
	{
		title: "Font Caching",
		body: "Character widths are cached per font, so subsequent layout calls for the same font are nearly instant. The cache uses an LRU strategy with configurable capacity.",
	},
	{
		title: "SSR Support",
		body: "Falls back to a character-width estimation on the server where canvas is unavailable. Hydration is seamless once the client takes over.",
	},
	{
		title: "React Integration",
		body: "Compound components, hooks, and render props give you full control over how text is laid out and rendered. Works with any React rendering strategy.",
	},
	{
		title: "Resize Observer",
		body: "The useResizeObserver hook tracks container dimensions so layouts can respond to size changes. Combined with usePretextLayout, text reflows automatically.",
	},
	{
		title: "Multiple Renderers",
		body: "DOM, SVG, and Canvas renderers are included. Each consumes the same PretextLayoutResult, so you can switch rendering strategies without changing layout logic.",
	},
	{
		title: "Precomputed Heights",
		body: "The computeHeight function is a fast path that skips line materialization. It is roughly 10x faster than full layout, making it ideal for virtualizer height maps.",
	},
	{
		title: "Debug Mode",
		body: "Enable debug mode to visualize line breaks, baselines, and layout boundaries. Helpful for understanding how text is being wrapped.",
	},
	{
		title: "TypeScript First",
		body: "Every API is fully typed with strict TypeScript. Discriminated unions, readonly types, and explicit generics make the library safe and pleasant to use.",
	},
];

function Card({ title, body }: { title: string; body: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const size = useResizeObserver(containerRef);
	const contentWidth = Math.max(0, size.width - 32);

	const layout = usePretextLayout({
		text: body,
		maxWidth: contentWidth > 0 ? contentWidth : 218,
	});

	return (
		<div
			ref={containerRef}
			style={{
				border: "1px solid var(--color-border)",
				borderRadius: 8,
				padding: 16,
				background: "var(--color-surface)",
			}}
		>
			<h3 style={{ margin: "0 0 8px", fontSize: 15 }}>{title}</h3>
			{contentWidth > 0 && <DomRenderer layout={layout} />}
		</div>
	);
}

export function CardGridDemo() {
	return (
		<div>
			<h2 style={{ margin: "0 0 12px" }}>Responsive Card Grid</h2>
			<p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 16px" }}>
				Each card uses useResizeObserver to track its own width, then usePretextLayout to compute
				text layout. Resize your browser window to see cards reflow responsively.
			</p>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
					gap: 16,
				}}
			>
				{CARDS.map((card) => (
					<Card key={card.title} title={card.title} body={card.body} />
				))}
			</div>
		</div>
	);
}
