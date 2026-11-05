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
      title: 'Left Panel Image (600mm Lens Panorama)',
      type: 'image',
      options: { hotspot: true },
      description: 'The 16:9 lens illustration displayed on the left side of the homepage hero.'
    },
    {
      name: 'rightPanelImage',
      title: 'Right Panel Static Photo (Optional — Replaces Slideshow When Set)',
      type: 'image',
      options: { hotspot: true },
      description: 'Upload or select a static photograph to display on the right-hand panel of the homepage. Clear this field if you prefer the rotating slideshow.'
    },
    {
      name: 'showWelcomeOverlay',
      title: 'Show Bio / Welcome Text Overlay on Right Panel',
      type: 'boolean',
      initialValue: true,
      description: 'Check this box to display the Welcome / Short Bio overlay card on the right homepage panel. Uncheck to hide the text overlay and show the right-panel photograph 100% unobstructed.'
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
