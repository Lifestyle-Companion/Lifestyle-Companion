HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.3

PURPOSE
Alpha 0.6.3 consolidates the Alpha 0.6.2 testing feedback and introduces live food-data and scanning foundations.

MAJOR CHANGES
- Perfectly circular, evenly spaced seven-room Home orbit.
- First completion of profile setup opens Home; later launches open Daily Progress.
- Daily Progress shows eaten and planned amounts together, with projected totals.
- Main fluid target uses the Australian adult fluids reference rather than total water from food and fluids.
- Meal Planner uses remaining-energy guides across selected meals and prevents duplicate acceptance.
- Morning Tea and Snacks replace Morning Smoko and Supper.
- Food Library connects to Open Food Facts and USDA FoodData Central on explicit search.
- Official Australian Food Composition Database search is linked from the Food Library.
- Barcode camera/photo/manual lookup through Open Food Facts.
- Nutrition-panel OCR through Tesseract.js, with mandatory review before saving.
- Meal-photo workflow remains confirmation-first and does not guess calories.
- Guided preparation choices for egg and potato demonstrate the expandable food-variation model.
- Shopping List supports direct editing, category correction, typo prompts, duplicate handling, print and share.

ONLINE REQUIREMENTS
Live database search, barcode lookup, ZXing barcode scanning and Tesseract language assets require an internet connection. The local trial foods and existing diary continue to work offline.

DATA SOURCES
- Australian Food Composition Database (FSANZ): preferred Australian generic-food reference.
- Open Food Facts: large community-supplied packaged-product and barcode source.
- USDA FoodData Central: supplementary generic and branded records.

IMPORTANT LIMITATIONS
- Online records can be incomplete or inaccurate and must be checked against the product package.
- Meal-photo recognition is not automatic in this static build because accurate image recognition needs a protected server-side AI service.
- Nutrition-panel OCR can misread columns or units; review every value.
- The public USDA DEMO_KEY has low limits. A production app must use a protected server-side key.

HOW TO RUN
Extract the folder and open index.html, or publish the complete folder to the existing HTTPS testing site. Camera access normally requires HTTPS.
