# devdennie.github.io

Personal portfolio of Dennis Kabaso, a final-year Computer Science student at NIPA seeking an IT internship.

The site is a static [Vite](https://vite.dev/) app. It is served from the repository root (`base: '/'`).

The frame uses a `#13140F` background, `#FCFDF8` text, a `#F0F850` lime accent, and `#A078F8` violet as a token. Headings are Bricolage Grotesque and text is Instrument Sans. JetBrains Mono is loaded with them. Google Fonts is the only external resource. The hero, about, projects, and contact sections are written. Contact is a GitHub link only. The layout is checked from a phone width up, and the page has a skip link and a visible keyboard focus ring. There is no animation.

## Run it locally

```bash
npm ci
npm run dev
```

Open http://localhost:5173/

## Build

```bash
npm run build
npm run preview
```

The preview serves `dist` at http://localhost:4173/

## Test

```bash
npm test
```

The test builds the site and checks that each project has a title, a description and a valid link, that the hero alt text is present, and that the page does not load external scripts, an email address, a phone link or LinkedIn. Google Fonts is the only external resource.

## Deploy

Pushes to `main` run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The workflow installs dependencies, runs the test, builds, and deploys `dist` to GitHub Pages. In the repository settings, the Pages source is GitHub Actions.

## Licence

[MIT](LICENSE). Copyright (c) 2026 Dennis Kabaso.
