# docs/ — Mintlify Documentation

## Structure

- `mint.json` — navigation, theme, links
- `introduction.mdx`, `quickstart.mdx` — getting started
- `api/` — one page per export category (components, hooks, core-functions, renderers, types)
- `guides/` — performance, SSR
- `examples/` — link to live demo at `react-pretext.vercel.app`

## Adding API Docs

1. If it's a new export category, create `docs/api/your-category.mdx`
2. If it fits an existing category, add to the relevant `.mdx` file
3. Update `mint.json` navigation if adding a new page

## Adding an Example

1. Create `docs/examples/your-example.mdx`
2. Link to the live demo page: `react-pretext.vercel.app/#/yourpage`
3. Add to `mint.json` navigation under the Examples group

## Commands

```bash
pnpm docs:dev       # local dev server
pnpm docs:validate  # validate all pages
```

## Conventions

- Use `.mdx` format
- Theme color: `#0D9373` (teal)
- Example pages point to the live demo — don't embed full code blocks
