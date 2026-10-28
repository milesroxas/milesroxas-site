# Members

Visitors can create a free account to read members-only posts, case studies and pages. Members never reach the admin: they are a separate auth collection (`members`), and Payload only admits `users` there.

## Make something members-only

Set **Visibility** to **Members** in the sidebar of a post, work or page, then publish. To a visitor who is not signed in:

- Cards and rows that list it show a **Members** tag with a lock. A signed-in member sees the tag without the lock.
- Its page shows the opening (hero, title, byline) and a sign-in gate in place of the body. Nothing of the body is rendered or sent to the browser.
- It stays out of the sitemap, llms.txt, llms-full.txt, the `.md` alternates, Ask, and the public REST and GraphQL API. Its page is `noindex`.

A signed-in member, Miles signed in to the admin, and draft preview all see the whole page. A protected work (`isProtected`, the client access link) stays protected for members too.

## The members area

| Route | What it does |
| --- | --- |
| `/members` | The library: every members-only document. Requires sign-in. |
| `/members/sign-in` | Sign in. `?next=` returns to the page that sent the visitor. |
| `/members/join` | Create an account. Sends a confirmation email. |
| `/members/verify?token=` | The confirmation link. Confirms, then goes on to sign in. |
| `/members/forgot-password` | Sends a reset link (one hour). |
| `/members/reset-password?token=` | Choose a new password; confirms the email and signs in. |
| `/members/account` | Name, password, sign out, delete account. |

A signed-in member also gets a library icon in the top bar. Everyone else finds sign-in from a locked card or page.

## How it works

- **Access.** `publishedContentRead` (`src/access/members.ts`) is the read rule for Pages, Posts and Works: the team reads everything, members read published documents, everyone else reads published public ones. Every public surface reads as an anonymous visitor, so a members-only document is off all of them by default. A new surface needs nothing.
- **Teasers.** A listing that should show members-only documents as locked cards reads with `context: MEMBERS_TEASER`. REST cannot set it.
- **Pages stay cached.** A route calls `isGated(doc)` (`src/features/members/session.ts`) only for a members-only document, so public pages never read the request. A gated route passes `toTeaser(doc)` (an allowlist) to anything client-side.
- **Cards without a flash.** Sign-in sets a readable `member=1` hint cookie beside the Payload session. A head script stamps `<html data-member>` from it before first paint, and the `member:` / `guest:` Tailwind variants pick the card's state. The hint is for drawing only; every gate reads the session.
- **Writes.** Members write only through the server actions in `src/features/members/actions.ts`, which take whitelisted fields. The REST API takes no member writes, so signup stays behind the form's honeypot and a member cannot change their email around verification.
- **Accounts.** Sessions last 30 days. Five wrong passwords lock the account for 15 minutes. Join and reset answer the same way whether or not the address has an account; a repeat join emails the owner instead. A password change signs out other devices.
- **Email** goes through Resend (`src/collections/Members/emails.ts`).

## Adding to it later

- **A tier** (paid, invited): add an option to `visibilityField` and a branch in `publishedContentRead`, plus a field on `members` that only the team can write.
- **A new collection behind sign-in**: add `visibilityField()`, read with `publishedContentRead()`, and gate its route with `isGated` and `MembersGate`.
- **Social sign-in or magic links**: replace the actions in `actions.ts`; the gate and cards read only the session.
