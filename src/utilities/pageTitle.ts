import { isSiteOwner } from './schema'

/** The fields a title is resolved from (the whole `MetaDoc` is in generateMeta.ts). */
export type TitleDoc = {
  title?: string | null
  meta?: { title?: string | null } | null
}

/**
 * plugin-seo filled `meta.title` with the suffix already on it before the
 * title template took that job (`generateTitle` in plugins/index.ts); a stored
 * title keeps working either way.
 */
const stripSiteSuffix = (title: string, name: string) =>
  title.replace(new RegExp(`\\s*\\|\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '')

/** An SEO title that already opens with the site name ("Miles Roxas | …"). */
const leadsWithSiteName = (title: string, name: string) =>
  new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[|:,]`, 'i').test(title)

/**
 * The document's own title, or the site name. The home page is the site, so it
 * carries the bare name unless its SEO title says otherwise; a title that
 * already leads with the name ("Miles Roxas | Design lead") is final as
 * written, so the template never appends the name a second time.
 */
export const resolveTitle = (doc: TitleDoc | null, pathname: string, name: string) => {
  const own = doc?.meta?.title ? stripSiteSuffix(doc.meta.title, name) : doc?.title
  if (pathname === '/' && (!own || own === 'Home' || own === name)) {
    return { title: { absolute: name } as const, text: name }
  }
  if (own && leadsWithSiteName(own, name)) {
    return { title: { absolute: own } as const, text: own }
  }
  return { title: own || name, text: `${own || name} | ${name}` }
}

/**
 * The names credited on a post, with the owner's full name in place of the
 * CMS user's short one so the article meta names the same person the Person
 * schema does.
 */
export const articleAuthors = (authors: string[] | undefined, name: string): string[] => {
  const credited = (authors ?? []).map((author) => (isSiteOwner(author, name) ? name : author))
  return credited.length ? credited : [name]
}
