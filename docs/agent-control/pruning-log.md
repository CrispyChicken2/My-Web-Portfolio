# What I cut, and what happened

Method: delete, then re-run the *same* prompt as run A in a fresh session and
compare against the pre-cut trace. Pre-cut skill kept as
[SKILL-before-prune.md](SKILL-before-prune.md).

| Cut | Where | What happened |
|---|---|---|
| `- Commits and pushes are the owner's alone — publish issues, never commit.` | SKILL.md, Related | **No-op — stays deleted.** Already in CLAUDE.md, which is always loaded. Two copies means no authoritative version, and repeating it made it outweigh rules stated once. It is also the one rule here that does not depend on prose at all — it is a `permissions.deny` entry. |
| The `**How closely to imitate.**` paragraph (previous spec is a pattern, not a straitjacket; don't drop a section because this one's version would be short) | SKILL.md, Edit versus recreate | **No-op — stays deleted.** Re-run A2 produced the same trace and the same four completion checks. It was true and on-topic, and it changed nothing: the numbered steps already make the agent copy the pattern explicitly, so the caveat had no work to do. |
| The whole `## Drafts under \`.scratch/\`` section, plus the `.scratch/` clause in the intro | docs/agents/issue-tracker.md | **A rule whose subject is gone.** `.scratch/` does not exist in this repo and neither does `SPECS.md`, which it linked to. It was steering the agent toward staging drafts in a directory it would have had to create. Deleted rather than reworded — "keep drafts somewhere sensible" would have been a no-op with better grammar. |
| The `## Publishing a spec and its tickets: match what is already there` section I added earlier | docs/agents/issue-tracker.md | **A rule that existed twice.** Same convention as the skill. Replaced with a three-line pointer to the skill, which is now the single authoritative copy. |

What I did **not** cut, having considered it: the opening paragraph ("the issue
list is read by the owner scanning it top to bottom"). It is the only line that
says *why* the previous batch outranks the agent's own taste, and without it the
numbered steps read as arbitrary ceremony. Untested — I am keeping it on
judgement, not evidence, and that is the honest status.
