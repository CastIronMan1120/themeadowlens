export const homepage = {
  name: 'homepage',
  title: 'Homepage Settings',
  type: 'document',
  fields: [
    {
      name: 'featuredArtworks',
      title: 'Featured Ticker Photos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'artwork' }] }],
      description: 'Hand-select the exact masterpieces you want to scroll in the Featured Ticker on the homepage.'
    },
    {
      name: 'heroImage',
      title: 'Circular Logo Image',
      type: 'image',
      description: 'The circular image displayed on the left side of the homepage header.'
    },
    {
      name: 'welcomeHeadline',
      title: 'Welcome Headline',
      type: 'string',
      description: 'e.g., "Welcome!"'
    },
    {
      name: 'welcomeText',
      title: 'Welcome Letter',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The main introductory text on the homepage.'
    },
    {
      name: 'quote',
      title: 'Bottom Quote',
      type: 'string',
      description: 'e.g. "Laughter Nature is the best medicine!"'
    },
    {
      name: 'featuredTickerSpeed',
      title: 'Featured Works Ticker Speed (Seconds)',
      type: 'number',
      description: 'How many seconds it takes for the FEATURED WORKS ticker to complete one loop. Default is 60 (lower is faster).',
      initialValue: 60,
      validation: (Rule) => Rule.min(10).max(300)
    }
  ]
}
