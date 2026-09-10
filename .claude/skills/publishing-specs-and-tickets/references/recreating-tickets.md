# Recreating tickets

Read this only when the split between tickets is wrong and editing in place
cannot fix it. Recreating is two operations, and the second is the one that gets
skipped, leaving orphans in the issue list.

## Order

1. **Create the replacements first**, with the correct split, correct titles,
   and the spec's labels. Do not close anything yet — if creation fails halfway
   you still have the originals.
2. **Re-link**: attach each new ticket as a sub-issue of the spec, and rebuild
   the dependency edges. Edges do not follow a number; a blocker recreated as a
   new issue needs its edge added again with the new database id.
3. **Rewrite the spec's ticket list** to the new numbers.
4. **Close the superseded issues**, each with a comment naming its replacement:
   `gh issue close <old> --comment "Superseded by #<new>."` Do not delete them —
   the comment is what makes an old link in a commit message still readable.
5. **Say so in your reply**: which numbers were superseded, by which.

## Done means

- `gh api repos/CrispyChicken2/My-Web-Portfolio/issues/<spec>/sub_issues --jq '[.[].number] | sort'`
  lists the new tickets and none of the superseded ones.
- Every superseded issue is **closed** and carries a `Superseded by #<new>.`
  comment: `gh issue view <old> --comments --json state,comments`
- No superseded issue still appears in the spec body's ticket list.
