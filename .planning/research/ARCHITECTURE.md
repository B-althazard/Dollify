# Architecture Patterns

**Domain:** Adult AI character creation web app  
**Project:** Dollify  
**Researched:** 2026-03-29  
**Confidence:** MEDIUM-HIGH

## Recommended Architecture

Build this as a **static-first client application with a small set of domain modules around one canonical creator state**.

Recommended shape:

```text
Static React/Vite App
├── Shell/UI Layer
│   ├── Mobile navigation / category tabs / swipe containers
│   ├── Schema-rendered field components
│   ├── Prompt preview + settings panel
│   ├── Gallery / preset browser
│   └── Generation controls
│
├── Application Store (single canonical state)
│   ├── formValues
│   ├── locks
│   ├── derived rule state
│   ├── selected model + style
│   ├── prompt package
│   └── generation / gallery status
│
├── Domain Engines
│   ├── schemaRegistry
│   ├── ruleEngine
│   ├── formEngine
│   ├── randomizeEngine
│   ├── promptEngine
│   └── validation/serialization layer
│
├── Persistence Layer
│   ├── localStorage for light preferences/locks/ui state
│   ├── IndexedDB for images, presets, prompt history, metadata
│   └── import/export backup utilities
│
└── Generation Bridge Layer
    ├── clipboard adapter
    ├── ViolentMonkey bridge adapter
    ├── future direct API adapter
    └── normalized generation result writer
```

This should **not** be a generic form app. The core should be a **domain-specific creator pipeline**:

`schema -> rules -> canonical state -> prompt package -> generation bridge -> gallery`

## Major Components

### 1. App Shell
**Responsibility:** Route-free or light-route mobile shell, installable/static behavior, layout, swipe navigation, offline-safe boot.

**Why:** The app is mobile-first and static-hosted, so the shell must load fast and work even when generation is unavailable.

### 2. Schema Registry
**Responsibility:** Load and version external JSON assets for categories, fields, options, rule metadata, presets, and model configs.

**Why:** Product expansion depends on adding/changing creator options without rewriting UI code.

**Keep separate:**
- `formSchema.json` - fields/options/render hints
- `ruleConfig.json` or embedded rule objects - visibility/disable/synergy/conflicts
- `modelConfigs.json` - model capabilities, prompt templates, style support, settings advice

### 3. Creator Store
**Responsibility:** Hold the single canonical state object for the app.

**Recommended state slices:**
- `formValues`
- `locks`
- `derived.disabledFields`
- `derived.visibleCategories`
- `derived.synergyTags`
- `ui.selectedModel`
- `ui.selectedStyle`
- `promptPackage`
- `gallerySelection`
- `generationStatus`

**Opinionated recommendation:** use a **single client store with action methods**, not scattered component state. React guidance favors deliberate state structure, and Zustand is a good fit for a centralized but low-boilerplate store. Confidence: MEDIUM.

### 4. Rule Engine
**Responsibility:** Evaluate schema rules whenever state changes.

**Handles:**
- conditional visibility (`futa` reveals futa-only sections)
- disabling/clearing incompatible fields (`bald` disables hair length/color)
- required-field validity
- max-selection enforcement
- synergy tags (`blue + green eyes -> heterochromia`)
- normalization after preset load/randomize

**Important boundary:** the rule engine should produce **derived state**, not UI side effects. UI reads rule results; it should not own rule logic.

### 5. Form Engine
**Responsibility:** Render the creator UI from schema + store state.

**Sub-parts:**
- field renderer registry (`single-select`, `multi-select`, `image-button`, `color-swatch`, `slider`)
- category renderer
- lock controls
- validation surface
- state dispatchers

**Important boundary:** formEngine renders and dispatches; ruleEngine decides validity.

### 6. Randomize Engine
**Responsibility:** Generate valid variations from the current creator state.

**Modes:**
- variation randomize: change unlocked fields only
- full randomize: rebuild unlocked state from scratch

