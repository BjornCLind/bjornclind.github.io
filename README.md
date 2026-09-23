# bjornclind.github.io

Personal portfolio of Bjorn Lindqvist — Next.js (App Router), TypeScript and
Tailwind CSS, deployed on Vercel.

## Local development

```bash
npm install
npm run dev       # http://localhost:3000
```

## Checks

```bash
npm run check     # lint + typecheck + build
```

`lint` and `typecheck` also run in Vercel's build, so a type or lint error
fails the deploy rather than shipping.

## Deployment

Pushing to `main` triggers a Vercel deployment. The app runs natively on
Vercel — no static export — so route handlers, server components and
`next/image` optimization are all available.

The canonical URL is resolved at build time in [`lib/site.ts`](lib/site.ts)
from `VERCEL_PROJECT_PRODUCTION_URL`, so it follows the project's production
domain, including a custom domain. `NEXT_PUBLIC_SITE_URL` overrides it.

### Performance

Three libraries dominate the bundle if imported eagerly, so each is deferred:

- `confetti.json` (~600 kB) is imported dynamically when the copy button is
  pressed, not at module scope.
- `CanvasRevealEffect` (three.js) loads via `next/dynamic` on hover.
- The globe waits for an `IntersectionObserver` before mounting.

Keep it that way — importing any of them statically puts the whole payload
back into the initial page chunk. Vercel Speed Insights is enabled, so
regressions show up in the dashboard.

## Project structure

```
app/                    # Routes, layout, metadata, sitemap, robots, OG image
app/projects/[slug]/    # Project detail pages, generated from data/index.ts
components/             # Page sections (Hero, Grid, Experience, ...)
components/ui/          # Reusable animated UI primitives
data/index.ts           # Site content: nav, bio grid, experience, education, projects
lib/                    # Shared helpers (canonical URL, classnames)
```

## Content

Page copy lives in [`data/index.ts`](data/index.ts) — edit that rather than
the components. Adding a project there also creates its detail page and adds
it to the sitemap.

Work described on the site is deliberately kept general: no internal system
names, data volumes or operational details.
