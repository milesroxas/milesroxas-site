import type { AskHandoffReason } from '@/features/ask/handoff'

/**
 * The Ask fixture for this site: what a visitor asks on milesroxas.com and
 * what the turn must end in. `scripts/ask-judge-eval.ts` prints Jev's
 * probabilities beside each expectation, so a threshold in
 * `ASK_JUDGE_THRESHOLDS` is chosen from numbers and a criterion is reworded
 * from a miss. Ported from sas-site's `scripts/ask-cases.ts`; the questions are
 * the ones a recruiter, a hiring manager, a prospective client or a curious
 * visitor asks about a person and his work, not about a studio.
 *
 * Expectations describe the last turn only. `sources` names pages a good
 * retrieval must find, as the local index publishes them.
 */

export type AskCase = {
  id: string
  /** One entry per user turn; a multi-turn case replays the earlier replies. */
  turns: string[]
  expect: {
    /** The card the last turn must end in, or null for none (the quiet offer is not a card). */
    handoff: AskHandoffReason | null
    /** true: the reply must contain words. false: card only. Omitted: either is right. */
    text?: boolean
    /** Page paths that must appear in the sources. Filled from the local corpus. */
    sources?: string[]
  }
}

const NEXTSTREET = '/works/design-systems-for-organizational-scale'
const ARTURO = '/works/brand-expansion-through-narrative'
const BUZLEE = '/works/building-a-community-platform-from-the-ground-up'
const SUITS_AND_SANDALS = '/works/craft-and-code-for-an-evolving-agency'
const WEBFLOW_TO_PAYLOAD = '/posts/from-webflow-to-payload-a-cms-built-around-a-content-hub'
const CREDIBILITY = '/posts/building-credibility-through-design-and-content'

