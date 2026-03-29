# Roadmap: Dollify

## Overview

Dollify v1 should move from a trustworthy schema-driven creator into prompt generation, guided variation, reusable preset libraries, and finally the lowest-cost end-to-end generation loop. The updated roadmap treats built-in presets as a core product capability rather than optional seed data, so users can start from curated defaults, mode-aware preset families, and reloadable local history inside the same mobile-first static app.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Schema-Driven Creator Foundation** - Establish the mobile-first creator shell, schema rendering, and rule-safe character setup.
- [ ] **Phase 2: Prompt Package Workflow** - Turn creator state into model-aware prompt packages with reliable copy and generate actions.
- [ ] **Phase 3: Lock-Aware Exploration** - Let users randomize safely while preserving intent and valid combinations.
- [ ] **Phase 4: Preset Libraries And Local Reuse** - Ship built-in preset families, saved presets, and a reloadable local gallery.
- [ ] **Phase 5: Static Generation Bridge And Installability** - Complete the low-cost external generation loop and ship an installable static app.

## Phase Details

### Phase 1: Schema-Driven Creator Foundation
**Goal**: Users can build valid female and futa-female characters through a mobile-first schema-rendered creator without free-text prompt writing.
**Depends on**: Nothing (first phase)
**Requirements**: CRTR-01, CRTR-02, CRTR-03, CRTR-04, UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. User can create a character using only structured controls, with no free-text prompt entry anywhere in the core flow.
  2. User can see creator categories and options rendered from external schema data rather than a hardcoded form.
  3. User cannot keep invalid combinations selected because conflict rules, visibility rules, and selection limits are enforced during editing.
  4. User can comfortably complete the primary creator flow on a phone-sized screen, including key swipe interactions.
  5. User can only create female or futa-female characters in v1.
**Plans**: 5 planned (`.planning/phases/01-schema-driven-creator-foundation/PLAN.md`)
**UI hint**: yes

### Phase 2: Prompt Package Workflow
**Goal**: Users can turn their current creator state into a model-specific prompt package and move it into generation-ready actions.
**Depends on**: Phase 1
**Requirements**: PRMP-01, PRMP-02, PRMP-03, PRMP-04, PRMP-05, UX-04
**Success Criteria** (what must be TRUE):
  1. User can choose a supported model, aspect ratio, and style options before generating a prompt package.
  2. User can generate a prompt package that includes a model-specific positive prompt, negative prompt, and generation guidance from the current creator state.
  3. User can manually copy the current prompt package to the clipboard.
  4. User automatically gets the latest prompt package copied to the clipboard when they trigger generate or randomize.
  5. User sees prompt output derived from the current schema and model state rather than hardcoded prompt-panel properties.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Lock-Aware Exploration
**Goal**: Users can explore useful creator variations quickly without losing locked choices or breaking schema and model rules.
**Depends on**: Phase 2
**Requirements**: RAND-01, RAND-02, RAND-03
**Success Criteria** (what must be TRUE):
  1. User can lock individual creator fields so those choices remain unchanged during randomization.
  2. User can randomize unlocked fields and always receive a valid character state that still respects schema and model rules.
  3. User can trigger randomization and immediately get a fresh, generation-ready variation without manually repairing invalid outputs.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Preset Libraries And Local Reuse
**Goal**: Users can start from curated built-in presets, save their own reusable creator states, and reload past work from a local gallery without breaking preset rules.
**Depends on**: Phase 3
**Requirements**: PSET-00, PSET-01, PSET-02, PSET-03, PSET-04, PSET-05, PSET-06, PSET-07, PSET-08, GLLY-01, GLLY-02, GLLY-03, GLLY-04
**Success Criteria** (what must be TRUE):
  1. User can start from shipped default presets and browse built-in preset families for Shoots, Fits, Looks, and Activity.
  2. User can apply preset variants that respect Female/Futa-Female and SFW/NSFW modes without surfacing incompatible combinations.
  3. User can save the current creator configuration as a preset and load it later with the expected settings restored.
  4. User can view a local gallery/history of generated images and tap any saved image to reload the settings used to create it.
  5. User can remove one gallery image or remove multiple selected images in a single action.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Static Generation Bridge And Installability
**Goal**: Users can complete a low-cost external generation loop in a static installable app and keep generated results inside Dollify.
**Depends on**: Phase 4
**Requirements**: BRDG-01, BRDG-02, UX-03
**Success Criteria** (what must be TRUE):
  1. User can use a clipboard-first generation workflow for end-to-end testing without direct API integration.
  2. User can bring images produced through the userscript or browser-automation flow back into the local gallery.
  3. User can install and keep using the app as a static web app with service-worker-backed asset availability or an equivalent offline-safe strategy.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Schema-Driven Creator Foundation | 0/5 | Planned | `.planning/phases/01-schema-driven-creator-foundation/PLAN.md` |
| 2. Prompt Package Workflow | 0/TBD | Not started | - |
| 3. Lock-Aware Exploration | 0/TBD | Not started | - |
| 4. Preset Libraries And Local Reuse | 0/TBD | Not started | - |
| 5. Static Generation Bridge And Installability | 0/TBD | Not started | - |
