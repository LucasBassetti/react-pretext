import { useRef, useState } from "react";
import { DomRenderer, usePretextLayout, useResizeObserver } from "react-pretext";

const SAMPLE_CODE = `import { useState, useEffect } from "react";

interface User {
\tid: string;
\tname: string;
\temail: string;
\trole: "admin" | "user";
}

function useCurrentUser() {
\tconst [user, setUser] = useState<User | null>(null);
\tconst [loading, setLoading] = useState(true);

\tuseEffect(() => {
\t\tfetch("/api/me")
\t\t\t.then((res) => res.json())
\t\t\t.then((data) => {
\t\t\t\tsetUser(data);
\t\t\t\tsetLoading(false);
\t\t\t})
\t\t\t.catch(() => setLoading(false));
\t}, []);

\treturn { user, loading };
}

export function ProfileCard() {
\tconst { user, loading } = useCurrentUser();

\tif (loading) return <div>Loading...</div>;
\tif (!user) return <div>Not signed in</div>;

\treturn (
\t\t<div className="profile-card">
\t\t\t<h2>{user.name}</h2>
\t\t\t<p>{user.email}</p>
\t\t\t<span className="badge">{user.role}</span>
\t\t</div>
\t);
}`;

const CODE_FONT = "14px 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace";
const CODE_LINE_HEIGHT = 20;
const GUTTER_WIDTH = 44;

const TAB_SIZE = 2;
const TAB_SPACES = " ".repeat(TAB_SIZE);
const SOURCE_LINES = SAMPLE_CODE.split("\n").map((line) => line.replaceAll("\t", TAB_SPACES));

function SourceLine({
	text,
	lineNumber,
	contentWidth,
}: { text: string; lineNumber: number; contentWidth: number }) {
	const layout = usePretextLayout({
		text: text || " ",
		maxWidth: contentWidth,
		font: CODE_FONT,
		lineHeight: CODE_LINE_HEIGHT,
	});

	const height = text ? layout.height : CODE_LINE_HEIGHT;

	return (
		<div style={{ position: "relative", height }}>
			{/* Line number */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: GUTTER_WIDTH,
					height: CODE_LINE_HEIGHT,
					lineHeight: `${CODE_LINE_HEIGHT}px`,
					fontSize: 12,
					fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
					color: "#5a5a70",
					textAlign: "right",
					paddingRight: 8,
					userSelect: "none",
				}}
			>
				{lineNumber}
			</div>

			{/* Code content */}
			{text && (
				<div style={{ position: "absolute", top: 0, left: GUTTER_WIDTH + 12 }}>
					<DomRenderer layout={layout} style={{ color: "#cdd6f4" }} />
				</div>
			)}
		</div>
	);
}

export function CodeEditorDemo() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { width: observedWidth } = useResizeObserver(containerRef);
	const [manualWidth, setManualWidth] = useState<number | null>(null);

	const editorWidth = manualWidth ?? Math.min(observedWidth || 720, 720);
	const contentWidth = Math.max(60, editorWidth - GUTTER_WIDTH - 24);

	return (
		<div ref={containerRef}>
			<h2 style={{ margin: "0 0 12px" }}>Code Editor Display</h2>
			<p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 16px" }}>
				Drag the slider to resize. Each source line is laid out independently — when a line wraps,
				continuation lines have no line number, just like a real editor.
			</p>

			<div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
				<label htmlFor="editor-width" style={{ fontSize: 14, whiteSpace: "nowrap" }}>
					Width: {editorWidth}px
				</label>
				<input
					id="editor-width"
					type="range"
					min={200}
					max={Math.max(720, observedWidth || 720)}
					value={editorWidth}
					onChange={(e) => setManualWidth(Number(e.target.value))}
					style={{ flex: 1 }}
				/>
			</div>

			<div
				style={{
					width: editorWidth,
					border: "1px solid var(--color-border)",
					borderRadius: 8,
					overflow: "hidden",
					background: "#1e1e2e",
				}}
			>
				{/* Title bar */}
				<div
					style={{
						padding: "8px 16px",
						borderBottom: "1px solid rgba(255,255,255,0.08)",
						fontSize: 12,
						color: "#a0a0b0",
						display: "flex",
						alignItems: "center",
						gap: 8,
					}}
				>
					<span
						style={{
							display: "inline-block",
							width: 10,
							height: 10,
							borderRadius: "50%",
							background: "#ff5f57",
						}}
					/>
					<span
						style={{
							display: "inline-block",
							width: 10,
							height: 10,
							borderRadius: "50%",
							background: "#febc2e",
						}}
					/>
					<span
						style={{
							display: "inline-block",
							width: 10,
							height: 10,
							borderRadius: "50%",
							background: "#28c840",
						}}
					/>
					<span style={{ marginLeft: 8 }}>ProfileCard.tsx</span>
				</div>

				{/* Code area */}
				<div style={{ padding: "12px 0" }}>
					{SOURCE_LINES.map((line, i) => (
						<SourceLine
							key={i}
							text={line}
							lineNumber={i + 1}
							contentWidth={contentWidth}
						/>
					))}
				</div>
			</div>

			<div
				style={{
					fontSize: 12,
					color: "var(--color-text-muted)",
					marginTop: 8,
					display: "flex",
					gap: 16,
				}}
			>
				<span>Font: JetBrains Mono 14px</span>
				<span>Line height: {CODE_LINE_HEIGHT}px</span>
				<span>{SOURCE_LINES.length} source lines</span>
			</div>
		</div>
	);
}
