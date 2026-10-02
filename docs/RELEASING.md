# Releasing myCrib

This is the public version of the release procedure. It exists for two readers: a contributor who
wants to know what happens between "merged" and "the image updated on my NAS", and whoever cuts the
first release of a fork under the clause in [CONTRIBUTING.md](../CONTRIBUTING.md#6-review-and-merge)
("If the maintainer stops"). Nothing here needs tooling outside this repository: `git`, `npm`,
`gh` and a browser are enough.

A release is a tag `vX.Y.Z` on this repository. Everything downstream hangs on that tag:

- `docker-publish.yml` runs on every `v*` tag, from any branch, and pushes the multi-arch image
  to `ghcr.io/mokudev/mycrib`. Upstream also keeps a legacy `oikos` mirror for its own pre-rename
  installations; that history is upstream's, not this fork's, so there is no second image name
  here (the comment above `images:` in the workflow says the same).
- `umbrel-publish.yml` runs when the GitHub release is published and opens, or renames, the
  store PR against `getumbrel/umbrel-apps`.
- TrueNAS picks up the new image tag on its own; the Unraid template points at `latest`.

The in-app changelog reads `CHANGELOG.md` from the image, not the GitHub release: this fork
dropped the releases-API path, because for a fork it showed the upstream project's history
(`server/routes/changelog.js`). What every household sees on the next start is therefore the file
that shipped in the image - the GitHub release is for people reading the repository.

## Two tracks, and the check that decides

Releases run on two tracks, described in [CONTRIBUTING.md](../CONTRIBUTING.md#release-cadence):
anything under `public/pages`, `public/styles`, `public/utils`, `public/components` or
`public/settings` ships on Wednesdays and Sundays only; everything else ships any day, at most once
per calendar day. `npm run check:release-cadence` decides, and it runs **before the tag**, because it compares
`git describe --tags` with `HEAD` and an already-set tag makes that diff empty. It judges the whole
release, not the last commit: a server-only fix on a `main` that also carries interface work since
the last tag is an interface release.

## The ordinary release, from `main`

1. **Version.** `npm version <patch|minor|major> --no-git-tag-version`, then read the new number
   from `package.json`. The bump comes before the changelog: `test:changelog` accepts a version
   heading that has no tag yet only when it equals the version in `package.json`, so that an
   ordinary pull request cannot file its entry under a release heading of its own.
2. **Changelog.** Rename `## [Unreleased]` to `## [X.Y.Z] - YYYY-MM-DD`, add a fresh empty
   `## [Unreleased]` above it, keep every bullet. Only Keep-a-Changelog sections (`Added`,
   `Changed`, `Fixed`, `Removed`, `Security`), one bullet per user-facing change, in English. Do
   not touch the file header; `npm run test:changelog` checks the structure, and that no section
   released earlier differs from its tag.
3. **Service worker.** Set `APP_RELEASE` in `public/sw.js` to exactly that number. `npm version`
   does not touch this file, and `test:frontend-audit` fails the build if it disagrees with
   `package.json`. If a file was added under `public/`, `test:sw-precache` also has to be green:
   the precache list is explicit.
4. **Version literals in the docs.** The landing pages and the installation guide carry the
   version and the release date as text: `docs/index.html` (hero bar and footer, with
   `data-released`), `docs/install.html` (footer, with `data-released`), and `docs/installation.md`
   (pinning example, compose line, `cosign verify` and `imagetools inspect` examples, sample
   startup log). Both footers carry the date twice, in `data-released` and as visible text, and the
   version grep finds neither. Treat that list as a hint and the grep as the authority - it has
   been wrong twice:

   ```bash
   grep -rn "<old version>" README.md README.de.md docs/*.html docs/*.md tools/installer/
   ```

   Historical `(vX.Y.Z)` markers inside `docs/SPEC.md` stay as they are.
5. **Star count on the landing pages.** `node scripts/update-gh-stars.mjs`, then stage
   `docs/index.html` and `docs/install.html` if it changed anything. Both carry the number in
   `[data-gh-stars]` elements and the script writes both - staging only `index.html` leaves
   `install.html` behind at the old count. It is embedded here, at release time, on purpose: the
   page never calls `api.github.com` from a visitor's browser, so opening it transmits no visitor
   data to a third country (`docs/datenschutz.html`). A weekly workflow did this until 7 September
   2026. It was removed because `main` requires status checks that a push from Actions cannot
   bring: the push was rejected, and the count silently stopped moving after 24 August.

6. **Umbrel store notes.** Fill `.github/umbrel-release-notes.md` and move its
   `<!-- version: X.Y.Z -->` marker. The publish workflow takes the text verbatim and aborts if the
   marker does not match the release, which is deliberate: a stale note describes an update a
   household is not getting. The rules for the text are in the head of the file.
7. **Cadence.** `npm run check:release-cadence`. Red is an answer, not an obstacle: wait for the
   next Wednesday or Sunday, take the interface change out, or - for a security or data-loss fix that cannot be
   separated from `main` - pass `--hotfix "<reason>"`; the reason is mandatory and printed.
8. **Handrail, interface releases only.** If the diff since the last tag touches the interface
   paths above, run the browser suite once, and read its exit code from a file rather than a
   pipe (`| tail` reports the status of `tail`):

   ```bash
   npm run test:document-guards > /tmp/dg.log 2>&1; echo $?
   ```

9. **The whole chain.** `npm test`, green. A green single suite is not evidence; the guards that
   went red in the past (`test:sw-precache`, `test:document-folder-keys`, `test:changelog`) were
   never in anyone's "relevant" list.
10. **Commit, fetch, tag, push - in that order.** `git commit -m "chore: release vX.Y.Z"` with
    `CHANGELOG.md`, `package.json`, `package-lock.json`, `public/sw.js`, the docs from steps 4 and 5 and
    the Umbrel notes staged by name (never `git add -A`). Then `git fetch origin` **before**
    `git tag vX.Y.Z`: the fetch brings in a tag somebody else may have set for the same version,
    and the tag command fails before anything is pushed. Then `git push && git push --tags`.
11. **GitHub release.** Write the new changelog block to a file and pass it with `--notes-file`;
    a failed shell substitution yields an empty string that `gh` accepts without a word:

    ```bash
    gh release create vX.Y.Z --repo MokuDev/myCrib --title "vX.Y.Z" --notes-file <file>
    gh release view vX.Y.Z --repo MokuDev/myCrib --json body --jq .body
    ```

    Read the body back. A successful `create` reports the URL either way.
12. **Downstream.** `gh run list --workflow=docker-publish.yml --limit 1` must show success (a
    failed image build silently stalls TrueNAS too). If it shows no run *at all* for the tag,
    the push did not start one - dispatch the workflow against the tag ref instead
    (`gh workflow run docker-publish.yml --ref vX.Y.Z`). The result is the same image and the
    same tags: `github.ref` is then `refs/tags/vX.Y.Z`, which is what the `latest` condition in
    the workflow reads. This happened for v1.0.0.

    **The Umbrel step does not run in this fork, and that is an open building site rather
    than a step you forgot.** `umbrel-publish.yml` carries the image name hard-wired: it looks
    for `ghcr.io/${{ github.repository_owner }}/yuvomi:X.Y.Z`, that is `ghcr.io/MokuDev/yuvomi`
    - an image that does not exist, because this fork publishes `mycrib`, and uppercase on top
    of that, which is what cosign already tripped over. It would also need a
    `MokuDev/umbrel-apps` fork and the `UMBREL_FORK_TOKEN` secret. Whoever wants this fork in
    the Umbrel store fixes the workflow first; until then a release ends after the image build.
    The lookup that upstream kept here (`gh pr list --repo getumbrel/umbrel-apps --author
    ulsklyc ...`) asked for the origin project's pull requests and never belonged in a fork.

## A security fix: patch release from the last tag

Since v2.64.1 (4 September 2026) a security fix does not wait for `main` to be releasable and
does not pull the interface work waiting there forward with it. It ships from a branch off the
last tag, carrying the fix, its tests and its documentation and nothing else:

1. `git switch -c release/X.Y.Z vX.Y.(Z-1)` - the branch starts at the tag, not at `main`.
2. Cherry-pick the fix commits. On the branch `## [Unreleased]` holds only the `### Security`
   block; expect a conflict there if `main`'s Unreleased section is not empty, and resolve it to
   the security entries alone.
3. Steps 1 to 6 above, by hand where the version bump tooling assumes `main`. The Umbrel notes are
   part of it: the publish workflow aborts on a stale version marker whichever branch the release
   came from. A guard that landed after the tag (the cadence check itself was such a case in
   September 2026) is absent on the branch; run it from a copy taken off `main`.
4. `npm test` on the branch, then commit, fetch, tag, push, release, downstream - steps 9 to 12.
   The cadence check passes on the second track by construction: the diff since the last tag is
   the fix.
5. Merge the branch back: `git switch main && git merge --no-ff release/X.Y.Z`. Two conflicts
   are normal - `CHANGELOG.md`, where the new block goes below `## [Unreleased]` and the
   Unreleased bullets stay, and `public/sw.js`, where `main`'s shape of the file wins with the new
   version number. After resolving, check that `CHANGELOG.md` contains no conflict markers and that
   its heading structure is what you meant (`git add` checks neither; `test:changelog` compares
   every released section with the new tag and so catches a bullet that slid into or out of the
   new block, but not one that landed under the wrong heading inside `[Unreleased]`), run
   `npm test` on the merge, push.

Publish the advisory after the image is out, with the fixed version, the reporter's credit and a
CVE requested through GitHub. The response times this has to fit are in
[SECURITY.md](../SECURITY.md#reporting-a-vulnerability).

## What a fork has to change

- The image names in `docker-publish.yml` follow `github.repository` and
  `github.repository_owner`, so a fork publishes under its own account without edits; the `oikos`
  mirror line then publishes `<owner>/oikos`, which a fork can drop.
- `umbrel-publish.yml` needs the `UMBREL_FORK_TOKEN` secret (a token with `repo` scope on a fork of
  `getumbrel/umbrel-apps`) and pushes to that fork; without the secret the job fails and nothing
  else is affected.
- The Claude review workflows need their own API key or can be deleted; they merge nothing.
- The image runs Node 24 (`Dockerfile`, pinned to a digest that Dependabot moves), and CI tests
  Node 22 and 24; `test:docker-publish` keeps the CI matrix and the image's major together.
- Every action in `.github/workflows/` is pinned to a commit SHA with the version as a comment;
  `test:workflow-pins` refuses a floating tag, and Dependabot updates the SHA and the comment
  together.
