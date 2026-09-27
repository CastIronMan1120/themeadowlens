<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:themeadowlens-no-local-server -->
# Cloud-Only Development Constraint
Do NEVER run or instruct the user to run the Next.js development server locally (e.g., `npm run dev` or `next dev`). The user manages multiple projects and local ports conflict. 
All code changes must be pushed to GitHub and previewed exclusively on the Vercel staging URLs (`https://themeadowlens-app-green.vercel.app`). Similarly, the Sanity CMS must only be accessed via the Vercel URL (`/studio`), never via localhost.
<!-- END:themeadowlens-no-local-server -->
