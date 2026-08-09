# Play Store listing

Copy for `com.moizit.dhikrtracker`, which already has **v1.0.1 live**. This is a
revision of an existing listing, not a first submission — so the screenshots
need recapturing against the current build, and the description needs to match
what the app now does.

Everything here is claim-checked: nothing below says anything the app does not
do, and nothing promises a religious benefit.

---

## Title (30 characters max)

```
Tasbeeh — Dhikr & Du'a
```
22 characters. The em dash renders fine; if Play rejects it, `Tasbeeh: Dhikr & Du'a` is 21.

## Short description (80 characters max)

```
Dhikr counter and du'a collection. Free forever, works offline, no tracking.
```
75 characters. The three claims after the first are the differentiators, and all
three are literally true — there is no paid tier, no network dependency after
first load, and no analytics of any kind in the source.

## Full description (4000 characters max)

```
A calm place to count your dhikr and read du'a.

Tasbeeh keeps a simple after-salah routine, a searchable collection of du'as
with their sources, and the ninety-nine names of Allah — all on your own
device, all working with no internet.

WHAT IT DOES

• Count dhikr with one tap, with a target you set. Suggested targets are odd
  numbers — 3, 7, 11, 33, 101, 999.
• An after-salah routine ready to use, and a reset when you begin a new salah.
• Over 70 du'as, each with its Arabic, its meaning, and the hadith or verse it
  comes from.
• The ninety-nine names, read one at a time — tap to move to the next.
• Whatever fits the moment on the home screen: morning and evening remembrance,
  du'a before sleep, salawat on Friday, and du'as for Ramadan, the last ten
  nights, Eid and the Day of Arafah.
• A hadith and a question to reflect on, changing daily.
• Focus mode for reciting without distraction, with the screen kept awake.
• Save what you return to, into collections you name yourself.
• Add your own du'as, or download a full surah to read.
• A quiet record of what you have recited — totals and a calendar, with no
  streaks to break.
• Eight themes including a light one, adjustable Arabic and Latin text size,
  and line spacing.
• English and বাংলা.

WHAT IT DOES NOT DO

• No adverts.
• No payments, no subscription, no "pro" version.
• No account, no sign-in.
• No analytics, no tracking, no data leaving your device.
• No notifications you did not ask for.

Your counts and settings are stored only on your phone. There is no server to
send them to. You can export a backup file at any time and restore it on a new
device.

OPEN SOURCE

The app is free software under the GPL-3.0 licence, and the full source is
public. Anyone can read it, check what it does with their data, correct a
translation, or report a mistake in the text.

A NOTE ON THE CONTENT

Du'as carry the collection and number they come from, so anything can be
checked. Where a narration is not from the strongest collections, or is the
practice of a companion rather than a saying of the Prophet ﷺ, the app says so
rather than leaving the impression of more. Please verify detailed religious
matters with trusted scholars.

Built to be used, not monetised. If it benefits you, keep its makers in your
du'a.
```

## Screenshots to capture

At least 2, up to 8, minimum 320px on the short side. Capture on a phone
viewport (390×844), light theme and dark theme mixed, **with realistic data —
never an empty state**:

1. Home with the "right now" strip, the routine, and a count in progress
2. A du'a open in Focus Mode, Arabic clearly readable
3. Browse by category grid
4. The ninety-nine names, list view
5. The record — totals and calendar
6. Settings showing the themes and text-size controls

Generate with `npm run shots` once that script exists, so they can be recaptured
after any UI change instead of drifting out of date.

## Feature graphic

`docs/feature-graphic.png`, 1024×500. Regenerate with `npm run images`.

## App icon

512×512 — the existing `public/icon-512.png`.

## Category and tags

- Category: **Lifestyle**
- Tags: dhikr, tasbeeh, zikr, dua, islam, muslim, prayer, quran

## Data safety declaration

Answer **no data collected** — and it is worth being exact about why, since Play
audits this:

- No data is transmitted off the device by the app.
- Counts, settings and saved items live in local storage only.
- The one network request is to `api.alquran.cloud`, made **only** when the user
  chooses to download a surah, and it sends no personal data.
- No advertising or analytics SDKs are present.

## Content rating

Questionnaire answers: no violence, no sexual content, no profanity, no
controlled substances, no gambling, no user-to-user communication, no location
sharing, no personal information collected. Expected rating: **Everyone**.

## Before uploading

- The **versionCode must be higher than the live v1.0.1 build**. Play rejects
  anything equal or lower, and it cannot be reset — check the current number in
  Play Console first.
- Confirm whether Play App Signing is enabled. If it is, the local keystore is
  only the upload key and Google can reset it; if not, that keystore is the
  signing key and losing it means never updating this app again.
- The privacy policy URL must be reachable: `/privacy.html` on the site.
