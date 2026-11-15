# WellnessHubID

A personal wellness web app by Evan Naraya, organized into **BodyFit Hub** and **Discipline Hub**. This repository publishes the editable v7.41 HTML, CSS and JavaScript source.

**[Live website](https://wellnesshubid.netlify.app)** · **[Engineering portfolio](https://evannaraya.com)**

## Stack

Vanilla JavaScript, HTML and CSS, with a web app manifest and service worker. Browser `localStorage` stores personal progress and preferences. **This snapshot does not use React, Vite, an npm build, or a server-side application.**

## Implemented areas

- Calorie calculator and BodyFit onboarding.
- Meal planning and training guides with exercise media and audio cues.
- Discipline Hub with daily check-ins, habit tracking, progress and a local vault.
- Future Map with editable goals, milestones and a searchable notebook.
- A service worker for the application shell and selected runtime assets; video range requests go to the network.

These describe source features, not clinical validation, production usage metrics or a comprehensive QA result. Labels such as “AI” and “BioScan” in the inherited interface do not establish a live AI service or medically validated body analysis. The public snapshot contains no Android wrapper, APK or signing keys.

## Run locally

Python 3 is sufficient. No package installation or build step is needed.

1. Clone the repository.
2. Restore media from the original v7.41 FULL archive:

   ```sh
   python3 scripts/restore_media.py --archive /path/to/wellnesshubid_v741_future_map_editable_notebook_FULL.zip
   ```

   On Windows, use `py` in place of `python3` if needed.

3. Start the site from the repository root:

   ```sh
   python3 -m http.server 8080
   ```

4. Open `http://localhost:8080/`.

For reviewers without the archive, media can also be requested from the live deployment:

```sh
python3 scripts/restore_media.py --base-url https://wellnesshubid.netlify.app
```

The downloader accepts only files matching the v7.41 manifest's byte size and SHA-256. The live deployment may change or become unavailable, so the original archive is the reproducible restoration path. Without media, source remains inspectable, but images, audio, video and service-worker installation will be incomplete. External Google Fonts, Font Awesome and the model-viewer module require network access.

## Source map

| Entry | Purpose |
| --- | --- |
| `index.html` | Main landing page and hub selection |
| `bodyfit.html`, `calculator.html`, `bioscan.html`, `result.html` | BodyFit flow and result views |
| `meal.html`, `training-guide.html` | Meal and training interfaces |
| `app.html` | Discipline Hub, Future Map and notebook |
| `progress.html`, `evolution.html`, `vault.html` | Supporting progress and personal data views |
| `service-worker.js`, `manifest.json` | PWA shell and offline behavior |
| `media-manifest.json` | Paths, sizes and hashes of original media |
| `docs/V741-RELEASE-NOTES.md` | Original v7.41 release notes |

The application retains the original multi-page layout, inline scripts/styles and historical patch layers. It is a source publication of an existing product, not a framework migration or a claim that the legacy code has been fully refactored.

## Media, privacy and publication boundary

About 234 MB of original media is restored separately to keep Git source history lightweight. The manifest inventories media; it does not grant reuse rights. No open-source license is granted by this publication. Original backup pages, extracted debugging scripts and the bulk of historical patch notes are omitted. No client source code is included.

Personal progress is stored in the browser rather than a hosted account database. Avoid entering sensitive information on a shared device. The original GA4 measurement ID is replaced with an unconfigured placeholder in `analytics.js`; no analytics credentials are needed to run this snapshot.
