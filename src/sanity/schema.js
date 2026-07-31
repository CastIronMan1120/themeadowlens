const artwork = {
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Photograph',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'location',
      title: 'Location / Setting',
      type: 'string',
      description: 'e.g., The Meadowlands, NYC Skyline, etc.'
    },
    {
      name: 'year',
      title: 'Year Captured',
      type: 'number'
    },
    {
      name: 'story',
      title: 'The Story (Narrative)',
      type: 'array',
      of: [{type: 'block'}],
      description: 'The story behind the lens for Focus Mode.'
    },
    {
      name: 'price',
      title: 'Base Price (USD)',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    }
  ],
}

export const schemaTypes = [artwork]
