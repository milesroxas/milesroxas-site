/**
 * The words every Ask surface shares (the dock's panel and sheet, the /ask
 * page), in one place so the surfaces cannot drift. Ask speaks about Miles in
 * the third person: it is a guide to his work, not Miles himself.
 */

/** What Ask answers from, under its title. */
export const ASK_SCOPE = 'Answers come only from Miles’s case studies and posts.'

/** The phone sheet's opening line, where the title bar has no room for the scope. */
export const ASK_INTRO =
  'Ask anything about Miles’s work. Answers come only from his case studies and posts.'

/** The composer before anything is asked, and once a conversation is under way. */
export const ASK_PLACEHOLDER = 'Ask about Miles’s work'
export const ASK_FOLLOW_UP_PLACEHOLDER = 'Ask a follow-up'

/** While a reply is on its way, before its first word. */
export const ASK_READING = 'Reading Miles’s case studies…'

/** Under an error, when the failed question went back into the composer. */
export const ASK_RETRY = 'Your question is still in the field. Send it again when ready.'
