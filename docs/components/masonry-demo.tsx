"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Pretext, computeHeight } from "react-pretext";
import showerThoughts from "./shower-thoughts.json";

const FONT = '15px "Helvetica Neue", Helvetica, Arial, sans-serif';
const LINE_HEIGHT = 22;
const CARD_PADDING = 16;
const GAP = 12;
const MAX_COL_WIDTH = 400;
const SINGLE_COL_MAX_WIDTH = 520;
const VIEWPORT_HEIGHT = 500;
const OVERSCAN = 200;

interface PositionedCard {
	index: number;
	x: number;
	y: number;
	width: number;
	height: number;
}

interface MasonryLayout {
	colWidth: number;
	totalHeight: number;
	cards: PositionedCard[];
}

function computeMasonryLayout(texts: string[], containerWidth: number): MasonryLayout {
	if (containerWidth <= 0) {
		return { colWidth: 0, totalHeight: 0, cards: [] };
	}

	let colCount: number;
	let colWidth: number;
	if (containerWidth <= SINGLE_COL_MAX_WIDTH) {
		colCount = 1;
		colWidth = Math.min(MAX_COL_WIDTH, containerWidth - GAP * 2);
	} else {
		const minColWidth = 100 + containerWidth * 0.1;
		colCount = Math.max(2, Math.floor((containerWidth + GAP) / (minColWidth + GAP)));
		colWidth = Math.min(MAX_COL_WIDTH, (containerWidth - (colCount + 1) * GAP) / colCount);
	}

	const textWidth = colWidth - CARD_PADDING * 2;
	const contentWidth = colCount * colWidth + (colCount - 1) * GAP;
	const offsetLeft = (containerWidth - contentWidth) / 2;

	const colHeights = new Float64Array(colCount);
	for (let c = 0; c < colCount; c++) colHeights[c] = GAP;

	const cards: PositionedCard[] = [];
	for (let i = 0; i < texts.length; i++) {
		let shortest = 0;
		for (let c = 1; c < colCount; c++) {
			if (colHeights[c] < colHeights[shortest]) shortest = c;
		}

		const textHeight = computeHeight({
			text: texts[i],
			font: FONT,
			maxWidth: textWidth,
			lineHeight: LINE_HEIGHT,
		});
		const cardHeight = textHeight + CARD_PADDING * 2;

		cards.push({
			index: i,
			x: offsetLeft + shortest * (colWidth + GAP),
			y: colHeights[shortest],
			width: colWidth,
			height: cardHeight,
		});

		colHeights[shortest] += cardHeight + GAP;
	}

	let totalHeight = 0;
	for (let c = 0; c < colCount; c++) {
		if (colHeights[c] > totalHeight) totalHeight = colHeights[c];
	}

	return { colWidth, totalHeight, cards };
}

function MasonryCard({ text, width }: { text: string; width: number }) {
	const textWidth = width - CARD_PADDING * 2;
	return (
		<Pretext.Root text={text} width={textWidth} font={FONT} lineHeight={LINE_HEIGHT}>
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

export function MasonryDemo() {
	const scrollRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const [scrollTop, setScrollTop] = useState(0);
	const [containerWidth, setContainerWidth] = useState(0);

	useEffect(() => {
		const node = innerRef.current;
		if (!node) return;
		setContainerWidth(node.clientWidth);
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) setContainerWidth(entry.contentRect.width);
		});
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const deferredWidth = useDeferredValue(containerWidth);

	const layoutResult = useMemo(
		() => computeMasonryLayout(showerThoughts, deferredWidth),
		[deferredWidth],
	);

	const visibleCards = useMemo(() => {
		const viewTop = scrollTop - OVERSCAN;
		const viewBottom = scrollTop + VIEWPORT_HEIGHT + OVERSCAN;
		return layoutResult.cards.filter(
			(card) => card.y + card.height >= viewTop && card.y <= viewBottom,
		);
	}, [layoutResult.cards, scrollTop]);

	const handleScroll = useCallback(() => {
		if (scrollRef.current) {
			setScrollTop(scrollRef.current.scrollTop);
		}
	}, []);

	return (
		<div>
			<div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
				Rendering {visibleCards.length} of {showerThoughts.length.toLocaleString()} cards
				{" | "}Total height: {Math.round(layoutResult.totalHeight).toLocaleString()}px
				{" | "}Column width: {Math.round(layoutResult.colWidth)}px
				{containerWidth !== deferredWidth && " | computing..."}
			</div>
			<div
				ref={scrollRef}
				onScroll={handleScroll}
				style={{
					height: VIEWPORT_HEIGHT,
					overflow: "auto",
					background: "#1a1a2e",
					borderRadius: 8,
				}}
			>
				<div
					ref={innerRef}
					style={{
						position: "relative",
						height: layoutResult.totalHeight,
						fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
						fontSize: 15,
						lineHeight: "22px",
						color: "#e0e0e0",
					}}
				>
					{visibleCards.map((card) => (
						<div
							key={card.index}
							style={{
								position: "absolute",
								left: card.x,
								top: card.y,
								width: card.width,
								height: card.height,
								background: "#252540",
								borderRadius: 8,
								padding: CARD_PADDING,
								border: "1px solid #333355",
								boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
								overflow: "hidden",
								boxSizing: "border-box",
							}}
						>
							<MasonryCard text={showerThoughts[card.index]} width={card.width} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
