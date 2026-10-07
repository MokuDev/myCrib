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

## [1.2.0] - 2026-10-07

### Added

- **Norwegian Bokmål as the 26th language** (#1529, translated by @nilsanmy). The app, the web
  installer and the command-line installer speak Norwegian Bokmål. A Norwegian Bokmål browser or
  `LANG=nb_NO.UTF-8` picks it on its own, and the new region "Norwegian Bokmål (Norway)" sets
  kroner, day.month.year and the 24-hour clock in one step. A household on that region without
  its own data language also gets Norwegian for the entries myCrib writes itself.
- **Admins are asked once whether the household should use the browser's time zone** (#1607).
  A household that never chose a time zone counts "today" in the server's zone, usually UTC, so
  east of UTC today's meals stayed empty and overdue tasks were not counted during the first
  hours of the day. If your browser is in a different zone, the overview now shows one line
  naming both zones with two choices: use the browser's zone, or keep things as they are. Either
  answer ends the question for every admin on every device, and nothing changes until someone
  answers. The same line with the first choice stays in Settings under "Time zone" for as long
  as the zones differ; members see it without the button. A browser that reports only UTC or
  no zone never triggers it, and two names for the same zone (Asia/Calcutta and Asia/Kolkata)
  do not count as a difference.

### Changed

- **Four syncs with the origin project** (`ulsklyc/yuvomi`, up to its v2.73.0): visibility of
  reminders, tasks, calendar and budget, modules switched off for the household, time zone and
  Korean fixes, the loan dialog and the back button. It includes migration 230 for the rewards
  ledger, which runs on its own at the first start.
- **The event and task forms say when "Only me" is combined with assigned people.** Visibility
  "Only me" means only the person who created the entry sees it, so the other people
  assigned to it do not see it. The form now shows a hint for that combination and points to
  "Assignees only" for an entry they should see. Nothing is blocked and the assignment stays as
  it is.
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


- **A module switched off for the household no longer works in the background** (#1660). With
  Health switched off, the medication scheduler kept creating the due doses and sending their
  reminders - as a push and on notification channels, to the person and to their caregivers - and
  tapping one opened a page that turned you away. It now does nothing while Health is off. After
  switching Health back on, only today's doses that are already due come up, at most one reminder
  per time of day; the days in between are not caught up. Two quieter cases follow the same rule:
  check-up and vaccination reminders are no longer prepared while Health is off (they were held
  back from delivery already, and come back on the first run after switching it on), and the
  hourly import from a recipe provider (Mealie, Tandoor) pauses while Recipes is off. "Sync now"
  in the settings still works, and the module's own pages and API stay reachable as before.
- **A module switched off for the household is left out of the overview's data and of the
  calendar** (#1660). The app already hid the tiles, but the server kept sending their content:
  with tasks, budget or health switched off, the overview's answer still carried the tasks, the
  month's figures and the medication - visible to anything that reads the API, a wall display or
  a script included. It now sends those parts empty, in the same shape as before. With Birthdays
  switched off, birthdays and name days no longer appear among the calendar's events, in the
  event search, in the overview's event lists or in the calendar feed subscribed in another
  app; they return when the module is switched back on. Switching the calendar off does not
  take the birthday tile along. A module that is switched off is still not locked: its own
  pages, API routes and exports answer as before, and what a member may not reach is decided by
  permissions. The rule is written down in `docs/DECISIONS.md`, entry 11.
- **A time stored with a fraction of a second keeps its exact moment** (#1658). A time saved
  without a time zone and with milliseconds - which only happens to rows brought in by hand, the
  app itself never writes one - was read up to two seconds late, because the fraction was added
  two or three times. Just before midnight that was enough to move an event, a reminder or a
  housekeeping visit to the next day, and on the last of a month into the next month. Such a
  value is now read as the moment it says, in every time zone and across the nights the clocks
  change. Nothing stored is rewritten.
- **The loan dialog checks "Installments already paid" at the field and reports errors in your
  language** (#1656). Typing more paid installments than the loan has, a negative number or a
  fraction used to be sent off, refused by the server, and shown as a short English message at
  the bottom of the screen, whatever language the app was set to. The field is now checked
  before saving, in both places a loan can be created: it is marked, says what is wrong, and the
  dialog stays open with everything you typed. For a loan with interest the number is compared
  with the term the server works out, the same one the preview shows. When the server does
  refuse a loan, the message appears at the field it belongs to and in the app's language. The
  name, title and notes fields no longer accept more text than can be saved. For the API:
  `POST /budget/loans` and `PUT /budget/loans/:id` now add a `reason` code to a 400 answer; the
  `error` text is unchanged.

- **A Norwegian browser or system that reports `no` or `nn` gets Norwegian instead of English.**
  Norwegian Bokmål ships as `nb`, but many browsers and systems announce the general code `no`
  (`no-NO`, `LANG=no_NO.UTF-8`), and that fell through to English. The same went for Nynorsk
  (`nn`), which has no translation of its own: it now gets Bokmål, the closer language, rather
  than English. This holds for the app, the web installer, the command-line installer and the
  `lang` parameter of the API. An explicit language choice in the settings is not affected.
- **A loan created from "New entry" in the budget overview can say how many installments are
  already paid** (#1648, reported by @ramonbresco). The field existed only in the "New loan" dialog
  of the Loans tab; choosing the type "Loan" in the overview's dialog left it out, so a running loan
  entered there started at zero. Both dialogs now build their loan fields from one list, so a field
  can no longer land in one and miss the other. The same repair makes the suggestion work that
  2.29.0 announced and never delivered: moving the first due month into the past fills in the number
  of months since then, never more than the loan has installments, and stops as soon as you set the
  field yourself. For a loan with interest that limit is the term shown in the preview; until the
  preview has one, the field stays at 0. It was wired to the dialog that did not have the field.
- **Housekeeping: "today" and "last visit" read a visit's check-in as a point in time.** Only
  visits the app did not write itself are affected: rows imported by hand with a time that has
  no zone, and the demo data. They were compared and sorted as text, so such a visit could be
  missing from the helper's "today" or counted on the neighbouring day, and the earlier of two
  visits could be shown as the latest - in the module, its visit lists and the overview tile.
  All of them now compare the time on the household's clock. Stored values are not changed.
- **Editing a shared expense shows the amount in your household's number format.** The amount
  field came pre-filled the way the server stores it, with a point: `12.50` in a field whose
  placeholder says `0,00`, and `12.5` when the expense was handed over from a budget entry.
  The same held for the exact shares and percentages of an existing split and for the open
  debt in "Register payment". They now use the decimal separator and digits of the household
  region, like the placeholder next to them, and are read back unchanged when you save.
- **A wrong address below the pairing or invitation page no longer ends on the sign-in page**
  (#1640). Opening something like `/pair/extra` or `/join/extra` without being signed in led to
  the sign-in page, because the app fell back to the overview, which needs a session. It now
  goes to the page above it, `/pair` or `/join`, as it already did for someone who is signed in.
  A wrong address below a page that needs a session still leads to the sign-in page first.
- **Guests of a shared-expense group are no longer stuck behind the back button** (#1640). A
  guest only sees the budget, so every other address sends them there. That hand-over kept the
  address they came from in the history and put the budget on top of it, so the back button led
  straight into the same hand-over again. The address is now replaced. While the budget was still
  loading, a second tap could also start a second page change next to the first; it now waits.
  And when a guest opened an address that does not exist, the short message about it was lost on
  a fresh start, because it came before the page that shows it; it now appears. In a household
  that has switched the budget module off, a guest is no longer sent to it: until now the app
  kept sending them back and forth between the budget and the overview until the page gave up.
- **"Access denied. Please sign in again." is gone** (#1640). An error screen or message for a
  refused request used this second sentence, which advised signing in again although the session
  was fine. It now says "You do not have permission to do that", the same sentence as everywhere
  else, in all 26 languages.
- **Closing an event dialog on a wide screen no longer moves the address to the page you came
  from.** In the day, week and month views an event opens in a small card. Choosing "Edit" or
  "Delete" there closes the card and opens the next dialog a moment later - the form, or the
  question whether a change applies to this event, this and following ones, or the whole
  series. The app gives back its "Back closes this dialog" history entry when the card closes
  and takes a new one for the dialog, and it took the new one before the browser had finished
  giving back the old. The browser then stood one entry lower than the app believed, so
  closing the dialog - "Only this event", Cancel, Escape, any way out - stepped back once too
  often: the calendar stayed on screen while the address bar already showed the previous page,
  a reload opened that page, and the next Back skipped one. Deleting a recurring event from
  the card did this every time; editing did it whenever the form opened quickly enough. The
  app now waits for the browser to finish before it takes the new entry.
- **A direct link to a module that is switched off opens the overview, not the module.** Opening
  the address of a module the household has switched off, from a bookmark or after reloading the
  page, still showed that module, complete and usable, although it was gone from the navigation.
  Inside the running app the same link already led to the overview. It now does so on a fresh
  start as well, for members and for guests of a shared-expense group, and the module's address
  is not kept in the history.
- **A refused request explains itself in your language** (#1640). Three refusals still reached
  you as the server's English sentence: changing a locked task as someone who is neither its
  creator nor an admin, editing or deleting a recipe that is mirrored from Mealie or Tandoor, and
  saving from a page that had been open so long that its security token no longer matched. Each
  now has its own sentence in all 26 languages; the last one asks you to reload the page, and you
  only see it after the app has already fetched a fresh token and tried once more by itself. The
  refusal for changing the email addresses of a household member's contact uses the hint the form
  already shows. And where the app already knew the more precise reason, for example read-only
  access to a module, the error screen no longer replaces it with the general "You do not have
  permission to do that".

- **An address that does not exist takes you to the closest page instead of a mislabeled
  overview** (#1607). Opening something like `/settings/xyz` used to show the overview while the
  address bar kept the wrong address and the tab title read the app name twice. The app now goes
  to the closest page above it (`/settings` here, the overview when there is none), corrects the
  address, and says so once in a short message. The wrong address is not kept in the history, so
  the back button does not return to it. A trailing slash (`/settings/`) is corrected without a
  message and keeps what follows the address (`?view=...`). Pages of modules that are switched off or not allowed for you behave as before.
  One link inside the app pointed at such an address: the painkiller shortcut in the cycle day
  log landed on the overview and now opens Medications.
- **Avatars show the same initials for a person on every page, and a Korean, Chinese or
  Japanese name shows the given name** (#1607, #1464). A name written in Hangul, Han characters
  or kana showed only its first character, which is the family name, so two children with the
  same family name had identical avatars. Such a name now shows the last two characters of the
  given name (민수 for 김민수, 太郎 for 田中太郎), and the whole name if it has one or two. It makes
  no difference whether the name was entered with a space: 김 민수 shows 민수 as well. Where the
  circle is too small for two of these characters - the small avatars on task cards, calendar
  entries and next to a module icon - it shows the last one.
  For every other name with several words the initials are now the first letter of the first
  and of the **last** word, everywhere: "AS" for Anna Maria Schmidt and "DM" for Dr. Hans
  Müller. Until now each page had its own copy of the rule. Contacts already worked this way;
  all other places took the first two words ("AM", "DH"), so the same person could carry two
  different sets of initials, and a middle name or a title stood in for the family name. Names
  with one or two words look as before. Two more differences between the pages are gone: a
  name starting with an emoji showed a broken character and now shows the emoji, and two
  spaces between the words of a name left the avatar in Settings with one letter or none.
  The member chips under Settings > Permissions are 2px larger so that two Korean, Chinese or
  Japanese characters fit.
- **"No access to this module" is shown in your language** (#1607). When a request was refused
  because your role has no access to a module, or only read access, the message came from the
  server in English, whatever language the app was set to. Both messages are now translated
  into all 26 languages, on every page that shows them. API clients keep the English `error`
  text and get a new `reason` field beside it: `module_access_denied` or `module_read_only`.
- **"You do not have permission to do that" is shown in your language** (#1607). Around 110
  other refusals, such as "Not authorized." or "Admin access required.", reached the page as
  the server wrote them: in English, a few in German. They all say no more than that the
  permission is missing, so the app now shows one translated sentence for them, in all 26
  languages. A refusal that says something more specific keeps its own text: a locked task, a
  recipe managed by its provider, a missing right in a second module ("Write access to the
  shopping list is required."), an expired form token, the sign-in page and the wall display.
  Those are still English. For API clients nothing changes in the `error` text; the specific
  refusals carry a new `reason` field, for example `task_locked`, `recipe_mirrored`,
  `cross_module_access` or `csrf_invalid`.
- **The status buttons on the task board name their task for screen readers** (#1607). The
  icon button on each board card that moves a task on was announced only as "Set to in
  progress", "Mark as done" or "Reopen", so every button in a column had the same name. It now
  reads "Set Laundry to in progress". The tooltip stays the short form.
- **Subscriptions without a monthly budget no longer show "Monthly budget 0" next to
  "Unlimited"** (#1607). With no budget set, the figures above the list carried a card
  "Monthly budget 0.00" with an empty bar, right beside the card saying there is no budget
  limit. The zero card is gone in that case and three cards remain: monthly cost, no budget
  limit, yearly projection. With a budget set, the four cards are unchanged.
- **Korean no longer writes "18:00 시"** (#1607). With the 24-hour clock, Korean put the hour
  counter 시 after a time that already has minutes, as in "내일, 18:00 시". The time now stands
  on its own, as in Japanese and Chinese.
- **The empty shopping list no longer promises that ticked items move to the pantry by
  themselves** (#1607). The hint read "After the shop, ticked items move into the pantry", but
  nothing moves until you choose "Into pantry" on the ticked items. It now says they can be
  moved, in all 26 languages, and it is left out when the pantry is switched off or you may not
  write there, because that action is not offered then either.
- **The Budget tile on the overview opens the month, not the tab you last had open** (#1607).
  Budget remembers its last tab. After a visit to Statistics, "Add entry" on the empty Budget
  tile, the tile's header link and the "Monthly balance" figure all led to Statistics, where
  nothing can be added. All three now open the Budget tab, which shows the month the tile is
  about and carries the add button.
- **Korean sentences pick the right particle for the name they contain** (#1607). Wherever a
  name, title or tag is inserted into a Korean sentence, the app showed both particle forms at
  once, for example "캘린더이(가)" or "「우유」을(를) 삭제할까요?". It now writes the form that fits the
  inserted word: "캘린더가", "「우유」를", "서울로". After Latin letters, digits and emoji both forms
  stay, because the right one depends on how the word is pronounced. Texts the server writes
  itself (push notifications, calendar feeds, stored calendar titles) follow the same rule from
  the same place; none of them contains such a form today, so nothing already stored changes.
  The installer is not affected.
- **The calendar mirrors fully in right-to-left languages.** In Arabic and Persian the week
  view drew the column lines of the all-day row 1px beside those of the time grid, the month
  grid drew a line along its outer right edge and only a thin one between its two leftmost days,
  the hour labels and the "All day" label sat against the outer edge instead of the grid, the red
  now line in the day view ran across the hour column with its dot on the wrong end, and nested
  calendar filters were indented from the left. The avatars on all-day entries now sit at the end of
  the line instead of right after the title, and the compact month dots start at the edge of the
  day. Left-to-right layouts are unchanged.
- **A balance below zero is explained in two more places** (#1623). In the list of requests
  waiting for approval the note with the current balance was missing when the member had been
  taken out of rewards while the request was still open - the page looked the balance up among
  the members taking part and found nothing. The balance now comes with each request. If that
  member was the last one taking part, the overview showed only "nobody takes part yet" and
  the request could not be seen or decided at all; the list of open requests now stands above
  that message. And on a
  family rewards tile that is one row high (1x1, 2x1), a negative balance was shown as a number
  next to an empty bar; a short line saying that the next points make up for it now stands
  in place of that bar.
  API: `GET /api/v1/rewards/redemptions` adds `user_balance` to every row.
- **The month heading of Calendar and Budget follows the word order of the language** (#1607).
  Both pages put the month name, a space and the year together themselves, which gave "10월 2026"
  in Korean instead of "2026년 10월" (and the same for Japanese, Chinese and Hungarian). Month
  and year now come from one formatter that asks the UI language for the order and always uses
  the Gregorian calendar. German and English look the same as before; a few languages gain the
  connecting words their grammar asks for ("Octubre de 2026", "Tháng 10 năm 2026").
- **An event that ends at midnight is drawn at its full length in the week and day view**
  (#1607). An event from 23:00 to 00:00 appeared as a 30-minute strip, and one from 22:00 to
  00:00 as well: an end at exactly 00:00 was read as "ends at minute 0 of the same day". It now
  runs to the end of the day, and it shares its column correctly with events that overlap it.
  Events of 24 hours or more stay in the all-day row as before.
- **A recurring event found in the global search opens at its next date, not in its first year**
  (#1607). The search behind Cmd/Ctrl+K listed a series with the date of its very first
  occurrence, and the link opened the calendar there: a birthday from 1990 opened October 1990.
  The global search now resolves a series to its next occurrence from today, with the same
  two-year window the calendar's own search uses, and the link carries that day. In
  `GET /api/v1/search`, `events[].start_datetime` of a recurring event is therefore the next
  occurrence instead of the series start; `id` is unchanged.
- **A repeat end before the start date is no longer saved** (#1607). An event starting on 2 October
  could be saved as "daily, until 30 September": the dialog only checked that the end was a valid
  date, and the server only checked the form of the rule. The dialog now shows the error at the
  repeat-end field, and `POST /api/v1/calendar`, `PUT /api/v1/calendar/{id}` and the "this and
  following" edit answer 400. A repeat end on the start day stays valid. A series from an ICS
  import or a synced calendar that already carries such a rule is still imported and stays
  editable; tasks are unchanged, because a task is due on its own date and the rule only decides
  about its successor.
- **The weekday buttons of a weekly series no longer all look switched off** (#1607). A weekly
  event without chosen weekdays repeats on the weekday of its start, but the "repeat on" buttons
  showed none of the seven as active. The weekday of the start date is now shown as active, both
  when you switch a new event to weekly and when you open an existing series, and it follows the
  start date until you pick days yourself. The stored rule of an existing series is not rewritten.
- **Editing a shared expense no longer rewrites its history** (#1607). The activity feed of a group
  showed the amount an expense has now, so correcting 50 to 10 also changed the earlier "Expense
  created" line to 10 - for expenses created by other members too. Each entry now records the
  amount and currency at the moment it was written, and a deleted expense keeps its amount in the
  feed. Entries written before this change show the title without an amount: what the expense
  cost back then was never recorded.
- **Opening one occurrence of a recurring event opens that occurrence** (#1607). In the month,
  week and day views, clicking or pressing Enter on an occurrence of a series opened the first
  occurrence the view had loaded instead - for a daily series the day before the visible range.
  The detail view showed that day, the editor was filled with it, and "This event only" then
  changed or deleted it, not the occurrence you clicked. Each occurrence now opens itself; the
  agenda already did.
- **Subtasks can be added from the task sheet again** (#1598). Since v2.70.0 "Add subtask" turns
  into a text field inside the task. In the sheet - every phone and every narrow window - Enter
  in that field triggered the comment button further down instead of saving the subtask, and
  the field had no button of its own, so there was no way left to add one; only the detail
  column on wide screens worked. The field now has an "Add" button next to it, and Enter saves
  the subtask and keeps the field open for the next one. In any sheet with more than one form,
  Enter now submits the form the field belongs to and ignores buttons of a view that is hidden
  at that moment, so Enter in the edit form of a task saves the task.
- **A new household starts in its own time zone** (#1607). The first-run page now sends the
  browser's time zone along, and the server stores it as the household time zone. Until now a
  fresh install had none, so the server counted "today" in the container's zone, usually UTC:
  east of UTC the dashboard showed no meals for today and overdue tasks were not counted as
  overdue during the first hours of the day, west of UTC the day turned over hours early in
  the evening. A browser that reports no usable zone, or only UTC, sends nothing and the server
  falls back to `TZ` as before. Households that already exist are not changed - an admin sets
  the zone once in the settings under "Time zone".
- **Reopening a completed task no longer erases its points from the history** (#1607). Reopening
  a task used to delete its earning. If the points were already in a reward request, the balance
  went below zero and the history showed only the request, neither the earning nor that it had
  been taken back. The earning now stays in the history and reopening adds a second entry,
  "Reopened: <task>", that takes the same points back. Completing the task again awards them
  again. A balance can still go below zero this way; the page and the overview tile now say so
  next to the number, the next points make up for it, and a pending request stays pending for
  the parents to decide - with the current balance shown beside it when it is below zero.
  Earnings that earlier versions deleted on reopening are not restored.

- **A recurring task gives its points once a day, not once per tick** (#1603). Ticking off a
  recurring task creates its next occurrence right away, and that one could be ticked off again
  at once - each time for the full points. A recurring task now pays each person at most once
  per day; the day is the household's, not UTC. Ticking off still works and still moves the
  series on, and reopening a task and completing it again on the same day keeps its points. The
  same holds for subtasks that carry points. If you catch up two missed occurrences of the same
  task on one day, they count once.

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
- **Shared expenses say why an amount cannot be saved** (#1607). An amount of 0, a negative
  amount or one written with thousands separators (`10,000` in Korea or the US, `10.000` in
  Germany) only greyed out the Save button. The reason now appears under the amount once you
  leave the field, with an example of the expected spelling. An amount with more decimals than
  the currency has, such as `10.000` for won, was sent and came back as an English server
  message; it is now caught at the field in your language, also for exact shares and when
  recording a payment. An exact share that is empty, 0 or negative is caught there as well, even
  when the shares add up. Over the API, a negative amount, share or payment was never stored,
  but the answer was the database's raw constraint text; it is now "must be greater than
  zero", and `-0` no longer slips through as a share of 0. The running total of a split follows
  the household's number format and the expense's currency instead of always reading like
  `33.00`.

- **The "discard changes" question has two different buttons in every language** (#1607). In
  Korean, Italian and Ukrainian both buttons said "Cancel", in Turkish and Russian the two words
  were nearly the same, so it was unclear which one throws the input away. The discarding button
  now says "discard" there, and the question above it uses the same verb. The same applied to the
  question when leaving the permissions sheet with unsaved changes in Korean, Italian and
  Russian.

- **Saving a name dialog with an empty field says so instead of closing** (#1607). Creating a
  shopping list with an empty name closed the dialog without a message and without a list. The
  same dialog asks for the new name of a list, folder, category or subtask and for a custom
  reminder time, and behaved the same there. It now stays open and marks the field as required;
  Cancel and Escape still close it.

- **A rejected default visibility in the Health settings jumps back** (#1607). When the server
  refused a change to the default visibility of a health area, the error appeared but the field
  kept showing the new value, so the sheet implied a sharing change that never happened. The
  field now returns to the saved value, like the switches above it.

- **Settings no longer show the sheet of a module you have no access to** (#1607). A member whose
  permission for a module is "No access" still found that module's sheet under Settings, open and
  operable, next to a "no access" error; the server refused every change. The sheet is now gone
  from the list, from the settings search and from its direct address, as the module already was
  from the navigation. With "Read only" the sheet stays.

- **The board shows the lock of a locked task** (#1607). A task that only its assignees may
  change carried its lock in the list but lost it on the board card. The card now shows the same
  sign.
- **Ticking off a recurring task now says when it comes back** (#1603). Completing a recurring
  task creates its next occurrence at once, so the list, the board and the Overview tile showed
  an open task that looked just like the one you had ticked off - with "repeat from completion"
  even with the same date - and the tick seemed to have done nothing. Every way of completing
  it now answers with "Done - next due <date>": the Complete button and the "who did it" choice
  in the task view (also when opened from Overview or the calendar), the checkbox, the swipe and
  the person choice in the list, moving a card to Done on the board, and the wall display. With
  a named person it is one message that says both. The undo in the list stays. For API clients,
  `PATCH /api/v1/tasks/{id}/status` additionally returns `next_due_date`, the due date of the
  next occurrence that is not yet done, or `null`.
- **The edit form also says when a recurring task comes back** (#1620). Setting a recurring task
  to "Done" through the status field of the edit form creates its next occurrence just like
  ticking it off, but the form only answered "saved". It now shows the same "Done - next due
  <date>" as every other way of completing a task; any other save still says "saved". For API
  clients, `PUT /api/v1/tasks/{id}` additionally returns `next_due_date` under the same rule as
  `PATCH /api/v1/tasks/{id}/status`: the due date of the next pending occurrence when this call
  completed a recurring task, otherwise `null`.
- **A rejected `PUT /api/v1/preferences` no longer applies part of the request** (#1622). The
  route checked and stored one field after the other, so a request with several fields that
  failed on a later one answered 400 or 403 while the fields before it were already saved: a
  valid `timezone_hint_dismissed` followed by an invalid `language` dismissed the time zone
  hint for the whole household although the request had failed. The whole request is now applied
  or nothing is, for household, personal and admin-only fields alike; status and error text of
  the answer are unchanged. The app sends these fields one at a time, so this only showed
  through the API.
- **Housekeeping: a visit stored without a time zone stays in its own month.** Yuvomi itself
  stores a check-in as a point in time, but a row written into the database by hand can carry a
  plain wall-clock time such as `2026-09-30T23:30:00`. The month lists of the module (visits,
  work sessions, monthly summary, pending and paid amounts) compared such a row as text against
  the month's UTC bounds: east of UTC a visit late on the last day of a month appeared in the
  next month, west of UTC one early on the first day appeared in the previous month or dropped
  out of the six-month chart, while the chart and the overview tile already counted it in the
  household's month. All of them now read the month from the household's clock. Stored values
  are not rewritten.
- **A recurring shared expense is checked when it is created, not when it is booked.** Creating
  one through the API accepted any payer, any participants and any split values. A person who
  was never in the group could be named as payer or participant and was then booked a debt in
  that group on every due date. A split that cannot be booked (exact amounts that do not add up
  to the amount, percentages that do not add up to 100, a missing share) was stored as well, and
  on its due date it stopped the booking run for every due recurring expense of the
  installation, each hour again. Such a request is now answered with `400` under the same rule
  as a single expense, and nothing is stored. Recurring expenses that already exist are not
  changed.
- **One recurring shared expense that cannot be booked no longer holds back the others.** All
  due recurring expenses were booked together, so a single one that failed stopped the booking
  for every group, hour after hour, and only the server log said so. Each one is now booked on
  its own. One that cannot be booked is paused, and the group's activity shows "Recurring
  expense paused automatically: it could not be booked" with its title. That also applies when
  the payer or a participant has left the group since it was created, or their account was
  deleted: nothing more is booked for them. Once the person is back in the group, resuming the
  recurring expense books it again.

### Security

- **Ticking off, reopening or archiving a task now respects its visibility.** A private task, or
  one visible to its assignees only, is hidden from everyone else, and since v2.12.0 it cannot be
  edited or deleted by them either. Changing its status was left out of that rule: a household
  member who could not see a task could still mark it done, reopen it or archive it by addressing
  it directly through the API. Marking it done could credit the points to the wrong person and
  create the next occurrence of a recurring task; reopening it took the points already credited
  back again and discarded that next occurrence. The task's content was not readable this way. The
  status change now answers "Task not found" for a task you cannot see, exactly as for one that
  does not exist, and changes nothing. A subtask can no longer be added beneath a task you cannot
  see for the same reason. Nothing changes for tasks you can see: the person who created a task,
  the people assigned to it and, for tasks shared with everyone, every member tick them off as
  before. Affected are all versions since v1.11.0, which introduced task visibility.
- **A reminder can only be set on an entry you can see, and it only names an entry you can see.**
  Reminders are set per person on a task, a calendar event, a subscription or an inventory item.
  Setting one checked that you may use the module, but not that the entry exists or that you may
  see it, and the list of due reminders and the notification then showed the entry's title. A
  household member could therefore learn the title of a private task, of a task or event visible
  to its assignees only, of an event from a calendar subscription that is not shared, and, in
  personal budget mode, the name, amount and due date of a private subscription. Setting or
  replacing a reminder on an entry you cannot see now answers "Entity not found", the same as for
  an entry that does not exist. Due reminders, push notifications and the notification channels
  skip a reminder whose entry its recipient cannot see. That also covers reminders created before
  this update and entries that became private afterwards, such as a task changed to private or
  an event you are no longer assigned to. Such a reminder is kept, not deleted, and comes back
  if the entry becomes visible to you again. One consequence: a person assigned to a *private*
  event no longer receives the reminder its creator set, because a private event is visible to
  its creator only; use "assignees only" for an event the assigned people should hear about.
  Your own reminders and those passed on to the assignees of an event work as before. Affected
  are all versions since v1.11.0 for tasks and events, since v1.23.0 for subscriptions, and
  since v0.20.38 for events from a calendar subscription that is not shared.
- **The points history no longer names a task you cannot see.** A points entry in Rewards shows
  the title of the task it was earned for, and the history is open to everyone who can use
  Rewards. That made the title of a private task, or of one visible to its assignees only,
  readable for the rest of the household as soon as the task was ticked off. The history now
  shows that title only to the person the points belong to and to those who can see the task;
  everyone else sees the entry with its person, date and points and the neutral text "Task
  completed". Once a task has been deleted, its title stays with the person the points belong
  to. This applies to entries already in the history as well. Balances, bonus points,
  corrections and redemptions are shown as before. Affected are all versions since v1.11.0.
- **An event from a calendar subscription that is not shared can no longer be opened or changed
  by other members.** A subscribed calendar (ICS) that its owner has not shared is hidden from
  everyone else in the calendar, the search and the overview. Addressing one of its events
  directly through the API still returned it, with title, description and location, and let a
  member edit or delete it. Marking such an event as a countdown also showed it on everyone's
  overview. These paths now apply the same rule as the calendar list and answer "not found", as
  for an event that does not exist. The same holds for resetting a subscribed event to its feed
  version: an admin could reset an event of a subscription they cannot see, and the answer told
  apart an event that exists but is hidden from one that does not exist. Events from a shared
  subscription and local events are unaffected. Affected are all versions since v0.20.38; the
  countdown since v2.18.0.
- **Household notification channels no longer receive reminders for entries that are not visible
  to everyone.** A notification channel set up by an admin (ntfy, Gotify, webhook or e-mail)
  received every due reminder of every member, with the entry's title. That included your own
  reminder for a private task or event, for one visible to its assignees only, for an event
  from a calendar subscription that is not shared and, in personal budget mode, for a private
  subscription with its amount and date, so the people reading that channel saw what the
  entry's visibility hides from them. Such reminders now go to your own devices by push only
  (and to a channel that belongs to you alone, where one exists). Reminders for entries everyone
  can see reach the household channel as before. If you rely on a household channel for
  reminders about private entries, turn on push notifications on your device; the reminder
  also still appears in the app. Affected are all versions since v1.11.0.
- **Health, shift and private-document reminders no longer reach household notification
  channels.** The reminders Yuvomi creates on its own went to the household channel as well:
  the predicted start of a period (in the version sent to a partner, with the person's name),
  the daily cycle log hint, a due preventive check-up, fasting reminders, a shift about to start
  and the expiry of a document, including a private one or one shared with named people only.
  Cycle, check-up and fasting reminders and shift reminders now go to the person they are meant
  for only, by push (and to a channel of their own, where one exists). A document expiry reaches
  the household channel only if the document is visible to the whole family. Pantry and waste
  collection reminders are household matters and reach the channel as before. Affected are
  versions since v2.65.0 (cycle and shifts), v2.67.0 (partner notice) and v2.68.0 (check-ups,
  fasting, document expiry).

- **The budget list filter and the budget plan no longer reveal what other members keep private.**
  In personal budget mode, an entry another member shares as "amount only" shows you its amount and
  date, but not what it was for. Filtering the entry list by category still matched it under its
  real category, so the set of results named the purpose the row itself hid. The filter now sees
  the same view as the response: such an entry matches only the private catch-all bucket, like in
  the summary and the statistics, and that bucket can be filtered on as well. A loan installment
  set to amount only also kept the loan's title and lender in the list, and turned up in that
  loan's overview; both now stay hidden like the entry's title.

  The budget plan also counted every entry of the household, whatever its visibility, so the
  spending shown against a category included other members' private bookings. In personal mode it
  now counts what you see, like the overview, and follows the "Mine" and "Household" view: private
  entries of others no longer count, and an amount-only entry counts toward income and balance of
  the savings goal but toward no category. Shared budget mode is unaffected.

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
