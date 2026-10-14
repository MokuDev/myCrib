<!-- version: 1.3.0 -->
This update brings several local calendars, allowance for children, a calmer shopping list and a wall mode that says more, and it makes calendar and reminder sync considerably more careful.

Events can be kept in several local calendars, each with its own subscription link, and an ICS import asks which calendar it should go to. Tasks can be put in your own order within a category. On the shopping list, checked-off items collect in one collapsed section, and an item can be moved to another list. There are also allowance payouts, recurring split expenses, a cook per meal, and accounts that can be deactivated instead of deleted.

Wall mode now names today's tasks under each person and shows only what the whole household may see. The photo screensaver can show the time and be started by hand. Profile pictures can come from Gravatar, if the operator turns that on, and custom modules can be installed from GitHub or a ZIP file, if the operator allows it.

Sync with CalDAV, iCloud and Google loses fewer changes: an entry edited, moved or deleted while it is being uploaded ends up where you last put it, and a deleted entry no longer comes back after an interrupted upload.

The update runs fifteen database migrations on first start. They add the new calendars, allowances and the columns the sync needs; no action is needed, and as always, a backup before updating is a good idea.

Full release notes are available at https://github.com/MokuDev/myCrib/releases/tag/v1.3.0
