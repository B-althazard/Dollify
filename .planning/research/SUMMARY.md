# Project Research Summary

**Project:** Dollify
**Domain:** Mobile-first adult AI character creation and prompt-generation web app
**Researched:** 2026-03-29
**Confidence:** MEDIUM-HIGH

## Executive Summary

Dollify should be built as a **static-first, local-first, client-heavy creator app** whose real product value is not generic image generation but a **schema-driven character builder** that outputs reliable, model-aware prompt packages. The research is consistent across stack, features, architecture, and pitfalls: experts would avoid a backend-heavy foundation early, keep one canonical creator state, centralize rule evaluation, and validate prompt quality before spending time or money on direct provider integration.

The recommended approach is a **React 19 + TypeScript + Vite SPA** with **Zustand** for canonical state, **Zod** for schema/runtime safety, **Dexie/IndexedDB** for local persistence, and **Tailwind v4 + Radix + Motion** for a mobile-first interface. Phase 1 should stay entirely client-side, deploy on GitHub Pages, and use a clipboard/userscript bridge for external generation. That gives cheap validation while preserving the architectural seam needed to swap in direct API generation later.

The main risks are architectural drift and false confidence in browser automation. If schema semantics leak into prompt syntax, if rules are duplicated across UI/randomize/prompt paths, or if gallery/preset data lacks versioned provenance, the app will become unreliable fast. Mitigate that by locking a semantic schema contract early, building one shared rule/normalization pipeline, storing reproducible metadata with every artifact, using IndexedDB instead of localStorage for real data, and treating Phase 2 automation/provider work as explicit research spikes rather than guaranteed delivery.

## Key Findings

### Recommended Stack

The stack research strongly favors a **Vite-based React SPA**, not Next.js or another fullstack framework, because this product is static-first, local-first, and heavily driven by client state rather than SSR. The technical center of gravity is a reliable creator pipeline: schema definitions, shared rules, prompt assembly, local persistence, and mobile interaction polish.

**Core technologies:**
- **Node 22 LTS + Vite 8 + React 19 + TypeScript 6**: modern static SPA baseline — fastest path to a maintainable greenfield app without server lock-in.
- **React Router 7**: light routing and route-based splitting — enough structure for a multi-surface SPA without introducing backend coupling.
- **Zustand**: canonical creator store — low ceremony fit for one engine-centric state graph.
- **Zod**: runtime validation — protects external JSON schema, presets, imports, and provider configs from drift.
- **Dexie + dexie-react-hooks**: IndexedDB persistence — required for presets, gallery items, prompt history, and blobs.
- **Tailwind CSS v4 + Radix primitives + Motion**: custom mobile-first UI stack — better fit than dashboard component kits for swipe-heavy creator workflows.
- **vite-plugin-pwa + Workbox**: installable shell and offline-safe caching — good for mobile resilience, but should not be treated as correctness infrastructure.
- **Vitest + Testing Library + Playwright + Biome**: rule, prompt, and mobile flow quality stack — especially important for regression-proofing prompt/rule behavior.

**Critical version requirements:**
- Use **Node 22 LTS** as baseline.
- Use **React 19 / react-dom 19** and **Vite 8**.
- Use **Tailwind CSS v4** with the first-party Vite plugin.

### Expected Features

The research is clear that Dollify's MVP is **not** a prompt textbox with a generate button. Table stakes in this niche are structured persona definition, repeatability, saved state, prompt portability, and fast mobile iteration. Dollify differentiates by turning structured creator input itself into the product.

**Must have (table stakes):**
- Structured character attribute selection across identity, face, body, styling, pose, and conditional futa fields.
- Model-aware prompt package generation including positive prompt, negative prompt, and generation guidance.
- Save/load presets using full creator state, not just raw prompts.
- Local gallery/history with metadata-backed tap-to-reload.
- Copy/export prompt package for external generation flows.
- Random variation support, ideally lock-aware from the start.
- Mobile-first UI with sticky high-frequency actions.
- Local persistence so refreshes do not destroy work.

**Should have (competitive differentiators):**
- Conflict-aware schema-driven flow with no free-text core authoring.
- Lock-aware constrained randomization for useful variations.
- Model-specific prompt engine with settings/style advice.
- Gallery-driven character continuity and reusable creator snapshots.
- Clipboard + ViolentMonkey bridge for low-cost end-to-end validation.
- Preset thumbnails from latest render for fast mobile browsing.

**Defer (v2+):**
- Direct API generation.
- Reference-image-assisted consistency workflows.
- Advanced generation advice and model optimization depth.
- Batch actions, bulk export, and light edit hooks like upscale/inpaint.
- Accounts, sync, social/community, marketplace, video, or chat/companion features.

