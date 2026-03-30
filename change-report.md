# Essential Assignment Tracker Change Report

## 1. Scope and Intent

This report summarizes all major changes from Part 1 to the current state, with commentary on technical and UX impact.

Primary goals covered:
- Replace dark mode button visuals using local icon assets.
- Fix theme inconsistency and remove duplicated logic.
- Improve notes readability and structure.
- Clean and consolidate repeated scripts/styles.
- Add and polish a live header time/date display.

## 2. Chronological Change Log with Commentary

### 2.1 Icon discovery and replacement

What changed:
- Verified icon availability in the project.
- Replaced inline SVG sun/moon dark mode icons with image assets from the Icons folder.

Pages updated:
- `add-Assignment.html`
- `overview.html`
- `About.html`
- `dashboard.html`

Commentary:
- This reduced inline duplication and made visual asset updates easier.
- Existing behavior stayed stable because icon IDs were preserved.

### 2.2 Dark mode icon size update

What changed:
- Increased icon size for better visibility and balance.

Commentary:
- Small UI tweak with immediate usability improvement.

### 2.3 Dashboard theme consistency fix

Issue:
- Dashboard text could remain gray after theme toggle until refresh.

What changed:
- Removed conflicting page-level theme script from dashboard.
- Continued with shared theme handling from common nav logic.

Files:
- `dashboard.html`
- `js/shared-nav.js`

Commentary:
- Eliminated duplicate state handling.
- Improved runtime consistency and reduced refresh dependency.

### 2.4 Notes formatting upgrade on dashboard

What changed:
- Notes now render as a numbered list under the Note label.
- Added formatting/sanitization behavior.
- Added typography refinements for note entries.

Files:
- `dashboard.html`
- `css/dashboard.css`

Commentary:
- Notes became easier to scan and interpret.
- Structured output replaced free-form visual clutter.

### 2.5 Typography and style refinements for notes

What changed:
- Applied improved font styling.
- Reduced entered-note font size.
- Applied italics to note entries.
- Added capitalization normalization behavior.

Commentary:
- Increased visual consistency and readability quality.

### 2.6 Overview parity for notes

What changed:
- Mirrored dashboard note rendering and styling behavior in overview.

Files:
- `overview.html`
- `css/overview.css`

Commentary:
- Maintained cross-page behavior parity for the same data.

### 2.7 Duplication sweep and consolidation

What changed:
- Removed duplicated scripts for theme/hint handling on page level.
- Centralized hint behavior in shared JS.
- Removed repeated CSS blocks and moved shared nav/theme styles into shared CSS.

Key files:
- `add-Assignment.html`
- `overview.html`
- `About.html`
- `dashboard.html`
- `js/shared-nav.js`
- `css/shared-nav.css`
- `css/add-Assignment.css`
- `css/overview.css`
- `css/dashboard.css`
- `css/about.css`

Commentary:
- Highest-value maintainability improvement in this cycle.
- Reduced regression risk from file-to-file drift.

### 2.8 Backup/export safety check and stale include cleanup

What changed:
- Verified backup/import/export flow remains intact after refactor.
- Removed stale script include and corrected outdated About-page comment.

File:
- `About.html`

Commentary:
- Good safety pass after broad consolidation.
- Prevented confusion from dead references.

### 2.9 Header live date/time widget and iterative polish

What changed:
- Added shared live time/date in header title area.
- Iteratively refined:
  - position (right side/end of title row)
  - background removal
  - multiple pixel-level alignment nudges
  - countdown-inspired visual direction experimentation
  - seconds-only animation behavior
  - animation timing/easing polish
  - increased date size

Files:
- `js/shared-nav.js`
- `css/shared-nav.css`

Commentary:
- Strong iterative design pass driven by real-time feedback.
- Final result balances motion with clarity.

## 3. File-by-File Impact Summary

Shared behavior core:
- `js/shared-nav.js`: centralized theme/menu/hint/backup logic and live header date-time functionality.
- `css/shared-nav.css`: centralized shared nav/theme styles and date-time visuals/animation.

Page templates:
- `dashboard.html`
- `overview.html`
- `add-Assignment.html`
- `About.html`

Page styles:
- `css/dashboard.css`
- `css/overview.css`
- `css/add-Assignment.css`
- `css/about.css`

Assets:
- `Icons/day.png`
- `Icons/night.png`

## 4. Commentary on Technical Direction

Most impactful engineering decision:
- Centralizing repeated behavior into shared JS/CSS and removing page-level duplicates.

Most visible UX improvements:
- Clearer dark mode controls.
- Better note formatting/readability.
- Polished, informative header date/time.

Most risk reduction:
- Theme logic deduplication and stale include cleanup.

## 5. Current End State

As of this report:
- Theme behavior is stable and centralized.
- Notes are consistently formatted in dashboard and overview.
- Shared header date/time is implemented and polished with seconds-only animation.
- Duplicate code was significantly reduced across HTML/CSS/JS.

## 6. Recommendation for Next Phase

Optional next cleanup targets:
- Move remaining inline styles into reusable CSS classes.
- Continue consolidating any residual repeated body-level dark-mode rules if still present.
- Add a brief changelog section per release to preserve this history incrementally.
