# react-pretext

React adapter for [`@chenglou/pretext`](https://github.com/chenglou/pretext) — deterministic text layout without DOM measurement.

## What This Library Does

Computes text line breaks and heights using pure arithmetic on cached character widths (~0.0002ms per layout). No DOM measurement, no layout thrashing, no `getBoundingClientRect`. Same input always produces same output.

## Architecture

```
src/
├── core/           # Layout engine, LRU cache, TypeScript types, React context
├── hooks/          # usePretextLayout, usePretextVirtualizer, useFontReady, useResizeObserver
├── components/     # Compound components: Pretext.Root, Lines, Line, Provider
├── renderers/      # DOM (divs), SVG (text elements), Canvas (fillText)
└── __tests__/      # Vitest tests with deterministic 8px char width mock
```

The core dependency `@chenglou/pretext` ships raw `.ts` and is bundled via tsup `noExternal`. React and react-dom are peer dependencies.

## Key Patterns

- **Compound components** with render props: `<Pretext.Root>` computes layout, `<Pretext.Lines>` iterates lines
- **Dual LRU caching**: layout cache (500 entries) for full results, height cache (20k entries) for fast height-only path
- **SSR fallback**: 8px average char width heuristic when `document` is undefined, pixel-perfect on client
- **Renderers are stateless**: they consume `PretextLayoutResult` and output DOM/SVG/Canvas — no layout logic

## Commands

```bash
pnpm build          # tsup → ESM + CJS + .d.ts in dist/
pnpm test           # vitest run
pnpm test:watch     # vitest (watch mode)
pnpm lint           # biome check src
pnpm format         # biome format --write src
pnpm dev            # vite dev server for demo app
pnpm build:demo     # vite build for demo
pnpm docs:dev       # mintlify dev server for docs
pnpm docs:validate  # mintlify validate
```

## Conventions

- **TypeScript strict mode** — no `any`, no implicit returns
- **Biome** for linting and formatting — tabs, 100 char line width
- **Exports**: all public API goes through `src/index.ts`
- **Tests**: mock `@chenglou/pretext` via vitest alias (see `vitest.config.ts`) — tests use deterministic 8px char widths, no canvas dependency
- **No runtime dependencies** beyond `@chenglou/pretext` (bundled) and React (peer)

## Upcoming Capabilities

See `docs/superpowers/specs/2026-03-29-react-pretext-improvements-design.md` for the full roadmap:
1. Truncation & ellipsis
2. Accessibility (ARIA on all renderers)
3. Rich text (mixed fonts/styles)
4. RTL / bidirectional text
5. Click/selection mapping
6. Animation support
