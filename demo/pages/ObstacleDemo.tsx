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

	// Diamond
	const dy = Math.abs(lineMidY - y);
	if (dy >= r) return null;
	const fraction = 1 - dy / r;
	const halfWidth = fraction * r;
	return { left: x - halfWidth, right: x + halfWidth };
}

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

const MIN_GAP = 20;

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
			// No obstacle on this line — full width
			const line = layoutNextLine(prepared, cursor, containerWidth);
			if (line === null) break;
			lines.push({ ...line, x: 0, y });
			cursor = line.end;
		} else {
			// Obstacle intersects — fill left gap, then right gap
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
		return (
			mx >= x - halfSize &&
			mx <= x + halfSize &&
			my >= y - halfSize &&
			my <= y + halfSize
		);
	}

	if (shape === "circle") {
		const dx = mx - x;
		const dy = my - y;
		return dx * dx + dy * dy <= halfSize * halfSize;
	}

	// Diamond
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

function getThemeColors() {
	const style = getComputedStyle(document.documentElement);
	return {
		bg: style.getPropertyValue("--color-surface").trim() || "#222222",
		border: style.getPropertyValue("--color-border").trim() || "#2a2a2a",
		text: style.getPropertyValue("--color-text").trim() || "#e8e8e8",
	};
}

function setupCanvas(
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
): CanvasRenderingContext2D | null {
	const dpr = window.devicePixelRatio || 1;
	canvas.width = width * dpr;
	canvas.height = height * dpr;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;

	const ctx = canvas.getContext("2d");
	if (!ctx) return null;

	ctx.scale(dpr, dpr);
	ctx.clearRect(0, 0, width, height);
	return ctx;
}

function drawCanvasBg(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	bgColor: string,
	borderColor: string,
) {
	ctx.fillStyle = bgColor;
	ctx.beginPath();
	ctx.roundRect(0, 0, width, height, 8);
	ctx.fill();

	ctx.strokeStyle = borderColor;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.roundRect(0, 0, width, height, 8);
	ctx.stroke();
}

// Text flowing around draggable obstacle
function ObstacleCanvas({
	text,
	obstacle,
	onObstacleMove,
	width,
	onLineCount,
}: {
	text: string;
	obstacle: Obstacle;
	onObstacleMove: (x: number, y: number) => void;
	width: number;
	onLineCount: (n: number) => void;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
	const contentWidth = width - PADDING * 2;

	const lines = useMemo(
		() => layoutWithObstacle(text, FONT, contentWidth, LINE_HEIGHT, obstacle),
		[text, contentWidth, obstacle],
	);

	useEffect(() => {
		onLineCount(lines.length);
	}, [lines, onLineCount]);

	const canvasHeight = Math.max(
		lines.length * LINE_HEIGHT + PADDING * 2,
		obstacle.y + obstacle.size / 2 + PADDING + 20,
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = setupCanvas(canvas, width, canvasHeight);
		if (!ctx) return;

		const colors = getThemeColors();
		drawCanvasBg(ctx, width, canvasHeight, colors.bg, colors.border);

		drawObstacle(
			ctx,
			{ ...obstacle, x: obstacle.x + PADDING, y: obstacle.y + PADDING },
			"rgba(120, 90, 220, 0.25)",
			"rgba(120, 90, 220, 0.6)",
		);

		ctx.fillStyle = colors.text;
		ctx.font = FONT;
		ctx.textBaseline = "top";
		for (const line of lines) {
			ctx.fillText(line.text, PADDING + line.x, PADDING + line.y);
		}
	}, [lines, width, canvasHeight, obstacle]);

	const getCanvasPos = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return { x: 0, y: 0 };
			return {
				x: e.clientX - rect.left - PADDING,
				y: e.clientY - rect.top - PADDING,
			};
		},
		[],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const pos = getCanvasPos(e);
			if (hitTestObstacle(pos.x, pos.y, obstacle)) {
				dragRef.current = {
					offsetX: pos.x - obstacle.x,
					offsetY: pos.y - obstacle.y,
				};
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
			onObstacleMove(newX, newY);
		},
		[getCanvasPos, onObstacleMove, contentWidth],
	);

	const handleMouseUp = useCallback(() => {
		dragRef.current = null;
	}, []);

	return (
		<canvas
			ref={canvasRef}
			style={{ borderRadius: 8, display: "block", cursor: "grab" }}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
		/>
	);
}

const SHAPES: { key: ShapeType; label: string }[] = [
	{ key: "rectangle", label: "Rectangle" },
	{ key: "circle", label: "Circle" },
	{ key: "diamond", label: "Diamond" },
];

export function ObstacleDemo() {
	const [shape, setShape] = useState<ShapeType>("circle");
	const [width, setWidth] = useState(600);
	const [lineCount, setLineCount] = useState(0);
	const [obstacle, setObstacle] = useState<Obstacle>({
		x: 340,
		y: 120,
		size: 100,
		shape: "circle",
	});

	const handleShapeChange = useCallback((s: ShapeType) => {
		setShape(s);
		setObstacle((prev) => ({ ...prev, shape: s }));
	}, []);

	const handleObstacleMove = useCallback((x: number, y: number) => {
		setObstacle((prev) => ({ ...prev, x, y }));
	}, []);

	const handleLineCount = useCallback((n: number) => {
		setLineCount(n);
	}, []);

	return (
		<div>
			<div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 8px" }}>
				<h2 style={{ margin: 0 }}>Text Flow Around Obstacles</h2>
				<code
					style={{
						fontSize: 12,
						padding: "2px 8px",
						borderRadius: 4,
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
						color: "var(--color-text-muted)",
					}}
				>
					layoutNextLine
				</code>
			</div>
			<p
				style={{
					fontSize: 14,
					color: "var(--color-text-secondary)",
					margin: "0 0 16px",
					lineHeight: 1.5,
				}}
			>
				Each line gets a different available width based on obstacle position and shape.
				Drag the shape anywhere on the canvas. Switch shapes to see different exclusion zones.
			</p>

			<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
				{SHAPES.map((s) => (
					<button
						key={s.key}
						type="button"
						onClick={() => handleShapeChange(s.key)}
						style={{
							padding: "6px 14px",
							borderRadius: 6,
							border: "1px solid var(--color-border)",
							background: shape === s.key ? "var(--color-accent)" : "var(--color-surface)",
							color: shape === s.key ? "var(--color-accent-text)" : "var(--color-text)",
							cursor: "pointer",
							fontSize: 13,
							fontWeight: 500,
							transition: "background 0.15s, color 0.15s",
						}}
					>
						{s.label}
					</button>
				))}
				<span style={{ fontSize: 12, color: "var(--color-text-muted)", marginLeft: 8 }}>
					Lines: {lineCount}
				</span>
				<span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
					Layout: {width}px
				</span>
			</div>

			<div style={{ marginBottom: 16 }}>
				<label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
					Width: {width}px
					<input
						type="range"
						min={300}
						max={900}
						value={width}
						onChange={(e) => setWidth(Number(e.target.value))}
						style={{ display: "block", width: "100%" }}
					/>
				</label>
			</div>

			<ObstacleCanvas
				text={DEFAULT_TEXT}
				obstacle={obstacle}
				onObstacleMove={handleObstacleMove}
				width={width}
				onLineCount={handleLineCount}
			/>
		</div>
	);
}
