import { useRef, useState } from "react";
import { Pretext, useResizeObserver } from "react-pretext";

const DEFAULT_TEXT =
	"The quick brown fox jumps over the lazy dog. This is a demonstration of deterministic text layout using react-pretext, a React adapter for @chenglou/pretext. It computes line breaks and heights without any DOM measurement — pure arithmetic on cached character widths. Try resizing the width slider or editing the text to see layout update in real time.";

export function BasicDemo() {
	const [text, setText] = useState(DEFAULT_TEXT);
	const [width, setWidth] = useState(400);
	const containerRef = useRef<HTMLDivElement>(null);
	const containerSize = useResizeObserver(containerRef);

	return (
		<div>
			<h2 style={{ margin: "0 0 12px" }}>Basic Layout</h2>
			<div style={{ marginBottom: 16 }}>
				<label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
					Width: {width}px
					<input
						type="range"
						min={100}
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
						rows={4}
						style={{
							display: "block",
							width: "100%",
							padding: 8,
							border: "1px solid #ccc",
							borderRadius: 4,
							fontFamily: "inherit",
							fontSize: 14,
							resize: "vertical",
						}}
					/>
				</label>
			</div>

			<h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Child component pattern</h3>
			<div
				ref={containerRef}
				style={{
					width,
					border: "1px solid #e0e0e0",
					borderRadius: 4,
					padding: 12,
					marginBottom: 16,
					background: "#fafafa",
				}}
			>
				<Pretext.Root text={text} width={Math.max(0, width - 24)}>
					<Pretext.Lines>
						{(line) => (
							<div key={line.key} style={{ whiteSpace: "pre" }}>
								{line.text}
							</div>
						)}
					</Pretext.Lines>
				</Pretext.Root>
			</div>

			<h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Render prop pattern</h3>
			<div
				style={{
					width,
					border: "1px solid #e0e0e0",
					borderRadius: 4,
					padding: 12,
					background: "#fafafa",
				}}
			>
				<Pretext.Root text={text} width={Math.max(0, width - 24)}>
					{(layout) => (
						<div>
							<div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
								{layout.lineCount} lines / {layout.height}px height
								{containerSize.width > 0 && ` / container: ${Math.round(containerSize.width)}px`}
							</div>
							{layout.lines.map((line) => (
								<div key={line.key} style={{ whiteSpace: "pre" }}>
									{line.text}
								</div>
							))}
						</div>
					)}
				</Pretext.Root>
			</div>
		</div>
	);
}
