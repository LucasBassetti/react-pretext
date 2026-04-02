"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { computePreparedText, layoutNextLine } from "react-pretext";
import type { LayoutCursor, LayoutLine } from "react-pretext";

const FONT = "16px Inter, system-ui, sans-serif";
const LINE_HEIGHT = 24;
const PADDING = 16;
const SHAPE_MARGIN = 12;

const DEFAULT_TEXT =
	"Pretext enables text to flow around obstacles dynamically. Each line can have a different available width, and layoutNextLine iterates line by line, letting you vary the constraint per line. This is impossible with CSS alone because CSS has no concept of per line width constraints. Drag the shape around to see the text reflow in real time. The layout is computed entirely in JavaScript with zero DOM measurements. Switch between different obstacle shapes to see how the exclusion zone changes. A circle creates a curved exclusion, a diamond creates a pointed one, and a rectangle creates a clean block cutout. This pattern is useful for editorial layouts, magazine style designs, illustrated articles, and anywhere you need text to wrap around floating elements with pixel perfect control. Every line width is calculated independently by pretext.";

type ShapeType = "rectangle" | "circle" | "diamond";

interface Obstacle {
	x: number;
	y: number;
	size: number;
	shape: ShapeType;
}

interface FlowLine extends LayoutLine {
	x: number;
	y: number;
}

function getShapeSpan(
	lineMidY: number,
	obstacle: Obstacle,
): { left: number; right: number } | null {
	const { x, y, size, shape } = obstacle;
	const halfSize = size / 2;
	const r = halfSize + SHAPE_MARGIN;

	if (shape === "rectangle") {
		const obsTop = y - halfSize - SHAPE_MARGIN;
		const obsBottom = y + halfSize + SHAPE_MARGIN;
		if (lineMidY < obsTop || lineMidY > obsBottom) return null;
		return { left: x - halfSize - SHAPE_MARGIN, right: x + halfSize + SHAPE_MARGIN };
	}

	if (shape === "circle") {
		const dy = Math.abs(lineMidY - y);
		if (dy >= r) return null;
		const chordHalf = Math.sqrt(r * r - dy * dy);
		return { left: x - chordHalf, right: x + chordHalf };
	}

	const dy = Math.abs(lineMidY - y);
	if (dy >= r) return null;
	const fraction = 1 - dy / r;
	const halfWidth = fraction * r;
	return { left: x - halfWidth, right: x + halfWidth };
}

const MIN_GAP = 20;

function getLineGaps(
	lineY: number,
	lineHeight: number,
	obstacle: Obstacle,
	containerWidth: number,
): { leftWidth: number; rightX: number; rightWidth: number } | null {
	const lineMidY = lineY + lineHeight / 2;
	const span = getShapeSpan(lineMidY, obstacle);
	if (!span) return null;

	const clampedLeft = Math.max(0, span.left);
	const clampedRight = Math.min(containerWidth, span.right);
	if (clampedLeft >= clampedRight) return null;

	return {
		leftWidth: clampedLeft,
		rightX: clampedRight,
		rightWidth: containerWidth - clampedRight,
	};
}

function layoutWithObstacle(
	text: string,
	font: string,
	containerWidth: number,
	lineHeight: number,
	obstacle: Obstacle,
): FlowLine[] {
	const prepared = computePreparedText({ text, font });
	let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
	const lines: FlowLine[] = [];
	let y = 0;
	const maxIter = 500;

	for (let i = 0; i < maxIter; i++) {
		const gaps = getLineGaps(y, lineHeight, obstacle, containerWidth);

		if (!gaps) {
			const line = layoutNextLine(prepared, cursor, containerWidth);
			if (line === null) break;
			lines.push({ ...line, x: 0, y });
			cursor = line.end;
		} else {
			let filled = false;

			if (gaps.leftWidth >= MIN_GAP) {
				const leftLine = layoutNextLine(prepared, cursor, gaps.leftWidth);
				if (leftLine === null) break;
				lines.push({ ...leftLine, x: 0, y });
				cursor = leftLine.end;
				filled = true;
			}

			if (gaps.rightWidth >= MIN_GAP) {
				const rightLine = layoutNextLine(prepared, cursor, gaps.rightWidth);
				if (rightLine === null) {
					if (!filled) break;
				} else {
					lines.push({ ...rightLine, x: gaps.rightX, y });
					cursor = rightLine.end;
					filled = true;
				}
			}

			if (!filled) break;
		}

		y += lineHeight;
	}

	return lines;
}

function hitTestObstacle(mx: number, my: number, obstacle: Obstacle): boolean {
	const { x, y, size, shape } = obstacle;
	const halfSize = size / 2;

	if (shape === "rectangle") {
		return mx >= x - halfSize && mx <= x + halfSize && my >= y - halfSize && my <= y + halfSize;
	}

	if (shape === "circle") {
		const dx = mx - x;
		const dy = my - y;
		return dx * dx + dy * dy <= halfSize * halfSize;
	}

	const dx = Math.abs(mx - x);
	const dy = Math.abs(my - y);
	return dx / halfSize + dy / halfSize <= 1;
}

