HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.25
CONDITIONAL BRANCHING + MATCH VALIDATION

PRIMARY DOCUMENTS
- RELEASE_NOTES_ALPHA_0_6_25.txt
- TESTING_CHECKLIST_ALPHA_0_6_25.txt
- HEC_ALPHA_0_6_25_BUILD_AND_TEST_REPORT.md
- HEC_ALPHA_0_6_24_BUILD_AND_TEST_REPORT.md (previous serving-foundation report)
- HEC_ALPHA_0_6_23_BUILD_AND_TEST_REPORT.md (previous universal-search report)

DEPLOYMENT
1. Back up the current HEC data if desired.
2. Replace the COMPLETE deployed folder with Alpha 0.6.25 at the same GitHub Pages address.
3. Do not mix Alpha 0.6.25 runtime files with older builds.
4. Open the site normally and confirm the visible build number is Alpha 0.6.25.
5. If a device appears to show the older build, close/reopen the Home Screen app and refresh once so the new service-worker cache is installed.

GITHUB BROWSER UPLOAD
This project contains more than 100 files. If using GitHub's browser uploader, upload the root files first and the assets folder as a second commit, as done for Alpha 0.6.24. Wait for the final deployment green tick before device testing.

DATA CONTINUITY
This build retains the existing browser storage keys:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

FOUNDER TESTING PRIORITY
Do not spend time on cosmetic testing yet. First prove the complete search flow:
query identity -> conditional refinement -> compatible nutrition reference -> defensible serving/measure -> Cal + kJ review -> Diary add.

The key Alpha 0.6.25 rule is that every answer must narrow later choices and the final nutrition record. If the complete intent cannot be supported by one record, HEC must stop rather than silently substitute a contradictory food.
