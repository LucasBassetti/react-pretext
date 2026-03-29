# Contributing to react-pretext

Thanks for your interest in contributing! This guide covers how to get set up and submit changes.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

## Setup

```bash
git clone https://github.com/LucasBassworking/react-pretext.git
cd react-pretext
pnpm install
```

## Development

Start the demo app:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test
```

Lint and format:

```bash
pnpm lint
pnpm format
```

Build the library:

```bash
pnpm build
```

## Project Structure

```
src/
  core/       # Layout engine, cache, types, context
  hooks/      # React hooks (layout, virtualizer, font, resize)
  components/ # Headless compound components
  renderers/  # DOM, SVG, Canvas renderers
  __tests__/  # Vitest tests
demo/         # Vite demo app
docs/         # Mintlify documentation site
```

## Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The configuration uses tabs for indentation and a line width of 100.

Run `pnpm lint` before submitting to catch issues early.

## Submitting Changes

1. Fork the repository and create a branch from `main`.
2. Make your changes and add tests if applicable.
3. Run `pnpm lint` and `pnpm test` to verify everything passes.
4. Open a pull request against `main`.

Keep PRs focused — one feature or fix per PR.

## Reporting Bugs

Open an issue with:

- A description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/Node version if relevant

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE.md).
