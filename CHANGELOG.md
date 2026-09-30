# Changelog

All notable changes to myCrib will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

myCrib is a fork of [ulsklyc/yuvomi](https://github.com/ulsklyc/yuvomi). This file starts fresh
from the fork: it no longer carries upstream's release history, and the in-app changelog no
longer fetches release notes from upstream's GitHub repository either - both showed Yuvomi's own
patches as if they were myCrib's. From here on, this file is the only source, and it only records
myCrib's own patches - including the ones it takes over from upstream, in its own words.

## [Unreleased]

## [1.1.0] - 2026-09-30

- **Der erste Abgleich mit dem Ursprungsprojekt seit dem Fork.**

### Added

- **Everything upstream built between 27 and 30 September.** 65 commits from `ulsklyc/yuvomi`
  (their v2.70.0 and v2.71.0), taken over as one merge rather than picked apart: the calendar
  learns swipe and keyboard navigation and shows the picked day below the month grid on a phone,
  documents preview their own first page, the pantry gets an "Expiring soon" tile, the overview
  shows what is still open in shared expenses, and a long pass over budget, dashboard, settings
  and the kitchen tabs. Their application code merged without a single conflict; what did
  conflict was this fork's own naming, nothing functional.

- **Brazilian Portuguese (pt-BR).** Upstream added the locale for the app, the web installer and
  the CLI installer; it arrives named after this fork like every other language.

### Fixed

- **Shared expenses no longer carry ledger rows of expenses that are gone** (schema v227). Until
  now a deleted account took its expenses and shares with it but left the ledger rows behind, and
  the balances kept counting them - with no list anywhere that explained the difference. The
  migration removes the orphans once; new ones cannot appear.

- **A recurring booking keeps its own definition** (schema v228, upstream #1035). The first row of
  a series was two things at once: the template every future occurrence is built from, and an
  ordinary booking someone entered. "Change all future ones" therefore rewrote a booking that
  could be years old - measured, the rent from January 2020 moved to the new account on an
  account switch, and both balances were wrong afterwards. The series now has a definition of its
  own and the original becomes a normal booking.

- **Thirty-five more fixes from upstream**, among them: reminders, medication and housekeeping
  check-ins follow the household's clock instead of the device's; a restore waits for work that
  runs after the response and refuses while a server still uses the database; CalDAV and WebDAV
  ask for the password again when the server or username changes; plural forms (few, dual, many)
  for every counting string; and the installed iPhone app loses the grey strip under its tab bar.

- **The release guide pointed at the wrong repository.** `docs/RELEASING.md` had not been touched
  when the app was renamed: it named upstream's image and its legacy mirror, claimed the in-app
  changelog reads the GitHub release (this fork reads the file), and told the maintainer to create
  the release in `ulsklyc/yuvomi`. It also says now, plainly, that the Umbrel step does not work
  in this fork rather than pretending a repository name fixes it.

## [1.0.0] - 2026-09-27

- **hallo welt :) (und mary)**

### Added

- **Vital readings and lab values can be edited.** Taken over from upstream: the edit button on a
  recent reading in Health opens it with its values, time, visibility and note filled in; delete
  moved to the left of the dialog footer with the usual undo. Lab values get the same treatment,
  with the flag recalculated from the corrected value.
- **One sheet grabber, one add button and one sliding highlight.** Taken over from upstream:
  mobile sheets got a visible, finger-following grabber; the labelled add button and its shortcut
  now match across every module; and the moving highlight that used to be unique to the kitchen
  tabs now runs in every segmented control and tab bar.

### Changed

- **myCrib is its own app now, not a themed Yuvomi.** Every self-referential "Yuvomi" mention in
  the running app, the self-hosted installer wizard, the README and the docs site now reads
  "myCrib". The abstract three-circle mark is replaced everywhere by dedicated artwork: the PWA
  icon set (including the browser tab favicon), the login and setup pages, and the installer
  wizard's header and completion screen.

### Fixed

- **Task select mode no longer reacts to swipes or subtask taps.** Taken over from upstream: while
  selecting, a swipe does nothing and subtasks show their state without their own buttons, so a
  tap cannot complete or change something you meant to select instead.
- **Budget entries start with no guessed category, and a deleted series keeps its totals honest.**
  Taken over from upstream: a new entry starts with no category preselected and saving asks for
  one; deleting a whole series while one account is open now waits for the month to reload
  instead of undercounting occurrences booked elsewhere.

### Removed

- **The Help panel no longer links to Yuvomi's community user guide.** The in-app Help dialog
  dropped the link to a third-party docs site that documented the wrong app for a fork.