**Pipeline:**
1. read current state
2. skip locked values
3. pick candidate values by field type
4. run through same rule engine/normalizer
5. emit a valid next state

**Important boundary:** randomization must never bypass validation. It should reuse the same rule resolution path as manual edits.

### 7. Prompt Engine
**Responsibility:** Convert valid canonical form state into a model-specific prompt package.

**Output contract:**
- `prompt`
- `negativePrompt`
- `recommendedSettings`
- `styleAdvice`
- `debug/meta` (optional but useful)

**Internal stages:**
1. normalize state into semantic tags
2. assemble subject block
3. assemble detail blocks by category priority
4. apply model capabilities (weighting, style support, syntax)
5. build negatives
6. emit package

**Important boundary:** promptEngine should know about **semantic tags and model configs**, not UI components.

### 8. Generation Bridge
**Responsibility:** Abstract how a prompt package becomes an image result.

**Why it matters:** validation starts with clipboard + userscript, but the architecture must later support direct APIs without rewriting the app.

**Adapter interface:**

```ts
type GenerationRequest = {
  promptPackage: PromptPackage
  modelId: string
  metadata: CreatorSnapshot
}

type GenerationResult = {
  imageBlob?: Blob
  imageUrl?: string
  externalJobId?: string
  source: 'clipboard' | 'userscript' | 'api'
  metadata: CreatorSnapshot
}
```

**Adapters:**
- `clipboardAdapter`: copy prompt/settings only
- `userScriptAdapter`: handshake with ViolentMonkey automation
- `apiAdapter`: future direct generation call

**Critical design choice:** the gallery should receive a **normalized `GenerationResult`**, regardless of source.

### 9. Gallery Repository
**Responsibility:** Store and retrieve generated images plus their full metadata.

**Store with each item:**
- image/blob reference
- preview thumbnail
- creator snapshot (`formValues`, locks optional)
- prompt package
- model/style/settings used
- source (`userscript` or `api`)
- timestamps/tags

**Why:** tap-to-load only works if each artifact carries the exact creator snapshot.

### 10. Preset Repository
**Responsibility:** Save reusable creator states independent of generated images.

**Difference from gallery:**
- presets are reusable templates
- gallery items are generation artifacts with history

Do not merge these concepts into one table/store even if they share some fields.

### 11. Persistence and Sync Boundary
**Responsibility:** Persist app data locally now, leave a seam for future cloud sync.

**Recommended split:**
- `localStorage`: tiny, synchronous state like selected model, active category, simple prefs
- `IndexedDB`: images/blobs, presets, generation history, larger JSON payloads

This aligns with MDN guidance: localStorage is simple origin-scoped string storage; IndexedDB is the browser-native option for larger structured data and blobs. Confidence: HIGH.

### 12. Service Worker / Asset Cache
**Responsibility:** Cache shell assets for installable/static behavior.

**Use it for:**
- app shell caching
- schema/model config caching
- offline boot/fallback

**Do not depend on it for core correctness.** web.dev explicitly recommends treating service workers as optional for core features because they are unavailable on first load and not supported everywhere. Confidence: MEDIUM.

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| App Shell | Navigation, layout, install/offline shell | Creator Store, Form UI, Gallery UI |
| Schema Registry | Loads schema/model configs | Rule Engine, Form Engine, Prompt Engine |
| Creator Store | Canonical app state + actions | All UI + engines |
| Rule Engine | Visibility, conflicts, normalization, validation | Creator Store, Form Engine, Randomize Engine |
| Form Engine | Schema-driven UI rendering | Creator Store, Rule Engine |
| Randomize Engine | Lock-aware valid state generation | Creator Store, Rule Engine |
| Prompt Engine | Prompt package assembly | Creator Store, Schema Registry, Generation Bridge |
| Generation Bridge | Clipboard/UserScript/API abstraction | Prompt Engine, Gallery Repository |
| Gallery Repository | Persist/retrieve generations | Generation Bridge, Creator Store |
| Preset Repository | Persist/retrieve reusable creator states | Creator Store, Form Engine |
| Persistence Layer | localStorage + IndexedDB access | Store, Gallery, Presets |
| Service Worker | Asset caching/offline shell | App Shell |

