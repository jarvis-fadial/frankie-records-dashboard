# Frankie dashboard build brief

Build a polished, responsive, zero-build static dashboard for `/` using only HTML, CSS, and browser JavaScript. The source data is `data/frankie.json`.

Acceptance criteria:

- Public static site; no auth, password, backend, database, or calls to Stakers Union infrastructure.
- Fast client-side full-text search across the structured record, with query in the URL when practical.
- Clear overview for a spouse/veterinary specialist: current documented status, key abnormalities, open follow-up items, and return precautions before lower-priority history.
- Sections or tabs for timeline, encounters, diagnostics/labs/imaging, medications, vaccines/preventives, weight trend, owner-reported updates, diet, and source inventory.
- Detail views should show exact record wording where clinically relevant, source label, evidence level, limitations, and dates. Avoid inventing clinical interpretations.
- Responsive on phone and desktop, keyboard-accessible controls, strong contrast, visible focus states, semantic headings, no horizontal overflow.
- No raw document downloads or direct identifiers are needed. Show that raw sources remain private.
- Include a noindex/noarchive policy in page metadata and `robots.txt` while keeping the URL publicly reachable.
- Use only local assets; no external CDN or runtime analytics.
- Add a small deterministic smoke-test script if useful; at minimum verify JSON loads and the static page has no missing asset references.

Visual direction: calm clinical record, warm off-white background, deep ink typography, restrained blue/teal status accents, clear amber uncertainty labels, generous spacing. It should feel like a fast handoff tool, not a generic admin SaaS template.
