import PageTemplate, { generateMetadata } from './[slug]/page'

// A re-export carries no route config: the home page states its own.
// Cached HTML, regenerated every ten minutes and on publish (revalidatePage).
export const revalidate = 600

export default PageTemplate

export { generateMetadata }
