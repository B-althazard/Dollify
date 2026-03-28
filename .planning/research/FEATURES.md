# Feature Landscape

**Domain:** Mobile-first adult AI character creation and prompt-generation web app for creators
**Project:** Dollify
**Researched:** 2026-03-29
**Overall confidence:** MEDIUM

## Ecosystem Read: What products in this space actually offer

Across current AI character/image products, the recurring pattern is:

1. **Character definition** via prompt text, tags, or reusable character objects
2. **Generation controls** via model/style/settings selection
3. **Consistency helpers** via references, saved settings, seeds, or metadata re-use
4. **Iteration workflows** via randomization, variations, edit tools, and history/gallery
5. **Reuse/export** via saved characters, prompt chunks, prompt copying, or metadata import

For Dollify, the opportunity is **not** to out-feature general AI image suites. It is to make the adult creator workflow faster and safer by replacing prompt writing with a **schema-driven, conflict-aware character builder** optimized for female/futa persona creation and repeatable outputs.

## Table Stakes

Features users will reasonably expect from a serious AI character creator. Missing these will make the app feel incomplete even if the UI is novel.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Structured character attribute selection | Every serious character tool lets users define hair, face, body, outfit, framing, etc. | High | Must cover identity, face, eyes, hair, body, styling, pose/composition, and conditional futa attributes. |
| Prompt output from selections | Users expect the app to turn choices into something directly usable for generation. | High | Output should include positive prompt, negative prompt, and generation guidance. |
| Model selection + model-aware settings | Current tools expose model/style choice and often steps/guidance or equivalent controls. | Medium | Even if hidden behind presets, users need model-specific behavior. |
| Save/load presets | Reuse is table stakes for iterative creator workflows. | Medium | Must save full form state, not just prompt text. |
| Generation history / gallery | Users expect to revisit prior generations and reuse what worked. | Medium | Each image should store prompt package + full form values. |
| Tap image to reload settings | History without rehydration is weak; major tools expose metadata/settings reuse. | Medium | Critical for “I want this same girl but with a new hairstyle.” |
| Copy prompt / export prompt package | Prompt portability is expected, especially in hybrid or external generation flows. | Low | Include one-tap copy for prompt and ideally settings bundle. |
| Random variation support | Users expect quick exploration without re-entering everything manually. | Medium | Basic randomize is table stakes; lock-aware constrained randomize is the better implementation. |
| Reference/consistency workflow | Market expectation is now “help me keep the same character.” | High | MVP can satisfy this via preset reload + prior image metadata; richer reference-image guidance can come later. |
| Negative prompt / undesired content support | Many image tools expose exclusions or undesired content controls. | Medium | Best handled automatically from schema + model config, not free text. |
| Mobile-first usable UI | Your target audience works from phones; mainstream tools increasingly support app/mobile access. | High | Thumb reach, swipe navigation, sticky primary actions, fast reload are mandatory. |
| Local persistence of work-in-progress | Users expect not to lose current setup or recent images on refresh. | Medium | Local-first persistence fits project constraints and creator behavior. |

## Differentiators

These are the features that can make Dollify meaningfully better than generic AI image generators for adult creators.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Conflict-aware schema-driven form with **no free-text core flow** | Biggest UX advantage: prevents invalid combinations and removes prompt-writing burden. | High | This is the product thesis, not a nice-to-have. |
| Model-specific promptEngine with style/settings advisor | Most tools expose raw settings; few do the optimization for the user. | High | Should adapt prompt order, weighting, negative prompt strategy, and advice per model. |
| Lock-aware constrained randomizeEngine | Better than generic random prompt generation because it preserves creator intent while exploring variations. | High | Needed for workflows like “keep face/body, vary hair/outfit only.” |
| Adult-creator-focused schema | Generic tools optimize for broad creativity; Dollify can optimize for replicas, collabs, and monetizable persona variants. | High | Means creator-relevant taxonomy, not fantasy RPG archetypes. |
| Gallery-driven character continuity | Turning a generated image into a reusable character state makes iteration much faster. | Medium | Strong differentiator if reload is instant and reliable. |
| Low-cost clipboard + ViolentMonkey generation bridge | Lets the product validate before full API spend while still feeling like a generation app. | Medium | Operationally smart and aligned with project constraints. |
| Preset thumbnails from latest render | Makes saved presets visually browsable, which matters on mobile. | Low | Small feature, high perceived polish. |
| Conditional UI for female/futa-only scope | Narrow scope improves speed, quality, and rule accuracy. | Medium | Better than pretending to be universal and delivering a bloated schema. |
| Creator workflow actions: generate, randomize, copy, save, reload in 1-2 taps | Mobile creators care about throughput more than deep studio tooling. | Medium | Must minimize context switching. |
| Privacy/local-first early workflow | Adult creators may strongly prefer local browser persistence before account creation. | Medium | Not unique in theory, but valuable in this domain. |

## Anti-Features

