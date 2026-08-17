# Daily Routine

![Image|300](https://github.com/user-attachments/assets/7dd6ba71-7c4a-489a-856a-17df9dc74522)

**Daily Routine** is an Obsidian plugin for tracking recurring tasks and building daily habits. Define your routines once — weekly, monthly, or on a custom interval — and the plugin generates a daily checklist note for you, every day, automatically.

## Key Features

- **Routines** — recurring tasks scheduled by weekday, day of month, or every N days
- **Todos** — one-time tasks for a specific date
- **Groups** — organize routines into collapsible groups
- **Tags** — attach tags to a routine; they are appended to its task line in the daily note, so they work with tag queries, Dataview, and other task plugins
- **Calendar** — see scheduled tasks at a glance, month by month
- **Achievement** — visual statistics of your completion rate and consistency
- **Mobile support** — works on phones and tablets, including drag-and-drop reordering

## How It Works

### Routine Note

Every day, Daily Routine creates a plain Markdown note containing that day's tasks — similar to Obsidian's Daily Notes. Your data is never locked in: notes stay readable and editable even without the plugin.

> Notes are stored in the `{your-routine-folder}/notes` directory.

### Routine

![Image|300](https://github.com/user-attachments/assets/189d640e-2fec-47c0-8163-abcb2937744a)

A routine is a recurring task. Three schedule types are supported:

- **Week** — pick the weekdays it repeats on (e.g. every Mon/Wed/Fri)
- **Month** — pick days of the month (e.g. the 1st and the 15th; `Last day` is supported)
- **Interval** — repeat every N days from a start date (e.g. every 3 days, or every 90 days for low-frequency chores)

Each routine is stored as a Markdown file with its schedule in the frontmatter, so you can inspect or edit it by hand. Routines can also carry **tags**, which are appended to the generated task line (`- [ ] [[Workout]] #health`) for use with other plugins and queries.

### Todo

Todos are ordinary one-time tasks tied to a date. Reschedule them to another day from the task menu when plans change.

### Calendar

![Image|300](https://github.com/user-attachments/assets/2a59f917-f82b-4802-bdd2-173066362868)

The calendar shows tasks that have **Show on calendar** enabled, so you can see your schedule month by month. Both routines and todos can appear here.

### Achievement

![Image|300](https://github.com/user-attachments/assets/ef1a8cb7-97ec-4a18-b7d2-c02f6483aa19)

Track your overall completion rate and per-routine consistency over time with visual statistics.

## Installation

1. Open **Settings → Community plugins** in Obsidian
2. Search for **"Daily Routine"**
3. Install and enable the plugin
4. The routine view opens in the sidebar automatically — or run the `Open routine view` command

## Settings

- **Daily routine folder path** — where routine files and daily notes are stored
- **Start of week** — Monday-first or Sunday-first weeks, independent of your Obsidian language
- **Do confirmation when unchecking task** — ask before unchecking a completed task

## Feedback

Found a bug or have an idea? Please [open an issue](https://github.com/sechan100/daily-routine-2/issues) — feedback is always welcome.
