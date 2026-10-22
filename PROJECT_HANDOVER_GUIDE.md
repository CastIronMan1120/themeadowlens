# The Meadow Lens — Master Project Completion & Operations Handover Guide

**Date:** October 22, 2026  
**Project:** The Meadow Lens — *Fine Art Wildlife, Bird, Flora, Fauna & Scenic Photography by David McClure*  
**Official Studio Email:** `dmc1120@themeadowlens.com`

---

## 1. Live Production Environment & Infrastructure

**100% Pure 3-Pillar Architecture:** The Meadow Lens operates exclusively on **Vercel** (Hosting & Edge Network), **GitHub** (Source Control), and **Sanity Cloud** (Headless CMS & Image CDN).

| Component | Production Details |
| :--- | :--- |
| **Primary Custom Domains** | `https://themeadowlens.com` & `https://www.themeadowlens.com` |
| **Vercel Staging / Alias URL** | `https://themeadowlens-app-green.vercel.app` |
| **Admin Studio URL** | `https://themeadowlens-app-green.vercel.app/studio` (or `https://themeadowlens.com/studio`) |
| **Visual Site Directory** | `https://themeadowlens-app-green.vercel.app/sitemap` |
| **Google XML Sitemap** | `https://themeadowlens.com/sitemap.xml` (**1,435 active indexed URLs**) |
| **Robots Crawl File** | `https://themeadowlens.com/robots.txt` |
| **GitHub Repository** | `CastIronMan1120/themeadowlens` (Branch: `main`) |
| **Sanity Cloud Project** | Project ID: `h7ncr8cq` • Dataset: `production` |

---

## 2. Day-to-Day Admin Dashboard (`/studio`) Workflows

### A. Uploading New Photographs (Automatic Caption, Year & SEO Extraction)
1. Open **`/studio`** and navigate to either **`Warehouse & Venue Manager`** or a specific Sub-Venue under **`Sub-Venues (Subcategories)`**.
2. Click **`Select Files to Upload`** and select your `.jpg` / `.png` files (e.g., `American Goldfinch 24-PA031058 Edit.jpg`).
3. `VenueGridManager.jsx` automatically:
   - Extracts the **Caption Title (`displayTitle` & `caption`)** from the front of the filename up to (but not including) the 2-digit year prefix -> **`American Goldfinch`**.
   - Extracts the **Capture Year (`year`)** from `24-` -> **`2024`**.
   - Extracts the **4-Digit Study Number** from `PA031058` -> **`Study #1058`** and populates a 100% unique **`seo`** block (`metaTitle`, `metaDescription`, `keywords`).
   - Saves the original filename in `fileName` to prevent accidental duplicate uploads while allowing multiple distinct studies of the same species.
   - If uploaded directly inside an active Venue/Sub-Venue, the photo is **published live immediately (`● LIVE ON SITE` + `✓ SEO Ready`)**.

### B. Adding, Renaming, or Deleting Venues & Sub-Venues
1. **To Add a Root Venue or Sub-Venue:**
   - Click **`➕ Add Venue / Sub-Venue`** in the Studio toolbar (or click the **`+`** icon in the left Structure sidebar next to `Root Venues (Main)` or `Sub-Venues (Subcategories)`).
   - Enter the **Venue Title**, choose **Root Venue** or **Sub-Venue (Under a Root Venue)**, review the auto-generated URL slug & SEO metadata, and click **Create & Publish**.
2. **To Rename or Edit a Venue or Sub-Venue:**
   - Click **`✏️ Rename / Edit Venue & SEO`** in the Venue header (or open **`Manage / Rename / Delete Venues`** and click **`✏️ Rename`** next to any venue).
   - Update the title, optionally click **`↻ Match New Title`** to sync the URL slug, and click **Save & Publish Venue Live**.

### C. Publishing an Invited Guest Photo (`★ Guest Photos`)
1. Open **`★ Guest Photos (Invited Showcase)`** in the left `/studio` sidebar.
2. Click the emerald **`★ + Add Invited Guest Photo`** button.
3. Select the guest's photo file, enter the **Guest Photographer Name**, optional **Facebook/Website URL**, and **Guest Note / Story**, and click **Upload & Publish Guest Photo Live**.
4. Click **`📋 Copy Msg & Links for Guest`** on the card to copy a ready-to-send Facebook message with the live `/art/[slug]` product link and `/category/guest-photos` showcase link.

### D. Viewing Customer Inquiries (`Inquiry Leads (CRM)`)
1. Open **`Inquiry Leads (CRM)`** in the left `/studio` sidebar.
2. All collector inquiries submitted via `Inquiries & Comments` (`/?inquire=true` -> `/api/inquire`) appear newest-first with the collector's `Name`, `Email`, `Phone`, `Artwork Interest`, and `Message`.

---

## 3. Google Search Console Submission
1. Sign in to [Google Search Console](https://search.google.com/search-console) for `themeadowlens.com`.
2. In the left menu, click **Sitemaps**.
3. Under **Add a new sitemap**, enter `https://themeadowlens.com/sitemap.xml` and click **Submit**.
