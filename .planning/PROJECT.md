# Dollify

## What This Is

Dollify is a mobile-first adult AI character creation app for female content creators who want to generate consistent female and futa-female personas, replicas, and collaboration concepts. It replaces prompt writing with a structured, conflict-aware form that turns curated selections into model-specific prompts and generated images.

## Core Value

Creators can quickly produce valid, repeatable AI character outputs without writing prompts or fighting invalid option combinations.

## Requirements

### Validated

- [x] Build a schema-driven `formEngine` that renders the creator UI from external JSON without free-text inputs. _(Validated in Phase 1: Schema-Driven Creator Foundation)_
- [x] Support a mobile-first workflow for generating, copying, saving, and reloading prompts, presets, and images. _(Phase 1 validated the mobile-first creator foundation and swipe navigation patterns.)_

### Active

- [ ] Build a schema-driven `formEngine` that renders the creator UI from external JSON without free-text inputs.
- [ ] Build a `promptEngine` that converts form state into model-specific prompts, guidance, and generation settings.
- [ ] Build a lock-aware `randomizeEngine` that creates valid variations while respecting conflict rules.
- [ ] Support a mobile-first workflow for generating, copying, saving, and reloading prompts, presets, and images.
- [ ] Ship a low-cost static-first generation flow that starts with clipboard plus ViolentMonkey automation and evolves toward direct API generation.

### Out of Scope

- Male character support - the product is intentionally focused on female and futa-female creation only.
- Free-text prompt authoring - structured selections are the core product advantage and keep output consistent.
- Monetization and subscriptions - explicitly deferred until the core workflow is proven.
- User accounts, cloud sync, and backend-managed persistence - static local-first delivery comes first.

## Context

The repo currently contains planning artifacts, schemas, userscripts, and prior concept documents under `resources/`, which should be treated as reference material rather than current implementation. The most stable throughline across the documents is a three-engine architecture: `formEngine` for schema-driven UI and rule evaluation, `promptEngine` for model-aware prompt assembly, and `randomizeEngine` for constrained exploration. The target audience is adult creators, especially OnlyFans/Fanvue-style models, who want to create AI replicas of themselves or adjacent collaboration concepts. The product must work well on mobile first, include swipe interactions, and avoid hardcoded prompt panel properties. Early delivery prioritizes low-cost validation via static hosting and browser automation before introducing direct model APIs. Updated source material confirms that v1 should also ship with built-in default presets plus preset families for Shoots, Fits, Looks, and Activity, each with interaction rules and Female/Futa-Female and SFW/NSFW variations.

## Current State

Phase 1 is complete. Dollify now has a working schema-driven mobile creator shell with a canonical creator store, shared rule normalization, schema-rendered curated controls, and swipe-aware category navigation for female and futa-female flows.

## Constraints

- **Platform**: Static frontend first on GitHub Pages - keeps early testing and hosting costs near zero.
- **UX**: Mobile-first with mandatory swipe gestures - primary usage is on phones even if desktop is supported.
- **Input Model**: No free-text fields in the core creator flow - all inputs must remain curated and prompt-ready.
- **Scope**: Adult female and futa-female creation only - the domain is intentionally narrow.
- **Architecture**: Core value depends on `formEngine`, `promptEngine`, and `randomizeEngine` - these are foundational, not optional enhancements.
- **Persistence**: Local browser storage first - no backend dependency for the initial milestone.
- **Offline Strategy**: A service worker or equivalent asset strategy is required - the app should behave like an installable/static product.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `Dollify` as the project identity | `START-HERE.md` explicitly renames the project and newer work should normalize around it | - Pending |
| Keep creation fully schema-driven with no free-text input | Structured selections are the product differentiator and prevent invalid prompt states | - Pending |
| Center architecture on `formEngine` -> `promptEngine` -> `randomizeEngine` | This pattern is repeated across the strongest source documents and matches the product value | - Pending |
| Ship generation in stages: clipboard/UserScript first, direct API later | Browser automation lowers validation cost while the core engines stabilize | - Pending |
| Start as a static local-first web app | GitHub Pages deployment and browser-local persistence reduce operational complexity | - Pending |
| Prioritize mobile-first UX with swipe support | The product is expected to be used primarily on mobile devices | - Pending |
| Include curated built-in preset libraries in v1 | New resource notes and bundled data files show default presets are product content, not optional seed data | - Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-29 after Phase 1 completion*
