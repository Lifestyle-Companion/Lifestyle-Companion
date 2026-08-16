HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.27

SEARCH INTELLIGENCE + QUICK FOOD LOG FOUNDATION

Deployment
1. Back up the existing HEC site/data before a major founder-test change.
2. Replace the complete deployed folder with Alpha 0.6.27 at the same GitHub Pages address.
3. Do not mix runtime files from older builds.
4. Wait for the GitHub Pages green tick, then reopen HEC and confirm Alpha 0.6.27 is visible.
5. Existing browser storage keys remain unchanged so founder-test data can migrate in place.

Core Alpha 0.6.27 rules
- Partial text is a search prefix, not automatically a food. HEC predicts likely complete food concepts as the user types.
- A food concept and a branded/commercial product are separate search paths that cooperate rather than compete.
- Source/origin (Home Made/Grown, Commercial/Packaged, Takeaway/Restaurant) is asked early only when it materially narrows the food search.
- Words already typed by the user pre-fill guided attributes and should not be asked again.
- Identical searches keep a stable result order; slower online results may append but must not reshuffle existing choices.
- Guided choices must remain compatible with the final nutrition record. HEC stops rather than borrowing nutrition from an incompatible food.
- Serving measures are food-appropriate and grams/mL remain available where meaningful.
- Quick Food Log is a fast doorway: confirm date/meal, then choose Keyboard, Voice, Barcode or Nutrition Panel. Keyboard/Voice use the same canonical Food Search engine.
- Calories and kilojoules remain paired at food level.

This is still a founder-trial build. Packaged/takeaway coverage depends on the nutrition sources currently loaded. If a current verified nutrition record is unavailable, HEC should say so rather than create a false entry.
