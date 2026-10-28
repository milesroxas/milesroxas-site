import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import type { ReactNode } from 'react'
import { postCardSelect } from '@/collections/Posts/cardSelect'
import { PostCard } from '@/components/Card/Posts/Component'
import { WorkCard } from '@/components/Card/Works/Component'
import { MembersShell, memberLink } from '@/features/members/MembersShell'
import { MEMBERS_PATHS } from '@/features/members/paths'
import { getMember } from '@/features/members/session'

export const metadata: Metadata = { title: 'Members' }

/**
 * The library: every members-only document, read as the signed-in member
 * (`overrideAccess: false` with the member as the user), so the read access
 * rule decides what lists here exactly as it does over the API.
 */
export default async function MembersHome() {
  const member = await getMember()
  if (!member) redirect(MEMBERS_PATHS.signIn)

  const payload = await getPayload({ config: configPromise })
  const asMember = {
    depth: 1,
    draft: false,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    user: member,
    where: { visibility: { equals: 'members' } },
  } as const

  const [works, posts, pages] = await Promise.all([
    payload.find({
      ...asMember,
      collection: 'works',
      sort: '_order',
      select: { title: true, slug: true, hero: true, meta: true, visibility: true },
    }),
    payload.find({
      ...asMember,
      collection: 'posts',
      sort: '-publishedAt',
      select: postCardSelect,
    }),
    payload.find({
      ...asMember,
      collection: 'pages',
      sort: 'title',
      select: { title: true, slug: true, meta: { description: true } },
    }),
  ])

  const firstName = member.name?.trim().split(/\s+/)[0]
  const empty = works.docs.length + posts.docs.length + pages.docs.length === 0

  return (
    <MembersShell
      aside={
        <Link className={memberLink} href={MEMBERS_PATHS.account}>
          Account
        </Link>
      }
      lead={
        empty
          ? 'Nothing here yet. Members-only posts and case studies will list here as they go up.'
          : 'Posts and case studies for members. They are also on the site, unlocked while you are signed in.'
      }
      title={firstName ? `Hi, ${firstName}` : 'Members'}
      wide
    >
      {!empty && (
        <div className="flex flex-col gap-20">
          {works.docs.length > 0 && (
            <Shelf title="Case studies">
              {works.docs.map((work, index) => (
                <li key={work.id}>
                  <WorkCard doc={work} index={index} titleClassName="text-lg xl:text-xl" />
                </li>
              ))}
            </Shelf>
          )}
          {posts.docs.length > 0 && (
            <Shelf title="Posts">
              {posts.docs.map((post, index) => (
                <li key={post.id}>
                  <PostCard doc={post} index={index} />
                </li>
              ))}
            </Shelf>
          )}
          {pages.docs.length > 0 && (
            <section aria-labelledby="members-pages">
              <ShelfTitle id="members-pages">Pages</ShelfTitle>
              <ul className="border-border mt-6 border-t">
                {pages.docs.map((page) => (
                  <li className="border-border border-b" key={page.id}>
                    <Link
                      className="group flex flex-col gap-1 py-5 md:flex-row md:items-baseline md:justify-between md:gap-10"
                      href={`/${page.slug}`}
                    >
                      <span className="text-lg group-hover:underline group-hover:underline-offset-4">
                        {page.title}
                      </span>
                      {page.meta?.description && (
                        <span className="text-muted-foreground max-w-[56ch] text-sm text-pretty md:text-right">
                          {page.meta.description}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </MembersShell>
  )
}

function ShelfTitle({ children, id }: { children: ReactNode; id: string }) {
  return (
    <h2 className="text-muted-foreground text-xs/none font-mono tracking-widest uppercase" id={id}>
      {children}
    </h2>
  )
}

function Shelf({ title, children }: { title: string; children: ReactNode }) {
  const id = `members-${title.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <section aria-labelledby={id}>
      <ShelfTitle id={id}>{title}</ShelfTitle>
      <ul className="mt-6 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </section>
  )
}
