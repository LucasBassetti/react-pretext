import { useState } from "react";
import { Pretext } from "react-pretext";
import { BasicDemo } from "./pages/Basic.tsx";
import { CanvasDemo } from "./pages/CanvasDemo.tsx";
import { ChatDemo } from "./pages/ChatDemo.tsx";
import { DebugDemo } from "./pages/DebugDemo.tsx";

const PAGES = {
	basic: { label: "Basic", component: BasicDemo },
	chat: { label: "Chat UI", component: ChatDemo },
	canvas: { label: "Canvas", component: CanvasDemo },
	debug: { label: "Debug Mode", component: DebugDemo },
} as const;

type PageKey = keyof typeof PAGES;

export function App() {
	const [page, setPage] = useState<PageKey>("basic");
	const Page = PAGES[page].component;

	return (
		<Pretext.Provider font="16px Inter, system-ui, sans-serif" lineHeight={24}>
			<div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 24, maxWidth: 900 }}>
				<h1 style={{ margin: "0 0 8px" }}>react-pretext</h1>
				<p style={{ margin: "0 0 16px", color: "#666" }}>
					Deterministic text layout without DOM measurement
				</p>
				<nav style={{ display: "flex", gap: 8, marginBottom: 24 }}>
					{(Object.entries(PAGES) as [PageKey, (typeof PAGES)[PageKey]][]).map(
						([key, { label }]) => (
							<button
								type="button"
								key={key}
								onClick={() => setPage(key)}
								style={{
									padding: "8px 16px",
									border: "1px solid #ccc",
									borderRadius: 6,
									background: page === key ? "#111" : "#fff",
									color: page === key ? "#fff" : "#111",
									cursor: "pointer",
									fontSize: 14,
								}}
							>
								{label}
							</button>
						),
					)}
				</nav>
				<Page />
			</div>
		</Pretext.Provider>
	);
}
