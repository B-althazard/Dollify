# Technology Stack

**Project:** Dollify  
**Focus:** Stack research for a mobile-first adult AI character creation + prompt-generation web app  
**Researched:** 2026-03-29  
**Scope:** Greenfield, static-first, local-first, later image-provider bridge

## Recommended Stack

This should be built as a **client-heavy React SPA with a strict local-first data model**, shipped as static assets first and only introducing a thin server/proxy later when direct image-provider APIs become necessary.

The right default stack is:

- **React 19 + TypeScript + Vite** for a modern SPA without server lock-in
- **React Router 7** for route-based code splitting and future data-loading patterns
- **Zustand + Dexie + Zod** for the three real product needs: reactive app state, persistent local data, and schema safety
- **Tailwind CSS v4 + Radix primitives + Motion** for fast mobile UI work without buying into a bulky component framework
- **vite-plugin-pwa + Workbox** for installability and offline shell behavior
- **GitHub Pages first**, then **Vercel/Netlify/Cloudflare Pages** when the product outgrows Pages

---

## Core Application Stack

| Layer | Technology | Version | Confidence | Why this is the right choice |
|---|---:|---:|---|---|
| Runtime | Node.js | 22 LTS | HIGH | Vite 8 requires modern Node, and Node recommends production apps use LTS releases. Node 22 is the safest baseline for broad 2025-style compatibility without chasing newest-runtime churn. |
| Language | TypeScript | 6.0.2 | HIGH | This app is schema-heavy and rule-heavy. TypeScript is not optional here; it prevents the form/prompt/randomization engines from drifting apart. |
| UI framework | React | 19.2.4 | HIGH | React 19 is current stable and fits a highly interactive mobile SPA well. The app is mostly client state, gestures, conditional UI, and local persistence. |
| DOM renderer | react-dom | 19.2.4 | HIGH | Standard pairing with React 19. |
| Build tool | Vite | 8.0.3 | HIGH | React officially deprecated CRA and points new apps toward frameworks or build tools like Vite. For a static-first app with no backend, Vite is the simplest high-performance fit. |
| React plugin | @vitejs/plugin-react-swc | 4.3.0 | MEDIUM | SWC keeps dev feedback fast and build config light. Good fit for a greenfield Vite app where startup speed matters. |
| Router | react-router | 7.13.2 | HIGH | You still need routing, lazy loading, and URL-driven state even in a static SPA. React Router 7 gives modern routing without forcing a server framework too early. |

### Prescriptive recommendation

Use **Vite + React Router data/declarative mode**, not Next.js.

Why:

- the product starts as a **static SPA**
- the first milestones are **client-only**
- local persistence matters more than SSR
- GitHub Pages deployment matters more than server features

If the later provider bridge requires secure key handling, add a **small API proxy service later** instead of prematurely adopting a fullstack framework now.

---

## State, Validation, and Local Persistence

| Layer | Technology | Version | Confidence | Why this is the right choice |
|---|---:|---:|---|---|
| App state | zustand | 5.0.12 | MEDIUM | The app has a single central, reactive `appState` shape across `formEngine`, `promptEngine`, and `randomizeEngine`. Zustand matches that model cleanly without Redux ceremony. |
| Runtime validation | zod | 4.3.6 | HIGH | External JSON schemas, persisted presets, provider configs, and future imports all need runtime validation. Zod 4 is stable and TS-first. |
| Browser DB | dexie | 4.4.1 | HIGH | Gallery images, presets, prompt history, and metadata belong in IndexedDB, not localStorage. Dexie gives a real IndexedDB abstraction and React-friendly patterns. |
| React DB hooks | dexie-react-hooks | 4.4.0 | HIGH | Keeps gallery/preset views reactive across tabs and refreshes with minimal glue code. |

### Prescriptive recommendation

Model persistence in two tiers:

1. **Dexie / IndexedDB** for presets, gallery items, prompt history, and cached assets  
2. **localStorage** only for tiny UI flags like theme, onboarding state, or last-selected model

Do **not** make localStorage the primary database. This app will store structured objects and image metadata; localStorage is too small, too fragile, and too awkward to query.

---

## UI, Styling, Mobile Interaction

