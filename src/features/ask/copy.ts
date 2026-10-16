/**
 * The words every Ask surface shares (the dock's panel and sheet, the /ask
 * page), in one place so the surfaces cannot drift. Ask speaks about Miles in
 * the third person: it is a guide to his work, not Miles himself. The voice
 * is the brand guide's (docs/miles-roxas-brand-context.md): plain, warm,
 * specific, calm. Never an em dash.
 */

/** What Ask answers from, under its title. */
export const ASK_SCOPE = 'Answers come from Miles’s work and writing on this site.'

/** The phone sheet's opening line, where the title bar has no room for the scope. */
export const ASK_INTRO =
  'Ask about Miles’s work. Answers come from what he has published here, nothing else.'

/** The composer before anything is asked, and once a conversation is under way. */
export const ASK_PLACEHOLDER = 'Ask about Miles’s work'
export const ASK_FOLLOW_UP_PLACEHOLDER = 'Ask a follow-up'

/**
 * While a reply is on its way, before its first word: one short line at a
 * time, in turn, so a wait reads as someone at work rather than a spinner.
 * Each says what Ask is doing in plain words; none promises how long.
 */
export const ASK_THINKING = [
  'Thinking…',
  'Looking through Miles’s work…',
  'Checking the case studies…',
  'Finding the right pages…',
  'Reading up on that…',
] as const

/** Once the pages are in and the first words are still coming. */
export const ASK_WRITING = 'Putting an answer together…'

/** What a screen reader hears for the whole wait, however the visible line changes. */
export const ASK_THINKING_LABEL = 'Working on an answer'

/** Under an error, when the failed question went back into the composer. */
export const ASK_RETRY = 'Your question is still here. Send it again when you’re ready.'
