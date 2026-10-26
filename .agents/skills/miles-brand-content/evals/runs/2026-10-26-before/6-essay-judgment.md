# When agents write the code, judgment is the job

Agents write most of the code on this site now. More than half the commits in its repo list a coding agent as co-author. You might expect that to shrink the design side of my work. It has done the opposite. When code is cheap to produce, the scarce part is deciding what it should do, and noticing when it does the wrong thing.

## Attention is the limit

On October 7 this site's repo took 58 commits from 14 workspaces, each on its own branch with its own database. A coding agent drove most of them while I reviewed the one before. I keep three to six open at a time, and the limit is my attention, not the machine.

Each workspace starts from one line I write: fix the carousel tab position, make capabilities a taxonomy, tune the mask animation speed. An agent can make each of those changes. It can't tell me whether the tab now sits where a reader looks for it, or whether the mask reads well at the new speed. That depends on who is reading the page and what they came for, so most of my attention goes to review.

## Deciding how Ask behaves

Ask, the question box on this site, made this sharper. The mechanics are familiar: find the passages closest to a question, hand them to a model, return a short answer. The parts that make it trustworthy are design decisions. [check: how design, direction, review and code were split on Ask; this section credits the behavior decisions to Miles]

Ask answers only from what is published here, lists the pages it used and stays under 120 words. Drafts and protected client work never reach its index. When the honest answer is "ask Miles", it says so and opens a short form. The model can hand a question over for one of five reasons, but every word on that card is written in code, so a visitor asking for an estimate reads words I chose, not words a model improvised. [check: that this is the reason the card is written in code]

Code, not the model, also records whether each stored question was answered. That makes the list of questions this site can't answer yet a list I can act on.

Later I added a judge: a second model that classifies each question before the writer runs, with my code owning every threshold. It was tested on the Suits & Sandals site, where I built Ask first, with 19 questions run three times each. It picked the right handoff card in all 57 turns, up from 52, and answered 23 turns without calling the writing model, up from 6. It also made worded answers slower. The median wait before an answer started went from 3.5 to 4.7 seconds, because the judge runs first. Turning down the writer's reasoning brought that to 1.5 seconds.

On this site the judge sits behind a switch, and it's off for now. Shadow mode comes next. The test says the judge works. Whether it's worth turning on here is a separate question, and no test answers it for me.

## Guards come from noticing

The workspace setup behind those 14 branches is four short scripts. The guards around them took longer to write than the scripts, and each one came after a bug I hit. The workspace app renames a workspace to its branch, and with databases keyed on the name, the next run created a second one and the archive dropped the wrong one. A dev server left running from another repo held a port, so the Open button reached the wrong site. I found both by using the setup, not by reading it.

The pre-push hook that guards migrations comes from the same thinking. It watches a short list of schema files, not whole folders, so editing a component or a story never trips it. A check that fires on everything teaches everyone to bypass it. That is an interaction design problem as much as an engineering one.

## The work that's left

None of this is new to design. Deciding what a system should refuse, what a person sees when it is unsure, and which warning deserves their attention has always been the job. Agents make it cheap to build more, and that makes choosing a bigger share of the work, not a smaller one. On this site the workspace handles setup and landing. I do the review and the release.
