# react-pretext

React adapter for [`@chenglou/pretext`](https://github.com/chenglou/pretext) — deterministic text layout without DOM measurement.

Pretext computes line breaks and text height using pure arithmetic on cached character widths (~0.0002ms per layout). `react-pretext` wraps it with React hooks, headless components, and optional renderers.

## Features

- **No DOM measurement** — layout is computed via canvas `measureText`, then pure arithmetic. No `getBoundingClientRect`, no layout thrashing.
- **Deterministic** — same input always produces the same output. Heights are known before render.
- **Virtualization** — built-in virtualizer that precomputes item heights for 10k+ item lists with zero layout shift.
- **Headless** — compound components with render props. No styling opinions. Bring your own UI.
- **Multiple renderers** — DOM, SVG, and Canvas renderers included.
- **Font-aware** — `useFontReady` hook tracks font loading and triggers re-layout.
- **SSR-safe** — approximate layout on the server, pixel-perfect on the client.
- **TypeScript** — full type inference, autocomplete-friendly API.

## Install

```bash
npm install react-pretext
```

Peer dependencies: `react >= 18.0.0`, `react-dom >= 18.0.0`

## Quick Start

```tsx
import { Pretext } from "react-pretext";

function App() {
  return (
    <Pretext.Root text="Hello world" width={300} font="16px Inter" lineHeight={24}>
      <Pretext.Lines>
        {(line) => <div key={line.key}>{line.text}</div>}
      </Pretext.Lines>
    </Pretext.Root>
  );
}
```

## API

### Components

#### `<Pretext.Provider>`

Provides default `font`, `lineHeight`, `locale`, and `debug` to all descendants.

```tsx
<Pretext.Provider font="16px Inter" lineHeight={24}>
  {children}
</Pretext.Provider>
```

| Prop | Type | Description |
|------|------|-------------|
| `font` | `string` | CSS font shorthand (e.g. `"16px Inter"`) |
| `lineHeight` | `number` | Line height in pixels |
| `locale` | `string?` | Locale for text segmentation |
| `debug` | `boolean?` | Enable debug overlays |

#### `<Pretext.Root>`

Computes layout and provides it to children. Supports two patterns:

**Child component pattern** — children access layout via `<Pretext.Lines>`:

```tsx
<Pretext.Root text="Hello world" width={300}>
  <Pretext.Lines>
    {(line) => <div key={line.key}>{line.text}</div>}
  </Pretext.Lines>
</Pretext.Root>
```

**Render prop pattern** — full control over the layout result:

```tsx
<Pretext.Root text={text} width={300}>
  {(layout) => (
    <svg height={layout.height}>
      {layout.lines.map((line) => (
        <text key={line.key} y={line.y}>{line.text}</text>
      ))}
    </svg>
  )}
</Pretext.Root>
```

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | Text to lay out |
| `width` | `number` | Maximum width in pixels |
| `font` | `string?` | Overrides provider font |
| `lineHeight` | `number?` | Overrides provider lineHeight |
| `locale` | `string?` | Locale for segmentation |
| `children` | `ReactNode \| (layout: PretextLayoutResult) => ReactNode` | |

#### `<Pretext.Lines>`

Iterates over lines from the nearest `<Pretext.Root>`. Must be a descendant of `<Pretext.Root>`.

```tsx
<Pretext.Lines>
  {(line, index) => <div key={line.key}>{line.text}</div>}
</Pretext.Lines>
```

#### `<Pretext.Line>`

Optional single-line wrapper with debug overlay support.

```tsx
<Pretext.Line line={line} debug>
  {(line) => <span>{line.text}</span>}
</Pretext.Line>
```

### Hooks

#### `usePretextLayout(options)`

Computes layout for a text block. Results are memoized and cached.

```tsx
import { usePretextLayout } from "react-pretext";

const layout = usePretextLayout({
  text: "Hello world",
  maxWidth: 300,
  font: "16px Inter",    // optional if Provider is used
  lineHeight: 24,         // optional if Provider is used
});

// layout.height    — total height in px
// layout.lineCount — number of lines
// layout.lines     — array of PretextLineInfo
```

#### `usePretextVirtualizer(options)`

Virtualizes a list of text items. Precomputes all heights using the fast path (`prepare` + `layout`, no line materialization). Supports 10k+ items.

```tsx
import { usePretextVirtualizer } from "react-pretext";

const items = messages.map((msg) => ({ text: msg.text }));

const { virtualItems, totalHeight, startIndex, endIndex } = usePretextVirtualizer({
  items,
  width: 400,
  lineHeight: 24,
  scrollTop: 0,
  viewportHeight: 600,
  overscan: 5,
  font: "16px Inter",
});
```

| Option | Type | Description |
|--------|------|-------------|
| `items` | `Array<{ text: string; font?: string }>` | Items to virtualize |
| `width` | `number` | Container width in pixels |
| `lineHeight` | `number` | Line height in pixels |
| `scrollTop` | `number` | Current scroll position |
| `viewportHeight` | `number` | Visible viewport height |
| `overscan` | `number?` | Extra items above/below viewport (default: 3) |
| `font` | `string?` | Default font for all items |

Returns:

| Field | Type | Description |
|-------|------|-------------|
| `virtualItems` | `VirtualItem[]` | Visible items with `index`, `key`, `offsetTop`, `height`, `data` |
| `totalHeight` | `number` | Total scrollable height |
| `startIndex` | `number` | First visible index |
| `endIndex` | `number` | Last visible index |

#### `usePretextVariableLayout(options)`

Computes variable-width layout where each line can have a different max width. Uses Provider context for defaults.

```tsx
import { usePretextVariableLayout } from "react-pretext";

const layout = usePretextVariableLayout({
  text: "Hello world",
  lineHeight: 24,
  getMaxWidth: (y) => (y < 100 ? 200 : 400),
});
```

#### `useFontReady(font)`

Returns `true` when the specified font is loaded and available.

```tsx
import { useFontReady } from "react-pretext";

const ready = useFontReady("16px Inter");
// false initially, true after font loads
// Always true on the server (SSR-safe)
```

#### `useResizeObserver(ref)`

Tracks element dimensions via `ResizeObserver`.

```tsx
import { useResizeObserver } from "react-pretext";

const ref = useRef<HTMLDivElement>(null);
const { width, height } = useResizeObserver(ref);
```

### Core Functions

#### `computeLayout(options)`

Standalone layout computation (no React dependency). Results are cached in a global LRU cache (500 entries).

```ts
import { computeLayout } from "react-pretext";

const result = computeLayout({
  text: "Hello world",
  font: "16px Inter",
  maxWidth: 300,
  lineHeight: 24,
});
```

#### `computeHeight(options)`

Fast path that returns only the height. Uses `prepare()` + `layout()` instead of `prepareWithSegments()` + `layoutWithLines()` — skips line text materialization entirely. ~10x faster. Cached separately (20k entries). Used internally by the virtualizer.

```ts
import { computeHeight } from "react-pretext";

const height = computeHeight({
  text: "Hello world",
  font: "16px Inter",
  maxWidth: 300,
  lineHeight: 24,
});
```

#### `computePreparedText(text, options?)`

SSR/locale-safe text preparation. Wraps `prepareWithSegments` so consumers never import from `@chenglou/pretext` directly.

```ts
import { computePreparedText } from "react-pretext";

const prepared = computePreparedText("Hello world", { font: "16px Inter" });
```

#### `computeVariableLayout(options)`

Per-line variable-width layout with a `getMaxWidth` callback. Enables text wrapping around obstacles.

```ts
import { computeVariableLayout } from "react-pretext";

const result = computeVariableLayout({
  text: "Hello world",
  font: "16px Inter",
  lineHeight: 24,
  getMaxWidth: (y) => (y < 100 ? 200 : 400),
});
```

#### `computeLineRanges(options)`

Returns character ranges for each line without materializing line text.

#### `profileLayout(options)`

Profiles layout performance, returning timing data for the prepare and layout phases.

#### `setLocale(locale)`

Sets the locale used for text segmentation globally.

#### `createCache(capacity?)`

Creates a standalone LRU cache instance (default capacity: 500).

#### `clearLayoutCache()`

Clears the global layout cache.

#### `clearAllCaches()`

Clears both the layout cache and the height cache.

### Renderers

#### `<DomRenderer>`

Renders lines as absolutely positioned `<div>` elements.

```tsx
import { DomRenderer, usePretextLayout } from "react-pretext";

const layout = usePretextLayout({ text, maxWidth: 300 });
<DomRenderer layout={layout} />
```

#### `<SvgRenderer>`

Renders lines as `<text>` elements inside an `<svg>`.

```tsx
import { SvgRenderer, usePretextLayout } from "react-pretext";

const layout = usePretextLayout({ text, maxWidth: 300 });
<SvgRenderer layout={layout} title="My text" />
```

#### `renderToCanvas(ctx, layout, options?)`

Imperative function that draws layout lines onto a canvas 2D context.

```ts
import { renderToCanvas, computeLayout } from "react-pretext";

const layout = computeLayout({ text, font: "16px Inter", maxWidth: 300, lineHeight: 24 });
const ctx = canvas.getContext("2d");
renderToCanvas(ctx, layout, { x: 10, y: 10, font: "16px Inter", color: "#333" });
```

## Types

```ts
interface PretextLayoutResult {
  height: number;
  lineCount: number;
  lines: PretextLineInfo[];
}

interface PretextLineInfo {
  key: string;       // Stable key for React rendering
  text: string;      // Line text content
  width: number;     // Measured line width in px
  y: number;         // Vertical offset from top
  index: number;     // Line index
}

interface VirtualItem {
  index: number;
  key: string;
  offsetTop: number;
  height: number;
  data: { text: string; font?: string };
}
```

All types from `@chenglou/pretext` are re-exported: `PreparedText`, `PreparedTextWithSegments`, `LayoutLine`, `LayoutCursor`, `LayoutResult`, `LayoutLinesResult`, `LayoutLineRange`, `PrepareProfile`, `WhiteSpaceMode`, `VariableLayoutResult`, `VariableLayoutLine`.

## Performance

- **`prepare()`** — segments text and measures via canvas. ~1ms for a paragraph. Cached internally by pretext.
- **`layout()`** — pure arithmetic on cached widths. ~0.0002ms per text block. Call on every resize.
- **`computeHeight()`** — fast path used by the virtualizer. Skips line materialization.
- **LRU caches** — layout results (500 entries) and heights (20k entries) are cached separately.
- **`useMemo`** — hooks memoize on input changes. Combined with the LRU cache, re-renders are effectively free for stable inputs.

### Virtualizer performance

The virtualizer precomputes heights for all items using the fast `computeHeight` path. For 10k items this runs once when `items` or `width` changes. Scroll events only trigger a binary search + array slice — no layout recomputation.

For smooth width resizing with large lists, use `useDeferredValue`:

```tsx
const [width, setWidth] = useState(500);
const deferredWidth = useDeferredValue(width);

const result = usePretextVirtualizer({
  items,
  width: deferredWidth,  // deferred — recomputation happens at lower priority
  ...
});
```

## SSR

Pretext requires canvas for `prepare()`, which is unavailable on the server. On the server:

- `computeLayout` / `computeHeight` return estimated dimensions using a character-width heuristic.
- `useFontReady` returns `true` to avoid hydration mismatches.

For pixel-perfect SSR, pre-compute layouts at build time or use a Node canvas polyfill.

## Documentation

```bash
pnpm docs:dev       # Fumadocs dev server (http://localhost:3000)
pnpm docs:build     # Production build
```

Interactive examples (text flow, masonry layout) are embedded directly in the docs.

## Scripts

```bash
pnpm build          # Build ESM + CJS + .d.ts via tsup
pnpm test           # Run tests via Vitest
pnpm lint           # Lint via Biome
pnpm format         # Format via Biome
pnpm docs:dev       # Start docs dev server
pnpm docs:build     # Build docs for production
```

## License

MIT
