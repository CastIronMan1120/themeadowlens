---
name: Publishing Pipeline
description: Staging and publishing rules for new artworks.
---
All bulk photo uploads and automated ingestion scripts MUST create documents as drafts (using `_id: "drafts.<uuid>"`).
This safely quarantines them from the live production site.
Photos must never go live without an assigned Category/Venue.
Uncategorized staging photos are to be managed and published using the custom Bulk Categorizer React plugin inside the Studio.


- The Sanity Studio's Bulk Categorizer is the definitive 'Warehouse' tool. It must natively support Bulk Uploading, Bulk Deleting, and Duplicate File Detection so the user does not need to run developer terminal scripts to manage staging photos.
- **Automatic Caption & Title Derivation on Upload:** Whenever photos are uploaded (via Studio or script), automatically derive `title`, `displayTitle`, and `caption` (and `species` for biological subjects) by pulling the text from the front of the filename up to, but not including, the 2-digit year prefix (`^(.+?)\s+(\d{2})-[A-Za-z0-9]`, e.g., `American Goldfinch 24-PA031058 Edit.jpg` -> `American Goldfinch`), while storing the raw filename in `fileName`.
- **Automatic Canonical `species` & Unique `seo` Tagging Across All Lifecycles:** Never require the admin to manually type the `species` field or `seo` metadata in the SEO detail screen. `species` (stripped of parenthetical modifiers like `(immature)`, `(male)`, `(female)`, `(juvenile)` and normalized to Title Case) and unique `seo` (`metaTitle`, `metaDescription`, `keywords`) must be derived and populated automatically across all lifecycles: (1) Photo Upload (`handleUpload`), (2) Warehouse Move/Copy (`handleMoveTo` / `handleCopyTo`), (3) Opening the `✨ Optimize / Edit` modal, and (4) Clicking `✨ 1-Click Auto-Optimize Photo & SEO` (`handleAutoOptimizeArtwork`).
- **No Duplicated Photos on Root Venue Pages:** Root Venue pages (`/category/[slug]`) that have Sub-Venues must only display their Sub-Venue directory tiles and never render the individual photos belonging to their Sub-Venues.
- **Complete Add, Rename & Slug Overwrite Cycle for Venues/Sub-Venues:** Custom Sanity Desk views (`VenuePhotoGridPane`) and modals must auto-sync `slug` and `seo` (`metaTitle`, `metaDescription`, `keywords`) whenever a Venue or Sub-Venue title is entered or renamed (unless manually overridden), allow unrestricted manual slug overwriting in the `URL Slug` field, and atomically update the published document while deleting any stale `drafts.<id>` category document on save.
- **Scroll-Stable Navigation Header:** Never shrink the in-flow layout height of a `sticky` header on scroll without a constant-height outer `<header>` wrapper and scroll hysteresis (`scrollY > 80` to compact, `scrollY < 20` to expand), and never use `transition-all` to animate `font-size` on scroll.
