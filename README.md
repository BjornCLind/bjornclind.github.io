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

The homepage is a server component: only the scroll reveal and the
copy-email button ship JavaScript. The heavier visuals live on the project
pages alone and are loaded with `next/dynamic`, so they never reach the
homepage bundle. Keep it that way.

The one exception is the globe in the contact section (three.js and the
country data, well over a megabyte). It is fetched only when the reader scrolls
near it, skipped without WebGL, and stops rendering while off screen.

Scroll reveals hide content with inline styles until it is animated in, so
they must never be the only way back to visible: a timer backstop and a
per-batch deadline force the final state if animation frames or
IntersectionObserver callbacks are not being delivered (hidden or throttled
tabs). A print rule shows everything.

Vercel Speed Insights is enabled, so regressions show up in the dashboard.

## Project structure

```
app/                    # Routes, layout, metadata, sitemap, robots, OG image
app/projects/[slug]/    # Project detail pages, generated from data/index.ts
components/companion/   # Pixel Bjorn: sprite data, renderer, follow behaviour
components/home/        # Homepage client pieces: headline, reveals, previews
components/ui/          # Visuals: contact globe, neural field, scan title, schema morph
data/index.ts           # Site content: projects, experience, education, skills
data/globe.json         # Country outlines for the globe
lib/                    # Shared helpers (canonical URL, classnames)
scripts/sprite.py       # Pixel Bjorn's frames; regenerates the sprite data
```

## Pixel Bjorn

The little character that follows visitors around is drawn in
[`scripts/sprite.py`](scripts/sprite.py) as a grid of palette letters. Edit the
frames there, then regenerate the data the site uses:

```bash
python scripts/sprite.py export components/companion/sprite.ts
python scripts/sprite.py preview sprite.png   # optional, needs Pillow
```

He starts switched off: visitors turn him on with the button in the
bottom-left corner, and the choice is remembered. He never takes pointer
events and stays out of print.

## Content

Page copy lives in [`data/index.ts`](data/index.ts) — edit that rather than
the components. Adding a project there also creates its detail page and adds
it to the sitemap.

Work described on the site is deliberately kept general: no internal system
names, data volumes or operational details.