## Data Flow

### Primary Create Flow

```text
User input
  -> Form Engine dispatches field update
  -> Creator Store updates canonical state
  -> Rule Engine recomputes disabled/visible/synergy/validity
  -> Prompt Engine derives PromptPackage
  -> UI renders prompt preview + advice
  -> Generate action sends PromptPackage to Generation Bridge
  -> Bridge returns normalized GenerationResult
  -> Gallery Repository persists image + metadata
  -> Gallery UI shows new item
```

### Randomize Flow

```text
User taps Randomize
  -> Randomize Engine reads current state + locks + schema
  -> Generates candidate values
  -> Rule Engine normalizes candidate state
  -> Creator Store commits valid next state
  -> Prompt Engine regenerates PromptPackage
  -> Clipboard copy and/or generation can proceed
```

### Gallery Reload Flow

```text
User taps gallery item
  -> Gallery Repository returns stored creator snapshot + prompt metadata
  -> Creator Store replaces current creator state
  -> Rule Engine re-normalizes against current schema version
  -> Form Engine re-renders selections
  -> Prompt Engine regenerates comparable prompt package
```

### Preset Save Flow

```text
Current creator state
  -> serialize snapshot
  -> attach thumbnail reference if available
  -> save to Preset Repository
  -> preset appears in preset browser
```

## Patterns to Follow

### Pattern 1: Canonical State + Derived State
**What:** Persist only source-of-truth inputs; compute disabled/visible/synergy state from rules.

**Why:** Keeps rule changes centralized and avoids desynchronization bugs.

**Use:**
- store `hairStyle = bald`
- derive `hairLength disabled = true`
- do not separately persist contradictory UI flags unless needed for performance

### Pattern 2: Shared Normalization Pipeline
**What:** Manual edits, preset loads, and randomization must all pass through the same rule/normalization path.

**Why:** This prevents one interaction path from creating illegal combinations the others would block.

### Pattern 3: Semantic Prompt Assembly
**What:** Map form options to semantic tokens first, then render model-specific prompt text.

**Why:** It decouples creator semantics from model syntax and makes new models easier to add.

### Pattern 4: Adapter-Based Generation
**What:** Treat clipboard, userscript, and API generation as interchangeable adapters behind one interface.

**Why:** Phase 1 validation and Phase 2 integration stay on the same architecture.

### Pattern 5: Metadata-First Gallery
**What:** Every image is saved with enough metadata to reconstruct the creator state.

**Why:** “tap image to reload setup” is a core product loop, not a nice-to-have.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Rule Logic in React Components
**What:** Hiding/disabling inputs with custom component conditionals separate from schema/rule evaluation.

**Why bad:** Rules drift, randomizer disagrees with UI, preset loads become inconsistent.

**Instead:** Keep all visibility/conflict logic in a shared rule engine.

### Anti-Pattern 2: Prompt Strings as Primary State
**What:** Treating the generated prompt as the thing to save and reload.

**Why bad:** You lose structured editability and model migration becomes painful.

**Instead:** Save canonical creator snapshots and regenerate prompts from them.

### Anti-Pattern 3: Gallery = Presets
**What:** Using one storage concept for both reusable presets and image history.

**Why bad:** Different lifecycle, metadata, and UX expectations.

**Instead:** Separate repositories with shared snapshot types.

### Anti-Pattern 4: localStorage for Everything
**What:** Storing images and large history payloads in localStorage.

**Why bad:** String-only, synchronous, and poor fit for blobs/large datasets.

**Instead:** Use IndexedDB for heavy data.

### Anti-Pattern 5: Hard-coding Model Logic Into UI Controls
**What:** UI components directly knowing which model supports weighting/style/settings.

**Why bad:** Every model addition causes UI rewrites.

