/**
 * The signed-in hint: a readable `member=1` cookie set beside the Payload
 * session on sign-in and cleared on sign-out. Pages are cached HTML that
 * cannot know who is looking, so `<html data-member>` is stamped from it
 * before first paint and CSS draws every card unlocked (`member:` / `guest:`
 * variants). It is a hint for drawing only: every gate reads the session.
 */
export const MEMBER_HINT_COOKIE = 'member'

export const MEMBER_ATTRIBUTE = 'data-member'

/** Whether the hint cookie is set, from a `document.cookie` string. */
export const hasMemberHint = (cookie: string) =>
  cookie.split(/;\s*/).includes(`${MEMBER_HINT_COOKIE}=1`)

/** Runs in `<head>` ahead of the body, so the first paint already has the right cards. */
export const MEMBER_HINT_SCRIPT = `(function(){try{if(document.cookie.split(/;\\s*/).indexOf('${MEMBER_HINT_COOKIE}=1')>-1)document.documentElement.setAttribute('${MEMBER_ATTRIBUTE}','')}catch(_){}})();`
