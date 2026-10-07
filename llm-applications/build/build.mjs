// Generates the three HyperFrames slideshow decks from decks.mjs.
//
//   node build/build.mjs
//
// For each deck it writes:
//   <slug>/composition/index.html   raw HyperFrames composition (5 scenes + island)
//   <slug>/index.html               direct-open slideshow wrapper (duplicated island)
// plus the landing page llm-applications/index.html.

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decks } from "./decks.mjs";

const BUILD = dirname(fileURLToPath(import.meta.url));
const ROOT = join(BUILD, "..");
const VENDOR = join(BUILD, "vendor");

const SLIDE_SECONDS = 6;
const SLIDE_COUNT = 5;
const TOTAL = SLIDE_SECONDS * SLIDE_COUNT;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ── shared CSS ───────────────────────────────────────────────────────────
const fontFaces = [
  ["Inter", 400, "normal", "inter-latin-400-normal.woff2"],
  ["Inter", 500, "normal", "inter-latin-500-normal.woff2"],
  ["Inter", 600, "normal", "inter-latin-600-normal.woff2"],
  ["Inter", 700, "normal", "inter-latin-700-normal.woff2"],
  ["Inter", 800, "normal", "inter-latin-800-normal.woff2"],
  ["JetBrains Mono", 400, "normal", "jetbrains-mono-latin-400-normal.woff2"],
  ["JetBrains Mono", 700, "normal", "jetbrains-mono-latin-700-normal.woff2"],
  ["Fraunces", 600, "normal", "fraunces-latin-600-normal.woff2"],
  ["Fraunces", 700, "normal", "fraunces-latin-700-normal.woff2"],
  ["Fraunces", 600, "italic", "fraunces-latin-600-italic.woff2"],
]
  .map(
    ([family, weight, style, file]) =>
      `@font-face { font-family: "${family}"; font-weight: ${weight}; font-style: ${style}; font-display: block; src: url("vendor/fonts/${file}") format("woff2"); }`,
  )
  .join("\n      ");

