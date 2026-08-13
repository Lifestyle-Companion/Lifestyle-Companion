HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.12

PURPOSE
Alpha 0.6.12 is the next founder-testing build after Alpha 0.6.11. It focuses on reliable everyday use: persistence guidance, a polished weight trend, natural serving units, editable voice quantities, better search ranking, profile-aware meal suggestions, package verification, sharing and duplicate-entry protection.

DATA CONTINUITY
Alpha 0.6.12 keeps the existing Alpha 0.6 browser-storage keys:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

Publishing the complete build at the same GitHub Pages address is intended to retain existing profile, Diary, recipes, favourites, weight history, Shopping List and other founder-test data in a normal browser storage context.

IMPORTANT: SAFARI PRIVATE BROWSING
Safari Private Browsing can delete website storage when private tabs are closed. A website cannot override that privacy behaviour. For persistence testing, use a normal Safari tab or install/open the Companion from the Home Screen. Alpha 0.6.12 also maintains a second local IndexedDB mirror when the browser permits it.

HIGHLIGHTS
- Weight Trend is now a responsive line graph with dots for each weigh-in.
- Starting Weight migration is repaired and Change Since Start uses the earliest valid record.
- Daily Progress removes Recorded/Open Meal badges.
- Search ranking favours true food identity, Australian matches and saved/verified foods.
- Cappucino/Capuccino searches are normalised to Cappuccino.
- Context-aware units add natural measures such as Bar, Sachet, Tub, Bottle and whole-item measures where appropriate.
- Voice/Text review includes editable Amount and Unit fields.
- Stored allergies, intolerances, eating pattern and love/like/dislike/never-eat preferences are used more directly by suggestion filtering/ranking.
- Barcode foods can be compared with a Nutrition Panel before choosing which values to retain.
- Saved packaged foods can remember when they were last checked and occasionally invite the user to review older records.
- Foods, saved meals and recipes can be shared as portable Companion files.
- A full Companion device-copy file can be shared/restored manually.
- Completed Add To Diary transactions cannot be accidentally submitted again by navigating Back.

AUTOMATIC IPHONE/IPAD SYNC
True live cross-device sync is not simulated in this static build. It requires a secure authenticated cloud service. Alpha 0.6.12 supplies manual full-device transfer and preserves the future connection architecture for that later service.

HOW TO PUBLISH
1. If existing data matters, use Download Backup first.
2. Unzip this package.
3. Replace the existing GitHub Pages repository files with the COMPLETE Alpha 0.6.12 contents.
4. Commit/publish all changed files.
5. Open the normal site address (not Private Browsing) and confirm Alpha 0.6.12 appears.
6. Safari may refresh once when the new service worker takes control.

FOUNDER-TRIAL LIMITATIONS
- Secure accounts and true automatic cross-device sync still require a protected backend.
- Camera/barcode, Web Share/AirDrop, speech and nutrition-panel OCR require real-device testing after deployment.
- Online product records can be incomplete or outdated and should be checked against the package.
- Allergy/dietary suggestion filtering remains a founder-trial aid and is not a clinical safety guarantee.
- Nutrition calculations and suggestions remain product-development features, not medical advice.

Alpha 0.6.18: focused food-capture, weight-date, planner, progress-language and Companion/Home-circle polish build. See RELEASE_NOTES_ALPHA_0_6_14.txt and TESTING_CHECKLIST_ALPHA_0_6_14.txt.
