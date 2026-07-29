HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6

PURPOSE
Alpha 0.6 begins the next development phase using the Alpha 0.5 trial as its foundation. It introduces the new Healthy Eating Companion identity, simpler onboarding, the full 16-character Australian Companion roster, transparent energy calculations, stronger food search ranking and calorie-total safeguards.

HOW TO RUN LOCALLY
1. Extract the complete ZIP folder.
2. Open index.html in a current browser.
3. For the best iPhone/iPad trial, publish the complete folder through GitHub Pages or another HTTPS web host.
4. Existing Alpha 0.5 profile, diary, recipe and trial data migrate automatically when the new build uses the same website address and browser storage.
5. Use Reset Trial only when you deliberately want to remove the saved founder-trial profile on that device.

WHAT IS NEW
- App renamed throughout to Healthy Eating Companion.
- New storage keys with automatic Alpha 0.5 migration.
- Onboarding asks only for email, given name and preferred name before the health profile.
- Address and phone fields remain in the data model but are hidden from onboarding.
- Date of birth and energy-unit choice now appear with the health questions that use them.
- Sixteen named Australian Companions with separate data records, personalities, speaking styles, strengths, fasting support and prototype portrait assets.
- Percy the Pelican is the default; every Companion can be selected and changed later.
- Companion portrait shown on the Circle Home screen.
- Voice rate and pitch now vary gently by Companion personality.
- Mifflin–St Jeor calculation breakdown shows resting estimate, activity factor, goal adjustment, minimum check and formula version.
- BMI wording is gentler and presented as one planning estimate rather than a judgement.
- Food search now prioritises exact names, handles word order, supports careful typo matching and excludes low-confidence unrelated matches when a strong match exists.
- Food results identify Verified Product, Verified Food, Australian Trial Record, My Food or My Recipe.
- A diary entry with missing energy cannot be silently logged as zero Calories.
- Add and Mark Eaten confirmations show item Calories and the new daily total.
- Diary calculation status states how many eaten entries were counted and warns about missing energy data.

RETAINED FROM ALPHA 0.5
- Planned versus Eaten food status.
- Normal and flexible fasting-day targets.
- Review before logging; barcode/label/photo trial screens do not auto-add food.
- Custom foods, recipes and saved meals.
- Copy, move, confirmation and Undo patterns.
- Daily progress, weight history, activity, shopping, reports and trial-data download.

IMPORTANT LIMITATIONS
- The built-in Australian food list remains a small founder-trial sample. It is not described as a complete production database.
- Production food data must be added in legal, verified stages with barcode matching, duplicate control, source dates and correction workflows.
- The Alpha 0.6 Companion portraits are replaceable prototype badges. The data model is ready for original illustrated expressions and animation in later builds.
- Secure accounts, password recovery, cloud sync, household invitations, production barcode lookup and moderation require secure online services.
- Full Apple Health or Health Connect integration cannot be provided by an ordinary static browser build alone.
- Nutrition and energy recommendations are founder-trial planning estimates, not medical advice.

FILES
- index.html — screens and controls
- styles.css — responsive layout and visual presentation
- config.js — central app name, version and storage keys
- companions.js — 16 Australian Companion definitions
- app.js — onboarding, profile, recommendations, home, settings and migration
- alpha06.js — food diary, library, recipes, planning, progress, reports and calculation safeguards
- assets/companions/ — replaceable prototype portrait assets
- service-worker.js and manifest.webmanifest — installable PWA support
