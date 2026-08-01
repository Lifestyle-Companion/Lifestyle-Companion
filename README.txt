HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.5

PURPOSE
Alpha 0.6.5 refines the Alpha 0.6.3 family-testing feedback supplied by Mal, Tracey, Shelly and Corey. It is a self-contained static web-app trial for publishing to the existing Healthy Eating Companion GitHub Pages address.

IMPORTANT — KEEPING EXISTING TEST DATA
Alpha 0.6.5 deliberately keeps the same browser-storage keys used by Alpha 0.6.3:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

When Alpha 0.6.5 replaces Alpha 0.6.4 at the SAME GitHub Pages website address, in the SAME browser and on the SAME device, the existing profile, diary, plans, recipes, Shopping List and other trial records should migrate forward rather than being intentionally deleted.

Browser data can still be lost if a tester clears Safari/website data, uses Private Browsing, changes to a different GitHub Pages address, changes browser/device, or removes the site’s stored data. Use Settings > Data, Backup & Privacy > Download Backup before major testing changes.

MAIN ALPHA 0.6.5 CHANGES
- Local Australian day/date handling replaces UTC-derived “today”.
- Optional country, state/province, postcode and IANA time-zone fields, with automatic daylight-saving rules and travel time-zone choices.
- Surname added to profile setup; additional contact/address fields remain reserved but hidden.
- Home summary uses Current Weight, Goal Weight and Daily Energy Target, and shows the last weight-entry date.
- Companion message card supports Tips, Quotes, Jokes, Did You Know?, Encouragement and Mix Them Up; tap for another item.
- Energy-calculation details are collapsed behind a question-mark help control.
- Goal-type changes no longer validate against an incompatible old goal weight; maintenance weight retains one decimal place where appropriate.
- Opening Diary, Daily Progress, Meal Planner or Food Library from Home resets the relevant date/context to Today; dated links retain their requested date.
- Applicable screens now provide separate Back and Home controls.
- Daily Progress displays named planned foods with Mark Eaten, Change, Replace, Move and Skip actions.
- Daily fluid target is editable and defaults to the profile reference (2,600 mL for the adult-male trial example).
- Food Library tab state is protected from delayed online searches.
- Saved Foods renamed Favourite Foods; My Foods renamed Foods I Created.
- Clear context changed to a clearly labelled Cancel Adding action.
- Floating action changed to Create or Scan and closes when an option, another tab, Back/Home or outside area is selected.
- Recipe builder now searches ingredients, supports missing/custom or scanned ingredients, uses food-specific measures, calculates total and per-serving nutrition, preserves draft fields, and allows recipes to be starred into Favourite Foods.
- Additional trial foods and measures support the Bacon, Egg and Cheese Muffin workflow, sausages and steaks.
- Structured Send Feedback form added.
- Optional local anonymous feature-use counts and a PIN-protected Founder Trial Tools area added.
- Founder can generate up to 10 local invitation links.
- Reset App for Testing and Leave Healthy Eating Companion options added.
- Complete data backup and restore added.

FOUNDER TRIAL TOOLS
The founder button is deliberately hidden from ordinary testers. After publishing, Mal can enable it on his own installation by opening the normal app address once with:
?founder=1

Example only:
https://YOUR-GITHUB-PAGES-ADDRESS/index.html?founder=1

The app then stores Founder mode on that browser. The first visit to Founder Trial Tools asks Mal to set a six-digit local PIN.

CURRENT STATIC-TRIAL LIMITATIONS
- Invitation slots and invitation records are held on Mal’s browser only. They are not centrally enforced across devices.
- Anonymous usage counts are held on each tester’s device. They are not yet automatically combined into one founder dashboard.
- Feedback is stored locally and then handed to Share/Copy or the tester’s email app. It is not sent to a central server automatically.
- “Leave Healthy Eating Companion” removes the local registration/profile and app data from that browser. There is no central account server to deregister from in this static trial.
- Secure central invitations, analytics, feedback collection and true account deletion require a protected backend service in a future development phase.
- Online food data, barcode services and OCR require internet access and real-device testing.

HOW TO PUBLISH
1. Download and unzip the Alpha 0.6.5 package.
2. Replace the files in the existing GitHub Pages repository with the complete contents of the Alpha 0.6.5 folder.
3. Keep the existing repository/site address unchanged to preserve browser data.
4. Wait for GitHub Pages to finish publishing.
5. Open the normal site address and confirm Alpha 0.6.5 appears.
6. Do not clear Safari or website data during the update.

HOW TO RUN LOCALLY
Extract the folder and open index.html, or serve the complete folder from an HTTPS-capable web server. Camera access normally requires HTTPS.


See RELEASE_NOTES_ALPHA_0_6_5.txt and TESTING_CHECKLIST_ALPHA_0_6_5.txt for this build.
