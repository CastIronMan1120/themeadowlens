import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './src/sanity/schema'
import { BulkCategorizer } from './src/sanity/components/BulkCategorizer'
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

            // 1. Warehouse (All Artworks)
            S.listItem()
              .title('?? The Warehouse')
              .child(
                S.list()
                  .title('Warehouse Views')
                  .items([
                    S.listItem()
                      .title('All Uploaded Photos')
                      .child(S.documentTypeList('artwork').title('All Artworks')),
                    S.listItem()
                      .title('?? Missing a Venue')
                      .child(
                        S.documentList()
                          .title('Photos Missing Venues')
                          .filter('_type == "artwork" && !defined(category)')
                      ),
                    S.listItem()
                      .title('What''s New (Live Ticker)')
                      .child(
                        S.documentList()
                          .title('Recently Published Photos')
                          .filter('_type == "artwork" && defined(image.asset)')
                          .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
                      )
                  ])
              ),
            
            S.divider(),
            
            // 2. Taxonomy (Split into Root and Sub)
            S.listItem()
              .title('Root Venues (Main)')
              .child(
                S.documentList()
                  .title('Root Venues')
                  .filter('_type == "category" && !defined(parentCategory)')
              ),
            S.listItem()
              .title('Subcategories')
              .child(
                S.documentList()
                  .title('Subcategories')
                  .filter('_type == "category" && defined(parentCategory)')
              ),
              
            S.divider(),
            
            // 3. Inner Pages
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
          ])
    })
  ],
  tools: (prev) => [
    ...prev,
    {
      name: 'bulk-categorizer',
      title: 'Bulk Categorizer',
      component: BulkCategorizer
    },
    {
      name: 'system-metrics',
      title: 'System & Storage',
      component: SystemMetrics
    }
  ],
  schema: {
    types: schemaTypes,
  },
})