function css(theme) {
  return `
      ${fontFaces}
      :root {
        --paper: #f5f2ea;
        --card: #fffdf8;
        --ink: #16181d;
        --muted: #4f535c;
        --rule: #d6d0c2;
        --accent: ${theme.accent};
        --accent-ink: ${theme.accentInk};
        --accent-soft: ${theme.accentSoft};
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: var(--paper); }
      body { color: var(--ink); font-family: "Inter", system-ui, sans-serif; }
      .scene { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden; background: var(--paper); }
      .scene + .scene { opacity: 0; visibility: hidden; pointer-events: none; }
      .clip { position: absolute; inset: 0; padding: 0 80px; }
      #deck-progress { position: absolute; left: 0; top: 0; width: 100%; height: 8px; background: var(--rule); z-index: 5; }
      #deck-progress-fill { display: block; width: 100%; height: 100%; background: var(--accent-ink); transform-origin: 0 50%; }
      .topbar { position: absolute; left: 80px; right: 80px; top: 48px; display: flex; justify-content: space-between; align-items: center;
        font-size: 22px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
      .topbar .brand { display: flex; align-items: center; gap: 16px; }
      .topbar .dot { display: block; width: 18px; height: 18px; border-radius: 4px; background: var(--accent); border: 2px solid var(--ink); }
      .topbar .count { font-family: "JetBrains Mono", ui-monospace, monospace; letter-spacing: 0; }
      .headline { position: absolute; left: 80px; right: 80px; top: 112px; margin: 0; max-width: 1640px;
        font-family: "Fraunces", Georgia, serif; font-weight: 600; font-size: 60px; line-height: 1.12; letter-spacing: -0.01em; }
      .badge { display: inline-block; padding: 8px 16px; border-radius: 999px; background: var(--ink); color: var(--paper);
        font-size: 22px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
      .refnum { font-family: "JetBrains Mono", ui-monospace, monospace; color: var(--accent-ink); font-weight: 700; }

      /* slide 1 — title + references */
      .title-wrap { position: absolute; left: 80px; top: 130px; width: 840px; }
      .kicker { display: inline-block; padding: 10px 18px; background: var(--accent); border: 2px solid var(--ink); border-radius: 8px;
        font-size: 24px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
      .app-title { margin: 36px 0 0; font-family: "Fraunces", Georgia, serif; font-weight: 700; font-size: 128px; line-height: 0.98; letter-spacing: -0.02em; }
      .tagline { margin: 28px 0 0; font-size: 40px; line-height: 1.25; color: var(--ink); max-width: 860px; }
      .facts { margin-top: 48px; display: grid; grid-template-columns: 1fr; gap: 0; border-top: 2px solid var(--ink); }
      .fact { display: grid; grid-template-columns: 170px 1fr; gap: 20px; padding: 16px 0; border-bottom: 1px solid var(--rule); align-items: baseline; }
      .fact .k { font-size: 22px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
      .fact .v { font-size: 30px; font-weight: 500; line-height: 1.25; }
      .refs { position: absolute; right: 80px; top: 130px; width: 880px; max-height: 800px; overflow: hidden; background: var(--card);
        border: 2px solid var(--ink); border-radius: 18px; padding: 36px 40px; box-shadow: 10px 10px 0 var(--accent); }
      .refs h3 { margin: 0 0 22px; font-size: 26px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
      .refs ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 20px; }
      .refs li { display: grid; grid-template-columns: 48px 1fr; gap: 8px; }
      .refs .rl { font-size: 27px; font-weight: 600; line-height: 1.25; }
      .refs .ru { display: block; margin-top: 4px; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 19px; line-height: 1.35;
        color: var(--accent-ink); word-break: break-all; text-decoration: none; }

      /* slide 2 — summary */
      .sum-rows { position: absolute; left: 80px; top: 330px; width: 900px; border-top: 2px solid var(--ink); }
      .sum-row { display: grid; grid-template-columns: 140px 1fr; gap: 24px; padding: 26px 0; border-bottom: 1px solid var(--rule); }
      .sum-row .k { font-size: 24px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-ink); padding-top: 6px; }
      .sum-row .v { font-size: 34px; line-height: 1.32; }
      .stats { position: absolute; right: 80px; top: 330px; width: 760px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      .stat { background: var(--card); border: 2px solid var(--ink); border-radius: 18px; padding: 28px 28px 26px; min-height: 236px; }
      .stat:first-child { background: var(--accent); }
      .stat .n { font-family: "Fraunces", Georgia, serif; font-weight: 700; font-size: 84px; line-height: 1; letter-spacing: -0.02em; }
      .stat .c { margin-top: 16px; font-size: 28px; line-height: 1.25; font-weight: 500; }
      .source { position: absolute; left: 80px; bottom: 60px; font-size: 22px; color: var(--muted); }

      /* slide 3 — diagram */
      .diagram { position: absolute; left: 80px; top: 300px; width: 1760px; height: 600px; }
      .diagram svg { position: absolute; inset: 0; overflow: visible; }
      .node { position: absolute; width: 250px; height: 210px; overflow: hidden; border: 3px solid var(--ink); border-radius: 16px; background: var(--card);
        padding: 18px 18px 16px; display: flex; flex-direction: column; gap: 8px; }
      .node.llm { background: var(--accent); }
      .node.human, .node.user { border-style: dashed; }
      .node .tag { align-self: flex-start; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 16px; font-weight: 700;
        padding: 3px 9px; border-radius: 6px; background: var(--ink); color: var(--paper); letter-spacing: 0.04em; }
      .node.llm .tag { background: var(--ink); color: var(--accent); }
      .node .t { font-size: 28px; font-weight: 700; line-height: 1.15; }
      .node .s { font-size: 21px; line-height: 1.3; color: var(--muted); }
      .node.llm .s { color: var(--ink); }
      .elabel { position: absolute; transform: translate(-50%, -50%); padding: 3px 12px; border-radius: 999px; background: var(--paper);
        border: 2px solid var(--ink); font-size: 19px; font-weight: 700; white-space: nowrap; }
      .legend { position: absolute; left: 80px; bottom: 56px; display: flex; gap: 28px; align-items: center; font-size: 21px; color: var(--muted); }
      .legend .sw { display: inline-block; width: 26px; height: 20px; border: 3px solid var(--ink); border-radius: 5px; vertical-align: -3px; margin-right: 8px; background: var(--card); }
      .legend .sw.llm { background: var(--accent); }
      .legend .sw.human { border-style: dashed; }

      /* slide 4 — prompts */
      .guess { position: absolute; left: 80px; top: 300px; }
      .prompts { position: absolute; left: 80px; right: 80px; top: 360px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
      .pblock { background: #15171c; color: #eceae3; border: 2px solid var(--ink); border-radius: 18px; overflow: hidden; height: 560px; }
      .pblock .ph { padding: 16px 26px; background: var(--accent); color: var(--ink); font-size: 25px; font-weight: 800; border-bottom: 2px solid var(--ink); }
      .pblock pre { margin: 0; padding: 22px 26px; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 22.5px; line-height: 1.42; white-space: pre-wrap; }
      .pblock .var { color: var(--accent); font-weight: 700; }
      .pblock .role { color: #9ea3ad; font-weight: 700; }

      /* slide 5 — screenshots */
      .shots { position: absolute; left: 80px; right: 80px; top: 290px; bottom: 120px; display: flex; flex-direction: column; justify-content: center; }
      .shots-row { display: flex; gap: 32px; justify-content: center; align-items: flex-start; }
      .shot { min-width: 0; display: flex; flex-direction: column; gap: 14px; }
      .shot .frame { width: 100%; background: var(--card); border: 2px solid var(--ink); border-radius: 16px; overflow: hidden;
        display: flex; align-items: center; justify-content: center; box-shadow: 8px 8px 0 var(--accent); }
      .shot img { display: block; width: 100%; height: 100%; object-fit: contain; }
      .shot .cap { font-size: 24px; line-height: 1.3; font-weight: 600; }
      .shot .src { margin-top: 4px; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 19px; color: var(--accent-ink); }
      .placeholder { text-align: center; padding: 40px; font-size: 32px; color: var(--muted); }
`;
}

