# Local implementation validation

Validated on 2026-09-13. No deployment, commit, push, or production access.

## Repeatable static check

`node scripts/smoke-test.mjs` checks JSON parsing/schema, required sections, local
asset references, JavaScript syntax, indexing directives and the single local
runtime fetch. It requires only Node.js and creates no artifacts.

## Browser checks

Local Playwright Chromium was used because no Browser/IAB tool was available.
The browser loaded only the loopback HTTP server for this repository.

- Ten record sections rendered with no JavaScript page errors.
- Nested values, multi-word queries, source labels and dataset metadata matched.
- Query state survived reload; clear removed the URL parameter.
- No-result searches, literal HTML-like input, and navigation out of search worked.
- Matching disclosures opened, with original disclosure state restored on clear.
- Keyboard Tab reached the skip link.
- Expanded record layouts had no horizontal overflow at 320, 390, 768 and 1440px.
- No raw PDF/image links or invoice identifier appeared in the rendered document.
- Page network requests stayed on the local server.

## Visual review

Desktop (1440 × 1000) and phone (320 × 900) screenshots were inspected locally.
The implementation follows PROJECT_BRIEF.md directly; no generated image concept
or external visual asset is part of this record interface.

Reviewed the overview hierarchy, exact clinical copy, serif heading/body typography,
off-white/ink/teal palette, amber uncertainty treatment, spacing and responsive flow.
Fixed flex shrinking that wrapped Clear and a navigation number. Replaced the
always-expanded phone navigation with a native expandable section menu to bring
the current status earlier in the phone layout. Record wording was retained;
interface labels only explain search, provenance, dates and uncertainty.

Temporary browser dependencies and screenshots are removed after inspection.
