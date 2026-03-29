import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pretext } from "../components/index.js";

describe("Pretext.Root", () => {
	it("renders children via LayoutContext (child component pattern)", () => {
		render(
			<Pretext.Root text="Hello world" width={200} font="16px sans-serif" lineHeight={20}>
				<Pretext.Lines>
					{(line) => (
						<div key={line.key} data-testid="line">
							{line.text}
						</div>
					)}
				</Pretext.Lines>
			</Pretext.Root>,
		);

		const lines = screen.getAllByTestId("line");
		expect(lines.length).toBeGreaterThan(0);
		// All line text combined should reconstruct the original (minus whitespace differences)
		const allText = lines.map((el) => el.textContent).join(" ");
		expect(allText).toContain("Hello");
		expect(allText).toContain("world");
	});

	it("renders via render prop pattern", () => {
		render(
			<Pretext.Root text="Hello world" width={200} font="16px sans-serif" lineHeight={20}>
				{(layout) => (
					<div data-testid="layout-info">
						{layout.lineCount} lines, {layout.height}px
					</div>
				)}
			</Pretext.Root>,
		);

		const info = screen.getByTestId("layout-info");
		expect(info.textContent).toContain("lines");
		expect(info.textContent).toContain("px");
	});
});

describe("Pretext.Provider", () => {
	it("provides default font and lineHeight", () => {
		render(
			<Pretext.Provider font="16px sans-serif" lineHeight={20}>
				<Pretext.Root text="Hello world" width={200}>
					<Pretext.Lines>
						{(line) => (
							<div key={line.key} data-testid="line">
								{line.text}
							</div>
						)}
					</Pretext.Lines>
				</Pretext.Root>
			</Pretext.Provider>,
		);

		const lines = screen.getAllByTestId("line");
		expect(lines.length).toBeGreaterThan(0);
	});
});

describe("Pretext.Lines", () => {
	it("throws when used outside Root", () => {
		// Suppress React's error boundary console noise for this intentional throw
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => {
			render(<Pretext.Lines>{(line) => <div key={line.key}>{line.text}</div>}</Pretext.Lines>);
		}).toThrow("useLayoutResult must be used within a <Pretext.Root> component");
		spy.mockRestore();
	});
});
