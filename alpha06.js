(() => {
"use strict";

const APP = window.HEC_APP || {name:"Healthy Eating Companion",version:"0.6.5",storageKey:"healthyEatingCompanionAlpha06",functionalStorageKey:"healthyEatingCompanionAlpha06Functional"};
const MAIN_KEY = APP.storageKey;
const EXT_KEY = APP.functionalStorageKey;
const LEGACY_EXT_KEYS = ["healthyEatingAlpha05Functional","healthyEatingAlpha04Extensions"];
const by = id => document.getElementById(id);
const q = selector => document.querySelector(selector);
const qa = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const n = value => Number(value) || 0;
const round1 = value => Math.round((Number(value) || 0) * 10) / 10;
const whole = value => Math.round(Number(value) || 0);
const isoToday = () => window.HECDate?.todayISO?.() || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}-${String(new Date().getDate()).padStart(2,"0")}`;
const activeTimeZone = () => window.HECDate?.activeTimeZone?.() || Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Brisbane";
const localClock = () => { const z=window.HECDate?.zonedParts?.() || {}; return `${String(z.hour ?? new Date().getHours()).padStart(2,"0")}:${String(z.minute ?? new Date().getMinutes()).padStart(2,"0")}`; };
const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const clone = value => JSON.parse(JSON.stringify(value));
const formatDate = value => value ? new Intl.DateTimeFormat("en-AU", {weekday:"short", day:"numeric", month:"short", year:"numeric"}).format(new Date(value + "T12:00:00")).replace(",","") : "";
const formatNumber = (value, precise=false) => {
  const num = Number(value) || 0;
  if(precise && Math.abs(num) < 10 && !Number.isInteger(round1(num))) return round1(num).toFixed(1);
  return Math.round(num).toLocaleString("en-AU");
};
const normalise = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim();
const mainData = () => {
  try { return JSON.parse(localStorage.getItem(MAIN_KEY)) || {}; } catch { return {}; }
};

const NUTRIENT_KEYS = ["calories","protein","carbs","fat","satFat","fibre","sugar","sodium"];
const ZERO_NUTRIENTS = Object.fromEntries(NUTRIENT_KEYS.map(k => [k,0]));
const nutrient = (calories, protein, carbs, fat, satFat, fibre, sugar, sodium, extra={}) => ({calories,protein,carbs,fat,satFat,fibre,sugar,sodium,...extra});

const FOODS = [
  {id:"weetbix-au",name:"Sanitarium Weet-Bix Original",brand:"Sanitarium",category:"Breakfast Cereals",country:"Australia",aliases:["weet bix","weetbix","weet-bix","wheat bix"],defaultAmount:2,defaultUnit:"biscuit",units:{biscuit:.5,serving:1,g:1/31},unitLabels:{biscuit:"biscuit",serving:"serving (2 biscuits)",g:"g"},serving:"2 biscuits (31 g)",nutrients:nutrient(110,3.8,20.4,.4,.1,4,.9,84,{potassium:113,iron:3}),score:8,source:"Verified From Australian Package Sample",verified:true,ingredients:"Wholegrain wheat, sugar, salt, barley malt extract, vitamins and minerals",allergens:["wheat","gluten"]},
  {id:"light-milk-au",name:"Australian Light Milk",brand:"Generic Australian Dairy",category:"Dairy & Eggs",country:"Australia",aliases:["light milk","lite milk","low fat milk","1 percent milk"],defaultAmount:200,defaultUnit:"mL",units:{mL:1/200,cup:1.25,serving:1},unitLabels:{mL:"mL",cup:"cup (250 mL)",serving:"serving (200 mL)"},serving:"200 mL",nutrients:nutrient(86,7,10,2.8,1.8,0,10,90,{calcium:240}),score:8,source:"Australian Generic Trial Record",verified:false,ingredients:"Reduced-fat cow's milk",allergens:["milk","dairy"]},
  {id:"baby-carrot",name:"Baby Snacking Carrot",brand:"Fresh Produce",category:"Fruit & Vegetables",country:"Australia",aliases:["baby carrot","snacking carrot","snackables carrot","snack ables carrot","carrot"],defaultAmount:31,defaultUnit:"g",units:{g:1/31,item:1},unitLabels:{g:"g",item:"small carrot (about 31 g)"},serving:"31 g",nutrients:nutrient(13,.3,3,.1,0,1,.7,21),score:9,source:"Australian Fresh Food Estimate",verified:false,ingredients:"Carrot",allergens:[]},
  {id:"banana",name:"Banana",brand:"Fresh Produce",category:"Fruit & Vegetables",country:"Australia",aliases:["banana","lady finger banana"],defaultAmount:1,defaultUnit:"item",units:{item:1,g:1/118},unitLabels:{item:"medium banana",g:"g"},serving:"1 medium banana (118 g)",nutrients:nutrient(105,1.3,27,.4,.1,3.1,14.4,1),score:8,source:"Australian Fresh Food Estimate",verified:false,ingredients:"Banana",allergens:[]},
  {id:"apple",name:"Apple",brand:"Fresh Produce",category:"Fruit & Vegetables",country:"Australia",aliases:["apple","pink lady","royal gala","granny smith"],defaultAmount:1,defaultUnit:"item",units:{item:1,g:1/182},unitLabels:{item:"medium apple",g:"g"},serving:"1 medium apple (182 g)",nutrients:nutrient(95,.5,25,.3,.1,4.4,19,2),score:8,source:"Australian Fresh Food Estimate",verified:false,ingredients:"Apple",allergens:[]},
  {id:"berries",name:"Mixed Berries",brand:"Fresh or Frozen",category:"Fruit & Vegetables",country:"Australia",aliases:["berries","mixed berries","strawberries","blueberries"],defaultAmount:100,defaultUnit:"g",units:{g:.01,cup:1.4,serving:1},unitLabels:{g:"g",cup:"cup",serving:"100 g serving"},serving:"100 g",nutrients:nutrient(50,.8,12,.4,.1,4.5,7,1),score:9,source:"Australian Fresh Food Estimate",verified:false,ingredients:"Mixed berries",allergens:[]},
  {id:"wholemeal-bread",name:"Wholemeal Bread",brand:"Generic Australian",category:"Bakery",country:"Australia",aliases:["wholemeal bread","whole wheat bread","brown bread","toast"],defaultAmount:1,defaultUnit:"slice",units:{slice:1,g:1/40},unitLabels:{slice:"slice (40 g)",g:"g"},serving:"1 slice (40 g)",nutrients:nutrient(95,4,16,1.4,.3,3,2,180),score:7,source:"Australian Generic Trial Record",verified:false,ingredients:"Wholemeal wheat flour, water, yeast, salt",allergens:["wheat","gluten"]},
  {id:"egg",name:"Egg",brand:"Australian Eggs",category:"Dairy & Eggs",country:"Australia",aliases:["egg","eggs","boiled egg","poached egg"],defaultAmount:1,defaultUnit:"item",units:{item:1,g:1/50},unitLabels:{item:"large egg",g:"g"},serving:"1 large egg (50 g)",nutrients:nutrient(72,6.3,.4,4.8,1.6,0,.2,71),score:8,source:"Australian Generic Trial Record",verified:false,ingredients:"Egg",allergens:["egg"]},
  {id:"chicken-breast",name:"Chicken Breast, Cooked",brand:"Fresh",category:"Meat & Seafood",country:"Australia",aliases:["chicken breast","grilled chicken","roast chicken"],defaultAmount:100,defaultUnit:"g",units:{g:.01,serving:1},unitLabels:{g:"g",serving:"100 g serving"},serving:"100 g",nutrients:nutrient(165,31,0,3.6,1,0,0,74),score:8,source:"Australian Generic Trial Record",verified:false,ingredients:"Chicken breast",allergens:[]},
  {id:"tuna",name:"Tuna in Springwater, Drained",brand:"Generic Australian",category:"Meat & Seafood",country:"Australia",aliases:["tuna","tinned tuna","canned tuna"],defaultAmount:95,defaultUnit:"g",units:{g:1/95,can:1,serving:1},unitLabels:{g:"g",can:"small can (95 g drained)",serving:"95 g serving"},serving:"95 g drained",nutrients:nutrient(100,22,0,1,.3,0,0,300),score:8,source:"Australian Generic Trial Record",verified:false,ingredients:"Tuna, springwater, salt",allergens:["fish"]},
  {id:"brown-rice",name:"Brown Rice, Cooked",brand:"Generic",category:"Pantry",country:"Australia",aliases:["brown rice","rice"],defaultAmount:150,defaultUnit:"g",units:{g:1/150,cup:1.3,serving:1},unitLabels:{g:"g",cup:"cup",serving:"150 g serving"},serving:"150 g",nutrients:nutrient(170,3.8,35,1.4,.3,2.4,.7,6),score:8,source:"Australian Generic Trial Record",verified:false,ingredients:"Brown rice",allergens:[]},
  {id:"potato",name:"Potato, Boiled",brand:"Fresh Produce",category:"Fruit & Vegetables",country:"Australia",aliases:["potato","boiled potato","spud"],defaultAmount:150,defaultUnit:"g",units:{g:1/150,item:1,serving:1},unitLabels:{g:"g",item:"medium potato",serving:"150 g serving"},serving:"150 g",nutrients:nutrient(116,3,26,.2,.1,2.7,1.2,10),score:8,source:"Australian Fresh Food Estimate",verified:false,ingredients:"Potato",allergens:[]},
  {id:"broccoli",name:"Broccoli, Steamed",brand:"Fresh Produce",category:"Fruit & Vegetables",country:"Australia",aliases:["broccoli","steamed broccoli"],defaultAmount:100,defaultUnit:"g",units:{g:.01,cup:1.5,serving:1},unitLabels:{g:"g",cup:"cup",serving:"100 g serving"},serving:"100 g",nutrients:nutrient(35,2.4,7,.4,.1,3.3,1.4,41),score:9,source:"Australian Fresh Food Estimate",verified:false,ingredients:"Broccoli",allergens:[]},
  {id:"salad",name:"Mixed Garden Salad",brand:"Fresh",category:"Fruit & Vegetables",country:"Australia",aliases:["salad","garden salad","mixed salad"],defaultAmount:150,defaultUnit:"g",units:{g:1/150,bowl:1,serving:1},unitLabels:{g:"g",bowl:"medium bowl",serving:"150 g serving"},serving:"150 g",nutrients:nutrient(60,2.5,10,1,0.2,4,5,70),score:9,source:"Australian Fresh Food Estimate",verified:false,ingredients:"Lettuce, tomato, cucumber, carrot; dressing not included",allergens:[]},
  {id:"avocado",name:"Avocado",brand:"Fresh Produce",category:"Fruit & Vegetables",country:"Australia",aliases:["avocado","avo"],defaultAmount:50,defaultUnit:"g",units:{g:1/50,quarter:1,serving:1},unitLabels:{g:"g",quarter:"quarter avocado",serving:"50 g serving"},serving:"50 g",nutrients:nutrient(80,1,4.3,7.4,1.1,3.4,.3,4),score:8,source:"Australian Fresh Food Estimate",verified:false,ingredients:"Avocado",allergens:[]},
  {id:"greek-yoghurt",name:"Greek-Style Yoghurt, Plain",brand:"Generic Australian",category:"Dairy & Eggs",country:"Australia",aliases:["greek yoghurt","greek yogurt","plain yoghurt","yogurt"],defaultAmount:170,defaultUnit:"g",units:{g:1/170,tub:1,serving:1},unitLabels:{g:"g",tub:"small tub (170 g)",serving:"170 g serving"},serving:"170 g",nutrients:nutrient(120,15,7,3.5,2.2,0,6,60),score:8,source:"Australian Generic Trial Record",verified:false,ingredients:"Milk, live cultures",allergens:["milk","dairy"]},
  {id:"oats",name:"Rolled Oats, Dry",brand:"Generic Australian",category:"Breakfast Cereals",country:"Australia",aliases:["oats","porridge","rolled oats"],defaultAmount:40,defaultUnit:"g",units:{g:1/40,cup:2,serving:1},unitLabels:{g:"g",cup:"cup",serving:"40 g serving"},serving:"40 g",nutrients:nutrient(150,5.2,24,3.2,.6,4,0.4,2),score:9,source:"Australian Generic Trial Record",verified:false,ingredients:"Wholegrain oats",allergens:["oats","gluten"]},
  {id:"beef-rissole",name:"Beef Rissole, Homemade Estimate",brand:"Recipe Estimate",category:"Meat & Seafood",country:"Australia",aliases:["rissole","beef rissole","meat patty"],defaultAmount:1,defaultUnit:"item",units:{item:1,g:1/100},unitLabels:{item:"medium rissole (about 100 g)",g:"g"},serving:"1 medium rissole (100 g)",nutrients:nutrient(220,20,5,13,5,1,1,330),score:6,source:"Estimated—Create Your Own Recipe for Accuracy",verified:false,ingredients:"Beef mince, onion, egg, breadcrumbs and seasoning may vary",allergens:["egg","wheat","gluten"]},
  {id:"cappuccino",name:"Cappuccino With Light Milk",brand:"Café Estimate",category:"Drinks",country:"Australia",aliases:["cappuccino","capp","coffee with milk"],defaultAmount:250,defaultUnit:"mL",units:{mL:1/250,cup:1,serving:1},unitLabels:{mL:"mL",cup:"regular cup",serving:"250 mL cup"},serving:"250 mL",nutrients:nutrient(90,6,10,2.5,1.6,0,9,85),score:7,source:"Australian Café Estimate",verified:false,ingredients:"Espresso coffee and light milk",allergens:["milk","dairy"]},
  {id:"water",name:"Water",brand:"",category:"Drinks",country:"Australia",aliases:["water","glass of water"],defaultAmount:250,defaultUnit:"mL",units:{mL:1/250,glass:1},unitLabels:{mL:"mL",glass:"glass (250 mL)"},serving:"250 mL",nutrients:nutrient(0,0,0,0,0,0,0,0),score:10,source:"Confirmed",verified:true,ingredients:"Water",allergens:[]}
];
const FOOD_GROUP_KEYS = ["vegetables","fruit","grains","proteinFoods","dairy"];
const FOOD_GROUP_LABELS = {vegetables:"Veges & Legumes",fruit:"Fruit",grains:"Grains",proteinFoods:"Protein Foods",dairy:"Dairy & Alternatives"};
const FOOD_METADATA = {
  "weetbix-au":{waterMl:2,foodGroups:{grains:1}},
  "light-milk-au":{waterMl:180,hydrationType:"drink",foodGroups:{dairy:.8}},
  "baby-carrot":{waterMl:28,foodGroups:{vegetables:.4}},
  banana:{waterMl:88,foodGroups:{fruit:1}},
  apple:{waterMl:155,foodGroups:{fruit:1}},
  berries:{waterMl:86,foodGroups:{fruit:.7}},
  "wholemeal-bread":{waterMl:15,foodGroups:{grains:1}},
  egg:{waterMl:38,foodGroups:{proteinFoods:.5}},
  "chicken-breast":{waterMl:65,foodGroups:{proteinFoods:1.25}},
  tuna:{waterMl:70,foodGroups:{proteinFoods:1}},
  "brown-rice":{waterMl:105,foodGroups:{grains:1.25}},
  potato:{waterMl:120,foodGroups:{vegetables:2}},
  broccoli:{waterMl:90,foodGroups:{vegetables:1.3}},
  salad:{waterMl:135,foodGroups:{vegetables:2}},
  avocado:{waterMl:36,foodGroups:{vegetables:.7}},
  "greek-yoghurt":{waterMl:135,foodGroups:{dairy:.85}},
  oats:{waterMl:4,foodGroups:{grains:1}},
  "beef-rissole":{waterMl:60,foodGroups:{proteinFoods:1.2,grains:.15}},
  cappuccino:{waterMl:230,hydrationType:"drink",foodGroups:{dairy:1}},
  water:{waterMl:250,hydrationType:"drink",foodGroups:{}}
};

FOODS.push(
  {id:"english-muffin",name:"English Muffin",brand:"Generic Australian",category:"Bakery",country:"Australia",aliases:["muffin","english muffin"],defaultAmount:1,defaultUnit:"item",units:{item:1,g:1/65},unitLabels:{item:"1 Muffin (65 g)",g:"g"},serving:"1 Muffin (65 g)",nutrients:nutrient(160,5.5,30,1.5,.4,2,2.5,320),score:7,source:"Australian Generic Trial Estimate",verified:false,ingredients:"Wheat flour, water, yeast, salt",allergens:["wheat","gluten"],waterMl:20,foodGroups:{grains:2}},
  {id:"shortcut-bacon",name:"Shortcut Bacon, Cooked",brand:"Generic Australian",category:"Meat & Seafood",country:"Australia",aliases:["bacon","shortcut bacon","bacon rasher"],defaultAmount:1,defaultUnit:"rasher",units:{rasher:1,g:1/35},unitLabels:{rasher:"1 Rasher (35 g)",g:"g"},serving:"1 Rasher (35 g)",nutrients:nutrient(95,10,.5,6,2.2,0,.3,520),score:5,source:"Australian Generic Trial Estimate",verified:false,ingredients:"Pork, salt, curing ingredients",allergens:[],waterMl:18,foodGroups:{proteinFoods:.5}},
  {id:"cheddar-cheese",name:"Cheddar Cheese",brand:"Generic Australian",category:"Dairy & Eggs",country:"Australia",aliases:["cheese","cheddar","cheese slice"],defaultAmount:1,defaultUnit:"slice",units:{slice:1,g:1/25},unitLabels:{slice:"1 Slice (25 g)",g:"g"},serving:"1 Slice (25 g)",nutrients:nutrient(101,6.3,.3,8.4,5.3,0,.1,155),score:6,source:"Australian Generic Trial Estimate",verified:false,ingredients:"Milk, cultures, salt, enzyme",allergens:["milk","dairy"],waterMl:9,foodGroups:{dairy:.5}},
  {id:"tomato-sauce",name:"Tomato Sauce",brand:"Generic Australian",category:"Pantry",country:"Australia",aliases:["tomato sauce","ketchup","sauce"],defaultAmount:15,defaultUnit:"mL",units:{mL:1/15,teaspoon:1/3,tablespoon:1},unitLabels:{mL:"mL",teaspoon:"1 Teaspoon (5 mL)",tablespoon:"1 Tablespoon (15 mL)"},serving:"1 Tablespoon (15 mL)",nutrients:nutrient(18,.2,4.2,0,0,.1,3.5,180),score:5,source:"Australian Generic Trial Estimate",verified:false,ingredients:"Tomato, sugar, vinegar, salt, spices",allergens:[],waterMl:10,foodGroups:{vegetables:.1}},
  {id:"margarine",name:"Margarine",brand:"Generic Australian",category:"Dairy & Eggs",country:"Australia",aliases:["margarine","spread","table spread"],defaultAmount:5,defaultUnit:"g",units:{g:1/5,teaspoon:1},unitLabels:{g:"g",teaspoon:"1 Teaspoon (5 g)"},serving:"1 Teaspoon (5 g)",nutrients:nutrient(27,0,0,3,.7,0,0,30),score:5,source:"Australian Generic Trial Estimate",verified:false,ingredients:"Vegetable oils, water, salt",allergens:[],waterMl:1,foodGroups:{}},
  {id:"beef-sausage",name:"Beef Sausage, Cooked",brand:"Generic Australian",category:"Meat & Seafood",country:"Australia",aliases:["sausage","beef sausage","snag"],defaultAmount:1,defaultUnit:"medium",units:{thin:.72,medium:1,large:1.45,g:1/75},unitLabels:{thin:"1 Long Thin Sausage (54 g)",medium:"1 Medium Sausage (75 g)",large:"1 Large Thick Sausage (109 g)",g:"g"},serving:"1 Medium Sausage (75 g)",nutrients:nutrient(210,12,5,16,6,0,1,620),score:4,source:"Australian Generic Trial Estimate",verified:false,ingredients:"Beef, water, cereal, seasoning",allergens:["wheat","gluten"],waterMl:35,foodGroups:{proteinFoods:.8,grains:.1}},
  {id:"beef-steak",name:"Beef Steak, Grilled",brand:"Generic Australian",category:"Meat & Seafood",country:"Australia",aliases:["steak","beef steak","grilled steak"],defaultAmount:1,defaultUnit:"medium",units:{small:.67,medium:1,large:1.5,g:1/150},unitLabels:{small:"1 Small Steak (100 g)",medium:"1 Medium Steak (150 g)",large:"1 Large Steak (225 g)",g:"g"},serving:"1 Medium Steak (150 g)",nutrients:nutrient(330,42,0,18,7,0,0,110),score:7,source:"Australian Generic Trial Estimate",verified:false,ingredients:"Beef",allergens:[],waterMl:85,foodGroups:{proteinFoods:2}}
);
FOODS.forEach(food => Object.assign(food, FOOD_METADATA[food.id] || {waterMl:food.waterMl||0,foodGroups:food.foodGroups||{}}));
// Alpha 0.6.5: keep a plain egg separate from egg dishes so search and preparation are easier to understand.
FOODS.push(
  {id:"scrambled-eggs",name:"Scrambled Eggs",brand:"Generic Australian",category:"Dairy & Eggs",country:"Australia",aliases:["scrambled egg","scrambled eggs"],defaultAmount:1,defaultUnit:"serve",units:{serve:1,g:1/100},unitLabels:{serve:"1 Serving (about 2 Large Eggs)",g:"g"},serving:"1 Serving (about 2 Large Eggs)",nutrients:nutrient(144,12.6,.8,9.6,3.2,0,.4,142),score:8,source:"Guided Australian Egg Dish Estimate",verified:false,ingredients:"Eggs; additions vary",allergens:["egg"],waterMl:76,foodGroups:{proteinFoods:1}},
  {id:"omelette",name:"Omelette",brand:"Generic Australian",category:"Dairy & Eggs",country:"Australia",aliases:["omelet","omelette","egg omelette"],defaultAmount:1,defaultUnit:"serve",units:{serve:1,g:1/120},unitLabels:{serve:"1 Omelette (about 2 Large Eggs)",g:"g"},serving:"1 Omelette (about 2 Large Eggs)",nutrients:nutrient(150,13,1.2,10,3.4,0,.5,155),score:8,source:"Guided Australian Egg Dish Estimate",verified:false,ingredients:"Eggs; fillings vary",allergens:["egg"],waterMl:76,foodGroups:{proteinFoods:1}},
  {id:"eggs-benedict",name:"Eggs Benedict",brand:"Generic Café Estimate",category:"Dairy & Eggs",country:"Australia",aliases:["egg benedict","eggs benedict","benedict"],defaultAmount:1,defaultUnit:"serve",units:{serve:1},unitLabels:{serve:"1 Serving"},serving:"1 Serving",nutrients:nutrient(480,23,32,29,12,2,4,1150),score:5,source:"Generic Café Estimate — Ingredients Vary Widely",verified:false,ingredients:"Poached eggs, English muffin, hollandaise sauce and ham or similar protein",allergens:["egg","milk","wheat","gluten"],waterMl:90,foodGroups:{proteinFoods:1,dairy:.3,grains:2}}
);

const FOOD_BY_ID = new Map(FOODS.map(f => [f.id,f]));

const MEAL_SUGGESTIONS = [
  {id:"suggest-breakfast-1",name:"Weet-Bix, Light Milk & Berries",meal:"Breakfast",score:8,reason:"Wholegrain cereal, fibre, fruit and dairy protein.",items:[{foodId:"weetbix-au",amount:2,unit:"biscuit"},{foodId:"light-milk-au",amount:200,unit:"mL"},{foodId:"berries",amount:100,unit:"g"}]},
  {id:"suggest-breakfast-2",name:"Eggs on Wholemeal Toast",meal:"Breakfast",score:8,reason:"Balanced protein and wholegrain carbohydrate.",items:[{foodId:"egg",amount:2,unit:"item"},{foodId:"wholemeal-bread",amount:2,unit:"slice"},{foodId:"baby-carrot",amount:62,unit:"g"}]},
  {id:"suggest-lunch-1",name:"Chicken & Salad Lunch",meal:"Lunch",score:9,reason:"Lean protein, vegetables and a high-volume salad.",items:[{foodId:"chicken-breast",amount:120,unit:"g"},{foodId:"salad",amount:200,unit:"g"},{foodId:"avocado",amount:50,unit:"g"}]},
  {id:"suggest-lunch-2",name:"Tuna & Wholemeal Sandwich",meal:"Lunch",score:7,reason:"Convenient protein with wholemeal bread; sodium is worth checking.",items:[{foodId:"tuna",amount:95,unit:"g"},{foodId:"wholemeal-bread",amount:2,unit:"slice"},{foodId:"salad",amount:100,unit:"g"}]},
  {id:"suggest-dinner-1",name:"Chicken, Potato & Broccoli",meal:"Dinner",score:9,reason:"A straightforward balanced plate with lean protein and vegetables.",items:[{foodId:"chicken-breast",amount:150,unit:"g"},{foodId:"potato",amount:180,unit:"g"},{foodId:"broccoli",amount:150,unit:"g"}]},
  {id:"suggest-dinner-2",name:"Beef Rissole & Vegetables",meal:"Dinner",score:7,reason:"A familiar Australian dinner; a saved homemade recipe will improve accuracy.",items:[{foodId:"beef-rissole",amount:1,unit:"item"},{foodId:"potato",amount:150,unit:"g"},{foodId:"broccoli",amount:150,unit:"g"}]},
  {id:"suggest-snack-1",name:"Greek Yoghurt & Berries",meal:"Afternoon Tea",score:8,reason:"Protein, calcium and fruit in a practical snack.",items:[{foodId:"greek-yoghurt",amount:170,unit:"g"},{foodId:"berries",amount:100,unit:"g"}]},
  {id:"suggest-snack-2",name:"Apple",meal:"Morning Tea",score:8,reason:"Simple fruit snack with fibre.",items:[{foodId:"apple",amount:1,unit:"item"}]},
  {id:"suggest-breakfast-3",name:"Oats, Milk & Banana",meal:"Breakfast",score:9,reason:"Wholegrain breakfast with fruit and dairy.",items:[{foodId:"oats",amount:40,unit:"g"},{foodId:"light-milk-au",amount:200,unit:"mL"},{foodId:"banana",amount:1,unit:"item"}]},
  {id:"suggest-smoko-2",name:"Yoghurt & Berries",meal:"Morning Tea",score:8,reason:"Fruit, dairy and protein in a practical snack.",items:[{foodId:"greek-yoghurt",amount:120,unit:"g"},{foodId:"berries",amount:80,unit:"g"}]},
  {id:"suggest-afternoon-2",name:"Apple & Yoghurt",meal:"Afternoon Tea",score:8,reason:"Fruit and dairy with useful fibre and protein.",items:[{foodId:"apple",amount:1,unit:"item"},{foodId:"greek-yoghurt",amount:100,unit:"g"}]},
  {id:"suggest-supper-1",name:"Light Milk & Banana",meal:"Snacks",score:8,reason:"Simple fruit and dairy option for a lighter supper.",items:[{foodId:"light-milk-au",amount:200,unit:"mL"},{foodId:"banana",amount:1,unit:"item"}]},
  {id:"suggest-supper-2",name:"Greek Yoghurt & Berries",meal:"Snacks",score:8,reason:"A modest dairy and fruit option.",items:[{foodId:"greek-yoghurt",amount:120,unit:"g"},{foodId:"berries",amount:80,unit:"g"}]}
];

const EXT_DEFAULTS = {
  version:"0.6.5", diary:{}, daySettings:{}, water:{}, fluidTargets:{}, steps:{}, dailyNotes:{}, exercise:[], shopping:[], onlineFoods:[], onlineSearchCache:{},
  family:{enabled:false,name:"",email:""}, connections:{}, customFoods:[], savedFoodIds:[], recipes:[], mealTemplates:[],
  ui:{diaryDate:isoToday(),progressDate:isoToday(),plannerDate:isoToday(),diaryView:"all",libraryTab:"all",scanMode:"food",pendingMeal:"",plannerResults:{},plannerRejected:{},plannerAccepted:{},recipeDraft:[],recipeName:"",recipeServings:4,recipeNotes:"",returnToRecipe:false,replacingEntryId:""}
};
function merge(target, source){
  if(!source || typeof source !== "object") return target;
  Object.entries(source).forEach(([key,value]) => {
    if(value && typeof value === "object" && !Array.isArray(value)) target[key] = merge(target[key] && typeof target[key] === "object" ? target[key] : {}, value);
    else if(value !== undefined) target[key] = value;
  });
  return target;
}
function loadExt(){
  let current = null;
  try { current = JSON.parse(localStorage.getItem(EXT_KEY)); } catch {}
  if(current){ const loaded=merge(clone(EXT_DEFAULTS),current); loaded.version="0.6.5"; return loaded; }
  for(const legacyKey of LEGACY_EXT_KEYS){
    try {
      const legacy = JSON.parse(localStorage.getItem(legacyKey));
      if(legacy){
        const migrated = merge(clone(EXT_DEFAULTS),legacy);
        migrated.version = "0.6.5";
        if(legacy.daily?.date){
          migrated.water[legacy.daily.date] = legacy.daily.water || 0;
          migrated.steps[legacy.daily.date] = legacy.daily.steps || 0;
        }
        return migrated;
      }
    } catch {}
  }
  return clone(EXT_DEFAULTS);
}
const ext = loadExt();
const saveExt = () => localStorage.setItem(EXT_KEY,JSON.stringify(ext));

function nonRecipeFoods(){
  const custom = (ext.customFoods || []).map(f => ({...f,source:f.source || "User Created",verified:false}));
  return [...FOODS,...custom,...(ext.onlineFoods||[])];
}
function allFoods(){
  const recipes = (ext.recipes || []).map(r => recipeAsFood(r));
  return [...nonRecipeFoods(),...recipes];
}
function getFood(id){ return allFoods().find(f => f.id === id); }
function unitOptions(food){ return food?.units || {serving:1}; }
function defaultAmount(food){ return food?.defaultAmount ?? 1; }
function defaultUnit(food){ return food?.defaultUnit || Object.keys(unitOptions(food))[0] || "serving"; }
function unitLabel(food,unit){ return titleUnit(food?.unitLabels?.[unit] || unit); }
function foodMultiplier(food,amount,unit){ return Math.max(0,n(amount)) * (unitOptions(food)[unit] ?? 1); }
function scaledNutrients(food,amount,unit){
  const multiplier = foodMultiplier(food,amount,unit);
  const result = {};
  NUTRIENT_KEYS.forEach(key => {
    const value = food?.nutrients?.[key];
    result[key] = value === null || value === undefined || value === "" ? null : Number(value) * multiplier;
  });
  Object.entries(food?.nutrients || {}).forEach(([key,value]) => {
    if(!(key in result)) result[key] = value === null || value === undefined ? null : Number(value) * multiplier;
  });
  return result;
}
function scaledFoodGroups(food,amount,unit){
  const multiplier = foodMultiplier(food,amount,unit);
  const result = Object.fromEntries(FOOD_GROUP_KEYS.map(key => [key,0]));
  FOOD_GROUP_KEYS.forEach(key => { result[key] = n(food?.foodGroups?.[key]) * multiplier; });
  return result;
}
function scaledWaterMl(food,amount,unit){ return Math.max(0,n(food?.waterMl) * foodMultiplier(food,amount,unit)); }
function sumNutrients(items){
  const totals = {...ZERO_NUTRIENTS};
  items.forEach(item => NUTRIENT_KEYS.forEach(key => { if(item?.nutrients?.[key] !== null && item?.nutrients?.[key] !== undefined) totals[key] += Number(item.nutrients[key]) || 0; }));
  return totals;
}
function sumGroupValues(items){
  const totals = Object.fromEntries(FOOD_GROUP_KEYS.map(key => [key,0]));
  items.forEach(item => FOOD_GROUP_KEYS.forEach(key => { totals[key] += n(item?.foodGroups?.[key]); }));
  return totals;
}
function ageForProfile(){
  const dob=mainData().personal?.dob;if(!dob)return 40;
  const born=new Date(`${dob}T12:00:00`),now=new Date();let age=now.getFullYear()-born.getFullYear();
  if(now.getMonth()<born.getMonth()||(now.getMonth()===born.getMonth()&&now.getDate()<born.getDate()))age--;
  return age;
}
function foodGroupGoals(){
  const main=mainData(),age=ageForProfile(),sex=main.health?.sex,status=String(main.dietary?.["pregnancy-status"]||"").toLowerCase();
  if(status.includes("pregnant")) return {vegetables:5,fruit:2,grains:8.5,proteinFoods:3.5,dairy:2.5};
  if(status.includes("breast")) return {vegetables:7.5,fruit:2,grains:9,proteinFoods:2.5,dairy:2.5};
  if(sex==="male"){
    if(age>=71)return {vegetables:5,fruit:2,grains:4.5,proteinFoods:2.5,dairy:3.5};
    if(age>=51)return {vegetables:5.5,fruit:2,grains:6,proteinFoods:2.5,dairy:2.5};
    return {vegetables:6,fruit:2,grains:6,proteinFoods:3,dairy:2.5};
  }
  if(age>=71)return {vegetables:5,fruit:2,grains:3,proteinFoods:2,dairy:4};
  if(age>=51)return {vegetables:5,fruit:2,grains:4,proteinFoods:2,dairy:4};
  return {vegetables:5,fruit:2,grains:6,proteinFoods:2.5,dairy:2.5};
}
function hydrationReference(){
  const main=mainData(),status=String(main.dietary?.["pregnancy-status"]||"").toLowerCase();
  if(status.includes("breast"))return {total:3500,fluids:2600};
  if(status.includes("pregnant"))return {total:3100,fluids:2300};
  if(main.health?.sex==="male")return {total:3400,fluids:2600};
  return {total:2800,fluids:2100};
}
function hasEnergyValue(value){ return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)); }
function energyText(value){ return hasEnergyValue(value) ? `${formatNumber(value)} Cal` : "Energy Not Available"; }
function calculationDiagnostics(date){
  const eaten = entriesForDate(date).filter(entry => entry.status === "eaten");
  const missing = eaten.filter(entry => !hasEnergyValue(entry?.nutrients?.calories));
  return {eaten,missing,total:dayNutrition(date,["eaten"]).calories};
}
function nutrientText(value,unit,detail=false){ return value === null || value === undefined ? "Not Available" : `${formatNumber(value,detail)} ${unit}`; }
function nutritionCards(values){
  const cards = [
    ["Calories",values.calories,"Cal",false],["Protein",values.protein,"g",true],["Carbohydrate",values.carbs,"g",true],["Fat",values.fat,"g",true],
    ["Saturated Fat",values.satFat,"g",true],["Fibre",values.fibre,"g",true],["Sugars",values.sugar,"g",true],["Sodium",values.sodium,"mg",false]
  ];
  return `<div class="nutrition-card-grid">${cards.map(([label,value,unit,detail]) => `<div><span>${label}</span><strong>${nutrientText(value,unit,detail)}</strong></div>`).join("")}</div>`;
}
function foodSafety(food){
  const main = mainData();
  const d = main.dietary || {};
  const absolute = normalise([d["food-allergies"],d["food-intolerances"],d["medical-restrictions"],d["foods-never"]].filter(Boolean).join(" "));
  if(!absolute) return {blocked:false,message:""};
  const haystack = normalise([food.name,food.ingredients,(food.allergens||[]).join(" ")].join(" "));
  const tokens = absolute.split(" ").filter(t => t.length > 2);
  const hits = [...new Set(tokens.filter(t => haystack.includes(t)))];
  return hits.length ? {blocked:true,message:`Check your profile restriction: ${hits.join(", ")}.`} : {blocked:false,message:""};
}
function scoreExplanation(score){
  if(score >= 9) return "Strong everyday choice with useful nutrients and minimal processing.";
  if(score >= 8) return "A good fit for many balanced meal plans.";
  if(score >= 7) return "Generally suitable; consider the complete meal and daily plan.";
  if(score >= 5) return "Can fit, but serving size or meal balance may need attention.";
  return "Review the portion, ingredients and how it fits your day.";
}
function recipeProfile(recipe){
  const servings=Math.max(1,n(recipe.servings)||1);
  const items=(recipe.ingredients||[]).map(i=>{const food=nonRecipeFoods().find(f=>f.id===i.foodId);return {foodGroups:scaledFoodGroups(food,i.amount,i.unit),waterMl:scaledWaterMl(food,i.amount,i.unit),hydrationType:food?.hydrationType||"food"};});
  const groups=sumGroupValues(items);FOOD_GROUP_KEYS.forEach(key=>groups[key]/=servings);
  return {foodGroups:groups,waterMl:items.reduce((sum,i)=>sum+n(i.waterMl),0)/servings,hydrationType:"food"};
}
function recipeAsFood(recipe){
  const profile=recipeProfile(recipe);
  return {id:recipe.id,name:recipe.name,brand:"My Recipe",category:"Recipe",country:"Australia",aliases:[recipe.name],defaultAmount:1,defaultUnit:"serve",units:{serve:1},unitLabels:{serve:"recipe serving"},serving:`1 of ${recipe.servings} servings`,nutrients:recipe.perServe,foodGroups:recipe.foodGroups||profile.foodGroups,waterMl:n(recipe.waterMl)||profile.waterMl,hydrationType:"food",score:recipe.score || 7,source:"User Recipe",verified:false,ingredients:recipe.ingredients.map(i => i.name).join(", "),allergens:[]};
}
function currentGoals(date=isoToday()){
  const main = mainData();
  const r = main.recommendations || {};
  const energy = n(r.energyKj)/4.184;
  const settings = ext.daySettings[date] || {};
  const exerciseCredit = (ext.exercise || []).filter(x => x.date?.slice(0,10) === date).reduce((sum,x) => sum + n(x.credit),0);
  const calTarget = n(settings.targetCal) || whole(energy) || 2000;
  const hydration=hydrationReference();
  return {calories:calTarget + exerciseCredit,baseCalories:calTarget,exerciseCredit,hydration:hydration.fluids,fluids:hydration.fluids,protein:n(r.protein)||100,fat:n(r.fat)||70,carbs:n(r.carbs)||250,fibre:30,sugar:50,sodium:2000,steps:10000,foodGroups:foodGroupGoals()};
}
function entriesForDate(date){ return ext.diary[date] || []; }
function dayNutrition(date,statuses=["eaten"]){ return sumNutrients(entriesForDate(date).filter(e => statuses.includes(e.status))); }
function entryFoodProfile(entry){
  if(entry.foodGroups || entry.waterMl !== undefined)return {foodGroups:entry.foodGroups||{},waterMl:n(entry.waterMl),hydrationType:entry.hydrationType||"food"};
  const food=getFood(entry.foodId);return {foodGroups:scaledFoodGroups(food,entry.amount,entry.unit),waterMl:scaledWaterMl(food,entry.amount,entry.unit),hydrationType:food?.hydrationType||"food"};
}
function dayFoodGroups(date,statuses=["eaten"]){
  return sumGroupValues(entriesForDate(date).filter(e=>statuses.includes(e.status)).map(entry=>entryFoodProfile(entry)));
}
function dayHydration(date,statuses=["eaten"],includeManual=true){
  const manual=includeManual?n(ext.water[date]):0;let drinks=manual,foodMoisture=0;
  entriesForDate(date).filter(e=>statuses.includes(e.status)).forEach(entry=>{const profile=entryFoodProfile(entry);if(profile.hydrationType==="drink")drinks+=profile.waterMl;else foodMoisture+=profile.waterMl;});
  return {manual,drinks,foodMoisture,total:drinks+foodMoisture};
}
function daySummary(date){
  const nutrients = dayNutrition(date,["eaten"]);
  const planned = dayNutrition(date,["planned"]);
  const hydration=dayHydration(date,["eaten"],true);const plannedHydration=dayHydration(date,["planned"],false);
  return {nutrients,planned,hydration,plannedHydration,water:hydration.drinks,steps:n(ext.steps[date]),foodGroups:dayFoodGroups(date,["eaten"]),plannedFoodGroups:dayFoodGroups(date,["planned"]),goals:currentGoals(date)};
}

function openFeature(id,options={}){
  if(options.fromHome){
    const today=isoToday();
    if(id==="food-diary")ext.ui.diaryDate=today;
    if(id==="daily-progress")ext.ui.progressDate=today;
    if(id==="meal-planner")ext.ui.plannerDate=today;
    if(id==="food-library"){ext.ui.pendingMeal="";ext.ui.foodSearch="";ext.ui.libraryTab="all";}
    saveExt();
  }
  if(typeof window.show === "function") window.show(id,{speak:false});
  else { qa(".screen").forEach(s => s.classList.remove("active")); by(id)?.classList.add("active"); window.scrollTo(0,0); }
  if(id === "home") renderHomeSummary();
  if(id === "food-diary") renderDiary();
  if(id === "food-library") renderLibrary();
  if(id === "daily-progress") renderDailyProgress();
  if(id === "exercise-log") renderExercise();
  if(id === "progress-history") renderHistory(currentPeriod());
  if(id === "shopping-list") renderShopping();
  if(id === "food-preferences") renderFoodPreferences();
  if(id === "family-connections") renderConnections();
  if(id === "recipe-builder") renderRecipeBuilder();
  if(id === "meal-planner") initialisePlanner();
  if(id === "scan-centre") renderScanSelect();
  if(id === "printable-report") initialiseReport();
  if(id === "quick-log") initialiseVoice();
}
window.openAlpha05Feature = openFeature;

document.addEventListener("click",event => {
  const button = event.target.closest("[data-open-feature]");
  if(button){ event.preventDefault(); openFeature(button.dataset.openFeature); }
});

function shiftISO(date,days){ const d=new Date((date||isoToday())+"T12:00:00");d.setDate(d.getDate()+days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function mealNames(){ return ["Breakfast","Morning Tea","Lunch","Afternoon Tea","Dinner","Snacks","Other"]; }
function plannerMealNames(){ return ["Breakfast","Morning Tea","Lunch","Afternoon Tea","Dinner","Snacks"]; }

const FOOD_VARIANT_SCHEMAS={
  egg:{fields:[
    {key:"eggType",label:"Egg Type",options:[["chicken","Chicken Egg"],["duck","Duck Egg"],["quail","Quail Egg"]]},
    {key:"eggSize",label:"Size",options:[["small","Small"],["medium","Medium"],["large","Large"],["xlarge","Extra Large"]]},
    {key:"eggPrep",label:"Cooking Method",options:[["raw","Raw"],["boiled","Boiled"],["poached","Poached in Water"],["microwave-poached","Microwave-Poached"],["fried","Fried"],["oven-baked","Oven-Baked"],["other","Other Cooking Method"]]}
  ],defaults:{eggType:"chicken",eggSize:"large",eggPrep:"boiled",eggAdded:"none",eggOther:""}},
  "scrambled-eggs":{fields:[
    {key:"eggDishAppliance",label:"Cooking Method",options:[["stovetop","Stovetop"],["microwave","Microwave"],["oven","Oven-Baked"],["other","Other Cooking Method"]]},
    {key:"eggDishFat",label:"Cooking Fat",options:[["none","None"],["spray","Cooking Spray"],["oil","Oil"],["butter","Butter"],["margarine","Margarine"]]},
    {key:"eggDishLiquid",label:"Liquid / Protein Addition",options:[["none","None"],["water","Water"],["milk","Milk"],["cottage-cheese","Cottage Cheese"],["cream","Cream"]]},
    {key:"eggDishExtra",label:"Common Extra",options:[["plain","Plain"],["cheese","Cheese"],["bacon","Bacon"],["ham","Ham"],["vegetables","Vegetables"],["custom","Customise in Recipe Builder"]]}
  ],defaults:{eggDishAppliance:"stovetop",eggDishFat:"none",eggDishLiquid:"none",eggDishExtra:"plain",eggDishOther:""}},
  omelette:{fields:[
    {key:"eggDishAppliance",label:"Cooking Method",options:[["stovetop","Stovetop"],["microwave","Microwave Omelette Container"],["oven","Oven-Baked"],["air-fryer","Air-Fried"],["other","Other Cooking Method"]]},
    {key:"eggDishFat",label:"Cooking Fat",options:[["none","None"],["spray","Cooking Spray"],["oil","Oil"],["butter","Butter"],["margarine","Margarine"]]},
    {key:"eggDishLiquid",label:"Liquid / Protein Addition",options:[["none","None"],["water","Water"],["milk","Milk"],["cottage-cheese","Cottage Cheese"],["cream","Cream"]]},
    {key:"eggDishExtra",label:"Filling",options:[["plain","Plain"],["cheese","Cheese"],["ham-cheese","Ham & Cheese"],["bacon-cheese","Bacon & Cheese"],["vegetables","Vegetables"],["custom","Customise in Recipe Builder"]]}
  ],defaults:{eggDishAppliance:"stovetop",eggDishFat:"none",eggDishLiquid:"none",eggDishExtra:"plain",eggDishOther:""}},
  potato:{fields:[
    {key:"potatoType",label:"Potato Type",options:[["pale","Pale Skin"],["red","Red / Dark Skin"]]},
    {key:"potatoSkin",label:"Skin",options:[["peeled","Peeled"],["unpeeled","Unpeeled"]]},
    {key:"potatoPrep",label:"Cooking Method",options:[["raw","Raw"],["boiled","Boiled"],["steamed","Steamed"],["microwaved","Microwaved"],["baked","Oven-Baked"],["roasted","Roasted"],["air-fried","Air-Fried"],["mashed","Mashed"],["fried","Fried"],["other","Other Cooking Method"]]},
    {key:"potatoAdded",label:"Added Ingredients",options:[["none","No Additions"],["milk","With Milk"],["milk-margarine","Milk & Margarine"],["milk-dairyblend","Milk & Dairy Blend"],["milk-butter","Milk & Butter"],["oil","Oil Added"]]}
  ],defaults:{potatoType:"pale",potatoSkin:"unpeeled",potatoPrep:"boiled",potatoAdded:"none",potatoOther:""}},
  "beef-sausage":{fields:[{key:"cookMethod",label:"Cooking Method",options:[["grilled","Grilled"],["air-fried","Air-Fried"],["barbecued","Barbecued"],["oven-baked","Oven-Baked"],["pan-fried","Pan-Fried"],["other","Other Cooking Method"]]},{key:"cookFat",label:"Added Cooking Fat",options:[["none","None"],["spray","Cooking Spray"],["oil","Oil"],["butter","Butter"],["margarine","Margarine"]]}],defaults:{cookMethod:"air-fried",cookFat:"none",cookOther:""}},
  "beef-steak":{fields:[{key:"cookMethod",label:"Cooking Method",options:[["grilled","Grilled"],["air-fried","Air-Fried"],["barbecued","Barbecued"],["oven-baked","Oven-Baked"],["pan-fried","Pan-Fried"],["other","Other Cooking Method"]]},{key:"cookFat",label:"Added Cooking Fat",options:[["none","None"],["spray","Cooking Spray"],["oil","Oil"],["butter","Butter"],["margarine","Margarine"]]}],defaults:{cookMethod:"grilled",cookFat:"none",cookOther:""}},
  "beef-rissole":{fields:[{key:"cookMethod",label:"Cooking Method",options:[["grilled","Grilled"],["air-fried","Air-Fried"],["barbecued","Barbecued"],["oven-baked","Oven-Baked"],["pan-fried","Pan-Fried"],["other","Other Cooking Method"]]},{key:"cookFat",label:"Added Cooking Fat",options:[["none","None"],["spray","Cooking Spray"],["oil","Oil"],["butter","Butter"],["margarine","Margarine"]]}],defaults:{cookMethod:"air-fried",cookFat:"none",cookOther:""}},
  "chicken-breast":{fields:[{key:"cookMethod",label:"Cooking Method",options:[["grilled","Grilled"],["air-fried","Air-Fried"],["barbecued","Barbecued"],["oven-baked","Oven-Baked"],["pan-fried","Pan-Fried"],["other","Other Cooking Method"]]},{key:"cookFat",label:"Added Cooking Fat",options:[["none","None"],["spray","Cooking Spray"],["oil","Oil"],["butter","Butter"],["margarine","Margarine"]]}],defaults:{cookMethod:"grilled",cookFat:"none",cookOther:""}}
};
function variantSchema(food){return FOOD_VARIANT_SCHEMAS[food?.id]||null;}
function selectedVariantValues(){const out={};qa("[data-variant-key]").forEach(select=>out[select.dataset.variantKey]=select.value);return out;}
function resolveVariantFood(food,values={}){
  if(!food)return food;const schema=variantSchema(food);if(!schema)return food;
  const v={...schema.defaults,...values};const resolved=clone(food);
  const addCalories=(cal)=>{resolved.nutrients.calories=n(resolved.nutrients.calories)+cal;resolved.nutrients.fat=n(resolved.nutrients.fat)+cal/9;};
  if(food.id==="egg"){
    const bases={chicken:{small:54,medium:63,large:72,xlarge:80},duck:{small:110,medium:120,large:130,xlarge:145},quail:{small:12,medium:14,large:16,xlarge:18}};
    const cal=bases[v.eggType]?.[v.eggSize]||72,ratio=cal/72;resolved.nutrients=Object.fromEntries(Object.entries(food.nutrients).map(([k,val])=>[k,val==null?val:Number(val)*ratio]));
    const prepLabels={raw:"Raw",boiled:"Boiled",poached:"Poached", "microwave-poached":"Microwave-Poached",fried:"Fried","oven-baked":"Oven-Baked",other:"Other Method"};
    if(v.eggPrep==="fried")addCalories({none:0,spray:5,oil:40,butter:36,margarine:34}[v.eggAdded]||0);
    resolved.name=`${v.eggSize==="xlarge"?"Extra Large":titleUnit(v.eggSize)} ${titleUnit(v.eggType)} Egg, ${prepLabels[v.eggPrep]||titleUnit(v.eggPrep)}`;
    if(v.eggPrep==="fried"&&v.eggAdded!=="none")resolved.name+=` (${titleUnit(v.eggAdded)})`;
    if(v.eggPrep==="other"&&v.eggOther)resolved.name+=` — ${v.eggOther}`;
    resolved.serving="1 Egg";resolved.source="Guided Preparation Estimate · Review Ingredients";
  } else if(food.id==="scrambled-eggs"||food.id==="omelette"){
    const fat={none:0,spray:5,oil:40,butter:36,margarine:34}[v.eggDishFat]||0;
    const liquid={none:0,water:0,milk:12,"cottage-cheese":25,cream:35}[v.eggDishLiquid]||0;
    const extras=food.id==="omelette"?{plain:0,cheese:55,"ham-cheese":85,"bacon-cheese":105,vegetables:25,custom:0}:{plain:0,cheese:55,bacon:55,ham:30,vegetables:25,custom:0};
    addCalories(fat+liquid+(extras[v.eggDishExtra]||0));
    const appliance={stovetop:"Stovetop",microwave:"Microwave",oven:"Oven-Baked","air-fryer":"Air-Fried",other:"Other Method"}[v.eggDishAppliance]||titleUnit(v.eggDishAppliance);
    resolved.name=`${food.name}, ${appliance}`;
    if(v.eggDishLiquid!=="none")resolved.name+=` + ${titleUnit(v.eggDishLiquid)}`;
    if(v.eggDishExtra!=="plain"&&v.eggDishExtra!=="custom")resolved.name+=` + ${titleUnit(v.eggDishExtra.replace(/-/g," "))}`;
    if(v.eggDishExtra==="custom")resolved.source="Quick Estimate Only · Use Recipe Builder for Exact Custom Ingredients";
  } else if(food.id==="potato"){
    const per100={raw:77,boiled:77,steamed:80,microwaved:82,baked:93,roasted:150,"air-fried":135,mashed:88,fried:290,other:90};let cal=per100[v.potatoPrep]||77;
    const add={none:0,milk:12,"milk-margarine":42,"milk-dairyblend":38,"milk-butter":50,oil:45}[v.potatoAdded]||0;cal+=add;const ratio=(cal*1.5)/116;resolved.nutrients=Object.fromEntries(Object.entries(food.nutrients).map(([k,val])=>[k,val==null?val:Number(val)*ratio]));resolved.nutrients.calories=cal*1.5;resolved.name=`Potato, ${titleUnit(v.potatoSkin)}, ${titleUnit(v.potatoPrep.replace(/-/g," "))}`;if(v.potatoAdded!=="none")resolved.name+=` (${titleUnit(v.potatoAdded.replace(/-/g," "))})`;resolved.source="Guided Preparation Estimate · 150 g Serving";
  } else if(["beef-sausage","beef-steak","beef-rissole","chicken-breast"].includes(food.id)){
    addCalories({none:0,spray:5,oil:40,butter:36,margarine:34}[v.cookFat]||0);resolved.name=`${food.name.replace(/, (Cooked|Grilled)$/i,"")}, ${titleUnit(v.cookMethod.replace(/-/g," "))}`;if(v.cookFat!=="none")resolved.name+=` + ${titleUnit(v.cookFat)}`;resolved.source="Guided Cooking-Method Estimate · Review Quantity";
  }
  resolved.variantSelections=v;return resolved;
}
function renderVariantOptions(food,existing={}){
  const holder=by("entry-variant-options"),schema=variantSchema(food);if(!holder)return;
  holder.classList.toggle("hidden",!schema);if(!schema){holder.innerHTML="";return;}
  const values={...schema.defaults,...existing};
  const visibleFields=schema.fields.filter(field=>{
    if(food.id==="egg"&&field.key==="eggAdded")return values.eggPrep==="fried";
    return true;
  });
  const otherKey=food.id==="egg"?"eggPrep":(["scrambled-eggs","omelette"].includes(food.id)?"eggDishAppliance":food.id==="potato"?"potatoPrep":"cookMethod");
  const otherValue=values[otherKey];
  holder.innerHTML=`<h3>Choose the Exact Food and Preparation</h3><p class="fine">Only choices that can affect identification or nutrition are shown. Review each selection.</p><div class="form-grid">${visibleFields.map(field=>`<label>${esc(field.label)}<select data-variant-key="${esc(field.key)}">${field.options.map(([value,label])=>`<option value="${esc(value)}" ${values[field.key]===value?"selected":""}>${esc(label)}</option>`).join("")}</select></label>`).join("")}${otherValue==="other"?`<label class="variant-other-note">Describe the Other Cooking Method<input data-variant-key="${food.id==="egg"?"eggOther":["scrambled-eggs","omelette"].includes(food.id)?"eggDishOther":food.id==="potato"?"potatoOther":"cookOther"}" value="${esc(values[food.id==="egg"?"eggOther":["scrambled-eggs","omelette"].includes(food.id)?"eggDishOther":food.id==="potato"?"potatoOther":"cookOther"]||"")}" placeholder="Briefly describe how it was cooked"></label>`:""}</div>${otherValue==="other"?'<p class="variant-help">Other methods are kept as a reviewed description. This trial will not silently guess calories from an unknown cooking method.</p>':""}`;
  qa("[data-variant-key]").forEach(el=>el.addEventListener(el.tagName==="SELECT"?"change":"input",()=>{if(el.tagName==="SELECT")renderVariantOptions(food,selectedVariantValues());updateEntryPreview();}));
}


function statusLabel(status){ return status === "planned" ? "Planned" : status === "skipped" ? "Skipped" : "Eaten / Drunk"; }
function relativeDateLabel(value){
  const today=isoToday(),tomorrow=shiftISO(today,1),yesterday=shiftISO(today,-1),formatted=formatDate(value);
  if(value===today)return `Today · ${formatted}`;
  if(value===tomorrow)return `Tomorrow · ${formatted}`;
  if(value===yesterday)return `Yesterday · ${formatted}`;
  return formatted;
}
function contextDate(context){
  if(context==="diary")return by("diary-date")?.value||ext.ui.diaryDate||isoToday();
  if(context==="planner")return by("planner-date")?.value||ext.ui.plannerDate||ext.ui.diaryDate||isoToday();
  return by("progress-date")?.value||ext.ui.progressDate||ext.ui.diaryDate||isoToday();
}
function updateDateControl(context,value){
  const input=by(`${context}-date`),label=by(`${context}-date-label`);if(input)input.value=value;if(label)label.textContent=relativeDateLabel(value);
}
let daySettingsDirty=false;
let daySettingsBaseline={type:"normal",targetCal:0};
function setDaySettingsDirty(dirty){daySettingsDirty=!!dirty;by("save-day-settings")?.classList.toggle("hidden",!daySettingsDirty);}
function updateDaySettingsDirty(){
  const current={type:by("day-type")?.value||"normal",targetCal:whole(by("day-cal-target")?.value)};
  setDaySettingsDirty(current.type!==daySettingsBaseline.type||current.targetCal!==daySettingsBaseline.targetCal);
}
function applyContextDate(context,value){
  if(context==="diary"){ext.ui.diaryDate=value;updateDateControl("diary",value);renderDiary();}
  else if(context==="planner"){ext.ui.plannerDate=value;updateDateControl("planner",value);clearPlannerResults();}
  else{ext.ui.progressDate=value;updateDateControl("progress",value);renderDailyProgress();}
  saveExt();
}
function requestContextDate(context,value){
  if(context==="diary"&&daySettingsDirty){promptUnsavedDaySettings(()=>applyContextDate(context,value));return;}
  applyContextDate(context,value);
}
function initialiseDateControls(){
  ["diary","planner","progress"].forEach(context=>{
    const control=by(`${context}-date-control`),input=by(`${context}-date`);if(!control||!input)return;
    let startX=null;
    control.addEventListener("touchstart",event=>{startX=event.changedTouches?.[0]?.clientX??null;},{passive:true});
    control.addEventListener("touchend",event=>{if(startX===null)return;const endX=event.changedTouches?.[0]?.clientX??startX,delta=endX-startX;startX=null;if(Math.abs(delta)>45)requestContextDate(context,shiftISO(contextDate(context),delta<0?1:-1));},{passive:true});
    input.addEventListener("change",()=>requestContextDate(context,input.value||isoToday()));
  });
}
document.addEventListener("click",event=>{
  const shift=event.target.closest("[data-date-shift]");if(shift){const context=shift.dataset.dateTarget;requestContextDate(context,shiftISO(contextDate(context),n(shift.dataset.dateShift)));return;}
  const picker=event.target.closest("[data-date-picker]");if(picker){const input=by(`${picker.dataset.datePicker}-date`);if(input?.showPicker)input.showPicker();else input?.click();}
});

function renderHomeSummary(){
  if(!by("a05-home-summary")) return;
  const date = isoToday();
  const {nutrients,hydration,steps,goals} = daySummary(date);
  by("a05-home-date").textContent = formatDate(date);
  const settings = ext.daySettings[date];
  by("a05-home-context").textContent = settings?.type === "fasting" ? `Flexible fasting day · ${goals.baseCalories} Cal target` : "Your live progress comes directly from your diary entries.";
  const cards = [
    ["Energy",nutrients.calories,goals.calories,"Cal",false],["Protein",nutrients.protein,goals.protein,"g",false],
    ["Fluids",hydration.drinks,goals.hydration,"mL",false],["Steps",steps,goals.steps,"",false]
  ];
  by("a05-home-summary").innerHTML = cards.map(([label,value,target,unit]) => progressCard(label,value,target,unit,label === "Energy" ? "energy" : "positive",date)).join("");
}
window.renderAlpha05Home = renderHomeSummary;

function progressState(value,target,type,date){
  const ratio = target ? value/target : 0;
  if(type === "limit") return ratio > 1 ? ["red","Above Target"] : ratio > .75 ? ["yellow","Approaching Target"] : ["green","Within Range"];
  if(type === "energy" && ratio > 1.1) return ["red","Above Today’s Plan"];
  const now = new Date();
  const isToday = date === isoToday();
  const expected = isToday ? Math.min(1,Math.max(.08,(now.getHours()+now.getMinutes()/60-6)/16)) : 1;
  if(ratio >= expected*.75 && ratio <= Math.max(expected*1.35,1.05)) return ["green","On Track"];
  if(ratio >= expected*.45) return ["yellow","Worth Checking"];
  return ["neutral",isToday ? "Early / Still Building" : "Below Goal"];
}
function progressCard(label,value,target,unit,type,date){
  const [state,text] = progressState(value,target,type,date);
  const pct = Math.min(100,Math.max(0,target ? value/target*100 : 0));
  return `<div class="progress-card ${state}"><div><strong>${esc(label)}</strong><span>${formatNumber(value)} / ${formatNumber(target)} ${esc(unit)}</span></div><div class="progress-track"><i style="width:${pct}%"></i></div><small>${text}</small></div>`;
}
function foodGroupCard(key,value,target,date){
  const pct=Math.min(100,Math.max(0,target?value/target*100:0));
  return `<div class="food-group-card"><div><strong>${esc(FOOD_GROUP_LABELS[key])}</strong><span>${formatNumber(value,true)} of ${formatNumber(target,true)} serves</span></div><div class="progress-track"><i style="width:${pct}%"></i></div></div>`;
}

// Diary and entries
function diaryDate(){ return by("diary-date")?.value || ext.ui.diaryDate || isoToday(); }
function renderDiary(){
  const date=ext.ui.diaryDate||by("diary-date")?.value||isoToday();ext.ui.diaryDate=date;updateDateControl("diary",date);
  const goals=currentGoals(date),settings=ext.daySettings[date]||{type:"normal",targetCal:ext.dayTypeTargets?.normal||goals.baseCalories};
  by("day-type").value=settings.type||"normal";by("day-cal-target").value=n(settings.targetCal)||goals.baseCalories;
  daySettingsBaseline={type:by("day-type").value,targetCal:whole(by("day-cal-target").value)};setDaySettingsDirty(false);
  by("day-settings-note").textContent=settings.type==="fasting"?"Flexible Fasting Day for this date only.":"Normal Day. Separately logged exercise is credited according to your profile choice.";
  const summary=daySummary(date),consumed=summary.nutrients.calories,remaining=Math.max(0,summary.goals.calories-consumed);
  by("diary-day-summary").innerHTML=`<article class="summary-slide"><span>Today’s Energy</span><div class="diary-kpi-row"><div><small>Goal</small><strong>${formatNumber(summary.goals.calories)} Cal</strong></div><div><small>Consumed</small><strong>${formatNumber(consumed)} Cal</strong></div><div><small>Remaining</small><strong>${formatNumber(remaining)} Cal</strong></div></div></article><article class="summary-slide"><span>Macronutrients</span><div class="diary-kpi-row"><div><small>Protein</small><strong>${formatNumber(summary.nutrients.protein)} g</strong></div><div><small>Fat</small><strong>${formatNumber(summary.nutrients.fat)} g</strong></div><div><small>Carbs</small><strong>${formatNumber(summary.nutrients.carbs)} g</strong></div></div></article><article class="summary-slide"><span>Five Food Groups</span><div class="mini-food-groups">${FOOD_GROUP_KEYS.map(key=>`<div><small>${esc(FOOD_GROUP_LABELS[key])}</small><strong>${formatNumber(summary.foodGroups[key],true)}/${formatNumber(summary.goals.foodGroups[key],true)}</strong></div>`).join("")}</div></article>`;
  const view=ext.ui.diaryView||"all";qa("[data-diary-view]").forEach(button=>button.classList.toggle("active",button.dataset.diaryView===view));
  const diagnostics=calculationDiagnostics(date),diagnosticBox=by("diary-calculation-status");diagnosticBox.className=`calculation-status ${diagnostics.missing.length?"warning":diagnostics.eaten.length?"ok":"neutral"}`;diagnosticBox.innerHTML=diagnostics.missing.length?`<strong>Total Needs Attention</strong><span>${diagnostics.missing.length} eaten ${diagnostics.missing.length===1?"entry is":"entries are"} excluded because energy is unavailable.</span>`:diagnostics.eaten.length?`<strong>${formatNumber(diagnostics.total)} Cal Eaten</strong><span>${diagnostics.eaten.length} ${diagnostics.eaten.length===1?"entry":"entries"} confirmed.</span>`:`<strong>No Food Confirmed Yet</strong><span>Plan first, then confirm meals as the day unfolds.</span>`;
  const entries=entriesForDate(date);
  by("diary-meals").innerHTML=mealNames().map(meal=>{const allMealEntries=entries.filter(e=>e.meal===meal),shown=allMealEntries.filter(e=>view==="all"||e.status===view),projectedTotals=sumNutrients(allMealEntries.filter(e=>e.status!=="skipped")),eaten=allMealEntries.filter(e=>e.status==="eaten").length,planned=allMealEntries.filter(e=>e.status==="planned").length;return `<section class="meal-list-section" data-meal-name="${esc(meal)}"><header class="meal-list-heading"><div><h3>${esc(meal)}</h3><strong>${formatNumber(projectedTotals.calories)} Cal</strong></div><small>${planned?`${eaten} Eaten · ${planned} Planned`:eaten?"Complete":"Nothing Planned"}</small></header><div class="meal-simple-list">${shown.length?shown.map(entryCard).join(""):`<p class="meal-empty">${view==="all"?"No Entries Yet.":`No ${titleUnit(view)} Entries.`}</p>`}</div><footer class="meal-list-actions"><button data-add-to-meal="${esc(meal)}" aria-label="Add food to ${esc(meal)}">＋</button><button data-meal-menu="${esc(meal)}" aria-label="More ${esc(meal)} actions">•••</button></footer><div class="meal-menu-actions hidden" data-meal-actions="${esc(meal)}">${allMealEntries.length?`<button data-save-meal-template="${esc(meal)}">Save as Reusable Meal</button>${planned?`<button data-mark-meal-eaten="${esc(meal)}">Ate as Planned</button>`:""}`:`<span>No Meal Actions Yet.</span>`}</div></section>`;}).join("");saveExt();
}
function entryCard(entry){
  const icon=entry.status==="eaten"?"✓":entry.status==="skipped"?"—":"○",label=entry.status==="eaten"?"Eaten":entry.status==="skipped"?"Skipped":"Planned";
  return `<article class="simple-diary-entry ${entry.status}-entry" data-entry-id="${esc(entry.id)}"><button class="entry-open" data-entry-edit="${esc(entry.id)}"><span><strong>${esc(entry.name)}</strong><small>${icon} ${formatNumber(entry.amount,true)} ${esc(entry.unitLabel||entry.unit)} <em class="entry-status-chip">${label}</em></small></span><b>${formatNumber(entry.nutrients?.calories)} Cal</b></button><button class="entry-more" data-entry-menu="${esc(entry.id)}" aria-label="More actions for ${esc(entry.name)}">•••</button><div class="entry-inline-actions hidden" data-entry-actions="${esc(entry.id)}">${entry.status==="planned"?`<button data-entry-eaten="${esc(entry.id)}">✓ Eaten</button>`:""}<button data-entry-copy="${esc(entry.id)}">Copy</button><button data-entry-delete="${esc(entry.id)}" class="delete-action">Delete</button></div></article>`;
}
function addEntry(entry){
  const date = entry.date || isoToday();
  ext.diary[date] ||= [];
  ext.diary[date].push(entry);
  saveExt();
}
function findEntry(id){
  for(const [date,list] of Object.entries(ext.diary)){
    const index = list.findIndex(e => e.id === id);
    if(index >= 0) return {date,index,entry:list[index]};
  }
  return null;
}

let editorState = null;
function prepareEntry(food,{entry=null,date=null,meal=null,status="eaten",source=null}={}){
  if(!food)return;const defaultDate=date||ext.ui.diaryDate||isoToday();
  const planContext=!!(meal||ext.ui.pendingMeal||ext.ui.recentPlanMode);const automaticStatus=entry?.status||(status!=="eaten"?status:(defaultDate>isoToday()||planContext?"planned":"eaten"));
  editorState={foodId:food.id,entryId:entry?.id||null,returnTo:"food-diary",source:source||food.source,variantSelections:entry?.variantSelections||{}};
  by("entry-editor-title").textContent=entry?`Edit ${entry.name}`:`Review ${food.name}`;by("entry-date").value=entry?.date||defaultDate;by("entry-meal").value=entry?.meal||meal||ext.ui.pendingMeal||"Breakfast";by("entry-status").value=automaticStatus;by("entry-time").value=entry?.time||localClock();by("entry-notes").value=entry?.notes||"";
  by("entry-unit").innerHTML=Object.keys(unitOptions(food)).map(unit=>`<option value="${esc(unit)}">${esc(unitLabel(food,unit))}</option>`).join("");by("entry-unit").value=entry?.unit||defaultUnit(food);by("entry-amount").value=entry?.amount??defaultAmount(food);
  renderVariantOptions(food,entry?.variantSelections||{});const safety=foodSafety(food);by("entry-source-warning").innerHTML=`<strong>${food.verified?"Verified Trial Source":"Review the Source"}</strong><p>${esc(food.source||"Source not supplied")}. ${safety.blocked?`<b class="danger-text">${esc(safety.message)}</b>`:"Check the quantity and details before adding."}</p>`;
  by("save-food-entry").textContent=entry?"Save Changes":(automaticStatus==="planned"?"Add to Plan":"Add to Diary");by("save-food-entry-and-food").classList.toggle("hidden",entry||ext.savedFoodIds.includes(food.id));updateEntryPreview();openFeature("food-entry-editor");
}
function updateEntryPreview(){
  if(!editorState)return;const baseFood=getFood(editorState.foodId);if(!baseFood)return;const food=resolveVariantFood(baseFood,selectedVariantValues()),amount=by("entry-amount").value,unit=by("entry-unit").value,values=scaledNutrients(food,amount,unit);
  by("entry-nutrition-preview").innerHTML=`<div class="food-detail-title"><div><h3>${esc(food.name)}</h3><p>${esc(food.brand||"")} · ${esc(food.serving||"")}</p></div><span class="health-score score-${Math.min(10,whole(food.score))}">${whole(food.score)}/10</span></div>${nutritionCards(values)}<p class="fine"><strong>Why This Score:</strong> ${esc(scoreExplanation(food.score))}</p>`;
  if(by("entry-selection-summary"))by("entry-selection-summary").innerHTML=`<strong>You Are Adding: ${formatNumber(amount,true)} ${esc(unitLabel(food,unit))}</strong><span>${energyText(values.calories)} · ${by("entry-status").value==="planned"?"Planned":"Eaten / Drunk"}</span>`;
}
by("entry-amount")?.addEventListener("input",updateEntryPreview);
by("entry-unit")?.addEventListener("change",()=>{if(by("entry-amount"))by("entry-amount").value=1;updateEntryPreview();});
by("entry-status")?.addEventListener("change",updateEntryPreview);
by("entry-editor-back")?.addEventListener("click",() => openFeature(editorState?.returnTo || "food-library"));
function saveEditorEntry(andSaveFood=false){
  const baseFood = getFood(editorState?.foodId);
  if(!baseFood) return;
  const food=resolveVariantFood(baseFood,selectedVariantValues());
  const amount = n(by("entry-amount").value);
  const unit = by("entry-unit").value;
  if(amount <= 0){ showActionToast("Enter an amount greater than zero."); return; }
  const date = by("entry-date").value || isoToday();
  const values = scaledNutrients(food,amount,unit);
  if(!hasEnergyValue(values.calories)){
    showActionToast(`${food.name} has no usable energy value. Add or correct its Calories before logging it.`,null,8000);
    return;
  }
  const record = {
    id:editorState.entryId || uid("entry"),foodId:baseFood.id,name:food.name,brand:food.brand || "",date,meal:by("entry-meal").value,status:by("entry-status").value,
    amount,unit,unitLabel:unitLabel(food,unit),time:by("entry-time").value,notes:by("entry-notes").value,nutrients:values,foodGroups:scaledFoodGroups(food,amount,unit),waterMl:scaledWaterMl(food,amount,unit),hydrationType:food.hydrationType||"food",score:food.score,source:food.source || editorState.source,variantSelections:food.variantSelections||{},createdAt:new Date().toISOString(),localDate:date,timeZone:activeTimeZone()
  };
  if(editorState.entryId){
    const found = findEntry(editorState.entryId);
    if(found){ ext.diary[found.date].splice(found.index,1); if(!ext.diary[found.date].length) delete ext.diary[found.date]; }
  }
  if(ext.ui.replacingEntryId && !editorState.entryId){
    const replaced=findEntry(ext.ui.replacingEntryId);if(replaced){ext.diary[replaced.date].splice(replaced.index,1);if(!ext.diary[replaced.date].length)delete ext.diary[replaced.date];}
    ext.ui.replacingEntryId="";ext.ui.pendingMeal="";
  }
  addEntry(record);
  if(andSaveFood && !ext.savedFoodIds.includes(food.id)) ext.savedFoodIds.push(food.id);
  ext.ui.diaryDate = date;
  saveExt();
  const itemEnergy = formatNumber(values.calories);
  const dailyTotal = formatNumber(dayNutrition(date,["eaten"]).calories);
  const confirmation = record.status === "planned"
    ? `${food.name} planned — ${itemEnergy} Cal. Planned food is not counted as eaten.`
    : `${food.name} ${editorState.entryId ? "updated" : "added"} — ${itemEnergy} Cal. New daily total: ${dailyTotal} Cal.`;
  showActionToast(confirmation,null,8000);
  openFeature("food-diary");
}
by("save-food-entry")?.addEventListener("click",() => saveEditorEntry(false));
by("save-food-entry-and-food")?.addEventListener("click",() => saveEditorEntry(true));

by("day-type")?.addEventListener("change",()=>{
  const type=by("day-type").value,target=type==="fasting"?(n(ext.dayTypeTargets?.fasting)||500):(n(ext.dayTypeTargets?.normal)||recommendedNormalTarget());by("day-cal-target").value=whole(target);by("day-settings-note").textContent=type==="fasting"?"Flexible Fasting Day for this date only.":"Normal Day. Separately logged exercise is credited according to your profile choice.";updateDaySettingsDirty();refreshDiaryEnergyPreview(target);
});
by("day-cal-target")?.addEventListener("input",updateDaySettingsDirty);
qa("[data-diary-view]").forEach(button=>button.addEventListener("click",()=>{ext.ui.diaryView=button.dataset.diaryView;saveExt();renderDiary();}));
document.addEventListener("click",event => {
  const add = event.target.closest("[data-add-to-meal]");
  if(add){ ext.ui.recentPlanMode=false;ext.ui.pendingMeal=add.dataset.addToMeal;ext.ui.libraryTab="all";saveExt();openFeature("food-library");return; }
  const edit = event.target.closest("[data-entry-edit]");
  if(edit){ const found=findEntry(edit.dataset.entryEdit); if(found) prepareEntry(getFood(found.entry.foodId) || snapshotFood(found.entry),{entry:found.entry}); return; }
  const menu=event.target.closest("[data-entry-menu]");
  if(menu){const panel=q(`[data-entry-actions="${CSS.escape(menu.dataset.entryMenu)}"]`);panel?.classList.toggle("hidden");return;}
  const mealMenu=event.target.closest("[data-meal-menu]");
  if(mealMenu){q(`[data-meal-actions="${CSS.escape(mealMenu.dataset.mealMenu)}"]`)?.classList.toggle("hidden");return;}
  const eaten = event.target.closest("[data-entry-eaten]");
  if(eaten){ const found=findEntry(eaten.dataset.entryEaten);if(found){found.entry.status="eaten";saveExt();renderDiary();const total=dayNutrition(found.entry.date,["eaten"]).calories;showActionToast(`${found.entry.name} marked as eaten — ${energyText(found.entry.nutrients?.calories)}. New daily total: ${formatNumber(total)} Cal.`,null,8000);}return; }
  const markMeal=event.target.closest("[data-mark-meal-eaten]");
  if(markMeal){const date=diaryDate(),items=entriesForDate(date).filter(e=>e.meal===markMeal.dataset.markMealEaten&&e.status==="planned");items.forEach(e=>e.status="eaten");saveExt();renderDiary();renderDailyProgress();showActionToast(items.length?`${items.length} planned ${items.length===1?"item":"items"} marked eaten.`:"There were no planned items to mark eaten.",null,5500);return;}
  const del = event.target.closest("[data-entry-delete]");
  if(del){ requestDeleteEntry(del.dataset.entryDelete);return; }
  const copy = event.target.closest("[data-entry-copy]");
  if(copy){ requestCopyEntry(copy.dataset.entryCopy);return; }
  const template = event.target.closest("[data-save-meal-template]");
  if(template){ saveMealTemplatePrompt(template.dataset.saveMealTemplate);return; }
});
function saveDaySettings(showMessage=true){
  const date=diaryDate(),type=by("day-type").value,targetCal=whole(by("day-cal-target").value);ext.dayTypeTargets||={normal:recommendedNormalTarget(),fasting:500};ext.dayTypeTargets[type]=targetCal;ext.daySettings[date]={type,targetCal};saveExt();daySettingsBaseline=clone(ext.daySettings[date]);setDaySettingsDirty(false);renderDiary();if(showMessage)showActionToast("Day Settings Saved.",null,5000);
}
by("save-day-settings")?.addEventListener("click",()=>saveDaySettings(true));

function snapshotFood(entry){
  return {id:entry.foodId || uid("snapshot"),name:entry.name,brand:entry.brand,defaultAmount:entry.amount,defaultUnit:entry.unit,units:{[entry.unit]:1/entry.amount},unitLabels:{[entry.unit]:entry.unitLabel},serving:`${entry.amount} ${entry.unitLabel}`,nutrients:entry.nutrients,foodGroups:entry.foodGroups||{},waterMl:n(entry.waterMl),hydrationType:entry.hydrationType||"food",score:entry.score,source:entry.source};
}
function requestDeleteEntry(id){
  const found=findEntry(id);if(!found)return;
  openModal(`Delete ${found.entry.name}?`,`This will remove the entry from ${formatDate(found.date)}. Your saved food or meal remains available.`,"Delete",() => {
    const removed=clone(found.entry);ext.diary[found.date].splice(found.index,1);if(!ext.diary[found.date].length)delete ext.diary[found.date];saveExt();renderDiary();showActionToast(`${removed.name} deleted.`,() => {ext.diary[found.date] ||= [];ext.diary[found.date].splice(found.index,0,removed);saveExt();renderDiary();},8000);
  });
}
function requestCopyEntry(id){
  const found=findEntry(id);if(!found)return;
  const target=shiftISO(found.date,1);
  openModal(`Copy ${found.entry.name}`,`Choose the date for the independent copy.`,`Copy`,() => {
    const date=by("modal-copy-date")?.value || target;
    const copy={...clone(found.entry),id:uid("entry"),date,localDate:date,timeZone:activeTimeZone(),createdAt:new Date().toISOString()};
    ext.diary[date] ||= [];ext.diary[date].push(copy);saveExt();showActionToast(`${copy.name} copied to ${formatDate(date)}.`,() => {ext.diary[date]=ext.diary[date].filter(e=>e.id!==copy.id);saveExt();},8000);
  },`<label>Copy To Date<input id="modal-copy-date" type="date" value="${target}"></label>`);
}
function saveMealTemplatePrompt(meal){
  const date=diaryDate();const entries=entriesForDate(date).filter(e=>e.meal===meal);if(!entries.length)return;
  openModal("Save This Meal",`Save these ${entries.length} ${entries.length===1?"item":"items"} as a reusable meal.`,`Save Meal`,() => {
    const name=by("modal-meal-name")?.value.trim() || `${meal} from ${formatDate(date)}`;
    ext.mealTemplates.push({id:uid("meal"),name,items:entries.map(e=>({...clone(e),id:undefined,date:undefined,status:"planned"})),createdAt:new Date().toISOString()});saveExt();showActionToast(`${name} saved to Saved Meals.`,null,6000);
  },`<label>Meal Name<input id="modal-meal-name" value="${esc(meal)}"></label>`);
}

// Modal and persistent action toast
let modalConfirm = null;
function openModal(title,copy,confirmLabel,onConfirm,extra=""){
  by("a05-modal-title").textContent=title;by("a05-modal-copy").textContent=copy;by("a05-modal-extra").innerHTML=extra;by("a05-modal-confirm").textContent=confirmLabel;by("a05-modal-confirm").className=confirmLabel.toLowerCase().includes("delete")?"danger-button":"primary";modalConfirm=onConfirm;const card=by("a05-modal")?.querySelector(".a05-modal-card");card?.classList.toggle("info-only",confirmLabel.toLowerCase()==="close");by("a05-modal").classList.remove("hidden");card?.scrollTo?.(0,0);
}
function closeModal(){by("a05-modal").classList.add("hidden");modalConfirm=null;by("a05-modal")?.querySelector(".a05-modal-card")?.classList.remove("info-only");if(by("a05-modal-cancel"))by("a05-modal-cancel").textContent="Cancel";}

by("a05-modal-cancel")?.addEventListener("click",closeModal);
by("a05-modal-close")?.addEventListener("click",closeModal);
by("a05-modal")?.addEventListener("click",event=>{if(event.target===by("a05-modal"))closeModal();});
by("a05-modal-confirm")?.addEventListener("click",() => {const fn=modalConfirm;closeModal();fn?.();});
let toastUndo=null,toastTimer=null;
function showActionToast(copy,action=null,duration=6000){
  clearTimeout(toastTimer);toastUndo=action;by("a05-toast-copy").textContent=copy;by("a05-toast-action").classList.toggle("hidden",!action);by("a05-action-toast").classList.add("show");toastTimer=setTimeout(()=>{by("a05-action-toast").classList.remove("show");toastUndo=null;},duration);
}
by("a05-toast-action")?.addEventListener("click",() => {const fn=toastUndo;by("a05-action-toast").classList.remove("show");toastUndo=null;fn?.();showActionToast("Action undone.",null,4000);});

// Food library
function editDistance(a,b){
  const left=String(a),right=String(b);const rows=Array.from({length:left.length+1},()=>Array(right.length+1).fill(0));
  for(let i=0;i<=left.length;i++)rows[i][0]=i;for(let j=0;j<=right.length;j++)rows[0][j]=j;
  for(let i=1;i<=left.length;i++)for(let j=1;j<=right.length;j++)rows[i][j]=Math.min(rows[i-1][j]+1,rows[i][j-1]+1,rows[i-1][j-1]+(left[i-1]===right[j-1]?0:1));
  return rows[left.length][right.length];
}
function fuzzyTokenMatch(queryToken,foodToken){
  if(queryToken.length<4||foodToken.length<4||queryToken[0]!==foodToken[0])return false;
  const limit=Math.max(queryToken.length,foodToken.length)>=8?2:1;
  return editDistance(queryToken,foodToken)<=limit;
}
function searchRank(food,query){
  const nq=normalise(query);if(!nq)return 1;
  const name=normalise(food.name),brand=normalise(food.brand),aliases=(food.aliases||[]).map(normalise);
  if(name===nq)return 1300;
  if(aliases.includes(nq))return 1250;
  if(brand===nq)return 1200;
  if(name.startsWith(nq)||aliases.some(alias=>alias.startsWith(nq)))return 1050;
  const queryTokens=nq.split(" ").filter(Boolean);
  const fieldTokens=[name,brand,...aliases].flatMap(value=>value.split(" ").filter(Boolean));
  const tokenSet=new Set(fieldTokens);
  if(queryTokens.every(token=>tokenSet.has(token)))return 900+queryTokens.length;
  if(name.includes(nq)||aliases.some(alias=>alias.includes(nq)))return 760;
  if(queryTokens.every(token=>fieldTokens.some(field=>field===token||fuzzyTokenMatch(token,field))))return 620+queryTokens.length;
  return 0;
}
function foodRecordType(food){
  if(food.category==="Recipe"||food.brand==="My Recipe")return "My Recipe";
  if(food.source==="User Created")return "My Food";
  if(food.verified&&food.brand)return "Verified Product";
  if(food.verified)return "Verified Food";
  return "Australian Trial Record";
}
function activeLibraryTab(){return ext.ui.libraryTab||"all";}
function recentGroups(days=14){
  const start=shiftISO(isoToday(),-(days-1)),groups=[];Object.keys(ext.diary).filter(date=>date>=start&&date<=isoToday()).sort().reverse().forEach(date=>{plannerMealNames().concat(["Other"]).forEach(meal=>{const items=entriesForDate(date).filter(e=>e.meal===meal&&e.status!=="skipped");if(items.length)groups.push({date,meal,items});});});return groups;
}
function renderRecentLibrary(query=""){
  const nq=normalise(query),groups=recentGroups(14).map(g=>({...g,items:g.items.filter(e=>!nq||normalise(`${e.name} ${e.brand||""}`).includes(nq))})).filter(g=>g.items.length);
  by("food-results").innerHTML=groups.length?groups.map(g=>`<section class="recent-meal-group"><header><div><strong>${esc(g.meal)}</strong><small>${esc(relativeDateLabel(g.date))}</small></div><button data-recent-meal-add="${esc(g.date)}|${esc(g.meal)}">Add Meal to Plan</button></header>${g.items.map(e=>`<div class="recent-entry-row"><span><strong>${esc(e.name)}</strong><small>${formatNumber(e.amount,true)} ${esc(e.unitLabel||e.unit)} · ${formatNumber(e.nutrients?.calories)} Cal</small></span><button data-recent-entry-add="${esc(e.id)}" aria-label="Add ${esc(e.name)} to plan">＋</button></div>`).join("")}</section>`).join(""):`<div class="resource-empty"><strong>No Recent Foods Yet.</strong><p>Foods and meals from the last 14 days will appear here for quick reuse.</p></div>`;
}
function copyRecentEntry(entry,targetDate,targetMeal){const copy={...clone(entry),id:uid("entry"),date:targetDate,localDate:targetDate,meal:targetMeal,status:"planned",time:localClock(),createdAt:new Date().toISOString(),timeZone:activeTimeZone()};ext.diary[targetDate]||=[];ext.diary[targetDate].push(copy);return copy;}
function renderLibrary(){
  qa("[data-library-tab]").forEach(b=>b.classList.toggle("active",b.dataset.libraryTab===activeLibraryTab()));by("food-search").value=ext.ui.foodSearch||"";const context=by("library-entry-context");if(context){const pending=ext.ui.pendingMeal;context.classList.toggle("hidden",!pending);context.innerHTML=pending?`<span>Adding to <strong>${esc(pending)}</strong> on ${esc(relativeDateLabel(ext.ui.diaryDate||isoToday()))}</span><button data-clear-pending-meal>Cancel Adding to ${esc(pending)}</button>`:"";}
  const tab=activeLibraryTab(),query=by("food-search").value;by("online-search-actions")?.classList.toggle("hidden",tab!=="online");by("online-food-status")?.classList.toggle("hidden",tab!=="online");if(tab==="recent"){renderRecentLibrary(query);return;}if(tab==="recipes"){renderRecipeLibrary(query);renderRecipeSelectOptions();renderScanSelect();return;}if(tab==="meals"){renderMealLibrary(query);renderRecipeSelectOptions();renderScanSelect();return;}if(tab==="online"){renderOnlineLibrary(query);return;}
  const libraryFoods=tab==="saved"?allFoods().filter(food=>ext.savedFoodIds.includes(food.id)):allFoods().filter(food=>food.category!=="Recipe");const ranked=libraryFoods.filter(food=>tab==="custom"?food.source==="User Created":true).map(food=>({food,rank:searchRank(food,query)})).filter(item=>item.rank>0).sort((a,b)=>b.rank-a.rank||Number(b.food.country==="Australia")-Number(a.food.country==="Australia")||a.food.name.localeCompare(b.food.name));const strongMatch=ranked.some(item=>item.rank>=760),visible=query?ranked.filter(item=>item.rank>=(strongMatch?760:620)):ranked;const closeNote=query&&visible.length&&!strongMatch?`<div class="search-guidance compact-search-guidance"><strong>Showing close spelling matches for “${esc(query)}”</strong></div>`:"";by("food-results").innerHTML=visible.length?`${closeNote}${visible.map(item=>resourceFoodRow(item.food)).join("")}`:`<div class="resource-empty"><strong>No Close Match Found.</strong><p>Try fewer words or create a private food entry.</p></div>`;renderRecipeSelectOptions();renderScanSelect();
}
function resourceFoodRow(food){
  const saved=ext.savedFoodIds.includes(food.id),safety=foodSafety(food);
  return `<article class="resource-row ${safety.blocked?"food-warning":""}"><button class="resource-main" data-food-details="${esc(food.id)}"><strong>${esc(food.name)}</strong><small>${esc([food.brand,food.serving,energyText(food.nutrients?.calories)].filter(Boolean).join(" · "))}</small></button><button class="resource-save ${saved?"saved":""}" data-food-save="${esc(food.id)}" aria-label="${saved?"Remove from":"Save to"} Favourite Foods">${saved?"✓":"☆"}</button><button class="resource-add" data-food-add="${esc(food.id)}" aria-label="Review and add ${esc(food.name)}">＋</button></article>`;
}
function foodCard(food){return resourceFoodRow(food);}
document.addEventListener("click",event=>{
  const tab=event.target.closest("[data-library-tab]");if(tab){ext.ui.libraryTab=tab.dataset.libraryTab;by("resource-add-menu")?.classList.add("hidden");saveExt();renderLibrary();return;}
  const add=event.target.closest("[data-food-add]");if(add){const food=getFood(add.dataset.foodAdd);prepareEntry(food,{date:ext.ui.diaryDate||isoToday(),meal:ext.ui.pendingMeal||"Breakfast",status:ext.ui.pendingMeal?"planned":"eaten"});return;}
  const save=event.target.closest("[data-food-save]");if(save){toggleSavedFood(save.dataset.foodSave);return;}
  const details=event.target.closest("[data-food-details]");if(details){showFoodDetails(details.dataset.foodDetails);return;}
  const recipeAdd=event.target.closest("[data-recipe-add]");if(recipeAdd){prepareEntry(getFood(recipeAdd.dataset.recipeAdd),{date:ext.ui.diaryDate||isoToday(),meal:ext.ui.pendingMeal||"Dinner"});return;}
  const mealAdd=event.target.closest("[data-meal-add]");if(mealAdd){addMealTemplate(mealAdd.dataset.mealAdd);return;}
  const mealDelete=event.target.closest("[data-meal-delete]");if(mealDelete){deleteMealTemplate(mealDelete.dataset.mealDelete);return;}
  if(event.target.closest("[data-clear-pending-meal]")){ext.ui.pendingMeal="";saveExt();renderLibrary();return;}
});
document.addEventListener("click",event=>{
  const one=event.target.closest("[data-recent-entry-add]");if(one){const found=findEntry(one.dataset.recentEntryAdd);if(!found)return;const targetDate=ext.ui.recentPlanMode?(ext.ui.plannerDate||isoToday()):(ext.ui.diaryDate||isoToday()),targetMeal=ext.ui.pendingMeal||found.entry.meal;const copy=copyRecentEntry(found.entry,targetDate,targetMeal);saveExt();showActionToast(`${copy.name} added to ${targetMeal} as Planned.`,null,4500);return;}
  const meal=event.target.closest("[data-recent-meal-add]");if(meal){const [sourceDate,sourceMeal]=meal.dataset.recentMealAdd.split("|"),items=entriesForDate(sourceDate).filter(e=>e.meal===sourceMeal&&e.status!=="skipped"),targetDate=ext.ui.recentPlanMode?(ext.ui.plannerDate||isoToday()):(ext.ui.diaryDate||isoToday()),targetMeal=ext.ui.pendingMeal||sourceMeal;items.forEach(e=>copyRecentEntry(e,targetDate,targetMeal));saveExt();showActionToast(`${items.length} ${items.length===1?"item":"items"} added to ${targetMeal} as Planned.`,null,5000);return;}
});
by("browse-planner-recent")?.addEventListener("click",()=>{ext.ui.recentPlanMode=true;ext.ui.libraryTab="recent";ext.ui.diaryDate=ext.ui.plannerDate||isoToday();ext.ui.pendingMeal="";saveExt();openFeature("food-library");});
by("food-search")?.addEventListener("input",()=>{ext.ui.foodSearch=by("food-search").value;saveExt();renderLibrary();});
by("clear-food-search")?.addEventListener("click",()=>{ext.ui.foodSearch="";by("food-search").value="";saveExt();renderLibrary();});
by("resource-add-button")?.addEventListener("click",event=>{event.stopPropagation();by("resource-add-menu")?.classList.toggle("hidden");});
by("close-resource-menu")?.addEventListener("click",()=>by("resource-add-menu")?.classList.add("hidden"));
document.addEventListener("click",event=>{const menu=by("resource-add-menu");if(menu&&!menu.classList.contains("hidden")&&!event.target.closest("#resource-add-menu")&&!event.target.closest("#resource-add-button"))menu.classList.add("hidden");});

function onlineNutrientRecord(list,names,preferredUnits=[]){
  const wanted=names.map(normalise),units=preferredUnits.map(x=>String(x).toUpperCase());
  const matches=(list||[]).filter(x=>wanted.includes(normalise(x.nutrientName||x.nutrient?.name)));
  if(!matches.length)return null;
  if(units.length)return matches.find(x=>units.includes(String(x.unitName||x.nutrient?.unitName||x.nutrient?.unit||"").toUpperCase()))||null;
  return matches[0];
}
function onlineNutrientValue(list,names,preferredUnits=[]){let found=onlineNutrientRecord(list,names,preferredUnits);if(!found&&preferredUnits.length)found=onlineNutrientRecord(list,names);return found?n(found.value??found.amount):0;}
function onlineEnergyKcal(list){
  const names=["Energy","Energy (Atwater General Factors)","Energy (Atwater Specific Factors)"];
  const kcal=onlineNutrientRecord(list,names,["KCAL"]);if(kcal)return n(kcal.value??kcal.amount);
  const kj=onlineNutrientRecord(list,names,["KJ"]);if(kj)return n(kj.value??kj.amount)/4.184;
  return onlineNutrientValue(list,names);
}
function makeOpenFoodFactsFood(product){
  const nu=product.nutriments||{},servingQty=n(product.serving_quantity)||100,unit=(product.serving_quantity_unit||"g").toLowerCase().includes("ml")?"mL":"g";const per100={calories:n(nu["energy-kcal_100g"]),protein:n(nu.proteins_100g),carbs:n(nu.carbohydrates_100g),fat:n(nu.fat_100g),satFat:n(nu["saturated-fat_100g"]),fibre:n(nu.fiber_100g),sugar:n(nu.sugars_100g),sodium:n(nu.sodium_100g)*1000};
  const factor=servingQty/100,nutrients=Object.fromEntries(Object.entries(per100).map(([k,v])=>[k,v*factor]));
  return {id:`off-${product.code}`,barcode:product.code,name:product.product_name||product.generic_name||`Barcode ${product.code}`,brand:product.brands||"",category:"Online Product",country:(product.countries||"").includes("Australia")?"Australia":"International",aliases:[product.product_name,product.brands].filter(Boolean),defaultAmount:servingQty,defaultUnit:unit,units:{[unit]:1/servingQty,g:unit==="g"?1/servingQty:undefined,mL:unit==="mL"?1/servingQty:undefined},unitLabels:{[unit]:`${unit} (${servingQty} ${unit} serving)`},serving:product.serving_size||`${servingQty} ${unit}`,nutrients,foodGroups:{},waterMl:unit==="mL"?servingQty*.9:0,hydrationType:unit==="mL"?"drink":"food",score:6,source:"Open Food Facts · community supplied; verify package",verified:false,ingredients:product.ingredients_text||"",allergens:product.allergens||[],imageUrl:product.image_front_small_url||""};
}
function makeUsdaFood(item){
  const list=item.foodNutrients||[];const nutrients={calories:onlineEnergyKcal(list),protein:onlineNutrientValue(list,["Protein"],["G"]),carbs:onlineNutrientValue(list,["Carbohydrate, by difference"],["G"]),fat:onlineNutrientValue(list,["Total lipid (fat)"],["G"]),satFat:onlineNutrientValue(list,["Fatty acids, total saturated"],["G"]),fibre:onlineNutrientValue(list,["Fiber, total dietary"],["G"]),sugar:onlineNutrientValue(list,["Sugars, total including NLEA","Total Sugars"],["G"]),sodium:onlineNutrientValue(list,["Sodium, Na"],["MG"])};
  const moisture=onlineNutrientValue(list,["Water"],["G"]);
  return {id:`usda-${item.fdcId}`,fdcId:item.fdcId,name:item.description||"USDA Food",brand:item.brandOwner||item.brandName||"USDA",category:"Online Generic Food",country:"International",aliases:[item.description,item.brandOwner].filter(Boolean),defaultAmount:100,defaultUnit:"g",units:{g:.01,serving:1},unitLabels:{g:"g",serving:"100 g reference"},serving:"100 g reference",nutrients,foodGroups:{},waterMl:moisture,hydrationType:"food",score:6,source:"USDA FoodData Central · verify applicability to Australian product",verified:false,ingredients:item.ingredients||"",allergens:[]};
}
function upsertOnlineFoods(foods){foods.forEach(food=>{if(!food?.id||!food?.nutrients||!hasEnergyValue(food.nutrients.calories))return;const i=ext.onlineFoods.findIndex(x=>x.id===food.id);if(i>=0)ext.onlineFoods[i]=food;else ext.onlineFoods.push(food);});saveExt();}
async function searchOpenFoodFacts(query){
  const fields="code,product_name,generic_name,brands,countries,countries_tags,nutriments,serving_size,serving_quantity,serving_quantity_unit,ingredients_text,allergens,image_front_small_url";
  const url=`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=24&fields=${encodeURIComponent(fields)}`;
  const response=await fetch(url,{headers:{Accept:"application/json"}});if(!response.ok)throw new Error(`Open Food Facts ${response.status}`);const data=await response.json();return (data.products||[]).map(makeOpenFoodFactsFood).filter(f=>hasEnergyValue(f.nutrients.calories));
}
async function searchUsda(query){
  const settings=ext.foodDataSettings||{},key=settings.usdaKey||"DEMO_KEY";const url=`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}&pageSize=20`;
  const response=await fetch(url,{headers:{Accept:"application/json"}});if(!response.ok)throw new Error(`FoodData Central ${response.status}`);const data=await response.json();return (data.foods||[]).map(makeUsdaFood).filter(f=>hasEnergyValue(f.nutrients.calories));
}
function renderOnlineLibrary(query=""){
  const items=(ext.onlineFoods||[]).filter(food=>!query||searchRank(food,query)>0).sort((a,b)=>Number(b.country==="Australia")-Number(a.country==="Australia")||a.name.localeCompare(b.name));
  by("food-results").innerHTML=items.length?`<div class="online-source-banner"><strong>Online results require review.</strong><p>Open Food Facts is community supplied. USDA values may not match an Australian brand. Package labels and Australian verified data take priority.</p></div>${items.map(resourceFoodRow).join("")}`:`<div class="resource-empty"><strong>No online results loaded.</strong><p>Enter at least three letters, then tap Search Online Databases.</p></div>`;
}
let onlineSearchToken=0;
async function runOnlineFoodSearch(){
  const query=by("food-search")?.value.trim();const token=++onlineSearchToken;if(!query||query.length<3){showActionToast("Enter at least three letters before searching online.",null,5000);return;}
  ext.ui.libraryTab="online";qa("[data-library-tab]").forEach(b=>b.classList.toggle("active",b.dataset.libraryTab==="online"));const status=by("online-food-status"),button=by("search-online-foods");button.disabled=true;status.textContent="Searching Open Food Facts and FoodData Central…";by("food-results").innerHTML='<div class="resource-empty">Searching online databases…</div>';
  try{
    const results=await Promise.allSettled([searchOpenFoodFacts(query),searchUsda(query)]);if(token!==onlineSearchToken||activeLibraryTab()!=="online")return;const foods=results.flatMap(r=>r.status==="fulfilled"?r.value:[]);upsertOnlineFoods(foods);status.textContent=`Loaded ${foods.length} reviewable result${foods.length===1?"":"s"}. Online records are cached on this device.`;renderOnlineLibrary(query);if(!foods.length)showActionToast("No online matches were returned. Try a broader search or scan a barcode.",null,6500);
  }finally{button.disabled=false;}
}
by("search-online-foods")?.addEventListener("click",runOnlineFoodSearch);

function toggleSavedFood(id){
  const food=getFood(id);if(!food)return;
  const idx=ext.savedFoodIds.indexOf(id);
  if(idx>=0){ext.savedFoodIds.splice(idx,1);showActionToast(`${food.name} removed from Favourite Foods.`,()=>{ext.savedFoodIds.push(id);saveExt();renderLibrary();},8000);}else{ext.savedFoodIds.push(id);showActionToast(`${food.name} saved to Favourite Foods.`,()=>{ext.savedFoodIds=ext.savedFoodIds.filter(x=>x!==id);saveExt();renderLibrary();},8000);}saveExt();renderLibrary();
}
function showFoodDetails(id){
  const food=getFood(id);if(!food)return;
  const safety=foodSafety(food),groups=scaledFoodGroups(food,defaultAmount(food),defaultUnit(food));
  openModal(food.name,`${food.serving} · ${food.source}`,"Close",()=>{},`${nutritionCards(food.nutrients)}<p><strong>Food-group contribution:</strong> ${FOOD_GROUP_KEYS.filter(key=>groups[key]>0).map(key=>`${esc(FOOD_GROUP_LABELS[key])} ${formatNumber(groups[key],true)} serve`).join(" · ")||"Not yet classified"}</p><p><strong>Estimated water:</strong> ${formatNumber(food.waterMl)} mL per listed serving</p><p><strong>Ingredients:</strong> ${esc(food.ingredients||"Not Available")}</p><p><strong>Health Score ${whole(food.score)}/10:</strong> ${esc(scoreExplanation(food.score))}</p>${safety.blocked?`<p class="danger-text"><strong>Profile warning:</strong> ${esc(safety.message)}</p>`:""}`);
  by("a05-modal-confirm").className="primary";
}
function renderRecipeLibrary(query=""){
  const recipes=ext.recipes.filter(r=>!query||searchRank(recipeAsFood(r),query)>0);
  by("food-results").innerHTML=recipes.length?recipes.map(r=>resourceFoodRow(recipeAsFood(r))).join(""):`<div class="resource-empty">No Recipes Saved Yet.</div>`;
}
function renderMealLibrary(query=""){
  const meals=ext.mealTemplates.filter(meal=>!query||normalise(meal.name).includes(normalise(query)));
  by("food-results").innerHTML=meals.length?meals.map(meal=>{const totals=sumNutrients(meal.items);return `<article class="resource-row"><button class="resource-main" data-meal-add="${esc(meal.id)}"><strong>${esc(meal.name)}</strong><small>${meal.items.length} ${meal.items.length===1?"item":"items"} · ${formatNumber(totals.calories)} Cal</small></button><button class="resource-delete" data-meal-delete="${esc(meal.id)}">•••</button><button class="resource-add" data-meal-add="${esc(meal.id)}">＋</button></article>`;}).join(""):`<div class="resource-empty">No saved meals yet. Save a meal from the Diary.</div>`;
}
function addMealTemplate(id){
  const template=ext.mealTemplates.find(m=>m.id===id);if(!template)return;
  const date=ext.ui.diaryDate||isoToday();const meal=ext.ui.pendingMeal||"Breakfast";
  openModal(`Add ${template.name}?`,`This creates independent planned entries on ${formatDate(date)}.`,"Add to Plan",()=>{
    ext.diary[date] ||= [];
    template.items.forEach(item=>ext.diary[date].push({...clone(item),id:uid("entry"),date,meal,status:"planned",localDate:date,timeZone:activeTimeZone(),createdAt:new Date().toISOString()}));saveExt();openFeature("food-diary");showActionToast(`${template.name} added to the plan.`,null,6000);
  });
}
function deleteMealTemplate(id){const template=ext.mealTemplates.find(m=>m.id===id);if(!template)return;openModal(`Delete ${template.name}?`,`Past diary entries will not be changed.`,`Delete`,()=>{const idx=ext.mealTemplates.findIndex(m=>m.id===id);const removed=ext.mealTemplates.splice(idx,1)[0];saveExt();renderLibrary();showActionToast(`${removed.name} deleted from Saved Meals.`,()=>{ext.mealTemplates.splice(idx,0,removed);saveExt();renderLibrary();},8000);});}

// Custom food
by("save-custom-food")?.addEventListener("click",()=>{
  const name=by("custom-food-name").value.trim(),cal=by("custom-cal").value;
  if(!name||cal===""){by("custom-food-error").textContent="Enter a food name and Calories.";return;}
  const nutrientValue=id=>by(id).value===""?null:Number(by(id).value);
  const amount=n(by("custom-serving-amount").value)||1,unit=by("custom-serving-unit").value;
  const food={id:uid("custom"),name,brand:by("custom-food-brand").value.trim(),category:"Custom Food",country:"Australia",aliases:[name],defaultAmount:amount,defaultUnit:unit,units:{[unit]:1/amount},unitLabels:{[unit]:unit},serving:`${amount} ${unit}`,nutrients:{calories:Number(cal),protein:nutrientValue("custom-protein"),carbs:nutrientValue("custom-carbs"),fat:nutrientValue("custom-fat"),satFat:nutrientValue("custom-sat-fat"),fibre:nutrientValue("custom-fibre"),sugar:nutrientValue("custom-sugar"),sodium:nutrientValue("custom-sodium")},foodGroups:{},waterMl:0,hydrationType:"food",score:7,source:"User Created",verified:false,ingredients:by("custom-ingredients").value.trim(),allergens:[]};
  ext.customFoods.push(food);saveExt();["custom-food-name","custom-food-brand","custom-cal","custom-protein","custom-carbs","custom-fat","custom-sat-fat","custom-fibre","custom-sugar","custom-sodium","custom-ingredients"].forEach(id=>by(id).value="");if(ext.ui.returnToRecipe){ext.ui.returnToRecipe=false;ext.ui.recipeSelectedFoodId=food.id;saveExt();openFeature("recipe-builder");showActionToast(`${food.name} created and ready to add to your recipe.`,null,6000);}else{ext.ui.libraryTab="custom";openFeature("food-library");showActionToast(`${food.name} saved to Foods I Created.`,null,6000);}
});

// Recipe builder
let recipeDraft=Array.isArray(ext.ui.recipeDraft)?ext.ui.recipeDraft:[];
let recipeSelectedFoodId=ext.ui.recipeSelectedFoodId||"";
function saveRecipeDraft(){ext.ui.recipeDraft=recipeDraft;ext.ui.recipeSelectedFoodId=recipeSelectedFoodId;saveExt();}
function renderRecipeSelectOptions(){renderRecipeSearch();}
function recipeFoods(){return allFoods().filter(f=>f.category!=="Recipe");}
function renderRecipeSearch(){
  const input=by("recipe-food-search"),results=by("recipe-food-search-results");if(!input||!results)return;
  const query=input.value.trim();
  const ranked=recipeFoods().map(food=>({food,rank:searchRank(food,query)})).filter(x=>query?x.rank>0:true).sort((a,b)=>b.rank-a.rank||a.food.name.localeCompare(b.food.name)).slice(0,12);
  results.innerHTML=query?ranked.map(({food})=>`<button type="button" data-recipe-food-choice="${esc(food.id)}"><strong>${esc(food.name)}</strong><small>${esc(food.serving)} · ${energyText(food.nutrients?.calories)}</small></button>`).join(""):'<p class="fine">Type at least part of an ingredient name.</p>';
  if(recipeSelectedFoodId)selectRecipeFood(recipeSelectedFoodId,false);
}
function selectRecipeFood(id,clearSearch=true){
  const food=getFood(id);if(!food)return;recipeSelectedFoodId=id;ext.ui.recipeSelectedFoodId=id;
  if(by("recipe-food-select"))by("recipe-food-select").value=id;
  if(by("recipe-selected-food"))by("recipe-selected-food").innerHTML=`<strong>${esc(food.name)}</strong><small>${esc(food.serving)} · ${energyText(food.nutrients?.calories)}</small>`;
  const unit=by("recipe-ingredient-unit");if(unit){unit.innerHTML=Object.keys(unitOptions(food)).map(u=>`<option value="${esc(u)}">${esc(titleUnit(unitLabel(food,u)))}</option>`).join("");unit.value=defaultUnit(food);}
  if(by("recipe-ingredient-amount"))by("recipe-ingredient-amount").value=defaultAmount(food);
  if(clearSearch&&by("recipe-food-search")){by("recipe-food-search").value="";by("recipe-food-search-results").innerHTML="";}
  saveRecipeDraft();
}
function titleUnit(text){
  const metric={g:"g",kg:"kg",ml:"mL",l:"L",kj:"kJ",cal:"Cal"};
  return String(text||"").split(/(\s+|[()])/).map(part=>{
    const key=part.toLowerCase();
    if(metric[key]) return metric[key];
    if(/^[a-z][a-z-]*$/i.test(part)) return part.charAt(0).toUpperCase()+part.slice(1).toLowerCase();
    return part;
  }).join("");
}
by("recipe-food-search")?.addEventListener("input",renderRecipeSearch);
by("recipe-ingredient-unit")?.addEventListener("change",()=>{if(by("recipe-ingredient-amount"))by("recipe-ingredient-amount").value=1;});
by("recipe-name")?.addEventListener("input",event=>{ext.ui.recipeName=event.target.value;saveExt();});
by("recipe-servings")?.addEventListener("input",event=>{ext.ui.recipeServings=Math.max(1,n(event.target.value)||1);saveExt();});
by("recipe-notes")?.addEventListener("input",event=>{ext.ui.recipeNotes=event.target.value;saveExt();});
document.addEventListener("click",event=>{const choice=event.target.closest("[data-recipe-food-choice]");if(choice){selectRecipeFood(choice.dataset.recipeFoodChoice);return;}const remove=event.target.closest("[data-remove-recipe-ingredient]");if(remove){recipeDraft=recipeDraft.filter(i=>i.id!==remove.dataset.removeRecipeIngredient);saveRecipeDraft();renderRecipeDraft();}});
function renderRecipeBuilder(){recipeDraft=Array.isArray(ext.ui.recipeDraft)?ext.ui.recipeDraft:recipeDraft;recipeSelectedFoodId=ext.ui.recipeSelectedFoodId||recipeSelectedFoodId;if(by("recipe-name")&&!by("recipe-name").value)by("recipe-name").value=ext.ui.recipeName||"";if(by("recipe-servings"))by("recipe-servings").value=ext.ui.recipeServings||by("recipe-servings").value||4;if(by("recipe-notes")&&!by("recipe-notes").value)by("recipe-notes").value=ext.ui.recipeNotes||"";renderRecipeSearch();if(recipeSelectedFoodId)selectRecipeFood(recipeSelectedFoodId,false);renderRecipeDraft();}
by("add-recipe-ingredient")?.addEventListener("click",()=>{
  const food=getFood(recipeSelectedFoodId);if(!food){showActionToast("Search for and choose an ingredient first.",null,4500);return;}const amount=n(by("recipe-ingredient-amount").value),unit=by("recipe-ingredient-unit").value;if(amount<=0)return;
  recipeDraft.push({id:uid("ingredient"),foodId:food.id,name:food.name,amount,unit,unitLabel:titleUnit(unitLabel(food,unit)),nutrients:scaledNutrients(food,amount,unit),foodGroups:scaledFoodGroups(food,amount,unit),waterMl:scaledWaterMl(food,amount,unit),score:food.score});recipeSelectedFoodId="";if(by("recipe-selected-food"))by("recipe-selected-food").textContent="No Ingredient Selected.";saveRecipeDraft();renderRecipeDraft();
});
by("create-missing-ingredient")?.addEventListener("click",()=>{ext.ui.returnToRecipe=true;saveExt();openFeature("custom-food");});
by("scan-recipe-ingredient")?.addEventListener("click",()=>{ext.ui.returnToRecipe=true;saveExt();openFeature("scan-centre");});
function renderRecipeDraft(){
  if(!by("recipe-ingredient-list"))return;
  by("recipe-ingredient-list").innerHTML=recipeDraft.length?recipeDraft.map(i=>`<div class="recipe-row"><span><strong>${esc(i.name)}</strong><small>${formatNumber(i.amount,true)} ${esc(i.unitLabel)} · ${formatNumber(i.nutrients.calories)} Cal</small></span><button data-remove-recipe-ingredient="${esc(i.id)}" class="delete-action">Remove</button></div>`).join(""):`<p class="empty-state">No Ingredients Yet.</p>`;
  const servings=Math.max(1,n(by("recipe-servings")?.value)||1),total=sumNutrients(recipeDraft),per=Object.fromEntries(Object.entries(total).map(([k,v])=>[k,v/servings]));
  by("recipe-nutrition-preview").innerHTML=`<p><strong>Whole Recipe:</strong> ${formatNumber(total.calories)} Cal · <strong>Per Serving:</strong> ${formatNumber(per.calories)} Cal</p>${nutritionCards(per)}`;
  saveRecipeDraft();
}
by("recipe-servings")?.addEventListener("input",renderRecipeDraft);
by("save-recipe")?.addEventListener("click",()=>{
  const name=by("recipe-name").value.trim(),servings=Math.max(1,whole(by("recipe-servings").value));if(!name||!recipeDraft.length){by("recipe-error").textContent="Enter a Recipe Name and at least one Ingredient.";return;}
  const total=sumNutrients(recipeDraft),per=Object.fromEntries(Object.entries(total).map(([k,v])=>[k,v/servings]));const score=Math.max(1,Math.min(10,round1(recipeDraft.reduce((sum,i)=>sum+n(i.score),0)/recipeDraft.length)));
  const profile=recipeProfile({servings,ingredients:recipeDraft});const recipe={id:uid("recipe"),name,servings,notes:by("recipe-notes").value,ingredients:clone(recipeDraft),perServe:per,foodGroups:profile.foodGroups,waterMl:profile.waterMl,score,createdAt:new Date().toISOString()};ext.recipes.push(recipe);recipeDraft=[];recipeSelectedFoodId="";ext.ui.recipeDraft=[];ext.ui.recipeSelectedFoodId="";ext.ui.recipeName="";ext.ui.recipeServings=4;ext.ui.recipeNotes="";by("recipe-name").value="";by("recipe-servings").value=4;by("recipe-notes").value="";ext.ui.libraryTab="recipes";saveExt();openFeature("food-library");showActionToast(`${recipe.name} saved in My Recipes. Tap its star to also add it to Favourite Foods.`,null,7000);
});

// Voice and text logging
let recognition=null,voiceParsed=[];
function initialiseVoice(){by("voice-date").value=ext.ui.diaryDate||isoToday();by("voice-review").classList.add("hidden");}
function startVoice(){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){by("voice-status").textContent="Voice recognition is not supported in this browser. Type the request instead.";return;}
  recognition=new Recognition();recognition.lang=mainData().preferences?.language||"en-AU";recognition.continuous=false;recognition.interimResults=true;
  recognition.onstart=()=>by("voice-status").textContent="Listening… Speak naturally. Nothing will be added until you review and confirm.";
  recognition.onresult=event=>{let text="";for(let i=event.resultIndex;i<event.results.length;i++)text+=event.results[i][0].transcript;by("voice-transcript").value=text;};
  recognition.onerror=event=>by("voice-status").textContent=`Voice recognition stopped: ${event.error}. You can edit or type the request.`;
  recognition.onend=()=>by("voice-status").textContent="Listening stopped. Review the words, correct anything needed, then choose Review Request.";
  recognition.start();
}
by("start-voice-log")?.addEventListener("click",startVoice);by("stop-voice-log")?.addEventListener("click",()=>recognition?.stop());
const WORD_NUMBERS={a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,half:.5};
function numberFrom(value,def=1){const key=normalise(value);return Number(value)||WORD_NUMBERS[key]||def;}
function mealFromText(text){const t=normalise(text);if(t.includes("breakfast"))return"Breakfast";if(t.includes("smoko"))return t.includes("afternoon")?"Afternoon Tea":"Morning Tea";if(t.includes("lunch"))return"Lunch";if(t.includes("dinner")||t.includes("tea"))return"Dinner";if(t.includes("supper"))return"Snacks";return by("voice-meal")?.value||"Other";}
function parseVoice(text){
  const raw=String(text||"");const t=normalise(raw);const items=[];
  const weet=t.match(/(?:add\s+)?(a|an|one|two|three|four|five|six|\d+(?:\.\d+)?)?\s*(?:sanitarium\s+)?weet\s*bix/);
  if(weet){items.push({foodId:"weetbix-au",amount:numberFrom(weet[1],2),unit:"biscuit"});}
  const milk=t.match(/(\d+(?:\.\d+)?)\s*(?:ml|millilitre|millilitres|milliliter|milliliters)\s+(?:of\s+)?(?:light|lite|low fat|1 percent)?\s*milk/);
  if(milk){items.push({foodId:"light-milk-au",amount:Number(milk[1]),unit:"mL"});}
  if(t.includes("water")){const m=t.match(/(\d+(?:\.\d+)?)\s*(?:ml|millilitre|millilitres).*water/);items.push({foodId:"water",amount:m?Number(m[1]):250,unit:"mL"});}
  const foundIds=new Set(items.map(i=>i.foodId));
  FOODS.forEach(food=>{
    if(foundIds.has(food.id)||["weetbix-au","light-milk-au","water"].includes(food.id))return;
    const aliases=[food.name,...(food.aliases||[])].sort((a,b)=>b.length-a.length);
    const alias=aliases.find(a=>t.includes(normalise(a)));if(!alias)return;
    const before=t.slice(0,t.indexOf(normalise(alias))).split(" ").slice(-2).join(" ");const numMatch=before.match(/(a|an|one|two|three|four|five|six|\d+(?:\.\d+)?)$/);items.push({foodId:food.id,amount:numMatch?numberFrom(numMatch[1]):defaultAmount(food),unit:defaultUnit(food)});foundIds.add(food.id);
  });
  return {items,meal:mealFromText(raw)};
}
function renderVoiceReview(){
  by("voice-review").classList.remove("hidden");by("voice-meal").value=voiceParsed.meal||"Other";
  by("voice-review-items").innerHTML=voiceParsed.items.length?voiceParsed.items.map((item,index)=>{const food=getFood(item.foodId),values=scaledNutrients(food,item.amount,item.unit);return `<div class="voice-review-row"><div><strong>${esc(food.name)}</strong><small>${formatNumber(item.amount,true)} ${esc(unitLabel(food,item.unit))} · ${formatNumber(values.calories)} Cal</small></div><button data-remove-voice-item="${index}" class="delete-action">Remove</button></div>`}).join(""):`<p class="empty-state">No known trial food was identified. Correct the text or add the food through the Food Library.</p>`;
}
by("parse-voice-log")?.addEventListener("click",()=>{voiceParsed=parseVoice(by("voice-transcript").value);renderVoiceReview();});
document.addEventListener("click",event=>{const b=event.target.closest("[data-remove-voice-item]");if(b){voiceParsed.items.splice(Number(b.dataset.removeVoiceItem),1);renderVoiceReview();}});
by("cancel-voice-review")?.addEventListener("click",()=>by("voice-review").classList.add("hidden"));
by("confirm-voice-log")?.addEventListener("click",()=>{
  if(!voiceParsed.items?.length)return;const date=by("voice-date").value||isoToday(),meal=by("voice-meal").value;ext.diary[date] ||= [];
  voiceParsed.items.forEach(item=>{const food=getFood(item.foodId);ext.diary[date].push({id:uid("entry"),foodId:food.id,name:food.name,brand:food.brand,date,meal,status:"eaten",amount:item.amount,unit:item.unit,unitLabel:unitLabel(food,item.unit),time:localClock(),notes:"Added after voice/text review",nutrients:scaledNutrients(food,item.amount,item.unit),foodGroups:scaledFoodGroups(food,item.amount,item.unit),waterMl:scaledWaterMl(food,item.amount,item.unit),hydrationType:food.hydrationType||"food",score:food.score,source:`Voice/Text Review · ${food.source}`,localDate:date,timeZone:activeTimeZone(),createdAt:new Date().toISOString()});});saveExt();ext.ui.diaryDate=date;openFeature("food-diary");showActionToast(`${voiceParsed.items.length} ${voiceParsed.items.length===1?"item":"items"} added after review.`,null,6500);voiceParsed=[];by("voice-transcript").value="";
});

// Scan capture and review
let scanFile=null,scanBarcodeControls=null,scanBarcodeFood=null;
function renderScanSelect(){updateScanModeUI();}
function updateScanModeUI(){const mode=ext.ui.scanMode||"food";qa("[data-scan-mode]").forEach(b=>b.classList.toggle("active",b.dataset.scanMode===mode));by("barcode-tools")?.classList.toggle("hidden",mode!=="barcode");by("label-tools")?.classList.toggle("hidden",mode!=="label");by("photo-tools")?.classList.toggle("hidden",mode!=="food");const copy={food:"Take a meal photo, then identify and confirm every food before anything is logged.",barcode:"Scan a barcode or enter the number. Product data is retrieved from Open Food Facts and must be checked against the package.",label:"Photograph the nutrition panel square-on in good light. OCR fills review fields but never saves automatically."}[mode];if(by("scan-mode-copy"))by("scan-mode-copy").textContent=copy;}
qa("[data-scan-mode]").forEach(button=>button.addEventListener("click",()=>{ext.ui.scanMode=button.dataset.scanMode;saveExt();updateScanModeUI();}));
function displayScanImage(dataUrl){by("scan-preview").className="scan-preview";by("scan-preview").innerHTML=`<img id="scan-preview-image" src="${dataUrl}" alt="Captured food or package"><p>Image captured. Review the applicable tools below.</p>`;}
by("scan-image")?.addEventListener("change",event=>{scanFile=event.target.files?.[0]||null;if(!scanFile)return;const reader=new FileReader();reader.onload=async()=>{displayScanImage(reader.result);by("run-label-ocr").disabled=false;if(ext.ui.scanMode==="barcode")await decodeBarcodeFromPreview();};reader.readAsDataURL(scanFile);});
async function lookupBarcodeProduct(code){
  const clean=String(code||"").replace(/\D/g,"");if(clean.length<8){showActionToast("Enter or scan a valid barcode.",null,5000);return null;}by("barcode-status").textContent=`Looking up ${clean}…`;
  try{const fields="code,product_name,generic_name,brands,countries,countries_tags,nutriments,serving_size,serving_quantity,serving_quantity_unit,ingredients_text,allergens,image_front_small_url";const response=await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(clean)}.json?fields=${encodeURIComponent(fields)}`);const data=await response.json();if(!data.product)throw new Error("Product not found");const food=makeOpenFoodFactsFood(data.product);upsertOnlineFoods([food]);scanBarcodeFood=food;by("scan-food-preview").innerHTML=`<div class="food-detail-title"><div><h3>${esc(food.name)}</h3><p>${esc(food.brand)} · ${esc(food.serving)} · ${esc(food.source)}</p></div></div>${nutritionCards(food.nutrients)}<p class="fine">Compare these values with the package before adding.</p>`;by("scan-review-card").classList.remove("hidden");by("barcode-status").textContent=`Found ${food.name}. Review the package before continuing.`;return food;}catch(error){by("barcode-status").textContent="No usable product record was found. You can scan the nutrition panel or create a custom food.";showActionToast("Barcode not found in Open Food Facts.",null,6000);return null;}
}
by("lookup-barcode")?.addEventListener("click",()=>lookupBarcodeProduct(by("scan-barcode-input").value));
async function decodeBarcodeFromPreview(){const img=by("scan-preview-image");if(!img)return;try{let text="";if(window.BarcodeDetector){const detector=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128"]});const codes=await detector.detect(img);text=codes[0]?.rawValue||"";}else if(window.ZXingBrowser){const reader=new ZXingBrowser.BrowserMultiFormatReader();const result=await reader.decodeFromImageElement(img);text=result?.getText?.()||result?.text||"";}if(text){by("scan-barcode-input").value=text;await lookupBarcodeProduct(text);}else by("barcode-status").textContent="No barcode was detected in that photo. Try a closer, sharper image or enter the number.";}catch{by("barcode-status").textContent="No barcode was detected. Try a closer photo or manual entry.";}}
by("start-barcode-camera")?.addEventListener("click",async()=>{const video=by("barcode-video");video.classList.remove("hidden");by("stop-barcode-camera").classList.remove("hidden");try{if(window.ZXingBrowser){const reader=new ZXingBrowser.BrowserMultiFormatReader();scanBarcodeControls=await reader.decodeFromVideoDevice(undefined,video,(result)=>{const text=result?.getText?.()||result?.text;if(text){by("scan-barcode-input").value=text;scanBarcodeControls?.stop?.();video.classList.add("hidden");by("stop-barcode-camera").classList.add("hidden");lookupBarcodeProduct(text);}});}else{by("barcode-status").textContent="Live barcode scanning is unavailable in this browser. Take a barcode photo or enter the number.";}}catch{by("barcode-status").textContent="Camera access was unavailable. Check permission or use a photo/manual barcode.";}});
by("stop-barcode-camera")?.addEventListener("click",()=>{scanBarcodeControls?.stop?.();scanBarcodeControls=null;by("barcode-video")?.classList.add("hidden");by("stop-barcode-camera")?.classList.add("hidden");});
function parsePanelNumber(text,patterns){for(const pattern of patterns){const m=text.match(pattern);if(m)return n(String(m[1]).replace(",","."));}return 0;}
function parseNutritionPanel(text){
  const clean=text.replace(/\r/g," ");let kcal=parsePanelNumber(clean,[/energy[^\n]*?(\d+(?:[.,]\d+)?)\s*kcal/i,/calories?[^\n]*?(\d+(?:[.,]\d+)?)/i]);const kj=parsePanelNumber(clean,[/energy[^\n]*?(\d+(?:[.,]\d+)?)\s*kj/i]);if(!kcal&&kj)kcal=kj/4.184;
  return {calories:kcal,protein:parsePanelNumber(clean,[/protein[^\n]*?(\d+(?:[.,]\d+)?)/i]),carbs:parsePanelNumber(clean,[/carbohydrate[^\n]*?(\d+(?:[.,]\d+)?)/i,/carbs?[^\n]*?(\d+(?:[.,]\d+)?)/i]),fat:parsePanelNumber(clean,[/total\s+fat[^\n]*?(\d+(?:[.,]\d+)?)/i,/fat[^\n]*?(\d+(?:[.,]\d+)?)/i]),satFat:parsePanelNumber(clean,[/saturated[^\n]*?(\d+(?:[.,]\d+)?)/i]),fibre:parsePanelNumber(clean,[/fibre[^\n]*?(\d+(?:[.,]\d+)?)/i,/fiber[^\n]*?(\d+(?:[.,]\d+)?)/i]),sugar:parsePanelNumber(clean,[/sugars?[^\n]*?(\d+(?:[.,]\d+)?)/i]),sodium:parsePanelNumber(clean,[/sodium[^\n]*?(\d+(?:[.,]\d+)?)/i])};
}
function fillOcrReview(values){const map={calories:"ocr-calories",protein:"ocr-protein",carbs:"ocr-carbs",fat:"ocr-fat",satFat:"ocr-sat-fat",fibre:"ocr-fibre",sugar:"ocr-sugar",sodium:"ocr-sodium"};Object.entries(map).forEach(([k,id])=>{by(id).value=values[k]?round1(values[k]):"";});by("ocr-review").classList.remove("hidden");}
by("run-label-ocr")?.addEventListener("click",async()=>{if(!scanFile)return;const box=by("ocr-progress");box.classList.remove("hidden");box.textContent="Loading OCR and reading the panel. This may take a minute on a phone…";try{if(!window.Tesseract)throw new Error("OCR library unavailable");const worker=await Tesseract.createWorker("eng",1,{logger:m=>{if(m.progress)box.textContent=`${m.status} · ${Math.round(m.progress*100)}%`;}});const result=await worker.recognize(scanFile);await worker.terminate();const text=result.data?.text||"";by("ocr-text").value=text;fillOcrReview(parseNutritionPanel(text));box.textContent="Recognition complete. Correct every field against the package before saving.";}catch(error){box.textContent="OCR could not read this image. Try a closer, square-on photo in brighter light, or enter the values manually.";by("ocr-review").classList.remove("hidden");}});
by("use-ocr-values")?.addEventListener("click",()=>{const pairs=[["custom-food-name","ocr-food-name"],["custom-serving-amount","ocr-serving-amount"],["custom-serving-unit","ocr-serving-unit"],["custom-cal","ocr-calories"],["custom-protein","ocr-protein"],["custom-carbs","ocr-carbs"],["custom-fat","ocr-fat"],["custom-sat-fat","ocr-sat-fat"],["custom-fibre","ocr-fibre"],["custom-sugar","ocr-sugar"],["custom-sodium","ocr-sodium"]];pairs.forEach(([to,from])=>{if(by(to)&&by(from))by(to).value=by(from).value;});openFeature("custom-food");showActionToast("Recognised values copied for review. Compare every value with the package before saving.",null,8000);});
by("photo-find-food")?.addEventListener("click",()=>{ext.ui.libraryTab="all";ext.ui.pendingMeal=ext.ui.pendingMeal||"Other";saveExt();openFeature("food-library");showActionToast("Search and add each food visible in the photo. The photo itself does not calculate calories.",null,8000);});
by("photo-add-note")?.addEventListener("click",()=>showActionToast("Meal photos are kept only during this browser session in Alpha 0.6.5. Add a written Diary note for lasting context.",null,8000));
by("review-scan-food")?.addEventListener("click",()=>{if(scanBarcodeFood)prepareEntry(scanBarcodeFood,{date:ext.ui.diaryDate||isoToday(),meal:ext.ui.pendingMeal||"Other",source:scanBarcodeFood.source});});

// Meal planner
const PLANNER_WEIGHTS={Breakfast:.22,"Morning Tea":.08,Lunch:.27,"Afternoon Tea":.08,Dinner:.29,Snacks:.06};
function selectedPlannerMeals(){return qa('input[name="planner-meal"]:checked').map(input=>input.value);}
function updatePlannerSelectAll(){const boxes=qa('input[name="planner-meal"]'),selected=boxes.filter(x=>x.checked).length,all=by("planner-select-all");if(all){all.checked=boxes.length>0&&selected===boxes.length;all.indeterminate=selected>0&&selected<boxes.length;}renderPlannerEnergySummary();}
function clearPlannerResults(){ext.ui.plannerResults={};ext.ui.plannerRejected={};ext.ui.plannerAccepted={};saveExt();renderMealSuggestions();renderPlannerEnergySummary();}
function initialisePlanner(){const date=ext.ui.plannerDate||ext.ui.diaryDate||isoToday();ext.ui.plannerDate=date;updateDateControl("planner",date);updatePlannerSelectAll();renderMealSuggestions();renderPlannerEnergySummary();}
function suggestionNutrition(suggestion){return sumNutrients(suggestion.items.map(i=>({nutrients:scaledNutrients(getFood(i.foodId),i.amount,i.unit)})));}
function suggestionGroups(suggestion){return sumGroupValues(suggestion.items.map(i=>({foodGroups:scaledFoodGroups(getFood(i.foodId),i.amount,i.unit)})));}
function suggestionSafety(suggestion){return suggestion.items.map(i=>foodSafety(getFood(i.foodId))).filter(x=>x.blocked).map(x=>x.message);}
function plannerBudget(){
  const date=ext.ui.plannerDate||isoToday(),selected=selectedPlannerMeals(),goal=currentGoals(date).calories;const entries=entriesForDate(date);const fixed=entries.filter(e=>e.status==="eaten"||e.status==="planned").reduce((sum,e)=>sum+n(e.nutrients?.calories),0);const available=Math.max(0,goal-fixed);const guides={};const standard=selected.map(meal=>[meal,goal*(PLANNER_WEIGHTS[meal]||.15)]),needed=standard.reduce((sum,x)=>sum+x[1],0),scale=needed>available&&needed?available/needed:1;standard.forEach(([meal,value])=>guides[meal]=Math.max(0,Math.round(value*scale/10)*10));const allocated=Object.values(guides).reduce((a,b)=>a+b,0);return {date,goal,fixed,available,guides,unallocated:Math.max(0,available-allocated)};
}
function renderPlannerEnergySummary(){const box=by("planner-energy-summary");if(!box)return;const b=plannerBudget(),meals=selectedPlannerMeals();box.innerHTML=`<span class="eyebrow">Energy available for selected meals</span><strong>${formatNumber(b.available)} Cal</strong><small>Daily goal ${formatNumber(b.goal)} Cal · ${formatNumber(b.fixed)} Cal already eaten or reserved elsewhere</small>${meals.length?`<div class="planner-guide-list">${meals.map(m=>`<span>${esc(m)} <b>about ${formatNumber(b.guides[m])} Cal</b></span>`).join("")}</div><small>${formatNumber(b.unallocated)} Cal remains unallocated for flexibility.</small>`:"<small>Select one or more meals to see personalised guides.</small>"}`;}
function plannerChoice(meal,retry=false){
  const min=n(by("planner-min-score")?.value),target=plannerBudget().guides[meal]??0;const current=ext.ui.plannerResults?.[meal],rejected=ext.ui.plannerRejected?.[meal]||[];let candidates=MEAL_SUGGESTIONS.filter(s=>s.meal===meal&&s.score>=min&&!suggestionSafety(s).length);candidates.sort((a,b)=>Math.abs(suggestionNutrition(a).calories-target)-Math.abs(suggestionNutrition(b).calories-target));if(retry&&current&&!rejected.includes(current))rejected.push(current);let choice=candidates.find(s=>s.id!==current&&!rejected.includes(s.id));if(!choice){rejected.length=0;if(current)rejected.push(current);choice=candidates.find(s=>s.id!==current)||candidates[0];}if(choice)ext.ui.plannerResults[meal]=choice.id;ext.ui.plannerRejected[meal]=rejected;delete ext.ui.plannerAccepted?.[meal];return choice;
}
function renderMealSuggestions(){
  const results=ext.ui.plannerResults||{},accepted=ext.ui.plannerAccepted||{},meals=Object.keys(results).filter(meal=>MEAL_SUGGESTIONS.some(s=>s.id===results[meal]));const target=by("meal-suggestions");if(!target)return;
  target.innerHTML=meals.length?`<div class="planner-results">${meals.map(meal=>{const s=MEAL_SUGGESTIONS.find(x=>x.id===results[meal]),total=suggestionNutrition(s),groups=suggestionGroups(s),isAccepted=accepted[meal]===s.id;return `<article class="planner-result-card ${isAccepted?"planner-accepted":""}"><header><div><span class="eyebrow">${esc(meal)}</span><h3>${esc(s.name)}</h3><p>${formatNumber(total.calories)} Cal · Protein ${formatNumber(total.protein)} g · Carbohydrate ${formatNumber(total.carbs)} g · Fat ${formatNumber(total.fat)} g · Fibre ${formatNumber(total.fibre)} g · Guide ${formatNumber(plannerBudget().guides[meal])} Cal</p></div><span class="health-score">${s.score}/10</span></header><p>${esc(s.reason)}</p><ul class="compact-list">${s.items.map(i=>{const f=getFood(i.foodId);return `<li>${esc(f.name)} — ${formatNumber(i.amount,true)} ${esc(unitLabel(f,i.unit))}</li>`}).join("")}</ul><div class="planner-group-line">${FOOD_GROUP_KEYS.filter(k=>groups[k]>0).map(k=>`<span>${esc(FOOD_GROUP_LABELS[k])}: ${formatNumber(groups[k],true)}</span>`).join("")}</div>${isAccepted?`<div class="accepted-plan-confirmation"><strong>Added to Plan ✓</strong><span>${esc(meal)} is visible in Diary and Daily Progress as planned.</span><div class="quick-action-row"><button data-open-feature="food-diary" class="secondary">View in Diary</button><button data-plan-undo="${esc(meal)}" class="secondary">Undo</button></div></div>`:`<div class="planner-card-actions"><button class="primary" data-plan-accept="${esc(meal)}">Accept Meal</button><button class="secondary" data-plan-retry="${esc(meal)}">Try Again</button></div>`}</article>`}).join("")}</div>`:`<div class="card empty-state">Tick one or more meals, then choose Plan Selected Meals.</div>`;by("try-all-meal-suggestions")?.classList.toggle("hidden",!meals.length);
}
function generatePlannerResults(retryAll=false){const meals=selectedPlannerMeals();if(!meals.length){showActionToast("Choose at least one meal to plan.",null,5000);return;}ext.ui.plannerResults ||= {};ext.ui.plannerRejected ||= {};ext.ui.plannerAccepted ||= {};meals.forEach(meal=>plannerChoice(meal,retryAll));Object.keys(ext.ui.plannerResults).forEach(meal=>{if(!meals.includes(meal))delete ext.ui.plannerResults[meal];});saveExt();renderPlannerEnergySummary();renderMealSuggestions();}
function addPlannedSuggestion(meal,mode="add"){
  const suggestion=MEAL_SUGGESTIONS.find(s=>s.id===ext.ui.plannerResults?.[meal]);if(!suggestion)return;const date=ext.ui.plannerDate||by("planner-date")?.value||isoToday();ext.diary[date] ||= [];const uniqueRef=`${date}|${meal}|${suggestion.id}`;if(ext.diary[date].some(e=>e.plannerRef===uniqueRef)){ext.ui.plannerAccepted[meal]=suggestion.id;saveExt();renderMealSuggestions();showActionToast(`${suggestion.name} is already in the plan.`,null,6000);return;}if(mode==="replace")ext.diary[date]=ext.diary[date].filter(e=>!(e.meal===meal&&e.status==="planned"));suggestion.items.forEach(i=>{const f=getFood(i.foodId);ext.diary[date].push({id:uid("entry"),foodId:f.id,name:f.name,brand:f.brand,date,meal,status:"planned",amount:i.amount,unit:i.unit,unitLabel:unitLabel(f,i.unit),time:"",notes:`Meal Planner · ${suggestion.name}`,nutrients:scaledNutrients(f,i.amount,i.unit),foodGroups:scaledFoodGroups(f,i.amount,i.unit),waterMl:scaledWaterMl(f,i.amount,i.unit),hydrationType:f.hydrationType||"food",score:f.score,source:`Meal Planner · ${f.source}`,plannerRef:uniqueRef,localDate:date,timeZone:activeTimeZone(),createdAt:new Date().toISOString()});});ext.ui.diaryDate=date;ext.ui.progressDate=date;ext.ui.plannerAccepted[meal]=suggestion.id;saveExt();renderMealSuggestions();renderPlannerEnergySummary();showActionToast(`${suggestion.name} added to ${meal} as Planned. It is now visible in Daily Progress.`,()=>{ext.diary[date]=ext.diary[date].filter(e=>e.plannerRef!==uniqueRef);delete ext.ui.plannerAccepted[meal];saveExt();renderMealSuggestions();},9000);
}
function acceptPlannedSuggestion(meal){const date=ext.ui.plannerDate||by("planner-date")?.value||isoToday(),existing=entriesForDate(date).filter(e=>e.meal===meal);if(!existing.length){addPlannedSuggestion(meal);return;}openModal(`${meal} already has entries`,`Choose how to use this suggestion. Existing eaten entries will never be removed.`,`Add Alongside Existing`,()=>addPlannedSuggestion(meal,"add"),`<button id="replace-planned-meal" class="secondary wide" type="button">Replace Existing Planned Items</button>`);by("replace-planned-meal")?.addEventListener("click",()=>{closeModal();addPlannedSuggestion(meal,"replace");},{once:true});}
by("planner-select-all")?.addEventListener("change",event=>{qa('input[name="planner-meal"]').forEach(x=>x.checked=event.target.checked);updatePlannerSelectAll();});qa('input[name="planner-meal"]').forEach(input=>input.addEventListener("change",updatePlannerSelectAll));by("planner-min-score")?.addEventListener("change",()=>{clearPlannerResults();renderPlannerEnergySummary();});by("generate-meal-suggestions")?.addEventListener("click",()=>generatePlannerResults(false));by("try-all-meal-suggestions")?.addEventListener("click",()=>generatePlannerResults(true));document.addEventListener("click",event=>{const retry=event.target.closest("[data-plan-retry]");if(retry){plannerChoice(retry.dataset.planRetry,true);saveExt();renderMealSuggestions();return;}const accept=event.target.closest("[data-plan-accept]");if(accept){acceptPlannedSuggestion(accept.dataset.planAccept);return;}const undo=event.target.closest("[data-plan-undo]");if(undo){const meal=undo.dataset.planUndo,date=ext.ui.plannerDate||isoToday(),id=ext.ui.plannerAccepted?.[meal];ext.diary[date]=(ext.diary[date]||[]).filter(e=>!(e.meal===meal&&e.plannerRef?.endsWith(`|${id}`)));delete ext.ui.plannerAccepted[meal];saveExt();renderMealSuggestions();renderPlannerEnergySummary();showActionToast(`${meal} suggestion removed from the plan.`,null,5000);}});

// Daily progress
function weeklyFoodGroupAverages(endDate){const totals=Object.fromEntries(FOOD_GROUP_KEYS.map(k=>[k,0]));for(let i=0;i<7;i++){const groups=dayFoodGroups(shiftISO(endDate,-i),["eaten","planned"]);FOOD_GROUP_KEYS.forEach(k=>totals[k]+=n(groups[k]));}FOOD_GROUP_KEYS.forEach(k=>totals[k]/=7);return totals;}
function projectedProgressCard(label,eaten,planned,target,unit,type,date){const projected=eaten+planned,[state,text]=progressState(projected,target,type,date),eatenPct=Math.min(100,target?eaten/target*100:0),plannedPct=Math.min(100-eatenPct,target?planned/target*100:0);return `<div class="progress-card projected ${state}"><div><strong>${esc(label)}</strong><span>${formatNumber(projected)} / ${formatNumber(target)} ${esc(unit)}</span></div><div class="progress-track layered"><i class="eaten-progress" style="width:${eatenPct}%"></i><i class="planned-progress" style="width:${plannedPct}%"></i></div><small>Eaten ${formatNumber(eaten)} · Planned ${formatNumber(planned)} · ${text}</small></div>`;}
function projectedFoodGroupCard(key,eaten,planned,target){const e=Math.min(100,target?eaten/target*100:0),p=Math.min(100-e,target?planned/target*100:0);return `<div class="food-group-card projected"><div><strong>${esc(FOOD_GROUP_LABELS[key])}</strong><span>${formatNumber(eaten+planned,true)} of ${formatNumber(target,true)} serves</span></div><div class="progress-track layered"><i class="eaten-progress" style="width:${e}%"></i><i class="planned-progress" style="width:${p}%"></i></div><small>Eaten ${formatNumber(eaten,true)} · Planned ${formatNumber(planned,true)}</small></div>`;}
function renderDailyProgress(){
  const date=ext.ui.progressDate||by("progress-date")?.value||isoToday();ext.ui.progressDate=date;updateDateControl("progress",date);const summary=daySummary(date),{nutrients,planned,hydration,plannedHydration,steps,goals,foodGroups,plannedFoodGroups}=summary;goals.hydration=n(ext.fluidTargets[date])||goals.hydration;by("today-water").value=ext.water[date]||"";if(by("today-fluid-target"))by("today-fluid-target").value=goals.hydration;by("today-steps").value=steps||"";
  const eatenCount=entriesForDate(date).filter(e=>e.status==="eaten").length,plannedCount=entriesForDate(date).filter(e=>e.status==="planned").length,projected=nutrients.calories+planned.calories,available=Math.max(0,goals.calories-projected);const parts=[`${formatNumber(goals.calories)} Cal goal`,`${formatNumber(nutrients.calories)} Cal eaten`,`${formatNumber(planned.calories)} Cal still planned`,`${formatNumber(projected)} Cal projected`,`${formatNumber(available)} Cal remaining after the plan`];if(!eatenCount&&!plannedCount)parts.unshift("Nothing has been planned or recorded yet.");by("daily-progress-explanation").innerHTML=`<h3>${date===isoToday()?"Today’s":"Day"} Summary</h3><p>${parts.join(" · ")}</p><p class="progress-key"><span class="key-eaten"></span>Eaten <span class="key-planned"></span>Planned</p>`;
  const allEntries=entriesForDate(date),meals=plannerMealNames().concat(allEntries.some(e=>e.meal==="Other")?["Other"]:[]);by("daily-meal-status").innerHTML=meals.map(meal=>{const items=allEntries.filter(e=>e.meal===meal),eaten=items.filter(e=>e.status==="eaten"),plannedItems=items.filter(e=>e.status==="planned"),skipped=items.filter(e=>e.status==="skipped"),active=items.filter(e=>e.status!=="skipped"),total=sumNutrients(active).calories;let state="empty",label="Nothing Planned";if(items.length){if(plannedItems.length&&eaten.length){state="mixed";label=`${eaten.length} of ${eaten.length+plannedItems.length} Confirmed`;}else if(plannedItems.length){state="planned";label="Planned";}else if(eaten.length){state="complete";label="Complete ✓";}else if(skipped.length){state="empty";label="Skipped";}}return `<div class="meal-progress-shell"><details class="meal-progress-card ${state}" ${state==="mixed"?"open":""}><summary><span class="meal-progress-title"><strong>${esc(meal)} · ${formatNumber(total)} Cal</strong><small>${items.length?`${eaten.length} Eaten · ${plannedItems.length} Planned${skipped.length?` · ${skipped.length} Skipped`:""}`:"Tap to plan or add food"}</small></span><span class="meal-progress-state">${esc(label)}</span></summary><div class="meal-progress-body">${items.length?items.map(e=>`<div class="meal-progress-item ${e.status}"><span class="status-icon">${e.status==="eaten"?"✓":e.status==="skipped"?"—":"○"}</span><span><strong>${esc(e.name)}</strong><small>${formatNumber(e.amount,true)} ${esc(e.unitLabel||e.unit)} · ${formatNumber(e.nutrients?.calories)} Cal</small></span><div class="meal-progress-item-actions">${e.status==="planned"?`<button data-progress-eaten="${esc(e.id)}">✓ Eaten</button><button data-progress-skip="${esc(e.id)}">Skip</button>`:""}<button data-progress-edit="${esc(e.id)}">Change</button></div></div>`).join(""):'<p class="empty-state">Nothing planned for this meal.</p>'}<div class="meal-progress-actions"><button class="secondary" data-progress-open-meal="${esc(meal)}">Open Meal</button></div></div></details>${plannedItems.length?`<button class="meal-quick-confirm" data-mark-meal-eaten="${esc(meal)}">✓ Ate as Planned</button>`:""}</div>`;}).join("");
  const cards=[["Energy","calories",goals.calories,"Cal","energy"],["Protein","protein",goals.protein,"g","positive"],["Carbohydrate","carbs",goals.carbs,"g","positive"],["Fat","fat",goals.fat,"g","positive"],["Fibre","fibre",goals.fibre,"g","positive"],["Sugars","sugar",goals.sugar,"g","limit"],["Sodium","sodium",goals.sodium,"mg","limit"]];by("daily-progress-grid").innerHTML=cards.map(([label,key,target,unit,type])=>projectedProgressCard(label,n(nutrients[key]),n(planned[key]),target,unit,type,date)).join("")+projectedProgressCard("Fluids",hydration.drinks,plannedHydration.drinks,goals.hydration,"mL","positive",date)+progressCard("Steps",steps,goals.steps,"","positive",date);
  by("daily-food-group-progress").innerHTML=FOOD_GROUP_KEYS.map(key=>projectedFoodGroupCard(key,n(foodGroups[key]),n(plannedFoodGroups[key]),goals.foodGroups[key])).join("");const weekly=weeklyFoodGroupAverages(date);by("weekly-food-group-progress").innerHTML=`<h4>Seven-Day Planned + Eaten Average</h4><div>${FOOD_GROUP_KEYS.map(key=>`<span><small>${esc(FOOD_GROUP_LABELS[key])}</small><strong>${formatNumber(weekly[key],true)} / ${formatNumber(goals.foodGroups[key],true)}</strong></span>`).join("")}</div><p>Confirm meals as the day unfolds so the average increasingly reflects what actually happened.</p>`;saveExt();
}
let progressSaveTimer=null;function autoSaveProgressFields(){clearTimeout(progressSaveTimer);progressSaveTimer=setTimeout(()=>{const date=ext.ui.progressDate||isoToday();ext.water[date]=Math.max(0,n(by("today-water")?.value));ext.fluidTargets[date]=Math.max(250,n(by("today-fluid-target")?.value)||currentGoals(date).hydration);ext.steps[date]=Math.max(0,whole(by("today-steps")?.value));saveExt();renderDailyProgress();showActionToast("Fluids and steps updated.",null,2500);},350);}by("today-water")?.addEventListener("change",autoSaveProgressFields);by("today-fluid-target")?.addEventListener("change",autoSaveProgressFields);by("today-steps")?.addEventListener("change",autoSaveProgressFields);

document.addEventListener("click",event=>{const eaten=event.target.closest("[data-progress-eaten]");if(eaten){const found=findEntry(eaten.dataset.progressEaten);if(found){found.entry.status="eaten";saveExt();renderDailyProgress();showActionToast(`${found.entry.name} marked Eaten.`,null,4000);}return;}const edit=event.target.closest("[data-progress-edit]");if(edit){const found=findEntry(edit.dataset.progressEdit);if(found)prepareEntry(getFood(found.entry.foodId)||snapshotFood(found.entry),{entry:found.entry});return;}const replace=event.target.closest("[data-progress-replace]");if(replace){const found=findEntry(replace.dataset.progressReplace);if(found){ext.ui.replacingEntryId=found.entry.id;ext.ui.diaryDate=found.date;ext.ui.pendingMeal=found.entry.meal;ext.ui.libraryTab="all";saveExt();openFeature("food-library");showActionToast(`Choose a replacement for ${found.entry.name}.`,null,5000);}return;}const skip=event.target.closest("[data-progress-skip]");if(skip){const found=findEntry(skip.dataset.progressSkip);if(found){found.entry.status="skipped";saveExt();renderDailyProgress();showActionToast(`${found.entry.name} skipped.`,null,4000);}return;}const move=event.target.closest("[data-progress-move]");if(move){const found=findEntry(move.dataset.progressMove);if(found){openModal(`Move ${found.entry.name}`,"Choose a Meal for this Planned Food.","Move",()=>{found.entry.meal=by("progress-move-meal").value;saveExt();renderDailyProgress();},`<label>Meal<select id="progress-move-meal">${mealNames().map(m=>`<option ${m===found.entry.meal?"selected":""}>${esc(m)}</option>`).join("")}</select></label>`);}return;}});

document.addEventListener("click",event=>{const open=event.target.closest("[data-progress-open-meal]");if(!open)return;ext.ui.diaryDate=ext.ui.progressDate||isoToday();ext.ui.focusMeal=open.dataset.progressOpenMeal;saveExt();openFeature("food-diary");setTimeout(()=>{q(`[data-meal-name="${CSS.escape(open.dataset.progressOpenMeal)}"]`)?.scrollIntoView({block:"start",behavior:"smooth"});},80);});

// Exercise and activity
function renderExercise(){
  if(!by("exercise-history"))return;
  by("exercise-history").innerHTML=ext.exercise.length?ext.exercise.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<div class="list-row"><span>🏃</span><div><strong>${esc(x.name)}</strong><small>${formatDate(x.localDate||x.date.slice(0,10))} · ${x.minutes} min · ${esc(x.intensity)} · ${formatNumber(x.calories)} Cal burned · ${formatNumber(x.credit)} Cal credited</small><p>${esc(x.notes||"")}</p></div><button data-activity-delete="${esc(x.id)}" class="delete-action">Delete</button></div>`).join(""):`<p class="empty-state">No extra activity logged yet.</p>`;
}
by("add-exercise")?.addEventListener("click",()=>{
  const name=by("exercise-name").value.trim();if(!name)return;const calories=n(by("exercise-calories").value),choice=by("exercise-credit-choice").value,credit=choice==="custom"?n(by("exercise-custom-credit").value):calories*n(choice)/100;
  ext.exercise.push({id:uid("activity"),date:new Date().toISOString(),localDate:isoToday(),timeZone:activeTimeZone(),name,minutes:n(by("exercise-minutes").value),intensity:by("exercise-intensity").value,calories,credit:whole(credit),notes:by("exercise-notes").value});saveExt();renderExercise();showActionToast(`${name} added. ${whole(credit)} Cal credited to today’s allowance.`,null,6000);["exercise-name","exercise-minutes","exercise-calories","exercise-custom-credit","exercise-notes"].forEach(id=>by(id).value="");
});
document.addEventListener("click",event=>{const b=event.target.closest("[data-activity-delete]");if(!b)return;const idx=ext.exercise.findIndex(x=>x.id===b.dataset.activityDelete);if(idx<0)return;const item=ext.exercise[idx];openModal(`Delete ${item.name}?`,`This removes the activity and its credited Calories.`,`Delete`,()=>{const removed=ext.exercise.splice(idx,1)[0];saveExt();renderExercise();showActionToast(`${removed.name} deleted.`,()=>{ext.exercise.splice(idx,0,removed);saveExt();renderExercise();},8000);});});

// Shopping list
const GROCERY_CATALOG=[
  ["Greek yoghurt","Dairy & eggs",["greek yogurt","yoghurt","yogurt"]],["Cottage cheese","Dairy & eggs",["cottage cheese"]],["Light milk","Dairy & eggs",["lite milk","milk"]],["Eggs","Dairy & eggs",["egg"]],["Butter","Dairy & eggs",[]],["Margarine","Dairy & eggs",[]],
  ["Hot chook","Meat & seafood",["hot chicken","roast chicken","chook"]],["Chicken breast","Meat & seafood",[]],["Beef","Meat & seafood",[]],["Fish","Meat & seafood",[]],["Tuna","Meat & seafood",[]],
  ["Bananas","Fruit & vegetables",["banana"]],["Apples","Fruit & vegetables",["apple"]],["Potatoes","Fruit & vegetables",["potato","spuds"]],["Carrots","Fruit & vegetables",["carrot"]],["Broccoli","Fruit & vegetables",[]],["Salad","Fruit & vegetables",[]],
  ["Wholemeal bread","Bakery",["bread"]],["Bread rolls","Bakery",["rolls"]],["Rolled oats","Pantry",["oats"]],["Brown rice","Pantry",["rice"]],["Olive oil","Pantry",["oil"]],["Coffee","Pantry",[]],
  ["Frozen vegetables","Frozen",["frozen veges","frozen veggies"]],["Pepsi Max","Drinks",["pepsi"]],["Sparkling water","Drinks",["water"]],["Dishwashing liquid","Household",["dish soap"]]
].map(([name,category,aliases])=>({name,category,aliases}));
function catalogueMatch(input){const qn=normalise(input);if(!qn)return null;let best=null,bestScore=Infinity;for(const item of GROCERY_CATALOG){for(const term of [item.name,...item.aliases]){const tn=normalise(term);if(qn===tn)return {...item,confidence:"exact"};const d=editDistance(qn,tn);if((qn.length>=4||tn.length>=4)&&d<bestScore){bestScore=d;best=item;}}}return bestScore<=Math.max(1,Math.floor(qn.length/5))?{...best,confidence:"typo"}:null;}
function inferShoppingCategory(name){return catalogueMatch(name)?.category||"Other";}
function parseQuantityText(value){const text=String(value||"").trim();const m=text.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);return m?{number:Number(m[1]),unit:m[2].trim().toLowerCase()}:null;}
function combineQuantities(a,b){const pa=parseQuantityText(a),pb=parseQuantityText(b);if(pa&&pb&&pa.unit===pb.unit){const total=round1(pa.number+pb.number);return `${formatNumber(total,true)}${pa.unit?` ${pa.unit}`:""}`;}return [a,b].filter(Boolean).join(" + ");}
function renderShopping(){
  const groups={};ext.shopping.forEach((x,i)=>(groups[x.category||"Other"]??=[]).push({...x,index:i}));by("shopping-items").innerHTML=ext.shopping.length?Object.entries(groups).map(([category,items])=>`<section class="shopping-category"><h4>${esc(category)}</h4>${items.map(item=>`<div class="shopping-row ${item.done?"done":""}"><input type="checkbox" data-shop-check="${item.index}" ${item.done?"checked":""} aria-label="Mark ${esc(item.item)} collected"><button class="shopping-item-main" data-shop-edit="${item.index}"><strong>${esc(item.item)}</strong><small>${esc(item.quantity||"")}${item.brand?` · ${esc(item.brand)}`:""}${item.notes?` · ${esc(item.notes)}`:""}</small></button><button data-shop-menu="${item.index}" class="shopping-more" aria-label="More options">•••</button></div>`).join("")}</section>`).join(""):`<p class="empty-state">Your shopping list is empty. Add an item below or import ingredients from a meal plan.</p>`;by("shopping-suggestions").innerHTML=GROCERY_CATALOG.map(x=>`<option value="${esc(x.name)}">${esc(x.category)}</option>`).join("");renderShoppingPrint();
}
function renderShoppingPrint(){const active=ext.shopping.filter(x=>!x.done),groups={};active.forEach(x=>(groups[x.category||"Other"]??=[]).push(x));by("shopping-print-area").innerHTML=`<h1>Healthy Eating Companion Shopping List</h1><p>${formatDate(isoToday())}</p>${Object.entries(groups).map(([category,items])=>`<h2>${esc(category)}</h2><ul>${items.map(x=>`<li>☐ <strong>${esc(x.item)}</strong>${x.quantity?` — ${esc(x.quantity)}`:""}${x.brand?` · ${esc(x.brand)}`:""}${x.notes?` · ${esc(x.notes)}`:""}</li>`).join("")}</ul>`).join("")||"<p>No unchecked items.</p>"}`;}
function addShoppingRecord(record){ext.shopping.push({id:uid("shop"),done:false,notes:"",brand:"",...record});saveExt();renderShopping();showActionToast(`${record.item} added to ${record.category}.`,null,5000);}
function requestAddShopping(){const raw=by("shopping-item").value.trim();if(!raw)return;const match=catalogueMatch(raw),quantity=by("shopping-quantity").value.trim(),brand=by("shopping-brand").value.trim(),notes=by("shopping-notes").value.trim(),selected=by("shopping-category").value;const itemName=match?.name||raw,category=selected==="auto"?(match?.category||inferShoppingCategory(raw)):selected;const exact=ext.shopping.find(x=>!x.done&&normalise(x.item)===normalise(itemName));
  const doAdd=()=>{addShoppingRecord({item:itemName,quantity,category,brand,notes});["shopping-item","shopping-quantity","shopping-brand","shopping-notes"].forEach(id=>by(id).value="");by("shopping-category").value="auto";};
  if(match?.confidence==="typo"&&normalise(match.name)!==normalise(raw)){openModal(`Did you mean ${match.name}?`,`We found a close grocery match in ${match.category}.`,`Use ${match.name}`,()=>{by("shopping-item").value=match.name;requestAddShopping();},`<button id="keep-shopping-spelling" class="secondary wide">Keep “${esc(raw)}”</button>`);by("keep-shopping-spelling")?.addEventListener("click",()=>{closeModal();addShoppingRecord({item:raw,quantity,category:selected==="auto"?"Other":selected,brand,notes});},{once:true});return;}
  if(exact){openModal(`${exact.item} is already on your list`,`Current quantity: ${exact.quantity||"not specified"}. Choose the new combined quantity.`,`Update Quantity`,()=>{exact.quantity=by("duplicate-shopping-quantity").value.trim();if(brand)exact.brand=brand;if(notes)exact.notes=notes;saveExt();renderShopping();showActionToast(`${exact.item} quantity updated.`,null,5000);},`<label>New quantity<input id="duplicate-shopping-quantity" value="${esc(combineQuantities(exact.quantity,quantity))}"></label><button id="add-shopping-separately" class="secondary wide">Add as a separate item</button>`);by("add-shopping-separately")?.addEventListener("click",()=>{closeModal();doAdd();},{once:true});return;}doAdd();
}
by("add-shopping-item")?.addEventListener("click",requestAddShopping);by("shopping-item")?.addEventListener("change",()=>{const match=catalogueMatch(by("shopping-item").value);by("shopping-add-status").textContent=match?`${match.name} will be filed under ${match.category}.`:"No confident category match yet. The item will be filed under Other unless you choose a category.";});
function editShoppingItem(index){const item=ext.shopping[index];if(!item)return;openModal(`Edit ${item.item}`,"Change any detail without deleting and re-entering the item.","Save Changes",()=>{item.item=by("edit-shop-name").value.trim()||item.item;item.quantity=by("edit-shop-quantity").value.trim();item.category=by("edit-shop-category").value;item.brand=by("edit-shop-brand").value.trim();item.notes=by("edit-shop-notes").value.trim();saveExt();renderShopping();showActionToast(`${item.item} updated.`,null,5000);},`<div class="form-grid"><label>Item<input id="edit-shop-name" value="${esc(item.item)}"></label><label>Quantity<input id="edit-shop-quantity" value="${esc(item.quantity||"")}"></label><label>Category<select id="edit-shop-category">${["Fruit & vegetables","Meat & seafood","Dairy & eggs","Bakery","Pantry","Frozen","Drinks","Household","Other"].map(c=>`<option ${c===item.category?"selected":""}>${esc(c)}</option>`).join("")}</select></label><label>Brand / substitute<input id="edit-shop-brand" value="${esc(item.brand||"")}"></label><label class="full">Notes<input id="edit-shop-notes" value="${esc(item.notes||"")}"></label></div><button id="delete-shop-from-edit" class="danger-button wide">Delete Item</button>`);by("delete-shop-from-edit")?.addEventListener("click",()=>{closeModal();const removed=ext.shopping.splice(index,1)[0];saveExt();renderShopping();showActionToast(`${removed.item} deleted.`,()=>{ext.shopping.splice(index,0,removed);saveExt();renderShopping();},8000);},{once:true});}
document.addEventListener("change",event=>{if(event.target.dataset.shopCheck!==undefined){ext.shopping[Number(event.target.dataset.shopCheck)].done=event.target.checked;saveExt();renderShopping();}});document.addEventListener("click",event=>{const edit=event.target.closest("[data-shop-edit],[data-shop-menu]");if(edit){editShoppingItem(Number(edit.dataset.shopEdit??edit.dataset.shopMenu));return;}});
by("clear-checked-shopping")?.addEventListener("click",()=>{const removed=ext.shopping.filter(x=>x.done);if(!removed.length){showActionToast("No checked items to clear.",null,4000);return;}openModal("Clear checked items?",`Remove ${removed.length} checked item${removed.length===1?"":"s"}.`,`Clear Checked`,()=>{ext.shopping=ext.shopping.filter(x=>!x.done);saveExt();renderShopping();showActionToast("Checked items cleared.",()=>{ext.shopping.push(...removed);saveExt();renderShopping();},8000);});});
by("print-shopping-list")?.addEventListener("click",()=>{renderShoppingPrint();document.body.classList.add("printing-shopping");setTimeout(()=>{window.print();document.body.classList.remove("printing-shopping");},80);});by("share-shopping-list")?.addEventListener("click",async()=>{const text=ext.shopping.filter(x=>!x.done).map(x=>`${x.category}: ${x.item}${x.quantity?` — ${x.quantity}`:""}`).join("\n");if(navigator.share)try{await navigator.share({title:"Shopping List",text});}catch{}else{await navigator.clipboard?.writeText(text);showActionToast("Shopping list copied to the clipboard.",null,5000);}});
by("speak-shopping-item")?.addEventListener("click",()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){showActionToast("Speech entry is unavailable in this browser.",null,5000);return;}const r=new SR();r.lang="en-AU";r.interimResults=false;r.onresult=e=>{by("shopping-item").value=e.results[0][0].transcript;by("shopping-item").dispatchEvent(new Event("change"));};r.start();});


by("food-data-settings")?.addEventListener("click",()=>{const settings=ext.foodDataSettings||{};openModal("Food Data Sources","Australian verified records are prioritised. Online sources broaden coverage but must be reviewed.","Save",()=>{ext.foodDataSettings={usdaKey:by("usda-api-key")?.value.trim()||""};saveExt();showActionToast("Food data settings saved.",null,5000);},`<p><strong>Open Food Facts</strong> supplies a large international packaged-product database and barcode lookup. Records are community supplied.</p><p><strong>Australian Food Composition Database</strong> remains the preferred reference for Australian generic foods. Alpha 0.6.5 links to its official search while a licensed local import is prepared.</p><label>USDA FoodData Central API key (optional)<input id="usda-api-key" value="${esc(settings.usdaKey||"")}" placeholder="Leave blank to use the low-limit DEMO_KEY"></label><p class="fine">Do not publish a private API key in a public web build. A production server should protect it.</p>`);});

// Food preferences and family readiness
function renderFoodPreferences(){
  const d=mainData().dietary||{};
  by("pref-foods-love").value=d["foods-love"]||"";
  by("pref-foods-like").value=d["foods-like"]||"";
  by("pref-foods-dislike").value=d["foods-dislike"]||"";
  by("pref-foods-never").value=d["foods-never"]||"";
  by("pref-food-context").value=d["food-context"]||"";
}
by("save-food-preferences")?.addEventListener("click",()=>{
  const d=mainData();d.dietary ||= {};
  d.dietary["foods-love"]=by("pref-foods-love").value.trim();
  d.dietary["foods-like"]=by("pref-foods-like").value.trim();
  d.dietary["foods-dislike"]=by("pref-foods-dislike").value.trim();
  d.dietary["foods-never"]=by("pref-foods-never").value.trim();
  d.dietary["food-context"]=by("pref-food-context").value.trim();
  localStorage.setItem(MAIN_KEY,JSON.stringify(d));
  showActionToast("Food Preferences saved. You can update them at any time.",null,5500);
});
const CONNECTIONS=["Apple Health & Apple Watch","Google Health Connect","Smart Scales","Fitness Trackers","Nutrition Apps","Calendar & Reminders","Private Household Sharing"];
function renderConnections(){by("family-sharing-enabled").checked=!!ext.family.enabled;by("household-name").value=ext.family.name||"";by("family-email").value=ext.family.email||"";by("connections-list").innerHTML=CONNECTIONS.map(name=>`<label class="connection-row"><span><strong>${esc(name)}</strong><small>Preference saved locally; secure connection not active in this static trial.</small></span><input type="checkbox" data-connection="${esc(name)}" ${ext.connections[name]?"checked":""}></label>`).join("");}
by("save-family")?.addEventListener("click",()=>{ext.family={enabled:by("family-sharing-enabled").checked,name:by("household-name").value,email:by("family-email").value};saveExt();showActionToast("Household-sharing preferences saved locally.",null,5500);});
document.addEventListener("change",event=>{if(event.target.dataset.connection){ext.connections[event.target.dataset.connection]=event.target.checked;saveExt();showActionToast(`${event.target.dataset.connection} preference ${event.target.checked?"enabled":"disabled"}.`,null,4500);}});

// Progress history
function currentPeriod(){return q(".history-period button.active")?.dataset.period||"30";}
function renderHistory(period){
  const days=period==="all"?null:n(period);const cutoff=days?new Date(Date.now()-days*86400000):null;const within=date=>!cutoff||new Date(date+"T12:00:00")>=cutoff;
  const main=mainData();const weights=(main.weightHistory||[]).filter(x=>within(x.date)).sort((a,b)=>a.date.localeCompare(b.date));const dates=Object.keys(ext.diary).filter(within).sort();const recorded=dates.filter(date=>entriesForDate(date).some(e=>e.status==="eaten"));const totals=recorded.map(date=>({date,...daySummary(date)}));const average=key=>recorded.length?totals.reduce((sum,x)=>sum+n(x.nutrients[key]),0)/recorded.length:0;const activities=ext.exercise.filter(x=>within(x.date.slice(0,10)));
  by("history-summary").innerHTML=`<strong>${recorded.length} Recorded ${recorded.length===1?"Day":"Days"} · ${weights.length} Weight ${weights.length===1?"Entry":"Entries"} · ${activities.length} ${activities.length===1?"Activity":"Activities"}</strong><p>Averages use recorded days only. Missing days are not counted as zero food intake.</p>`;
  const values=weights.map(x=>n(x.weightKg));const min=Math.min(...values,0),max=Math.max(...values,1),span=Math.max(1,max-min);
  by("history-bars").innerHTML=weights.length?weights.map(x=>`<div class="history-column"><i style="height:${35+(n(x.weightKg)-min)/span*145}px"></i><small>${formatNumber(x.weightKg,true)} kg<br>${esc(x.date)}</small></div>`).join(""):`<p class="empty-state">Add weight check-ins to build your weight trend.</p>`;
  by("nutrition-history").innerHTML=recorded.length?`<div class="summary-grid"><div class="summary-item"><span>Average Energy on Recorded Days</span><strong>${formatNumber(average("calories"))} Cal</strong></div><div class="summary-item"><span>Average Protein</span><strong>${formatNumber(average("protein"))} g</strong></div><div class="summary-item"><span>Average Fibre</span><strong>${formatNumber(average("fibre"))} g</strong></div><div class="summary-item"><span>Average Sodium</span><strong>${formatNumber(average("sodium"))} mg</strong></div></div><div class="history-list">${totals.map(x=>`<div><span>${formatDate(x.date)}</span><strong>${formatNumber(x.nutrients.calories)} Cal · ${entriesForDate(x.date).filter(e=>e.status==="eaten").length} entries</strong></div>`).join("")}</div>`:`<p class="empty-state">No recorded food days in this period.</p>`;
  const totalActivity=activities.reduce((sum,x)=>sum+n(x.calories),0),waterDates=Object.keys(ext.water).filter(within),avgWater=waterDates.length?waterDates.reduce((sum,d)=>sum+n(ext.water[d]),0)/waterDates.length:0;
  by("activity-history-summary").innerHTML=`<div class="summary-grid"><div class="summary-item"><span>Activity Recorded</span><strong>${formatNumber(totalActivity)} Cal Estimated</strong></div><div class="summary-item"><span>Average Additional Drinks on Recorded Days</span><strong>${formatNumber(avgWater)} mL</strong></div></div>`;
}
q(".history-period")?.addEventListener("click",event=>{const b=event.target.closest("[data-period]");if(!b)return;qa(".history-period button").forEach(x=>x.classList.toggle("active",x===b));renderHistory(b.dataset.period);});

// Printable report
function initialiseReport(){const to=isoToday(),from=shiftISO(to,-6);by("report-from").value ||= from;by("report-to").value ||= to;}
function reportRows(from,to){return Object.keys(ext.diary).filter(d=>d>=from&&d<=to).sort().map(date=>({date,entries:entriesForDate(date),summary:daySummary(date)}));}
function buildReport(){
  const from=by("report-from").value,to=by("report-to").value;if(!from||!to||from>to){showActionToast("Choose a valid report date range.",null,5000);return;}
  const main=mainData(),rows=reportRows(from,to),foodOn=by("report-food").checked,weightOn=by("report-weight").checked,activityOn=by("report-activity").checked,waterOn=by("report-water").checked;const weights=(main.weightHistory||[]).filter(x=>x.date>=from&&x.date<=to);const activities=ext.exercise.filter(x=>x.date.slice(0,10)>=from&&x.date.slice(0,10)<=to);
  by("report-preview").innerHTML=`<header class="report-title"><h1>Healthy Eating Companion Progress Report</h1><p>${formatDate(from)} to ${formatDate(to)}</p><p>${esc(main.personal?.preferredName||main.personal?.fullName||"Founder Tester")}</p></header><section><h2>Plain-English Summary</h2><p>${rows.filter(r=>r.entries.some(e=>e.status==="eaten")).length} days contain food records. Unrecorded days are not counted as zero intake. This founder report is for personal review and is not medical advice.</p></section>${foodOn?`<section><h2>Food & Nutrition</h2>${rows.length?rows.map(r=>`<h3>${formatDate(r.date)}</h3><p><strong>${formatNumber(r.summary.nutrients.calories)} Cal</strong> · Protein ${formatNumber(r.summary.nutrients.protein)} g · Fibre ${formatNumber(r.summary.nutrients.fibre)} g · Sodium ${formatNumber(r.summary.nutrients.sodium)} mg</p><table><thead><tr><th>Meal</th><th>Food</th><th>Status</th><th>Amount</th><th>Cal</th></tr></thead><tbody>${r.entries.map(e=>`<tr><td>${esc(e.meal)}</td><td>${esc(e.name)}</td><td>${esc(statusLabel(e.status))}</td><td>${formatNumber(e.amount,true)} ${esc(e.unitLabel||e.unit)}</td><td>${formatNumber(e.nutrients.calories)}</td></tr>`).join("")}</tbody></table>`).join(""):`<p>No food records in this period.</p>`}</section>`:""}${weightOn?`<section><h2>Weight</h2>${weights.length?`<table><thead><tr><th>Date</th><th>Weight</th><th>Note</th></tr></thead><tbody>${weights.map(w=>`<tr><td>${esc(w.date)}</td><td>${formatNumber(w.weightKg,true)} kg</td><td>${esc(w.note||"")}</td></tr>`).join("")}</tbody></table>`:`<p>No weight entries in this period.</p>`}</section>`:""}${activityOn?`<section><h2>Activity</h2>${activities.length?`<table><thead><tr><th>Date</th><th>Activity</th><th>Minutes</th><th>Burned</th><th>Credited</th></tr></thead><tbody>${activities.map(a=>`<tr><td>${esc(a.date.slice(0,10))}</td><td>${esc(a.name)}</td><td>${formatNumber(a.minutes)}</td><td>${formatNumber(a.calories)} Cal</td><td>${formatNumber(a.credit)} Cal</td></tr>`).join("")}</tbody></table>`:`<p>No activity entries in this period.</p>`}</section>`:""}${waterOn?`<section><h2>Hydration & Steps</h2><table><thead><tr><th>Date</th><th>Total Hydration</th><th>Steps</th></tr></thead><tbody>${Object.keys({...ext.diary,...ext.water,...ext.steps}).filter(d=>d>=from&&d<=to).sort().map(d=>`<tr><td>${esc(d)}</td><td>${formatNumber(dayHydration(d).total)} mL</td><td>${formatNumber(ext.steps[d])}</td></tr>`).join("")}</tbody></table></section>`:""}`;
}
by("preview-report")?.addEventListener("click",buildReport);by("print-report")?.addEventListener("click",()=>{buildReport();setTimeout(()=>window.print(),80);});
by("download-data")?.addEventListener("click",()=>{const blob=new Blob([JSON.stringify({profile:mainData(),functional:ext},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`healthy-eating-companion-alpha-0-6-5-data-${isoToday()}.json`;a.click();URL.revokeObjectURL(url);});

// Contextual help
const HELP={
  "food-diary":"Swipe the date card to move through days, or tap it for a calendar. Use the plus beside a meal to add food. Foods added while planning are Planned automatically. Use Ate as Planned for a whole meal, or change only the items that differed. The Day Settings save button appears only after a change.",
  "food-library":"Search prioritises exact Australian matches and your own foods. Review the serving size and source before adding. Save Food is labelled in words rather than relying on a bookmark icon.",
  "quick-log":"Speak or type naturally, correct the transcript, then review the identified foods. Nothing is logged automatically. Accent recognition depends on the device speech service, while the food vocabulary and confirmation flow are controlled here.",
  "scan-centre":"Barcode photos and live camera scanning can look up products in Open Food Facts. Nutrition-panel OCR fills editable review fields. Meal photos never guess calories; identify and confirm every food before logging.",
  "meal-planner":"Tick one or more meals for the app to plan. Accept a suggestion or choose Try Again for just that meal. Existing plans are protected before anything is replaced.",
  "daily-progress":"Meal status appears first so you can confirm or amend the plan quickly. Solid bar sections show eaten amounts and lighter sections show planned amounts. Fluids include water and other logged drinks. Estimated moisture in solid foods is shown separately. Update the plan as the day changes.",
  "progress-history":"Averages use days with actual records only. There are no flames, game badges or leaderboards—only meaningful progress information."
};
document.addEventListener("click",event=>{const b=event.target.closest("[data-help]");if(!b)return;const copy=HELP[b.dataset.help]||"Help is available for this screen.";openModal("Help With This Screen",copy,"Close",()=>{});by("a05-modal-confirm").className="primary";if(mainData().companion?.enabled&&typeof window.speakText==="function")window.speakText(copy);});

// Alpha 0.6.5 migration: preserve all existing records, while separating Normal and Fasting targets.
function recommendedNormalTarget(){const main=mainData(),cal=n(main.recommendations?.energyKj)/4.184;return whole(cal)||2000;}
function refreshDiaryEnergyPreview(target){const slide=by("diary-day-summary")?.querySelector(".summary-slide");if(!slide)return;const date=diaryDate(),consumed=dayNutrition(date,["eaten"]).calories,exercise=(ext.exercise||[]).filter(x=>x.date?.slice(0,10)===date).reduce((sum,x)=>sum+n(x.credit),0),goal=n(target)+exercise;slide.innerHTML=`<span>Today’s Energy</span><div class="diary-kpi-row"><div><small>Goal</small><strong>${formatNumber(goal)} Cal</strong></div><div><small>Consumed</small><strong>${formatNumber(consumed)} Cal</strong></div><div><small>Remaining</small><strong>${formatNumber(Math.max(0,goal-consumed))} Cal</strong></div></div>`;}
ext.version="0.6.5";ext.dayTypeTargets||={normal:recommendedNormalTarget(),fasting:500};if(!n(ext.dayTypeTargets.normal))ext.dayTypeTargets.normal=recommendedNormalTarget();if(!n(ext.dayTypeTargets.fasting))ext.dayTypeTargets.fasting=500;Object.values(ext.daySettings||{}).forEach(settings=>{if(settings?.type==="normal"&&n(settings.targetCal)<=700&&recommendedNormalTarget()>1000)settings.targetCal=ext.dayTypeTargets.normal;});saveExt();

// Initial setup and integration
function init(){
  // Postal address behaviour and Alpha 0.6.2 profile extensions
  const postalSame=by("postal-same"),postalFields=by("postal-fields");const togglePostal=()=>postalFields?.classList.toggle("hidden",postalSame?.checked);postalSame?.addEventListener("change",togglePostal);togglePostal();
  const dietaryIds=["food-allergies","food-intolerances","medical-restrictions","eating-pattern","pregnancy-status","cultural-restrictions"];
  by("personal-next")?.addEventListener("click",()=>setTimeout(()=>{const d=mainData();d.personal=Object.assign(d.personal||{},{postalSame:postalSame?.checked,postalCountry:by("postal-country")?.value,postalRegion:by("postal-region")?.value,postalPostcode:by("postal-postcode")?.value,postalSuburb:by("postal-suburb")?.value,postalStreet:by("postal-street")?.value});localStorage.setItem(MAIN_KEY,JSON.stringify(d));},30));
  by("calculate-button")?.addEventListener("click",()=>setTimeout(()=>{const d=mainData();d.dietary=Object.assign({},d.dietary||{},Object.fromEntries(dietaryIds.map(id=>[id,by(id)?.value||""])));localStorage.setItem(MAIN_KEY,JSON.stringify(d));},30));
  const d=mainData(),p=d.personal||{};if(postalSame){postalSame.checked=p.postalSame!==false;[["postal-country","postalCountry"],["postal-region","postalRegion"],["postal-postcode","postalPostcode"],["postal-suburb","postalSuburb"],["postal-street","postalStreet"]].forEach(([id,key])=>{if(by(id))by(id).value=p[key]||""});togglePostal();}dietaryIds.forEach(id=>{if(by(id))by(id).value=d.dietary?.[id]||""});
  initialiseDateControls();renderRecipeSelectOptions();renderScanSelect();renderHomeSummary();
  // Ensure earlier founder profiles can migrate without losing functional data.
  saveExt();
  if(mainData().completed){const profile=mainData();if(profile.firstHomePending){openFeature("home");profile.firstHomePending=false;localStorage.setItem(MAIN_KEY,JSON.stringify(profile));}else openFeature("daily-progress");}
}
init();
})();
