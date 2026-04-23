# AsHeardBy Release Checklist v0.1

## Deployment target

Use **Cloudflare Pages** for the first public deployment.

### Recommended Pages settings
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Node.js version: `20`

---

## Pre-release checks

### A. Build
- [ ] `npm install`
- [ ] `npm run build`
- [ ] No TypeScript errors
- [ ] No missing import / export issues

### B. Core playback checks
- [ ] Voice sample plays
- [ ] Noise sample plays
- [ ] Stereo sample plays
- [ ] Upload audio works
- [ ] Original / Filtered toggle changes output
- [ ] Filter switching updates sound
- [ ] Source switching works while staying stable

### C. Visual checks
- [ ] Band comparison updates per filter
- [ ] Left / Right balance appears for asymmetry mode
- [ ] Noise overlap appears for masking / tinnitus-style modes
- [ ] Range indicator appears for animal modes

### D. UI checks
- [ ] Hero looks correct on desktop
- [ ] Hero looks correct on mobile
- [ ] Main three-column layout collapses correctly on narrow screens
- [ ] Status text is readable
- [ ] Notes panel updates with filter changes
- [ ] No obvious overlap or clipping in cards / bars

### E. Safety / wording checks
- [ ] Reference / approximation wording remains visible
- [ ] Not-diagnosis wording remains visible
- [ ] Headphones recommendation shows for left-right asymmetry
- [ ] Volume caution remains visible

---

## First deployment flow

1. Connect `badjoke-lab/asheardby` to Cloudflare Pages
2. Set build command to `npm run build`
3. Set output directory to `dist`
4. Trigger the first deployment
5. Open the deployed URL on desktop
6. Run the core playback checks
7. Open the deployed URL on mobile
8. Run the mobile UI checks
9. Fix any blocking issues
10. Re-deploy

---

## Public-ready minimum line

The app is ready for first public exposure when:

- build succeeds
- built-in samples work
- upload works
- Original / Filtered switching works
- filter switching works
- no major layout break appears on desktop or mobile
- the site clearly states that it is reference / approximation and not diagnosis

---

## Post-release next steps

- Tune filter strength and listening feel
- Improve mobile spacing
- Split audio / visualization logic further if needed
- Add deployment notes to README if the release path becomes fixed
