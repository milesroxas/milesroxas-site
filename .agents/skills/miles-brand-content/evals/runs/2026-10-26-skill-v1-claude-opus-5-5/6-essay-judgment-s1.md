# Why design judgment matters more when agents write the code

Coding agents write most of the code on this site now: of the repo's 486 commits, 261 carry one as a co-author. The easy conclusion is that the design work shrinks along with the typing. Describe the feature, let the agent build it, check that it runs.

In my work it has gone the other way. An agent builds what it is told, fast and convincingly, including the wrong thing. It does not decide what a feature should refuse to do, when it should stop, or what a visitor should see when the right answer is a person. Those are design decisions, and with the typing handled, they are most of my job.

## Where Ask hands off

Ask, the question box on this site, shows it most clearly. Press ⌘K on any page and it answers questions about my work from what is published here and nothing else, lists the pages it used, and stays under 120 words. When the honest answer is "ask Miles", it says so and opens a short form that reaches me. I designed how it behaves and directed the build with coding agents. [check: how design, direction, review and code were split on Ask]

Most of the design sits in that handoff. A visitor asking for an estimate, pitching a project or asking something no page covers should reach me, not get a confident paragraph. Without a judge, the writing model made that call itself, through a handoff tool with five reasons to use it. On the Suits & Sandals site, where I built Ask first, it showed the right handoff card in 52 of 57 test turns (19 questions, three runs each).

So the call moved out of the writer. A separate judge reads each turn before anything is written and sorts it: information, estimate, project, person or conversation. It also scores every retrieved passage for relevance and evidence. The judge only returns probabilities. My code owns each threshold, and keeps a passage only when it clears 0.45 for relevance and 0.55 for evidence. The words on the handoff card are written in code as well, so no model improvises the moment someone asks for me. With the judge, the right card showed in 57 of 57 turns, and 23 turns were answered with no writing-model call at all, up from 6.

It cost time. The judge runs before the writer, so turns that needed a written answer got slower: median time to first output went from 3,490 ms to 4,655 ms. Turning the writer's reasoning down to minimal brought that to 1,542 ms, and turns that only showed a card dropped from 2,669 ms to 365 ms. On this site the turn judge is built but switched off for now. Shadow mode comes next, where it judges real questions without acting on them.

## Review is the job

The same split runs my days. On October 7 this site's repo took 58 commits from 14 workspaces, most of them driven by a coding agent while I reviewed the one before. Each task starts as one line from me (fix the carousel tab position, make capabilities a taxonomy, tune the mask animation speed) and ends with me checking its preview against real content before it lands. I keep three to six open at once, and what caps the number is how many I can review well.

My own judgment arrives late sometimes. The scripts that open a workspace were short; the guards around them took longer, and each one was written after a bug I hit once. A workspace database was keyed on a name that later changed, so archiving dropped the wrong one. A dev server left running by another repo held a port a new workspace had been given. Both were gaps in what I had decided, found by running into them.

Agents made the typing cheap. They did not make a wrong decision cheaper; they made it ship sooner. What stays with me is the judgment: what Ask should refuse, which card a visitor sees, and whether a branch is ready to land.

Press ⌘K on any page to try Ask.
