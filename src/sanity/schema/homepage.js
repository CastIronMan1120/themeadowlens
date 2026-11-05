export const homepage = {
  name: 'homepage',
  title: 'Homepage Settings',
  type: 'document',
  fields: [
    {
      name: 'heroImage',
      title: 'Left Panel Static Image (16:9 Frame)',
      type: 'image',
      options: { hotspot: true },
      description: 'The static 16:9 image displayed on the left side of the homepage hero (e.g., 600mm Lens Panorama).'
    },
    {
      name: 'rightPanelImage',
      title: 'Right Panel Static Image (16:9 Frame)',
      type: 'image',
      options: { hotspot: true },
      description: 'The static 16:9 photograph displayed on the right side of the homepage hero, matching the left-side panel.'
    },
    {
      name: 'rightPanelFit',
      title: 'Right Panel Image Fit Mode',
      type: 'string',
      initialValue: 'cover',
      options: {
        list: [
          { title: 'Fill 16:9 Frame Edge-to-Edge (Cover — Industry Standard)', value: 'cover' },
          { title: 'Fit Entire Uncropped Image (Contain)', value: 'contain' }
        ],
        layout: 'radio'
      },
      description: 'Controls whether the right-panel static image fills the 16:9 frame edge-to-edge or fits the full uncropped image.'
    },
    {
      name: 'showWelcomeOverlay',
      title: 'Show "Welcome" Content Overlay on Right Panel',
      type: 'boolean',
      initialValue: true,
      description: 'Check this box to display the Welcome / Short Bio overlay card on the right homepage panel. Uncheck to hide the text overlay and display the right-panel static photograph 100% unobstructed (just like the left panel).'
    },
    {
      name: 'welcomeHeadline',
      title: 'Welcome Headline',
      type: 'string',
      initialValue: 'Welcome to The Meadow Lens',
      description: 'Headline displayed at the top of the Welcome overlay card (e.g., "Welcome to The Meadow Lens").'
    },
    {
      name: 'welcomeText',
      title: 'Welcome Content / Short Bio',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The introductory paragraphs displayed inside the Welcome overlay on the right homepage panel.'
    },
    {
      name: 'welcomeBgColor',
      title: 'Welcome Overlay Background Color (Hex)',
      type: 'string',
      initialValue: '#0B1528',
      description: 'Hex color code for the Welcome overlay background (Industry Standard Default: #0B1528 Deep Midnight Slate).'
    },
    {
      name: 'welcomeBgOpacity',
      title: 'Welcome Overlay Background Opacity % (0 = Fully Transparent, 100 = Solid Opaque)',
      type: 'number',
      initialValue: 75,
      validation: (Rule) => Rule.min(0).max(100),
      description: 'Controls background transparency/opacity from 0% (completely transparent background) to 100% (solid background). Industry Standard Default: 75% Opacity (25% Transparency).'
    },
    {
      name: 'welcomeTextColor',
      title: 'Welcome Overlay Text Color (Hex)',
      type: 'string',
      initialValue: '#F8FAFC',
      description: 'Hex color code for the Welcome headline and body text (Industry Standard Default: #F8FAFC Crisp Gallery Ivory).'
    },
    {
      name: 'welcomeBackdropBlur',
      title: 'Enable Soft Frosted Glass Blur Behind Welcome Overlay',
      type: 'boolean',
      initialValue: true,
      description: 'Applies subtle optical backdrop blur behind the semi-transparent Welcome card for optimal text legibility over photographs (Industry Standard Default: Enabled).'
    },
    {
      name: 'featuredArtworks',
      title: 'Featured Ticker Photos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'artwork' }] }],
      description: 'Hand-select the exact masterpieces you want to scroll in the Featured Ticker on the homepage.'
    },
    {
      name: 'quote',
      title: 'Bottom Quote',
      type: 'string',
      description: 'e.g. "Laughter and Nature is the best medicine!"'
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
