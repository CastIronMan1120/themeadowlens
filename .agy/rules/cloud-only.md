---
name: Cloud-Only Execution
description: Strict enforcement of cloud-only operations.
---
Do not run local Node.js or Python scratch scripts to query the Sanity database, test APIs, or run local development servers.
We are strictly using only Vercel and Git.

ALL code testing, API verification, and logic execution must be done by committing to Git, pushing to GitHub, and verifying the live Vercel deployment.
Do not use the local terminal to execute code that interacts with the cloud database.