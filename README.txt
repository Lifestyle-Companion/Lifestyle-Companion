HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.30

DEPLOYMENT
1. Keep your existing JSON backup safe. A backup made before Alpha 0.6.29 is still a valid recovery point for the saved data it contains.
2. Extract this complete Alpha 0.6.30 folder.
3. Replace the complete deployed HEC folder at the same GitHub Pages address; do not mix runtime files from different Alpha versions.
4. Wait for GitHub Pages to finish publishing.
5. Fully close HEC on the iPhone, reopen it, and confirm the Home badge says Alpha 0.6.30.
6. Check that profile, Diary, weight/history, saved foods/recipes and settings remain present before further testing.

WHAT IS NEW IN ALPHA 0.6.30
Alpha 0.6.30 is deliberately a Stability & Responsiveness build. It keeps the Alpha 0.6.29 Australian Food Entity Registry and food-intelligence work while correcting founder-device regressions that could make typing lag and navigation appear frozen.

Key changes:
- no full localStorage save on every Food Search keystroke;
- 140 ms local-search debounce so typed characters paint before ranking starts;
- repeated registry/query/product calculations are cached rather than recomputed for every food candidate;
- stale delayed searches are invalidated;
- in-flight online product searches are abortable;
- leaving Food Library cancels old search work, including when Home is opened through a normal data-go button;
- online results cannot rerender the hidden Food Library after navigation;
- temporary unsaved online-product cache is capped while saved online foods are retained;
- Alpha 0.6.29 registry, Doritos serving protection and Egg Species -> Part -> Size -> Preparation logic remain in place.

FIRST TEST
Please test stability before food accuracy:
- repeatedly open Home destinations and return Home;
- type egg, Kelloggs, Doritos Cheese Supreme and Woolies multigrain bread quickly;
- change/backspace queries rapidly;
- leave Food Library while an online search is pending;
- confirm Home icons remain responsive and typed characters appear immediately.

DATA STORAGE
Alpha 0.6.30 deliberately retains the same Alpha 0.6 storage keys:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

The app remains a founder-trial static web/PWA prototype. Exact packaged-product nutrition should still be checked against the current package. Camera, OCR, speech recognition, installed-PWA cache replacement and mobile interaction require real-device HTTPS testing.
