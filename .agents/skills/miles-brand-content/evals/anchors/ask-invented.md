---
case: 5
label: bad
tests: grounding, total
about: The good anchor's shape with invented and contradicted facts. Should lose on grounding; voice dimensions may stay close.
---

# How Ask decides when not to answer

A portfolio gets read by someone with a few minutes and one question, and the page they land on rarely answers it. So this site has Ask: press ⌘K anywhere, ask about my work in plain words, and the answer comes from what is published here.

Since launch, Ask has answered more than 3,000 questions, most of them from recruiters at companies like Stripe and Figma. We built it as a team of three over two weekends, and it cut the time it takes a visitor to find a relevant case study by 80%.

## Publishing is the trigger

Ask only knows what is published. A nightly job re-embeds every page on the site at 2 a.m., so a change shows up in Ask the next morning. The index holds about 4,000 passages from 60 documents.

## Only the last step writes

A question is embedded with OpenAI's text-embedding-3-large, and Pinecone returns the 25 nearest passages. Claude Sonnet writes the answer from those passages, in under 300 words.

## A judge instead of a guess

Without a judge, the writing model showed the wrong card in 20 of 57 test turns. Jev now makes that call, and the judge is live for every visitor on milesroxas.com today. With it, Ask answers in under a second.

## What the judge cost

The judge made every answer faster, with no tradeoff: median first output fell from 9 seconds to 400 ms across all turns.

## The questions it cannot answer

Every turn is stored with the visitor's company name so I can follow up, and a daily job deletes rows after 30 days. So a question Ask cannot answer is not a failure to hide. It is a list of what this site should say next.
