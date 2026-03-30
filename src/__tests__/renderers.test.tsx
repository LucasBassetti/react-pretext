import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PretextLayoutResult } from "../core/types.js";
import { renderToCanvas } from "../renderers/canvas.js";
import { DomRenderer } from "../renderers/dom.js";
import { SvgRenderer } from "../renderers/svg.js";

const layout: PretextLayoutResult = {
	height: 40,
	lineCount: 2,
	lines: [
		{ key: "0", text: "Hello", width: 40, y: 0, index: 0 },
		{ key: "1", text: "world", width: 40, y: 20, index: 1 },
	],
	font: "16px sans-serif",
	lineHeight: 20,
};

describe("DomRenderer", () => {
	it("renders a div with position: relative and correct height", () => {
		const { container } = render(<DomRenderer layout={layout} />);
		const root = container.firstElementChild as HTMLElement;
		expect(root.tagName).toBe("DIV");
		expect(root.style.position).toBe("relative");
		expect(root.style.height).toBe("40px");
	});

	it("renders one child div per line with correct positioning", () => {
		const { container } = render(<DomRenderer layout={layout} />);
		const root = container.firstElementChild as HTMLElement;
		const children = Array.from(root.children) as HTMLElement[];
		expect(children).toHaveLength(2);

		expect(children[0]?.style.position).toBe("absolute");
		expect(children[0]?.style.top).toBe("0px");
		expect(children[0]?.style.whiteSpace).toBe("pre");

		expect(children[1]?.style.position).toBe("absolute");
		expect(children[1]?.style.top).toBe("20px");
		expect(children[1]?.style.whiteSpace).toBe("pre");
	});

	it("applies font and lineHeight from layout", () => {
		const { container } = render(<DomRenderer layout={layout} />);
		const root = container.firstElementChild as HTMLElement;
		expect(root.style.font).toContain("16px");
		expect(root.style.font).toContain("sans-serif");
		expect(root.style.lineHeight).toBe("20px");
	});

	it("forwards className and style props", () => {
		const { container } = render(
			<DomRenderer layout={layout} className="my-class" style={{ color: "red" }} />,
		);
		const root = container.firstElementChild as HTMLElement;
		expect(root.className).toBe("my-class");
		expect(root.style.color).toBe("red");
		// Merged styles should still include position: relative
		expect(root.style.position).toBe("relative");
	});

	it("lines contain correct text content", () => {
		const { container } = render(<DomRenderer layout={layout} />);
		const root = container.firstElementChild as HTMLElement;
		const children = Array.from(root.children) as HTMLElement[];
		expect(children[0]?.textContent).toBe("Hello");
		expect(children[1]?.textContent).toBe("world");
	});
});

describe("SvgRenderer", () => {
	it("renders an svg element with role='img' and aria-label", () => {
		render(<SvgRenderer layout={layout} />);
		const svg = screen.getByRole("img");
		expect(svg.tagName).toBe("svg");
		expect(svg.getAttribute("aria-label")).toBe("Text layout");
	});

	it("renders one text element per line", () => {
		const { container } = render(<SvgRenderer layout={layout} />);
		const textElements = container.querySelectorAll("text");
		expect(textElements).toHaveLength(2);
		expect(textElements[0]?.textContent).toBe("Hello");
		expect(textElements[1]?.textContent).toBe("world");
	});

	it("uses layout.font by default", () => {
		const { container } = render(<SvgRenderer layout={layout} />);
		const textEl = container.querySelector("text") as HTMLElement;
		expect(textEl.style.font).toBe("16px sans-serif");
	});

	it("font prop overrides layout.font", () => {
		const { container } = render(
			<SvgRenderer layout={layout} font="16px monospace" className="svg-class" />,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("class")).toBe("svg-class");

		const textEl = container.querySelector("text") as HTMLElement;
		expect(textEl.style.font).toBe("16px monospace");
	});

	it("has default title of 'Text layout'", () => {
		const { container } = render(<SvgRenderer layout={layout} />);
		const titleEl = container.querySelector("title");
		expect(titleEl).not.toBeNull();
		expect(titleEl?.textContent).toBe("Text layout");
	});

	it("supports custom title", () => {
		render(<SvgRenderer layout={layout} title="Custom title" />);
		const svg = screen.getByRole("img");
		expect(svg.getAttribute("aria-label")).toBe("Custom title");
	});
});

describe("renderToCanvas", () => {
	function createMockCtx() {
		let fontValue = "";
		let fillStyleValue = "";
		let textBaselineValue = "";
		return {
			fillText: vi.fn(),
			get font() {
				return fontValue;
			},
			set font(v: string) {
				fontValue = v;
			},
			get fillStyle() {
				return fillStyleValue;
			},
			set fillStyle(v: string) {
				fillStyleValue = v;
			},
			get textBaseline() {
				return textBaselineValue;
			},
			set textBaseline(v: string) {
				textBaselineValue = v;
			},
		} as unknown as CanvasRenderingContext2D;
	}

	it("calls ctx.fillText for each line with correct coordinates", () => {
		const ctx = createMockCtx();
		renderToCanvas(ctx, layout);

		expect(ctx.fillText).toHaveBeenCalledTimes(2);
		expect(ctx.fillText).toHaveBeenCalledWith("Hello", 0, 0);
		expect(ctx.fillText).toHaveBeenCalledWith("world", 0, 20);
	});

	it("sets ctx.textBaseline to 'top'", () => {
		const ctx = createMockCtx();
		renderToCanvas(ctx, layout);
		expect(ctx.textBaseline).toBe("top");
	});

	it("uses layout.font by default", () => {
		const ctx = createMockCtx();
		renderToCanvas(ctx, layout);
		expect(ctx.font).toBe("16px sans-serif");
	});

	it("font option overrides layout.font", () => {
		const ctx = createMockCtx();
		renderToCanvas(ctx, layout, { font: "20px serif", color: "blue" });
		expect(ctx.font).toBe("20px serif");
		expect(ctx.fillStyle).toBe("blue");
	});

	it("applies x/y offsets", () => {
		const ctx = createMockCtx();
		renderToCanvas(ctx, layout, { x: 10, y: 5 });

		expect(ctx.fillText).toHaveBeenCalledWith("Hello", 10, 5);
		expect(ctx.fillText).toHaveBeenCalledWith("world", 10, 25);
	});
});
