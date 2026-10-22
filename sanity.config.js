import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './src/sanity/schema'
import { BulkCategorizer, AllPhotosGrid, VenuePhotoGridPane } from './src/sanity/components/BulkCategorizer'
import { SystemMetrics } from './src/sanity/components/SystemMetrics'

export default defineConfig({
  name: 'default',
  title: 'The Meadow Lens',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  basePath: '/studio',
  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content Management')
          .items([
            // 0. Global Settings
            S.listItem()
              .title('Homepage Settings')
              .child(
                S.editor()
                  .id('homepage')
                  .schemaType('homepage')
                  .documentId('homepage')
                  .title('Homepage Details')
              ),
              
            S.divider(),

            // 1. Warehouse (All Artworks & Unassigned Grid Views)
            S.listItem()
              .title('The Warehouse')
              .child(
                S.list()
                  .title('Warehouse Views')
                  .items([
                    S.listItem()
                      .title('All Uploaded Photos (Grid View)')
                      .child(
                        S.component(AllPhotosGrid)
                          .id('all-uploaded-photos-grid')
                          .title('All Uploaded Photos (Grid View)')
                      ),
                    S.listItem()
                      .title('Missing a Venue (Warehouse Grid)')
                      .child(
                        S.component(BulkCategorizer)
                          .id('missing-venue-warehouse-grid')
                          .title('Photos Missing Venues (Grid View)')
                      ),
                    S.listItem()
                      .title('All Artworks (Standard Form Editor)')
                      .child(S.documentTypeList('artwork').title('All Artworks (Form List)'))
                  ])
              ),
            
            S.divider(),
            
            // 2. Taxonomy (Split into Root Venues and Sub-Venues with Grid Maintenance Screens)
            S.listItem()
              .title('Root Venues (Main)')
              .child(
                S.documentList()
                  .title('Root Venues')
                  .filter('_type == "category" && !defined(parentCategory)')
                  .child((categoryId) =>
                    S.document()
                      .schemaType('category')
                      .documentId(categoryId)
                      .views([
                        S.view
                          .component(VenuePhotoGridPane)
                          .title('Photo Grid Maintenance')
                          .id('venue-photo-grid'),
                        S.view.form().title('Venue Settings & SEO')
                      ])
                  )
              ),
            S.listItem()
              .title('Sub-Venues (Subcategories)')
              .child(
                S.documentList()
                  .title('Sub-Venues')
                  .filter('_type == "category" && defined(parentCategory)')
                  .child((subVenueId) =>
                    S.document()
                      .schemaType('category')
                      .documentId(subVenueId)
                      .views([
                        S.view
                          .component(VenuePhotoGridPane)
                          .title('Photo Grid Maintenance')
                          .id('subvenue-photo-grid'),
                        S.view.form().title('Sub-Venue Settings & SEO')
                      ])
                  )
              ),
            S.listItem()
              .title('★ Guest Photos (Invited Showcase)')
              .child(
                S.document()
                  .schemaType('category')
                  .documentId('cat-guest-photos-7401')
                  .title('Guest Photos (Invited Showcase)')
                  .views([
                    S.view
                      .component(VenuePhotoGridPane)
                      .title('Guest Photo Grid & Publisher')
                      .id('guest-photo-grid'),
                    S.view.form().title('Guest Showcase Settings & SEO')
                  ])
              ),
              
            S.divider(),
            
            // 3. Inner Pages & CRM
            S.listItem()
              .title('Artist Profile')
              .child(
                S.editor()
                  .id('artistProfile')
                  .schemaType('artist')
                  .documentId('artistProfile')
                  .title('Artist Profile')
              ),
            S.listItem()
              .title('News & Announcements')
              .child(S.documentTypeList('news').title('Timeline Updates')),
            S.listItem()
              .title('Inquiry Leads (CRM)')
              .child(
                S.documentTypeList('lead')
                  .title('Customer Inquiries')
                  .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
              ),
            S.listItem()
              .title('📊 Visitor Analytics & Storage')
              .child(
                S.component(SystemMetrics)
                  .id('visitor-analytics-and-storage')
                  .title('Visitor Analytics & Storage')
              ),
          ])
    })
  ],
  tools: (prev) => [
    ...prev,
    {
      name: 'bulk-categorizer',
      title: 'Warehouse & Venue Manager',
      component: BulkCategorizer
    },
    {
      name: 'system-metrics',
      title: 'Analytics & Storage',
      component: SystemMetrics
    }
  ],
  schema: {
    types: schemaTypes,
  },
})
