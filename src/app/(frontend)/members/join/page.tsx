import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { JoinForm } from '@/features/members/forms'
import { MembersShell, memberLink } from '@/features/members/MembersShell'
import { MEMBERS_PATHS, safeNext, withNext } from '@/features/members/paths'
import { getMember } from '@/features/members/session'

export const metadata: Metadata = { title: 'Create an account' }

type Args = { searchParams: Promise<{ next?: string }> }

export default async function JoinPage({ searchParams }: Args) {
  const next = safeNext((await searchParams).next)
  if (await getMember()) redirect(next)

  return (
    <MembersShell
      footer={
        <>
          Already a member?{' '}
          <Link className={memberLink} href={withNext(MEMBERS_PATHS.signIn, next)}>
            Sign in
          </Link>
        </>
      }
      lead="Free, and all it takes is an email address. You get the posts and case studies that are not on the public site."
      title="Create an account"
    >
      <JoinForm next={next} />
    </MembersShell>
  )
}
