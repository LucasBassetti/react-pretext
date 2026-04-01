# src/ — Library Source

## Adding a Hook

1. Create `src/hooks/useYourHook.ts`
2. Follow the pattern in `usePretextLayout.ts` — accept options, return memoized result
3. Export from `src/index.ts` (both the hook and its options type)
4. Add tests in `src/__tests__/useYourHook.test.ts`

## Adding a Renderer

1. Create `src/renderers/yourRenderer.tsx` (or `.ts` for imperative APIs like canvas)
2. Accept `PretextLayoutResult` as input — renderers are stateless consumers of layout data
3. For React components: export props interface and component
4. For imperative APIs: export options interface and function
5. Export from `src/index.ts`
6. See `dom.tsx` (React component), `canvas.ts` (imperative function) for patterns

## Adding a Compound Component

1. Create `src/components/PretextYourComponent.tsx`
2. Access context via `useContext(PretextContext)` from `src/core/context.ts`
3. Add to `src/components/index.ts` as `Pretext.YourComponent`
4. Export component and props type from `src/index.ts`

## Cache Considerations

- `computeLayout` uses a global LRU cache (500 entries) — keyed by `font|maxWidth|lineHeight|text`
- `computeHeight` uses a separate Map-based cache (20k entries) for the fast path
- If a new feature changes layout output for the same inputs, the cache key must change
- Use `createCache()` to create isolated cache instances for testing or special cases

## Testing

- All tests mock `@chenglou/pretext` via the vitest alias in `vitest.config.ts`
- The mock lives at `src/__tests__/__mocks__/pretext.ts` — fixed 8px character width
- Word-breaking uses space splitting — the mock is simpler than the real engine
- Use `@testing-library/react` for component/hook tests
- Run: `pnpm test` or `pnpm test:watch`

## Types

- Library types are defined in `src/core/types.ts`
- Upstream types (`PreparedText`, `LayoutLine`, etc.) are re-exported from `@chenglou/pretext`
- All public types must be exported from `src/index.ts`