// ── slide builders ───────────────────────────────────────────────────────
function topbar(deck, n) {
  return `<div class="topbar"><div class="brand"><span class="dot"></span><span>LLM applications · 0${deck.index} · ${esc(deck.industry)}</span></div><div class="count">${esc(deck.app)} — 0${n} / 05</div></div>`;
}

function slideTitle(deck) {
  const facts = deck.title.facts
    .map(([k, v]) => `<div class="fact"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`)
    .join("");
  const refs = deck.references
    .map(
      ([label, url], i) =>
        `<li><span class="refnum">[${i + 1}]</span><span><span class="rl">${esc(label)}</span><a class="ru" href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></span></li>`,
    )
    .join("");
  return `${topbar(deck, 1)}
        <div class="title-wrap" data-anim>
          <span class="kicker">${esc(deck.title.kicker)}</span>
          <h1 class="app-title">${esc(deck.app)}</h1>
          <p class="tagline">${esc(deck.title.tagline)}</p>
          <div class="facts">${facts}</div>
        </div>
        <aside class="refs" data-anim><h3>References</h3><ol>${refs}</ol></aside>`;
}

function slideSummary(deck) {
  const s = deck.summary;
  const rows = s.rows
    .map(([k, v]) => `<div class="sum-row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`)
    .join("");
  const stats = s.stats
    .map(([n, c]) => `<div class="stat"><div class="n">${esc(n)}</div><div class="c">${esc(c)}</div></div>`)
    .join("");
  return `${topbar(deck, 2)}
        <h2 class="headline" data-anim>${esc(s.headline)}</h2>
        <div class="sum-rows" data-anim>${rows}</div>
        <div class="stats" data-anim>${stats}</div>
        <div class="source">Source: ${esc(s.source)}</div>`;
}

