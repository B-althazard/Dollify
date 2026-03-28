# Domain Pitfalls

**Domain:** Adult AI character creation web app (schema-driven prompt builder, local-first generation)
**Project:** Dollify
**Researched:** 2026-03-29
**Overall confidence:** MEDIUM

## What projects like this commonly get wrong

The biggest failures are usually not "bad UI" or "bad prompts" in isolation. They come from putting the wrong responsibility in the wrong layer: prompt strings baked too early into the schema, rules split across UI and generator code, storage treated like a free infinite bucket, and automation assumed to be stable when browser/platform permissions are not.

For Dollify specifically, the dangerous mistakes are the ones that create silent drift: a saved preset that no longer means the same thing after schema changes, a randomizer that generates technically valid state but visually nonsense output, or a clipboard/userscript flow that works on desktop Chrome and quietly fails on mobile or Safari.

Roadmap implication: treat **schema semantics, rule evaluation, reproducibility metadata, storage durability, and automation boundaries** as first-class architecture work, not polish.

---

## Priority Pitfalls at a Glance

| Pitfall | Severity | Why it matters | Address in phase |
|---|---|---|---|
| UI schema becomes the prompt engine | Critical | Model tuning becomes brittle and unmaintainable | Phase 1 |
| Rule logic is duplicated across form/randomize/prompt paths | Critical | Invalid combinations leak and bugs multiply | Phase 1 |
| No canonical normalized state | Critical | Saved presets and gallery reloads become unreliable | Phase 1 |
| No evaluation harness for prompt quality/regressions | Critical | "Optimizations" degrade output with no signal | Phase 1 |
| Using localStorage like a database/image store | Critical | Quota errors, data loss, broken gallery | Phase 1 |
| No schema/data migration strategy | Critical | Old presets/images break after updates | Phase 1 |
| Assuming clipboard/userscript automation is universally reliable | High | Phase 2A fails on permissions, mobile, site drift | Phase 2A |
| Shipping service worker/offline without update discipline | High | Users get stale schema/assets and inconsistent behavior | Phase 1 |
| Ignoring adult-content provider constraints until late | High | API/vendor path can collapse suddenly | Phase 2A-2B research before build |

---

## Critical Pitfalls

### 1) Letting the schema become the prompt engine

**What goes wrong:**
Projects store final prompt fragments directly on every option and keep adding model-specific exceptions into the schema until it becomes a tangled hybrid of UI config, business rules, and prompt syntax.

**Why it happens:**
It feels fast early: adding `promptValue` per option is easy. But once models differ on ordering, weighting, negative prompts, style handling, and trigger words, the schema starts carrying prompt-engine complexity it should not own.

**Consequences:**
- Adding one model breaks another
- Option reuse becomes hard
- Schema authors need generator knowledge
- Prompt tuning turns into search-and-replace across content data

**Warning signs:**
- Schema options gain many prompt fields per model
- Same concept is duplicated just to support different models
- "Simple schema tweak" requires generator retesting everywhere
- Product discussion shifts from traits to literal prompt fragments

**Prevention strategy:**
- Keep schema primarily **semantic**, not model-rendered
- Store stable trait IDs and trait metadata in schema
- Let `promptEngine` map semantic traits to model-specific output
- Allow only lightweight defaults in schema; keep ordering, weighting, and negatives in model config/templates

**Address in phase:**
- **Phase 1** — define schema contract before authoring large option sets

**Confidence:** MEDIUM

---

### 2) Duplicating rule logic across the form, randomizer, and prompt engine

**What goes wrong:**
The UI disables one combination, the randomizer generates another, and the prompt engine tries to clean up after both. Each layer implements slightly different conflict logic.

**Why it happens:**
Teams optimize locally: UI handles visibility, randomizer handles randomness, prompt engine handles output cleanup. Without one shared rule evaluator, drift is guaranteed.

**Consequences:**
- Invalid states reach saved presets
- Randomize results differ from manual selection behavior
- Prompt output contains contradictory details
- Bug fixes must be repeated in 3 places

**Warning signs:**
- Separate `if hairStyle === bald` logic in multiple modules
- Prompt engine contains many "cleanup" exceptions
- QA finds bugs only after randomize, not manual flows
- Disabled fields still reappear in persisted data

