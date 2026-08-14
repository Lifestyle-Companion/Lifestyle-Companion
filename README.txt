HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.24

PRIMARY DOCUMENTS
- RELEASE_NOTES_ALPHA_0_6_24.txt
- TESTING_CHECKLIST_ALPHA_0_6_24.txt
- HEC_ALPHA_0_6_24_BUILD_AND_TEST_REPORT.md
- SERVING_FOUNDATION_REGRESSION_RESULTS_ALPHA_0_6_24.txt
- HEC_ALPHA_0_6_23_BUILD_AND_TEST_REPORT.md (previous search-foundation report)

DEPLOYMENT
1. Back up the current HEC data if desired.
2. Replace the COMPLETE deployed folder with Alpha 0.6.24 at the same GitHub Pages address.
3. Do not mix Alpha 0.6.24 files with older builds.
4. Open the site normally and confirm the visible build number is Alpha 0.6.24.
5. If a device appears to show the older build, close/reopen the Home Screen app and refresh once so the new service-worker cache is installed.

DATA CONTINUITY
This build retains the existing browser storage keys:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

FOUNDER TESTING PRIORITY
Do not spend time on cosmetic testing yet. First prove the complete food-entry foundation:
search identity -> progressive refinement -> defensible serving/measure -> Cal + kJ review -> Diary add.