function drawObstacle(
	ctx: CanvasRenderingContext2D,
	obstacle: Obstacle,
	fillColor: string,
	strokeColor: string,
) {
	const { x, y, size, shape } = obstacle;
	const halfSize = size / 2;

	ctx.fillStyle = fillColor;
	ctx.strokeStyle = strokeColor;
	ctx.lineWidth = 1.5;

	if (shape === "rectangle") {
		ctx.beginPath();
		ctx.roundRect(x - halfSize, y - halfSize, size, size, 4);
		ctx.fill();
		ctx.stroke();
	} else if (shape === "circle") {
		ctx.beginPath();
		ctx.arc(x, y, halfSize, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	} else {
		ctx.beginPath();
		ctx.moveTo(x, y - halfSize);
		ctx.lineTo(x + halfSize, y);
		ctx.lineTo(x, y + halfSize);
		ctx.lineTo(x - halfSize, y);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	ctx.fillStyle = strokeColor;
	ctx.font = "11px Inter, system-ui, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("drag me", x, y);
	ctx.textAlign = "start";
	ctx.textBaseline = "top";
}

const SHAPES: { key: ShapeType; label: string }[] = [
	{ key: "rectangle", label: "Rectangle" },
	{ key: "circle", label: "Circle" },
	{ key: "diamond", label: "Diamond" },
];

export function TextFlowDemo() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
	const [shape, setShape] = useState<ShapeType>("circle");
	const [containerWidth, setContainerWidth] = useState(0);
	const [obstacle, setObstacle] = useState<Obstacle>({
		x: 340,
		y: 100,
		size: 100,
		shape: "circle",
	});

	// Track container width
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) setContainerWidth(entry.contentRect.width);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const handleShapeChange = useCallback((s: ShapeType) => {
		setShape(s);
		setObstacle((prev) => ({ ...prev, shape: s }));
	}, []);

	const contentWidth = containerWidth - PADDING * 2;

	const lines = useMemo(
		() =>
			contentWidth > 0
				? layoutWithObstacle(DEFAULT_TEXT, FONT, contentWidth, LINE_HEIGHT, obstacle)
				: [],
		[contentWidth, obstacle],
	);

	const canvasHeight = Math.max(
		lines.length * LINE_HEIGHT + PADDING * 2,
		obstacle.y + obstacle.size / 2 + PADDING + 20,
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || containerWidth === 0) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = containerWidth * dpr;
		canvas.height = canvasHeight * dpr;
		canvas.style.width = `${containerWidth}px`;
		canvas.style.height = `${canvasHeight}px`;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.scale(dpr, dpr);
		ctx.clearRect(0, 0, containerWidth, canvasHeight);

		// Background
		ctx.fillStyle = "#1a1a2e";
		ctx.beginPath();
		ctx.roundRect(0, 0, containerWidth, canvasHeight, 8);
		ctx.fill();

		// Obstacle
		drawObstacle(
			ctx,
			{ ...obstacle, x: obstacle.x + PADDING, y: obstacle.y + PADDING },
			"rgba(120, 90, 220, 0.25)",
			"rgba(120, 90, 220, 0.6)",
		);

		// Text
		ctx.fillStyle = "#e0e0e0";
		ctx.font = FONT;
		ctx.textBaseline = "top";
		for (const line of lines) {
			ctx.fillText(line.text, PADDING + line.x, PADDING + line.y);
		}
	}, [lines, containerWidth, canvasHeight, obstacle]);

	const getCanvasPos = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return { x: 0, y: 0 };
			return { x: e.clientX - rect.left - PADDING, y: e.clientY - rect.top - PADDING };
		},
		[],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const pos = getCanvasPos(e);
			if (hitTestObstacle(pos.x, pos.y, obstacle)) {
				dragRef.current = { offsetX: pos.x - obstacle.x, offsetY: pos.y - obstacle.y };
				e.preventDefault();
			}
		},
		[obstacle, getCanvasPos],
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if (!dragRef.current) return;
			const pos = getCanvasPos(e);
			const newX = Math.max(0, Math.min(contentWidth, pos.x - dragRef.current.offsetX));
			const newY = Math.max(0, pos.y - dragRef.current.offsetY);
			setObstacle((prev) => ({ ...prev, x: newX, y: newY }));
		},
		[getCanvasPos, contentWidth],
	);

	const handleMouseUp = useCallback(() => {
		dragRef.current = null;
	}, []);

	return (
		<div ref={containerRef}>
			<div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
				{SHAPES.map((s) => (
					<button
						key={s.key}
						type="button"
						onClick={() => handleShapeChange(s.key)}
						style={{
							padding: "5px 12px",
							borderRadius: 6,
							border: "1px solid #333",
							background: shape === s.key ? "#e8e8e8" : "#222",
							color: shape === s.key ? "#111" : "#ccc",
							cursor: "pointer",
							fontSize: 13,
							fontWeight: 500,
						}}
					>
						{s.label}
					</button>
				))}
				<span style={{ fontSize: 12, color: "#888", alignSelf: "center", marginLeft: 4 }}>
					Lines: {lines.length}
				</span>
			</div>
			<canvas
				ref={canvasRef}
				style={{ borderRadius: 8, display: "block", cursor: "grab", width: "100%" }}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
			/>
		</div>
	);
}
