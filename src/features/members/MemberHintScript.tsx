import { MEMBER_HINT_SCRIPT } from './hint'

/**
 * Stamps `<html data-member>` from the hint cookie during head parsing, so the
 * first paint already draws members' cards unlocked. A plain inline script,
 * for the reasons `InitTheme` gives.
 */
export function MemberHintScript() {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: inline hint bootstrap; no user input
      dangerouslySetInnerHTML={{ __html: MEMBER_HINT_SCRIPT }}
      id="member-hint"
    />
  )
}
