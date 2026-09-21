# My-Web-Portfolio

The personal site at **oscar-hunaut.dev**. For the shared vocabulary, read
[CONTEXT.md](./CONTEXT.md) before using any domain term. For how the site is
built, run and deployed, see [README.md](./README.md).

## Agent skills

### Issue tracker

Issues live as GitHub issues on `CrispyChicken2/My-Web-Portfolio`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` at the repo root, ADRs under `docs/adr/`. See `docs/agents/domain.md`.

## Working agreements

- **Commit and push only when the owner asks, never on your own initiative.**
  Finishing a piece of work means leaving it in the working tree and saying what
  changed — not committing it. When the owner does ask, work on a branch rather
  than committing to `main`. `git mv` stays off limits.
- Every visible string exists in both Locales. A string added to one Dictionary
  and not the other is a bug.
- Retheming happens in the Token block. Components never carry colour of their
  own.
