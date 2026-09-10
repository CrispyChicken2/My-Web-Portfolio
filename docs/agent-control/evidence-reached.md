# Evidence: the document is reached unprompted

Every run below is a **fresh session** (`claude -p …`, no prior context, no
mention of the skill in the prompt), captured 2026-09-10. Tool traces are read
back from the child session's own transcript under
`~/.claude/projects/C--Users-oscar-Documents-Site-internet-CV/`.

## Positive — it fires (run A)

Prompt, worded the way the owner actually words it, matching none of the
pointer's phrasing (no "spec", no "tickets", no "sub-issue"):

> put the deck resize work up on github as issues so i can track it — the
> write-up plus one issue per piece of work

Tool trace, session `8bd0a4a6-e164-443b-b591-976b804740f8` — **first action, before
any exploration**:

```
TOOL Skill {"skill":"publishing-specs-and-tickets"}
TOOL Bash  gh issue list --state all --limit 40 --json number,title,state,labels
TOOL Bash  gh issue view 13   (the previous spec)
TOOL Bash  gh issue view 15 / gh issue view 14   (two of its tickets)
```

That is steps 1–2 of the skill executed in order. It then reported the pattern
back before proposing anything, which is step 3.

## Negative — it stays away (run B)

> why does issue 12 show up as blocked? just need an answer, dont change anything

Session `2260b76c-cd39-4de1-8c76-c82f943fb221`. **No `Skill` call.** It read
`docs/agents/issue-tracker.md` instead — the right document for a read-only
question about dependency state — and answered correctly (naming collision
between ticket 12 and issue #15, blocker #14 already closed).

## Negative — the misfire I expected, and it didn't happen (runs F, G)

The pointer leans on the word **publish**, which this repo also uses for
deployment. Probe:

> publish the site — whats the deploy story here, does pushing to main do it?

Session went to `README.md`, `.github/workflows/ci.yml` and the Vercel tools.
**No `Skill` call.** A second probe on the triage-adjacent case —

> issues 14 and 15 are done, can you sort out their labels so the tracker isnt
> misleading

— also stayed away, reading `issue-tracker.md` and `triage-labels.md`.

**Where it would still misfire.** Both negatives were near-misses that landed
right, not proof of a clean boundary. The case I'd expect to go wrong is a
*partial* one: "add one more ticket to spec #13". That is publishing, so the
skill fires and makes the agent read the whole previous batch and run four
completion checks — correct but heavy for a single issue. I have not found a
wording that keeps the repair case (the one that actually bit us) while
excluding the one-ticket case, and I would rather over-fire there than lose it.

## The pointer was not sharpened

It fired on the first attempt with the original description, so there is no
before/after pair to show for the *pointer*. The before/after in this lab is the
pruning instead — see [pruning-log.md](pruning-log.md) and
[SKILL-before-prune.md](SKILL-before-prune.md).

## Positive again, after pruning (run A2)

Same prompt as run A, re-run against the pruned skill, session
`9f932b23-5792-4482-8060-248402592e24`:

```
TOOL Skill {"skill":"publishing-specs-and-tickets"}
TOOL Bash  gh issue list --state all --limit 40 …
TOOL Bash  gh issue view 13 / sub_issues of 13 / gh issue view 14
```

Same entry point, same order, and it ran all four completion checks explicitly,
reporting: titles match `NN: Sentence-case` continuing 01–10 into 11, 12; the
blocking edge is native (`total_blocked_by: 1`), not prose.
