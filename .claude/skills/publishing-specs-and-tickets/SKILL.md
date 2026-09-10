---
name: publishing-specs-and-tickets
description: How to publish a spec and its tickets as GitHub issues on this repo so the new batch matches the batch already there — title pattern, the ticket list at the end of the spec body, sub-issue links, dependency edges. Use when publishing a spec, turning a plan into tickets, repairing a spec whose tickets are missing or mis-titled, or attaching already-closed tickets to their spec.
---

# Publishing a spec and its tickets

The issue list is read by the owner scanning it top to bottom. A batch shaped
differently from the last one is wrong even when every issue is individually
correct. So the previous batch, not your judgement of what reads well, is the
spec for this one.

## Do this first, in order

1. **Find the previous spec.** `gh issue list --state all --search "spec" --json number,title,body --jq '.[] | {number, title}'`.
   Take the most recent spec issue that already has its tickets attached.
2. **Read it whole**, plus two of its tickets:
   `gh issue view <spec> --comments` and `gh issue view <ticket> --comments`.
3. **Write the pattern down** before publishing anything — in your reply, four lines:
   - the ticket **title pattern**, copied literally from a real title (prefix, numbering, capitalisation);
   - the **section headings** the spec body uses, in order;
   - the **labels** carried by the spec and by a ticket;
   - whether tickets are linked as **sub-issues**, a task list, or both.
4. **Decide edit versus recreate.** Default to `gh issue edit`. See
   [Edit versus recreate](#edit-versus-recreate) below.
5. **Publish**, in this order: spec first, then tickets, then the links.
   Commands are in [docs/agents/issue-tracker.md](../../../docs/agents/issue-tracker.md) —
   sub-issues and native dependencies are under *Wayfinding operations*.
6. **Run the completion check** below and paste its output.

## Done means

Not "follows the conventions". These four, each checked by a command:

1. **Every ticket is a sub-issue of its spec — closed ones too.**
   `gh api repos/CrispyChicken2/My-Web-Portfolio/issues/<spec>/sub_issues --jq '[.[].number] | sort'`
   returns every ticket number, with no ticket missing because it was already closed.
2. **The spec body ends with the ticket list**, in working order, and its numbers
   equal the set from check 1:
   `gh issue view <spec> --json body --jq .body | tail -20`
3. **Every ticket title matches the pattern from step 3.**
   `gh issue list --state all --json number,title --jq '.[] | select(.number | IN(<tickets>)) | .title'`
   — read the output against the literal title you copied. A title that needs a
   sentence of explanation to count as matching does not match.
4. **Every blocking relationship is a native dependency, not prose.** For each
   ticket declared blocked:
   `gh api repos/CrispyChicken2/My-Web-Portfolio/issues/<n> --jq .issue_dependencies_summary`
   shows a non-zero `blocked_by` while its blocker is open.

If a check fails, fix it and re-run that check. Do not report the batch
published with a check outstanding.

## Edit versus recreate

Two calls need judgement, and both are worth one sentence to the owner when close.

**Edit in place** when published issues are only mis-titled, missing the ticket
list, or missing their sub-issue link. Issue numbers are referenced from commits,
comments and dependency edges; churning them throws that history away.

**Recreate** only when the split between tickets is itself wrong — work sliced
across the wrong boundaries, not merely described badly. Recreating is a
two-part operation and the second part is the one that gets forgotten: see
[references/recreating-tickets.md](references/recreating-tickets.md).

## Related

- Vocabulary for the issues themselves: [CONTEXT.md](../../../CONTEXT.md)
- Label meanings: [docs/agents/triage-labels.md](../../../docs/agents/triage-labels.md)
