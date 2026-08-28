import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './src/sanity/schema'

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
            // 1. Artworks
            S.listItem()
              .title('Gallery Artworks')
              .child(S.documentTypeList('artwork').title('All Artworks')),
            
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
  schema: {
    types: schemaTypes,
  },
})
