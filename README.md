# Design Conform

**Vibe-code prototypes, then keep them on-system.**

Design Conform is a bring-your-own-AI prototyping tool with a built-in design-system and accessibility checker. Describe what you want in natural language, let your AI generate a working front-end prototype, then run the checker to see exactly what's on-system, what drifted off it, and how to bring the strays back in.

The goal: let a founder or designer hand engineers a **fully-built, standards-checked front end** instead of a static mockup.

[//]: # (TODO: Add a hero GIF here showing the full loop — prompt → prototype → checker → fix suggestion.)

---

## Why this exists

AI can generate UI in seconds. That's the problem.

When everyone vibe-codes, design systems fracture quietly — off-standard components, inconsistent spacing, accessibility gaps that nobody catches until they're in production. Documentation doesn't scale against a tool that generates a screen in ten seconds, and a manual review gate kills the speed that made AI worth using.

Design Conform closes that gap at the source. It lets you move at AI speed **and** keep the system intact, by making drift visible the moment it happens and giving you a one-click path to fix it.

---

## How it works

**1. Browse the library.**
A full catalog of approved components (built on [daisyUI](https://daisyui.com/) + Tailwind as the example system) — live previews, copyable code, variants, and usage notes. This library is the source of truth the checker measures against.

**2. Vibe-code a prototype.**
Describe a screen or flow in plain language. Your AI generates a real, working front-end prototype — preferring approved library components by default, but free to build custom ones when needed. Iterate conversationally: "make the header sticky," "add a pricing table."

**3. Run the checker.**
Every prototype has two tabs: **Prototype** (the live view) and **Component Checker** (the audit). The checker reports:

- **On-system count** — components used that are part of the approved library
- **Off-system count** — components that were vibe-coded / custom (drift)
- **Per-component breakdown** — which is which, and where each lives in the code
- **Fix prompts** — for every off-system component, a copy-pasteable prompt you can send to your AI to rebuild it using approved patterns and adopt it into the library
- **Accessibility audit** — WCAG 2.2 checks: alt text, color contrast, labels/ARIA, semantic markup, focus/keyboard order, heading structure

**4. Hand it off.**
Export a finished prototype as clean, production-ready front-end code plus a generated spec describing what's included and which standards it passed.

[//]: # (TODO: Add a screenshot of the Component Checker tab showing the on-system / off-system breakdown and a fix prompt.)

---

## Bring your own AI

Design Conform is model-agnostic and requires **your own AI key** — nothing is bundled or hosted.

- Add your key (Claude or OpenAI/Codex supported to start) in the settings panel.
- Your key is stored **only in your browser** and sent only to the provider you choose. It never touches a server here.
- The **library, checker, and standards** sections work fully without a key. Only the vibe-coding generation is gated behind adding one.

See [Getting Started](#getting-started) for where to get a key.

---

## Getting started

```bash
git clone https://github.com/relishink/design-conform.git
cd design-conform
npm install
npm run dev
```

Then open the local URL, go to **Settings**, and paste in your AI key:
- **Claude** — get a key at [console.anthropic.com](https://console.anthropic.com/)
- **OpenAI / Codex** — get a key at [platform.openai.com](https://platform.openai.com/)

No key? You can still browse the component library, run the checker on example prototypes, and read the standards. Vibe-coding unlocks once a key is added.

---

## The standards

The checker enforces a **modular, configurable** rule set. Rules live in one place, and the checker reads from them — so adding or adjusting a rule updates the checker everywhere.

- **Accessibility** — WCAG 2.2 (contrast, alt text, labels/ARIA, semantics, focus order, heading structure)
- **Design tokens** — spacing, color, and type scale conformance
- **Component usage** — approved-library vs. custom detection

Rules live in [`src/checker/rules/`](src/checker/rules/), one module each. The **Standards** page
renders that same array, so a rule cannot be documented without being executed — or executed
without being documented. Adding a rule publishes it.

The component library in [`src/system/`](src/system/) works the same way: it is the single source
the catalog renders, the AI system prompt is generated from, and the checker measures against.

---

## Tech stack

- **React + Vite + TypeScript**
- **Tailwind CSS + daisyUI** (example component library / source of truth)
- Client-side; prototypes saved via browser storage
- AI generation via a small provider interface (bring-your-own-key), so new models are easy to add

---

## Roadmap

- [x] Phase 1 — Component library + catalog
- [x] Phase 2 — Vibe-coding prototyping surface
- [x] Phase 3 — Component checker + drift-to-prompt loop + standards engine
- [x] Phase 4 — Handoff / export
- [ ] Additional example design systems beyond daisyUI
- [ ] Automated regression tests for the rule set
- [ ] Richer drift detection (hand-rolled tabs, modals, navbars)

---

## Contributing

Contributions welcome — especially new checker rules and additional design-system adapters. [//]: # (TODO: Add CONTRIBUTING.md and issue templates.)

---

## License

MIT — see [LICENSE](LICENSE).

---

## About

Built by **David Roddy**, Senior Product Designer & Design Technologist.
[davidroddy.com](https://www.davidroddy.com) · [Dribbble](https://dribbble.com/DavidRoddy)

Design Conform is an exploration of what design systems become when AI writes the UI: not a static library, but an active guardrail that keeps quality and consistency intact at machine speed.
