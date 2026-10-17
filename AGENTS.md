<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:themeadowlens-no-local-server -->
# Cloud-Only Development & Build Verification Constraint
- NEVER run or instruct the user to run the Next.js development server locally (`npm run dev` or `next dev`). The user manages multiple projects and local ports conflict. All previews happen exclusively on Vercel (`https://themeadowlens-app-green.vercel.app`) and Sanity Studio (`/studio`).
- DO run `npm run build` locally before pushing to GitHub to guarantee zero syntax or Turbopack compilation errors on Vercel.
- Local Node.js scripts using `@sanity/client` (stored in `scratch/`) ARE permitted for querying, auditing, and migrating the Sanity Cloud dataset.
- NEVER use PowerShell `-replace` or PowerShell double-quoted strings to modify JS/JSX files, as PowerShell corrupts JS template literals (`${...}`) and injects literal `` `n `` characters. Use `replace_file_content` or `write_to_file` exclusively.
<!-- END:themeadowlens-no-local-server -->

<!-- BEGIN:themeadowlens-admin-architecture -->
# Sanity Studio & Gallery Architecture Rules
1. **Visual Grid Over Vertical Lists:** In Sanity Studio, standard vertical document lists have thumbnails that are too small for identifying wildlife/nature photography. All photo management views (Warehouse, All Uploaded Photos, Root Venue & Sub-Venue Maintenance) must use a large-thumbnail visual grid interface with checkboxes, sorting, and batch actions (`Move-To`, `Copy-To`, `Decategorize to Warehouse`, `Delete`).
2. **Category & Sub-Venue Management:** Artworks link to categories via `category._ref` (or `subcategory._ref`). Admin tools must support full lifecycle maintenance of both Root Venues and Sub-Venues, including deleting venues/sub-venues safely.
3. **Homepage Ticker Standard:** Maintain a single curated ticker on the homepage titled **"Featured Works"**, controlled via `Homepage Settings` (`featuredArtworks` and `featuredTickerSpeed`).
4. **Navigation Standard:** The primary return link in the top navigation bar is labeled **"HOME"** (linking to `/`).
5. **Sanity CRM Pipeline:** Never install third-party email services (Resend, SendGrid, etc.). All inquiries are stored directly as `lead` documents in Sanity.
<!-- END:themeadowlens-admin-architecture -->