### Architecture Approach

The architecture research recommends a **single-state, rule-driven, schema-rendered client app** organized around one canonical creator state and a clean domain pipeline: **schema -> rules -> canonical state -> prompt package -> generation bridge -> gallery**. The product should be built from domain engines, not from generic form-library assumptions.

**Major components:**
1. **Schema Registry** — versions form schema, rule config, and model configs as external assets.
2. **Creator Store** — owns canonical `formValues`, locks, selected model/style, derived rule state, prompt package, and generation status.
3. **Rule Engine** — computes visibility, conflicts, normalization, max-selection rules, and derived synergies.
4. **Form Engine** — renders schema-driven controls and dispatches edits, but does not own rule logic.
5. **Prompt Engine** — maps semantic creator state into model-specific prompt packages and advice.
6. **Randomize Engine** — produces valid variations by reusing the same normalization path as manual edits.
7. **Generation Bridge** — abstracts clipboard, userscript, and future API generation behind one result contract.
8. **Gallery + Preset Repositories** — persist reproducible artifacts separately, with full metadata/versioning.

**Key patterns to follow:**
- Persist canonical inputs; derive disabled/visible/synergy state.
- Force manual edits, preset loads, and randomization through one normalization pipeline.
- Assemble prompts semantically first, then render model-specific syntax.
- Treat generation as adapters, not product core.
- Save enough metadata with each image to fully reconstruct creator state later.

### Critical Pitfalls

The pitfalls research is unusually aligned with the architecture guidance: the biggest risk is responsibility leaking into the wrong layer. If that happens, the app may look finished while becoming impossible to trust.

1. **Letting schema become the prompt engine** — keep schema semantic; put ordering, weighting, negatives, and model syntax in prompt/model config layers.
2. **Duplicating rule logic across UI, randomizer, and prompt code** — centralize one shared rule evaluator and normalization pass.
3. **No canonical normalized persisted state** — define versioned snapshot contracts early and recompute derived state on load.
4. **Treating localStorage like a database** — use IndexedDB for images, presets, and history; reserve localStorage for tiny UI flags.
5. **Skipping prompt evaluation harnesses** — create a benchmark preset corpus and golden prompt outputs before heavy tuning.
6. **Assuming clipboard/userscript automation is stable** — prototype against a real browser/device matrix and always keep explicit copy fallback.
7. **Shipping PWA caching without update discipline** — version mutable schema/config assets and test upgrade paths.

## Implications for Roadmap

Based on the combined research, the roadmap should follow dependency order, not visible UI order. The correct sequence is to stabilize semantics and rules first, prove prompt quality second, then add variation and reproducibility loops before touching fragile integration work.

### Phase 1: Schema + State Backbone
**Rationale:** Every later capability depends on stable semantic inputs and one canonical creator state.
**Delivers:** Versioned schema registry, canonical store, shared rule engine, minimal schema-rendered mobile form shell, migration hooks, and persistence contracts.
**Addresses:** Structured character builder, conflict/rule evaluation, mobile-first creator foundation.
**Avoids:** Schema/prompt coupling, duplicated rule logic, no canonical state, migration failures.

### Phase 2: Prompt Pipeline + Evaluation Harness
**Rationale:** Prompt quality is the core value proposition and should be validated before generation integration.
**Delivers:** Semantic normalization, model config registry, prompt package output, negative prompt strategy, copy/export actions, benchmark preset corpus, golden prompt tests.
**Addresses:** Model-aware prompt generation, copy/export portability, settings/style guidance.
**Avoids:** Subjective prompt tuning, model logic leaking into UI, regressions without signal.

### Phase 3: Locking + Constrained Randomization
**Rationale:** Randomization only matters once state validity and prompt output are trustworthy.
**Delivers:** Lock model, variation/full randomize modes, weighted distributions, shared normalization reuse.
**Addresses:** Random variation support, creator-speed exploration, preserve-intent workflows.
**Avoids:** Valid-but-useless random outputs, lock drift, inconsistent behavior across edit paths.

### Phase 4: Persistence + Gallery + Presets
**Rationale:** This is where Dollify becomes genuinely useful for repeatable creator workflows.
**Delivers:** Dexie repositories, save/load presets, gallery/history, full provenance metadata, thumbnails, tap-to-reload, export/import basics, storage health handling.
**Addresses:** Save/load presets, gallery/history, tap image to reload settings, local persistence, preset thumbnails.
**Avoids:** localStorage quota failures, lost reproducibility, broken reloads, silent browser-storage loss.