**Prevention strategy:**
- Create one shared rule evaluation pass that all engines use
- Treat UI disabled/hidden state as a projection of canonical rules, not separate truth
- Make randomizer generate candidates, then run the same normalization/rule pass
- Unit test rules against schema fixtures before UI work grows

**Address in phase:**
- **Phase 1** — foundational architecture and test suite

**Confidence:** HIGH

---

### 3) Failing to define a canonical normalized state

**What goes wrong:**
The app stores raw form picks, derived synergies, disabled values, locks, model settings, and gallery metadata inconsistently. Reloading a preset does not recreate the same result.

**Why it happens:**
Teams move fast with UI state first, then later add locks, derived tags, model advice, and gallery reloads without deciding what is canonical vs derived.

**Consequences:**
- "Load image settings" produces a different prompt than the original
- Hidden/disabled values survive in storage
- Schema updates corrupt old state
- Reproducibility disappears

**Warning signs:**
- Saved data contains both raw and derived fields with no contract
- Reload requires ad-hoc repair code
- Same state serialized differently in presets vs gallery items
- Randomize changes fields that appear locked after reload

**Prevention strategy:**
- Define a strict persisted document shape early: `schemaVersion`, `formValues`, `locks`, `selectedModel`, `promptPackageSnapshot`, `createdAt`
- Persist canonical inputs and version stamps; recompute derived state on load
- Save enough provenance to reproduce past output even if prompt templates later change
- Add round-trip tests: `state -> save -> load -> prompt` must be stable

**Address in phase:**
- **Phase 1** — before presets/gallery ship

**Confidence:** MEDIUM

---

### 4) Optimizing prompts without an evaluation harness

**What goes wrong:**
Prompt tuning becomes taste-driven. One change improves one character archetype but quietly degrades five others.

**Why it happens:**
Early image apps often rely on anecdotal testing and memory instead of a small benchmark set.

**Consequences:**
- Regressions are discovered late
- Teams overfit to a favorite model/site
- Prompt engine becomes superstition-driven
- Randomizer feels worse over time despite more work

**Warning signs:**
- No saved benchmark presets/archetypes
- Prompt changes are accepted because output "felt better"
- Negative prompt rules expand without measurable wins
- Same issue reappears every few weeks

**Prevention strategy:**
- Build a fixed evaluation corpus of representative presets
- Store golden prompt packages per model/config version
- Compare outputs across releases using the same cases
- Track failures by category: anatomy drift, style conflict, identity drift, contradiction

**Address in phase:**
- **Phase 1** — needed before heavy prompt tuning

**Confidence:** MEDIUM

---

### 5) Treating localStorage as the gallery database

**What goes wrong:**
Images, large metadata blobs, or too many presets are shoved into `localStorage`, then quota or serialization limits cause failures and corrupted UX.

**Why it happens:**
`localStorage` is simple and synchronous, so teams use it for everything before they hit scale.

**Consequences:**
- Slow startup and main-thread jank
- `QuotaExceededError`
- Gallery/image persistence failures
- Hard-to-recover corrupted app state

**Warning signs:**
- Base64 images stored in `localStorage`
- App boot parses one giant JSON blob
- Saving an image or preset occasionally fails on mobile
- Storage bugs only appear after real usage volume

**Prevention strategy:**
- Use **IndexedDB** for gallery images/blobs and larger metadata
- Reserve `localStorage` for tiny, disposable UI preferences only
- Handle quota errors explicitly and surface export/cleanup UX
- Track storage usage with `navigator.storage.estimate()` and request persistence when user data becomes valuable

**Address in phase:**
- **Phase 1** — storage model before gallery/presets expand

**Confidence:** HIGH

---

### 6) No versioning or migration path for schema-driven data

**What goes wrong:**
Option IDs change, categories move, rules evolve, and previously saved presets or gallery records can no longer be loaded or mean something different.

**Why it happens:**
Greenfield teams assume the schema is still fluid, so they postpone migration design until after data already exists.

**Consequences:**
- Existing users lose presets
- Reloaded generations become non-reproducible
- Backward compatibility becomes expensive late
- Schema refactors are avoided because they are dangerous

**Warning signs:**
- Option IDs are renamed casually
- No `schemaVersion` or migration registry exists
- Load code silently drops unknown fields
- Support/QA sees "this preset changed" bugs