Features to explicitly avoid in early roadmap phases.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Free-text prompt authoring as a first-class path | Undermines the core differentiator and reintroduces invalid/low-quality prompt states. | Keep core flow fully curated; allow generated prompt copy-out only. |
| General-purpose all-character support | Broad scope explodes schema complexity and weakens rule quality. | Stay focused on female and futa-female creation. |
| Social/community feed in MVP | Adds moderation, storage, accounts, and abuse problems before core workflow is proven. | Keep gallery local and private first. |
| Cloud accounts/sync in first milestone | Adds backend complexity without validating core value. | Use local storage / IndexedDB first. |
| Video generation early | Expands model, storage, performance, and UX complexity too soon. | Nail still-image persona creation first. |
| Full in-app editor suite in MVP | Inpainting/canvas/upscale are useful, but they are not the main wedge. | Start with prompt + generation + gallery loop; add edits later if demanded. |
| Marketplace / preset sharing early | Requires content moderation and product surface area the app does not yet need. | Support private saved presets only. |
| Overly broad “AI companion/chat” features | Adjacent market, different product. Risks losing focus. | Stay on character creation and prompt-generation workflow. |
| Over-configurable expert settings UI | Mobile users will bounce if buried in CFG/sampler/weight syntax. | Put complexity behind model presets and advisor text. |

## Recommended Feature Set for Requirements Definition

### Phase-1 / MVP features

These should be treated as the practical MVP for validation.

1. **Schema-driven character builder**
2. **Conflict/rule evaluation**
3. **Model-aware prompt package generation**
4. **Generate / Copy / Randomize core actions**
5. **Lock-aware variation randomization**
6. **Save/load preset workflow**
7. **Image gallery with metadata-backed reload**
8. **Local persistence**
9. **Mobile-first navigation and gestures**
10. **Clipboard-first external generation flow**

### Phase-2 differentiators worth adding after validation

1. **Direct API generation**
2. **Reference-image-assisted consistency**
3. **Preset organization/search/filtering**
4. **Advanced generation advice per model**
5. **Batch image actions and bulk export**
6. **Light edit loop: variation, upscale, inpaint hooks**

## Feature Dependencies

```text
Schema taxonomy → formEngine rendering
Schema taxonomy → conflict/rule engine
formEngine state → promptEngine
model config registry → promptEngine advice/settings
formEngine state + locks + rules → randomizeEngine
promptEngine output → clipboard/export flow
promptEngine output + generation result → gallery metadata
gallery metadata → tap-to-reload character state
gallery image + form state → preset thumbnail system
local persistence → reliable mobile workflow
clipboard bridge → low-cost external generation automation
stable external generation flow → later direct API replacement
```

## Complexity Notes by Feature Area

### Low
- Copy prompt / copy package
- Preset thumbnails
- Basic save/load preset UI

### Medium
- Gallery/history with metadata reload
- Model picker and settings presets
- Clipboard/automation bridge
- Local persistence and restore state
- Batch image delete/export

### High
- Comprehensive schema authoring
- Conflict-aware rule engine
- Prompt engine with per-model optimization
- Lock-aware constrained randomization
- Mobile-first UX that remains fast with large forms
- Consistency features beyond simple preset reload

## Opinionated Product Recommendation

For this product, **table stakes are not “text prompt box + generate.”** In this niche, table stakes are:

- fast persona definition,
- repeatability,
- saved state,
- prompt portability,
- and mobile iteration.

The strongest differentiation is to make **structured character creation itself** the product. That means requirements should favor:

- curated fields over raw prompting,
- rules over post-hoc cleanup,
- reloadable state over one-off prompt strings,
- and creator-speed mobile workflows over generic desktop “studio” breadth.

## MVP Recommendation

Prioritize:

1. **Conflict-aware schema form**
2. **Model-specific prompt package generation**
3. **Lock-aware randomization**
4. **Local gallery with tap-to-reload**
5. **Save/load presets with thumbnails**
6. **Clipboard-first generation bridge**

Defer:

- **Direct API generation**: valuable, but not required to validate core UX
- **Reference image consistency tooling**: high value, but preset/gallery reload covers the first consistency need
- **Advanced editing suite**: adjacent to, but not central to, the product thesis
- **Accounts/community/social**: wrong complexity too early

## Confidence Notes

| Area | Confidence | Notes |
|------|------------|-------|
| Generic AI character product expectations | HIGH | Verified across official NovelAI, OpenArt, and SeaArt product/docs pages. |
| Consistency/history/randomization as expected features | HIGH | Verified in official NovelAI docs and OpenArt/SeaArt feature pages. |
| Adult-creator-specific workflow needs | MEDIUM | Strongly supported by project docs; weaker official market-source coverage because many niche adult products were inaccessible or poorly documented. |
| Anti-features / roadmap exclusions | MEDIUM | Opinionated product strategy based on scope, constraints, and common product failure modes. |

## Sources

- Internal project context:
  - `.planning/PROJECT.md`
  - `resources/_theIdeaScribble.md`
  - `resources/brainstorm-v5.md`
  - `resources/VixenLabs_ArchSpec_v1.md`
- Official / first-party sources:
  - NovelAI image docs overview: https://docs.novelai.net/en/image/
  - NovelAI consistent character tutorial: https://docs.novelai.net/en/image/tutorial-charactercreation
  - NovelAI prompt randomizer: https://docs.novelai.net/en/image/promptrandomizer
  - NovelAI precise reference: https://docs.novelai.net/en/image/precisereference
  - NovelAI vibe transfer: https://docs.novelai.net/en/image/vibetransfer
  - NovelAI history: https://docs.novelai.net/en/image/history
  - NovelAI multi-character prompting: https://docs.novelai.net/en/image/multiplecharacters
  - OpenArt characters: https://openart.ai/characters
  - SeaArt AI Character Generator: https://www.seaart.ai/features/ai-character-generator
- Discovery/search support (LOW confidence, directional only):
  - DuckDuckGo result sampling for 2026 AI character generator ecosystem queries
