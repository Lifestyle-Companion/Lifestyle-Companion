HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.32

DEPLOYMENT
1. Keep your latest JSON backup safe before replacing the current build.
2. Extract/upload the COMPLETE Alpha 0.6.32 folder, or upload the supplied changed-files-only package over Alpha 0.6.31.
3. Keep the same GitHub Pages website address and do not mix runtime files from different Alpha versions.
4. Wait for GitHub Pages to finish publishing.
5. Fully close HEC on the iPhone and reopen it. Confirm the Home badge says Alpha 0.6.32.
6. Confirm profile, Diary, weight/history, saved foods/recipes and settings are still present before further testing.

WHAT IS NEW IN ALPHA 0.6.32
Alpha 0.6.32 is a search/catalogue, diary planning, scanner-basis and startup-reliability consolidation build.

Main changes:
- faster local search settling and earlier online lookup, with clearer progress wording;
- much broader Australian KFC, McDonald’s/Maccas and Hungry Jack’s menu snapshots, grouped by menu category;
- missing chain nutrition still stops safely rather than creating a false 0-Cal entry;
- Recent Meal copying now respects the meal the user deliberately selected instead of a stale Breakfast/Lunch/Dinner add context;
- whole-meal Copy and Move controls, including copy to multiple future dates and Same Weekday x4;
- individual diary foods can be moved to another date and meal;
- Open Food Facts serving-basis coherence checks prevent a per-serving energy value being combined with per-100-g macros;
- improved Nutrition Panel preprocessing for dark/coloured labels and low-contrast panels;
- barcode/OCR libraries now load only when scanning is actually used, reducing normal app-start dependency on external libraries;
- service-worker startup is cache-first where appropriate, with a short navigation timeout and parallel cache refresh to reduce blank/slow launches;
- existing brand/product identity, serving and guided-search improvements from Alpha 0.6.31 are retained.

IMPORTANT ABOUT LARGE RETAILER / CHAIN CATALOGUES
Alpha 0.6.32 adds a stronger catalogue architecture and broad current menu snapshots for KFC, McDonald’s and Hungry Jack’s. A static founder build cannot honestly guarantee that every chain or supermarket product remains complete every day as menus and supermarket ranges change. HEC therefore keeps source verification separate from discovery and refuses to invent nutrition for catalogue items that do not yet have verified values. The same architecture is intended for continuing expansion to other Australian chains and retailers.

DATA STORAGE
Alpha 0.6.32 deliberately retains the same Alpha 0.6 storage keys:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

The app remains a founder-trial static web/PWA prototype. Current package nutrition remains the preferred authority for packaged food. Camera, OCR, installed-PWA cache replacement and real iPhone interaction still require final device testing.
