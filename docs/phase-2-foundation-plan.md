# Phase 2 Foundation Plan

## Intent

Phase 1 established the mobile-first creator shell, schema registry, rule evaluation, swipe navigation, and persisted form state. Phase 2 should complete the remaining product-critical engines that the current UI already hints at: prompt packaging, review output, and rule-aware randomization.

This plan follows the current repository state rather than older resource documents. In this codebase, the next highest-value work is not gallery or API transport yet; it is finishing the creator-to-prompt loop so the app can produce repeatable outputs from curated selections.

## Phase Goal

Ship a fully usable local creator flow where a user can:

1. build a valid character with curated inputs,
2. review the generated prompt package,
3. randomize unlocked parts safely,
4. copy prompt output for external generation.

## In Scope

- `promptEngine` with schema-driven token assembly
- prompt package UI behind the existing `Review` action
- `randomizeEngine` that respects visibility, requirements, and locks
- field/category locking model in store and UI
- clipboard support for positive prompt copy
- stronger tests for deterministic prompt and randomization behavior

## Out Of Scope

- image gallery
- preset library
- direct provider API integration
- UserScript bridge automation
- service worker / installability polish

## Workstreams

### 1. Prompt Engine

- Add a dedicated `src/features/prompt/` module.
- Extend schema contracts so options can carry prompt-safe metadata instead of relying on labels.
- Build a prompt package shape such as:
  - `positivePrompt`
  - `negativePrompt`
  - `summaryLines`
  - `warnings`
  - `modelHints`
- Make prompt generation deterministic from `formValues` + evaluated rule state.
- Ensure mode-specific branches handle female and futa-female cleanly.

### 2. Review Surface

- Replace the placeholder status cards in `src/shell/AppShell.tsx` with a real review experience.
- Wire the existing `Review` button to open a bottom sheet or panel containing:
  - positive prompt
  - negative prompt
  - concise attribute summary
  - copy action
  - unresolved warnings when state is technically valid but weak
- Keep the experience mobile-first and readable on narrow screens.

### 3. Randomize Engine

- Add `src/features/randomize/` with a deterministic, testable engine.
- Randomize only visible, unlocked, eligible fields.
- Preserve required field completion.
- Respect `maxSelections`, `disableWhen`, `visibleWhen`, and mode-specific constraints.
- Support seeded randomness or injectable RNG for test stability.
- Enable the currently disabled `Randomize` button in the bottom action bar.

### 4. Locks And Store Shape

- Extend `CreatorSnapshot` and Zustand state with field locks.
- Add lock affordances on field cards or option groups without overcrowding the mobile UI.
- Keep persisted state backward compatible by merging missing lock data safely.
- Reset flow should clear locks unless explicitly designed otherwise.

### 5. Validation And Tests

- Add prompt-engine unit tests for representative creator states.
- Add randomize-engine unit tests for lock handling, mode restrictions, and required-field preservation.
- Add interaction tests for review open/copy and randomize flows.
- Keep prompt snapshots focused on stable semantic output, not brittle formatting noise.

## Suggested Implementation Order

1. extend schema metadata for prompt-safe output,
2. build and test `promptEngine`,
3. add review panel UI,
4. extend store with locks,
5. build and test `randomizeEngine`,
6. wire copy and randomize interactions,
7. finish integration tests and mobile verification notes.

## Exit Criteria

- `Review` shows a complete prompt package generated from live creator state.
- `Randomize` updates only unlocked eligible fields and never produces invalid state.
- A user can lock at least one field per category and verify it survives randomization.
- Prompt output can be copied from the app.
- Tests cover prompt assembly, randomization rules, and primary shell interactions.

## Risks To Watch

- Using display labels directly in prompts will make schema evolution fragile.
- Randomization without injectable RNG will be hard to test reliably.
- Lock controls can easily become too dense on mobile if placed per option instead of per field.
- Prompt formatting can sprawl unless a strict package shape is defined early.

## Deliverables

- `docs/phase-2-foundation-plan.md`
- new prompt engine module and tests
- new randomize engine module and tests
- updated store/contracts/schema metadata as needed
- updated `src/shell/AppShell.tsx` and related UI components for review and locks

## Follow-On Phase

Once Phase 2 lands, Phase 3 should focus on presets, gallery storage, and the first external generation bridge so copied prompts become a full local generation workflow.
