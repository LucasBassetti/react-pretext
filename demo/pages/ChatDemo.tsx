import { useCallback, useDeferredValue, useRef, useState } from "react";
import { Pretext, usePretextVirtualizer } from "react-pretext";

function generateMessages(count: number): Array<{ text: string; font?: string }> {
	const samples = [
		"Hey, how's it going?",
		"Just pushed a fix for the layout bug. Can you review when you get a chance?",
		"The quick brown fox jumps over the lazy dog. This is a longer message to test multi-line wrapping in the virtualizer. It should break across multiple lines depending on the container width.",
		"Sure, looking at it now.",
		"Looks good! One small thing — the cache key should include lineHeight too.",
		"Oh good catch, fixing that.",
		"Done. Also added tests for the edge cases we discussed yesterday.",
		"Perfect. Ship it.",
		"lgtm",
		"By the way, did you see the new pretext release? Cheng Lou added support for pre-wrap whitespace mode. We should add that to react-pretext too.",
		"Yeah I saw that! Would be a nice addition. Want to pair on it tomorrow?",
		"Sounds good. Let's do it after standup.",
		"Also, the virtualization is looking really smooth now. Even with 10k messages there's zero layout shift.",
		"That's the whole point of deterministic layout — heights are known before render.",
	];
	return Array.from({ length: count }, (_, i) => ({
		text: `[${i}] ${samples[i % samples.length]}`,
	}));
}

const MESSAGES = generateMessages(10_000);
const VIEWPORT_HEIGHT = 500;
const FONT = "16px Inter, system-ui, sans-serif";
const LINE_HEIGHT = 24;

function MessageItem({ text, width }: { text: string; width: number }) {
	return (
		<Pretext.Root text={text} width={width} font={FONT} lineHeight={LINE_HEIGHT}>
			<Pretext.Lines>
				{(line) => (
					<div key={line.key} style={{ whiteSpace: "pre" }}>
						{line.text}
					</div>
				)}
			</Pretext.Lines>
		</Pretext.Root>
	);
}

export function ChatDemo() {
	const [scrollTop, setScrollTop] = useState(0);
	const [width, setWidth] = useState(500);
	const scrollRef = useRef<HTMLDivElement>(null);
	const rafRef = useRef<number>(0);

	// Slider updates immediately, virtualizer recomputation is deferred
	const deferredWidth = useDeferredValue(width);
	const contentWidth = Math.max(0, deferredWidth - 48);

	const result = usePretextVirtualizer({
		items: MESSAGES,
		width: contentWidth,
		lineHeight: LINE_HEIGHT,
		scrollTop,
		viewportHeight: VIEWPORT_HEIGHT,
		overscan: 5,
		font: FONT,
	});

	const handleScroll = useCallback(() => {
		if (rafRef.current) return;
		rafRef.current = requestAnimationFrame(() => {
			if (scrollRef.current) {
				setScrollTop(scrollRef.current.scrollTop);
			}
			rafRef.current = 0;
		});
	}, []);

	return (
		<div>
			<h2 style={{ margin: "0 0 12px" }}>Chat UI — {MESSAGES.length.toLocaleString()} messages</h2>
			<div style={{ marginBottom: 16 }}>
				<label style={{ fontSize: 14 }}>
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
				<div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
					Rendering {result.virtualItems.length} of {MESSAGES.length.toLocaleString()} items
					{" | "}Total height: {result.totalHeight.toLocaleString()}px
					{" | "}Visible range: [{result.startIndex}..{result.endIndex}]
					{width !== deferredWidth && " | computing..."}
				</div>
			</div>
			<div
				ref={scrollRef}
				onScroll={handleScroll}
				style={{
					width,
					height: VIEWPORT_HEIGHT,
					overflow: "auto",
					border: "1px solid var(--color-border)",
					borderRadius: 4,
					background: "var(--color-surface)",
				}}
			>
				<div style={{ height: result.totalHeight, position: "relative" }}>
					{result.virtualItems.map((item) => (
						<div
							key={item.key}
							style={{
								position: "absolute",
								top: item.offsetTop,
								left: 0,
								right: 0,
								padding: "8px 16px",
								borderBottom: "1px solid var(--color-border-light)",
							}}
						>
							<MessageItem text={item.data.text} width={contentWidth} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
