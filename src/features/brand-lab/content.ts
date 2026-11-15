/**
 * Snapshot of published content (production CMS, 2026-11-14) so the lab renders
 * real copy without a database. Re-pull rather than edit when the site changes.
 */

const img = (id: string) =>
  `https://imagedelivery.net/mt_LnKhMMDR4a2uNBQuIoA/${id}/w=1600,q=85,f=auto`

export type LabWork = {
  id: number
  title: string
  client: string
  role: string | null
  capabilities: string[]
  description: string
  image: string | null
  slug: string
}

export const SITE = {
  name: 'Miles Roxas',
  jobTitle: 'Designer & Builder',
  tagline:
    'Designer and builder with 16 years across brand, product and technology, who designs experiences and builds the systems behind them.',
  nav: ['Work', 'Posts', 'Contact'],
  spec: [
    ['role', 'designer & builder'],
    ['disciplines', 'brand / product / technology'],
    ['base', 'brooklyn, ny'],
    ['practice', '16 yrs'],
  ] as const,
}

export const WORKS: LabWork[] = [
  {
    id: 17,
    title: 'Evaluating AI Skills Across Real Work',
    client: 'Skill Studio',
    role: 'Sole Designer / Builder',
    capabilities: ['Product Design', 'Engineering', 'Desktop App'],
    description:
      "An open-source desktop app that tests changes to AI skills across real tasks and compares your judgment with the AI's grades.",
    image: img('d46413bf-d624-48a4-ad30-a56a5d6b9300'),
    slug: 'evaluating-ai-skills-across-real-work',
  },
  {
    id: 15,
    title: 'Local Events Without the Noise',
    client: 'Buzlee',
    role: 'Product, Design, Engineering',
    capabilities: ['Mobile App', 'Product Design'],
    description:
      'A local events app with map-based discovery, business flyers, and human content moderation.',
    image: img('d36930de-aa74-4f8a-381b-7401caf99a00'),
    slug: 'local-events-without-the-noise',
  },
  {
    id: 14,
    title: 'Craft and Code for an Evolving Agency',
    client: 'Suits & Sandals',
    role: 'Design & Build',
    capabilities: ['Web Design', 'Engineering'],
    description:
      'The Suits & Sandals site on Payload CMS, built in six weeks, so one content source serves the website, custom tools and AI features.',
    image: img('6bc44397-18cb-468a-8828-5710943f7400'),
    slug: 'craft-and-code-for-an-evolving-agency',
  },
  {
    id: 10,
    title: 'Design Systems for Organizational Scale',
    client: 'NextStreet',
    role: 'Product Design Lead',
    capabilities: ['Design System', 'Product Design'],
    description:
      "A design system for NextStreet's small business platform, supporting distinct tenant brands and helping cross-functional teams work independently.",
    image: img('2fd950a3-c71d-4ada-22d2-46eeb172e500'),
    slug: 'design-systems-for-organizational-scale',
  },
  {
    id: 1,
    title: 'Brand Expansion Through Narrative',
    client: 'Arturo',
    role: 'Lead Design / Development',
    capabilities: ['Brand Expansion', 'Website'],
    description:
      "Brand expansion and Webflow design for Arturo's AI property intelligence platform, using scans, heat maps, and scrolling narratives to explain its value.",
    image: img('9f376560-adaf-4f43-e47a-8b9b28270500'),
    slug: 'brand-expansion-through-narrative',
  },
  {
    id: 2,
    title: 'Brand Development at the Executive Level',
    client: 'Aloquen',
    role: 'Design Lead',
    capabilities: ['Brand Identity & Collateral'],
    description:
      "Brand strategy and visual identity for Aloquen's healthcare company relaunch, developed through stakeholder workshops, logo exploration, and collateral design.",
    image: null,
    slug: 'brand-development-at-the-executive-level',
  },
  {
    id: 7,
    title: 'Identity for Higher-Stakes Work',
    client: 'Vault Workforce Screening',
    role: 'Lead Design',
    capabilities: ['Full Corporate Identity', 'Web Design'],
    description:
      "Brand repositioning and visual identity for Vault's shift from consumer health to workforce screening, with a system for safety-critical industries.",
    image: null,
    slug: 'identity-for-higher-stakes-work',
  },
  {
    id: 16,
    title: "Custom App to fill Webflow's gaps",
    client: 'Roxas Ventures',
    role: 'Sole Contributor',
    capabilities: ['Product Design', 'Engineering'],
    description:
      'Beacon, a custom Webflow app with flexible CMS layouts and built-in image tools that give teams more control over everyday content work.',
    image: null,
    slug: 'custom-app-to-fill-webflows-gaps',
  },
  {
    id: 12,
    title: 'Differentiation Through Immersive Digital Experience',
    client: "O'Linn Security Inc.",
    role: 'Website, 3D Rendering, Development',
    capabilities: ['Sanity CMS', '3D assets', 'Animations'],
    description:
      "An immersive website with 3D rendering for O'Linn Security Inc., built to set its high-tech brand apart from legacy competitors.",
    image: null,
    slug: 'differentiation-through-immersive-digital-experience',
  },
  {
    id: 5,
    title: 'Information-Driven Digital Experience',
    client: 'CastConnex',
    role: 'Lead Design & Development',
    capabilities: ['Website'],
    description:
      'A website for CastConnex, an industry leader in cast steel, balancing technical resources with moments of narrative clarity.',
    image: null,
    slug: 'information-driven-digital-experience',
  },
  {
    id: 3,
    title: 'Brand Expression Through Digital Experience',
    client: 'GentleBeast',
    role: null,
    capabilities: [],
    description:
      'A website for GentleBeast, on-demand puppy training, that turns brand narrative into a clear, conversion-ready digital experience.',
    image: null,
    slug: 'brand-expression-through-digital-experience',
  },
  {
    id: 11,
    title: 'Enforcing Quality in Low-Code Systems',
    client: 'Roxas Ventures',
    role: null,
    capabilities: [],
    description:
      'As low-code Webflow projects scale, consistent quality gets hard. A video walkthrough of the tooling that enforces it.',
    image: null,
    slug: 'enforcing-quality-in-low-code-systems',
  },
]

