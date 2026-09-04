# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.

## Repo notes

The defaults are unchanged: every label string equals its role name.

None of these labels exist on `CrispyChicken2/My-Web-Portfolio` yet — the repo
has never used labels. They are created on first use, not up front. Before
applying one, check whether it exists and create it if not; do not silently drop
a label because the tracker rejected it.

The ten drafted tickets under `.scratch/dynamic-frontend-redesign/issues/` are
all `ready-for-agent`, so that is the first label this repo will need.
