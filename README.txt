HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.10

PURPOSE
Alpha 0.6.10 is a stabilisation build following founder testing of Alpha 0.6.7. It simplifies everyday Diary entry, improves profile setup and weight-history behaviour, makes the bundled Australian food database much easier to reach, and fixes several mobile usability problems found during real-device testing.

STARTING FRESH OR KEEPING EXISTING DATA
Alpha 0.6.10 deliberately keeps the same two main browser-storage keys used by the Alpha 0.6 family:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

Replacing Alpha 0.6.7 at the SAME GitHub Pages website address does not intentionally clear existing tester records.

For a completely fresh onboarding test on one device:
1. Optional: Settings → Data, Backup & Privacy → Download Backup.
2. Settings → Reset App for Testing.
3. Confirm the reset.
4. The app reloads at the Welcome screen and that device can be set up like a new user.

Reset App for Testing affects only that browser/device. It does not intentionally reset other testers.

MAIN ALPHA 0.6.10 CHANGES

DIARY — ONE SIMPLE RECORDED STATE
- Foods added to the Diary now count immediately.
- Ordinary users no longer have to manage Planned versus Eaten states.
- Individual entries can be edited, copied or deleted later.
- A whole meal can be cleared from the meal menu, with confirmation and an Undo opportunity.
- Future-date planning still works, but the status bookkeeping is kept out of the user’s way.
- Single-meal companion suggestions remain inside the Diary; the separate Meal Planner is retained for multi-meal planning.

FOOD LIBRARY AND FOOD ENTRY
- A new Add Food task starts with a blank search.
- Blank All Resources now exposes familiar starter foods plus a curated selection from the bundled Australian Food Composition Database instead of hiding the AFCD records until a search is typed.
- All 1,588 bundled AFCD Release 3 records remain searchable locally.
- Added everyday aliases and ranking for common terms such as cappuccino, carrot cake, bacon, English muffin, sausages, steak, yoghurt, cheese, potato, pumpkin, bread, juice and soft drink.
- Live search tries to keep the first useful result visible above the iOS keyboard.
- General food, recipe and voice logging no longer silently defaults to Breakfast or Dinner. A meal must be chosen unless the user started the action from a specific Diary meal.
- Voice/text matching preserves the complete recognised phrase. A phrase such as “carrot cake” should not silently collapse into a plain carrot match.

PROFILE AND ONBOARDING
- When Australia is selected, State Or Territory is a selectable list rather than a free-text field.
- Australian postcode/state combinations receive a plausibility check.
- Australian home time zones are suggested from the selected state/territory and daylight-saving behaviour remains time-zone based.
- “Sex Used For Energy Calculation” remains the calculation field, with a clearer explanation of why it is requested.
- Section headings and major labels have a stronger visual hierarchy and use consistent Title Case.
- Companion cards now open an immediate companion preview so the user does not have to scroll below the full list to read the description.

YOUR RECOMMENDATIONS
- Daily Fluids remains visible as a core target.
- Detailed Nutrition Goals is collapsed by default and can be expanded by users who want the finer nutrient targets.

WEIGHT AND PROGRESS
- Saving an unchanged Weight Check-In is protected against duplicates.
- After a successful save, the button changes to Saved ✓ until the entry is changed.
- Entering a different weight on a date that already exists prompts before replacing it.
- Routine spoken confirmation is shortened to “Weight and date saved.”
- Progress History uses the Weight Check-In history as its source and renders a visible, tightly scaled weight-trend chart with Australian-friendly date labels.
- The history summary distinguishes Food Diary Days, Weight Check-Ins and Activities.

HYDRATION
- The old bare “Additional Drinks” volume field has been replaced with Add A Drink.
- Water and Zero-Calorie Drink can be quick-added to hydration.
- Milk, juice, tea/coffee, soft drink, cordial, smoothies, soup/broth and Other direct the user to choose the exact food/drink so nutrition as well as fluid can be recorded.
- Daily Fluid Target remains separately visible and adjustable.

FOOD DATA IN THIS BUILD
- Australian Food Composition Database Release 3: 1,588 bundled local records.
- Existing Australian trial/generic foods and user-created foods.
- Existing Open Food Facts and USDA online-search prototypes where internet access is available.

IMPORTANT FOOD-DATA NOTE
The larger local AFCD library is intended to make founder testing much more practical, but reference foods are not the same as a current branded package label. Packaged foods should ultimately be verified against their current label. Barcode lookup and nutrition-panel recognition remain prototype features and are intended to be the next major testing focus after Alpha 0.6.10 stabilisation.

HOW TO PUBLISH
1. Download a backup first if existing test data matters.
2. Unzip this package.
3. Replace the existing GitHub Pages repository files with the complete Alpha 0.6.10 contents.
4. Commit/publish the changed files.
5. Open the normal site address and confirm “Alpha 0.6.10” appears.
6. If the old version is cached, refresh/reopen Safari or the installed web app.

FOUNDER-TRIAL LIMITATIONS
- This remains a static GitHub Pages founder trial.
- Data is primarily stored in the browser on each device.
- Secure cross-device accounts, central invitations, central analytics and central feedback require a protected backend in a later phase.
- Real-device camera, speech, barcode and OCR behaviour still needs device testing.
- Nutrition calculations and food suggestions are for product development/testing and are not medical advice.
