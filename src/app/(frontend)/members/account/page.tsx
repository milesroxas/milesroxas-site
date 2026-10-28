import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/features/members/actions'
import { DeleteAccountForm, PasswordForm, ProfileForm } from '@/features/members/forms'
import { MembersShell, memberLink } from '@/features/members/MembersShell'
import { MEMBERS_PATHS, withNext } from '@/features/members/paths'
import { getMember } from '@/features/members/session'

export const metadata: Metadata = { title: 'Account' }

export default async function AccountPage() {
  const member = await getMember()
  if (!member) redirect(withNext(MEMBERS_PATHS.signIn, MEMBERS_PATHS.account))

  return (
    <MembersShell
      aside={
        <Link className={memberLink} href={MEMBERS_PATHS.home}>
          Library
        </Link>
      }
      lead={
        <>
          Signed in as <span className="text-foreground">{member.email}</span>.
        </>
      }
      title="Account"
    >
      <div className="flex flex-col">
        <Section title="Profile">
          <ProfileForm name={member.name ?? ''} />
        </Section>
        <Section title="Password">
          <PasswordForm email={member.email} />
        </Section>
        <Section title="Sign out">
          <form action={signOut}>
            <Button size="xl" type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </Section>
        <Section title="Delete account">
          <DeleteAccountForm />
        </Section>
      </div>
    </MembersShell>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-border flex flex-col gap-6 border-t py-10 first:border-t-0 first:pt-0">
      <h2 className="text-heading-3">{title}</h2>
      {children}
    </section>
  )
}