**Instead:** Put capabilities in `modelConfigs`, then let promptEngine + UI read them.

## Suggested Build Order

### Phase 1: Schema + State Backbone
Build first:
1. schema registry
2. canonical creator store
3. rule engine
4. minimal form renderer

**Why first:** everything else depends on a stable, valid creator state.

### Phase 2: Prompt Pipeline
Build next:
1. semantic normalization
2. model config layer
3. prompt engine output contract
4. prompt preview/copy actions

**Why second:** this is the core value proposition and can be validated without image APIs.

### Phase 3: Randomization
Build after prompt generation is stable:
1. lock model
2. variation/full randomize
3. shared normalization reuse

**Why third:** randomization is only useful once state validity and prompt quality are trustworthy.

### Phase 4: Persistence + Gallery
Build next:
1. IndexedDB repositories
2. save/load snapshots
3. gallery metadata model
4. tap-to-reload flow

**Why fourth:** this closes the repeatability loop and makes the app genuinely useful day to day.

### Phase 5: Generation Bridge (Clipboard -> UserScript)
Build next:
1. clipboard adapter
2. normalized generation result contract
3. ViolentMonkey handshake
4. gallery ingest from external generation

**Why fifth:** this validates end-to-end image production at low cost without forcing backend work.

### Phase 6: Service Worker + Installability
Build once main flows work:
1. app shell caching
2. offline fallback
3. asset versioning

**Why sixth:** valuable, but not the hardest product risk.

### Phase 7: Direct API Adapter
Build after workflow validation:
1. provider adapter
2. secure key/proxy plan if needed
3. async job status/error handling
4. same gallery result write path

**Why last:** it should replace only the bridge implementation, not alter core app architecture.

## Build Order Implications for Roadmap

- **The real foundation is not UI polish; it is rule evaluation + canonical state.**
- **Prompt quality should be validated before generation API work.** Otherwise you pay for bad prompts.
- **Gallery should be built before direct API integration.** It is the artifact system that proves repeatability.
- **Generation must be an adapter seam from day one.** If not, Phase 2A and 2B become rewrites instead of swaps.

## Scalability Considerations

| Concern | At MVP | At larger local usage | At cloud/API scale |
|---------|--------|-----------------------|--------------------|
| Schema size | Single JSON asset | Split schema by category/version | Remote schema delivery + migration |
| Rule complexity | Inline rule config | Dedicated rule evaluator + tests | Rule compiler / validation tooling |
| Prompt models | Few hand-tuned configs | Capability matrix per model | Provider/model registry |
| Gallery volume | IndexedDB only | Thumbnailing + pagination | Cloud object storage + sync |
| Persistence | Browser only | Import/export backups | User accounts + sync service |
| Generation | Clipboard/userscript | Multiple site adapters | API queue/proxy/webhook handling |

## Architecture Recommendation in One Line

Use a **single-state, rule-driven, schema-rendered client app** with **prompt assembly and generation isolated behind domain adapters** so the product can start static/local-first and later add direct APIs without rewriting the core.

## Sources

- Project context: `.planning/PROJECT.md`
- Product notes: `resources/_theIdeaScribble.md`
- Brainstorm reference: `resources/brainstorm-v5.md`
- Prior arch spec: `resources/VixenLabs_ArchSpec_v1.md`
- React docs, managing state: https://react.dev/learn/managing-state *(official, current; supports centralized deliberate state structure)*
- Vite docs, static deploy: https://vite.dev/guide/static-deploy.html *(official, current; confirms static build + GitHub Pages workflow)*
- MDN IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API *(official reference; structured data + blobs)*
- MDN localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage *(official reference; small origin-scoped string storage)*
- web.dev service workers: https://web.dev/learn/pwa/service-workers *(authoritative guidance; use for shell/offline, not core correctness)*
- Zustand repository/docs: https://github.com/pmndrs/zustand *(official project source; supports lightweight centralized store and persistence middleware)*
