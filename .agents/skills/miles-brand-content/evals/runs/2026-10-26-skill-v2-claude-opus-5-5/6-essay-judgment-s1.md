# Why design judgment matters more when agents write the code

More than half the commits in this site's repo list a coding agent as co-author: 261 of 486. The usual reading of a number like that is that design shrinks to a description. Say what you want, review the diff, ship. If the code arrives on its own, judgment becomes a nice extra.

My work has gone the other way. Agents made building cheap, and the cost moved to the decisions around it: what a task should be, what the system must refuse to do, and whether the result is right. Those were always design questions. Now there are more of them, and they arrive faster.

The speed is real. On 7 October this repo took 58 commits from 14 workspaces, each on its own branch, most of them driven by a coding agent while I reviewed the one before. I keep three to six open at a time, and the limit is my attention, not the machine. An agent will finish the task it was given. It won't tell me whether that was the right task, or whether "done" matches what a visitor needs.

Ask, the box on this site that answers questions about my work, shows what that judgment looks like. It answers from published pages only, in under 120 words, and lists the pages it used. The design question in Ask is when it should not answer at all: when someone wants an estimate, wants to talk about their own project, or asks something the site holds no answer to. Then the honest reply is "ask Miles", and Ask should say so and open a short form that reaches me.

Before the judge, the writing model made that call. On the Suits & Sandals site, where I built Ask first, it showed the wrong handoff card in 5 of 57 test turns (19 questions, three runs each). So a second model now classifies each turn before the writer runs, and code, not the model, owns every threshold. In the same test the right card came up 57 times out of 57. Every word on those cards is written in code as well. That choice fixes what a visitor reads at the moment they want a person.

The judge had a price. It runs before the writer, so worded answers got slower: median time to first output went from 3,490 ms to 4,655 ms, until setting the writer to minimal reasoning brought it to 1,542 ms. On this site the judge still ships switched off, with shadow mode next. I decided what Ask refuses and where its thresholds sit, and coding agents built much of it under my review. [check: how the Ask work was split between Miles and the agents; no source records it]

The same judgment runs through work no visitor sees. The scripts that give each workspace its own database and port are short. The guards around them took longer to write, and each one came after a bug: a renamed workspace that spun up a second database, a dev server from another repo holding a port, a pulled env file that pointed local schema pushes at the production database. The pre-push hook that protects migrations checks a list of schema files rather than whole folders, so editing a component never trips it and nobody learns to bypass it. That is a decision about behavior. A check people route around protects nothing.

In the loop I run now, each task starts as one line from me and lands only when I decide it is right. Agents fill the middle, and the middle got cheap. The two ends are design work, and they are the part of the job that grew.

The workflow is written up in [Fourteen branches, one afternoon](https://www.milesroxas.com/posts/fourteen-branches-one-afternoon-how-i-work-in-parallel-as-a-solo-engineer).
