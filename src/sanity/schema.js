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
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Birds', value: 'birds'},
          {title: 'Collages and Compilations', value: 'collages'},
          {title: 'Captioned Series', value: 'captioned'},
          {title: 'Nature', value: 'nature'},
          {title: 'Featured', value: 'featured'}
        ],
        layout: 'radio'
      }
    },
    {
      name: 'roomSetting',
      title: 'Exhibition Room Setting',
      type: 'string',
      description: 'Select the virtual room where this artwork will hang on the homepage.',
      options: {
        list: [
          {title: 'Modern Living Room (Bright, Lifestyle)', value: 'living-room'},
          {title: 'Dark Gallery Wall (Moody, Dramatic)', value: 'dark-gallery'},
          {title: 'Minimalist Office (Sleek, Professional)', value: 'office'}
        ],
        layout: 'radio'
      },
      initialValue: 'living-room'
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
      type: 'string'
    },
    {
      name: 'story',
      title: 'The Story (Narrative)',
      type: 'array',
      description: 'The story behind the lens for Focus Mode.',
      of: [{type: 'block'}]
    },
    {
      name: 'price',
      title: 'Base Price (USD)',
      type: 'number',
      description: 'Internal reference. This will not be displayed on the gallery front.'
    }
  ],
}

export const schemaTypes = [artwork]
