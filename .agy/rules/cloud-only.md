---
name: Cloud-Only Development Enforcements
description: Strict ban on local environments and scratch script execution.
---

# Development Rules

1. **No Local Servers:** Never execute `npm run dev`, `npm run start`, or any local development servers. All previewing must happen exclusively via Vercel staging URLs.
2. **No Local Test Scripts:** Do not create or run temporary `node` or `python` scratch scripts on the local machine to test code, check APIs, or query databases. Use the appropriate cloud tools or subagents instead.
3. **Strict No-Querying Policy:** Do NOT run local `node` scripts to query Sanity or test API keys. If you need to manipulate or query data, write a Next.js Server Action or API route (`src/app/api/...`), push it to GitHub, and invoke the live Vercel production endpoint via `Invoke-WebRequest`.
4. **Deployment Pipeline:** The only acceptable workflow for pushing code is committing to the main Git branch and deploying via Vercel CLI (`npx vercel --prod --yes`) or pushing to GitHub to trigger Vercel automatically.
5. **URL Enforcement:** Always instruct the user to test and view their site exclusively via the generated Vercel staging URL (e.g., `https://themeadowlens-app-green.vercel.app`) until the final GoDaddy DNS cutover is explicitly confirmed.
