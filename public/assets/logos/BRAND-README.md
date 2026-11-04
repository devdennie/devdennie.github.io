# D3VCorp Brand Kit — Concept 4 "Prompt"

Wordmark: **D3VCorp**. Always write it with this exact capitalisation. Set it in JetBrains Mono, with "D3V" in ExtraBold 800 and "Corp" in Regular 400, followed by the block cursor. The cursor is part of the logo: never remove it.
Icon: the "D3" tile with a cursor bar. Below 48 px, use the favicon cut, which has a larger "D3".

## Colours
| Name | Hex | RGB | Use |
|---|---|---|---|
| Ink | #111111 | 17, 17, 17 | Primary text, light-mode logo, icon tile |
| Volt | #C6F432 | 198, 244, 50 | Accent, cursor on dark, dark icon tile |
| Void | #0A0A0A | 10, 10, 10 | Dark backgrounds |
| Paper | #F6F6F1 | 246, 246, 241 | Light backgrounds, wordmark on dark |
| Ash | #8A8A84 | 138, 138, 132 | Secondary text, captions |
| Graphite | #2A2A2A | 42, 42, 42 | Dark surfaces, rules, borders |

The cursor is Ink on light backgrounds and Volt on dark backgrounds.

## Typography
- **JetBrains Mono**: the logo, headlines and code. Weights: 800 for "D3V" and display text, 400 for "Corp" and code.
- **Instrument Sans**: body text and UI. Weights: 400 for body, 500 for UI, 600 for subheads.

## Clear space and minimum size
- Clear space: leave at least 1X on every side, where X is the width of the cursor block.
- Minimum sizes: horizontal 120 px / 30 mm, stacked 72 px / 20 mm, icon 16 px / 6 mm.

## Folders
- `logos/{horizontal,stacked,icon,wordmark}/`: `d3vcorp-{kind}-{light|dark|mono-black|mono-white}`, each as `.svg` (text outlined into paths), `.png` (transparent, 4000 px on the long side, or 4096 px for the icon) and `.pdf` (vector). Use "light" on light backgrounds and "dark" on dark backgrounds. The mono versions are pure #000000 or #FFFFFF.
- `favicons/`:
  - `favicon.ico` (16/32/48) and `favicon.svg`
  - `favicon-16x16.png`, `favicon-32x32.png` and `favicon-48x48.png` (pixel-tuned)
  - `apple-touch-icon.png` (180)
  - `android-chrome-192x192.png`, `android-chrome-512x512.png` and `app-icon-maskable-512.png`
  - `site.webmanifest`
- `app-icons/`:
  - `d3vcorp-app-icon-1024.png` and `.svg`
  - `ios/AppIcon-{20,29,40,58,60,76,80,87,120,152,167,180,1024}.png` (opaque, square: iOS applies its own mask)
  - `android/`:
    - Adaptive layers: `ic_launcher_foreground`, `ic_launcher_background` and `ic_launcher_monochrome` PNGs for mdpi through xxxhdpi (108–432 px), plus `ic_launcher_foreground.svg` and `ic_launcher.xml`
    - Legacy icons: `ic_launcher-*.png` and `ic_launcher_round-*.png` (48–192 px)
    - `play-store-icon-512.png`
- `social/`: `d3vcorp-profile-{ink|volt}-{1080|400}.png`. The artwork stays inside a circle crop.
- `brand-guide/`: `d3vcorp-brand-guide.pdf` and `d3vcorp-brand-guide.png`, the one-page guide.

## HTML favicon snippet
```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

## Don'ts
Don't stretch, recolour, or add effects (shadows, glows or gradients). Don't place the logo on a busy background. Don't remove the cursor. Don't change the capitalisation ("D3VCorp", never "d3vcorp" or "D3VCORP").
