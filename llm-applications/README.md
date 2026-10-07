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
build/screenshots/     screenshots per deck + manifest.json (caption, source)
<deck>/composition/    raw HyperFrames composition: 5 scenes + slideshow JSON island
<deck>/index.html      direct-open slideshow wrapper
```

To change content, edit `build/decks.mjs` and run `npm run build`. Don't hand-edit the generated HTML.

## Screenshots (slide 5)

All screenshots come from the official product pages or the articles cited on slide 1. Each one is credited on the slide.

| Deck | Image | Source |
|------|-------|--------|
| Klarna | Launch image of the assistant in the Klarna app | Klarna, via [CX Today](https://www.cxtoday.com/contact-center/klarna-claims-its-new-ai-assistant-does-the-work-of-700-full-time-agents/) |
| Klarna | Assistant answering about the shopper's own order; human-agent handoff | [The Pragmatic Engineer](https://blog.pragmaticengineer.com/klarnas-ai-chatbot/) |
| Khanmigo | Learner view (activities + tutor chat) | [khanmigo.ai/learners](https://www.khanmigo.ai/learners) |
| Khanmigo | Homework chat: "I'm here to guide you, not to do the work for you" | [Khan Academy blog](https://blog.khanacademy.org/unlimited-homework-tutoring-for-4-month/) |
| Khanmigo | Moderation warning | [Khan Academy blog](https://blog.khanacademy.org/khan-academys-7-step-approach-to-prompt-engineering-for-khanmigo) |
| Abridge | Recording in Epic Haiku; draft note with Linked Evidence in Epic | [abridge.com/product](https://www.abridge.com/product) |

The images belong to their owners and are used here for an educational assignment.

## Verification

- `npx hyperframes lint` and `npx hyperframes check`: 0 errors on all three decks, and every text check passes WCAG AA contrast.
  `check` treats only the first scene (slide 1) as the composition, so the first scene is marked `data-no-timeline`; the other four slides were checked with the browser pass below.
- Every slide was rendered in Chromium at 1920×1080 and checked for text that overflows or is clipped, and for content sitting under the nav controls.
- Arrow-key navigation through the wrapper was tested: each deck steps through exactly 5 slides.
- Each reference URL was confirmed to exist with a web search. Each number on the slides comes from those references.
