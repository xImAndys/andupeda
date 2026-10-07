# LLM applications — 3 decks × 5 slides

Three LLM applications from three companies in three industries, each presented as a
[HyperFrames](https://github.com/heygen-com/hyperframes) slideshow (built with its `/slideshow` skill).

| # | Application | Company | Industry | Deck |
|---|-------------|---------|----------|------|
| 1 | Klarna AI Assistant | Klarna | Fintech / payments | [`klarna-ai-assistant/`](klarna-ai-assistant/index.html) |
| 2 | Khanmigo | Khan Academy | Education | [`khanmigo/`](khanmigo/index.html) |
| 3 | Abridge | Abridge | Healthcare | [`abridge/`](abridge/index.html) |

Every deck has the same five slides, in this order:

1. **Title + references (URLs)**
2. **Summary of the use case**
3. **Diagram of the application's business logic**
4. **Our guess of what the key prompt(s) look like** (clearly labelled as a guess)
5. **Screenshot(s) of the application**

## Viewing

Serve this folder over HTTP and open `index.html`. The browser blocks the player's iframe on `file://`.

```bash
cd llm-applications
npx serve .            # or: python3 -m http.server
```

Use ← / → (or the on-screen arrows) to move between slides. Press **P** for presenter mode with speaker notes.

You can also run HyperFrames' own presenter server:

```bash
npm run klarna      # npx hyperframes present ./klarna-ai-assistant/composition
npm run khanmigo
npm run abridge
```

## Layout

```
build/decks.mjs        all slide content (facts, references, diagram nodes, prompts, notes)
build/build.mjs        generator: writes each deck's composition + wrapper
build/vendor/          GSAP, HyperFrames player/slideshow bundles, fonts (Inter, Fraunces, JetBrains Mono, OFL)
build/screenshots/     source screenshots per deck + manifest.json (caption, source URL)
<deck>/composition/    raw HyperFrames composition: 5 scenes + slideshow JSON island
<deck>/index.html      direct-open slideshow wrapper
```

To change content, edit `build/decks.mjs` and run `npm run build`. Don't hand-edit the generated HTML.

## Verification

- `npx hyperframes lint` and `npx hyperframes check`: 0 errors on all three decks, and every text check passes WCAG AA contrast.
- Every slide was rendered in Chromium at 1920×1080 and checked for text that overflows or is clipped, and for content sitting under the nav controls.
- Arrow-key navigation through the wrapper was tested: each deck steps through exactly 5 slides.
- Each reference URL was confirmed to exist with a web search. Each number on the slides comes from those references.
