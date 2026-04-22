# AsHeardBy

AsHeardBy is a browser-based comparative listening study in the TheirSense line.

It does **not** aim to diagnose hearing or precisely reproduce an individual's perception. The project translates **commonly described hearing differences** into a reference-style interactive experience.

## Core stance

The guiding idea is:

> This is how a hearing difference is commonly described or written about.  
> AsHeardBy translates that into a comparison experience.

So the project is positioned as:

- reference / approximation / translated experience
- not diagnosis
- not exact reproduction
- not a medical tool

## Current MVP scope

- single-page application
- built-in samples plus user-uploaded audio
- Original / Filtered comparison on the same source
- Condition filters plus Animal Reference filters
- simple visual explanation layer
- browser-side audio generation and Web Audio processing

## Current filter set

### Condition
- High-frequency loss reference
- Speech in noise reference
- Left-right asymmetry reference
- Tinnitus overlay reference
- Reduced clarity reference

### Animal Reference
- Dog reference
- Bat reference
- Elephant reference

## Visual layer

The current MVP uses:

- band comparison as the primary visual
- left/right balance for asymmetry
- noise overlap for masking / tinnitus-style modes
- human range vs extended range indicator for animal modes

## Current implementation snapshot

### Main files
- `src/App.tsx` — page container and state wiring
- `src/layout.tsx` — `HeroSection`, `AboutPanel`
- `src/sourcePanel.tsx` — source selection panel
- `src/modesPanel.tsx` — filter selection panel
- `src/notesPanel.tsx` — notes panel
- `src/comparePanel.tsx` — compare / player / visual panel
- `src/appHooks.ts` — app-level hooks
- `src/audio.ts` — built-in audio generation, Web Audio engine, `useAudioEngine`
- `src/visualization.ts` — band comparison model
- `src/data.ts` — UI text, sources, filters
- `src/types.ts` — shared types

### App-level hooks
- `useUploadedAudio`
- `useCompareStatusText`
- `useResolvedSource`

## Project docs

- `docs/00-mvp-spec.md`
- `docs/01-mvp-wire.md`
- `docs/02-ui-text.md`
- `docs/03-components.md`
- `docs/04-state-transitions.md`

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
