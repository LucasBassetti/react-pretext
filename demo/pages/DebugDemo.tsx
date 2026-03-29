import { useState } from "react";
import { Pretext, usePretextLayout } from "react-pretext";

const DEFAULT_TEXT =
	"Debug mode visualizes the layout boxes computed by pretext. Each line shows its pixel width and vertical position. This is useful for verifying that line breaks and measurements match what you expect. Try changing the width to see how text reflows.";

function LayoutInspector({
	text,
	width,
}: {
	text: string;
	width: number;
}) {
	const layout = usePretextLayout({
		text,
		maxWidth: width,
		font: "16px Inter, system-ui, sans-serif",
		lineHeight: 24,
	});

	return (
		<div>
			<div
				style={{
					fontSize: 12,
					color: "#888",
					marginBottom: 8,
					fontFamily: "monospace",
				}}
			>
				lineCount={layout.lineCount} height={layout.height}px maxWidth={width}px
			</div>
			<div
				style={{
					width,
					position: "relative",
					border: "1px solid #e0e0e0",
					borderRadius: 4,
					background: "#fafafa",
					padding: 12,
				}}
			>
				{layout.lines.map((line) => (
					<div
						key={line.key}
						style={{
							position: "relative",
							whiteSpace: "pre",
							background: `rgba(59, 130, 246, ${0.05 + (line.index % 2) * 0.05})`,
							outline: "1px solid rgba(59, 130, 246, 0.3)",
							borderRadius: 2,
						}}
					>
						{line.text}
						<span
							style={{
								position: "absolute",
								right: 0,
								top: 0,
								fontSize: 10,
								fontFamily: "monospace",
								color: "rgba(59, 130, 246, 0.7)",
								background: "rgba(255,255,255,0.9)",
								padding: "0 4px",
								borderRadius: 2,
								pointerEvents: "none",
							}}
						>
							y={line.y} w={Math.round(line.width)}
						</span>
					</div>
				))}
			</div>

			<h3 style={{ margin: "16px 0 8px", fontSize: 14 }}>Line data</h3>
			<table
				style={{
					fontSize: 12,
					fontFamily: "monospace",
					borderCollapse: "collapse",
					width: "100%",
				}}
			>
				<thead>
					<tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
						<th style={{ padding: "4px 8px" }}>idx</th>
						<th style={{ padding: "4px 8px" }}>y</th>
						<th style={{ padding: "4px 8px" }}>width</th>
						<th style={{ padding: "4px 8px" }}>text</th>
					</tr>
				</thead>
				<tbody>
					{layout.lines.map((line) => (
						<tr key={line.key} style={{ borderBottom: "1px solid #eee" }}>
							<td style={{ padding: "4px 8px" }}>{line.index}</td>
							<td style={{ padding: "4px 8px" }}>{line.y}</td>
							<td style={{ padding: "4px 8px" }}>{Math.round(line.width)}</td>
							<td
								style={{
									padding: "4px 8px",
									maxWidth: 400,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{JSON.stringify(line.text)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function DebugDemo() {
	const [text, setText] = useState(DEFAULT_TEXT);
	const [width, setWidth] = useState(400);

	return (
		<Pretext.Provider font="16px Inter, system-ui, sans-serif" lineHeight={24} debug>
			<div>
				<h2 style={{ margin: "0 0 12px" }}>Debug Mode</h2>
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
							rows={3}
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
				<LayoutInspector text={text} width={Math.max(0, width - 24)} />
			</div>
		</Pretext.Provider>
	);
}
