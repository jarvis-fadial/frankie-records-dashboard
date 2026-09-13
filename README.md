# Frankie clinical record dashboard

Standalone, public-link dashboard for rapid review of Frankie’s veterinary record summary.

This project is intentionally separate from the Stakers Union website and any production application. It is a static site with no login, password, database, or runtime connection to the private records folder.

## Data boundary

- `data/frankie.json` is a derived snapshot of the maintained local record set.
- Raw PDFs, images, invoices, direct identifiers, microchip number, patient IDs, policy number, prescription numbers, and tokenized imaging links are excluded.
- The page labels clinician-documented findings versus owner-reported observations and preserves source uncertainty.
- The public URL is for convenient household/veterinary handoff, not a replacement for current instructions from Frankie’s treating veterinarian.

## Local preview

This is a zero-build static site. From the project directory:

```bash
python -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Deployment boundary

Deploy only this repository as a separate GitHub Pages project. Do not connect it to `stakersunion/website`, `www.stakersunion.com`, or any existing production deployment.

## Validation and behavior

Run the dependency-free deterministic smoke test:

```bash
node scripts/smoke-test.mjs
```

The page fetches only `data/frankie.json`. Search matches every whitespace-separated
term against complete entry text, including collapsed details and source labels.
Matching details open during search; clearing restores the prior disclosure state.
The query is stored in `?q=` and restored on reload. Choosing a section clears an
active search so that the destination is visible.

Status dates and dataset update timestamps are displayed separately. Source paths
are translated to plain-text labels, while individual provider names, invoice
fields and private extraction paths are excluded from the rendered interface.
The supplied JSON is unchanged. Weight bars include encounter vitals and label
pounds-to-kilograms conversion and potentially carried-forward measurements.

All production assets are local; there is no build step or runtime dependency.
No deployment, commit or push is part of this implementation.
