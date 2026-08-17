HEALTHY EATING COMPANION — FOUNDER TRIAL ALPHA 0.6.29

AUSTRALIAN ENTITY REGISTRY + SEARCH INTELLIGENCE RESTRUCTURE

Deployment
1. IMPORTANT: while Alpha 0.6.28 is still deployed, use HEC -> Data, Backup & Privacy -> Download Backup before replacing files.
2. Replace the complete deployed folder with Alpha 0.6.29 at the same GitHub Pages address.
3. Do not mix runtime files from older builds.
4. Wait for the GitHub Pages deployment to complete, then reopen HEC and confirm Alpha 0.6.29 is visible.
5. Existing browser storage keys remain unchanged so founder-test data can migrate in place.

What is new in Alpha 0.6.29
- A new local Australian Food Entity Registry is loaded before the food-search engine.
- The starter registry recognises 39 entities: 12 retailers, 17 food/product brands and 10 restaurant/takeaway chains, plus common aliases.
- Recognised entities provide context before food matching. Examples:
  * Woolies -> Woolworths -> commercial/store context.
  * Kellogg / Kelloggs / Kellogg's -> Kellogg's brand -> breakfast-cereal context.
  * Doritos -> commercial branded corn chips.
  * Maccas -> McDonald's -> restaurant/takeaway context.
- A brand/store/chain already typed by the user can satisfy source questions automatically. HEC should not ask whether Doritos is homemade or whether Woolies bread is commercial.
- Partial recognised-brand prefixes can be predicted without pretending the unfinished letters are a food; the key founder test is Kell -> Kellogg's.
- Product ranking now separates recognised entities from the remaining food/product words so more typing should narrow a brand search rather than destroy it.
- Serving-unit selection is protected by resolved food identity. A flavour word such as Cheese in Doritos Cheese Supreme Corn Chips must not create a cheese Slice unit.
- Egg whole-entry sequencing is restored to Species -> Part -> Size -> Preparation, with added fat only when relevant. The size selected in the wizard should become the default review unit rather than asking for size twice.
- Egg Yolk and Egg White retain the useful Alpha 0.6.28 direct-measure branches.

Registry design rule
The registry is intentionally a small vocabulary of entities and aliases, NOT a manually maintained list of every supermarket product. Product nutrition still comes from the food/product sources available to HEC. The local registry gives HEC enough context to understand what the user already said even if an exact online product is temporarily unavailable.

Data continuity
The browser-storage identifiers remain unchanged:
- healthyEatingCompanionAlpha06
- healthyEatingCompanionAlpha06Functional

Founder-trial limitations
- The starter registry is deliberately incomplete and will expand from real founder tests.
- Recognition of a retailer/brand/chain does not prove that an exact nutrition record is available.
- Bundled AFCD Release 3 contains chicken egg records but does not provide matching duck/quail egg records found in this build's local dataset check. HEC must stop safely rather than inventing nutrition if a selected species has no compatible source record.
- Online packaged-food search can still be temporarily unavailable; entity recognition should continue locally, but exact product nutrition may require a later online refresh, barcode scan or nutrition-panel capture.
- Camera scanning, nutrition-panel OCR, microphone permission, service-worker replacement and installed-PWA behaviour still require real HTTPS/iPhone/iPad testing.
