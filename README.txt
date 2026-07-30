HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.2

PURPOSE
Alpha 0.6.2 is a focused interface and calculation update based on Mal's Alpha 0.6.1 testing. It improves Daily Progress, Home, Diary, Food Library, Meal Planner, Shopping List, hydration and five-food-group tracking without yet introducing the much larger food database planned for Alpha 0.6.3.

HOW TO RUN LOCALLY
1. Extract the complete ZIP folder.
2. Open index.html in a current browser.
3. For the best iPhone/iPad trial, publish the complete folder through GitHub Pages or another HTTPS web host.
4. Existing Alpha 0.6.1 profile and functional data are retained when this build uses the same website address and browser storage.
5. Reset Founder Trial is under Settings and should be used only when you deliberately want to erase the saved trial profile on that device.

MAIN ALPHA 0.6.2 CHANGES
- Daily Progress opens first and uses a compact swipeable date card.
- Daily Progress includes nutrients, personalised Australian five-food-group targets, seven-day food-group averages, Hydration, Steps and a compact summary.
- Hydration includes drinks, estimated food moisture and additional unlogged drinks.
- Home has a centred seven-room Companion Circle plus a daily item beneath it.
- Shopping List is a main Circle room.
- Diary uses compact meal sections, swipeable summaries, planned/eaten views and contextual plus / three-dot actions.
- Day Settings save only appears after a change, with protection against losing unsaved changes.
- Meal Planner supports one, several or all selected meals, individual Try Again, Try Again for Selected Meals and protected acceptance into the Diary as Planned.
- Food Library uses a compact Resources-style list with search and clear Saved Foods / My Foods / My Recipes / Saved Meals tabs.

IMPORTANT LIMITATIONS
- The built-in Australian food list remains a small founder-trial sample. It is not a complete food database.
- Food-group and moisture values are present only for the current classified sample foods and recipes made from them. Unknown custom foods remain visibly unclassified rather than being guessed.
- Production food data, barcode coverage and brand variety must be added in verified legal stages with duplicate control, source dates and correction workflows.
- Live barcode lookup, secure cloud accounts, household sync, Apple Health / Health Connect and production AI services require later secure online or native-app development.
- Nutrition, hydration and energy targets are founder-trial planning estimates and are not medical advice. Clinician-set fluid or dietary restrictions always take priority.

FILES
- index.html — screens and controls
- styles.css — responsive layout and visual presentation
- config.js — central app name, version and storage keys
- companions.js — Australian Companion definitions
- app.js — onboarding, profile, recommendations, Home, Settings and migration
- alpha06.js — food diary, library, recipes, planning, hydration, food groups, progress, reports and safeguards
- RELEASE_NOTES_ALPHA_0_6_2.txt — detailed changes
- TESTING_CHECKLIST_ALPHA_0_6_2.txt — suggested founder tests
- assets/companions/ — replaceable prototype portrait assets
- service-worker.js and manifest.webmanifest — installable PWA support
