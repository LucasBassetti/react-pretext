import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pretext } from "../components/index.js";
import { DomRenderer } from "../renderers/dom.js";
import { SvgRenderer } from "../renderers/svg.js";

const FONT = "16px sans-serif";
const LINE_HEIGHT = 20;

describe("Provider -> Root -> Lines -> render prop pipeline", () => {
	it("renders lines through the full component pipeline", () => {
		render(
			<Pretext.Provider font={FONT} lineHeight={LINE_HEIGHT}>
				<Pretext.Root text="Hello world this is a test" width={200}>
					<Pretext.Lines>
						{(line) => (
							<div key={line.key} data-testid="pipeline-line">
								{line.text}
							</div>
						)}
					</Pretext.Lines>
				</Pretext.Root>
			</Pretext.Provider>,
		);

		const lines = screen.getAllByTestId("pipeline-line");
		expect(lines.length).toBeGreaterThan(0);

		const allText = lines.map((el) => el.textContent).join(" ");
		expect(allText).toContain("Hello");
		expect(allText).toContain("test");
	});
});

describe("Provider defaults override", () => {
	it("uses font and lineHeight from Provider when Root does not specify them", () => {
		render(
			<Pretext.Provider font={FONT} lineHeight={LINE_HEIGHT}>
				<Pretext.Root text="Provider defaults" width={200}>
					{(layout) => (
						<div data-testid="provider-layout">
							{layout.lineCount}-{layout.height}
						</div>
					)}
				</Pretext.Root>
			</Pretext.Provider>,
		);

		const info = screen.getByTestId("provider-layout");
		// "Provider defaults" = 17 chars * 8px = 136px, fits in 200px -> 1 line
		expect(info.textContent).toBe("1-20");
	});
});

describe("Root with render prop", () => {
	it("passes layout object with height, lineCount, and lines to render function", () => {
		render(
			<Pretext.Root text="Hello world" width={200} font={FONT} lineHeight={LINE_HEIGHT}>
				{(layout) => (
					<div>
						<span data-testid="line-count">{layout.lineCount}</span>
						<span data-testid="height">{layout.height}</span>
						<span data-testid="lines-length">{layout.lines.length}</span>
					</div>
				)}
			</Pretext.Root>,
		);

		expect(screen.getByTestId("line-count").textContent).toBe("1");
		expect(screen.getByTestId("height").textContent).toBe("20");
		expect(screen.getByTestId("lines-length").textContent).toBe("1");
	});
});

describe("Nested Roots", () => {
	it("renders two Root components with different text in the same Provider", () => {
		render(
			<Pretext.Provider font={FONT} lineHeight={LINE_HEIGHT}>
				<Pretext.Root text="First block" width={200}>
					<Pretext.Lines>
						{(line) => (
							<div key={line.key} data-testid="first-line">
								{line.text}
							</div>
						)}
					</Pretext.Lines>
				</Pretext.Root>
				<Pretext.Root text="Second block" width={200}>
					<Pretext.Lines>
						{(line) => (
							<div key={line.key} data-testid="second-line">
								{line.text}
							</div>
						)}
					</Pretext.Lines>
				</Pretext.Root>
			</Pretext.Provider>,
		);

		const firstLines = screen.getAllByTestId("first-line");
		const secondLines = screen.getAllByTestId("second-line");

		expect(firstLines.length).toBeGreaterThan(0);
		expect(secondLines.length).toBeGreaterThan(0);

		expect(firstLines.map((el) => el.textContent).join(" ")).toContain("First");
		expect(secondLines.map((el) => el.textContent).join(" ")).toContain("Second");
	});
});

describe("Context debug mode", () => {
	it("renders debug overlay with data-pretext-line attribute when debug is true", () => {
		const { container } = render(
			<Pretext.Provider font={FONT} lineHeight={LINE_HEIGHT} debug>
				<Pretext.Root text="Debug line" width={200}>
					<Pretext.Lines>{(line) => <Pretext.Line key={line.key} line={line} />}</Pretext.Lines>
				</Pretext.Root>
			</Pretext.Provider>,
		);

		const debugElements = container.querySelectorAll("[data-pretext-line]");
		expect(debugElements.length).toBeGreaterThan(0);

		// The first line should have index 0
		expect(debugElements[0].getAttribute("data-pretext-line")).toBe("0");
	});
});

describe("DomRenderer integration", () => {
	it("renders DOM structure via Root render prop and DomRenderer", () => {
		const { container } = render(
			<Pretext.Provider font={FONT} lineHeight={LINE_HEIGHT}>
				<Pretext.Root text="DOM renderer test text here" width={200}>
					{(layout) => <DomRenderer layout={layout} className="dom-output" />}
				</Pretext.Root>
			</Pretext.Provider>,
		);

		const wrapper = container.querySelector(".dom-output");
		expect(wrapper).not.toBeNull();
		expect(wrapper?.style.position).toBe("relative");

		// Each line is an absolutely positioned div
		const lineDivs = wrapper?.querySelectorAll("div") ?? [];
		expect(lineDivs.length).toBeGreaterThan(0);

		for (const div of lineDivs) {
			expect(div.style.position).toBe("absolute");
			expect(div.style.whiteSpace).toBe("pre");
		}
	});
});

describe("SvgRenderer integration", () => {
	it("renders SVG structure via Root render prop and SvgRenderer", () => {
		const { container } = render(
			<Pretext.Provider font={FONT} lineHeight={LINE_HEIGHT}>
				<Pretext.Root text="SVG renderer test" width={200}>
					{(layout) => <SvgRenderer layout={layout} title="Test SVG" />}
				</Pretext.Root>
			</Pretext.Provider>,
		);

		const svg = container.querySelector("svg");
		expect(svg).not.toBeNull();
		expect(svg?.getAttribute("role")).toBe("img");
		expect(svg?.getAttribute("aria-label")).toBe("Test SVG");

		const title = svg?.querySelector("title");
		expect(title?.textContent).toBe("Test SVG");

		const textElements = svg?.querySelectorAll("text") ?? [];
		expect(textElements.length).toBeGreaterThan(0);

		// Each text element should have content
		for (const el of textElements) {
			expect(el.textContent?.length).toBeGreaterThan(0);
		}
	});
});

describe("Width changes", () => {
	it("produces more lines when width shrinks", () => {
		// "Hello world this is a test" = 26 chars * 8px = 208px
		// At width 400, fits on 1 line
		const { rerender } = render(
			<Pretext.Root
				text="Hello world this is a test"
				width={400}
				font={FONT}
				lineHeight={LINE_HEIGHT}
			>
				{(layout) => <div data-testid="width-test">{layout.lineCount}</div>}
			</Pretext.Root>,
		);

		expect(screen.getByTestId("width-test").textContent).toBe("1");

		// At width 50, each word must go on its own line (6 chars * 8px = 48px max per word)
		rerender(
			<Pretext.Root
				text="Hello world this is a test"
				width={50}
				font={FONT}
				lineHeight={LINE_HEIGHT}
			>
				{(layout) => <div data-testid="width-test">{layout.lineCount}</div>}
			</Pretext.Root>,
		);

		const lineCount = Number(screen.getByTestId("width-test").textContent);
		expect(lineCount).toBeGreaterThan(1);
	});
});
