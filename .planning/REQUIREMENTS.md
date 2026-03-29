# Requirements: Dollify

**Defined:** 2026-03-29
**Core Value:** Creators can quickly produce valid, repeatable AI character outputs without writing prompts or fighting invalid option combinations.

## v1 Requirements

### Creator Schema

- [x] **CRTR-01**: User can create a character using only structured form controls with no free-text prompt input.
- [x] **CRTR-02**: User can see form categories and fields rendered from an external schema rather than hardcoded UI options.
- [x] **CRTR-03**: User cannot select invalid combinations because the app enforces conflicts, visibility rules, and selection limits.
- [x] **CRTR-04**: User can create only female or futa-female characters in v1.

### Prompt Pipeline

- [ ] **PRMP-01**: User can generate a model-specific positive prompt from the current creator state.
- [ ] **PRMP-02**: User can receive a negative prompt and generation guidance derived from the selected model and character configuration.
- [ ] **PRMP-03**: User can select an image generation model, aspect ratio, and supported style options before generating a prompt.
- [ ] **PRMP-04**: User can copy the current prompt package to the clipboard manually.
- [ ] **PRMP-05**: User automatically gets the current prompt copied to the clipboard when they trigger generate or randomize.

### Randomization

- [ ] **RAND-01**: User can lock individual creator fields so randomization does not change them.
- [ ] **RAND-02**: User can randomize unlocked fields while preserving valid combinations.
- [ ] **RAND-03**: User can use randomization to explore useful variations without breaking model or schema rules.

### Presets And Gallery

- [ ] **PSET-00**: User can start from built-in default presets that ship with the app.
- [ ] **PSET-01**: User can save the current creator configuration as a preset for later reuse.
- [ ] **PSET-02**: User can load a saved preset back into the creator and restore its settings.
- [ ] **PSET-03**: User can browse built-in Shoot presets that combine pose, camera, lighting, and location.
- [ ] **PSET-04**: User can browse built-in Fit presets that apply complete outfit combinations.
- [ ] **PSET-05**: User can browse built-in Look presets that combine hair and makeup.
- [ ] **PSET-06**: User can browse built-in Activity presets that apply an activity setup.
- [ ] **PSET-07**: User can use preset variants that respect Female/Futa-Female and SFW/NSFW modes.
- [ ] **PSET-08**: User cannot apply preset combinations that violate interaction rules.
- [ ] **GLLY-01**: User can view a local gallery/history of generated images.
- [ ] **GLLY-02**: User can tap a gallery image and reload the settings used to create it.
- [ ] **GLLY-03**: User can remove a single saved image from the gallery.
- [ ] **GLLY-04**: User can select and remove multiple saved images in one action.

### Generation Bridge

- [ ] **BRDG-01**: User can use a clipboard-first generation workflow that supports early testing without direct API integration.
- [ ] **BRDG-02**: User can ingest images produced through the UserScript/browser automation flow into the local gallery.

### Experience And Platform

- [x] **UX-01**: User can complete the main creator workflow comfortably on mobile screens.
- [x] **UX-02**: User can use swipe gestures in key mobile interactions.
- [ ] **UX-03**: User can continue using the app as a static, installable web app with a service worker or equivalent asset strategy.
- [ ] **UX-04**: User does not see hardcoded prompt properties in the prompt output panel.

## v2 Requirements

### Generation Integrations

- **API-01**: User can generate images directly through supported provider APIs instead of relying on browser automation.
- **API-02**: User can use multiple provider adapters through a shared generation interface.

### Advanced Workflow

- **CONS-01**: User can use reference-image-assisted consistency workflows.
- **CONS-02**: User can export or import presets and history for portability and backup.
- **CONS-03**: User can access richer prompt optimization and model-tuning recommendations.

### Product Expansion

- **ACCT-01**: User can create an account and sync presets/history across devices.
- **ACCT-02**: User can access cloud-backed persistence instead of local-only storage.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Male character creation | Product direction is intentionally limited to female and futa-female workflows |
| Free-text prompt editing as a core input path | Undermines the structured, conflict-aware value proposition |
| Monetization and subscriptions | Explicitly deferred until the core workflow is validated |
| Social feed, community, or marketplace features | Not part of the initial creator workflow |
| Video generation | Adds major complexity outside the v1 image workflow |
| Backend-first architecture and cloud sync | Static local-first delivery is the current constraint |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRTR-01 | Phase 1 | Complete |
| CRTR-02 | Phase 1 | Complete |
| CRTR-03 | Phase 1 | Complete |
| CRTR-04 | Phase 1 | Complete |
| PRMP-01 | Phase 2 | Pending |
| PRMP-02 | Phase 2 | Pending |
| PRMP-03 | Phase 2 | Pending |
| PRMP-04 | Phase 2 | Pending |
| PRMP-05 | Phase 2 | Pending |
| RAND-01 | Phase 3 | Pending |
| RAND-02 | Phase 3 | Pending |
| RAND-03 | Phase 3 | Pending |
| PSET-00 | Phase 4 | Pending |
| PSET-01 | Phase 4 | Pending |
| PSET-02 | Phase 4 | Pending |
| PSET-03 | Phase 4 | Pending |
| PSET-04 | Phase 4 | Pending |
| PSET-05 | Phase 4 | Pending |
| PSET-06 | Phase 4 | Pending |
| PSET-07 | Phase 4 | Pending |
| PSET-08 | Phase 4 | Pending |
| GLLY-01 | Phase 4 | Pending |
| GLLY-02 | Phase 4 | Pending |
| GLLY-03 | Phase 4 | Pending |
| GLLY-04 | Phase 4 | Pending |
| BRDG-01 | Phase 5 | Pending |
| BRDG-02 | Phase 5 | Pending |
| UX-01 | Phase 1 | Complete |
| UX-02 | Phase 1 | Complete |
| UX-03 | Phase 5 | Pending |
| UX-04 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 after roadmap revision for preset requirements*
