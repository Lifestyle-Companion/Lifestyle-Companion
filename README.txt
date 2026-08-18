HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.31

DEPLOYMENT
1. Keep your existing JSON backup safe. The recent backup you checked before this build remains your recovery point.
2. Extract this complete Alpha 0.6.31 folder, or upload the supplied changed-files-only package over the current Alpha 0.6.30 files.
3. Keep the same GitHub Pages website address; do not mix runtime files from different Alpha versions.
4. Wait for GitHub Pages to finish publishing.
5. Fully close HEC on the iPhone, reopen it, and confirm the Home badge says Alpha 0.6.31.
6. Check that profile, Diary, weight/history, saved foods/recipes and settings remain present before further testing.

WHAT IS NEW IN ALPHA 0.6.31
Alpha 0.6.31 is a Search, Serving & Review Polish build. It keeps the stability work from Alpha 0.6.30 while addressing the remaining food-entry friction seen beside Easy Diet Diary.

Key changes:
- faster immediate/predictive search response and earlier online lookup;
- incremental online product results instead of waiting for every source;
- Australian retailer/brand word-order normalisation (for example Woolworths/Woolies lamb steak searches);
- all meaningful typed product words must match, so an unknown brand such as Ascend is not silently replaced by a different brand's protein bar;
- Lamb/Beef steak AFCD records can be found even when Steak is not the first database word;
- chicken strips/pieces can safely use compatible chicken-breast nutrition instead of dead-ending on physical shape;
- conditional Air Fried preparation for applicable foods;
- selected whole-egg size is locked through Review, removing the redundant second size selection;
- useful brand + product identity is retained in Diary and meal overview;
- suspicious package records with unknown nutrition are no longer shown as genuine 0 Cal foods;
- Nutrition Panel amount changes dynamically rescale calories and nutrients from the recognised basis;
- optional front-of-pack OCR can suggest an editable brand/product name;
- iPhone input/viewport and guided-tap state handling are hardened.

FIRST TESTS
Please focus on:
- lamb steak / Woolworths lamb steak / lamb steak Woolworths / Woolies lamb steaks;
- chicken strips -> breast -> baked/oven or grilled -> no added fat;
- Egg -> Whole -> Large -> Poached, then confirm Review does not ask the egg size again;
- Nutrition Panel 135 g lamb-steak test, then change 135 g to 100 g and back;
- a clear front-of-pack photo plus Nutrition Panel photo;
- Ascend protein bar: if the exact brand/product is unavailable, HEC should say so rather than substituting Fulfil or another brand;
- repeated iPhone keyboard/review navigation for the intermittent narrow-screen issue.

DATA STORAGE
Alpha 0.6.31 deliberately retains the same Alpha 0.6 storage keys:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

The app remains a founder-trial static web/PWA prototype. Exact packaged-product nutrition should still be checked against the current package. Camera, OCR, speech recognition, installed-PWA cache replacement and mobile interaction require real-device HTTPS testing.
