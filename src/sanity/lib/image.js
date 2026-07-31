import createImageUrlBuilder from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

const builder = createImageUrlBuilder({ projectId, dataset })

export const urlForImage = (source) => {
  return builder.image(source)
}
