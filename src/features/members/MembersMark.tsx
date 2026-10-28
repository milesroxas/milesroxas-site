import { IconLock } from '@tabler/icons-react'
import { cn } from '@/utilities/ui'

/**
 * The card variant for a members-only document: a quiet mono "Members" tag in
 * the card's meta. A visitor who is not signed in also sees a lock and hears
 * "sign in to read"; a member sees the tag alone, as a note of what is theirs.
 *
 * The page is cached HTML, so both states ship and CSS picks one from the
 * hint on `<html>` (`member:` / `guest:`), with no flash and no client state.
 */
export function MembersMark({ className }: { className?: string }) {
  return (
    <span
      className={cn('text-xs/none inline-flex shrink-0 items-center gap-1 font-mono', className)}
      data-slot="members-mark"
    >
      <IconLock aria-hidden className="member:hidden size-3 -translate-y-px" stroke={1.75} />
      Members
      <span className="member:hidden sr-only">, sign in to read</span>
    </span>
  )
}
