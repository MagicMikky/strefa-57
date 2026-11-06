---
name: visual-qa
description: Use when changing visible layout, CSS, pages, or cookie and form interactions for Strefa 29. Runs browser and accessibility checks without claiming WCAG compliance from an unread result.
---

# Visual QA

1. Start the app with `npm run dev` unless a production build is already running.
2. Check the changed flow on desktop and a mobile viewport, including empty, error, and success states when the change touches them.
3. Run `npm run test:e2e`. The saved Playwright tests are the record. A manual browser pass does not replace them.
4. Read axe results. Report serious and critical violations. Do not write that the site meets WCAG 2.2 AA unless an accessibility test was executed and its violations were reviewed.
5. For a CSS move, compare the affected screens before and after. Do not restyle working components only to split a file.