export const workById = (id: number) => WORKS.find((w) => w.id === id) ?? (WORKS[0] as LabWork)

export const HOME = {
  overview:
    '16 years of experience turning complex challenges into thoughtful designs, digital products, and working systems.',
  capabilities: [
    {
      title: 'Products & Experiences',
      body: 'Design and build intuitive, engaging experiences that solve problems or communicate ideas.',
      works: [15, 17],
    },
    {
      title: 'Tools & Systems',
      body: 'Create systems that simplify complex workflows, improve productivity, and extend existing capabilities.',
      works: [14, 10],
    },
    {
      title: 'Brand & Narrative',
      body: "Develop identities and experiences that bring clarity and meaning to a company's story.",
      works: [7, 2],
    },
  ],
  about: {
    heading: "I'm a designer who loves building things.",
    paragraphs: [
      "I've spent the last 16 years working across brand, product, and technology. I co-founded Suits & Sandals, where I've led creative teams and worked with companies ranging from early-stage startups to global enterprises.",
      "What excites me most is solving complex problems. Sometimes that means creating a brand identity or designing an experience that tells a compelling story. Other times, it means building an application, designing a system, or creating a tool that makes someone's work easier.",
      "I've always been interested in the space between designing something and figuring out how to make it work.",
    ],
  },
}

export const POSTS = [
  { title: 'Fourteen branches, one afternoon: how I work in parallel', date: '2026-10-12' },
  { title: 'Documenting a feature as it is built', date: '2026-09-27' },
  { title: 'From Webflow to Payload: a CMS built around a Content Hub', date: '2026-09-21' },
  { title: 'Building a shader studio in Payload CMS', date: '2026-09-13' },
]

/** The Skill Studio case study (work 17): its three published chapters. */
export const CASE = {
  workId: 17,
  platforms: 'macOS / Windows / Linux',
  chapters: [
    {
      heading: 'Make it easier to write a good skill',
      body: 'My first prototype made developer tools the price of entry. People had to clone a GitHub repo and run it from a terminal, making it inaccessible to the rest of my team and users at scale. The idea was sound but the surface was wrong.',
      outcome:
        'I built a downloadable desktop app with features to help users easily configure their AI subscriptions, and a library view to add and manage all skills installed on their machine.',
    },
    {
      heading: 'Put the decision on one screen',
      body: 'I built blind reviews, five-point ratings, and a separate screen for checking where people disagreed with the AI grader. I expected those controls to build trust. Instead, they gave users a second job: evaluating the grader before they could tell whether an edit improved the AI’s work.',
      outcome:
        'I cut the workflow from ten screens to three. Now, users compare outputs before and after an edit, see which instructions were missed, and easily select the best result.',
    },
    {
      heading: 'Keep edits where the work happens',
      body: 'In Skill Studio, people write rules that tell an AI how to do a task. I built a chat panel so they could get help refining those rules without leaving the editor. While it improved the experience, testing showed that users found it tedious to find the original lines and paste each suggestion back.',
      outcome:
        'I redesigned the workflow and built features for AI suggestions and assistance right on the editor surface.',
    },
  ],
  pull: 'I cut the workflow from ten screens to three.',
  related: [15, 14, 10],
}
