import type { Thing, WithContext } from 'schema-dts'

type Schema = WithContext<Thing>

/**
 * Renders schema.org structured data. `<` is escaped so document content can
 * never close the script element (the Next.js JSON-LD guide). A plain script
 * tag on purpose: this is data, not code, so `next/script` has nothing to
 * optimise. Nulls are dropped so a route can pass a builder that found nothing.
 */
export const JsonLd = ({ data }: { data: Schema | (Schema | null)[] }) => {
  const schemas = (Array.isArray(data) ? data : [data]).filter(
    (schema): schema is Schema => schema !== null,
  )
  if (schemas.length === 0) return null
  const payload = schemas.length === 1 ? schemas[0] : schemas

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD needs a raw script body; it is JSON.stringify output with `<` escaped.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, '\\u003c') }}
    />
  )
}