| Layer | Technology | Version | Confidence | Why this is the right choice |
|---|---:|---:|---|---|
| Styling system | tailwindcss | 4.2.2 | HIGH | Tailwind v4 is the current standard utility stack and is especially good for fast mobile-first iteration and tokenized visual systems. |
| Vite integration | @tailwindcss/vite | 4.2.2 | HIGH | Tailwind v4 ships a first-party Vite plugin; use the native integration instead of older PostCSS-heavy setup. |
| Accessible primitives | @radix-ui/react-dialog | 1.1.15 | MEDIUM | Use Radix primitives for hard UI problems like sheets/dialogs rather than hand-rolling accessibility. |
| Accessible primitives | @radix-ui/react-tabs | 1.1.13 | MEDIUM | Useful for mobile category switching in the creator flow. |
| Accessible feedback | @radix-ui/react-toast | 1.2.15 | MEDIUM | Good fit for copy-to-clipboard confirmations and generation/save feedback. |
| Animation + gestures | motion | 12.38.0 | HIGH | This app explicitly needs mobile-first interactions and swipe behavior. Motion gives React-native-feeling drag/tap/transition APIs without custom gesture plumbing. |

### Prescriptive recommendation

Use **Tailwind as the styling foundation**, **Radix as the behavior primitive layer**, and **Motion for touch-driven interaction polish**.

That combination is better than adopting a full component framework because this product needs:

- a distinctive adult-creator visual identity
- bottom sheets, swipe patterns, and prompt cards tuned for phones
- custom form controls tied to schema logic

This is **not** a dashboard that benefits from MUI/Ant Design defaults.

---

## Offline, Installability, and Static Delivery

| Layer | Technology | Version | Confidence | Why this is the right choice |
|---|---:|---:|---|---|
| PWA plugin | vite-plugin-pwa | 1.2.0 | HIGH | The app must feel installable and survive flaky mobile connectivity. This is the standard way to add manifest + service worker to Vite apps. |
| Service worker runtime | workbox-core / workbox-window | 7.4.0 | HIGH | Workbox is the mature service-worker foundation underneath the PWA plugin. |
| Initial hosting | GitHub Pages + GitHub Actions | current platform | HIGH | Matches the repo constraint: near-zero hosting cost and static deployment first. |
| Later hosting | Vercel / Netlify / Cloudflare Pages | current platforms | MEDIUM | All fit the same static build output when GitHub Pages becomes limiting. |

### Prescriptive recommendation

Start with:

- **GitHub Pages** for zero-cost validation
- **vite-plugin-pwa** for app shell caching and installability
- **static asset deployment only** in Phase 1

Then move later to **Cloudflare Pages or Vercel** if you need better preview workflows, custom headers, edge proxying, or provider-bridge support.

---

## Testing and Quality Stack

| Layer | Technology | Version | Confidence | Why this is the right choice |
|---|---:|---:|---|---|
| Unit/integration test runner | vitest | 4.1.2 | HIGH | Natural fit with Vite. Fast enough to make schema rule testing part of daily work. |
| Component testing | @testing-library/react | 16.3.2 | HIGH | Best fit for validating real user behavior in conflict-aware form flows. |
| E2E/mobile browser tests | playwright | 1.58.2 | HIGH | Critical for mobile-first flows, clipboard interactions, service-worker behavior, and swipe UX. |
| Lint/format | @biomejs/biome | 2.4.9 | MEDIUM | Greenfield projects benefit from one fast tool for lint + format instead of maintaining separate ESLint + Prettier stacks. |

### Prescriptive recommendation

The highest-value tests for this product are:

1. **schema rule tests** for conflicts, disabled fields, and conditional categories  
2. **prompt assembly tests** per model/provider adapter  
3. **randomization invariant tests** to prove locked fields and invalid combos never leak  
4. **Playwright mobile flows** for copy/generate/save/load behavior

---

## Observability and Later API Bridge

| Layer | Technology | Version | Confidence | Why this is the right choice |
|---|---:|---:|---|---|
| Client error monitoring | @sentry/react | 10.46.0 | MEDIUM | When the app is mostly client-side, silent mobile failures are expensive. Sentry is the standard default if you want crash visibility. |
| Provider integration style | Custom REST adapter layer | n/a | MEDIUM | Do not bind the app directly to one vendor SDK early. Build a provider-agnostic adapter boundary so Phase 2 can bridge to Replicate/Stability/custom endpoints without rewriting the engines. |

### Prescriptive recommendation

For Phase 1, keep generation external via clipboard + ViolentMonkey.  
For Phase 2, add a **thin provider adapter module** with this shape:

