HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.11

PURPOSE
Alpha 0.6.11 is the repair/stabilisation build created after founder testing of Alpha 0.6.10. It concentrates on the weight graph and weight-entry checks, the agreed five-meal Diary structure, a less cluttered Food Library, and a direct barcode-scanning workflow.

DATA CONTINUITY
Alpha 0.6.11 keeps the existing Alpha 0.6 browser-storage keys:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

Publishing the complete build at the same GitHub Pages address is intended to retain existing profile, Diary, recipes, favourites, weight history, Shopping List and other founder-test data. Reset App for Testing should only be used when deliberately starting over.

IMPORTANT ALPHA 0.6.11 CHANGES
- Diary meal categories are Breakfast, Lunch, Dinner, Snacks and Other only. Legacy Morning Tea and Afternoon Tea entries migrate to Snacks.
- Local app files are versioned and the service worker now refreshes app-shell files network-first to reduce mixed-version/stale-cache behaviour after deployment.
- Weight Check-In shows Today / Yesterday / Tomorrow with the full date.
- Weight displays use one decimal place.
- A weight more than 2.0 kg from the nearest relevant record produces a clear confirmation showing both weights, the date and exact difference.
- Change Since Start follows the actual Starting Weight record even if older historical weights are entered later.
- Progress History has a mobile-safe Weight Trend plus a visible value/date fallback.
- Food Library removes the duplicate Suggest Meal and Cancel Adding controls from the add-food context.
- Scan Barcode and Read Nutrition Panel sit immediately below food search.
- The visible Open Australian AFCD link is removed from the everyday Food Library. Data-source details remain available elsewhere in the app.
- Scan Barcode opens Barcode mode directly and starts live in-page scanning. The normal barcode path does not require choosing a file or taking a still photo.
- Live barcode scanning tries native BarcodeDetector first and ZXing second; manual barcode entry remains the fallback.

HOW TO PUBLISH
1. Download a backup first if the existing founder-test data matters.
2. Unzip this package.
3. Replace the existing GitHub Pages repository files with the COMPLETE Alpha 0.6.11 contents.
4. Commit/publish the changed files.
5. Open the normal site address and confirm Alpha 0.6.11 appears.
6. Because this build deliberately changes cache behaviour, Safari may refresh once automatically when the new service worker takes control.

FOUNDER-TRIAL LIMITATIONS
- This remains a static GitHub Pages founder trial with data primarily stored in each browser/device.
- Secure accounts and true cross-device sync require a protected backend in a later phase.
- Camera/barcode, speech and nutrition-panel OCR still require real-device testing after deployment.
- Online product records can be incomplete or outdated and must be checked against the package.
- Nutrition calculations and suggestions remain product-development features, not medical advice.
