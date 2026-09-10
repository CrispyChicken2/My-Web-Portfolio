# Agent control

**The instruction document** is the `publishing-specs-and-tickets` skill
(`.claude/skills/publishing-specs-and-tickets/SKILL.md`). It fires when work is
being turned into GitHub issues on this repo — publishing a spec, breaking a
plan into tickets, repairing a spec whose tickets are mis-titled or unlinked,
or attaching already-closed tickets to their spec — and it exists because that
correction had to be given twice: once to rename a batch to the previous
batch's pattern, once because a spec shipped without its ticket list or its
sub-issue links. It needs judgement, which is why it is a document and not a
hook: the live call is whether to `gh issue edit` in place (issue numbers are
referenced from commits and dependency edges, so churning them destroys
history) or to recreate and delete, and that depends on whether the *split*
between tickets is wrong or merely the wording. It should **not** fire for
read-only questions about the tracker — "why is issue 12 blocked?" is answered
from `docs/agents/issue-tracker.md`, and a fresh session confirmed it stays
away. The case where it over-fires is adding a single ticket to an existing
spec: it will make the agent re-read the whole previous batch and run four
completion checks for one issue. I accept that cost rather than narrow the
wording and lose the repair case.

**The enforcement** is two things the model cannot talk its way past. A
`PostToolUse` hook runs the Dictionary-parity test whenever `src/data/content.js`
is written and exits 2 if a string exists in one Locale and not the other —
`PostToolUse` rather than `PreToolUse` because parity is a property of the file's
contents, so there is nothing to test until the write lands. And
`permissions.deny` blocks `git add|commit|push|mv`. Instruction was insufficient
for a reason I watched happen: CLAUDE.md already said commits are the owner's
alone, and in two fresh sessions the agent honoured it — then volunteered *"if
you want me to treat that rule as lifted, say so and I'll run git commands from
here on."* I said so, and it immediately tried to commit; the deny stopped it
and HEAD did not move. The point is not that the model is careless. It is that
identical prompt, identical context and identical model do not give identical
output — the variation is inherent to how these systems run and does not go
away as they improve. So "it has always complied" is a sample, not a guarantee.
Where the tenth outcome is cheap, a good probability is fine and an instruction
is the right tool. Where the tenth outcome is a commit in the owner's name or a
half-translated site in front of a recruiter, what you want is not a better
probability but a floor.

Evidence: [reached](agent-control/evidence-reached.md) ·
[blocked](agent-control/evidence-blocked.md) ·
[what I cut](agent-control/pruning-log.md)
