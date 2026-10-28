import { IconLock } from '@tabler/icons-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { MEMBERS_PATHS, withNext } from './paths'

type Props = {
  /** What the reader is missing, in their words: "post", "case study", "page". */
  kind: string
  /** This page, so signing in or joining comes back to it. */
  next: string
}

/**
 * Stands in for a members-only document's body when the visitor is not
 * signed in. The opening above it is the teaser; nothing of the body is
 * rendered or sent (`toTeaser`).
 */
export function MembersGate({ kind, next }: Props) {
  return (
    <section
      aria-labelledby="members-gate-title"
      className="bg-background px-gutter text-foreground py-20 md:py-32"
      data-slot="members-gate"
    >
      <ScrollReveal as="div" className="max-w-xl md:ml-[calc(100%/12)]" variant="intro">
        <p
          className="text-muted-foreground text-xs/none flex items-center gap-2 font-mono tracking-widest uppercase"
          data-reveal
        >
          <IconLock aria-hidden className="size-3.5" stroke={1.75} />
          Members
        </p>
        <h2 className="text-heading-2 mt-5 text-balance" data-reveal id="members-gate-title">
          The rest of this {kind} is for members.
        </h2>
        <p className="text-muted-foreground mt-4 text-base text-pretty md:text-lg" data-reveal>
          Sign in to keep reading. No account yet? Joining is free and takes an email address.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" data-reveal>
          <Button asChild size="xl">
            <Link href={withNext(MEMBERS_PATHS.signIn, next)}>Sign in</Link>
          </Button>
          <Button asChild size="clear" variant="text">
            <Link href={withNext(MEMBERS_PATHS.join, next)}>Create an account</Link>
          </Button>
        </div>
      </ScrollReveal>
    </section>
  )
}
