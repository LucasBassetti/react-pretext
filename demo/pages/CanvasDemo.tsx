import { useEffect, useRef, useState } from "react";
import { renderToCanvas, usePretextLayout } from "react-pretext";

const DEFAULT_TEXT =
	"Canvas rendering demo: this text is drawn entirely on a <canvas> element using react-pretext's renderToCanvas() function. No DOM text nodes are used — the layout is computed by pretext and painted via fillText. This is useful for high-performance text rendering in games, editors, and data visualization.";

const FONT = "16px Inter, system-ui, sans-serif";

export function CanvasDemo() {
	const [text, setText] = useState(DEFAULT_TEXT);
	const [width, setWidth] = useState(500);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const layout = usePretextLayout({
		text,
		maxWidth: Math.max(0, width - 32),
		font: FONT,
		lineHeight: 24,
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = width * dpr;
		canvas.height = (layout.height + 32) * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${layout.height + 32}px`;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.scale(dpr, dpr);
		ctx.clearRect(0, 0, width, layout.height + 32);

		// Background
		ctx.fillStyle = "#1a1a2e";
		ctx.roundRect(0, 0, width, layout.height + 32, 8);
		ctx.fill();

		// Text
		ctx.fillStyle = "#e0e0e0";
		renderToCanvas(ctx, layout, { x: 16, y: 16, font: FONT });

		// Line guides
		ctx.strokeStyle = "rgba(100, 100, 255, 0.2)";
		ctx.lineWidth = 0.5;
		for (const line of layout.lines) {
			ctx.beginPath();
			ctx.moveTo(16, 16 + line.y + 24);
			ctx.lineTo(width - 16, 16 + line.y + 24);
			ctx.stroke();
		}
	}, [layout, width]);

	return (
		<div>
			<h2 style={{ margin: "0 0 12px" }}>Canvas Rendering</h2>
			<div style={{ marginBottom: 16 }}>
				<label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
					Width: {width}px
					<input
						type="range"
						min={200}
						max={800}
						value={width}
						onChange={(e) => setWidth(Number(e.target.value))}
						style={{ display: "block", width: "100%" }}
					/>
				</label>
				<label style={{ display: "block", fontSize: 14 }}>
					Text:
					<textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						rows={3}
						style={{
							display: "block",
							width: "100%",
							padding: 8,
							border: "1px solid var(--color-border)",
							borderRadius: 4,
							fontFamily: "inherit",
							fontSize: 14,
							resize: "vertical",
							background: "var(--color-surface)",
							color: "var(--color-text)",
						}}
					/>
				</label>
			</div>
			<div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8 }}>
				{layout.lineCount} lines / {layout.height}px / rendered via canvas fillText
			</div>
			<canvas ref={canvasRef} style={{ borderRadius: 8, display: "block" }} />
		</div>
	);
}
