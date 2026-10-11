---
name: Publishing Pipeline
description: Staging and publishing rules for new artworks.
---
All bulk photo uploads and automated ingestion scripts MUST create documents as drafts (using `_id: "drafts.<uuid>"`).
This safely quarantines them from the live production site.
Photos must never go live without an assigned Category/Venue.
Uncategorized staging photos are to be managed and published using the custom Bulk Categorizer React plugin inside the Studio.


- The Sanity Studio's Bulk Categorizer is the definitive 'Warehouse' tool. It must natively support Bulk Uploading, Bulk Deleting, and Duplicate File Detection so the user does not need to run developer terminal scripts to manage staging photos.
