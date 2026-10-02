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

- **Der zweite Abgleich mit dem Ursprungsprojekt** (`ulsklyc/yuvomi`, 13 Commits seit
  deren v2.71.0).

### Added

- **Norwegian Bokmål as the 26th language** (#1529, translated by @nilsanmy). The app, the web
  installer and the command-line installer speak Norwegian Bokmål. A Norwegian Bokmål browser or
  `LANG=nb_NO.UTF-8` picks it on its own, and the new region "Norwegian Bokmål (Norway)" sets
  kroner, day.month.year and the 24-hour clock in one step. A household on that region without
  its own data language also gets Norwegian for the entries myCrib writes itself.

### Changed

- **Task history shows the selected task beside it on wide screens** (#1550). From the width
  at which the task list becomes list and detail (a main column of about 1040px, so a 1280px
  laptop with the sidebar open and anything wider), the history entries stand on the left and
  the task of the selected entry opens on the right, as in the list: the first entry is
  selected when you open History, arrow keys move through the entries, the back button returns
  to the previous one, and a link with `?open=` selects its entry. List, Board and History now
  end at the same outer edge; until now History ended 436px short of the header at 1440px.
  Below that width History keeps its narrower reading lane and an entry still opens its task as
  a sheet. Switching between List and History selects the first row of the view you switch to,
  and the person filter in History fades at its edge when it does not fit.
- **The mobile tab bar is more glass and lets more of the page show through.** The floating
  capsule at the bottom of the screen is thinner (66 % instead of 86 % in light, 50 % instead of
  88 % in dark), blurs and saturates what scrolls beneath it more strongly, and carries a light
  sheen and a finer bright rim. Tab labels are now in the main text color, so they stay readable
  over photos and colored cards; the active tab keeps its violet label, filled icon and pill.
  With reduced transparency or increased contrast turned on, and in browsers without backdrop
  blur, the capsule stays opaque as before.

### Fixed

- **Correcting the date of a series' first entry no longer moves the rest of the series** (#1545).
  Every later occurrence of a recurring payment is counted from its start day, and that was still
  the date of the first entry. Correcting it with "Only this occurrence" (the rent was debited on
  the 6th, not the 5th) moved every month not yet shown to the 6th, and for a weekly or "every N"
  series it changed which days came up at all. A series now keeps its own start day. To move it,
  change the date on the first entry and choose "Change all future occurrences": the occurrences
  from today on move to the new day, while the first entry keeps its date once it is booked. On
  update every series keeps the start day it had, so no date changes. After a series is moved to a
  new day or given a new rhythm, opening a past month no longer adds a second booking on the new
  day next to the one already there: before the change, every past month of the series is filled
  in with its bookings on the old days, so none is missing and none is doubled. This also holds
  when the rhythm is changed on the first entry with "Only this occurrence", which until now left
  the old bookings standing and added the new ones beside them.

- **After leaving wall mode on the phone, the plus button and the tab bar look as before** (#1588).
  Leaving wall mode redrew the overview without taking its plus button out of the page: the button
  lost its plus sign, the tab bar stopped leaving room for it, its tabs grew wider and "More" slid
  under the button. The same happened after "Try again" on an overview that had failed to load.
  In both cases the button now takes its usual place next to the tab bar. Entering wall mode no
  longer leaves the plus button on the wall while the overview loads.

- **The task list orders a day's tasks by the household's clock, not the device's.** The order
  inside a group and a board column read the due time in the device's time zone. On a device whose
  zone skips an hour for daylight saving time, a task due in that hour moved an hour later and
  showed up after a task due later the same day, even when the household's own zone has no such gap
  that day. The order now compares the due date and time as entered, and "now" is the household's
  time, like the due label and the grouping next to it.

- **A task's "Starts on" badge follows the household's day.** The badge on a task without a due
  date compared its start date with midnight on the device. On a device in another time zone it
  stayed on a task that had already started in the household, or left too early. The date in the
  badge could also show the day before, for example with the device in Berlin and the household
  set to Honolulu.
- **A new recurring event shows up on its real days right away.** After creating a series, the
  calendar only placed the event on the start date typed into the form, which is not always one of
  its days: a series starting on the 15th that repeats on the last day of the month showed an entry
  on the 15th and none on the 30th or 31st. Its other occurrences in the open month or week only
  appeared after switching views. The calendar now loads the series from the server after saving,
  so every occurrence in view is shown and none on a day without one. If that reload fails or only
  reaches the offline copy, the new series still shows on its start day as before.

- **The command-line installer takes the answer its own prompt shows.** In German, Swedish, Dutch,
  Spanish, Portuguese, Italian, French, Polish, Czech and Turkish the yes/no questions show the
  local letter - `[j/N]`, `[s/N]`, `[e/H]` - but `install.sh` only understood `y`, so typing `j`
  for the weather widget, calendar sync or document storage silently answered no. Turkish `h` at
  the final "proceed?" did not cancel, and the Czech and Dutch letter for entering a key by hand
  generated one instead. Every language now accepts the letter its prompt shows and its own word
  for yes and no - `ja`, `sí`, `да`, `はい`, `نعم` and so on, also typed in capitals - as well as
  `y`/`yes` and `n`/`no`. The three document-storage questions, which showed `[y/N]` in those
  languages, now show the same letter as every other question.
- **The command-line installer now gets through all seven steps, on macOS as well.** The
  interactive setup ended without a message right after the prerequisite check, and after the
  summary it stopped before writing `.env`. On macOS two more stops were waiting behind those:
  the answers were compared with a bash 4 feature that the bundled bash 3.2 rejects with "bad
  substitution", and after the admin account was created a `head` option macOS does not know
  ended the run before the success message.

- **Budget categories, the API reference and OpenWeatherMap descriptions follow every app
  language** (#1523). Three places kept a language list of their own that stopped growing with
  the app: asked for their categories in Portuguese (Brazil), Hungarian, Korean, Indonesian,
  Persian, Filipino or Norwegian Bokmål, the budget answered in English, or in European
  Portuguese for Brazil, and the API reference listed only 15 languages as valid for `lang`.
  Both now take their languages from the app's own translations, so a new language works there
  from its first day. The weather tile with OpenWeatherMap now asks for the language in the
  spelling OpenWeatherMap documents (`pt_br`, `zh_cn`, `cz`, `kr`, `no`) instead of the app's
  code, which it does not list for Brazilian Portuguese, Chinese, Czech, Korean and Norwegian.
  Filipino, which OpenWeatherMap does not offer, uses `OPENWEATHER_LANG` and otherwise English.
  `OPENWEATHER_LANG` is that fallback and takes an OpenWeatherMap code; a code OpenWeatherMap does
  not list is now ignored in favour of English, as the installation guide and `.env.example` say.

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
