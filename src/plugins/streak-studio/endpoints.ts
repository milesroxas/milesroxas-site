import { randomUUID } from 'node:crypto'
import { APIError, type Endpoint, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import { authenticated } from '@/access/authenticated'
import { SURFACES } from '@/features/immersive/studio/effect'
import { effectOf } from '@/features/immersive/studio/effects'
import { type LookGround, lookGround, studioGround } from '@/features/immersive/studio/ground'
import {
  type CaptureOptions,
  POSTER_CAPTURE,
  STILL_QUALITY,
  STILL_UPLOAD_BUDGET,
  snapshotRecipe,
} from '@/features/immersive/studio/recipe'
import {
  type PublishedStill,
  publishedStills,
  type Still,
  sameStill,
  stillCapture,
  stillKey,
  stillLabel,
  validateStills,
} from '@/features/immersive/studio/stills'
import type { Media, StreakLook } from '@/payload-types'
import { LOOKS_SLUG, STILL_MEDIA_FIELD, STILLS_FIELD } from './components/paths'
import { recipeHash, stillHash, studioInput } from './hash'
import { inTransaction, lockLook, PUBLISH } from './transaction'
import { lookUsage } from './usage'

function team(req: PayloadRequest) {
  if (!authenticated({ req }) || !req.user) throw new APIError('Team sign-in required.', 401)
  return req.user
}
/** The multipart body of Publish and Render: JSON fields beside the stills as files. */
const form = (req: PayloadRequest) =>
  studioInput(async () => {
    if (!req.formData) throw new Error('Form data required.')
    return req.formData()
  })
const field = (data: FormData, name: string): unknown =>
  studioInput(() => JSON.parse(String(data.get(name))))

/**
 * The saved draft, read as the editor. The pixels in the request were rendered
 * from the recipe the editor was looking at, so it has to be the recipe that
 * was saved: anything else and the poster would not match the field.
 */
async function savedDraft(req: PayloadRequest, recipe: unknown): Promise<StreakLook> {
  const look = await req.payload.findByID({
    collection: LOOKS_SLUG,
    id: String(req.routeParams?.id),
    draft: true,
    depth: 0,
    req,
    user: req.user,
    overrideAccess: false,
  })
  if (recipeHash(look.effect, recipe) !== recipeHash(look.effect, look.recipe))
    throw new APIError('The draft changed while the stills rendered. Try again.', 409)
  return look
}

/** The saved draft's stills, as the editor stored them. */
const draftStills = (look: StreakLook): Still[] =>
  validateStills(effectOf(look.effect), look.recipe, look[STILLS_FIELD]) as Still[]

/** The still the request renders, as the saved draft holds it. */
function savedStill(look: StreakLook, sent: unknown): Still {
  const id = String((sent as Partial<Still> | null)?.id ?? '')
  const still = draftStills(look).find((candidate) => candidate.id === id)
  if (!still) throw new APIError('This still is no longer on the look.', 404)
  if (!sameStill(still, sent as Still))
    throw new APIError('The still changed while it rendered. Try again.', 409)
  return still
}

/** The published look, with its stills' outputs, or nothing for a look never published. */
async function liveLook(req: PayloadRequest, id: number) {
  const live = await req.payload.findByID({
    collection: LOOKS_SLUG,
    id,
    draft: false,
    depth: 0,
    disableErrors: true,
    req,
  })
  return live?._status === 'published' ? live : null
}

/** The look's own ground, as the saved draft holds it. */
const groundOf = (look: StreakLook) => lookGround(look.ground)

/**
 * Each still of the draft with its output: the render this publish carries
 * (`renders`, still id to the media filed by Render), else the live look's
 * output when the still is unchanged since it was rendered. A still with
 * neither cannot be published: the site would serve a stale or missing file.
 */
async function resolveStills(
  req: PayloadRequest,
  look: StreakLook,
  renders: Record<string, unknown>,
): Promise<PublishedStill[]> {
  const effect = effectOf(look.effect)
  const stills = draftStills(look)
  if (!stills.length) return []
  const live = await liveLook(req, look.id)
  const published = new Map(publishedStills(live?.[STILLS_FIELD]).map((still) => [still.id, still]))
  const ground = groundOf(look)
  const output: PublishedStill[] = []
  for (const still of stills) {
    const hash = stillHash(stillKey(effect, look.recipe, still, ground))
    const rendered = renders[still.id]
    if (Number.isInteger(rendered)) {
      await verifyRender(req, Number(rendered), still)
      output.push({ ...still, media: Number(rendered), hash })
      continue
    }
    const reuse = published.get(still.id)
    if (reuse && reuse.hash === hash) {
      output.push({ ...still, media: reuse.media, hash })
      continue
    }
    throw new APIError(`The ${stillLabel(still)} still was not rendered. Try again.`, 409)
  }
  return output
}

/** A media document Render filed for this still: an image at the still's exact size. */
async function verifyRender(req: PayloadRequest, id: number, still: Still) {
  const media = await req.payload.findByID({
    collection: 'media',
    id,
    depth: 0,
    disableErrors: true,
    req,
  })
  const capture = stillCapture(still)
  if (
    !media?.mimeType?.startsWith('image/') ||
    media.width !== capture.width * capture.scale ||
    media.height !== capture.height * capture.scale
  )
    throw new APIError(`The ${stillLabel(still)} still's render does not match it. Try again.`, 409)
}

export const lookEndpoints: Endpoint[] = [
  {
    path: '/:id/publish',
    method: 'post',
    handler: async (req) => {
      team(req)
      const data = await form(req)
      return inTransaction(req, async () => {
        await lockLook(req, Number(req.routeParams?.id))
        const look = await savedDraft(req, field(data, 'recipe'))
        if (look.archived) throw new APIError('Unarchive this look before publishing.', 400)
        const renders = data.has('renders') ? field(data, 'renders') : {}
        if (!renders || typeof renders !== 'object' || Array.isArray(renders))
          throw new APIError('Invalid renders.', 400)
        const stills = await resolveStills(req, look, renders as Record<string, unknown>)
        // One at a time: each is a storage write inside the look's row lock.
        const posters = {} as Record<(typeof SURFACES)[number], Media>
        for (const surface of SURFACES)
          posters[surface] = await upload(
            req,
            data.get(surface),
            { ...POSTER_CAPTURE, surface },
            `${look.title} ${surface} poster`,
            groundOf(look),
          )
        // Payload merges an operation's context into the request and leaves it
        // there, so the pass is handed over for this one write and taken back.
        try {
          const doc = await req.payload.update({
            collection: LOOKS_SLUG,
            id: look.id,
            data: {
              ...look,
              snapshot: snapshotRecipe(effectOf(look.effect), look.recipe),
              posters: { dark: poster(posters.dark), light: poster(posters.light) },
              sourceHash: recipeHash(look.effect, look.recipe),
              thumbnail: posters.dark.id,
              lightPoster: posters.light.id,
              [STILLS_FIELD]: stills,
              [STILL_MEDIA_FIELD]: stills.map((still) => still.media),
              _status: 'published',
            },
            context: { [PUBLISH]: true },
            depth: 0,
            req,
          })
          return Response.json({ doc })
        } finally {
          delete req.context[PUBLISH]
        }
      })
    },
  },
  {
    // Render: one still of the saved draft, filed in Media. Publish references
    // the file by id; a still rendered to be opened or downloaded is filed the
    // same way, so nothing is encoded or stored twice.
    path: '/:id/stills',
    method: 'post',
    handler: async (req) => {
      team(req)
      const data = await form(req)
      const look = await savedDraft(req, field(data, 'recipe'))
      const still = savedStill(look, field(data, 'still'))
      const media = await upload(
        req,
        data.get('image'),
        stillCapture(still),
        `${look.title} · ${stillLabel(still)}`,
        groundOf(look),
      )
      return Response.json({ doc: media })
    },
  },
  {
    path: '/:id/usage',
    method: 'get',
    handler: async (req) => {
      team(req)
      const id = Number(req.routeParams?.id)
      if (!Number.isInteger(id)) throw new APIError('Invalid look.', 400)
      return Response.json({ usages: await lookUsage(req, id) })
    },
  },
]

/** The Media folder every rendered still is filed in. The name predates the second effect and is kept: it is the folder that exists. */
const MEDIA_FOLDER = 'Streak Field Studio'

/**
 * The browser sends the capture's own file at its exact size, which is stored
 * as it arrived. PNG from a browser that cannot encode the format is converted
 * here. Anything else is refused before it is stored.
 */
async function upload(
  req: PayloadRequest,
  file: FormDataEntryValue | null,
  capture: CaptureOptions,
  title: string,
  ground: LookGround,
): Promise<Media> {
  if (!file || typeof file === 'string' || file.size > STILL_UPLOAD_BUDGET)
    throw new APIError('Invalid image payload.', 400)
  const buffer = Buffer.from(await file.arrayBuffer())
  const metadata = await sharp(buffer, { limitInputPixels: 8294400 })
    .metadata()
    .catch(() => null)
  if (
    !metadata ||
    metadata.width !== capture.width * capture.scale ||
    metadata.height !== capture.height * capture.scale ||
    (metadata.format !== capture.format && metadata.format !== 'png')
  )
    throw new APIError('Render dimensions or encoding do not match the capture.', 400)
  let output: Buffer = buffer
  if (metadata.format !== capture.format) {
    let pipeline = sharp(buffer)
    if (!capture.transparent)
      pipeline = pipeline.flatten({ background: studioGround(ground, capture.surface) })
    output = await pipeline.toFormat(capture.format, { quality: STILL_QUALITY }).toBuffer()
  }
  const folders = await req.payload.find({
    collection: 'payload-folders',
    where: {
      and: [{ name: { equals: MEDIA_FOLDER } }, { folderType: { contains: 'media' } }],
    },
    limit: 1,
    depth: 0,
    req,
  })
  const folder =
    folders.docs[0] ??
    (await req.payload.create({
      collection: 'payload-folders',
      data: { name: MEDIA_FOLDER, folderType: ['media'] },
      req,
    }))
  return req.payload.create({
    collection: 'media',
    // This site's Media has no title, usage gate or description: the alt text
    // carries the name, and the folder files it beside the other renders.
    data: { folder: folder.id, alt: title },
    file: {
      data: output,
      name: `streak-${randomUUID()}.${capture.format}`,
      mimetype: `image/${capture.format}`,
      size: output.length,
    },
    req,
  })
}

const poster = (media: Media) => ({
  filename: media.filename,
  url: media.url,
  updatedAt: media.updatedAt,
  width: media.width,
  height: media.height,
  mimeType: media.mimeType,
  cloudflareImageUrl: media.cloudflareImageUrl,
})
