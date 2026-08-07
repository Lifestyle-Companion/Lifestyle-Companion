HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.7

PURPOSE
Alpha 0.6.7 follows Alpha 0.6.6 and focuses on a Diary-first redesign. The Diary is now the main place to build a day, add foods, ask the companion for a single meal suggestion and confirm what was actually eaten. The separate Meal Planner remains for bulk planning several meals.

IMPORTANT — KEEPING EXISTING TEST DATA
Alpha 0.6.7 deliberately keeps the same browser-storage keys used by the Alpha 0.6 family:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

When Alpha 0.6.7 replaces Alpha 0.6.6 at the SAME GitHub Pages website address, in the SAME browser and on the SAME device, existing profiles, Diary records, plans, recipes, favourites, weight history, Shopping Lists and other trial records are designed to migrate forward rather than being intentionally deleted.

Browser data can still be lost if a tester clears Safari/website data, uses Private Browsing, changes to a different site address, changes browser/device, or removes the site's stored data. Use Settings > Data, Backup & Privacy > Download Backup before publishing a new build.

MAIN ALPHA 0.6.7 CHANGES
- Diary rebuilt around compact grouped meal sections.
- Add Food and Suggest are available directly in each meal.
- Single-meal companion suggestions use optional quick questions and stay inside the Diary.
- Planned/Eaten confirmation is simplified; Ate as Planned can confirm a planned meal quickly.
- Detailed Day Type/Energy controls are collapsed behind Edit Day.
- Separate Meal Planner is retained for bulk/multi-meal planning.
- Normal Day target integrity repaired: use the current accepted profile recommendation, never a silent stale 2,000 Cal fallback.
- Flexible Fasting Day keeps a separate target and switching Day Type previews the correct value immediately.
- Fasting multi-meal planning has a hard whole-day cap and accounts for foods already Eaten or Planned.
- Normal Day bulk planning reserves room for unticked meal occasions; Fasting Day treats unticked meal occasions as skipped.
- New Add Food tasks start with a blank Food Library search.
- Local and online Food Library results no longer overwrite one another when changing tabs.
- Common close spellings receive useful local matches; irrelevant online results are suppressed.
- Historical weight edits no longer replace the newest current weight.
- Weight history uses friendly Australian dates and a compact recent-history presentation.
- Settings hides phone/address fields that setup never requested and labels the visible region information as Location.
- The 1,588-food Australian Food Composition Database Release 3 local search dataset from Alpha 0.6.6 remains included.

AUSTRALIAN FOOD DATA
The bundled local dataset is derived from Australian Food Composition Database Release 3, published by Food Standards Australia New Zealand (FSANZ), and contains 1,588 foods. See AFCD_DATA_NOTICE_ALPHA_0_6_7.txt for attribution, licence information and limitations.

CURRENT STATIC-TRIAL LIMITATIONS
- Packaged brands still depend on online databases/barcode sources and current product labels.
- Food-group mapping for imported AFCD foods remains a founder-trial approximation in some cases.
- Voice recognition itself is supplied by the browser/device; the app can improve interpretation after recognition but cannot control the initial transcript.
- Invitations, cross-device analytics and feedback remain limited by the static GitHub Pages architecture.
- Camera scanning, barcode services, OCR and speech input still require real-device HTTPS testing.

HOW TO PUBLISH
1. In Alpha 0.6.6, download a backup first.
2. Download and unzip the Alpha 0.6.7 package.
3. Replace the existing repository files with the complete Alpha 0.6.7 contents.
4. Keep the existing repository/site address unchanged.
5. Wait for GitHub Pages to publish.
6. Open the normal site address and confirm Alpha 0.6.7 appears.
7. Do not clear Safari or website data during the update.

See RELEASE_NOTES_ALPHA_0_6_7.txt and TESTING_CHECKLIST_ALPHA_0_6_7.txt for more detail.
