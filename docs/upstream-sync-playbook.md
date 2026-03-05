# Upstream Sync Playbook (Protect Multi-User Architecture)

Use this process whenever pulling improvements from `upstream` (`md-viewer`) into this repo.

## Why this playbook exists

`upstream/master` has diverged from this project's multi-user architecture. A blind merge can reintroduce single-user assumptions.

Protected areas:

- `src/app/page.tsx`
- `src/types/database.ts`
- `supabase/migrations/20240302000000_multi_user.sql`
- `src/lib/auth.ts`
- `src/middleware.ts`

## Golden rules

1. Do **not** run a blind `git merge upstream/master`.
2. Prefer **targeted cherry-picks** for UI/UX commits.
3. If a conflict touches protected files, keep local architecture and manually port only safe UI changes.
4. Always create a backup branch first.

## Safe workflow

1) Start clean and create backup

```bash
git status --short --branch
git branch backup/pre-upstream-sync-YYYYMMDD
```

If you have local unstaged changes (example: `.gitignore`), stash them first:

```bash
git stash push -m "temp-before-upstream-sync" .gitignore
```

2) Fetch and inspect upstream

```bash
git fetch upstream
git log --oneline --reverse upstream/master
```

3) Find candidate commits (usually UI-only)

Check files touched by each candidate commit:

```bash
git log --oneline --name-only --reverse <base_commit>..upstream/master
```

Only choose commits that avoid protected architecture files, or be ready to resolve conflicts carefully.

4) Cherry-pick selected commits

```bash
git cherry-pick <commitA> <commitB> <commitC>
```

If a conflict occurs:

- Resolve non-protected files normally.
- For protected files, keep local architecture first:

```bash
git checkout --ours -- <protected-file>
git add <protected-file>
git cherry-pick --continue
```

Then manually re-apply only safe UI bits if needed.

5) Restore stashed local edits (if any)

```bash
git stash list
git stash pop
```

6) Verify architecture remained intact

```bash
git diff --name-status backup/pre-upstream-sync-YYYYMMDD..HEAD -- src/app/page.tsx src/types/database.ts supabase/migrations/20240302000000_multi_user.sql src/lib/auth.ts src/middleware.ts
```

Expected result: no output (or only intentional architecture edits you explicitly made).

7) Validate app

```bash
npm run lint
npm run build
```

## Recovery plan

If the sync goes wrong:

```bash
git switch backup/pre-upstream-sync-YYYYMMDD
```

or branch again from backup and retry with a tighter commit selection.

## Suggested cadence

- Sync upstream in small batches (few commits at a time).
- Validate after each batch, not after dozens of commits.
- Keep this playbook updated whenever protected architecture files change.