### Phase 5: Clipboard / UserScript Generation Bridge
**Rationale:** End-to-end validation should happen cheaply before backend or provider commitments.
**Delivers:** Clipboard adapter, normalized generation result contract, supported userscript adapter(s), gallery ingest from external generation, browser/device support matrix.
**Addresses:** Generate action, clipboard-first external generation flow, low-cost validation loop.
**Avoids:** Overpromising automation reliability, brittle one-off scripting, desktop-only validation.

### Phase 6: PWA Installability + Update Safety
**Rationale:** Installability improves mobile stickiness, but only after core workflows are stable.
**Delivers:** App manifest, shell caching, conservative config/schema caching strategy, update notifications, upgrade-path testing.
**Addresses:** Installable/offline-safe mobile shell.
**Avoids:** Stale cached rules/configs and split-brain app behavior across deploys.

### Phase 7: Direct API Adapter
**Rationale:** API generation should be a bridge swap, not an architectural pivot.
**Delivers:** Provider adapter layer, secure proxy plan if needed, async job handling, normalized result ingestion into the same gallery path.
**Addresses:** Direct API generation, future provider expansion.
**Avoids:** Vendor lock-in, policy surprises turning into rewrites, mixing provider specifics into core engines.

### Phase Ordering Rationale

- **Rules before polish:** The real foundation is semantic schema + canonical state + shared rules, not UI completeness.
- **Prompt quality before generation spend:** Bad prompts become expensive once attached to external generation.
- **Reproducibility before integrations:** Gallery/preset metadata is core product infrastructure, not a nice-to-have.
- **Adapters before providers:** External generation methods should swap behind one interface, not reshape the app.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5:** clipboard/userscript automation is browser-, permission-, and site-specific; needs a prototype spike.
- **Phase 7:** adult-content provider/policy viability is still low-confidence and needs targeted vendor research before commitment.
- **Late Phase 4 / early Phase 5:** storage durability on Safari/iOS/private-mode needs validation with real-device testing.

Phases with standard patterns (skip research-phase):
- **Phase 1:** canonical state, semantic schema contracts, rule-engine-first design, and versioned persistence are well supported by the research.
- **Phase 2:** prompt pipeline contracts and evaluation harness structure are clear enough to plan directly.
- **Phase 6:** Vite PWA/installability patterns are standard, provided update/versioning discipline is included.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based heavily on current official React, Vite, Node, Tailwind, Dexie, and PWA docs with concrete version guidance. |
| Features | MEDIUM | Core creator expectations are well supported, but adult-creator-specific workflow prioritization is more strategic than officially documented. |
| Architecture | MEDIUM-HIGH | Strong internal consistency and solid browser/platform references, though some engine boundaries remain opinionated design choices. |
| Pitfalls | MEDIUM-HIGH | Storage, clipboard, service worker, and migration risks are strongly documented; adult-content provider risk remains low-confidence and must be validated later. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Provider viability for adult workflows:** validate allowed content, API stability, billing, and moderation behavior before promising direct generation support.
- **Exact mobile browser/userscript matrix:** prove clipboard and automation flows on target devices, especially Safari/iOS.
- **Schema taxonomy depth:** the female/futa-focused content model is directionally clear, but detailed option/rule coverage still needs product-authoring work.
- **Prompt quality benchmark design:** define representative archetypes and acceptance criteria early so tuning stays measurable.
- **Local data durability UX:** decide how export/import, persistence requests, quota warnings, and recovery messaging appear in-product.

## Sources

### Primary (HIGH confidence)
- React docs/blog — React 19 baseline, state guidance, and CRA deprecation/Vite direction.
- Vite docs — static deployment and SPA/PWA compatibility.
- Node.js release guidance — Node 22 LTS baseline.
- Tailwind CSS v4 docs/blog — current styling baseline and Vite integration.
- React Router docs — modern client routing patterns.
- Dexie docs + MDN IndexedDB/localStorage docs — local-first persistence split.
- Vite PWA / Workbox docs + MDN Service Worker docs — installability and caching patterns.
- MDN Clipboard API, storage quotas/eviction, and Violentmonkey docs — automation/storage constraints.

### Secondary (MEDIUM confidence)
- NovelAI docs — character creation, history, randomization, and consistency expectations.
- OpenArt and SeaArt product pages — market expectations for AI character tooling.
- Zustand, Zod, Motion, Biome docs — implementation guidance aligned with the recommended stack.
- Internal project docs: `.planning/PROJECT.md`, `resources/_theIdeaScribble.md`, `resources/brainstorm-v5.md`, `resources/VixenLabs_ArchSpec_v1.md`.

### Tertiary (LOW confidence)
- Discovery/search sampling for broader 2026 character-generator ecosystem patterns.
- Adult-content vendor/platform assumptions for future API support; must be re-researched per provider.

---
*Research completed: 2026-03-29*
*Ready for roadmap: yes*
