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

- **Commits and pushes are the owner's alone.** Never run `git add`, `git commit`,
  `git push`, or `git mv`. Leave changes in the working tree and say what you
  changed.
- Every visible string exists in both Locales. A string added to one Dictionary
  and not the other is a bug.
- Retheming happens in the Token block. Components never carry colour of their
  own.