export const ASK_CASES: AskCase[] = [
  // Site Info's suggested questions, and the questions stored so far.
  {
    id: 'enjoy',
    turns: ['What projects do you enjoy doing?'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'webflow-payload',
    turns: ['What does moving a site from Webflow to Payload CMS involve?'],
    expect: { handoff: null, text: true, sources: [WEBFLOW_TO_PAYLOAD] },
  },
  {
    id: 'credible',
    turns: ['What makes a startup website credible to investors?'],
    expect: { handoff: null, text: true, sources: [CREDIBILITY] },
  },
  { id: 'what-work', turns: ['what work do you do'], expect: { handoff: null, text: true } },

  // A recruiter or hiring manager: experience, skills, roles. All information,
  // never a card: the `information` criterion names them (judge.ts, 2026-10-16).
  {
    id: 'years',
    turns: ['How many years of experience does Miles have?'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'background',
    turns: ["What is Miles's background?"],
    expect: { handoff: null, text: true },
  },
  { id: 'roles', turns: ['What roles has Miles held?'], expect: { handoff: null, text: true } },
  {
    id: 'designer-or-dev',
    turns: ['Is Miles a designer or a developer?'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'skills',
    turns: ['What tools and frameworks does Miles work with?'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'react',
    turns: ['Does Miles have experience with React and Next.js?'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'led-team',
    turns: ['Has Miles led a design team?'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'writes-code',
    turns: ['Does Miles write production code or only design?'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'industries',
    turns: ['What industries has Miles worked in?'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'sas-role',
    turns: ["What was Miles's role at Suits & Sandals?"],
    expect: { handoff: null, text: true, sources: [SUITS_AND_SANDALS] },
  },
  { id: 'based', turns: ['Where is Miles based?'], expect: { handoff: null, text: true } },
  {
    id: 'open-to-roles',
    turns: ['Is Miles open to a full-time role?'],
    expect: { handoff: null, text: true },
  },
  { id: 'cv', turns: ["Can I see Miles's CV?"], expect: { handoff: null, text: true } },
  // "Who is Miles?" is the boundary the `person` criterion now rules out: a
  // question about who he is, not a request to reach him.
  { id: 'who-is', turns: ['Who is Miles Roxas?'], expect: { handoff: null, text: true } },

  // Past work for a client or project the question names: the site's to
  // answer, never a card.
  {
    id: 'past-work-named',
    turns: ['What did Miles build for NextStreet?'],
    expect: { handoff: null, text: true, sources: [NEXTSTREET] },
  },
  {
    id: 'past-work-you',
    turns: ['What did you do for Arturo?'],
    expect: { handoff: null, text: true, sources: [ARTURO] },
  },
  {
    id: 'past-work-project',
    turns: ['Tell me about the Buzlee project.'],
    expect: { handoff: null, text: true, sources: [BUZLEE] },
  },
  {
    id: 'design-systems',
    turns: ['Has Miles built design systems for clients?'],
    expect: { handoff: null, text: true, sources: [NEXTSTREET] },
  },
  {
    id: 'results',
    turns: ['What results did the NextStreet design system get?'],
    expect: { handoff: null, text: true, sources: [NEXTSTREET] },
  },

  // A prospective client asking how Miles works, who he works with, how he
  // prices in general.
  { id: 'start', turns: ['How do we start?'], expect: { handoff: null, text: true } },
  { id: 'clients', turns: ['Who have you worked with?'], expect: { handoff: null, text: true } },
  { id: 'process', turns: ['What is your process like?'], expect: { handoff: null, text: true } },
  { id: 'startups', turns: ['Do you work with startups?'], expect: { handoff: null, text: true } },
  { id: 'freelance', turns: ['Is Miles available for freelance work?'], expect: { handoff: null } },
  // General pricing: a card either way; words only if the site publishes something.
  { id: 'cost-general', turns: ['What does it cost?'], expect: { handoff: 'estimate' } },
  { id: 'pricing-how', turns: ['How do you price projects?'], expect: { handoff: null } },

  // The visitor's own project: price, timing, start date. Only Miles can settle these.
  {
    id: 'cost-own',
    turns: ['How much would a new website for my startup cost?'],
    expect: { handoff: 'estimate', text: false },
  },
  {
    id: 'cost-own-ds',
    turns: ['What would a design system for our product team cost?'],
    expect: { handoff: 'estimate', text: false },
  },
  {
    id: 'timeline-own',
    turns: ['How long would it take you to rebrand our company?'],
    expect: { handoff: 'estimate', text: false },
  },
  {
    id: 'start-date',
    turns: ['When could you start on our project?'],
    expect: { handoff: 'estimate', text: false },
  },
  // Mixed: a general question and the visitor's own price in one turn.
  {
    id: 'mixed',
    turns: ['How do you work, and what would my project cost?'],
    expect: { handoff: 'estimate', text: true },
  },

  // They have a project, or ask Miles to do something for them.
  {
    id: 'have-project',
    turns: ["I have a project I'd like to talk to you about."],
    expect: { handoff: 'project', text: false },
  },
  {
    id: 'webflow',
    turns: ['Can you fix my Webflow site?'],
    expect: { handoff: 'project', text: true },
  },
  { id: 'build-x', turns: ['Can you build a mobile app for us?'], expect: { handoff: 'project' } },
  {
    id: 'payload-build',
    turns: ['We need a Payload CMS build for our marketing site. Are you available?'],
    expect: { handoff: 'project' },
  },
  // Names work Miles has done and asks for it: a general question rides along, so words too.
  {
    id: 'ds-for-us',
    turns: ['Have you built design systems before, and could you build one for us?'],
    expect: { handoff: 'project', text: true },
  },
  // A hiring approach: the visitor wants Miles, not an answer from the site.
  {
    id: 'hire-interest',
    turns: ["We're hiring a senior product designer. Would Miles be interested?"],
    expect: { handoff: 'person' },
  },

  // A person: Miles by name, someone by role, or to be called or emailed.
  { id: 'person', turns: ['Can I talk to Miles?'], expect: { handoff: 'person', text: false } },
  {
    id: 'person-call',
    turns: ['Can someone call me about this?'],
    expect: { handoff: 'person', text: false },
  },
  {
    id: 'person-email',
    turns: ['Can Miles email me to set up a call?'],
    expect: { handoff: 'person', text: false },
  },
  {
    id: 'get-in-touch',
    turns: ['How do I get in touch with Miles?'],
    expect: { handoff: 'person' },
  },

  // Contact details typed into the chat: found by a regex before Jev is asked.
  {
    id: 'contact-details',
    turns: ['My email is jane@example.com, can you send me more information?'],
    expect: { handoff: 'contact_details', text: false },
  },

  // Nothing on the site answers it.
  {
    id: 'no-answer',
    turns: ['What is the capital of Mongolia?'],
    expect: { handoff: 'no_answer', text: false },
  },
  {
    id: 'off-topic-code',
    turns: ['Write me a Python script that sorts a list.'],
    expect: { handoff: 'no_answer', text: false },
  },

  // Conversation: a greeting on a first turn still retrieves; on a follow-up
  // it is the chat-only prompt, never a card.
  { id: 'hello', turns: ['Hi there'], expect: { handoff: null } },
  {
    id: 'thanks',
    turns: ['What is your process like?', 'Thanks, that helps!'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'rephrase',
    turns: ['What did Miles build for NextStreet?', 'Can you say that again more simply?'],
    expect: { handoff: null, text: true },
  },

  // Follow-ups: one that only makes sense with the first turn, one that
  // switches topic, one that opens with "and" but names its own subject.
  {
    id: 'followup-dependent',
    turns: ['Tell me about your work with NextStreet.', 'What results did it get?'],
    expect: { handoff: null, text: true, sources: [NEXTSTREET] },
  },
  {
    id: 'followup-role',
    turns: ['Tell me about the Buzlee project.', 'What was your role on it?'],
    expect: { handoff: null, text: true, sources: [BUZLEE] },
  },
  {
    id: 'followup-switch',
    turns: ['Tell me about your work with NextStreet.', 'What is your process like?'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'followup-and',
    turns: ['What did Miles build for Buzlee?', 'And what about Arturo?'],
    expect: { handoff: null, text: true, sources: [ARTURO] },
  },
  // A follow-up that turns the subject into the visitor's own project.
  {
    id: 'followup-own',
    turns: ['Has Miles built design systems for clients?', 'How much would one cost for us?'],
    expect: { handoff: 'estimate', text: false },
  },
]

/**
 * Whether a follow-up's search must carry the previous turn
 * (`depends_on_previous`, judge.ts). Read from the two-turn cases above, so
 * the same questions label both the route and the search.
 */
export const ASK_DEPENDS_EXPECTATIONS: Record<string, boolean> = {
  thanks: true,
  rephrase: true,
  'followup-dependent': true,
  'followup-role': true,
  'followup-switch': false,
  'followup-and': true,
  'followup-own': true,
}

/**
 * The journey fixture (`scripts/ask-judge-eval.ts --journey`): a question, the
 * page it was asked on, and whether it leaves its subject to that page, so the
 * search must also run under the page's title (`open_reference`, judge.ts).
 * Titles are the index's own. `sources` names a page the pooled search must
 * find (`--journey --passages`).
 */
export type AskJourneyCase = {
  id: string
  question: string
  page: string
  leans: boolean
  sources?: string[]
}

const NEXTSTREET_TITLE = 'Design Systems for Organizational Scale'
const BUZLEE_TITLE = 'Building a Community Platform from the Ground Up'
const WEBFLOW_TO_PAYLOAD_TITLE = 'From Webflow to Payload: a CMS built around a Content Hub'
const SHADER_STUDIO_TITLE = 'Building a shader studio in Payload CMS'

export const ASK_JOURNEY_CASES: AskJourneyCase[] = [
  // The question leaves its subject to the page.
  {
    id: 'work-it',
    question: 'What results did it get?',
    page: NEXTSTREET_TITLE,
    leans: true,
    sources: [NEXTSTREET],
  },
  {
    id: 'work-this',
    question: 'How long did this project take?',
    page: NEXTSTREET_TITLE,
    leans: true,
  },
  {
    id: 'work-role',
    question: "What was Miles's role on this?",
    page: BUZLEE_TITLE,
    leans: true,
    sources: [BUZLEE],
  },
  {
    id: 'work-them',
    question: 'What did you build for them?',
    page: NEXTSTREET_TITLE,
    leans: true,
    sources: [NEXTSTREET],
  },
  {
    id: 'post-this',
    question: 'Can you do this for our site?',
    page: WEBFLOW_TO_PAYLOAD_TITLE,
    leans: true,
  },
  {
    id: 'post-here',
    question: 'Is the code shown here open source?',
    page: SHADER_STUDIO_TITLE,
    leans: true,
  },

  // The question names its own subject, whatever page it was asked on.
  {
    id: 'work-process',
    question: 'What is your process like?',
    page: NEXTSTREET_TITLE,
    leans: false,
  },
  {
    id: 'work-other-client',
    question: 'What did Miles build for Buzlee?',
    page: NEXTSTREET_TITLE,
    leans: false,
  },
  {
    id: 'work-years',
    question: 'How many years of experience does Miles have?',
    page: BUZLEE_TITLE,
    leans: false,
  },
  {
    id: 'post-startups',
    question: 'Do you work with startups?',
    page: WEBFLOW_TO_PAYLOAD_TITLE,
    leans: false,
  },
  {
    id: 'post-own-cost',
    question: 'How much would a new website for my startup cost?',
    page: SHADER_STUDIO_TITLE,
    leans: false,
  },

  // The idiom: "it" is nobody. Jev read it as a reference (0.96 on sas-site),
  // which is why the page search rides beside the plain one.
  { id: 'idiom-cost', question: 'What does it cost?', page: NEXTSTREET_TITLE, leans: true },
]
