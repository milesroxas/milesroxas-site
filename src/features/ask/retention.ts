/**
 * How long a stored Ask question lives. The retention job deletes against it
 * and the notice at every Ask composer quotes it, so the promise and the
 * behaviour cannot drift apart. Client-safe: no server imports.
 */
export const ASK_QUESTION_RETENTION_DAYS = 90

const DAY_MS = 86_400_000

/** The moment before which a stored question has outlived the window. */
export const askRetentionCutoff = (now = Date.now()): string =>
  new Date(now - ASK_QUESTION_RETENTION_DAYS * DAY_MS).toISOString()

/**
 * The first line of every Ask transcript. Covers the EU AI Act transparency
 * duty (visitors are told they are chatting with an AI) and says chats are
 * kept. Not part of cookie consent: it is about what visitors type, which
 * is stored whatever they chose on the banner.
 */
export const ASK_NOTICE = `Answers are written by an AI from this site. Chats are kept anonymously for ${ASK_QUESTION_RETENTION_DAYS} days.`

/** The same notice where one line is all there is room for: the phone sheet's foot. */
export const ASK_NOTICE_SHORT = `AI answers from this site, kept anonymously for ${ASK_QUESTION_RETENTION_DAYS} days.`
