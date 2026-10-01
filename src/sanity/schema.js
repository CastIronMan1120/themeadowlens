export const seo = {
  name: 'seo',
  title: 'SEO & Metadata',
  type: 'object',
  fields: [
    {
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Override the default SEO title. Keep under 60 characters.',
      validation: Rule => Rule.max(60).warning('Longer titles may be truncated by search engines')
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Override the default SEO description. Keep under 160 characters.',
      validation: Rule => Rule.max(160).warning('Longer descriptions may be truncated by search engines')
    },
    {
      name: 'keywords',
      title: 'Custom Keywords',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      },
      description: 'Add specific SEO keywords. Press Enter to add each tag.'
    }
  ]
}

const artwork = {
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  groups: [
    { name: 'content', title: 'Artwork Details', default: true },
    { name: 'seo', title: 'SEO & Metadata' }
  ],
  fields: [
    {
      name: 'seo',
      type: 'seo',
      group: 'seo'
    },
    {
      name: 'title',
      title: 'SEO Title',
      type: 'string',
      group: 'content',
      description: 'Used for Google SEO and generates the URL (e.g., "Great Blue Heron in Flight").',
      validation: Rule => Rule.required()
    },
    {
      name: 'fileName',
      title: 'Personal File Name',
      type: 'string',
      group: 'content',
      description: 'Internal catalog reference (e.g., DSC_0042.NEF). Not shown to the public.'
    },
    {
      name: 'displayTitle',
      title: 'Caption Title',
      type: 'string',
      group: 'content',
      description: 'The large artistic title displayed on the photo (e.g., "Morning Grace").'
    },
    {
      name: 'caption',
      title: 'Caption Description',
      type: 'text',
      group: 'content',
      description: 'Optional override. Leave blank to use the Master Species Description from the Category.'
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
      title: 'Main Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Select the primary category for this piece (e.g., Birds, Cityscape)',
      validation: Rule => Rule.required()
    },
    {
      name: 'subcategory',
      title: 'Subcategory (Optional)',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Select an optional subcategory (e.g., Owls, Sunsets)'
    },
    {
      name: 'species',
      title: 'Species',
      type: 'string',
      description: 'e.g., Great Blue Heron, Monarch Butterfly'
    },
    {
      name: 'dominantColor',
      title: 'Dominant Color',
      type: 'string',
      description: 'e.g., Blue, Gold, Monochrome'
    },
    {
      name: 'size',
      title: 'Dimensions / Size Format',
      type: 'string',
      description: 'e.g., Panorama, Square, Standard 4:3'
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
      name: 'status',
      title: 'Artwork Status',
      type: 'string',
      description: 'Is this piece currently available for acquisition?',
      options: {
        list: [
          {title: 'Available', value: 'available'},
          {title: 'Reserved', value: 'reserved'},
          {title: 'Acquired (Sold)', value: 'acquired'}
        ],
        layout: 'radio'
      },
      initialValue: 'available'
    },
    {
      name: 'edition',
      title: 'Limited Edition Tracking',
      type: 'string',
      description: 'e.g., "Edition 3 of 50" (Leave blank for open editions)'
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

const category = {
  name: 'category',
  title: 'Category',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO & Metadata' }
  ],
  fields: [
    {
      name: 'seo',
      type: 'seo',
      group: 'seo'
    },
    {
      name: 'title',
      title: 'Category Title',
      type: 'string',
      group: 'content',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'menuImage',
      title: 'Menu Hover Image (Root Venues Only)',
      type: 'image',
      group: 'content',
      options: {
        hotspot: true,
      },
      description: 'The image that appears in the Mega Menu when a user hovers over this Venue. Leave blank to use the default.'
    },
    {
      name: 'parentCategory',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'content',
      description: 'Select a parent if this is a subcategory (e.g., Owls under Birds). Leave blank if this is a Main Category.'
    },
    {
      name: 'speciesDescription',
      title: 'Master Species Description',
      type: 'text',
      group: 'content',
      description: 'A biological or general description of this species. This automatically displays over every photograph in this category!'
    }
  ],
  preview: {
    select: {
      title: 'title',
      parentTitle: 'parentCategory.title'
    },
    prepare({ title, parentTitle }) {
      return {
        title: title,
        subtitle: parentTitle ? `? Subcategory of ${parentTitle}` : '? Root Venue'
      }
    }
  }
}

const artist = {
  name: 'artist',
  title: 'Artist Profile',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'portrait',
      title: 'Portrait Photograph',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'bio',
      title: 'Biography / Statement',
      type: 'array',
      of: [{type: 'block'}],
      description: 'The main text for the /artist page.'
    },
    {
      name: 'tagline',
      title: 'Tagline / Quote',
      type: 'string',
      description: 'e.g., "After all, this is The Meadowlands, and I am The Meadow LENS!"'
    }
  ],
}

const news = {
  name: 'news',
  title: 'News & Announcements',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Headline',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required()
    },
    {
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Cover Image (Optional)',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}],
      validation: Rule => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
      media: 'image'
    }
  }
}

const lead = {
  name: 'lead',
  title: 'Inquiry Leads',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'phone',
      title: 'Phone',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'interest',
      title: 'Artwork Interest / Subject',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'message',
      title: 'Message',
      type: 'text',
      readOnly: true,
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'interest',
    }
  }
}

export const schemaTypes = [seo, artwork, category, artist, news, lead]
