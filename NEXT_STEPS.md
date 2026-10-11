# ?? NEXT SESSION PRIORITIES

The user has explicitly requested the following tasks be prioritized at the start of the next development session:

1. **Dynamic SEO Metadata Implementation:**
   - **Problem:** SEO metadata is currently missing from internal pages.
   - **Action:** Implement dynamic Next.js `generateMetadata()` on all internal routing pages, especially `/category/[slug]` (Gallery pages) and `/art/[slug]` (Individual Photograph pages). Ensure it pulls the description, title, and OG image dynamically from Sanity.

2. **Vercel Analytics Dashboard inside Sanity Studio:**
   - **Problem:** The user wants to view website traffic without leaving the CMS.
   - **Action:** Build a custom Sanity Studio tool/plugin that fetches and displays Vercel Analytics data (or Google Analytics, depending on tracking preference) directly within the Sanity Admin Dashboard.

*(Note logged on Oct 7)*