const NODE_W = 250;
const NODE_H = 210;
const Y_OFF = 40; // room above row 0 for loop arcs

function slideDiagram(deck) {
  const d = deck.diagram;
  const byId = Object.fromEntries(d.nodes.map((n) => [n.id, { ...n, y: n.y + Y_OFF }]));
  const tags = { llm: "LLM", system: "SYSTEM", human: "HUMAN", user: "USER" };
  const nodes = Object.values(byId)
    .map(
      (n) =>
        `<div class="node ${n.kind}" style="left:${n.x}px;top:${n.y}px"><span class="tag">${tags[n.kind]}</span><div class="t">${esc(n.title)}</div><div class="s">${esc(n.sub)}</div></div>`,
    )
    .join("");

  const paths = [];
  const labels = [];
  for (const [from, to, label = "", style = ""] of d.edges) {
    const a = byId[from];
    const b = byId[to];
    let path;
    let lx;
    let ly;
    if (style === "loop") {
      // arc over the top of row 0, from a's top back to b's top
      const x1 = a.x + NODE_W / 2;
      const x2 = b.x + NODE_W / 2;
      const top = a.y - 34;
      path = `M ${x1} ${a.y} V ${top} H ${x2} V ${b.y - 6}`;
      lx = (x1 + x2) / 2;
      ly = top;
    } else if (a.y === b.y) {
      const leftToRight = b.x > a.x;
      const x1 = leftToRight ? a.x + NODE_W : a.x;
      const x2 = leftToRight ? b.x - 6 : b.x + NODE_W + 6;
      const y = a.y + NODE_H / 2;
      path = `M ${x1} ${y} H ${x2}`;
      lx = (x1 + x2) / 2;
      ly = a.y + NODE_H + 26;
    } else {
      const down = b.y > a.y;
      const x1 = a.x + NODE_W / 2;
      const x2 = b.x + NODE_W / 2;
      const y1 = down ? a.y + NODE_H : a.y;
      const y2 = down ? b.y - 6 : b.y + NODE_H + 6;
      const midY = down ? a.y + NODE_H + (b.y - a.y - NODE_H) / 2 : b.y + NODE_H + (a.y - b.y - NODE_H) / 2;
      path = x1 === x2 ? `M ${x1} ${y1} V ${y2}` : `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;
      lx = x1 === x2 ? x1 : (x1 + x2) / 2;
      ly = x1 === x2 ? (y1 + y2) / 2 : midY;
    }
    const dash = style === "dashed" ? ' stroke-dasharray="10 8"' : "";
    paths.push(`<path d="${path}" fill="none" stroke="#16181d" stroke-width="3.5"${dash} marker-end="url(#arrow-${deck.slug})"/>`);
    if (label) labels.push(`<span class="elabel" style="left:${lx}px;top:${ly}px">${esc(label)}</span>`);
  }

  return `${topbar(deck, 3)}
        <h2 class="headline" data-anim>${esc(d.headline)}</h2>
        <div class="diagram" data-anim>
          <svg width="1760" height="600" viewBox="0 0 1760 600" aria-hidden="true">
            <defs><marker id="arrow-${deck.slug}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#16181d"/></marker></defs>
            ${paths.join("\n            ")}
          </svg>
          ${nodes}
          ${labels.join("")}
        </div>
        <div class="legend"><span><span class="sw llm"></span>LLM step</span><span><span class="sw"></span>Software / data</span><span><span class="sw human"></span>Person</span><span>· ${esc(d.footnote)}</span></div>`;
}

function highlightPrompt(text) {
  return esc(text)
    .replace(/\{[a-z_]+\}/g, (m) => `<span class="var">${m}</span>`)
    .replace(/^(SYSTEM|USER)$/gm, (m) => `<span class="role">${m}</span>`);
}

function slidePrompts(deck) {
  const p = deck.prompts;
  const blocks = p.blocks
    .map((b) => `<div class="pblock"><div class="ph">${esc(b.label)}</div><pre>${highlightPrompt(b.text)}</pre></div>`)
    .join("");
  return `${topbar(deck, 4)}
        <h2 class="headline" data-anim>${esc(p.headline)}</h2>
        <div class="guess" data-anim><span class="badge">Our educated guess — not ${esc(deck.company)}’s actual prompt</span></div>
        <div class="prompts" data-anim>${blocks}</div>`;
}

function loadShots(deck) {
  const dir = join(BUILD, "screenshots", deck.slug);
  const manifest = join(dir, "manifest.json");
  if (!existsSync(manifest)) return { dir, shots: [] };
  return { dir, shots: JSON.parse(readFileSync(manifest, "utf-8")) };
}

const SHOT_H = 500; // tallest a screenshot frame gets; wide sets shrink to fit

function slideShots(deck, shots) {
  const body = shots.length
    ? shots
        .map(
          (s) =>
            `<figure class="shot" style="margin:0;flex:0 1 ${Math.round((s.grow ?? 1) * SHOT_H)}px"><div class="frame" style="aspect-ratio:${s.grow ?? 1}"><img src="assets/${esc(s.file)}" alt="${esc(s.alt ?? s.caption)}"></div><figcaption><div class="cap">${esc(s.caption)}</div><div class="src">${esc(s.source)}</div></figcaption></figure>`,
        )
        .join("")
    : `<div class="shot"><div class="frame"><div class="placeholder">Screenshot pending: add images to build/screenshots/${esc(deck.slug)}/</div></div></div>`;
  return `${topbar(deck, 5)}
        <h2 class="headline" data-anim>${esc(deck.screenshots.headline)}</h2>
        <div class="shots" data-anim><div class="shots-row">${body}</div></div>`;
}

// ── composition + wrapper ────────────────────────────────────────────────
function sceneIds(deck) {
  return ["title", "summary", "diagram", "prompts", "screenshots"].map((s) => `${deck.slug}-${s}`);
}

function island(deck) {
  const ids = sceneIds(deck);
  return JSON.stringify({ slides: ids.map((sceneId, i) => ({ sceneId, notes: deck.notes[i] })), slideSequences: [] }, null, 2);
}

function composition(deck, shots) {
  const ids = sceneIds(deck);
  const labels = ["Title + references", "Use-case summary", "Business-logic diagram", "Key prompts (our guess)", "Screenshots"];
  const bodies = [slideTitle(deck), slideSummary(deck), slideDiagram(deck), slidePrompts(deck), slideShots(deck, shots)];
  const scenes = ids
    .map((id, i) => {
      const start = i * SLIDE_SECONDS;
      // `hyperframes check` treats the first scene as the whole composition
      // (6s) and flags its static frames. Slides are still by design and the
      // slideshow controller does the seeking, so mark that root still.
      const still = i === 0 ? " data-no-timeline" : "";
      return `
    <!-- Slide ${i + 1} — ${labels[i]} -->
    <div id="${id}" class="scene" data-composition-id="${id}"${still} data-start="${start}" data-duration="${SLIDE_SECONDS}" data-label="${labels[i]}" data-width="1920" data-height="1080">
      <section id="${id}-clip" class="clip" data-start="${start}" data-duration="${SLIDE_SECONDS}" data-track-index="1">
        ${bodies[i]}
      </section>
    </div>`;
    })
    .join("\n");

  const sceneList = ids.map((id, i) => ({ id, start: i * SLIDE_SECONDS, duration: SLIDE_SECONDS }));

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${esc(deck.app)} — LLM application deck</title>
    <script src="vendor/gsap.min.js"></script>
    <style>${css(deck.theme)}    </style>
  </head>
  <body>
    <script type="application/hyperframes-slideshow+json">
${island(deck)}
    </script>
${scenes}

    <div id="deck-progress" aria-hidden="true"><div id="deck-progress-fill"></div></div>

    <!-- Deck timeline: spans the whole deck so the slideshow can seek to any slide. -->
    <script>
      (function () {
        var tl = gsap.timeline({ paused: true });
        // Deck progress bar: fills across the whole deck, so each slide's rest
        // frame shows how far through the 5 slides the audience is.
        tl.fromTo("#deck-progress-fill", { scaleX: 0 }, { scaleX: 1, duration: ${TOTAL}, ease: "none" }, 0);
        // Keyed by the first scene's id: lint requires a matching
        // data-composition-id, and the player looks up the timeline by it.
        window.__timelines = window.__timelines || {};
        window.__timelines["${ids[0]}"] = tl;
      })();
    </script>

    <!-- Visibility controller + entrance motion (standalone slideshow harness). -->
    <script>
      (function () {
        var scenes = ${JSON.stringify(sceneList.map((s) => ({ id: s.id, start: s.start, end: s.start + s.duration })))};
        // Entrance motion only runs inside the slideshow player (an iframe);
        // headless validation and snapshots see the static end state.
        var animate = window.self !== window.top;
        var lastActiveId = null;

        function fireEntrance(sceneEl) {
          var els = sceneEl.querySelectorAll("[data-anim]");
          if (!animate || !els.length) return;
          gsap.fromTo(els, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out", overwrite: true });
        }

        function updateVisibility(t) {
          for (var i = 0; i < scenes.length; i++) {
            var s = scenes[i];
            var el = document.getElementById(s.id);
            if (!el) continue;
            var last = i === scenes.length - 1;
            var active = t >= s.start && (t < s.end || (last && t <= s.end));
            el.style.opacity = active ? "1" : "0";
            el.style.visibility = active ? "visible" : "hidden";
            el.style.pointerEvents = active ? "auto" : "none";
            if (active && lastActiveId !== s.id) {
              lastActiveId = s.id;
              fireEntrance(el);
            }
          }
        }

        window.__hfSetTime = updateVisibility;
        updateVisibility(0);

        var root = window.__timelines && window.__timelines["${ids[0]}"];
        if (root) {
          root.eventCallback("onUpdate", function () {
            updateVisibility(root.time());
          });
        }
      })();
    </script>

    <!-- Tell <hyperframes-slideshow> where every scene sits on the timeline. -->
    <script>
      (function () {
        var scenes = ${JSON.stringify(sceneList)};
        function postTimeline() {
          if (window.parent === window) return;
          window.parent.postMessage({ source: "hf-preview", type: "timeline", durationInFrames: ${TOTAL * 30}, scenes: scenes }, "*");
        }
        if (document.readyState === "complete") setTimeout(postTimeline, 300);
        else window.addEventListener("load", function () { setTimeout(postTimeline, 300); });
      })();
    </script>
  </body>
</html>
`;
}

function wrapper(deck) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(deck.app)} — Slideshow</title>
    <script src="vendor/hyperframes-player.global.js"></script>
    <script src="vendor/hyperframes-slideshow.global.js"></script>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: #16181d; }
    </style>
  </head>
  <body>
    <!-- tabindex="0" lets the slideshow receive arrow keys. -->
    <hyperframes-slideshow tabindex="0" style="display: block; position: relative; width: 100vw; height: 100vh">
      <hyperframes-player interactive style="position: absolute; inset: 0" src="composition/index.html"></hyperframes-player>
      <!-- Copy of the island in composition/index.html (generated by build/build.mjs). -->
      <script type="application/hyperframes-slideshow+json">
${island(deck)}
      </script>
    </hyperframes-slideshow>
    <script>
      document.querySelector("hyperframes-slideshow").focus();
    </script>
  </body>
</html>
`;
}

function landing() {
  const cards = decks
    .map(
      (d) => `
      <a class="card" href="${d.slug}/index.html" style="--accent:${d.theme.accent}">
        <span class="n">0${d.index}</span>
        <span class="ind">${esc(d.industry)}</span>
        <span class="app">${esc(d.app)}</span>
        <span class="co">${esc(d.company)} · 5 slides</span>
      </a>`,
    )
    .join("");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LLM Applications — 3 decks</title>
    <style>
      :root { --paper: #f5f2ea; --ink: #16181d; --muted: #4f535c; }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--paper); color: var(--ink); font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
      main { max-width: 1100px; margin: 0 auto; padding: 56px 16px; }
      h1 { font-family: Georgia, serif; font-size: clamp(36px, 6vw, 60px); margin: 0 0 12px; }
      p { font-size: 18px; color: var(--muted); max-width: 720px; line-height: 1.5; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 36px; }
      .card { display: flex; flex-direction: column; gap: 8px; padding: 24px; border: 2px solid var(--ink); border-radius: 16px; background: #fffdf8;
        color: inherit; text-decoration: none; box-shadow: 8px 8px 0 var(--accent); transition: transform .15s; }
      .card:hover { transform: translate(-2px, -2px); }
      .n { font-family: ui-monospace, monospace; font-weight: 700; }
      .ind { text-transform: uppercase; letter-spacing: .08em; font-size: 13px; font-weight: 700; color: var(--muted); }
      .app { font-family: Georgia, serif; font-size: 30px; font-weight: 700; }
      .co { color: var(--muted); }
    </style>
  </head>
  <body>
    <main>
      <h1>Three LLM applications, three industries</h1>
      <p>Each deck has 5 slides: title + references, use-case summary, business-logic diagram, our guess at the key prompts, and screenshots. Built as HyperFrames slideshows. Use ← / → to navigate and P for presenter mode.</p>
      <div class="grid">${cards}
      </div>
    </main>
  </body>
</html>
`;
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const f of readdirSync(src, { withFileTypes: true })) {
    if (f.isDirectory()) copyDir(join(src, f.name), join(dest, f.name));
    else copyFileSync(join(src, f.name), join(dest, f.name));
  }
}

