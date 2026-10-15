# 小格的心愿指引 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an installable, privacy-first iPhone web app that lets Xiaoge describe a dilemma in detail and receive reflective guidance inspired by tarot, the I Ching, and her birth profile.

**Architecture:** A dependency-free progressive web app stores profile and history in localStorage, calculates deterministic guidance locally, and caches its shell with a service worker. A pure JavaScript decision engine is separated from DOM code so its scoring and edge cases can be tested with Node's built-in test runner.

**Tech Stack:** HTML5, CSS, ES modules, localStorage, Web App Manifest, Service Worker, Node.js built-in tests.

## Global Constraints

- The private birth profile supplied by the owner must never be embedded in the public build or repository.
- All personal content remains on-device in v1; there is no account, analytics, or backend.
- The visual language is original pastel kawaii design and does not copy trademarked characters.
- Guidance is reflective entertainment, not medical, financial, legal, or safety advice.
- The primary viewport is iPhone Safari from 375 px to 430 px wide.

---

### Task 1: Decision engine

**Files:**
- Create: `src/decision-engine.mjs`
- Test: `tests/decision-engine.test.mjs`

**Interfaces:**
- Consumes: `{ question, context, feelings, priorities, options }` form data.
- Produces: `validateDecision(input)`, `buildGuidance(input)`, and `safetyCategory(text)`.

- [ ] Write tests for validation, deterministic results, multi-option ranking, and high-stakes warnings.
- [ ] Run the tests and confirm they fail before implementation.
- [ ] Implement the smallest deterministic scoring and guidance engine.
- [ ] Run the tests and confirm they pass.

### Task 2: Mobile decision flow

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `src/app.js`

**Interfaces:**
- Consumes: decision-engine exports and form events.
- Produces: an accessible multi-step form, ranked result view, detail cards, history, and share/copy actions.

- [ ] Build the semantic form with detailed context, feelings, priorities, and 2-4 options.
- [ ] Add inline validation, progress feedback, loading state, result navigation, and empty history state.
- [ ] Render a recommendation with rational reflection, tarot prompt, I Ching prompt, action step, and safety notice.
- [ ] Verify keyboard, focus, reduced-motion, contrast, and touch target behavior.

### Task 3: Installable private PWA

**Files:**
- Create: `manifest.webmanifest`
- Create: `sw.js`
- Create: `assets/icon.svg`
- Create: `assets/apple-touch-icon.svg`

**Interfaces:**
- Consumes: the static application shell.
- Produces: standalone display metadata, home-screen icon, and offline shell caching.

- [ ] Add manifest metadata and iOS web-app meta tags.
- [ ] Add a cache-first service worker for local static files.
- [ ] Persist profile and history locally and provide a clear-history control.
- [ ] Verify offline reload after one successful online visit.

### Task 4: Verification and handoff

**Files:**
- Create: `package.json`
- Create: `README.md`

**Interfaces:**
- Consumes: the completed static PWA.
- Produces: repeatable test/start commands and iPhone installation instructions.

- [ ] Run the full Node test suite with zero failures.
- [ ] Serve the app locally and inspect 375x812 and 430x932 layouts.
- [ ] Check manifest and service-worker registration from a secure/local origin.
- [ ] Document deployment and Safari “Add to Home Screen” installation steps.
