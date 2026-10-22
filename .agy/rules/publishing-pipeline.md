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
- **No Duplicated Photos on Root Venue Pages:** Root Venue pages (`/category/[slug]`) that have Sub-Venues must only display their Sub-Venue directory tiles and never render the individual photos belonging to their Sub-Venues.
- **Complete Add & Rename Cycle for Venues/Sub-Venues:** Custom Sanity Desk views (`VenuePhotoGridPane`) must detect newly created/untitled Category documents when `+` is clicked in the Structure menu and immediately show the Venue creation/rename form fields (`Title`, `Parent Venue`, `Slug`, `Description`), alongside inline Add/Rename controls in the Grid Manager.
