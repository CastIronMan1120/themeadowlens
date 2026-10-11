---
name: Cloud-Only Execution
description: Strict enforcement of cloud-only operations, with exceptions for database migrations.
---
Do not run local Node.js or Python scratch scripts to query the Sanity database, test APIs, or run local development servers.
We are strictly using only Vercel and Git for logic and frontend.

ALL code testing, API verification, and logic execution must be done by committing to Git, pushing to GitHub, and verifying the live Vercel deployment.

EXCEPTION: You MAY use local scratch scripts for heavy Database Migrations (e.g., uploading 1GB+ of photos) or direct one-off CMS Asset Uploads that bypass the frontend.
