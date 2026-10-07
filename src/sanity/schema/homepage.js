export const homepage = {
  name: 'homepage',
  title: 'Homepage Settings',
  type: 'document',
  fields: [
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
    }
  ]
}