for (const deck of decks) {
  const out = join(ROOT, deck.slug);
  const comp = join(out, "composition");
  mkdirSync(join(comp, "vendor"), { recursive: true });
  mkdirSync(join(out, "vendor"), { recursive: true });
  copyFileSync(join(VENDOR, "gsap.min.js"), join(comp, "vendor", "gsap.min.js"));
  copyDir(join(VENDOR, "fonts"), join(comp, "vendor", "fonts"));
  copyFileSync(join(VENDOR, "hyperframes-player.global.js"), join(out, "vendor", "hyperframes-player.global.js"));
  copyFileSync(join(VENDOR, "hyperframes-slideshow.global.js"), join(out, "vendor", "hyperframes-slideshow.global.js"));

  const { dir, shots } = loadShots(deck);
  if (shots.length) {
    mkdirSync(join(comp, "assets"), { recursive: true });
    for (const s of shots) copyFileSync(join(dir, s.file), join(comp, "assets", s.file));
  }

  writeFileSync(join(comp, "index.html"), composition(deck, shots));
  writeFileSync(join(out, "index.html"), wrapper(deck));
  console.log(`built ${deck.slug}: 5 slides, ${shots.length} screenshot(s)`);
}
writeFileSync(join(ROOT, "index.html"), landing());
