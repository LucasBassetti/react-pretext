# react-pretext Improvements Design

## Context

react-pretext is a functional React adapter for `@chenglou/pretext` with deterministic text layout, virtualization, and three renderers (DOM, SVG, Canvas). The library works well for its core use case but needs improvements across three areas: expanded capabilities, production hardening, and developer experience. Additionally, a `.claude` structure is needed so Claude can assist with future development effectively.

## Approach: Foundation-First

Build the `.claude` structure and production foundation (tests, benchmarks) first, then layer in new capabilities one at a time. Each capability ships with tests and benchmarks from day one.

---

## Phase 1: `.claude` Structure

### CLAUDE.md (root)
- Project purpose: React adapter for `@chenglou/pretext` (deterministic text layout without DOM measurement)
- Architecture: core (layout, cache, types, context) → hooks → components → renderers
- Key dependency: `@chenglou/pretext ^0.0.3` (bundled via tsup noExternal)
- Build: `tsup` (ESM + CJS + .d.ts), dev: `vite`, test: `vitest`, lint: `biome`
- Conventions: compound component pattern (`Pretext.Root/Lines/Line/Provider`), render props, LRU caching, strict TypeScript

### CLAUDE.md (src/)
- How to add a hook: follow `usePretextLayout.ts` pattern, export from `index.ts`
- How to add a renderer: follow `dom.tsx`/`svg.tsx`/`canvas.ts` patterns, consume `PretextLayoutResult`
- How to add a compound component: add to `components/`, export via `components/index.ts`
- Testing: mock `@chenglou/pretext` with deterministic 8px char width (see `__tests__/setup`)
- Cache: layout cache (500 entries) and height cache (20k entries) — consider cache implications for new features

### CLAUDE.md (demo/)
- How to add a demo page: create in `demo/pages/`, add route in `App.tsx`, add sidebar nav entry
- Theme: dark/light toggle with localStorage, use CSS variables

### CLAUDE.md (docs/)
- Mintlify setup: `mint.json` defines navigation groups
- API docs: one `.mdx` per export in `docs/api/`
- Examples: link to live demo at react-pretext.vercel.app

---

## Phase 2: Test Coverage Expansion

### Renderer Tests
- **DOM renderer:** correct div structure, absolute positioning, className/style forwarding
- **SVG renderer:** correct SVG text elements, font/title/aria-label props
- **Canvas renderer:** correct `fillText` calls, offset positioning, font setting

### Hook Tests
- **useFontReady:** returns false initially, true after font loads, SSR fallback behavior
- **useResizeObserver:** tracks dimension changes, cleans up observer on unmount

### Edge Cases
- Empty strings, single characters, extremely long words (no break opportunities)
- Zero-width containers, undefined/null text
- Special characters: emoji, CJK, mixed scripts

### Integration Tests
- Full pipeline: `Provider` → `Root` → `Lines` → renderer
- Context overrides (font, lineHeight, locale, debug)

### SSR Tests
- Server render produces valid output
- Client hydration doesn't mismatch

---

## Phase 3: Performance Benchmarks

Using `vitest bench`:

### Layout Benchmarks
- `computeLayout` with text lengths: 10, 100, 1000, 10000 chars
- `computeLayout` with varying container widths
- `computeHeight` same variations (verify faster than full layout)

### Cache Benchmarks
- Cache hit vs cold computation speedup
- Cache eviction behavior under pressure

### Virtualizer Benchmarks
- Binary search performance: 1k, 10k, 100k items
- Scroll update computation time

### Renderer Benchmarks
- DOM rendering: 100 and 1000 lines
- Canvas rendering: 100 and 1000 lines

**Output:** CI visibility only (no regression gating initially). Add thresholds once baselines stabilize.

---

## Phase 4: Developer Experience — Examples

### New Demo Pages (demo/pages/)
- **Text animation** — animated text movement/rearrangement inspired by `@chenglou/pretext` original demos
- **Code editor** — monospace font, line numbers, syntax-highlighted text layout
- **Responsive card grid** — cards with variable text that reflow on resize
- **Tooltip/popover** — precomputed text height for positioning without layout thrash
- **Data table cells** — truncated text in table columns

### Docs Examples Update
- All example pages in `docs/examples/` link to the live demo at `react-pretext.vercel.app/` instead of embedding code

---

## Phase 5: New Capabilities (Priority Order)

Each capability includes tests and benchmarks.

### 5.1 Truncation & Ellipsis
- Single-line and multi-line truncation
- Configurable ellipsis character (default "...")
- `maxLines` prop on `Pretext.Root`
- Builds on existing `computeLayout` — slice lines and append ellipsis to last visible line

### 5.2 Accessibility
- ARIA attributes on all three renderers (role, aria-label, aria-multiline)
- Screen reader–friendly output structure
- Keyboard navigation support for interactive use cases
- Affects renderer APIs — do this early

### 5.3 Rich Text
- Mixed fonts/styles within a single layout (bold, italic, font-weight spans)
- Segment-aware layout using `PreparedTextWithSegments` from `@chenglou/pretext`
- New `<Pretext.Segment>` component or render prop extension
- Each segment can have its own font/style/className

### 5.4 RTL / Bidirectional Text
- Arabic, Hebrew support
- Mixed LTR/RTL content in same layout
- `direction` prop on `Pretext.Root` (ltr | rtl | auto)
- Depends on upstream `@chenglou/pretext` support — may require contribution

### 5.5 Click/Selection Mapping
- `hitTest(x, y)` → character position
- `getCharacterRect(index)` → bounding box
- Enables: text selection, cursor positioning, click handlers
- Useful for editor and interactive text use cases

### 5.6 Animation Support
- Animate layout changes on width resize or content swap
- Spring-based or CSS transition integration
- `useLayoutTransition` hook that interpolates between two layout states
- Pairs with text animation demo example

---

## Verification

- `.claude` structure: start a fresh Claude session and verify it picks up project context
- Tests: `pnpm test` passes, coverage increases
- Benchmarks: `pnpm bench` runs and outputs results
- Demo: `pnpm dev` shows all new demo pages
- Docs: `pnpm docs:validate` passes
- Each capability: dedicated test file + benchmark entry
