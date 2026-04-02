# docs/ — Fumadocs Documentation

Next.js App Router app powered by Fumadocs. Self-contained with its own `package.json`.

## Structure

- `content/docs/` — MDX content files
  - `meta.json` files control sidebar navigation ordering
  - `index.mdx` — introduction page
  - `api/` — one page per export category (components, hooks, core-functions, renderers, types)
  - `guides/` — performance, SSR
  - `examples/` — embedded live React components (text-flow, masonry)
- `app/` — Next.js App Router (layout, pages, API routes)
- `lib/` — source loader, shared layout options
- `components/` — MDX component overrides and live demo components

## Adding a Page

1. Create `content/docs/<section>/your-page.mdx` with frontmatter (`title`, `description`)
2. Add the slug to the relevant `meta.json` in the same directory
3. Use Fumadocs components: `<Cards>`, `<Card>`, `<Tabs>`, `<Tab>`, `<Callout>`

## Adding an Example

1. Create a `"use client"` component in `components/your-demo.tsx` that imports from `react-pretext`
2. Register it in `components/mdx.tsx` via `getMDXComponents()`
3. Create `content/docs/examples/your-example.mdx` using `<YourDemo />`
4. Add slug to `content/docs/examples/meta.json`

## Commands

```bash
pnpm docs:dev    # Next.js dev server (http://localhost:3000)
pnpm docs:build  # Production build
```

## Conventions

- MDX format with Fumadocs components (not Mintlify)
- Theme color: teal (CSS vars in `app/global.css`)
- API docs use markdown tables for props (not `<ParamField>`)
- Example pages embed live React components via `"use client"` wrappers
- Internal links use `/docs/` prefix (e.g., `/docs/api/hooks`)
