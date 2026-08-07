HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.6

PURPOSE
Alpha 0.6.6 is the next small-step family-testing build following Alpha 0.6.5. It focuses on making food search and Diary testing substantially more useful, repairing Normal/Fasting Day energy handling, improving companion meal planning, and refining Shopping List behaviour.

IMPORTANT — KEEPING EXISTING TEST DATA
Alpha 0.6.6 deliberately keeps the same browser-storage keys used by Alpha 0.6.5 and earlier Alpha 0.6 builds:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

When Alpha 0.6.6 replaces Alpha 0.6.5 at the SAME GitHub Pages website address, in the SAME browser and on the SAME device, existing profiles, diary records, plans, recipes, favourites, weight history, Shopping Lists and other trial records are designed to migrate forward rather than being intentionally deleted.

Browser data can still be lost if a tester clears Safari/website data, uses Private Browsing, changes to a different site address, changes browser/device, or removes the site's stored data. Use Settings > Data, Backup & Privacy > Download Backup before publishing a new build.

MAIN ALPHA 0.6.6 CHANGES
- Repaired the stale Normal-Day target problem. A Normal Day now uses the profile recommendation unless the user deliberately enables a date-specific custom target.
- Normal and Fasting targets are kept separate. Switching Day Type updates the displayed target and explanation immediately.
- Day-energy labels now follow the selected date rather than always saying Today.
- Exercise-credit wording in Health Profile setup is clearer about whether separately logged exercise should increase the food-energy allowance.
- Added the local Australian Food Composition Database Release 3 dataset: 1,588 Australian food records with core nutrition values for much broader Diary and recipe testing.
- Australian guided foods and exact Australian matches rank ahead of international online results.
- Food Library searches start blank for each new add/replacement flow, while Back within the same active task can preserve the search.
- Food Library now offers a contextual Suggest Breakfast / Suggest Lunch / Suggest Dinner etc action when adding to a particular meal.
- Meal Planner opens new planning sessions with meal checkboxes cleared.
- Accepted planning controls disappear once the selected planning task is complete; View Day Plan, Undo and Plan More Meals remain where appropriate.
- Meal planning now accounts for everything already Eaten or Planned before calculating the remaining allowance.
- On Normal Days, the planner keeps a sensible reserve for unticked meal occasions.
- On Fasting Days, unticked meals are treated as intentionally skipped; the fasting allowance is divided only across selected meal occasions.
- Added smaller fasting-friendly meal suggestions and safeguards so the companion does not force another meal when too little energy remains.
- Planner scoring now considers earlier companion suggestions in the same planning session so whole-day food-group/nutrient balance improves rather than every meal chasing the same gap.
- Revised displayed macronutrient targets to avoid the previously excessive protein share.
- Fibre is treated as a minimum target rather than a problem when exceeded.
- Total Sugars is informational. Free Sugars is shown separately when the underlying food data supports it.
- Shopping List Add/Speak controls stay available via a sticky quick bar.
- Shopping voice review uses an Australian grocery vocabulary to improve interpretation of common terms such as SAO Biscuits and Shredded Cheese after speech recognition.
- Shopping categories were expanded and obvious items are reclassified automatically.
- Added Select All / Deselect All and Clear Entire List controls.
- Shared and printable Shopping Lists are grouped under category headings rather than repeating Other on every line.

AUSTRALIAN FOOD DATA
Alpha 0.6.6 includes a compact local dataset derived from Australian Food Composition Database Release 3, published by Food Standards Australia New Zealand (FSANZ). It contains 1,588 foods. See AFCD_DATA_NOTICE_ALPHA_0_6_6.txt for attribution, licence information and important data limitations.

The local AFCD records are primarily reference values per 100 g. Healthy Eating Companion's own guided records continue to provide friendlier measures such as rashers, slices and item sizes where available. Broader food-specific household measures are a future refinement.

CURRENT STATIC-TRIAL LIMITATIONS
- AFCD data greatly improves generic Australian food coverage, but packaged brands still depend on online databases/barcode sources and current product labels.
- Food-group serve estimates for imported AFCD foods remain provisional in this founder build; detailed Australian Dietary Guidelines mapping can be strengthened later.
- Voice recognition itself is supplied by the browser/device. Alpha 0.6.6 improves post-recognition interpretation but cannot control what Apple's or another device's speech service initially hears.
- Invitations, local analytics and feedback collection remain static-browser prototypes until a protected backend is introduced.
- Camera scanning, barcode services, OCR and speech input still require real-device/HTTPS testing.

HOW TO PUBLISH
1. Download and unzip the Alpha 0.6.6 package.
2. In the existing GitHub Pages repository, replace the Alpha 0.6.5 files with the complete Alpha 0.6.6 contents.
3. Keep the existing repository/site address unchanged.
4. Wait for GitHub Pages to finish publishing.
5. Open the normal site address and confirm Alpha 0.6.6 appears.
6. Do not clear Safari or website data during the update.

HOW TO RUN LOCALLY
Serve the complete folder from a web server. HTTPS is recommended and is normally required for camera and some speech/scanning features.

See RELEASE_NOTES_ALPHA_0_6_6.txt and TESTING_CHECKLIST_ALPHA_0_6_6.txt.
