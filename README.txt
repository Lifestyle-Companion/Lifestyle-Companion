HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.20

PURPOSE
Alpha 0.6.20 is a search-architecture correction build. It keeps the existing Alpha 0.6 founder-trial data model and makes guided food entry the protected first pathway for ordinary Food Library searches.

IMPORTANT UPDATE METHOD
1. Download a Backup from the current build.
2. Replace the COMPLETE deployed folder with Alpha 0.6.20 at the same GitHub Pages address.
3. Do not merge only selected JavaScript files with an older build.
4. Open the site normally and confirm the visible build number is Alpha 0.6.20.

WHY THIS BUILD IS DIFFERENT
A structural fault was found in Alpha 0.6.19: several later founder patches had been appended after the main alpha06.js closure, so those patches could parse but could not access the app's internal functions/state when the browser executed them. This explains why the intended guided-search changes repeatedly appeared not to take effect. Alpha 0.6.20 moves those patches back into the active app scope and adds a final protected guided-search layer.

EXPECTED PIE TEST
Typing Pie should show:
1. Pie, Curry
2. Pie

Choosing Pie, Curry should continue without asking Curry again, then refine filling/protein and source before reaching amount/unit review. Raw AFCD/database rows are secondary and are hidden until Browse database matches is deliberately selected.

DATA CONTINUITY
The browser-storage keys remain unchanged:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

The build retains the 14 Days and 6 Months Weight Trend ranges added in the previous build.
