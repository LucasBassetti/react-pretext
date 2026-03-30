# demo/ — Interactive Demo App

Vite-based demo deployed to `react-pretext.vercel.app`.

## Adding a Demo Page

1. Create `demo/pages/YourDemo.tsx` — export a named component
2. Import and add to the `PAGES` object in `demo/App.tsx`:
   ```ts
   import { YourDemo } from "./pages/YourDemo.tsx";

   const PAGES = {
     // ...existing pages
     yourpage: { label: "Your Label", component: YourDemo },
   };
   ```
3. The page automatically gets a sidebar nav entry and hash route (`#/yourpage`)

## Theme System

- Dark/light toggle persisted in `localStorage` key `react-pretext-theme`
- CSS variables defined in `demo/index.css` under `[data-theme="light"]` and `[data-theme="dark"]`
- Use CSS variables (not hardcoded colors) in demo pages

## Conventions

- All demos wrap content in `<Pretext.Provider>` (already provided by App root)
- Default font: `"16px Inter, system-ui, sans-serif"`, lineHeight: 24
- Demo data files go in `demo/pages/` (e.g., `shower-thoughts.json`)
- Run locally: `pnpm dev`
