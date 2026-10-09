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

- **Der fünfte Abgleich mit dem Ursprungsprojekt** (`ulsklyc/yuvomi`, 65 weitere Commits bis zu deren
  Stand vom 9. Oktober 2026, nach v2.75.0: Taschengeld, wiederkehrende Split-Ausgaben, Köchin oder
  Koch je Mahlzeit, Konto deaktivieren statt löschen, Migrationen 231 bis 235, der
  Gestaltungsdurchgang R18, Einkaufslisten-Auswahl in der Übersicht und Zahlungserinnerung je Abo).
  Die Bildmarke bleibt unser eigenes Icon.

### Added

- **Payment reminders can be turned off for each subscription** (#1708, from D#1226). Turn off the reminder
  in the subscription dialog while keeping the subscription active and its cost in the budget.
  Editing or renewing it keeps the reminder off. Existing subscriptions keep reminders enabled.
- **Loans can be put in order by interest rate or by remaining balance** (#1706, from D#935). The
  loans tab has a sort menu: highest rate first, smallest balance first, or by start as before.
  Each loan now also names the month it is projected to end, which follows the payments you
  actually booked and counts from today if instalments have not been recorded up to date. A loan in another currency is compared at its stored rate, a loan without
  interest counts as 0 %, and paid-off loans stay at the end. In these two orders the loans you
  took out come first and the money you lent follows as its own group. While the list is not in
  its default order, a line above it says which order applies; tap it to change. The order is a calculation to read:
  Yuvomi does not suggest which loan to pay first and does not move payments between loans.
- **Choose which shopping lists the overview shows** (#1818, from D#1624). The shopping tile now
  has options in "Customize": tick the lists you want on it. With nothing ticked it shows every
  list with open items, as before. A list you picked stays on the tile even when everything on it
  is bought, so it is one tap away when you want to add the first item. The tile shows up to
  three lists; a further one you picked is named as "+1 more list". The choice is yours alone,
  does not change what anyone else in the household sees, and only applies to the tile: the
  today sheet, the wall and the menu keep counting every list.
- **Rewards can hold pocket money: a money balance per child, credited on a schedule, paid out on
  request** (#1734, from D#916, asked by @trinitrion). The parents are the bank: they set an amount
  per week or per month and the day it is due, the child sees its balance, asks to withdraw a free
  amount or to pay something in (birthday money handed over for safekeeping), and the balance
  changes when a parent confirms - that confirmation is the moment the cash changes hands, so the
  number always matches what the parents hold. Parents can also book a credit or a deduction
  directly. It lives in Rewards and not in Budget because everything it needs is already there - a
  ledger, a request one person files and another decides - and a budget account has no owner; a
  payout creates no budget entry. Money and points are two balances that never meet: there is no
  conversion, and no point total changes when money is booked. Only the child and the
  administrators see a money balance and its history - not the siblings, not a wall tablet, and a
  scoped API token only under the same rule; that is narrower than points, which everybody with
  the module sees. There is no overdraft: a withdrawal above the balance is refused when it is
  asked for and checked again when it is approved, and if the money is gone by then the request
  stays open so a parent can credit first. A withdrawal always waits for a parent, also in a
  household that has switched approval off for rewards. Due dates missed while the server was off
  are booked afterwards, each exactly once; a paused plan books nothing and does not catch up when
  it is resumed; the plan of a deactivated account is paused. A monthly plan on the 31st pays on
  the last day of a shorter month and returns to the 31st. Parents open an account for a
  member - no plan and no amount needed, the child then sees it with a balance of zero and can ask
  to pay in - and can close it again once it is empty. An account keeps the currency the
  household used on the day it was opened, written on every entry: if the household later switches
  its currency, an existing balance, its plan and its open requests stay what they were (1.00 EUR
  does not turn into 100 yen), a new account takes the new currency, and an emptied one does
  after it was closed and opened again. When a child's account is deactivated, what was due until that
  day is booked first, then its open requests are cancelled and its plan paused; what is left on it stays visible to the administrators, marked as
  former, and can only be paid out. Two edges to know: an account closed and opened again on a day
  its plan was due is not credited for that day a second time, and the history of a closed account
  is kept but shown through the API only. No interest, no
  savings goals, no second currency per child. With read access to Rewards the balance stays
  visible and the requests are gone, as with redeeming. For API clients: `GET /api/v1/rewards/money`,
  `GET /api/v1/rewards/money/ledger`, `POST /api/v1/rewards/money/entries`,
  `POST /api/v1/rewards/money/accounts`, `DELETE /api/v1/rewards/money/accounts/{userId}`,
  `PUT`/`DELETE /api/v1/rewards/money/plans/{userId}`; a request is `POST /api/v1/rewards/redemptions`
  with `kind: "withdrawal"` or `"deposit"` and a decimal-string `amount`, and rows of
  `GET /api/v1/rewards/redemptions` now carry `kind`. Existing fields keep their meaning: that list
  answers reward requests only unless `?kind=money`, `withdrawal`, `deposit` or `all` asks for more,
  `pendingCount` and the tile's `pending` still count reward requests, with money requests next to
  them in `moneyPendingCount` and `moneyPending`, and `GET /api/v1/rewards/ledger` stays the points
  history (migration 236).
- **Recurring shared expenses have a place in the app: a group lists them, and they can be
  created, edited, paused, resumed and deleted there** (#1647). Until now the app showed a
  recurring expense nowhere. One that the hourly run had paused because it could not be booked
  appeared as a line in the group's activity and could only be resumed, changed or removed
  through the API. Each group now has a "Recurring" section between its expenses and its
  activity, with title, amount, rhythm and next date. A paused one says so, and one that cannot
  be booked says why in plain words - its split no longer adds up, or the payer or a participant
  has left the group - also before the run pauses it. Tapping one opens the same form as an
  expense, with rhythm and next date; expenses already booked keep their values, the next date
  carries the new ones. Deleting stops future dates and leaves every booked expense, share and
  balance alone. Resuming asks one question, and only when dates fell due during the pause:
  continue from the next date (preselected) or book the missed ones. The activity entry "paused
  automatically" leads to the recurring expense. Editing, pausing, resuming and deleting follow
  the rule of an expense - the group's owner or admins and whoever created it; everyone else,
  anyone with read access to the budget, and an archived group see the list and a read view
  without actions. A recurring expense on the 31st keeps the 31st when it is edited while
  standing on a shorter month's last day; changing its date or rhythm sets the day anew. A date
  that was already booked cannot be booked a second time by moving the next date back onto it.
  For API clients: `PUT` and `DELETE /api/v1/split-expenses/recurring/{id}`; the `PUT` is a
  partial update (omitted fields stay), checks the result like creating one, and answers a
  `next_run_date` that is not after the last booking with `400` and
  `reason: "next_run_not_after_last_booking"`; `GET /api/v1/split-expenses/groups/{id}/recurring` additionally returns
  `payer_name`, `participants`, `splits`, `blocked_reason`, `can_edit`, `missed_count` and
  `resume_date`; activity types `recurring_edited` and `recurring_deleted`. No migration.
- **The Singapore dollar is a currency a household can pick, and Singapore is a region** (#1697,
  from D#982). SGD was missing from the list the household setting, subscriptions and shared
  expenses all read, and the server checks a saved currency against that same list - so a
  household in Singapore could not record its money in its own currency at all. Choosing
  **English (Singapore)** as the region now sets the dollar together with the local date and time
  format in one step (06/10/2026, twelve-hour clock), and amounts are grouped the way they are
  written there.
- **A meal can name the member who cooks it, and the week plan and the overview show who that
  is** (#1679, from D#1661, asked by @matejhermanek for a shared flat that plans who cooks which
  meal). A planned meal carried a date, a type, a title, notes and a recipe, and the only person on it was whoever
  entered it. The meal dialog now offers the household members in the same person picker the task
  dialog uses, limited to one person; the cook's avatar then stands on the meal in the week plan
  and on today's meal on the overview. On a wall tablet, cooking counts under "Who's up today"
  like a task does. A meal without a cook looks as it did. A repeating meal
  keeps its cook: every meal the series creates starts with it, changing the cook of one meal
  leaves the series alone, and choosing one for the whole series reaches all its meals. Saving
  for the whole series changes the cook only when you picked one in that dialog: a new title for
  the series leaves every cook where it is, including the ones set for single weeks, and while
  nothing is picked the dialog shows the cook of the series there, not of the one meal.
  A series whose cook is no longer a household member keeps running; its new meals start
  without a cook, and the meals that already exist keep the name. Weeks created while the
  account was deactivated stay without a cook; once it is a member again, the next new week
  starts with it. The cook
  is a responsibility, not ownership - the plan stays the household's, and who sees or edits a
  meal still depends on the meal plan right alone; with read access the cook is shown and cannot
  be chosen. Only household members can be picked, so housekeeping staff, guests of shared
  expenses and wall tablets are not offered, while a meal that already carries such a cook still
  saves. An account that cooks a meal is deactivated rather than deleted when it is removed, like
  an account a task is assigned to, and the meal keeps the name. One cook per meal; meals in the
  calendar, a reminder for the cook and a view per person are not part of this. For API clients:
  `cook_user_id` on `POST /api/v1/meals`, `PUT /api/v1/meals/{id}` (with `?scope=series` for the
  series) and on each assignment of `POST /api/v1/meals/apply-plan`; meals come back with
  `cook_user_id`, `cook_name` and `cook_color`, also in `todayMeals` of the overview (migration
  235); the cook's picture is not repeated on every meal, it is on the member
  (`GET /api/v1/family/members`, which a scoped token reads with `family:read`). The id is a positive integer or `null`; an empty string or any other
  form is refused with 400. A meal of a series also returns `recurrence_cook_user_id`, the cook
  stored on the series.
- **A household can put its members in an order of its own, and every list of people follows it**
  (#1644, from D#1605, asked by @ChaCha500). Until now members were listed alphabetically
  everywhere, so "parents first" or "oldest first" was not possible. Under Settings, Family, an
  administrator now drags the members into the wanted order - or focuses a handle and presses
  the arrow keys. There is one order per household, the same for everyone who looks: the
  calendar's person filter, the timetable, the assignee pickers in tasks, budget and shared
  expenses, rewards, the family card and the wall display all use it. A member who has not been
  placed (a new one, and everyone in a household that never touches the setting) comes after
  the placed ones, sorted by name, so a household that leaves it alone sees the order it had.
  Not by age, as first suggested: birth dates are optional, and "parents first, then the
  children" cannot be read from a date. Two things changed for everyone, placed or not. Lists
  that sorted names by the language of the device now sort them the way the server does, so
  two devices of one household agree; and a few lists that put a lower-case name after all
  capitalised ones (the account list, the task filter and the overview among them) now ignore
  letter case like the others. Housekeeping staff, guests of shared expenses, wall tablets and deactivated
  accounts have no place in the order. For API clients: `PATCH /api/v1/family/members/reorder`
  with `{ order }`, administrators only; `sort_order` on `GET /api/v1/family/members` and
  `GET /api/v1/auth/users`, and `is_household_member` on every user object (migration 232).
- **Each device chooses how long it waits before the photo screensaver starts** (#885). Settings →
  Appearance, next to wall mode, offers 1, 2, 5, 10 or 15 minutes; five stays the default, so
  nothing changes on a device that never touches it. The choice is stored in the browser like wall
  mode, because the devices in one household want different delays: a photo frame on the wall
  wants its pictures back after a minute, a kitchen tablet people work on should wait longer, and a
  household value would also reach every phone. The value is applied before the page renders, so
  the first idle period already uses it, and a change takes effect at once without a reload, in
  other open tabs too. The settings search finds it under "screensaver", and the Immich page no
  longer promises five minutes.
- **Revoked and expired API tokens can be removed from the list** (D#1672, asked by @torbenvanassche). Under
  Settings, API access, a revoked token stayed in the list for good, with a greyed-out button
  next to it. The list now has two parts: the tokens that work, each with "Revoke", and below
  them the ones that are revoked or expired, each with "Remove". Removing asks first and cannot
  be undone. A token that still works cannot be removed, only revoked, so ending someone's
  access always leaves a trace until you decide to clear it. The same goes for wall tablets:
  every new pairing revokes the device before it, and those old entries can now be removed as
  well. For API clients: `POST /api/v1/auth/api-tokens/{id}/remove` and
  `POST /api/v1/displays/{id}/devices/{deviceId}/remove`; both answer 409 for a credential
  that is still active, and `DELETE /api/v1/auth/api-tokens/{id}` keeps meaning "revoke".
- **The Calendar tile on the overview can list 8 or 12 appointments instead of 5** (D#1676, #1680).
  The tile always showed the next five, and a household with a full week had to open the
  calendar for the rest. Its options in Customize mode - where "Which appointments?" and the
  birthdays switch already live - now ask "How many appointments?" with three steps: 5, 8 and
  12. Five stays the default, so a tile nobody touched looks as before. The choice belongs to
  the person who made it, travels with a household default like the other tile options, and
  applies on a phone as well. Appointments of today that are already over still stand above
  the list and do not use up the number. The tile grows with its list instead of scrolling,
  in every list size, and the tiles next to it in the grid grow with it: with 12 it is
  roughly twice as tall as with 5. At "Wide (2x1)" the tile remains the week strip, and the
  Today sheet and wall mode keep their own number of rows. For API clients:
  `GET /api/v1/dashboard` takes `events_limit` with exactly `5`, `8` or `12`; any other value
  means 5. "Set as household default" now shows the result at once when a tile option changed
  what the overview asks for; until now the tile kept its old list until the next refresh.
- **A loan can carry a due day, and "Mark paid" dates the installment on it** (#1631, #1741,
  D#1481, asked by @iHatim1). A loan knew the month an installment is due but no day, so "Mark paid" dated the
  entry on the day you tapped it: with a debit on the 27th, marking it on the 25th put it two days
  early, and marking it on 2 November put October's installment into November's budget. The loan
  dialog now has an optional "Due day" field, 1 to 31. With it set, the installment is dated on that
  day in the month it is due, whether you mark it early or late, and a month that is shorter takes
  its last day (the 31st becomes 30 April, or 28 or 29 February). The confirmation names the date
  that was used, because the entry is booked without a dialog, and the loan card shows the full
  date of the next installment instead of only the month. "Installments already paid" on a new
  loan use the day as well. A loan without a due day keeps today's date for the installment of
  the current month, and its card keeps naming the month. An installment whose month is already
  over is dated on the 1st of that month instead of today (#1741, D#1021, reported by @mamo79):
  catching up a loan that started in 2022 used to put every past installment, and its budget
  entry, into the month you tapped in. The 1st is what "Installments already paid" already uses
  for such a loan. Nothing that is already booked is moved: setting or changing the day later
  leaves existing installments and their budget entries where they are. Marking early books an entry dated a few days ahead; it
  counts in that month's totals at once and in the account's current balance from its date on. For
  API clients: loans accept and return `due_day`, and return `next_due_date` next to
  `next_due_month`. Without a due day it is the 1st of `next_due_month` once that month lies
  before the household's current month, and `null` otherwise.
  `POST /api/v1/budget/loans/{id}/payments` is unchanged, `paid_date` stays required and is
  stored as sent.

### Changed

- **Rows show fewer buttons.** Lists no longer carry a pencil and a bin on every line. Editing,
  deleting and anything further sit behind one "more" button per row that is always visible and
  names what it does in words. This applies to shopping items, birthdays, tasks, loan payments
  and the five lists of the shift planner, where "Edit" and a red-outlined "Delete" stood on
  every row. Deleting stays undoable or asks first, exactly as before, and swiping still works.
  Meal cards no longer show a bin at all: open the meal to delete it.
- **Shopping rows are one line.** The amount now stands at the end of the line with the name
  instead of underneath it, so amounts line up in a column and the list shows more at once. A
  long name still wraps instead of being cut off.
- **Fields are quieter and all look alike.** A field used to be drawn twice - a fill plus a
  heavy outline - and in dark mode it was a near-black box with a bright edge. Fields now have
  one skin everywhere: a thin outline that still meets the contrast needed to find it, on a fill
  that carries it; in dark mode the field is a soft well instead of a black hole. Dropdowns are
  as tall as the text fields beside them and show the same small arrow on every browser, number
  fields no longer show the tiny up/down arrows, and the quick-add row of the shopping list
  focuses in violet like every other field.
- **Settings read like a list, not like a form.** A choice in a settings row was a bordered
  box at the end of the line, anywhere between a third and the full width of the row. It is now
  the plain value with a small arrow, the way phone settings show it - "Language ... German".
- **Recording a measurement is quicker to read and fill in.** Blood pressure was three wide
  boxes named "Systolic", "Diastolic" and "Pulse", none with a unit. It is now written the way
  it is said: "120 / 80 mmHg", with the pulse on the line below, each with an example value and
  its unit. Type, time and visibility stand as rows with the label on the left and the value on
  the right; the note keeps its own field. Screen readers still announce every part by name, and
  in right-to-left languages the reading keeps its order.
- **Documents look like documents.** The preview shows the whole page as a sheet on a quiet
  background instead of the cropped top of a white rectangle, and in dark mode it is no longer
  the brightest thing on the screen. Cards are as tall as their content, with their buttons
  right below the text, and there is room between the filter bar and the first row. The list
  view shows the category symbol instead of a preview too small to read. On a desktop, opening a
  PDF no longer shows the browser's own toolbar inside the viewer; "Open in new tab" and
  "Download" remain the way to zoom and print (Safari keeps its toolbar).
- **Reading a note looks like the note.** The text stood in a tinted box with a coloured edge,
  which above the red "Delete" read like an error message. The whole reading view now takes the
  colour of the note. "Edit" is one button instead of a button and a tab.
- **One empty-state message per page.** Waste collection and the shift planner stacked two or
  three large "nothing here yet" blocks. The main section keeps its message; the sections below
  say it in one line with their button.
- **The task board has depth.** Columns were as bright as the cards on them; they are now a
  recessed lane with the cards lying on top, and an empty column no longer shows a dashed box.
- **Opening an event, a task or a birthday shows what matters first.** The reading view listed
  everything as rows of equal weight, people as a comma-separated line, under a thin colour
  strip. An event now opens with its time in words ("Today, 20:00 - 22:00") beside a dot in the
  calendar colour and the people as avatars with names. A task opens with its due date and its
  people, and "Done" is the one main button. A birthday opens with the picture, "turns 41" and
  "in 26 days". The popover on a desktop carries the title in the same size as the sheet on a
  phone.
- **A recipe without a picture opens with a head of its own.** Its details began with a list of
  ingredients and nothing that said "recipe". They now open with a flat band in the kitchen
  colour that carries the sign of the meal the recipe is for. Recipes with a picture keep it,
  and the list stays as it is.
- **Ingredient amounts line up.** "200 g", "1 tbsp" and "2" stood inside the same text as the
  ingredient, so every line started somewhere else. Amounts now have their own right-aligned
  column in front of the names.
- **The agenda names its days in words.** "Today - Thursday, 8 October" and "Saturday, 10
  October" instead of "08.10.2026 Thursday".
- **Each money screen has one number that leads.** On a phone the largest thing on every budget
  tab was the word "Budget"; the balance stood beside it in small type. Now one figure per tab
  carries the screen: the balance in the overview, net worth in accounts, the remaining debt in
  loans, the monthly cost in subscriptions. Income and expenses stand as a quiet line below it.
  On a desktop the same figure leads its column and the others step back. Long amounts and long
  currency signs take a smaller size instead of breaking.
- **The budget trend reads at a glance.** The area under income is tinted, today carries a dot
  with both values, and what has not happened yet is dotted - for both lines, where expenses
  used to be dashed as well. "Today" no longer sits on a grid line, the axis says "1.", "16.",
  "31." instead of three full dates under a header that names the month, and three grid lines
  replace up to seven. Trend and ring now sit on a card like the lists beside them.
- **The spending ring shows its total in the middle.** The sentence next to it ("7 segments,
  largest: ...") is still read out by screen readers.
- **Account balances are no longer green.** Nearly every balance and the net worth above them
  were green merely for being above zero. A balance now stands in the text colour and only a
  negative one is red; green is kept for income and for changes.
- **Figure tiles line up.** In the vitals row the dates stood at three different heights. Label,
  value, trend line and date now share the same four rows across a row of tiles, value and unit
  share a baseline, and labels are written normally instead of in spaced capitals, so a long one
  such as oxygen saturation fits on one line. On the vitals page "116/74 mmHg" stands on one
  line; in the narrower tiles of the health overview the unit still moves below the value. This
  holds for every tile of this kind: budget, health, housekeeping, inventory and the overview.
- **The small trend lines in the vitals tiles are visible.** They were grey hairlines; they now
  carry the colour of the health area with a soft fill, and the latest reading is marked.
- **Hovering a figure tile no longer looks like selecting it.** The tile lifts slightly; the
  coloured ring is kept for the selected one.
- **The week of activity is easier to read.** Bars have a round top and a flat foot, today's
  bar stands in full colour with its value while the other days step back, and three grid
  lines replace five. On a phone the chart is taller, and the weekdays no longer run into the
  feet of the bars.
- **The overview uses fewer type sizes.** Weather, birthdays, rewards and the budget tile mixed
  sizes one pixel apart; their content now reads on four steps.
- **Numbers no longer jump sideways.** On the overview, times, amounts and counters now use
  digits of equal width everywhere, not only in some tiles.
- **Everything that floats has one shape, and the sidebar floats too.** Dialogs, the "More"
  sheet and the search palette had tighter corners (16 px) than the event popover and the
  toasts (26 px); they now share the larger radius, with fields, tiles and menu rows rounded to
  match, and catch a fine line of light at the top. The dialog header is no longer a grey strip
  above a white body. On a desktop the sidebar is a glass panel 8 px off the window edge instead
  of a full-height bar; the content keeps its width. Light glass takes the warm tone of the
  page instead of a cool white, and the icon wells in the sidebar are visible in the light
  theme (they were 1.007:1 against the bar).
- **Login, setup, invitation and password reset have a place.** The form stood as a small card
  on a plain page. It is now a glass panel in front of a still field of soft light in the
  colours of the Yuvomi mark, which also stands behind the loading screen. Everything on these
  pages sits on the panel, where text keeps its contrast (label 5.4:1 light, 6.2:1 dark, in the
  worst spot); with "reduce transparency" or "increase contrast" the light is off and the panel
  is solid. A form taller than the window can now be scrolled by hand - on a small phone or in
  landscape its lower end could only be reached with the Tab key.
- **The app no longer animates a backdrop nobody could see.** Four blurred colour fields drifted
  behind the content the whole time the app was open, and the content covered them completely.
  They are gone, together with a gradient that was covered the same way. Nothing looks
  different; the browser has four large layers less to carry.
- **Rows and cards answer a tap.** List rows, task cards, the cards on the overview and the rows
  in the settings now show that they are being pressed, instead of doing nothing until the next
  screen arrives.
- **"New task" closes right away.** After saving, the dialog showed a check mark for about
  three quarters of a second before it closed. It now closes with the save, and the new task
  pulls open in the list: visible after about 0.2 seconds instead of 0.9.
- **A sheet you flick away travels out of the screen.** Dragging a sheet down and letting go made
  it dissolve where the finger had left it. It now leaves the screen from there, as fast as the
  flick was; let go too early and it springs back just as briskly. Behind the "More" sheet the
  dimming fades with the pull.
- **Going one level deeper has a direction.** On a phone, opening a settings page or a health
  area slides in from the side you are heading to, and going back comes from the other; both
  used to cut or only fade. Switching between light and dark fades instead of flipping, the
  blood pressure and weight curves draw themselves once, and a few menus that appeared or
  vanished in one frame now fade.
- **The app starts faster on a slow connection.** Before the overview asked for its data, the
  start made five requests one after the other, two of them twice. What does not depend on each
  other now runs at the same time, and the second copy is served from the first. Measured on a
  throttled phone (4x CPU, "Fast 4G"), three runs each, before and after: the overview asked for
  its data after about 0.8 seconds instead of 1.3, and the greeting appeared after about 1.0
  seconds instead of 1.5.
- **Health loads in three steps instead of six.** The overview asked for vitals and medication,
  then for the cycle history, then for the cycle settings, each only after the previous answer
  had arrived. These now go out together; who may see what is decided as before. Measured on the
  same throttled phone: the last answer arrived 747 ms after the first health request instead of
  1119 ms.
- **A weak connection no longer holds up the start.** With a network that is neither offline nor
  answering - on a train, in a lift, at the edge of the Wi-Fi - the app waited for it although
  everything it needed was already stored on the device. It now waits 1.5 seconds once, then
  uses the stored copies and picks up the fresh ones in the background for the next start.
  Measured with a server that accepts connections and never answers: the app's own files were
  loaded after 1.6 seconds instead of never. Signing in and loading data still need the network.
- **An update no longer downloads every language.** Each release fetched all 26 language files,
  of which a device uses one. Only German, the language the app falls back to, is stored in
  advance now; the language of the device is stored the first time it is used and stays
  available offline. A language that was never used on a device needs a connection once.
- **An update transfers only the files that changed.** After every release the app fetched all
  of its roughly 300 files again. It now asks the server which of them differ and loads only
  those; the server answers from the content of each file, so a changed file always arrives and
  an unchanged one never does, also after a new image was installed.
- **The app's files travel smaller.** The server compresses each script, stylesheet and language
  file once at the highest Brotli level and keeps the result in memory, instead of compressing
  at a low level on every request: 4.9 MB instead of 5.9 MB for all of them, about 5 MB of
  memory, and some 25 seconds of background work on one core spread over the first requests
  after a start. The files themselves are unchanged. `STATIC_BROTLI=off` restores the previous
  behaviour.
- **Housekeeping tasks: "Due" and "Done this month" stand beside the list.** On a desktop the
  tasks tab left the side column empty while its two figures were shown only on the overview.
- **Budget statistics read on a desktop and tell today from the rest of the month.** The
  category rows ran across the whole page in 12px - the name on the left, the amount more than
  800px away at the other end of a thin bar. Expenses and income now stand side by side, each
  amount at the end of its bar, the names in the size of a list row. The running curve is drawn
  solid up to today and dotted after it, with a "Today" mark, instead of a flat line to the end
  of the month. On a phone the chart is half as tall again, and an empty period offers to add an
  entry.
- **Budget accounts: net worth stands beside the accounts.** On a desktop the single figure used
  to fill a whole row above the account grid - one card across the page, mostly empty. It is now
  a card in the side column, like the figures on the overview and on loans, and the accounts
  start at the top next to it, one per row on the reading width. The accounts are rows of one
  list now, divided by a line, in every width - no longer a card each.
- **Tasks: on a desktop the filters open beside the list instead of over it.** The filter sheet
  was a centred dialog with a dimmed, blurred backdrop - it covered the very list each chip
  filters. From 1024px it is now a popover anchored to the filter button: no backdrop, the list
  stays visible and updates as you choose. Escape or a click outside closes it and focus
  returns to the button. On a phone it stays the sheet.
- **Inventory opens on your things, not on a list of categories.** The start page used to show
  one row per category and no item at all; reaching an item took two clicks. It now lists every
  item, grouped by category, with the categories as filter chips above the list. On a wide
  screen the details of the selected item stand beside it from the start, and short facts
  (brand, model, serial number, price) share a row instead of running down one column. A link
  to a category still works and selects its chip.
- **Settings list their options as rows, one group per section.** Until now almost every option
  had a card of its own: Appearance showed ten settings in eight cards and three of them on the
  first screen. Options are now rows in one group - name on the left, switch or selection on the
  right, the explanation below - the form "Active modules" already had. Appearance is about a
  third shorter and shows five settings on the first screen of a laptop; on a phone a selection
  with a short value no longer spans the full width. Cards remain for real forms (account,
  password, CalDAV, e-mail, tokens). Saving is unchanged: switches and selections apply at once.
- **The calendar settings name each section once.** "Appointments" stood twice in the sheet; the
  personal section is now "Event defaults". The jump links at the top carry the names of the
  headings they lead to instead of older names, and the default reminders are chips like the
  other multi-selections in the app instead of small checkboxes.
- **On a phone the document viewer uses the whole screen.** It was a sheet with a margin all
  round, and 172 px of details stood above the document - which got 54 % of the height. The
  viewer now fills the screen, the document runs from edge to edge, and the details are one row:
  tapping the category unfolds folder, size, expiry and the note on why sharing is unavailable.
  Download, edit and share stay where they were.
- **Editing a repeating meal asks first what the change applies to.** "Apply change to" decides
  what Save does and was the last field of the dialog, behind "More settings" - on a phone about
  three screens down. It now stands at the top. The ingredients of an existing meal are folded
  behind "Ingredients · n"; when adding a meal they stay open.
- **The calendar's view button on a phone shows which view is open.** It carried "..." and the
  header said nowhere whether you were in month, week, day or agenda. It now shows the icon of
  the open view and names it ("View: Week"); the menu behind it is unchanged.
- **"Log day" in the cycle tracker shows the daily entries first.** Bleeding, symptoms and
  feelings stay at the top; basal temperature, cervical mucus, tests and intimacy sit behind "More
  details", which opens by itself when one of them already has a value. On a phone the dialog is
  about a third shorter, and the "Today" card with "Log day" now stands above the figures instead
  of below the navigation bar.
- **Meal plan and shopping list give the second header row back when you scroll (phone).** Under
  the kitchen tabs the row with the week or the lists stayed put - 121 px of header at any scroll
  position, where the pantry beside it folds to 56. It now folds away like the pantry's and
  returns at the top; the quick-add field of the shopping list still opens from the "+" button.
- **On a phone the calendar header shrinks to one row when you scroll.** Collapsed it measured
  the same 117 px as open - the title left, but its row stayed for three icons. The period
  stepper now moves up into that row (65 px, 52 px more for the week, day and agenda). Search,
  filter and "Today" move into the view menu meanwhile; an active filter keeps its button and
  count.
- **Settings save the same way on every page.** Switches and selections take effect at once; a
  form is saved with a button, and that button now sits at the right end of the card's footer
  everywhere - it was left-aligned on most cards and stretched across the whole
  card for "Save password" (612 px, now 162). Where a card has more actions (test, remove), Save
  comes last. A single number field on its own - the default points for new tasks (Rewards) and
  the grace period for countdowns (Overview) - is saved when you leave it or press Enter, with a
  confirmation; the grace period had a Save button of its own until now.
- **Dialogs share one set of fields.** The shared-expense dialogs (expense, recurring expense,
  payment, group, member) now use the labels of a budget entry - smaller and quieter - mark
  required fields with the star, and show the amount in the large amount field. The waste
  schedule dialog picks weekdays with chips instead of seven small checkboxes, and "Active" is a
  switch. The loan dialog opens in the 520 px panel instead of the 400 px one.
- **Tapping a row opens its details - also for birthdays on a phone.** A birthday opened
  straight into the edit form with the keyboard up; it now opens a read sheet (next date and age,
  birth date, name day, note, reminder) with Delete at the start of the footer and Edit as the
  main button at the end, as an appointment does. A contact's sheet has Edit in the same place
  instead of in the header.
- **One word per thing in the German interface, and two settings pages named for what they
  hold.** The navigation says "Übersicht"; nine texts still said "Dashboard" (load error, pinned
  notes, weather, permissions, shortcuts) - they now say "Übersicht" too, likewise "Overview" in
  English. The settings page "Integrations" held only Immich and the weather location, while
  CalDAV, Mealie, ntfy and the API live elsewhere: it is now "Photos and weather". "Family and
  roles" stood next to "Roles and permissions" and is now "Members". Both in all 26 languages.
  "Recipe-Provider" is "Rezeptdienst" in German. The tour's second step described a bottom bar
  that does not exist ("Dashboard and Calendar", a "···" button); it now says what the bar does
  and names "More", and the calendar's empty-state hint points to Settings → Calendar, where the
  sync accounts are.
- **Dialogs speak one grammar: Cancel and the main button sit at the bottom right, adding is
  "Add" and editing is "Save".** Rewards dialogs (reward, redeem, bonus) had a main button and no
  Cancel; adding or editing a housekeeper and editing a visit carried "Save" left-aligned at the
  end of the scrolling form - on a phone below the fold of a 1200 px form. All of them now use the
  shared footer, which stays in view. The main button of every create dialog reads "Add" where it
  said "Create", "Create task", "Create loan", "Create folder" or "Save" (tasks, notes, calendar,
  contacts, birthdays, rewards, health, shared expenses, shifts, quick links, sync accounts); a
  dialog that edits says "Save". "Edit waste type" is 520 px wide so Delete, Archive, Cancel and
  Save hold one row (the footer was two rows, 121 px), and on a phone "Save" no longer breaks
  into two lines there and in "Edit account".
- **Inventory on a phone: search and tools sit in the title row.** The head took three rows there
  (114 px, 154 px inside a category) for a title and two icon buttons, while Documents and Health
  next to it need one. It is one row now, and the first entry starts 49 px higher.
- **Shared expenses: the figures at the top are those of the group you are looking at.** They
  used to add up all groups, so "You owe 196.14" stood right above the group's own "Linda owes
  Alex 24.14" - two numbers for what looked like one question. "You are owed" and "You owe" now
  show your balance in the selected group; the sum across all groups stands in the group picker.
  "Settle up" moved into the balances row, which is what it acts on. On a phone that frees a row:
  the first expense starts 52 px higher and a fourth one fits on the first screen.
- **Budget: what is planned and what is booked stand apart.** In the running month the overview
  listed everything by date, latest first - so the entries that had not happened yet stood on top,
  and on a full month the first real booking sat below the fold. The list now has two sections:
  "Planned · n" with the next three entries (the rest behind "Show all"), their amounts in a
  quieter colour, and "Booked" below it. An expected booking that still waits for its tick counts
  as planned. A past month, a future month and search results keep their single list.
- **Waste: the main button adds the recurring date.** It used to add a one-off pickup, the rarest
  thing you do there, while the date the module is about - "every other Friday" - sat in the
  three-dot menu of a waste type. The button now reads "Schedule" and opens that dialog, with the
  waste type to choose (preset to the first one without a date). "New one-off pickup" moved into
  the tools menu at the top. A pickup says when it is: "Fri, 09.10.2026 · 2 days" instead of the
  bare date. And a waste type that has a pickup coming no longer claims "No schedule yet for this
  waste type" - it names that pickup.
- **Shift plan: the plan comes first.** The module opened on its master data: three tabs of shift
  types, patterns and statistics stood before "Compare", the week as a grid, and that tab first
  asked you to pick a person. "Compare" is now the first tab and the one the module opens on, with
  your own lane already selected; a selection you made yourself is kept. Without a shift type or a
  plan it shows the button that adds one. The "Today" card, 132 px tall above every tab, is one
  line of chips. A shift type or a plan is a row, and editing it opens the same dialog as adding
  it, with one "Save" - until now each was a fold-out card with the whole form inside and two
  "Save" buttons, and a plan with seven cycle days was 964 px tall on a phone. Changing a plan's
  cycle length adds or removes its days right in the dialog. On a 1280 px screen all seven days
  of the comparison fit; Sunday used to be cut off by 36 px. The tab addresses are unchanged.
- **Lists move the same way everywhere when an entry comes or goes.** Tasks, shopping, pantry
  and a few others already did it: a deleted row folds away and the rows below close the gap,
  a new one opens up, a re-sorted one glides to its place. Notes, documents, contacts, the
  budget's transactions, inventory, subscriptions, shared expenses and birthdays cut hard
  instead - the row was gone and the rest jumped. They now use the same motion, also when
  "Undo" brings an entry back. Searching and filtering still redraw without motion, and with
  reduced motion switched on nothing moves.
- **Picking another row fades the detail column in.** In tasks, recipes, contacts, birthdays,
  the agenda and inventory the column on the right swapped its content with a hard cut when
  another row was selected. The new content now fades in briefly, like a tab or a month
  change does. Saving the entry that is already shown redraws it without the fade.
- **The date picker's month glides in from the side you page to**, like the calendar and the
  budget month. It used to swap the grid of days with a hard cut.
- **On a phone, the page title fades into its small form instead of snapping.** In notes and
  contacts the large title jumps to the small one in the bar when the list scrolls; it now
  fades in at its new size, and back when you return to the top. In the budget it fades back
  in when the header opens again. The title that docks into the bar on scrolling pages fades
  in and out the same way. Nothing changes size over time - only the opacity moves.
- **Budget: swipe sideways to change the month.** On the tabs that have a period - Budget, Plan
  and Reports - a horizontal swipe pages one period forward or back, with the same distance
  and feel as in the calendar. The arrows stay for mouse and keyboard. Scrolling up and down
  is unaffected, and the chart in Reports keeps its own horizontal drag for picking a day.
- **The calendar's filter popover opens and closes like every other menu.** On a desktop it
  appeared and vanished with a hard cut; it now grows out of the filter button and fades, and
  leaves a little faster than it came.
- **The welcome tour keeps its card still.** Each of the three steps rebuilt the card, which
  changed height with the length of the text and moved "Next" away from under the pointer.
  The card now has one height for all steps, the buttons stay where they are, and the text
  of the next step fades in from the side.
- **Budget reports: the curves draw themselves in once.** The first time the reports open, the
  income and expense curves draw in along the time axis and the category ring fills clockwise.
  Paging to another period afterwards shows the new figures at once, without replaying it.
- **Overlapping events in the day and week view are placed by person, not by start time**
  (D#1605, #1633). Events at the same time used to be packed by the clock alone: whoever
  started first stood on the left, so the same person could be left at nine and right at
  eleven, and two events with the same start and end could swap places from one load to the
  next. Now every person in a group of overlapping events gets a column of their own, in the
  order in which the household's members are listed - the order of the people filter. An event with several people stands where the first of them in
  that order stands; events of people who are not household members follow after the members,
  and an event with nobody assigned comes last. Two events of the same person at the same
  time stand next to each other. Nothing is reserved: an event that overlaps nothing keeps
  the full width, and a person who is not part of a group takes no room in it. The price is
  width in a chain: with 9:00-10:00, 9:30-11:00 and 10:30-12:00 for three people, the third
  used to take the place the first had left and the group was two columns wide; now it is
  three, because the third may not stand in the first one's column, and a longer chain of
  different people grows by a column per person. Schedule blocks, the all-day row, the month
  and the agenda are unchanged.
- **Two people with the same initials no longer look the same** (#1464). Linda Johnson and Leo
  Johnson both showed "LJ" on their avatars, in the people picker, in avatar stacks and on the
  overview, and colour was the only difference. Whoever shares their initials with somebody
  else in the household now gets the first letter of their first name and the next letter of
  it that nobody carries yet: "LI" and "LE". If that letter is taken as well - by Lisa Imhof,
  "LI" - the next one is used ("LN"), and after the first name the letters of the last name.
  Everybody whose initials are theirs alone keeps them, it stays at two characters, and the
  result is the same in every view and for everyone who looks, because it is worked out from
  the names of all accounts and not from the list a page happens to show. A deactivated
  account still counts, so nobody's initials change when somebody leaves; they can change
  when a new person joins or somebody is renamed. Names written without a space in Hangul,
  Han or Kana take the family name's first character and the given name's last (김민수 and
  박민수 become 김수 and 박수). Two accounts with exactly the same name stay the same. For
  API clients: `GET /api/v1/auth/me` and the login answer carry `initialsRoster`, the display
  names of all accounts; a shared-expenses guest gets an empty list.
- **Removing a member no longer takes their entries with it** (#1381). Deleting someone under
  Settings, Family used to delete everything that person had created as well - appointments,
  tasks, notes, documents, and payments they had recorded for others, which silently changed
  everybody else's balances in shared expenses. And anyone who had taken part in a shared
  expense, or had ever added a quick link, could not be removed at all: the app answered with
  "Internal server error". Now it depends on what the person leaves behind. If anything shared
  still refers to them, the account is **deactivated** instead of deleted: every entry stays and
  keeps their name, balances stay as they are, and the person stands at the end of the list
  marked "Former member". If nothing shared refers to them, the account is deleted as before.
  The dialog says both, and the message afterwards tells you which one happened.
  **Access ends at once.** A deactivated person is signed out everywhere and cannot sign in
  again, neither with a password nor through single sign-on, which recognises the account and
  turns it away instead of creating a second one. API tokens acting as that person are
  revoked, and so are tokens they issued for somebody else, because only the person who
  issues a token ever sees it - issue those again if an integration still needs them.
  Invitation links and wall tablet pairing codes they created and nobody has used yet stop
  working; a tablet that is already paired stays. Their calendar feed addresses stop working,
  a wall tablet can no longer tick off anything in their name, password reset links are
  dropped and no new ones are sent, and their two-factor recovery codes are deleted. They get no more push messages, mails or reminders. An
  administrator who is deactivated stops being one, and the last administrator still cannot
  be removed.
  **Private data stays where it is.** Health and cycle records, private notes, shift plans and
  the person's own contact card and birthday are kept when an account is deactivated; nobody
  can sign in to read them, and people who look after that person keep the access they had,
  but nobody new can be given it. Removing that data is not part of this change. A deactivated person can no longer be picked
  as assignee, attendee or group member, while everything they were already part of keeps
  them. Bringing an account back is not possible yet. For API clients:
  `DELETE /api/v1/auth/users/{id}` still answers `200 { "ok": true }` and now adds
  `outcome` (`"deactivated"` or `"deleted"`) and `traces`; `GET /api/v1/auth/users` carries
  `deactivated_at` per account.
- **Housekeeping chores work like every other list.** A chore row carried a pencil and a bin
  side by side, 4px apart; the pencil opened the same dialog as a tap on the row, and on a
  phone the name was left with 198 of 358px. The row now opens the dialog when tapped, "Delete"
  sits in the dialog footer, and on a touch screen a swipe to the end of the row deletes and a
  swipe from the start marks the chore done. Deleting no longer asks first: it shows "Undo" for
  five seconds, and undoing brings the chore back with its last completion. The circle is the
  same one as in Tasks - 20px and neutral until you tick it, instead of 24px and green at rest.
- **Row titles share one type size.** The name of a list row was set in four ways - 15px
  semibold in Tasks, 16px regular in Budget entries and subscriptions, 16px medium in most
  modules, 17px semibold in the agenda, contacts and birthdays. It is 16px medium everywhere
  now; card titles keep their heading size.
- **Budget: the seven tabs share one skeleton.** Figures use one size everywhere (28px; the
  side columns of the overview and the loans tab showed the same card at 20px), and on a phone
  every tab with figures shows them as one row, accounts included. On subscriptions and split
  expenses the section titles now stand above their lists, with search and tools to the right,
  as on the overview; the lists themselves are plain row lists instead of rows inside a padded
  card.
- **Budget statistics: the share ring sits with the categories it explains.** On a phone it
  stood 874px below the category bars next to an empty area; on a desktop it sat in a side
  column that was empty beneath it. It now shares the first row with the trend chart, the bars
  use the full width below, and a line next to the ring names the number of segments, the
  largest one and the total. The marker line no longer stands at the last data point before you
  touch the chart.
- **One period stepper in calendar, meal plan, budget, housekeeping reports and shift plan.**
  The five modules now share the same control. The shift plan's "Today" disappears while today
  is on screen, like everywhere else. In the budget on a phone, the month is shown in the
  module colour while you are somewhere else, and a tap on it jumps back to the current one.
- **Pantry: swipe a row to delete, and "Manage locations" is a button.** A swipe to the end of
  a pantry row deletes it, with "Undo"; the stepper and the cart button are excluded from the
  gesture. The header's "..." menu had a single entry and is now that action itself.
- **Housekeeping: section titles stand above their cards**, as in the other modules.
- **Headers have one height on a desktop.** Single-row headers measured 65 or 69px depending on
  the module, and the "New" button moved by 2px when switching; all are 69px now.
- **Settings: headings follow one scale.** On a sheet with "For me" and "For the household",
  that scope title was the smallest heading on the page. It now ranks above the sections it
  groups (sheet 22px, scope 20, section 17, card 16), also for screen readers.
- **Sign-in, setup, invitation and password reset look like one family.** All of them show the
  app mark and name, every password field has the eye to show what you typed (new on the
  invitation and reset pages and on the repeat field of setup), and errors are announced the
  same way on each page.
- **Contacts: phone numbers, mail addresses and map links are no longer pink.** They stood in
  the contacts colour right above a red "Delete"; the value is plain text now and the icon of
  its row carries the colour.
- **The shift plan steps through weeks like every other period.** The compare view read
  "back, Today, forward, week"; it now reads back, week, forward and then "Today", as in the
  calendar and the budget, and the arrows say what they move ("Previous week").
- **Dialogs carry their module's colour.** The active chip in the Tasks filter sheet was violet
  next to the same chip in green on the page behind it.
- **Budget: amounts have one weight, and zero is not a gain.** The amount of a split expense
  stood heavier than an account balance, which stood heavier than a booking; all of them are
  semibold now. "You are owed 0.00" in Split no longer shows in green, "You owe 0.00" no longer
  in red. "Loan transactions" is a real heading, so a screen reader finds the list.
- **Rewards: the history rows are the shared list rows, and section headings carry no icon.**
  The heading "Rewards" under the tab "Rewards" is no longer shown on a desktop either.
- **Rewards, Waste and Housekeeping use the width of a desktop window.** These three stood as a
  720px column next to an empty right half, and where one tab was wider than the others, the
  header and its primary button jumped when you switched tabs - in Rewards by up to 431px. Each
  module now has one outer edge for all of its tabs, and the button stays where it is. From a
  window of about 1280px the lists get a second column with what was already there: the latest
  bookings next to the point balances in Rewards (the heading leads to the full history) and
  the balances next to the history, waste types and import sources next to the next pickups,
  the month's figures next to the visit reports and a person's visit log next to the staff list
  in Housekeeping. The lists themselves keep their reading width. Nothing changes on a phone
  except that the Rewards overview ends with the latest bookings.
- **Every Budget tab ends at the same edge on a desktop, and so does the header.** The "new"
  button stood 276px (at 1280) or 404px (at 1440) short of the content it belongs to. The plan
  was a single 720px column, loans changed their right edge four times on the way down, and the
  net worth of the accounts sat in a 232px tile next to an empty row. Now the plan shows the
  category budgets with the savings goal beside them, loans show the filter, the loans and their
  transactions in one column with the three figures beside it, and the net worth runs across the
  row above the accounts. In "Split" the recent expenses take the wider column, balances and
  activity the narrower one. Phones are unchanged.
- **"Latest vitals" in the Health overview uses the width instead of one long column.** On a
  desktop the nine tiles stood one below the other, 930px tall, next to 640px of empty space.
  The card now runs across the overview with four or five tiles per row, about a third as tall.
- **The calendar's day view shows what comes next beside the day.** On a desktop the day was a
  single 932px column, the phone layout stretched. From a window of about 1280px the next seven
  days stand beside the hour timeline as agenda rows; a row opens the event, the heading leads
  to the agenda. The phone's day view is unchanged.
- **The Budget header is one row shorter on a phone.** Title, month stepper and tabs stood in
  three rows (162px), and on the four tabs without a month the middle row only carried a
  caption. The month now sits at the end of the title row with a short label ("Oct 2026"), the
  caption of the other tabs stands in the same place, and the header is 117px on every tab, so
  nothing moves when you switch. While you look at another month, a tap on the month label
  returns to the current one; the arrows stay where they are.
- **Contacts, Birthdays, Waste, Notes, Documents and Settings lose their second header row on a
  phone.** That row only carried one or two icons (search, "more"). They now sit at the end of
  the title row, and the list starts about 50px higher; an open search takes the row. In Waste,
  "Add waste type" moves into the "more" menu on a phone, and in Documents the grid/list choice
  moves into the sort menu. The note "Birthdays also appear in the calendar" no
  longer stands above the list - it is still in the dialog where you add one.
- **"Split" shows the first expense on the first screen of a phone.** The group list, the group
  header and the balances stood as three cards in front of it, and the first expense came after
  more than a full screen. The group choice is now one row that names the active group and
  opens the list with search, "new group" and Active/Archived; the group header is just its
  actions, and the balances are tighter. On a wide window nothing changes.
- **Shift schedule: "Compare" and "Statistics" start with two rows of controls on a phone
  instead of a third of the screen.** In "Compare" the people are one row you swipe through,
  next to Week/Day, with the week stepper below; in "Statistics" person and period stand side
  by side above the two buttons. The comparison or the figures begin about 170px higher.
- **Inventory and the Housekeeping overview show their figures as one row on a phone.** Three
  and four tiles stood in front of the list, one of them for "0". Now one row names the main
  figure and up to two others, and a tap opens the tiles; a figure that is zero is left out.
  The first category in Inventory starts 106px higher, the first visit in Housekeeping 57px.
- **Rewards fit about five to a phone screen instead of two and a half.** A reward was a tall
  tile with its emoji on a line of its own; on a phone it is now a compact card with emoji and
  text side by side. The heading "Rewards" under the tab "Rewards" no longer takes a row, and
  the overview ends with the three latest bookings instead of six.
- **Shopping: checked items keep their way into the pantry.** "To pantry" and "Remove checked"
  lived only in the pill that appears for five seconds after the first tick and then stays
  away until nothing is checked. Both now also stand in the list menu, in a group of their own
  while something is checked; the menu is grouped into checked items, the list, master data
  and delete. The pill stays as the shortcut.
- **Tasks: the dialog asks when, who and how important first.** Due date and time, assignee,
  priority and category follow the title; the note comes after them. Recurrence and reminder
  wait behind "More settings" while they are empty and stay open once set. On a phone the due
  date is on the first screen (it stood at 700 of 844px) and the dialog is a quarter shorter.
- **The formatting toolbar appears with the focus.** Above a note it took three rows on a phone
  (162px) and twelve tab stops. It now shows when you enter the text field, runs as one row you
  can scroll, and is a single tab stop: Shift+Tab from the field enters it, the arrow keys move.
- **Notes: the editor is a workspace.** The text field was six lines high and started below the
  keyboard line on a phone. Title and text no longer carry label rows, and the text field fills
  the sheet (about 320px on a phone, 400px on a desktop) and grows with what you write.
- **Tasks: the filter sheet is shorter.** Category and tag fold while nothing in them is
  chosen, and grouping and "Show scheduled" form a separate "View" section at the end.
- **Recipes: the uploaded picture opens the detail** as a 3:2 header; without a picture
  nothing takes its place.
- **Health on a phone: the start page is half as long.** Below "Due today" and the area list it
  shows the two most recent vitals - the card title leads to all of them - and one row "Show
  all values" for the rest. The CSV export is a button in the head that opens a dialog, on
  every screen size.
- **Settings: long sheets start with jump marks.** A sheet with more than three sections opens
  with a row of links to them. On a phone that row stands in place of the sheet description, and
  a sheet without it shows the description in two lines.
- **Subscriptions on a phone: the billing cycle stands under the amount**, so the line with the
  due date no longer wraps. **Budget accounts:** a long account name wraps to a second line
  instead of being cut after "Gemeinsames Gi...".
- **Movement follows one curve.** Hover and press feedback ran on a different easing curve than
  pages, dialogs and lists; buttons, rows, chips and toggles now share the curve of the rest of
  the app.
- **Sheets from below move the same way.** The dialog sheet, the "More" sheet and the search on
  a phone were three different movements; all three now rise by a short lift with a fade and
  leave faster than they arrive. Menus fade out instead of vanishing.
- **Switching a tab or a period no longer cuts.** Tabs inside Rewards, Housekeeping and the
  shift schedule fade to the new content as Budget's already did, in the direction of the tab
  you switch to, and paging by month or week (Budget, calendar,
  meal plan, housekeeping reports, shift overview) brings the new period in from the side you
  page to - with the arrows and shortcuts too, not only with a swipe. Health fades between
  areas on a desktop as it did on a phone. With "reduce motion" switched on only a short fade
  remains.
- **Lists show what changed.** In Housekeeping, Waste collection, Pantry and Rewards a deleted
  or decided row folds away, a new one unfolds and a reordered one glides to its place, instead
  of the whole list being rebuilt in one step. Checked shopping items fade to their muted
  colour.
- **Rewards and the shift schedule no longer flash a loading state.** Rewards emptied the page
  into a placeholder on every tab change and after every action; the shift overview did the
  same on every week step. Both keep what is shown until the new content is there. Where
  something does load for the first time, the shift schedule and the budget statistics show a
  placeholder in the shape of what follows instead of a "Loading..." card or a list.
- **Overview: customising no longer jumps.** Entering and leaving the customise mode slides
  the tiles to their new position, and "+N more today" unfolds in place.
- **Shopping on a phone: the add field unfolds** instead of pushing the list down in one step.
- **Inventory on a phone: Edit sits at the bottom of the detail sheet** (#1463). The sheet had
  Delete at the bottom, where the thumb rests, and Edit at the top, out of reach - the
  riskiest action was the easiest one to hit. Edit is now the main button at the end of the
  footer and Delete stands back at its start, as in the calendar. Deleting still asks first,
  and without write access neither button is shown.
- **Deleting a shared expense now leaves a trace instead of rewriting the books.** Until now
  deleting an expense removed its bookings, so the balances changed and nothing showed why. The
  expense now stays in the ledger and a counter-entry cancels it, so balances end up exactly where
  they would be without it, the same way a reversed payment works. The activity names the deleted
  expense with its title and amount, and the entry that added it is struck through and marked
  "Deleted" at every access level. A payment recorded against the expense stays as it is: payments
  are not tied to single expenses, so after the delete the balances show what was paid too much.
  An expense in another currency is cancelled in the currency it was booked in. Expenses deleted
  before this change keep their balances; only their trace is missing. (#1382)

### Fixed

- **A wall tablet shows events again when the household overview is set to "Assigned to me"** (#1808).
  A paired display follows the household default of the overview. If that default had the calendar
  tile set to "Assigned to me", the tablet looked for events assigned to the tablet itself and
  showed none - in the event list and in the week strip; tasks and the other tiles were not
  affected. On a display the option now means all events; for members it works as before. The
  hint under Settings > Wall tablets now says where a tablet takes its overview from and names
  what it shows: calendar, tasks, rewards and weather.
- **A locked field looks locked.** A field you cannot change looked exactly like one you can -
  same text, same fill, same outline; only the mouse pointer gave it away, and on a phone nothing
  did. Text, number and date fields, dropdowns and text areas now all show it the same way,
  everywhere in the app: the fill goes, the outline turns quiet and the value steps back to grey
  while staying easy to read. Settings and the reminder section used to fade such fields, which
  made the value hard to read in light mode, and a locked date was close to invisible in both
  modes; both now follow the one look. A locked dropdown drops its small arrow, so it reads as a
  value rather than something to open, and a locked field no longer shows its example text: an
  empty locked share in a split expense showed a grey "30" that looked like a value of 30. The
  calendar button of a locked date also steps back when a whole group of fields is locked, not
  only when the date itself is.
- **A row on the overview opens what it shows** (#1821). A note on the overview opened the notes
  page instead of the note, and so did a note found through search: the notes page now opens the
  note it is asked for. A birthday row opens that birthday, on the phone as well, and so does a
  birthday found through search. A bin without
  an upcoming pickup leads to that bin, and "n open" for shopping in the today sheet opens the
  list when only one list has open items.
- **The keyboard focus stays on an overview row.** When the overview refreshed quietly - on
  coming back to the tab, every quarter of an hour, at a day boundary - the focused row lost the
  focus and Enter did nothing. Tabbing into a row in the instant after the page appeared could
  lose it the same way. Both keep the focus now, and a dialog that a link opens directly keeps
  it too.
- **Overview rows that lead to one item open as fast as the others.** A row for an event, a
  shopping list or a pantry filter did not preload the page behind it on hover or press, so its
  first tap was slower than on any other row.
- **"n open" for shopping counts every list.** With more than three lists that still had open
  items, the today sheet and the wall added up only three of them and showed a smaller number
  than the shopping page.
- **A shopping list on the overview opens that list.** The shopping tile shows up to three lists,
  the most recently changed first, but tapping any of them opened the shopping page on its first
  list - tap "Drugstore" and you got "Weekly shop". Each row now opens its own list, by tap, click
  and keyboard. The "All" link in the tile header still opens the shopping page as before.
- **Starting on an older Node.js 22 says what is wrong instead of dying silently** (reported in
  #1728). Without Docker, Yuvomi claimed to run on any Node.js 22, but before 22.14 the
  server stopped right at startup without a single line of output, and so did the demo seed
  script. The required version is now stated correctly as Node.js 22.14 or newer, and an older
  one gets a one-line message that names the running version, what is needed, and that updating
  Node.js fixes it. The Docker image ships its own Node.js 24 and was never affected.
- **A wall tablet no longer offers to rearrange the overview or to search** (#1808). A paired
  display showed the "Customise" button, let you rearrange the tiles, and answered "Done" with
  "Token scope does not permit this operation." - a display changes no settings, and that
  includes its own board. The search button beside it failed the same way. Both are gone on a
  display. To decide what the tablet shows, arrange the overview as an administrator and choose
  "Set as household default" while customising: a display never stores an arrangement of its
  own, so it always follows that default.
- **Waste: a calendar URL whose provider renames every entry on each download can be imported**
  (#1795). Some providers hand out a new internal ID for every pickup each time the calendar is
  fetched (limburg.net does). Yuvomi fetches the address once for the preview and once more to
  apply it, took the new IDs for new content and refused every time with "The file content
  changed since you last previewed it". The check now compares what the preview shows - which
  waste type on which day, and how many - so the import goes through, and a calendar that really
  changed in between is still refused. Later refreshes of such an address no longer report every
  pickup as removed and added again. The refusal itself is now shown in the app's language.
- **SSO sign-in no longer fails when `OIDC_REDIRECT_URI` is written differently from how a URL
  is normally printed.** The first request to the provider sent the value exactly as written,
  the second one - the code exchange - a rebuilt form of it, with the path of the incoming
  request. The two differed with a default port written out (`https://host:443/...`), capital
  letters in the host name, a query of its own, or a path the reverse proxy rewrites. A provider
  has to refuse such an exchange, so the sign-in failed with `invalid_grant` after the login at
  the provider had looked successful. Both requests now carry the same value, character for
  character; the same goes for linking an account under Settings. Nothing changes for an
  installation whose value was already in its plain form. A sign-in that is under way while the
  update is installed is refused once and works on the second click (#1768).
- **The installation guide says what `OIDC_TRUST_EMAIL_WITHOUT_VERIFIED_CLAIM` does not do.** It
  covers a provider that leaves `email_verified` out, not one that sends `email_verified: false`,
  which authentik does by default since 2025.10. The guide and `.env.example` now name the fix
  on the provider side (#1780).
- **Blood pressure and its unit stay on one line in the health tiles.** In a narrow tile "mmHg"
  dropped below "116/74". The size of the value used to follow the width of the whole row of
  tiles, which says little where the row fills itself with as many tiles as fit; it now follows
  the tile. A narrow tile shows the value one step smaller, the narrowest one also a smaller
  unit, and on a very small phone the vitals page shows one tile per line instead of two that are
  too narrow. Tiles in budget, housekeeping and inventory are unchanged.
- **Screen readers name the field picker in the shift type dialog.** Under "Custom fields" the
  dropdown next to "Add" had no name, so it was announced as an unnamed combo box with the first
  field as its value. It is now announced as "Field to attach". Nothing changes on screen.
- **In the shift planner "To" follows "From".** When adding an exception or an extra shift,
  moving "From" past "To" left "To" where it was; "Add" then failed, and the message was the
  server's English sentence in whatever language the app was set to. "To" now moves along with
  "From", in the add dialog and in the two dialogs that edit an existing range. A range that is
  still the wrong way round is named at the "To" field, in the language of the app, before
  anything is sent. For API clients the refusal keeps its sentence and gains
  `reason: "range_reversed"`.
- **A meal dialog you did not touch no longer asks "Discard changes?".** If the household members
  could not be loaded with the page, the meal dialog fetches them when it opens and fills in the
  cook selection a moment later. Closing the dialog after that asked whether to discard changes,
  although nothing had been changed. What you typed before the selection arrived still counts as
  a change, as it should.
- **Fast clicks on the month arrows in the budget land on the right month.** Clicking "next"
  twice while a month was still loading moved one month instead of two, and going forward and
  straight back could leave the wrong month on screen - whichever answer arrived last won. Each
  click now counts from the month you asked for, and a late answer for a month you already left
  is ignored. The same holds for "Current" and for swiping.
- **The first visit no longer reloads itself and empties the login form.** One to four seconds
  after the very first load the page reloaded, and whatever had been typed into the login form
  was gone. The reload was meant for an update of the app, but it also fired when the app was
  installed in the browser for the first time.
- **An update of the app no longer interrupts what you are doing.** When a new version arrived,
  the page reloaded 200 ms later - with a dialog open, a half-filled form or an unsaved overview
  layout. Now it reloads right away only when nothing is open and nobody is typing. Otherwise a
  notice with a "Reload" button appears, and the new version loads with the next page change or
  when the app goes to the background. The notice says the same in every language; in German,
  Persian, Indonesian, Korean and Polish it used to announce a reload that was already over.
- **Switching the language without a connection no longer leaves the app half switched.** If the
  language file could not be loaded, texts stayed in the old language while numbers and dates
  followed the new one, the setting showed a parser error, and the next start fell back to
  German without a word. A switch that cannot load its file now changes nothing: the selection
  returns to the language in use and the line below says that there is no connection.
- **Health on a phone no longer jumps while it loads** (cause of #1770). The block above the list
  of areas - person, "Due today", "Quick add" - appeared only once its data had arrived and
  pushed the list down by almost 500 px, under the finger; each row then grew again when its
  status came in. The block now holds its place from the first frame with a placeholder in its
  final shape, and the rows have their two-line height from the start. Measured layout shift at
  390x844: 0.58 before, below 0.01 after. The areas themselves load with a placeholder in the
  shape of their content instead of the word "Loading".
- **A required field no longer complains before anything was entered.** In "New event" the title
  showed "This field is required." on the first Tab or when reaching for the date picker, and
  everything below it jumped down by a line. An untouched empty field now stays quiet until the
  form is submitted or until something was typed into it and removed again, and the message
  slides in instead of pushing the form. This applies to every dialog that marks required fields
  (events, tasks, meals, recipes, pantry, inventory, contact sync).
- **Checked items no longer twitch when the list changes.** Adding or deleting an item in the
  shopping list, or opening a group, replayed the little "checked" animation on every item that
  had been ticked off long ago. It now plays once, on the box you touch - also when you take a
  tick back - and has become calmer. The same applies to tasks, subtasks, the housekeeping
  list and checklists in notes.
- **The tab bar keeps its glass while you change pages.** On a phone the bar at the bottom went
  see-through for a moment on every tab change, and the round "+" button popped in again each
  time. Both now stand still while the page underneath changes; the "+" only arrives with an
  entrance when the page before had none.
- **A tapped row no longer stays highlighted on a phone.** After a tap, list rows, task cards and
  the cards on the overview kept the look they have under a mouse pointer until something else
  was tapped.
- **Overview on a desktop: opening "New" no longer tips the button over.** The plus turns into
  a cross by rotating - and it was the whole button that rotated, label included, so the capsule
  stood diagonally at 45 degrees and turned grey while its menu was open. Only the icon turns
  now, and the capsule keeps its colour. The round button on a phone looks as before.
- **Swiping a row shows its whole label at the point where the swipe takes effect.** Icon and
  word sat in the middle of a panel half the row wide, while the action triggers after 80 px -
  at that moment a phone showed "Che" and half a tick. They now stand inside the strip the swipe
  uncovers, on both sides and in right-to-left languages, in every list that swipes.
- **Dark theme: the selected segment and the switch knob are the lighter surface again.** The
  selected tab of a segmented control was darker than its track and read as a dent, and the knob
  of a switch was a dark dot on a light rail. The thumb now sits one step above its track
  (module-coloured labels on it keep at least 4.5:1), and the knob is white in both themes; a
  switch that is on uses the same violet as a primary button, so the knob stands at 5.7:1 instead
  of 2.7:1.
- **The budget tile on the overview wears the budget colour.** Its mark was violet, the colour of
  the overview itself, because the colour was derived from the tile's link and that link carries
  a `?tab=` part. The fasting tile, which had no colour of its own either, now wears the health
  colour like the other health tiles.
- **The login pages show the Yuvomi mark as it is.** In the dark theme the mark on login,
  invitation and password reset was three dark dots on a lilac tile, and the circles filled less
  than a third of it. Sidebar and login pages now draw the same mark - the gradient tile with
  the three light circles of the app icon - and it no longer changes with the theme.
- **A confirmation without an explanation has no empty gap.** Dialogs such as "Log out of this
  device?" showed an empty band between two hairlines, between the question and its buttons.
- **Tasks on a phone: after picking a folded entry from the tools menu, the keyboard focus is
  back on the menu button.** With the header docked, view switch and filter move into the "..."
  menu; choosing one of them there left the focus on the page instead of on the button the menu
  was opened from.
- **Health overview: the medication name gets its own line on a phone, and the gap above "Latest
  vitals" is always there.** The dose row left the name 81px, so "Eisen (Eisenbisglycinat)" broke
  in the middle of the word; the name now stands on the first line, time and actions below it.
  On a desktop the vitals band could sit flush against the card above it, depending on which
  column was the tallest.
- **Notes: no empty row between pinned and other notes.** When the pinned notes did not fill
  their last row - five notes in four columns - the rest of that row stayed empty and "Other
  notes" started a screen further down. The other notes now continue in that row; their heading
  starts in the first free column. On a phone nothing changes.
- **A new task shows up where you can see it.** After adding a task the list simply redrew: the
  new row sat somewhere between the others - below the fold in a long list, hidden in a
  collapsed group - and the detail column kept showing the previous task. The new row now
  scrolls into view and slides in, its group opens if it was collapsed, and on a desktop the
  detail column shows the task you just added.
- **Inventory: a deleted item no longer stays in the address.** Deleting the selected item could
  leave `?open=<id>` in the address bar, so a reload showed "not found". The detail row for the
  warranty is now labelled "Warranty" and names the duration and the end date; it used to carry
  the form label "Warranty (months)" above a date.
- **Editing a shopping item: quantity and category, price and store stand side by side again.**
  The dialog used a layout class whose stylesheet is only loaded in the pantry, so each pair fell
  into two full-width rows and the dialog was 748 px long on a phone; it is 563 px now and fits
  without scrolling.
- **Arrow keys in the date picker move one day again after changing the month.** Every month
  change added another key listener to the grid of days: after two changes an arrow key jumped
  three days and Page Down three months. The keys are now bound once per opened picker.
- **The meal plan's week board no longer cuts its cards off on a short window.** At a window
  height of 650 px every planned meal lost its lower edge, including the "+" for a second meal
  in the same slot, and the board offered no way to scroll there. A row is now as tall as its
  tallest card, and the board scrolls vertically when the week does not fit.
- **Housekeeping: the tab bar no longer jumps when you open "Reports".** On a phone the month
  stepper pushed itself between the title and the tabs, so the bar moved 52 px down under your
  finger on that one tab. The tabs now sit in the same place on all four, and the month stepper
  stands below them, above the figures it selects. On a desktop it stays in the title row, where
  nothing ever jumped.
- **Shifts in the calendar are readable: tinted chip, colour dot, dark text.** A shift from the
  shift plan stood in the calendar as a block of its full colour with white 12 px text - 3.26:1
  on the early shift's teal, less on amber. It now looks the way the same shift does in the shift
  plan's comparison view: a light tint of its colour, the full colour as a dot before the name,
  the text in the normal ink. Month, the all-day row of week and day, and agenda, in light and
  dark; every colour of the starter palette is above 10:1 for the name and 5:1 for the time.
- **The cycle calendar tells a screen reader what each day shows, not only its date.** Period,
  predicted period, fertile window, ovulation, an entry and "today" were colours on the day and
  nothing else - somebody listening to the calendar got 42 dates and no state. Each day now names
  what it shows in the words of the legend next to it ("3 October, Period, Flow: Medium, Entry"),
  as a button and in the read-only view of your own cycle. Somebody else's cycle stays hidden
  from the screen reader as before.
- **Budget statistics: an entry added from an empty period lands in that period.** The "add an
  entry" action of an empty week, month or year opened the dialog with a date from the month of
  the entry list, so the entry went elsewhere and the report stayed empty. The dialog now starts
  on the first day of the period on screen, or on today when the period contains it (#1775).
- **Budget and calendar: a second swipe while the next period is still loading is ignored.** Two
  quick swipes forward in the budget asked for the same month twice instead of moving on by two,
  and two opposite ones left whichever answer came last on screen. A swipe now starts only when
  the one before it has finished loading; the arrows are unchanged. In the statistics, a late
  answer for an earlier period no longer replaces the period on screen (#1775).
- **Waste: "Add pickup" is no longer offered while every waste type is archived.** The entry in
  the header menu opened the dialog for a new waste type in that state - a pickup has no type to
  pick then. It is hidden until a type is active again, as it already was before the first type
  existed (#1775).
- **The filter popover on the desktop follows the window.** It was placed once when it opened;
  narrowing or rotating the window while it was open could leave it partly outside until it was
  closed and opened again. It is now placed again on every change of the window, and closes when
  the window gets narrower than the width from which the filters open as a popover (#1775).
- **Shift types: a field removed in the dialog can be attached again without leaving it.** Removing
  an attached field only deleted its row; it did not come back to the list of fields to add, and
  with every field attached there was no such list at all - undoing a slip meant cancelling the
  dialog and losing the other edits. A removed field now returns to the list at once, and comes
  back with its "show in overlay" switch as it was (#1775).
- **Dialogs ask before discarding a change that is only a tick.** Closing a dialog asks "Discard
  changes?" when a field differs from what it was on opening, but a checkbox or a radio button
  was compared by a text that never changes - switching only "Active" in a shift pattern, or the
  switches of the fields of a shift type, and closing the dialog lost the change without a
  question. Their state now counts, in every dialog. The participants sheet of Rewards saves
  each tick at once and therefore still closes without asking (#1775).
- **Budget, split expenses: the header no longer says "All groups" above the numbers of one
  group.** Since the figures at the top of the tab show the selected group, the note in the
  header claimed the opposite of what stood below it. It is gone on this tab; the total over all
  groups keeps its label in the group list, and the selected group its own heading.
- **An open filter popover no longer stays on screen when the page changes.** On a desktop the
  calendar's filter popover hangs above the page and closed only on Escape or a click outside:
  going back in the browser or changing the page from the keyboard left it standing over the next
  page. It is now removed on every page change, and so is the new filter popover in Tasks.
- **The API description of `PUT /api/v1/meals/{id}` names the two fields a series edit reads**
  (follow-up to #1679). With `?scope=series` the route has long taken `repeat_until` (the end of
  the series; an empty string removes it) and `ingredients` (replacing those of the series and of
  all its meals), but the OpenAPI document listed them for creating a meal only. Both are now
  described for the update as well, with the note that they are read in a series edit alone.
- **Holiday countries and regions are named in your language, and the delete button of the task
  selection is no longer announced as a question** (#1723). Under Settings, Calendar, the list of
  countries for public holidays showed English names in every language, in English order. The
  names now follow the language of the app and the list is sorted in it; a country the browser
  cannot name keeps the name it had. The regions below a country (federal states, cantons) come
  from the holiday service, which carries them in several languages: the app now asks for yours
  and falls back to English where the service has none. The three nations of the United Kingdom
  stay in English. In Tasks, with several tasks selected, a screen reader read the delete button
  as "Delete 3 tasks?" where the screen says "Delete" - the question belongs to the confirmation
  step that follows. The button is now called "Delete 3 tasks". That name is new in all 26
  languages; in Vietnamese, Hindi, Arabic, Persian, Korean, Japanese, Chinese and Filipino it was
  not written by a native speaker. For API clients:
  `GET /api/v1/preferences/holidays/subdivisions/{countryCode}` takes an optional `lang`; without
  it the answer is in English, as before.
- **A monthly shared expense on the 29th, 30th or 31st no longer skips a month** (#1721). A
  recurring shared expense only knew its next date, not the day it was meant for. After a
  booking on 31 January the next date overflowed to 3 March: February got no booking at all,
  nothing said so, and the series stayed on the 3rd from then on (on the 2nd or 1st when it
  started on the 30th or 29th, or after a 30-day month). A series now remembers its day. In a
  shorter month it books on the last day and returns to its day afterwards: 31 January,
  28 February (29 in a leap year), 31 March. A yearly series from 29 February books on
  28 February and on 29 February again in a leap year, instead of moving to 1 March for good.
  Resuming a paused series counts the same way. Weekly series were not affected.
  **Existing series that demonstrably drifted off the 29th-31st return to their day; the month
  that was skipped is not booked afterwards.** The evidence is the first expense the series
  booked: if it lies on the 29th, 30th or 31st and the next date sits on the 1st, 2nd or 3rd
  where the overflow left it, the next date moves to that day (or the last day) of the same
  month. If the skipped month is still ahead at the time of the update - the series booked on
  31 October and waits for 1 December, and it is 10 November - the date moves into that month
  instead (30 November), so it is not left empty; that is a date in the future, not a booking
  made up afterwards. A series that was really created on the 1st to 3rd stays there. So does
  one whose first expense has been deleted or was ever edited, because then nothing shows
  reliably where the series started: an edit can have changed the date, and the app does not
  record what an edit changed, so an edit of the title alone counts as well. Two more cases
  keep the date where it is. If the series already has an expense in that month, the series
  returns with the following booking. And no date is ever moved into the past, where the next
  run would book it at once: a paused series whose date already lies behind returns when it is
  resumed. A yearly series that stands on 1 March and cannot be moved back for one of these
  reasons stays on 1 March. If a month is missing in your group, add that expense by hand.
  Shared expenses only: subscriptions and tasks keep their own rules. For API clients:
  recurring expenses carry `anchor_day` (migration 234).
- **Meal plan and recipes with read-only access: no more buttons that end in an error message**
  (#1265). A member who may only read the Kitchen still saw every control on both tabs: the plus
  buttons and the empty slots, the edit dialog with Save and Delete, the bin on a meal, the drag
  handle, "Fill plan at random", the recipe column, and on a recipe Edit, Duplicate, Delete and
  "Add to meal plan". Each of them ended in "no permission"; a dragged meal jumped back, and a
  deleted one came back after the undo window. Those controls are now gone for such a member.
  What the plan and the list show stays, and is readable in full: tapping a meal opens a
  read-only view with everything the form shows - date, meal, ingredients with their shopping
  category, the saved recipe, notes, the recipe link and whether it repeats. A recipe opens its
  details as before, which now also name the meals it is meant for and the category of each
  ingredient. An empty week or an empty recipe list only says so, instead of inviting you to add
  something. "Add to shopping list" on a recipe keeps following the right it needs: it stays
  for a member who may read the Kitchen and edit Shopping. Assigning a recipe ingredient to a
  pantry row needs write access to both the Kitchen and the Pantry, as the server requires; with
  only the Pantry right the button used to be offered and the save was refused.
- **The PDFs in the demo data are real PDFs** (#1511). The demo documents carried a line of
  placeholder text under a `.pdf` name, so the built-in preview could not open them and
  every screenshot of an opened document showed an error. Each one is now a one-page PDF with
  the title and description of its entry, in the language the demo was seeded in, and it opens
  in the preview and in the browser's own viewer. The three demo images are still placeholders.
  Only a database filled by `scripts/seed-demo.js` is affected.
- **The reminder-list settings have one name: "Reminder sync"** (#1524). The section under
  Settings, Tasks was headed "Show/hide reminder lists", while the settings search and the link
  from the task defaults called it "Reminder sync" - whoever searched for the one found the
  other. The heading now carries the name the search and the links use. It is also the name
  that says what the section does: its switches decide which CalDAV lists the household syncs
  and whether a list feeds Tasks or Shopping, nothing in it merely hides a list.
- **Wording: waste colours are named after what they show, and two stale sentences are gone**
  (#1507). In the waste type dialog the swatch called "Violet" was fuchsia and the one called
  "Teal" was emerald; both now carry those names, which is what a screen reader announces. The
  hint above the module order under Settings, Navigation listed groups that no longer exist
  ("Overview, Plan, Home") and now simply says the modules are sorted within their group. In
  German, the empty waste page read "Papier -, um".
- **Wording: one word for the housekeeper, a pink that is called pink, "Square (2×2)", and a
  real sentence when weather coordinates are missing** (#1723). In Housekeeping the person had
  four names: the tab said "Staff", its heading "Housekeeping staff", the add button
  "Housekeeper", and in German the short add label just "Person". It is "Housekeeper"
  ("Haushaltshilfe") everywhere now; the tab and its heading read "Housekeepers", and a
  housekeeper's account under Settings, Family carries that word as its role instead of
  "Staff". The module keeps its name. In the waste type dialog the swatch called "Magenta" is a
  pink and is now called that - only the name a screen reader announces changes, saved waste
  types keep their colour. On the overview, the largest of the four tile sizes was called
  "Standard (2×2)" although no tile starts in it; it is "Square (2×2)", saved layouts are
  untouched. And in the weather settings, saving without valid coordinates showed the two
  field names, "Latitude / Longitude", as the error; it now says "Enter valid coordinates."
  The new wording is in all 26 languages; in Vietnamese, Hindi, Arabic, Persian, Korean,
  Japanese, Chinese and Filipino it was not written by a native speaker.
- **Resuming a paused recurring shared expense no longer books every date it missed** (#1647).
  A recurring expense that was paused for six months and then resumed got six expenses within
  six hours, one per hourly run, each with its original date. Resuming now skips the missed
  dates: the series continues at its next date that is not in the past, in its own rhythm, and
  nothing is booked for the time it was paused. A date that falls on today is still booked.
  The app has no control for this yet, so it concerns API clients: this changes what
  `POST /api/v1/split-expenses/recurring/{id}/pause` does by default when it resumes. To get
  the previous behaviour, send `{ "missed": "book" }`; `"skip"` is the default, and any other
  value answers 400 with `reason: "invalid_missed"`.
- **An avatar never shows more than one character per name part** (#1464). A name starting
  with "ß" put three letters on the disc ("ßeta Schmidt" showed "SSS"), because writing a
  letter in capitals can turn it into two; the same went for the ligatures "ﬁ" and "ﬂ". The
  disc now keeps one character each ("SS"). Along with it: brackets, quotation marks and
  other punctuation at the start of a name are skipped ("(Grandma) Erika" shows "GE", not
  "(E"), and a name part made of punctuation only does not count; an invisible direction
  mark in front of an Arabic or Hebrew name no longer leaves the disc empty; two Arabic
  initials stand side by side instead of joining into a word; Georgian letters stay as
  typed instead of turning into a capital form most fonts cannot draw; the flags of England,
  Scotland and Wales stay whole on browsers without `Intl.Segmenter`; and two half-width
  katakana fit the small disc, so they are no longer cut to one. Capitals are formed the
  same way in every language of the interface, so a person does not show different initials
  depending on who looks: "ipek" gives "I", and whoever types "İpek" keeps the "İ".
- **Documents: Esc closes the viewer again when the PDF took the focus by itself.** Opened by
  keyboard, a file whose preview fails - one that claims to be a PDF and is not one - left the
  focus inside the browser's built-in PDF viewer without anyone having touched it, and from
  there no key reaches the page: Esc did nothing. The same happened after Tab from a blank spot
  of the dialog. Focus that arrives in the PDF while you are on the keyboard now goes back to
  the control that had it, so Esc closes and the focus returns to the document you opened. What
  stays as it is: after a click into the PDF, Esc does not close until you click the dialog or
  its X. The built-in viewer is a separate part of the browser that keeps its keystrokes, and
  taking the focus away from a click would break selecting and copying in the PDF (#1511).
- **Settings: the sheet you are on is visible in the sidebar, not hidden under its search.** The
  sidebar scrolls on its own and its search field stays at the top while it does. When the open
  sheet lay above the visible part - after Back, from the command palette, from a link - the
  sidebar scrolled it to its very top edge, exactly where the search sits: at 1280x700 the active
  entry stood at 32-72 under a search at 32-100, all 40px of it covered. An entry half behind
  the search was not moved at all. The sidebar now brings the entry to just below the search
  (#1509).
- **Calendar: the week follows the screen when it crosses the phone width.** On a phone the week
  is a window of three days around the selected day, on a wider screen the whole week, and the
  label, the arrows and the loaded range follow the same threshold. Only the month was redrawn
  when the width crossed it. Rotating a tablet or resizing the window from 1280px to 390px left
  seven columns of 49px each under "CW 41"; the other way round, three columns of 311px each
  under "05.10. - 07.10.2026", with arrows that still stepped by three days. The week is now
  rebuilt on that change, its range reloaded first when the other form shows a day that was not
  loaded (the selected day at the edge of the week), and the day view switches between the long
  and the short weekday in its label (#1504).
- **Phones: the tab you are on stays inside the tab strip.** A tab strip that does not fit the
  screen scrolls, and it snaps to the start of a tab. Opening a tab that lay past the edge moved
  the strip by exactly the missing pixels, and the snapping then pulled it back to the nearest
  snap point, which could be the one behind it. Budget "Loans" at 390px stood at 327-404 in a
  strip that ends at 374, 30px outside and without the strip having moved at all; the same at
  320px (subscriptions, 21px), 360px (reports, 8px) and 414px (loans 6px, reports 20px), on a tap
  as well as after a reload. At 375px it happened to work, which is why it looked fixed. The
  strip now moves to the first snap point at which the tab fits with its padding, so there is
  nothing left to pull back, and it does so in right-to-left languages too (#1504).
- **A refused change is sent to the server once, not twice.** When the server turned a change
  down with a reason - a locked task, a read-only module, a recipe managed elsewhere - the app
  sent the same request a second time before showing the message. The repeat exists to recover
  from an expired security token, and it ran for every refusal. It now runs only when the
  server names the token as the reason, or names no reason at all; a refusal with any other
  reason is shown straight away. Nothing was saved twice, since the second attempt was refused
  as well, but each such refusal cost a second round trip (#1669).
- **A failed single sign-on says why in the log.** When the identity provider turned the token
  request down, the server log showed only "server responded with an error in the response
  body" and a stack trace - the same line for a wrong client secret, a mismatched redirect URI
  and an expired code. The entry now carries the provider's `error`, `error_description` and
  HTTP status, the challenge of a 401 answer, and the network error underneath a failed
  discovery (certificate, DNS, connection). Secret, authorization code and tokens are not
  logged (#1675).
- **Health: "month" and "week" no longer start empty.** The default month was the calendar
  month and the activity week the calendar week, so on the 5th the trend said "too few
  readings" over four measurements from the week before, and on a Monday the week was empty
  although yesterday's run was listed. The current period is now the last 30 or 7 days up to
  today and says so in its label; paging back still shows the calendar month or week.
- **Health: adherence shows one figure.** The overview counted 30 days and the medication page
  7, so the same figure read 21 % here and 86 % there. Both use the last 7 days and name them.
- **Health: the year chart labels months** instead of the first day of each month.
- **Tasks: "Filter 1" is no longer the resting state.** The default status "open" counted as an
  active filter, so the button always carried a number and its active colour, and "Clear all
  filters" led to a third state that also showed finished tasks. The button now marks only
  what differs from the default, and "Reset filters" restores it.
- **Meal plan: a dragged meal lands at once**, and a move the server refuses says so instead of
  silently snapping back. Saving a meal confirms with "Meal saved." instead of the dialog
  title "Add meal".
- **Recipes: your own recipes show their picture in the list.** The thumbnail appeared only for
  recipes mirrored from Mealie or Tandoor.
- **Shopping: the tick is felt when you tap**, not after the server has answered.
- **Housekeeping staff: the row's button is as high as the row** (it was 25px) for keyboard and
  assistive technology.
- **Required fields: the star is no longer part of the label text.** In thirteen labels the
  " *" was written into the translated text, so screen readers read it out, it lacked the
  warning colour of the other stars, and a loan's read-only view showed "Total amount *".
- **Charts: the lowest axis value no longer runs into the first date** on a phone ("0 EUR" stood
  3px next to "01.10.2026" in the budget trend; the health charts share the fix).
- **Sign-in pages no longer stack inside each other.** Going from one page without sign-in to
  the next inside the app - "Back to sign in" on the forgotten-password page, or the back button
  between them - put the new page inside the old one. The card then shrank to the width of its
  content (338px on the sign-in page, 307px on the reset page, instead of 380px), and a screen
  reader met two nested main regions. Each of these pages now replaces the one before it.
- **Budget: the category bars grow to their value.** They were built to animate and never did;
  they now grow from the previous month's value when you page, and from zero the first time.
- **Meal plan: a dragged meal lifts off** with a short movement, and its slot fades instead of
  switching to pale in one step.
- **The page title in Budget, calendar, notes and contacts no longer stutters while the header
  collapses** on a phone; it changed its size across several layout steps during scrolling.
- **Pantry: read-only access no longer offers what the server refuses.** With read-only access
  to the pantry, the plus and minus buttons still changed the quantity until the server said no
  and the row jumped back, a tap on a row opened the edit dialog with "Save" and "Delete", and
  "Manage locations" and the "Add item" button of the empty pantry were there as well. The row
  now shows its quantity without the buttons, and a tap opens a read-only view with everything
  the dialog shows - quantity, location, category, best-before date, minimum stock and note.
  The cart button stays for members who may write to the shopping list.
- **The budget shows the whole list again when you come back to it** (#1593). Tapping a
  person's avatar on an entry narrows the list to what that person is responsible for. That
  filter survived leaving the budget: you opened another page, came back, and still saw only
  those entries. It now falls back when the budget is opened, like the account filter and the
  loan filters always did. Within the budget it stays as it was, also across months.
- **The budget page answers a refused action in your language, at the field it is about**
  (#1668). Outside the loan dialog the page still showed whatever the server answered - in
  English, or for an account that no longer exists in German ("Konto nicht gefunden.") - as a
  toast, in every language. Saving an entry, a series or an account, booking an expected
  entry, adding a category, ticking off or deleting an installment, and deleting an entry, a
  series, an account or a loan now say it in the app's own sentence. Where the refusal is
  about one field of an open dialog, the sentence stands at that field: an account that was
  deleted in the meantime at "Account", an amount above what is left of a loan at "Amount".
  The loan dialog got more precise as well: a loan that would run too long says so, with the
  limit of 600 months, instead of "does not amortize" - in the preview and on saving; 361
  installments are answered with the allowed range of 1 to 360; too many installments
  already paid names how many the loan has; and title, notes, currency and account each have
  a sentence of their own instead of the general "could not be saved". For API clients:
  every 400 and 409 of the write routes for entries, series, accounts, categories and loans
  now carries a `reason` next to `error`, three of them with `max` (the limit the refusal is
  about); budget plans are unchanged. A refused `POST /api/v1/budget/loans/preview` says why
  (`reason`, `max`). An unknown `account_id` was answered in German and now reads "Account
  not found." or "account_id must be a valid account id."; the other German `error` sentences
  of the budget routes are the next entry.
- **Budget API: the `error` sentences are English throughout.** For API clients only - the app
  does not show these sentences, it reads `reason`. Some refusals of the budget routes were
  still German or half German, because a German field name was put into an English sentence:
  "month muss YYYY-MM sein", "Betrag muss größer als 0 sein.", "Titel is required.", "Kontotyp
  must be one of: ...". They now read "month must be in YYYY-MM format.", "Amount must be
  greater than zero.", "Title is required.", "Account type must be one of: ...", and the same
  goes for the other field names: Amount, Category, Date, Interval, Interval count, Starting
  balance, Credit limit, Color, Type, and `recurrence_rule` for an invalid rule. Affected are
  entries, series, booking an expected entry, accounts, categories, budget plans, and the
  `month`, `q`, `range` and `anchor` parameters of the list, the summary, the search and the
  statistics. Status codes and every `reason` are exactly as before; `reason` is the stable
  key, so a client that compared the `error` text should switch to it. Where a sentence lists
  the allowed category keys, the keys of the built-in income categories are still German
  words - they are stored keys, not wording. Other modules are unchanged (#1668).
- **Three layout points from a Korean household: a long title stays on its card, hints wrap
  at word boundaries, and the chart's amounts are no longer cut off** (#1607, reported by
  @soonJ817). On the task board, a title without spaces - a web address, one very long
  word - ran out of its card and across the neighbouring columns; it now wraps inside the
  card. In the Korean interface, hints and descriptions broke between any two syllables and
  left a single one on the next line ("선택합니 / 다."); Korean now wraps between words, as
  it is written, and the other languages wrap as before. In the Budget statistics, the
  amounts along the left edge of the chart lost their beginning once they got long -
  "₩6,000,000" was cut off at its currency sign, on a phone and on a desktop alike. The
  chart now measures its amounts and leaves them the room they need, whatever the currency
  and region; a chart with short amounts looks exactly as before.
- **Inventory and Documents with read-only access: no more buttons that end in an error message**
  (#1265). A member who may only read the Inventory still saw Add, Edit and Delete, "Done" on a
  due deadline, and the menu that manages locations and categories; a member who may only read
  Documents still saw Upload, the folder buttons, the menu on every document and "Select
  multiple". Each of them ended in "no permission". Those controls are now gone for such a
  member. What the pages show stays and is readable in full: an inventory item opens its
  details, which now also name a deadline's reminder lead time and its repeat interval, and a
  document opens in the viewer with preview, download and share, which now also shows its
  description, who may see it, the reminder lead time and whether it is archived. An empty
  page only says that it is empty instead of inviting you to add something.
- **Documents: Edit, Move, Archive and Delete are only offered on documents you may change**
  (#1265). A document can be changed by the person who uploaded it and by an admin. The page
  did not know that rule: every document that was shared with you carried the full menu, and
  saving, archiving or deleting somebody else's document ended in "Not authorized" - a deleted
  one disappeared first and came back a few seconds later. Now the menu, the pencil in the
  viewer and the selection circle of "Select multiple" appear only on your own documents (on
  all of them for an admin). Viewing, downloading and sharing stay available on every document
  you can see, and on a narrow phone a document without a menu keeps its view button.
- **With read-only access, a screen reader now says that a row opens its details** (#1682).
  In the pantry and under Birthdays, a row announced only its content when you may read
  but not change: with write access it ends on "Edit", and with read access that word was
  removed and nothing took its place. The row now ends on "Show details". The info button of
  a shopping item says the same, followed by the item's name. Along with it, in the pantry on
  a narrow phone: a row with a cart button hid its best-before date to make room for the
  plus and minus buttons. A read-only row has no such buttons, so the date stays visible
  there. Behind the scenes the three read views (birthdays, shopping, pantry) now draw their
  rows with one shared building block instead of three copies.
- **Every chart leaves its axis values the room they need, not only the Budget trend**
  (#1722). The Health charts (vitals, lab values, activity, and the cycle trends) and the
  odometer chart of an inventory item kept a fixed margin sized for short numbers. The
  severity trend of a cycle symptom writes words on that axis, and their length depends on
  the language: in Polish, "Umiarkowane" started to the left of its chart and ended up one
  pixel from the edge of its card on a phone; Filipino and Russian stuck out as well. Each
  of these charts is now measured the moment it appears, the same way the Budget trend
  already was, so a long word or a seven-digit odometer reading stays inside its chart. A
  chart with short values looks exactly as before.

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
