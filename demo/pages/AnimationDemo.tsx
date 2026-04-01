import { useCallback, useEffect, useRef, useState } from "react";
import { DomRenderer, usePretextLayout } from "react-pretext";

const SAMPLE_TEXT =
	"This text is being reflowed in real-time as the container width oscillates. The layout is computed deterministically by react-pretext — no DOM measurement needed. Each frame, the width changes smoothly via a sine wave and the text reflows instantly. This demonstrates how pretext enables butter-smooth animated text layout that would normally cause expensive browser reflows.";

const MIN_WIDTH = 150;
const MAX_WIDTH = 600;

export function AnimationDemo() {
	const [playing, setPlaying] = useState(true);
	const [width, setWidth] = useState(375);
	const rafRef = useRef(0);
	const startTimeRef = useRef(0);

	const layout = usePretextLayout({
		text: SAMPLE_TEXT,
		maxWidth: Math.max(0, width - 32),
	});

	const animate = useCallback((timestamp: number) => {
		if (startTimeRef.current === 0) {
			startTimeRef.current = timestamp;
		}
		const elapsed = (timestamp - startTimeRef.current) / 1000;
		const t = (Math.sin(elapsed * 0.8) + 1) / 2;
		const newWidth = Math.round(MIN_WIDTH + t * (MAX_WIDTH - MIN_WIDTH));
		setWidth(newWidth);
		rafRef.current = requestAnimationFrame(animate);
	}, []);

	useEffect(() => {
		if (playing) {
			rafRef.current = requestAnimationFrame(animate);
		}
		return () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = 0;
			}
		};
	}, [playing, animate]);

	const togglePlay = useCallback(() => {
		setPlaying((p) => {
			if (p) {
				startTimeRef.current = 0;
			}
			return !p;
		});
	}, []);

	return (
		<div>
			<h2 style={{ margin: "0 0 12px" }}>Animated Text Reflow</h2>
			<p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 16px" }}>
				The container width oscillates between {MIN_WIDTH}px and {MAX_WIDTH}px using
				requestAnimationFrame. The text layout is recomputed each frame with zero DOM measurement.
			</p>

			<div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
				<button
					type="button"
					onClick={togglePlay}
					style={{
						padding: "6px 16px",
						border: "1px solid var(--color-border)",
						borderRadius: 4,
						background: "var(--color-surface)",
						color: "var(--color-text)",
						cursor: "pointer",
						fontSize: 14,
					}}
				>
					{playing ? "Pause" : "Play"}
				</button>
				<span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
					Width: {width}px | {layout.lineCount} lines | {layout.height}px height
				</span>
			</div>

			<div
				style={{
					width,
					border: "1px solid var(--color-border)",
					borderRadius: 4,
					padding: 16,
					background: "var(--color-surface)",
					transition: "none",
				}}
			>
				<DomRenderer layout={layout} />
			</div>
		</div>
	);
}