**Prevention strategy:**
- Version schema and persisted documents from day one
- Treat option IDs as durable public identifiers
- Add migration functions per schema version
- Preserve historical prompt snapshots for gallery items even when live mappings evolve

**Address in phase:**
- **Phase 1** — before first saved user data

**Confidence:** HIGH

---

## High-Impact Pitfalls

### 7) Assuming local-first storage is durable by default

**What goes wrong:**
The team assumes "stored in browser" means safe. In reality, browser storage can be quota-limited, evicted, cleared by users, behave differently in private mode, and on Safari may be proactively evicted for low-interaction origins.

**Consequences:**
- Users lose images/presets unexpectedly
- Install/offline story feels unreliable
- Support has no recovery path

**Warning signs:**
- No export/import feature planned
- No persistence request
- No user messaging that data is local-only
- No testing on Safari/iOS/private browsing

**Prevention strategy:**
- Design explicit backup/export/import early
- Request persistent storage when the user saves meaningful data
- Show storage health and recovery affordances
- Test same-origin/HTTPS/PWA behaviors on mobile browsers

**Address in phase:**
- **Phase 1** for architecture, **Phase 2A** for field validation

**Confidence:** HIGH

---

### 8) Underestimating clipboard and userscript constraints

**What goes wrong:**
The Phase 2A validation plan assumes copy/paste and site automation will be simple, but clipboard access is permission- and activation-sensitive, while userscript selectors and injection contexts drift over time.

**Consequences:**
- Flow works only on some browsers
- Mobile validation path is weaker than desktop
- Free target site changes break the entire generation loop
- Debugging becomes mostly DOM selector maintenance

**Warning signs:**
- Automation requires reading clipboard without user gesture
- Script is tied to one fragile DOM structure
- No fallback if target site changes selectors or CSP
- Mobile browser/userscript support is unverified

**Prevention strategy:**
- Treat Phase 2A as a supported-adapters layer, not one-off scripting
- Prefer explicit user gestures and explicit "Copy Prompt" fallback
- Keep target-site selectors/config externalized and versioned
- Validate the exact browser/device matrix before making Phase 2A core to roadmap promises

**Address in phase:**
- **Phase 2A** — dedicated research/prototype spike before productizing

**Confidence:** HIGH

---

### 9) Shipping offline/service worker support without update strategy

**What goes wrong:**
The app caches aggressively, then users keep stale schema files, outdated prompt configs, or mismatched assets after deploys.

**Consequences:**
- Some users run old rules with new UI
- "Bug fixed for me, still broken for them" situations
- Gallery reloads behave differently across devices

**Warning signs:**
- Cache-first everywhere
- No cache versioning
- No "new version available" UX
- Schema/config files are cached like immutable assets

**Prevention strategy:**
- Version all schema/config assets explicitly
- Use a conservative service worker strategy for mutable data/config
- Add update notifications and cache cleanup paths
- Test upgrade paths, not just fresh installs

**Address in phase:**
- **Phase 1** if offline is promised early; otherwise gate before public beta

**Confidence:** HIGH

---

### 10) Ignoring adult-content vendor/platform constraints until integration time

**What goes wrong:**
The product proves out on one target site or assumes an API provider will allow the workflow, then hits moderation, policy, billing, or model-availability constraints late.

**Consequences:**
- Phase 2B roadmap becomes invalid
- Model list in prompt engine cannot actually be supported
- Userscript targets disappear or censor results unexpectedly

**Warning signs:**
- Model/provider choices are discussed only as technical fit
- No compliance review of target sites/APIs
- Prompt engine invests in models with no stable access path

**Prevention strategy:**
- Research target sites/providers before deep model-specific tuning
- Keep provider abstraction clean; do not hard-wire the app to one host
- Mark every supported generation route as experimental until validated with real policy and availability constraints

**Address in phase:**
- **Pre-Phase 2A** research, then **Phase 2B** architecture

**Confidence:** LOW

---

## Moderate Pitfalls

### 11) Designing randomization for validity, not usefulness

**What goes wrong:**
The randomizer produces rule-valid states that are still creatively poor, repetitive, or off-target for creator workflows.

**Warning signs:**
- Users hit randomize many times before seeing viable variants
- Locked-field workflows feel ignored
- Output diversity clusters around a few dominant traits

