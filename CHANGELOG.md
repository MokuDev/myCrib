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
