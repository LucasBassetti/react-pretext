/**
 * Deterministic mock for @chenglou/pretext.
 * Uses a fixed character width (8px) for predictable test output.
 */

const CHAR_WIDTH = 8;

export interface MockPreparedTextWithSegments {
	segments: string[];
	widths: number[];
	text: string;
	font: string;
}

export interface MockLayoutLine {
	text: string;
	width: number;
	start: { segmentIndex: number; graphemeIndex: number };
	end: { segmentIndex: number; graphemeIndex: number };
}

export interface MockLayoutLinesResult {
	lineCount: number;
	height: number;
	lines: MockLayoutLine[];
}

export function prepareWithSegments(text: string, font: string): MockPreparedTextWithSegments {
	const words = text.split(/(\s+)/);
	return {
		segments: words,
		widths: words.map((w) => w.length * CHAR_WIDTH),
		text,
		font,
	};
}

export function layoutWithLines(
	prepared: MockPreparedTextWithSegments,
	maxWidth: number,
	lineHeight: number,
): MockLayoutLinesResult {
	const text = prepared.text;
	if (text.length === 0) {
		return { lineCount: 0, height: 0, lines: [] };
	}

	const lines: MockLayoutLine[] = [];
	const words = text.split(" ");
	let currentLine = "";
	let segIndex = 0;

	for (const word of words) {
		const candidate = currentLine.length === 0 ? word : `${currentLine} ${word}`;
		if (candidate.length * CHAR_WIDTH > maxWidth && currentLine.length > 0) {
			lines.push({
				text: currentLine,
				width: currentLine.length * CHAR_WIDTH,
				start: { segmentIndex: segIndex, graphemeIndex: 0 },
				end: { segmentIndex: segIndex + 1, graphemeIndex: 0 },
			});
			segIndex++;
			currentLine = word;
		} else {
			currentLine = candidate;
		}
	}

	if (currentLine.length > 0) {
		lines.push({
			text: currentLine,
			width: currentLine.length * CHAR_WIDTH,
			start: { segmentIndex: segIndex, graphemeIndex: 0 },
			end: { segmentIndex: segIndex + 1, graphemeIndex: 0 },
		});
	}

	return {
		lineCount: lines.length,
		height: lines.length * lineHeight,
		lines,
	};
}

export function layout(
	prepared: MockPreparedTextWithSegments,
	maxWidth: number,
	lineHeight: number,
): { lineCount: number; height: number } {
	const result = layoutWithLines(prepared, maxWidth, lineHeight);
	return { lineCount: result.lineCount, height: result.height };
}

export function prepare(text: string, font: string): MockPreparedTextWithSegments {
	return prepareWithSegments(text, font);
}

export function layoutNextLine(
	prepared: MockPreparedTextWithSegments,
	start: { segmentIndex: number; graphemeIndex: number },
	maxWidth: number,
): MockLayoutLine | null {
	const text = prepared.text;
	if (text.length === 0) return null;

	// Build all lines at this maxWidth, then return the one matching `start`
	const allLines = layoutWithLines(prepared, maxWidth, 1).lines;
	const lineIndex = start.segmentIndex;
	if (lineIndex >= allLines.length) return null;
	return allLines[lineIndex];
}

export function walkLineRanges(
	prepared: MockPreparedTextWithSegments,
	maxWidth: number,
	onLine: (line: {
		width: number;
		start: { segmentIndex: number; graphemeIndex: number };
		end: { segmentIndex: number; graphemeIndex: number };
	}) => void,
): number {
	const result = layoutWithLines(prepared, maxWidth, 1);
	for (const line of result.lines) {
		onLine({ width: line.width, start: line.start, end: line.end });
	}
	return result.lineCount;
}

export function profilePrepare(
	_text: string,
	_font: string,
): {
	analysisMs: number;
	measureMs: number;
	totalMs: number;
	analysisSegments: number;
	preparedSegments: number;
	breakableSegments: number;
} {
	return {
		analysisMs: 0.1,
		measureMs: 0.2,
		totalMs: 0.3,
		analysisSegments: 1,
		preparedSegments: 1,
		breakableSegments: 0,
	};
}

export function clearCache(): void {}

export function setLocale(_locale?: string): void {}