**Prevention strategy:**
- Separate "valid" from "good"
- Add weighted distributions, exclusion memory, and variation modes
- Tune randomization against real creator tasks, not only schema legality

**Address in phase:**
- **Phase 1** basic legality; **later Phase 1/2A** for quality tuning

**Confidence:** MEDIUM

---

### 12) Not storing enough provenance with generated images

**What goes wrong:**
Images are saved, but not the exact state, model, prompt package, and generation settings that created them.

**Warning signs:**
- Gallery shows thumbnails only
- "Load settings" depends on current schema defaults
- Reproducing an old favorite image is guesswork

**Prevention strategy:**
- Save image metadata with full generation context
- Store prompt snapshot + model/settings snapshot, not just current form values
- Treat gallery as reproducibility infrastructure, not just media display

**Address in phase:**
- **Phase 1** when gallery metadata shape is defined

**Confidence:** MEDIUM

---

### 13) Overfitting the product to desktop while claiming mobile-first

**What goes wrong:**
The form engine technically works on phones, but long option lists, lock controls, swatches, and gallery actions are too dense for real thumb use.

**Warning signs:**
- Desktop-first prototypes shrink down poorly
- Lock icons are tiny or ambiguous
- Randomize/generate/save require too much scrolling

**Prevention strategy:**
- Test core loops on phone-sized screens from the start
- Limit simultaneous on-screen controls
- Design category navigation, locking, and gallery actions specifically for touch

**Address in phase:**
- **Phase 1** UX architecture

**Confidence:** MEDIUM

---

## Phase-Specific Warnings for Roadmap Planning

| Phase topic | Likely pitfall | Mitigation |
|---|---|---|
| Schema authoring | Semantic traits mixed with final prompt syntax | Lock schema contract before content expansion |
| formEngine | Rules implemented in components instead of shared evaluator | Build central rule engine + tests first |
| promptEngine | Subjective tuning without benchmark set | Create evaluation corpus and golden outputs |
| randomizeEngine | Valid but useless variations | Add workflow-specific randomization modes |
| Presets/gallery | No schema versioning or prompt snapshot | Persist versioned provenance-rich records |
| Local persistence | localStorage used for blobs/images | Use IndexedDB + quota handling |
| Offline/PWA | Stale cached schema/config | Version assets and test upgrades |
| ViolentMonkey automation | Browser/site assumptions collapse | Prototype on real target matrix before committing roadmap |
| Direct API generation | Adult-content provider mismatch | Research policy/availability before model-specific integration |

---

## Recommended "Do This Early" Checklist

1. Define a **semantic schema contract** and keep model rendering logic out of content authoring.
2. Build one **shared rule evaluator** used by form, randomize, load, and prompt generation.
3. Define a **canonical persisted state** with versioning and migration hooks.
4. Use **IndexedDB** for gallery/presets metadata and blobs; keep `localStorage` tiny.
5. Add a **prompt evaluation corpus** before tuning becomes subjective drift.
6. Save **full provenance** with every generated image.
7. Treat **Phase 2A automation as experimental integration work**, not guaranteed plumbing.
8. Design **export/import + persistence requests** early because local-first is not the same as permanent.

---

## Sources

### High-confidence sources
- MDN: IndexedDB API — https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- MDN: Window.localStorage — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- MDN: Storage quotas and eviction criteria — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- MDN: Clipboard API — https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
- MDN: Service Worker API — https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Violentmonkey Privileged APIs — https://violentmonkey.github.io/api/gm/
- JSON Schema: What is JSON Schema — https://json-schema.org/overview/what-is-jsonschema
- WebKit: Updates to Storage Policy (Aug 10, 2023) — https://webkit.org/blog/14403/updates-to-storage-policy/

### Project-context sources
- `.planning/PROJECT.md`
- `resources/_theIdeaScribble.md`
- `resources/brainstorm-v5.md`
- `resources/VixenLabs_ArchSpec_v1.md`

### Confidence notes
- **HIGH:** browser storage, clipboard, service worker, and userscript constraints are directly supported by official docs.
- **MEDIUM:** schema/prompt architecture pitfalls are strongly supported by project context and standard schema-validation practice, but are still opinionated design recommendations.
- **LOW:** adult-content vendor/platform risk is real, but specific provider behavior must be validated during Phase 2 research.