- `buildRequest(promptPackage, providerConfig)`
- `submitJob()`
- `pollJob()`
- `normalizeResult()`

Do not let provider payload formats leak into `formEngine` or `promptEngine`.

---

## What NOT to Use

| Avoid | Why not |
|---|---|
| **Create React App** | React officially sunset CRA for new apps in 2025. Wrong starting point. |
| **Next.js / Remix as the initial foundation** | Overkill for a static-first, local-first, client-heavy first milestone. They solve problems this project explicitly wants to defer. |
| **Redux Toolkit as the primary app store** | Too much ceremony for a single local-first state graph. Zustand is a better fit for the engine-centric architecture. |
| **React Hook Form as the main form engine** | The core flow is not a normal CRUD form. It is a schema-driven rule engine with dynamic disabling, category toggling, locks, and randomization. Build the form layer yourself on top of typed state. |
| **localStorage-only persistence** | Fine for tiny flags, bad for gallery data and structured presets. Use IndexedDB via Dexie. |
| **MUI / Ant Design as the default component system** | Their visual language fights a custom mobile-first creator product and adds weight you do not need. |
| **shadcn/ui as the primary architecture** | Good for copying components, not a good architectural center for a deeply custom schema-rendered app. Use Radix/Tailwind directly instead. |
| **Hand-written service worker first** | Too easy to get caching wrong. Use vite-plugin-pwa/Workbox first. |
| **Direct provider SDK lock-in in Phase 1** | It couples product validation to vendor API churn and secret management too early. |

---

## Recommended Installation

```bash
# app core
npm install react@19.2.4 react-dom@19.2.4 react-router@7.13.2 zustand@5.0.12 zod@4.3.6 dexie@4.4.1 dexie-react-hooks@4.4.0 motion@12.38.0

# ui primitives
npm install @radix-ui/react-dialog@1.1.15 @radix-ui/react-tabs@1.1.13 @radix-ui/react-toast@1.2.15

# dev/build
npm install -D typescript@6.0.2 vite@8.0.3 @vitejs/plugin-react-swc@4.3.0 tailwindcss@4.2.2 @tailwindcss/vite@4.2.2 vite-plugin-pwa@1.2.0 workbox-window@7.4.0

# testing/quality
npm install -D vitest@4.1.2 @testing-library/react@16.3.2 playwright@1.58.2 @biomejs/biome@2.4.9

# optional production monitoring
npm install @sentry/react@10.46.0
```

---

## Final Recommendation

If roadmap creation needs one concise answer, use this:

> **Build Dollify as a Vite + React 19 + TypeScript SPA, with React Router for navigation, Zustand for engine state, Zod for runtime safety, Dexie for local-first persistence, Tailwind v4 + Radix + Motion for the mobile UI, and vite-plugin-pwa for installable static delivery. Keep Phase 1 entirely client-side on GitHub Pages, and add a thin provider-proxy layer later instead of adopting a server framework now.**

This is the standard 2025-style stack for this product because it optimizes for:

- **cheap validation now**
- **strong client-side engine architecture**
- **good mobile UX**
- **offline/local-first behavior**
- **future provider integration without a rewrite**

---

## Sources

- React blog: CRA deprecated, Vite/framework guidance — https://react.dev/blog/2025/02/14/sunsetting-create-react-app _(HIGH)_
- React blog index / current React 19.x releases — https://react.dev/blog _(HIGH)_
- Vite docs: current guide and static deployment guidance — https://vite.dev/guide/ and https://vite.dev/guide/static-deploy _(HIGH)_
- Node.js releases / LTS guidance — https://nodejs.org/en/about/previous-releases _(HIGH)_
- Tailwind CSS v4 announcement and first-party Vite plugin — https://tailwindcss.com/blog/tailwindcss-v4 _(HIGH)_
- React Router docs (v7 current) — https://reactrouter.com/home _(HIGH)_
- Dexie React docs — https://dexie.org/docs/Tutorial/React _(HIGH)_
- Zod docs (Zod 4 stable) — https://zod.dev/ _(HIGH)_
- Vite PWA docs — https://vite-pwa-org.netlify.app/guide/ _(HIGH)_
- Motion for React docs — https://motion.dev/docs/react _(HIGH)_
- Biome docs — https://biomejs.dev/ _(MEDIUM)_
- npm registry versions checked on 2026-03-29 for package pinning _(MEDIUM)_
