(() => {
"use strict";

const APP = window.HEC_APP || {name:"Healthy Eating Companion",version:"0.6.12",storageKey:"healthyEatingCompanionAlpha06",functionalStorageKey:"healthyEatingCompanionAlpha06Functional"};
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

const NUTRIENT_KEYS = ["calories","protein","carbs","fat","satFat","fibre","sugar","addedSugar","freeSugar","sodium"];
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
// Alpha 0.6.12: keep a plain egg separate from egg dishes so search and preparation are easier to understand.
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
  {id:"suggest-snack-1",name:"Greek Yoghurt & Berries",meal:"Snacks",score:8,reason:"Protein, calcium and fruit in a practical snack.",items:[{foodId:"greek-yoghurt",amount:170,unit:"g"},{foodId:"berries",amount:100,unit:"g"}]},
  {id:"suggest-snack-2",name:"Apple",meal:"Snacks",score:8,reason:"Simple fruit snack with fibre.",items:[{foodId:"apple",amount:1,unit:"item"}]},
  {id:"suggest-breakfast-3",name:"Oats, Milk & Banana",meal:"Breakfast",score:9,reason:"Wholegrain breakfast with fruit and dairy.",items:[{foodId:"oats",amount:40,unit:"g"},{foodId:"light-milk-au",amount:200,unit:"mL"},{foodId:"banana",amount:1,unit:"item"}]},
  {id:"suggest-smoko-2",name:"Yoghurt & Berries",meal:"Snacks",score:8,reason:"Fruit, dairy and protein in a practical snack.",items:[{foodId:"greek-yoghurt",amount:120,unit:"g"},{foodId:"berries",amount:80,unit:"g"}]},
  {id:"suggest-afternoon-2",name:"Apple & Yoghurt",meal:"Snacks",score:8,reason:"Fruit and dairy with useful fibre and protein.",items:[{foodId:"apple",amount:1,unit:"item"},{foodId:"greek-yoghurt",amount:100,unit:"g"}]},
  {id:"suggest-supper-1",name:"Light Milk & Banana",meal:"Snacks",score:8,reason:"Simple fruit and dairy option for a lighter supper.",items:[{foodId:"light-milk-au",amount:200,unit:"mL"},{foodId:"banana",amount:1,unit:"item"}]},
  {id:"suggest-supper-2",name:"Greek Yoghurt & Berries",meal:"Snacks",score:8,reason:"A modest dairy and fruit option.",items:[{foodId:"greek-yoghurt",amount:120,unit:"g"},{foodId:"berries",amount:80,unit:"g"}]},
  {id:"suggest-breakfast-light",name:"Egg & Berries",meal:"Breakfast",score:8,reason:"A small protein-and-fruit option when the available energy is limited.",items:[{foodId:"egg",amount:1,unit:"item"},{foodId:"berries",amount:50,unit:"g"}]},
  {id:"suggest-morning-light",name:"Small Berry Snack",meal:"Snacks",score:9,reason:"A very light fruit option for a tightly budgeted day.",items:[{foodId:"berries",amount:80,unit:"g"}]},
  {id:"suggest-lunch-light",name:"Tuna & Garden Salad",meal:"Lunch",score:9,reason:"Lean protein and vegetables in a light lunch that leaves room for other selected meals.",items:[{foodId:"tuna",amount:60,unit:"g"},{foodId:"salad",amount:100,unit:"g"}]},
  {id:"suggest-lunch-light-grain",name:"Tuna, Salad & Wholemeal Toast",meal:"Lunch",score:9,reason:"A lighter lunch with protein, vegetables and one grain serve.",items:[{foodId:"tuna",amount:60,unit:"g"},{foodId:"salad",amount:100,unit:"g"},{foodId:"wholemeal-bread",amount:1,unit:"slice"}]},
  {id:"suggest-afternoon-light",name:"Small Plain Yoghurt",meal:"Snacks",score:8,reason:"A small dairy-and-protein option for a lower-energy day.",items:[{foodId:"greek-yoghurt",amount:60,unit:"g"}]},
  {id:"suggest-dinner-light",name:"Light Chicken, Potato & Broccoli",meal:"Dinner",score:9,reason:"A smaller balanced dinner for a day with a tight remaining energy allowance.",items:[{foodId:"chicken-breast",amount:80,unit:"g"},{foodId:"potato",amount:80,unit:"g"},{foodId:"broccoli",amount:100,unit:"g"}]},
  {id:"suggest-dinner-very-light",name:"Chicken & Broccoli",meal:"Dinner",score:9,reason:"A very light protein-and-vegetable dinner when little energy remains.",items:[{foodId:"chicken-breast",amount:60,unit:"g"},{foodId:"broccoli",amount:100,unit:"g"}]},
  {id:"suggest-snacks-light",name:"Small Berry Bowl",meal:"Snacks",score:9,reason:"A small fruit snack for a tightly budgeted day.",items:[{foodId:"berries",amount:50,unit:"g"}]},

  {id:"suggest-lunch-grain",name:"Chicken, Brown Rice & Salad",meal:"Lunch",score:9,reason:"Adds wholegrain-style carbohydrate while keeping vegetables and lean protein balanced.",items:[{foodId:"chicken-breast",amount:80,unit:"g"},{foodId:"brown-rice",amount:150,unit:"g"},{foodId:"salad",amount:100,unit:"g"}]},
  {id:"suggest-dinner-rice",name:"Chicken, Brown Rice & Broccoli",meal:"Dinner",score:9,reason:"Balances a main protein with grains and vegetables.",items:[{foodId:"chicken-breast",amount:100,unit:"g"},{foodId:"brown-rice",amount:150,unit:"g"},{foodId:"broccoli",amount:100,unit:"g"}]},
  {id:"suggest-dinner-toast",name:"Eggs, Wholemeal Toast & Vegetables",meal:"Dinner",score:8,reason:"A lighter dinner that contributes grains, protein and vegetables.",items:[{foodId:"egg",amount:2,unit:"item"},{foodId:"wholemeal-bread",amount:2,unit:"slice"},{foodId:"salad",amount:100,unit:"g"}]},
  {id:"suggest-breakfast-muffin",name:"Egg & Bacon Muffin",meal:"Breakfast",score:7,reason:"A familiar cooked breakfast with protein and a grain serve.",items:[{foodId:"english-muffin",amount:1,unit:"item"},{foodId:"egg",amount:1,unit:"item"},{foodId:"shortcut-bacon",amount:1,unit:"rasher"}]},
  {id:"suggest-breakfast-yoghurt",name:"Yoghurt, Oats & Berries",meal:"Breakfast",score:9,reason:"A lighter breakfast with dairy, wholegrain oats and fruit.",items:[{foodId:"greek-yoghurt",amount:120,unit:"g"},{foodId:"oats",amount:30,unit:"g"},{foodId:"berries",amount:80,unit:"g"}]},
  {id:"suggest-morning-egg",name:"Boiled Egg",meal:"Snacks",score:8,reason:"A compact protein snack when fruit is already well covered.",items:[{foodId:"egg",amount:1,unit:"item"}]},
  {id:"suggest-morning-yoghurt",name:"Small Yoghurt",meal:"Snacks",score:8,reason:"A modest dairy and protein snack.",items:[{foodId:"greek-yoghurt",amount:100,unit:"g"}]},
  {id:"suggest-lunch-rice",name:"Tuna, Brown Rice & Salad",meal:"Lunch",score:9,reason:"Adds grains, vegetables and lean protein in one meal.",items:[{foodId:"tuna",amount:75,unit:"g"},{foodId:"brown-rice",amount:120,unit:"g"},{foodId:"salad",amount:120,unit:"g"}]},
  {id:"suggest-lunch-eggs",name:"Eggs, Toast & Salad",meal:"Lunch",score:8,reason:"A simple lunch with protein, grains and vegetables.",items:[{foodId:"egg",amount:2,unit:"item"},{foodId:"wholemeal-bread",amount:2,unit:"slice"},{foodId:"salad",amount:120,unit:"g"}]},
  {id:"suggest-afternoon-egg",name:"Egg & Apple",meal:"Snacks",score:8,reason:"A compact protein and fruit snack.",items:[{foodId:"egg",amount:1,unit:"item"},{foodId:"apple",amount:1,unit:"item"}]},
  {id:"suggest-afternoon-toast",name:"Wholemeal Toast & Avocado",meal:"Snacks",score:8,reason:"A savoury snack that contributes grains and healthy fats.",items:[{foodId:"wholemeal-bread",amount:1,unit:"slice"},{foodId:"avocado",amount:30,unit:"g"}]},
  {id:"suggest-dinner-steak",name:"Steak, Potato & Salad",meal:"Dinner",score:8,reason:"A familiar dinner with protein, vegetables and a starchy side.",items:[{foodId:"beef-steak",amount:120,unit:"g"},{foodId:"potato",amount:150,unit:"g"},{foodId:"salad",amount:150,unit:"g"}]},
  {id:"suggest-dinner-sausage",name:"Sausage, Brown Rice & Vegetables",meal:"Dinner",score:7,reason:"A familiar meal balanced with grains and vegetables.",items:[{foodId:"beef-sausage",amount:1,unit:"item"},{foodId:"brown-rice",amount:120,unit:"g"},{foodId:"broccoli",amount:120,unit:"g"}]},
  {id:"suggest-snacks-milk",name:"Light Milk",meal:"Snacks",score:8,reason:"A simple dairy option when only a small snack is needed.",items:[{foodId:"light-milk-au",amount:200,unit:"mL"}]},
];

const EXT_DEFAULTS = {
  version:"0.6.12", diary:{}, daySettings:{}, water:{}, fluidTargets:{}, steps:{}, dailyNotes:{}, exercise:[], shopping:[], onlineFoods:[], onlineSearchCache:{},
  family:{enabled:false,name:"",email:""}, connections:{}, customFoods:[], savedFoodIds:[], recipes:[], mealTemplates:[], shoppingVoiceAliases:{},
  ui:{diaryDate:isoToday(),progressDate:isoToday(),plannerDate:isoToday(),diaryView:"all",libraryTab:"all",foodSearch:"",foodSearchByTab:{},scanMode:"food",pendingMeal:"",plannerResults:{},plannerRejected:{},plannerAccepted:{},plannerSessionActive:false,singleMealPreferences:{},recipeDraft:[],recipeName:"",recipeServings:4,recipeNotes:"",returnToRecipe:false,replacingEntryId:"",pendingDrink:null}
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
  if(current){ const loaded=merge(clone(EXT_DEFAULTS),current); loaded.version="0.6.12"; return loaded; }
  for(const legacyKey of LEGACY_EXT_KEYS){
    try {
      const legacy = JSON.parse(localStorage.getItem(legacyKey));
      if(legacy){
        const migrated = merge(clone(EXT_DEFAULTS),legacy);
        migrated.version = "0.6.12";
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

let AFCD_FOODS=[];
let afcdLoaded=false;
function afcdCategory(food){
  const name=normalise(food.name),code=String(food.classification||"");
  if(/water|juice|drink|beverage|coffee|tea|cordial|soft drink|milk/.test(name))return "Australian AFCD · Drinks";
  if(/bread|roll|biscuit|cracker|cereal|oat|rice|pasta|noodle|flour|grain|muffin/.test(name))return "Australian AFCD · Grains & Bakery";
  if(/yoghurt|yogurt|cheese|custard|cream|dairy/.test(name))return "Australian AFCD · Dairy";
  if(/beef|pork|lamb|veal|chicken|turkey|fish|tuna|salmon|prawn|seafood|sausage|bacon|egg/.test(name))return "Australian AFCD · Protein Foods";
  if(/apple|banana|berry|berries|orange|mandarin|mango|melon|grape|pear|peach|plum|fruit/.test(name))return "Australian AFCD · Fruit";
  if(/potato|carrot|broccoli|pumpkin|zucchini|spinach|lettuce|tomato|vegetable|onion|capsicum|bean|pea/.test(name))return "Australian AFCD · Vegetables";
  return code.startsWith("2")?"Australian AFCD · Plant Foods":"Australian AFCD";
}
function afcdFoodGroups(food){
  const category=afcdCategory(food),nrm=normalise(food.name),per100={};
  if(category.includes("Vegetables"))per100.vegetables=100/75;
  else if(category.includes("Fruit"))per100.fruit=100/150;
  else if(category.includes("Grains"))per100.grains=/bread|roll|muffin/.test(nrm)?2:1;
  else if(category.includes("Dairy"))per100.dairy=0.6;
  else if(category.includes("Protein"))per100.proteinFoods=/egg/.test(nrm)?1:1.25;
  return per100;
}
function friendlyAliasesForAfcd(name){
  const nrm=normalise(name), aliases=[];
  const add=(...values)=>values.forEach(v=>{if(v&&!aliases.includes(v))aliases.push(v);});
  if(/flat white|latte|cappuccino/.test(nrm))add("cappuccino","cappuccino with milk","coffee with milk","flat white","latte");
  if(/cake, carrot|carrot cake/.test(nrm))add("carrot cake","homemade carrot cake","cake carrot");
  if(/egg/.test(nrm)&&/poach/.test(nrm))add("poached egg","egg poached");
  if(/egg/.test(nrm)&&/boil/.test(nrm))add("boiled egg","hard boiled egg","egg boiled");
  if(/egg/.test(nrm)&&/fried/.test(nrm))add("fried egg","egg fried");
  if(/egg/.test(nrm)&&/scrambl/.test(nrm))add("scrambled egg","scrambled eggs");
  if(/omelette|omelet/.test(nrm))add("omelette","egg omelette","omelet");
  if(/^bacon\b/.test(nrm))add("bacon","bacon rasher","shortcut bacon","short cut bacon");
  if(/muffin/.test(nrm)&&/english/.test(nrm))add("english muffin","breakfast muffin");
  if(/^sausage/.test(nrm))add("sausage","sausages");
  if(/beef/.test(nrm)&&/steak/.test(nrm))add("beef steak","steak");
  if(/yoghurt|yogurt/.test(nrm))add("yoghurt","yogurt","greek yoghurt","greek yogurt");
  if(/cheese/.test(nrm))add("cheese");
  if(/potato/.test(nrm))add("potato","potatoes");
  if(/pumpkin/.test(nrm))add("pumpkin");
  if(/carrot/.test(nrm)&&!/cake/.test(nrm))add("carrot","carrots");
  if(/bread/.test(nrm)&&/wholemeal/.test(nrm))add("wholemeal bread","whole wheat bread");
  if(/soft drink/.test(nrm))add("soft drink","soda");
  return aliases;
}
function everydayAfcdFamily(food){
  const name=normalise(food.name), tests=[
    ["Coffee",/cappuccino|flat white|latte/],["Eggs",/\begg\b/],["Bacon",/\bbacon\b/],["English Muffins",/english.*muffin|muffin.*english/],["Bread",/\bbread\b/],
    ["Milk",/\bmilk\b/],["Yoghurt",/yoghurt|yogurt/],["Cheese",/\bcheese\b/],["Chicken",/\bchicken\b/],["Steak",/beef.*steak|steak.*beef/],["Sausages",/sausage/],
    ["Fish",/\btuna\b|\bsalmon\b|\bfish\b/],["Potatoes",/\bpotato/],["Pumpkin",/\bpumpkin\b/],["Carrots",/\bcarrot/],["Broccoli",/\bbroccoli\b/],["Tomatoes",/\btomato/],["Onions",/\bonion/],
    ["Fruit",/\bapple\b|\bbanana\b|\borange\b|mandarin|\bpear\b|berries|strawberry/],["Oats & Cereal",/rolled oat|oatmeal|\bcereal\b/],["Rice",/\brice\b/],["Pasta & Noodles",/\bpasta\b|\bnoodle/],
    ["Biscuits & Crackers",/biscuit|cracker/],["Carrot Cake",/cake, carrot|carrot cake/],["Baked Beans",/baked bean/],["Soup",/\bsoup\b/],["Pizza",/\bpizza\b/],["Burgers",/hamburger|\bburger\b/],
    ["Juice",/\bjuice\b/],["Soft Drink",/soft drink/]
  ];
  return tests.find(([,re])=>re.test(name))?.[0]||"";
}
function everydayAfcdPriority(food){const family=everydayAfcdFamily(food);if(!family)return 0;const order=["Coffee","Eggs","Bacon","English Muffins","Bread","Milk","Yoghurt","Cheese","Chicken","Steak","Sausages","Fish","Potatoes","Pumpkin","Carrots","Broccoli","Tomatoes","Onions","Fruit","Oats & Cereal","Rice","Pasta & Noodles","Biscuits & Crackers","Carrot Cake","Baked Beans","Soup","Pizza","Burgers","Juice","Soft Drink"];return 200-order.indexOf(family);}

function convertAfcdFood(raw){
  const gravity=n(raw.specificGravity),liquid=/water|juice|drink|beverage|coffee|tea|cordial|soft drink|milk/.test(normalise(raw.name));
  const units={g:.01,serving:1},labels={g:"g",serving:"100 g Serving"};
  if(liquid&&gravity>0){units.mL=gravity/100;labels.mL="mL";}
  return {id:raw.id,afcdKey:raw.afcdKey,name:raw.name,brand:"Australian Food Composition Database",category:afcdCategory(raw),country:"Australia",aliases:friendlyAliasesForAfcd(raw.name),defaultAmount:liquid&&gravity>0?100:100,defaultUnit:liquid&&gravity>0?"mL":"g",units,unitLabels:labels,serving:"Reference Values per 100 g",nutrients:raw.nutrients,score:7,source:"Food Standards Australia New Zealand · AFCD Release 3",verified:true,ingredients:raw.description||"",allergens:[],waterMl:n(raw.moisture),hydrationType:liquid?"drink":"food",foodGroups:afcdFoodGroups(raw),afcd:true,derivation:raw.derivation||""};
}
async function loadAfcdFoods(){
  if(afcdLoaded)return AFCD_FOODS;
  try{const response=await fetch("./afcd-release-3.json",{cache:"force-cache"});if(!response.ok)throw new Error("AFCD file unavailable");const data=await response.json();AFCD_FOODS=(data.foods||[]).map(convertAfcdFood);afcdLoaded=true;if(by("food-results")&&q("#food-library.active"))renderLibrary();if(by("recipe-search")&&q("#recipe-builder.active"))renderRecipeSearch();return AFCD_FOODS;}catch(error){console.warn("AFCD local database could not be loaded",error);AFCD_FOODS=[];afcdLoaded=true;return AFCD_FOODS;}
}
function nonRecipeFoods(){
  const custom = (ext.customFoods || []).map(f => ({...f,source:f.source || "User Created",verified:false}));
  return [...FOODS,...custom,...AFCD_FOODS,...(ext.onlineFoods||[])];
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
  const recorded = recordedEntriesForDate(date);
  const missing = recorded.filter(entry => !hasEnergyValue(entry?.nutrients?.calories));
  return {recorded,missing,total:dayNutrition(date).calories};
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
function recommendedNormalTarget(){
  const main=mainData(),r=main.recommendations||{};
  const exact=n(r.targetCal);if(exact>=300)return whole(exact);
  const fromKj=n(r.energyKj)/4.184;if(fromKj>=300)return whole(fromKj);
  const stored=n(ext.dayTypeTargets?.normal);if(stored>=300&&ext.dayTypeTargets?.normalSource==="profile")return whole(stored);
  return 0;
}
function balancedMacroTargets(calories){
  const main=mainData(),r=main.recommendations||{},profileProtein=n(r.protein),profileFat=n(r.fat),profileCarbs=n(r.carbs),cal=Math.max(300,n(calories));
  const profileEnergy=profileProtein*4+profileFat*9+profileCarbs*4,proteinShare=profileEnergy?profileProtein*4/profileEnergy:0;
  if(profileEnergy&&proteinShare>=.15&&proteinShare<=.30)return {protein:profileProtein,fat:profileFat,carbs:profileCarbs};
  const goal=main.health?.goal||"maintain",proteinPct=goal==="lose"?.25:.20,fatPct=.30;
  const protein=whole(cal*proteinPct/4),fat=whole(cal*fatPct/9),carbs=Math.max(0,whole((cal-protein*4-fat*9)/4));return {protein,fat,carbs};
}
function currentGoals(date=isoToday()){
  const settings=ext.daySettings[date]||{},type=settings.type||"normal";
  const standard=type==="fasting"?(n(ext.dayTypeTargets?.fasting)||500):recommendedNormalTarget();
  const calTarget=settings.customTarget?(n(settings.targetCal)||standard):standard;
  const exerciseCredit=(ext.exercise||[]).filter(x=>(x.localDate||x.date?.slice(0,10))===date).reduce((sum,x)=>sum+n(x.credit),0),hydration=hydrationReference(),macros=balancedMacroTargets(calTarget||300);
  return {calories:calTarget?calTarget+exerciseCredit:0,baseCalories:calTarget,exerciseCredit,hydration:hydration.fluids,fluids:hydration.fluids,protein:calTarget?macros.protein:0,fat:calTarget?macros.fat:0,carbs:calTarget?macros.carbs:0,fibre:30,sugar:null,freeSugar:calTarget?calTarget*.10/4:0,addedSugar:calTarget?calTarget*.10/4:0,sodium:2000,steps:10000,foodGroups:foodGroupGoals(),dayType:type};
}
function entriesForDate(date){ return ext.diary[date] || []; }
function recordedEntriesForDate(date){ return entriesForDate(date).filter(e => e && e.status!=="skipped"); }
function dayNutrition(date){ return sumNutrients(recordedEntriesForDate(date)); }
function entryFoodProfile(entry){
  if(entry.foodGroups || entry.waterMl !== undefined)return {foodGroups:entry.foodGroups||{},waterMl:n(entry.waterMl),hydrationType:entry.hydrationType||"food"};
  const food=getFood(entry.foodId);return {foodGroups:scaledFoodGroups(food,entry.amount,entry.unit),waterMl:scaledWaterMl(food,entry.amount,entry.unit),hydrationType:food?.hydrationType||"food"};
}
function dayFoodGroups(date){
  return sumGroupValues(recordedEntriesForDate(date).map(entry=>entryFoodProfile(entry)));
}
function dayHydration(date,includeManual=true){
  const manual=includeManual?n(ext.water[date]):0;let drinks=manual,foodMoisture=0;
  recordedEntriesForDate(date).forEach(entry=>{const profile=entryFoodProfile(entry);if(profile.hydrationType==="drink")drinks+=profile.waterMl;else foodMoisture+=profile.waterMl;});
  return {manual,drinks,foodMoisture,total:drinks+foodMoisture};
}
function daySummary(date){
  const nutrients = dayNutrition(date);
  const hydration=dayHydration(date,true);
  return {nutrients,hydration,water:hydration.drinks,steps:n(ext.steps[date]),foodGroups:dayFoodGroups(date),goals:currentGoals(date)};
}

function openFeature(id,options={}){
  if(options.fromHome){
    const today=isoToday();
    if(id==="food-diary")ext.ui.diaryDate=today;
    if(id==="daily-progress")ext.ui.progressDate=today;
    if(id==="meal-planner"){ext.ui.plannerDate=today;resetPlannerSelections();}
    if(id==="food-library"){ext.ui.pendingMeal="";ext.ui.foodSearch="";ext.ui.libraryTab="all";}
    saveExt();
  }
  if(id==="food-library"&&options.freshSearch){ext.ui.foodSearch="";ext.ui.libraryTab="all";saveExt();}
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
  const scanButton=event.target.closest("[data-open-scan-mode]");
  if(scanButton){event.preventDefault();const mode=scanButton.dataset.openScanMode||"barcode";stopBarcodeCamera();ext.ui.scanMode=mode;saveExt();openFeature("scan-centre");if(mode==="barcode")startBarcodeCamera();return;}
  const button = event.target.closest("[data-open-feature]");
  if(button){ event.preventDefault();if(button.id==="diary-plan-multiple"){resetPlannerSelections();ext.ui.singleMealPreferences={};saveExt();} openFeature(button.dataset.openFeature); }
});

function shiftISO(date,days){ const d=new Date((date||isoToday())+"T12:00:00");d.setDate(d.getDate()+days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function mealNames(){ return ["Breakfast","Lunch","Dinner","Snacks","Other"]; }
function plannerMealNames(){ return ["Breakfast","Lunch","Dinner","Snacks","Other"]; }

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


function statusLabel(status){ return status === "skipped" ? "Removed" : "Recorded"; }
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
let daySettingsBaseline={type:"normal",targetCal:0,customTarget:false};
function setDaySettingsDirty(dirty){daySettingsDirty=!!dirty;by("save-day-settings")?.classList.toggle("hidden",!daySettingsDirty);}
function updateDaySettingsDirty(){
  const current={type:by("day-type")?.value||"normal",targetCal:whole(by("day-cal-target")?.value),customTarget:!!by("day-custom-target")?.checked};
  setDaySettingsDirty(current.type!==daySettingsBaseline.type||current.targetCal!==daySettingsBaseline.targetCal||current.customTarget!==daySettingsBaseline.customTarget);
}
function applyContextDate(context,value){
  if(context==="diary"){ext.ui.diaryDate=value;updateDateControl("diary",value);renderDiary();}
  else if(context==="planner"){ext.ui.plannerDate=value;updateDateControl("planner",value);resetPlannerSelections();saveExt();renderMealSuggestions();renderPlannerEnergySummary();}
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
  if(type === "limit") return ratio > 1 ? ["red","Above Recommended Limit"] : ratio > .75 ? ["yellow","Approaching Recommended Limit"] : ["green","Within Range"];
  if(type === "minimum") return ratio >= 1 ? ["green","Minimum Reached"] : ratio >= .65 ? ["yellow","Building Toward Goal"] : ["neutral","Still Building"];
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
  const savedSettings=ext.daySettings[date]||{},type=savedSettings.type||"normal",normalTarget=recommendedNormalTarget(),baseTarget=type==="fasting"?(n(ext.dayTypeTargets?.fasting)||500):normalTarget,customTarget=!!savedSettings.customTarget,activeTarget=customTarget?(n(savedSettings.targetCal)||baseTarget):baseTarget;
  by("day-type").value=type;by("day-custom-target").checked=customTarget;by("day-cal-target").value=activeTarget?whole(activeTarget):"";by("day-cal-target-label").classList.toggle("hidden",!customTarget);by("day-base-target").textContent=baseTarget?`${formatNumber(baseTarget)} Cal`:"Recommendation Unavailable";by("day-target-label").textContent=type==="fasting"?"Preferred Fasting-Day Target":"Recommended Normal Target";
  daySettingsBaseline={type,targetCal:whole(activeTarget),customTarget};setDaySettingsDirty(false);
  by("day-settings-note").textContent=!baseTarget&&type==="normal"?"Your profile recommendation could not be recovered. Open Edit Health Profile and calculate your recommendations before saving this day.":type==="fasting"?"Fasting Day. Companion suggestions account for every food already recorded and keep the day within your fasting target.":"Normal Day. Your current accepted profile recommendation is used unless you deliberately choose a different target for this date.";
  const goals=currentGoals(date),summary=daySummary(date),recorded=summary.nutrients.calories,remaining=Math.max(0,(summary.goals.calories||0)-recorded);
  if(by("diary-day-type-summary"))by("diary-day-type-summary").textContent=baseTarget?`${type==="fasting"?"Fasting Day":"Normal Day"} · ${formatNumber(goals.baseCalories)} Cal`:`${type==="fasting"?"Fasting Day":"Normal Day"} · Target Needs Attention`;
  if(by("diary-day-plan-summary"))by("diary-day-plan-summary").textContent=`${formatNumber(recorded)} Cal Recorded${goals.calories?` · ${formatNumber(remaining)} Cal Remaining`:""}`;
  by("diary-day-summary").innerHTML=`<article class="summary-slide"><span>${date===isoToday()?"Today’s Energy":relativeDateLabel(date).split(" · ")[0]+" Energy"}</span><div class="diary-kpi-row"><div><small>Goal</small><strong>${goals.calories?`${formatNumber(goals.calories)} Cal`:"Needs Review"}</strong></div><div><small>Recorded</small><strong>${formatNumber(recorded)} Cal</strong></div><div><small>Remaining</small><strong>${goals.calories?`${formatNumber(remaining)} Cal`:"—"}</strong></div></div></article><article class="summary-slide"><span>Macronutrients</span><div class="diary-kpi-row"><div><small>Protein</small><strong>${formatNumber(summary.nutrients.protein)} g</strong></div><div><small>Fat</small><strong>${formatNumber(summary.nutrients.fat)} g</strong></div><div><small>Carbs</small><strong>${formatNumber(summary.nutrients.carbs)} g</strong></div></div></article><article class="summary-slide"><span>Five Food Groups</span><div class="mini-food-groups">${FOOD_GROUP_KEYS.map(key=>`<div><small>${esc(FOOD_GROUP_LABELS[key])}</small><strong>${formatNumber(summary.foodGroups[key],true)}/${formatNumber(summary.goals.foodGroups[key],true)}</strong></div>`).join("")}</div></article>`;
  const diagnostics=calculationDiagnostics(date),diagnosticBox=by("diary-calculation-status");diagnosticBox.className=`calculation-status compact-diary-status ${diagnostics.missing.length?"warning":"neutral"}`;diagnosticBox.innerHTML=diagnostics.missing.length?`<strong>Check ${diagnostics.missing.length} ${diagnostics.missing.length===1?"Entry":"Entries"}</strong><span>Energy is unavailable, so the day total may be incomplete.</span>`:`<strong>${formatNumber(recorded)} Cal Recorded</strong><span>${goals.calories?`${formatNumber(remaining)} Cal remaining for this day.`:"Review your energy target."}</span>`;
  const entries=entriesForDate(date).filter(e=>e.status!=="skipped");ext.ui.diaryView="all";
  by("diary-meals").innerHTML=mealNames().map(meal=>{const mealEntries=entries.filter(e=>e.meal===meal),totals=sumNutrients(mealEntries);return `<section class="meal-list-section redesigned-meal-section" data-meal-name="${esc(meal)}"><header class="meal-list-heading redesigned-meal-heading"><div><h3>${esc(meal)}</h3><strong>${formatNumber(totals.calories)} Cal</strong></div><small>${mealEntries.length?`${mealEntries.length} ${mealEntries.length===1?"Entry":"Entries"}`:"No Entries Yet"}</small></header><div class="meal-simple-list">${mealEntries.length?mealEntries.map(entryCard).join(""):`<p class="meal-empty">No Entries Yet.</p>`}</div><footer class="meal-list-actions redesigned-meal-actions"><button class="meal-add-text" data-add-to-meal="${esc(meal)}" aria-label="Add food to ${esc(meal)}">＋ Add Food</button><button class="meal-suggest-text" data-suggest-context-meal="${esc(meal)}" aria-label="Ask the companion to suggest ${esc(meal)}">✨ Suggest</button><button class="meal-more-text" data-meal-menu="${esc(meal)}" aria-label="More ${esc(meal)} actions">•••</button></footer><div class="meal-menu-actions hidden" data-meal-actions="${esc(meal)}">${mealEntries.length?`<button data-save-meal-template="${esc(meal)}">Save As Reusable Meal</button><button data-clear-diary-meal="${esc(meal)}" class="delete-action">Clear ${esc(meal)}</button>`:`<span>No Additional Meal Actions Yet.</span>`}</div></section>`;}).join("");
  if(ext.ui.focusMeal){setTimeout(()=>{q(`[data-meal-name="${CSS.escape(ext.ui.focusMeal)}"]`)?.scrollIntoView({block:"start",behavior:"smooth"});ext.ui.focusMeal="";saveExt();},60);}saveExt();
}
function entryCard(entry){
  return `<article class="simple-diary-entry recorded-entry" data-entry-id="${esc(entry.id)}"><button class="entry-open" data-entry-edit="${esc(entry.id)}"><span><strong>${esc(entry.name)}</strong><small>${formatNumber(entry.amount,true)} ${esc(entry.unitLabel||entry.unit)}</small></span><b>${formatNumber(entry.nutrients?.calories)} Cal</b></button><button class="entry-more" data-entry-menu="${esc(entry.id)}" aria-label="More actions for ${esc(entry.name)}">•••</button><div class="entry-inline-actions hidden" data-entry-actions="${esc(entry.id)}"><button data-entry-copy="${esc(entry.id)}">Copy</button><button data-entry-delete="${esc(entry.id)}" class="delete-action">Delete Food</button></div></article>`;
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
function prepareEntry(food,{entry=null,date=null,meal=null,status="eaten",source=null,amount=null,unit=null}={}){
  if(!food)return;const defaultDate=date||ext.ui.diaryDate||isoToday();
  editorState={foodId:food.id,entryId:entry?.id||null,returnTo:"food-diary",source:source||food.source,variantSelections:entry?.variantSelections||{}};
  by("entry-editor-title").textContent=entry?`Edit ${entry.name}`:`Review ${food.name}`;by("entry-date").value=entry?.date||defaultDate;by("entry-meal").value=entry?.meal||meal||ext.ui.pendingMeal||"";by("entry-status").value="eaten";by("entry-time").value=entry?.time||localClock();by("entry-notes").value=entry?.notes||"";
  by("entry-unit").innerHTML=Object.keys(unitOptions(food)).filter(x=>unitOptions(food)[x]!==undefined).map(u=>`<option value="${esc(u)}">${esc(unitLabel(food,u))}</option>`).join("");const chosenUnit=entry?.unit||unit||defaultUnit(food);by("entry-unit").value=chosenUnit;by("entry-amount").value=entry?.amount??amount??defaultAmount(food);
  renderVariantOptions(food,entry?.variantSelections||{});const safety=foodSafety(food);by("entry-source-warning").innerHTML=`<strong>${food.verified?"Verified Trial Source":"Review the Source"}</strong><p>${esc(food.source||"Source not supplied")}. ${safety.blocked?`<b class="danger-text">${esc(safety.message)}</b>`:"Check the quantity and details before adding."}</p>`;
  by("save-food-entry").textContent=entry?"Save Changes":"Add To Diary";by("save-food-entry-and-food").classList.toggle("hidden",entry||ext.savedFoodIds.includes(food.id));updateEntryPreview();openFeature("food-entry-editor");
}
function updateEntryPreview(){
  if(!editorState)return;const baseFood=getFood(editorState.foodId);if(!baseFood)return;const food=resolveVariantFood(baseFood,selectedVariantValues()),amount=by("entry-amount").value,unit=by("entry-unit").value,values=scaledNutrients(food,amount,unit);
  by("entry-nutrition-preview").innerHTML=`<div class="food-detail-title"><div><h3>${esc(food.name)}</h3><p>${esc(food.brand||"")} · ${esc(food.serving||"")}</p></div><span class="health-score score-${Math.min(10,whole(food.score))}">${whole(food.score)}/10</span></div>${nutritionCards(values)}<p class="fine"><strong>Why This Score:</strong> ${esc(scoreExplanation(food.score))}</p>`;
  if(by("entry-selection-summary"))by("entry-selection-summary").innerHTML=`<strong>You Are Adding: ${formatNumber(amount,true)} ${esc(unitLabel(food,unit))}</strong><span>${energyText(values.calories)} · Recorded in the Diary immediately</span>`;
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
  const selectedMeal=by("entry-meal").value;
  if(!selectedMeal){ showActionToast("Choose a meal before adding this food.",null,5000); return; }
  const values = scaledNutrients(food,amount,unit);
  if(!hasEnergyValue(values.calories)){
    showActionToast(`${food.name} has no usable energy value. Add or correct its Calories before logging it.`,null,8000);
    return;
  }
  const record = {
    id:editorState.entryId || uid("entry"),foodId:baseFood.id,name:food.name,brand:food.brand || "",date,meal:selectedMeal,status:"eaten",
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
  const confirmation = `${food.name} ${editorState.entryId ? "updated" : "added"} — ${itemEnergy} Cal. New daily total: ${dailyTotal} Cal.`;
  showActionToast(confirmation,null,2000);
  openFeature("food-diary");
}
by("save-food-entry")?.addEventListener("click",() => saveEditorEntry(false));
by("save-food-entry-and-food")?.addEventListener("click",() => saveEditorEntry(true));

by("open-day-settings")?.addEventListener("click",()=>{const panel=by("day-settings-details");if(panel){panel.open=!panel.open;if(panel.open)panel.scrollIntoView({behavior:"smooth",block:"nearest"});}});
by("day-type")?.addEventListener("change",()=>{
  const type=by("day-type").value,target=type==="fasting"?(n(ext.dayTypeTargets?.fasting)||500):recommendedNormalTarget();by("day-custom-target").checked=false;by("day-cal-target-label").classList.add("hidden");by("day-cal-target").value=target?whole(target):"";by("day-base-target").textContent=target?`${formatNumber(target)} Cal`:"Recommendation Unavailable";by("day-target-label").textContent=type==="fasting"?"Preferred Fasting-Day Target":"Recommended Normal Target";by("day-settings-note").textContent=!target&&type==="normal"?"Your Normal Day recommendation is unavailable. Recalculate it in Edit Health Profile, or choose a deliberate one-day custom target.":type==="fasting"?"Fasting Day. The companion plans only the meal occasions you select and keeps the projected day within your fasting target.":"Normal Day. Your current accepted profile recommendation is used unless you deliberately choose a different target for this date.";if(by("diary-day-type-summary"))by("diary-day-type-summary").textContent=target?`${type==="fasting"?"Fasting Day":"Normal Day"} · ${formatNumber(target)} Cal`:`${type==="fasting"?"Fasting Day":"Normal Day"} · Target Needs Attention`;updateDaySettingsDirty();refreshDiaryEnergyPreview(target);
});
by("day-custom-target")?.addEventListener("change",()=>{const custom=by("day-custom-target").checked;by("day-cal-target-label").classList.toggle("hidden",!custom);if(custom&&!n(by("day-cal-target").value)){by("day-cal-target").value=by("day-type").value==="fasting"?(n(ext.dayTypeTargets?.fasting)||500):(recommendedNormalTarget()||"");}if(!custom){const type=by("day-type").value,target=type==="fasting"?(n(ext.dayTypeTargets?.fasting)||500):recommendedNormalTarget();by("day-cal-target").value=target?whole(target):"";refreshDiaryEnergyPreview(target);}updateDaySettingsDirty();});
by("day-cal-target")?.addEventListener("input",()=>{updateDaySettingsDirty();if(by("day-custom-target")?.checked)refreshDiaryEnergyPreview(by("day-cal-target").value);});
document.addEventListener("click",event => {
  const add = event.target.closest("[data-add-to-meal]");
  if(add){ ext.ui.recentPlanMode=false;ext.ui.pendingMeal=add.dataset.addToMeal;ext.ui.libraryTab="all";ext.ui.foodSearch="";saveExt();openFeature("food-library",{freshSearch:true});return; }
  const edit = event.target.closest("[data-entry-edit]");
  if(edit){ const found=findEntry(edit.dataset.entryEdit); if(found) prepareEntry(getFood(found.entry.foodId) || snapshotFood(found.entry),{entry:found.entry}); return; }
  const menu=event.target.closest("[data-entry-menu]");
  if(menu){const panel=q(`[data-entry-actions="${CSS.escape(menu.dataset.entryMenu)}"]`);panel?.classList.toggle("hidden");return;}
  const mealMenu=event.target.closest("[data-meal-menu]");
  if(mealMenu){q(`[data-meal-actions="${CSS.escape(mealMenu.dataset.mealMenu)}"]`)?.classList.toggle("hidden");return;}
  const del = event.target.closest("[data-entry-delete]");
  if(del){ requestDeleteEntry(del.dataset.entryDelete);return; }
  const copy = event.target.closest("[data-entry-copy]");
  if(copy){ requestCopyEntry(copy.dataset.entryCopy);return; }
  const template = event.target.closest("[data-save-meal-template]");
  if(template){ saveMealTemplatePrompt(template.dataset.saveMealTemplate);return; }
  const clearMeal=event.target.closest("[data-clear-diary-meal]");
  if(clearMeal){const meal=clearMeal.dataset.clearDiaryMeal,date=diaryDate(),items=entriesForDate(date).filter(e=>e.meal===meal&&e.status!=="skipped");if(!items.length)return;openModal(`Clear ${meal}?`,`This will remove ${items.length} ${items.length===1?"entry":"entries"} from ${formatDate(date)}.`,`Clear Meal`,()=>{const removed=clone(items);ext.diary[date]=(ext.diary[date]||[]).filter(e=>e.meal!==meal||e.status==="skipped");saveExt();renderDiary();renderDailyProgress();showActionToast(`${meal} cleared.`,()=>{ext.diary[date]||=[];ext.diary[date].push(...removed);saveExt();renderDiary();renderDailyProgress();},8000);});return;}
});
function saveDaySettings(showMessage=true){
  const date=diaryDate(),type=by("day-type").value,customTarget=!!by("day-custom-target")?.checked,baseTarget=type==="fasting"?(n(ext.dayTypeTargets?.fasting)||500):recommendedNormalTarget(),targetCal=customTarget?whole(by("day-cal-target").value):whole(baseTarget);
  if(!targetCal||targetCal<300){showActionToast("A valid energy target is needed. Recalculate your Health Profile or enter a deliberate custom target for this date.",null,7500);return;}
  ext.daySettings[date]={type,targetCal,customTarget};if(type==="fasting"&&!customTarget)ext.dayTypeTargets.fasting=targetCal;saveExt();daySettingsBaseline=clone(ext.daySettings[date]);setDaySettingsDirty(false);if(by("day-settings-details"))by("day-settings-details").open=false;renderDiary();if(showMessage)showActionToast("Day Settings Saved.",null,2000);
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
    ext.mealTemplates.push({id:uid("meal"),name,items:entries.map(e=>({...clone(e),id:undefined,date:undefined,status:"eaten"})),createdAt:new Date().toISOString()});saveExt();showActionToast(`${name} saved to Saved Meals.`,null,2000);
  },`<label>Meal Name<input id="modal-meal-name" value="${esc(meal)}"></label>`);
}

// Modal and persistent action toast
let modalConfirm = null;
function openModal(title,copy,confirmLabel,onConfirm,extra=""){
  by("a05-modal-title").textContent=title;by("a05-modal-copy").textContent=copy;by("a05-modal-extra").innerHTML=extra;by("a05-modal-confirm").textContent=confirmLabel;by("a05-modal-confirm").className=confirmLabel.toLowerCase().includes("delete")?"danger-button":"primary";modalConfirm=onConfirm;const card=by("a05-modal")?.querySelector(".a05-modal-card");card?.classList.toggle("info-only",confirmLabel.toLowerCase()==="close");by("a05-modal").classList.remove("hidden");card?.scrollTo?.(0,0);
}
function closeModal(){by("a05-modal").classList.add("hidden");modalConfirm=null;by("a05-modal")?.querySelector(".a05-modal-card")?.classList.remove("info-only");if(by("a05-modal-cancel"))by("a05-modal-cancel").textContent="Cancel";}
window.HECOpenModal=openModal;window.HECCloseModal=closeModal;

by("a05-modal-cancel")?.addEventListener("click",closeModal);
by("a05-modal-close")?.addEventListener("click",closeModal);
by("a05-modal")?.addEventListener("click",event=>{if(event.target===by("a05-modal"))closeModal();});
by("a05-modal-confirm")?.addEventListener("click",() => {const fn=modalConfirm;closeModal();fn?.();});
let toastUndo=null,toastTimer=null;
function showActionToast(copy,action=null,duration=2000){
  clearTimeout(toastTimer);toastUndo=action;by("a05-toast-copy").textContent=copy;by("a05-toast-action").classList.toggle("hidden",!action);by("a05-action-toast").classList.add("show");toastTimer=setTimeout(()=>{by("a05-action-toast").classList.remove("show");toastUndo=null;},duration);
}
by("a05-toast-action")?.addEventListener("click",() => {const fn=toastUndo;by("a05-action-toast").classList.remove("show");toastUndo=null;fn?.();showActionToast("Action Undone.",null,2000);});

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
  if(name===nq)return 1300 + (food.afcd?40:80);
  if(aliases.includes(nq))return 1250 + (food.afcd?30:70);
  if(brand===nq)return 1200;
  if(name.startsWith(nq)||aliases.some(alias=>alias.startsWith(nq)))return 1050 + (food.afcd?35:60);
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
  if(food.afcd)return "Australian AFCD Food";
  if(food.verified&&food.brand)return "Verified Product";
  if(food.verified)return "Verified Food";
  return "Australian Trial Record";
}
function activeLibraryTab(){return ext.ui.libraryTab||"all";}
function recentGroups(days=14){
  const start=shiftISO(isoToday(),-(days-1)),groups=[];Object.keys(ext.diary).filter(date=>date>=start&&date<=isoToday()).sort().reverse().forEach(date=>{mealNames().forEach(meal=>{const items=entriesForDate(date).filter(e=>e.meal===meal&&e.status!=="skipped");if(items.length)groups.push({date,meal,items});});});return groups;
}
function renderRecentLibrary(query=""){
  const nq=normalise(query),groups=recentGroups(14).map(g=>({...g,items:g.items.filter(e=>!nq||normalise(`${e.name} ${e.brand||""}`).includes(nq))})).filter(g=>g.items.length);
  by("food-results").innerHTML=groups.length?groups.map(g=>`<section class="recent-meal-group"><header><div><strong>${esc(g.meal)}</strong><small>${esc(relativeDateLabel(g.date))}</small></div><button data-recent-meal-add="${esc(g.date)}|${esc(g.meal)}">Add Meal To Diary</button></header>${g.items.map(e=>`<div class="recent-entry-row"><span><strong>${esc(e.name)}</strong><small>${formatNumber(e.amount,true)} ${esc(e.unitLabel||e.unit)} · ${formatNumber(e.nutrients?.calories)} Cal</small></span><button data-recent-entry-add="${esc(e.id)}" aria-label="Add ${esc(e.name)} to Diary">＋</button></div>`).join("")}</section>`).join(""):`<div class="resource-empty"><strong>No Recent Foods Yet.</strong><p>Foods and meals from the last 14 days will appear here for quick reuse.</p></div>`;
}
function copyRecentEntry(entry,targetDate,targetMeal){const copy={...clone(entry),id:uid("entry"),date:targetDate,localDate:targetDate,meal:targetMeal,status:"eaten",time:localClock(),createdAt:new Date().toISOString(),timeZone:activeTimeZone()};ext.diary[targetDate]||=[];ext.diary[targetDate].push(copy);return copy;}
function cachedOnlineMatches(query){
  if(!query || query.trim().length<3)return [];
  return (ext.onlineFoods||[]).map(food=>({food,rank:searchRank(food,query)})).filter(item=>item.rank>=620).sort((a,b)=>b.rank-a.rank||Number(b.food.country==="Australia")-Number(a.food.country==="Australia")||a.food.name.localeCompare(b.food.name)).map(x=>x.food);
}
function renderFoodLiveMatches(query){
  const box=by("food-live-results");if(!box)return;const term=String(query||"").trim();if(!term||document.activeElement!==by("food-search")){box.classList.add("hidden");box.innerHTML="";return;}
  const ranked=allFoods().filter(food=>food.category!=="Recipe").map(food=>({food,rank:searchRank(food,term)})).filter(x=>x.rank>=520).sort((a,b)=>b.rank-a.rank||Number(b.food.country==="Australia")-Number(a.food.country==="Australia")||a.food.name.localeCompare(b.food.name)).slice(0,3);
  if(!ranked.length){box.innerHTML=`<div class="live-match-heading"><strong>Top Matches</strong><small>Keep typing for a closer match.</small></div>`;box.classList.remove("hidden");return;}
  box.innerHTML=`<div class="live-match-heading"><strong>Top Matches</strong><small>Tap a result without hiding the keyboard.</small></div>${ranked.map(({food})=>`<button type="button" class="live-match-row" data-food-add="${esc(food.id)}"><span><strong>${esc(food.name)}</strong><small>${esc([food.brand,food.serving].filter(Boolean).join(" · "))}</small></span><b>＋</b></button>`).join("")}`;box.classList.remove("hidden");
}
function renderLibrary(){
  qa("[data-library-tab]").forEach(b=>b.classList.toggle("active",b.dataset.libraryTab===activeLibraryTab()));
  by("food-search").value=ext.ui.foodSearch||"";
  const context=by("library-entry-context");
  if(context){
    const pending=ext.ui.pendingMeal,drink=ext.ui.pendingDrink;
    const hasContext=!!pending||!!drink;
    context.classList.toggle("hidden",!hasContext);
    context.innerHTML=drink?`<span>Choose the exact <strong>${esc(drink.label||drink.type)}</strong> for ${formatNumber(drink.amount,true)} mL. Nutrition will be recorded after you review it.</span>${pending?`<small>Meal: ${esc(pending)}</small>`:""}`:pending?`<span>Adding to <strong>${esc(pending)}</strong> on ${esc(relativeDateLabel(ext.ui.diaryDate||isoToday()))}</span>`:"";
  }
  const tab=activeLibraryTab(),query=by("food-search").value.trim();renderFoodLiveMatches(query);
  const showOnlineControls=tab==="all"||tab==="online";
  by("online-search-actions")?.classList.toggle("hidden",!showOnlineControls);
  by("online-food-status")?.classList.toggle("hidden",!showOnlineControls);
  if(tab==="recent"){renderRecentLibrary(query);return;}
  if(tab==="recipes"){renderRecipeLibrary(query);renderRecipeSelectOptions();renderScanSelect();return;}
  if(tab==="meals"){renderMealLibrary(query);renderRecipeSelectOptions();renderScanSelect();return;}
  if(tab==="online"){renderOnlineLibrary(query);return;}
  const localFoods=[...FOODS,...(ext.customFoods||[]),...AFCD_FOODS];
  const libraryFoods=tab==="saved"?allFoods().filter(food=>ext.savedFoodIds.includes(food.id)):localFoods.filter(food=>food.category!=="Recipe");
  let ranked=libraryFoods.filter(food=>tab==="custom"?food.source==="User Created":true).map(food=>({food,rank:searchRank(food,query)})).filter(item=>item.rank>0).sort((a,b)=>b.rank-a.rank||Number(b.food.country==="Australia")-Number(a.food.country==="Australia")||a.food.name.localeCompare(b.food.name));
  const strongMatch=ranked.some(item=>item.rank>=760);
  let visible=query?ranked.filter(item=>item.rank>=(strongMatch?760:620)):ranked;
  let intro="";
  if(!query&&tab==="all"){
    const seed=visible.filter(item=>!item.food.afcd).slice(0,28);
    const everyday=visible.filter(item=>item.food.afcd).map(item=>({...item,everyday:everydayAfcdPriority(item.food)})).filter(item=>item.everyday>0).sort((a,b)=>b.everyday-a.everyday||a.food.name.localeCompare(b.food.name));
    const seen=new Set(seed.map(x=>normalise(x.food.name))),familyCounts={},curated=[];
    for(const item of everyday){
      const family=everydayAfcdFamily(item.food);if(!family||(familyCounts[family]||0)>=4)continue;
      const key=normalise(item.food.name);if(seen.has(key))continue;seen.add(key);familyCounts[family]=(familyCounts[family]||0)+1;curated.push(item);if(curated.length>=72)break;
    }
    visible=[...seed,...curated];
    intro=`<div class="search-guidance everyday-food-guidance"><strong>Everyday Australian Foods</strong><small>Browse familiar starter foods below, or search all ${AFCD_FOODS.length?AFCD_FOODS.length.toLocaleString():"1,588"} Australian food records by name.</small></div>`;
  }
  let closeNote="";
  if(query&&visible.length){const best=visible[0];if(normalise(best.food.name)!==normalise(query)&&best.rank>=620)closeNote=`<div class="search-guidance compact-search-guidance"><strong>Showing Results For ${esc(best.food.name)}</strong><small>Your search was “${esc(query)}”.</small></div>`;}
  let localHtml=visible.length?`${intro}${closeNote}${visible.map(item=>resourceFoodRow(item.food)).join("")}`:`<div class="resource-empty"><strong>No Close Australian Match Found.</strong><p>${query.length>=3?"Online packaged-food sources are also being checked below.":"Try another spelling, scan the barcode, read the nutrition panel, or create a private food entry."}</p></div>`;
  if(tab==="all"&&query.length>=3){
    const online=cachedOnlineMatches(query),onlineHtml=online.length?`<section class="all-resources-online"><div class="online-source-banner"><strong>Online Packaged Foods — Review Required</strong><p>${online.length} cached online match${online.length===1?"":"es"}. Compare the product with its package before adding.</p></div>${online.slice(0,24).map(resourceFoodRow).join("")}</section>`:`<section class="all-resources-online"><div class="online-source-banner pending-online-banner"><strong>Online Packaged Foods</strong><p id="all-online-inline-status">Checking online sources…</p></div></section>`;
    by("food-results").innerHTML=`${localHtml}${onlineHtml}`;
  }else by("food-results").innerHTML=localHtml;
  renderRecipeSelectOptions();renderScanSelect();
}

function resourceFoodRow(food){
  const saved=ext.savedFoodIds.includes(food.id),safety=foodSafety(food);
  return `<article class="resource-row ${food.afcd?"afcd-row":""} ${safety.blocked?"food-warning":""}"><button class="resource-main" data-food-details="${esc(food.id)}"><strong>${esc(food.name)}${food.afcd?'<span class="afcd-badge">AFCD</span>':""}</strong><small>${esc([food.brand,food.serving,energyText(food.nutrients?.calories)].filter(Boolean).join(" · "))}</small></button><button class="resource-save ${saved?"saved":""}" data-food-save="${esc(food.id)}" aria-label="${saved?"Remove from":"Save to"} Favourite Foods">${saved?"✓":"☆"}</button><button class="resource-add" data-food-add="${esc(food.id)}" aria-label="Review and add ${esc(food.name)}">＋</button></article>`;
}
function foodCard(food){return resourceFoodRow(food);}
document.addEventListener("click",event=>{
  const tab=event.target.closest("[data-library-tab]");if(tab){ext.ui.libraryTab=tab.dataset.libraryTab;by("resource-add-menu")?.classList.add("hidden");saveExt();renderLibrary();if(tab.dataset.libraryTab==="all")scheduleAllResourcesOnlineSearch();return;}
  const add=event.target.closest("[data-food-add]");if(add){const food=getFood(add.dataset.foodAdd),drink=ext.ui.pendingDrink||null;prepareEntry(food,{date:ext.ui.diaryDate||isoToday(),meal:ext.ui.pendingMeal||"",status:"eaten",amount:drink?.amount||null,unit:drink&&unitOptions(food).mL!==undefined?"mL":null});if(drink){ext.ui.pendingDrink=null;saveExt();}return;}
  const save=event.target.closest("[data-food-save]");if(save){toggleSavedFood(save.dataset.foodSave);return;}
  const details=event.target.closest("[data-food-details]");if(details){showFoodDetails(details.dataset.foodDetails);return;}
  const recipeAdd=event.target.closest("[data-recipe-add]");if(recipeAdd){prepareEntry(getFood(recipeAdd.dataset.recipeAdd),{date:ext.ui.diaryDate||isoToday(),meal:ext.ui.pendingMeal||""});return;}
  const mealAdd=event.target.closest("[data-meal-add]");if(mealAdd){addMealTemplate(mealAdd.dataset.mealAdd);return;}
  const mealDelete=event.target.closest("[data-meal-delete]");if(mealDelete){deleteMealTemplate(mealDelete.dataset.mealDelete);return;}
  if(event.target.closest("[data-clear-pending-meal]")){ext.ui.pendingMeal="";ext.ui.pendingDrink=null;saveExt();renderLibrary();return;}
});
document.addEventListener("click",event=>{
  const one=event.target.closest("[data-recent-entry-add]");if(one){const found=findEntry(one.dataset.recentEntryAdd);if(!found)return;const targetDate=ext.ui.recentPlanMode?(ext.ui.plannerDate||isoToday()):(ext.ui.diaryDate||isoToday()),targetMeal=ext.ui.pendingMeal||found.entry.meal;const copy=copyRecentEntry(found.entry,targetDate,targetMeal);saveExt();showActionToast(`${copy.name} added to ${targetMeal}.`,null,2000);return;}
  const meal=event.target.closest("[data-recent-meal-add]");if(meal){const [sourceDate,sourceMeal]=meal.dataset.recentMealAdd.split("|"),items=entriesForDate(sourceDate).filter(e=>e.meal===sourceMeal&&e.status!=="skipped"),targetDate=ext.ui.recentPlanMode?(ext.ui.plannerDate||isoToday()):(ext.ui.diaryDate||isoToday()),targetMeal=ext.ui.pendingMeal||sourceMeal;items.forEach(e=>copyRecentEntry(e,targetDate,targetMeal));saveExt();showActionToast(`${items.length} ${items.length===1?"item":"items"} added to ${targetMeal}.`,null,2000);return;}
});
function prepareSingleMealSuggestion(meal,prefs={},retry=false){
  const date=ext.ui.diaryDate||isoToday();ext.ui.plannerDate=date;ext.ui.singleMealPreferences={meal,...prefs};if(!retry){ext.ui.plannerResults={};ext.ui.plannerRejected={};ext.ui.plannerAccepted={};}qa('input[name="planner-meal"]').forEach(x=>x.checked=x.value===meal);if(by("planner-select-all")){by("planner-select-all").checked=false;by("planner-select-all").indeterminate=false;}ext.ui.plannerSessionActive=true;const choice=plannerChoice(meal,retry);saveExt();return choice;
}
function showSingleMealSuggestion(meal,prefs={},retry=false){
  const suggestion=prepareSingleMealSuggestion(meal,prefs,retry),budget=plannerBudget();
  if(!suggestion){openModal(`Suggest ${meal}`,"The current day plan does not leave enough room for another sensible automatic suggestion in this meal.","Close",()=>{},`<p>Available for companion planning: <strong>${formatNumber(budget.available)} Cal</strong>. You can add a small food manually or adjust the day plan.</p>`);return;}
  const total=suggestionNutrition(suggestion),groups=suggestionGroups(suggestion),existing=budget.existingByMeal[meal]||0;
  const extra=`<div class="single-meal-suggestion"><div class="single-suggestion-heading"><span class="health-score">${suggestion.score}/10</span><div><h4>${esc(suggestion.name)}</h4><p>${formatNumber(total.calories)} Cal · Protein ${formatNumber(total.protein)} g · Carbs ${formatNumber(total.carbs)} g · Fat ${formatNumber(total.fat)} g</p></div></div>${existing?`<p class="companion-context-note"><strong>${formatNumber(existing)} Cal is already in ${esc(meal)}.</strong> This suggestion was calculated around those foods.</p>`:""}<p>${esc(suggestion.reason)}</p><ul class="compact-list">${suggestion.items.map(i=>{const f=getFood(i.foodId);return `<li>${esc(f.name)} — ${formatNumber(i.amount,true)} ${esc(unitLabel(f,i.unit))}</li>`}).join("")}</ul><div class="planner-group-line">${FOOD_GROUP_KEYS.filter(k=>groups[k]>0).map(k=>`<span>${esc(FOOD_GROUP_LABELS[k])}: ${formatNumber(groups[k],true)}</span>`).join("")}</div><div class="single-suggestion-secondary-actions"><button id="single-suggestion-retry" class="secondary" type="button">Try Another</button><button id="single-suggestion-questions" class="secondary" type="button">Change My Choices</button></div></div>`;
  openModal(`Companion Suggestion for ${meal}`,"Review the suggestion before adding it. Nothing is added until you confirm.","Add To Diary",()=>{acceptPlannedSuggestion(meal);setTimeout(()=>{if(q("#food-diary.active"))renderDiary();},50);},extra);
  by("single-suggestion-retry")?.addEventListener("click",()=>{closeModal();showSingleMealSuggestion(meal,prefs,true);},{once:true});
  by("single-suggestion-questions")?.addEventListener("click",()=>{closeModal();openSingleMealQuestions(meal);},{once:true});
}
function openSingleMealQuestions(meal){
  const date=ext.ui.diaryDate||isoToday(),goals=currentGoals(date),existing=entriesForDate(date).filter(e=>e.meal===meal&&e.status!=="skipped"),existingCal=existing.reduce((sum,e)=>sum+n(e.nutrients?.calories),0),fasting=goals.dayType==="fasting";
  const extra=`<div class="companion-question-list">${existing.length?`<p class="companion-context-note"><strong>${esc(meal)} already has ${formatNumber(existingCal)} Cal.</strong> The companion will build around those entries unless you later choose to replace existing items.</p>`:""}<label>How hungry are you?<select id="suggest-appetite"><option value="normal">Normal</option><option value="small">Small Meal</option><option value="hungry">Hungry</option><option value="none">No Preference</option></select></label><label>What suits you today?<select id="suggest-style"><option value="none">No Preference</option><option value="quick">Quick & Easy</option><option value="cooked">Cooked / Savoury</option><option value="light">Light</option><option value="protein">Higher Protein</option><option value="different">Something Different</option></select></label><label>Use familiar foods?<select id="suggest-familiar"><option value="mix">Mix Familiar & New</option><option value="familiar">Prefer My Usual Foods</option><option value="new">Prefer Something Different</option><option value="none">No Preference</option></select></label>${fasting?`<label>How much of today’s fasting allowance should this meal use?<select id="suggest-fasting-share"><option value="decide">Let Companion Decide</option><option value="small">Small Share</option><option value="moderate">Moderate Share</option><option value="most">Most of It</option></select></label>`:""}<button id="suggest-skip-questions" class="secondary wide" type="button">Just Suggest Something</button></div>`;
  openModal(`Suggest ${meal}`,"Choose only what matters today. You can leave everything at No Preference and the companion will use your day plan, nutrition gaps and existing foods.","Suggest My Meal",()=>showSingleMealSuggestion(meal,{appetite:by("suggest-appetite")?.value||"none",style:by("suggest-style")?.value||"none",familiar:by("suggest-familiar")?.value||"none",fastingShare:by("suggest-fasting-share")?.value||"decide"}),extra);
  by("suggest-skip-questions")?.addEventListener("click",()=>{closeModal();showSingleMealSuggestion(meal,{appetite:"none",style:"none",familiar:"none",fastingShare:"decide"});},{once:true});
}
document.addEventListener("click",event=>{const suggest=event.target.closest("[data-suggest-context-meal]");if(!suggest)return;openSingleMealQuestions(suggest.dataset.suggestContextMeal);});
by("browse-planner-recent")?.addEventListener("click",()=>{ext.ui.recentPlanMode=true;ext.ui.libraryTab="recent";ext.ui.diaryDate=ext.ui.plannerDate||isoToday();ext.ui.pendingMeal="";saveExt();openFeature("food-library");});
function keepLiveFoodResultsVisible(){
  requestAnimationFrame(()=>{const input=by("food-search"),live=by("food-live-results");if(!input||document.activeElement!==input)return;const vv=window.visualViewport,keyboardTop=vv?vv.offsetTop+vv.height:window.innerHeight;const inputRect=input.getBoundingClientRect();if(inputRect.top<78)window.scrollBy({top:inputRect.top-86,behavior:"smooth"});if(live&&!live.classList.contains("hidden")){const r=live.getBoundingClientRect();if(r.bottom>keyboardTop-12)window.scrollBy({top:r.bottom-(keyboardTop-12),behavior:"smooth"});}});
}
by("food-search")?.addEventListener("input",()=>{ext.ui.foodSearch=by("food-search").value;saveExt();renderLibrary();keepLiveFoodResultsVisible();scheduleAllResourcesOnlineSearch();});
by("food-search")?.addEventListener("focus",()=>setTimeout(keepLiveFoodResultsVisible,180));
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
  const nu=product.nutriments||{};
  const servingText=String(product.serving_size||"");
  const parsedServing=servingText.match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  const servingQty=n(product.serving_quantity)||n(parsedServing?.[1])||100;
  const rawUnit=String(product.serving_quantity_unit||parsedServing?.[2]||"g").toLowerCase();
  const unit=rawUnit.includes("ml")?"mL":"g";
  const servingValue=(key)=>{const value=nu[`${key}_serving`];return value===undefined||value===null||value===""?null:n(value);};
  const per100Value=(key)=>n(nu[`${key}_100g`]);
  const factor=servingQty/100;
  const value=(key)=>{const direct=servingValue(key);return direct!==null?direct:per100Value(key)*factor;};
  let calories=servingValue("energy-kcal");
  if(calories===null){const kj=servingValue("energy-kj");if(kj!==null)calories=kj/4.184;}
  if(calories===null||!Number.isFinite(calories)||calories<=0){const kcal100=per100Value("energy-kcal");const kj100=per100Value("energy-kj");calories=(kcal100||kj100/4.184)*factor;}
  const nutrients={calories:n(calories),protein:value("proteins"),carbs:value("carbohydrates"),fat:value("fat"),satFat:value("saturated-fat"),fibre:value("fiber"),sugar:value("sugars"),sodium:value("sodium")*1000};
  const servingLabel=product.serving_size||`${formatNumber(servingQty,true)} ${unit}`;
  const countryText=[product.countries,...(product.countries_tags||[])].filter(Boolean).join(" ");
  const countMatch=servingText.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(biscuits?|slices?|bars?|pieces?|crackers?|cakes?|serves?|servings?)\b/i);const countQty=n(countMatch?.[1]),countWord=normalise(countMatch?.[2]||"").replace(/s$/,"");const units={serve:1,[unit]:1/servingQty},unitLabels={serve:`Serve (${servingLabel})`,[unit]:unit};if(countQty>0&&countWord){units[countWord]=1/countQty;unitLabels[countWord]=`${countWord.charAt(0).toUpperCase()+countWord.slice(1)} (${formatNumber(servingQty,true)} ${unit} per ${formatNumber(countQty,true)})`;}
  return {id:`off-${product.code}`,barcode:String(product.code||""),name:product.product_name||product.generic_name||`Barcode ${product.code}`,brand:product.brands||"",category:"Online Product",country:/australia/i.test(countryText)?"Australia":"International",aliases:[product.product_name,product.generic_name,product.brands].filter(Boolean),defaultAmount:1,defaultUnit:"serve",units,unitLabels,serving:servingLabel,nutrients,foodGroups:{},waterMl:unit==="mL"?servingQty*.9:0,hydrationType:unit==="mL"?"drink":"food",score:6,source:"Open Food Facts · Community Supplied · Verify Package",verified:false,ingredients:product.ingredients_text||"",allergens:product.allergens||[],imageUrl:product.image_front_small_url||product.image_front_url||""};
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
  const items=(ext.onlineFoods||[]).map(food=>({food,rank:query?searchRank(food,query):0})).filter(item=>query&&item.rank>=760).sort((a,b)=>b.rank-a.rank||Number(b.food.country==="Australia")-Number(a.food.country==="Australia")||a.food.name.localeCompare(b.food.name)).map(x=>x.food);
  by("food-results").innerHTML=items.length?`<div class="online-source-banner"><strong>Online results require review.</strong><p>Only reasonably close matches are shown. Open Food Facts is community supplied; USDA values may not match an Australian brand.</p></div>${items.map(resourceFoodRow).join("")}`:`<div class="resource-empty"><strong>No Relevant Online Results Found.</strong><p>Tap Search Online Databases to search this term, or try a broader food or brand name.</p></div>`;
}
let onlineSearchToken=0,allResourcesOnlineTimer=null,lastAutoOnlineQuery="";
async function runOnlineFoodSearch({automatic=false}={}){
  const query=by("food-search")?.value.trim()||"",requestedTab=activeLibraryTab(),token=++onlineSearchToken;if(!query||query.length<3){if(!automatic)showActionToast("Enter at least three letters before searching online.",null,5000);return [];}
  const status=by("online-food-status"),button=by("search-online-foods");if(button)button.disabled=true;if(status)status.textContent="Checking Open Food Facts and FoodData Central…";const inline=by("all-online-inline-status");if(inline)inline.textContent="Checking online sources…";
  try{
    const results=await Promise.allSettled([searchOpenFoodFacts(query),searchUsda(query)]);if(token!==onlineSearchToken)return [];const foods=results.flatMap(r=>r.status==="fulfilled"?r.value:[]);upsertOnlineFoods(foods);
    const currentQuery=by("food-search")?.value.trim()||"";if(currentQuery!==query)return foods;
    if(status)status.textContent=`Loaded ${foods.length} reviewable online result${foods.length===1?"":"s"}. All Resources includes relevant matches automatically.`;
    if(activeLibraryTab()==="online")renderOnlineLibrary(query);else if(activeLibraryTab()==="all")renderLibrary();
    if(!foods.length&&!automatic)showActionToast("No Online Matches Were Returned. Try A Broader Search Or Scan A Barcode.",null,5000);return foods;
  }catch(error){if(status)status.textContent="Online food search is temporarily unavailable. Local Australian foods remain available.";if(!automatic)showActionToast("Online Food Search Is Temporarily Unavailable.",null,6000);return [];}
  finally{if(button)button.disabled=false;}
}
function scheduleAllResourcesOnlineSearch(){
  clearTimeout(allResourcesOnlineTimer);const query=by("food-search")?.value.trim()||"";if(activeLibraryTab()!=="all"||query.length<3)return;if(query===lastAutoOnlineQuery&&cachedOnlineMatches(query).length)return;
  allResourcesOnlineTimer=setTimeout(()=>{lastAutoOnlineQuery=query;runOnlineFoodSearch({automatic:true});},650);
}
by("search-online-foods")?.addEventListener("click",()=>runOnlineFoodSearch({automatic:false}));

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
  const date=ext.ui.diaryDate||isoToday(),knownMeal=ext.ui.pendingMeal||"";
  const mealOptions=mealNames().map(name=>`<option value="${esc(name)}" ${knownMeal===name?"selected":""}>${esc(name)}</option>`).join("");
  openModal(`Add ${template.name}?`,`Choose where this reusable meal belongs. This creates independent Diary entries on ${formatDate(date)}.`,"Add To Diary",()=>{
    const meal=by("saved-meal-target-meal")?.value||knownMeal;if(!meal){showActionToast("Choose a meal before adding this saved meal.",null,5000);return;}
    ext.diary[date] ||= [];
    template.items.forEach(item=>ext.diary[date].push({...clone(item),id:uid("entry"),date,meal,status:"eaten",localDate:date,timeZone:activeTimeZone(),createdAt:new Date().toISOString()}));saveExt();openFeature("food-diary");showActionToast(`${template.name} added to ${meal}.`,null,2000);
  },`<label>Meal<select id="saved-meal-target-meal"><option value="">Choose A Meal</option>${mealOptions}</select></label>`);
}
function deleteMealTemplate(id){const template=ext.mealTemplates.find(m=>m.id===id);if(!template)return;openModal(`Delete ${template.name}?`,`Past diary entries will not be changed.`,`Delete`,()=>{const idx=ext.mealTemplates.findIndex(m=>m.id===id);const removed=ext.mealTemplates.splice(idx,1)[0];saveExt();renderLibrary();showActionToast(`${removed.name} deleted from Saved Meals.`,()=>{ext.mealTemplates.splice(idx,0,removed);saveExt();renderLibrary();},8000);});}

// Custom food
by("save-custom-food")?.addEventListener("click",()=>{
  const name=by("custom-food-name").value.trim(),cal=by("custom-cal").value;
  if(!name||cal===""){by("custom-food-error").textContent="Enter a food name and Calories.";return;}
  const nutrientValue=id=>by(id).value===""?null:Number(by(id).value);
  const amount=n(by("custom-serving-amount").value)||1,unit=by("custom-serving-unit").value;
  const food={id:uid("custom"),name,brand:by("custom-food-brand").value.trim(),category:"Custom Food",country:"Australia",aliases:[name],defaultAmount:amount,defaultUnit:unit,units:{[unit]:1/amount},unitLabels:{[unit]:unit},serving:`${amount} ${unit}`,nutrients:{calories:Number(cal),protein:nutrientValue("custom-protein"),carbs:nutrientValue("custom-carbs"),fat:nutrientValue("custom-fat"),satFat:nutrientValue("custom-sat-fat"),fibre:nutrientValue("custom-fibre"),sugar:nutrientValue("custom-sugar"),sodium:nutrientValue("custom-sodium")},foodGroups:{},waterMl:0,hydrationType:"food",score:7,source:"User Created",verified:false,ingredients:by("custom-ingredients").value.trim(),allergens:[]};
  ext.customFoods.push(food);saveExt();["custom-food-name","custom-food-brand","custom-cal","custom-protein","custom-carbs","custom-fat","custom-sat-fat","custom-fibre","custom-sugar","custom-sodium","custom-ingredients"].forEach(id=>by(id).value="");if(ext.ui.returnToRecipe){ext.ui.returnToRecipe=false;ext.ui.recipeSelectedFoodId=food.id;saveExt();openFeature("recipe-builder");showActionToast(`${food.name} created and ready to add to your recipe.`,null,2000);}else{ext.ui.libraryTab="custom";openFeature("food-library");showActionToast(`${food.name} saved to Foods I Created.`,null,2000);}
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
  const profile=recipeProfile({servings,ingredients:recipeDraft});const recipe={id:uid("recipe"),name,servings,notes:by("recipe-notes").value,ingredients:clone(recipeDraft),perServe:per,foodGroups:profile.foodGroups,waterMl:profile.waterMl,score,createdAt:new Date().toISOString()};ext.recipes.push(recipe);recipeDraft=[];recipeSelectedFoodId="";ext.ui.recipeDraft=[];ext.ui.recipeSelectedFoodId="";ext.ui.recipeName="";ext.ui.recipeServings=4;ext.ui.recipeNotes="";by("recipe-name").value="";by("recipe-servings").value=4;by("recipe-notes").value="";ext.ui.libraryTab="recipes";saveExt();openFeature("food-library");showActionToast(`${recipe.name} saved in My Recipes. Tap its star to also add it to Favourite Foods.`,null,2000);
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
function mealFromText(text){const t=normalise(text);if(t.includes("breakfast"))return"Breakfast";if(t.includes("lunch"))return"Lunch";if(t.includes("dinner")||t==="tea")return"Dinner";if(t.includes("morning tea")||t.includes("afternoon tea")||t.includes("smoko")||t.includes("supper")||t.includes("snack"))return"Snacks";if(t.includes("other"))return"Other";return "";}
function parseVoice(text){
  const raw=String(text||"");const t=normalise(raw);const items=[];
  const weet=t.match(/(?:add\s+)?(a|an|one|two|three|four|five|six|\d+(?:\.\d+)?)?\s*(?:sanitarium\s+)?weet\s*bix/);if(weet)items.push({foodId:"weetbix-au",amount:numberFrom(weet[1],2),unit:"biscuit"});
  const milk=t.match(/(\d+(?:\.\d+)?)\s*(?:ml|millilitre|millilitres|milliliter|milliliters)\s+(?:of\s+)?(?:light|lite|low fat|1 percent)?\s*milk/);if(milk)items.push({foodId:"light-milk-au",amount:Number(milk[1]),unit:"mL"});
  if(t.includes("water")){const m=t.match(/(\d+(?:\.\d+)?)\s*(?:ml|millilitre|millilitres).*water/);items.push({foodId:"water",amount:m?Number(m[1]):250,unit:"mL"});}
  if(!items.length){
    const stripped=t.replace(/\b(add|log|record|please|for|to|my|the|a|an)\b/g," ").replace(/\b(breakfast|morning tea|lunch|afternoon tea|dinner|snacks|snack)\b/g," ").replace(/\s+/g," ").trim();
    const ranked=allFoods().filter(f=>f.category!=="Recipe").map(food=>({food,rank:searchRank(food,stripped)})).filter(x=>x.rank>=760).sort((a,b)=>b.rank-a.rank||Number(b.food.afcd)-Number(a.food.afcd));
    if(ranked.length){const food=ranked[0].food;items.push({foodId:food.id,amount:defaultAmount(food),unit:defaultUnit(food),heard:raw});}
  }
  return {items,meal:mealFromText(raw),heard:raw};
}
function renderVoiceReview(){
  by("voice-review").classList.remove("hidden");by("voice-meal").value=voiceParsed.meal||"";
  by("voice-review-items").innerHTML=voiceParsed.items.length?voiceParsed.items.map((item,index)=>{const food=getFood(item.foodId),values=scaledNutrients(food,item.amount,item.unit);return `<div class="voice-review-row"><div><strong>${esc(food.name)}</strong><small>${formatNumber(item.amount,true)} ${esc(unitLabel(food,item.unit))} · ${formatNumber(values.calories)} Cal</small></div><button data-remove-voice-item="${index}" class="delete-action">Remove</button></div>`}).join(""):`<p class="empty-state">No confident food match was identified for “${esc(voiceParsed.heard||by("voice-transcript").value)}”. Correct the text or search the Food Library.</p>`;
}
by("parse-voice-log")?.addEventListener("click",()=>{voiceParsed=parseVoice(by("voice-transcript").value);renderVoiceReview();});
document.addEventListener("click",event=>{const b=event.target.closest("[data-remove-voice-item]");if(b){voiceParsed.items.splice(Number(b.dataset.removeVoiceItem),1);renderVoiceReview();}});
by("cancel-voice-review")?.addEventListener("click",()=>by("voice-review").classList.add("hidden"));
by("confirm-voice-log")?.addEventListener("click",()=>{
  if(!voiceParsed.items?.length)return;const date=by("voice-date").value||isoToday(),meal=by("voice-meal").value;if(!meal){showActionToast("Choose a Meal before adding this food.",null,5000);by("voice-meal")?.focus();return;}ext.diary[date] ||= [];
  voiceParsed.items.forEach(item=>{const food=getFood(item.foodId);ext.diary[date].push({id:uid("entry"),foodId:food.id,name:food.name,brand:food.brand,date,meal,status:"eaten",amount:item.amount,unit:item.unit,unitLabel:unitLabel(food,item.unit),time:localClock(),notes:"Added after voice/text review",nutrients:scaledNutrients(food,item.amount,item.unit),foodGroups:scaledFoodGroups(food,item.amount,item.unit),waterMl:scaledWaterMl(food,item.amount,item.unit),hydrationType:food.hydrationType||"food",score:food.score,source:`Voice/Text Review · ${food.source}`,localDate:date,timeZone:activeTimeZone(),createdAt:new Date().toISOString()});});saveExt();ext.ui.diaryDate=date;openFeature("food-diary");showActionToast(`${voiceParsed.items.length} ${voiceParsed.items.length===1?"item":"items"} added after review.`,null,2000);voiceParsed=[];by("voice-transcript").value="";
});

// Scan capture and review
let scanFile=null,scanBarcodeControls=null,scanBarcodeStream=null,scanBarcodeTimer=null,barcodeDetectionLocked=false,scanBarcodeFood=null,ocrParsedPanel=null;
function loadExternalScript(src,test){
  if(test())return Promise.resolve(true);
  return new Promise((resolve,reject)=>{const existing=[...document.scripts].find(x=>x.src===src);if(existing){const timer=setInterval(()=>{if(test()){clearInterval(timer);resolve(true);}},100);setTimeout(()=>{clearInterval(timer);test()?resolve(true):reject(new Error("Library unavailable"));},8000);return;}const script=document.createElement("script");script.src=src;script.crossOrigin="anonymous";script.onload=()=>test()?resolve(true):reject(new Error("Library did not initialise"));script.onerror=()=>reject(new Error("Library could not load"));document.head.appendChild(script);});
}
async function ensureBarcodeLibrary(){
  if(window.ZXingBrowser)return true;
  try{await loadExternalScript("https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js",()=>!!window.ZXing);await loadExternalScript("https://cdn.jsdelivr.net/npm/@zxing/browser@0.2.1/umd/zxing-browser.min.js",()=>!!window.ZXingBrowser);return !!window.ZXingBrowser;}catch{return false;}
}
async function ensureOcrLibrary(){
  if(window.Tesseract)return true;
  try{await loadExternalScript("https://cdn.jsdelivr.net/npm/tesseract.js@7/dist/tesseract.min.js",()=>!!window.Tesseract);return !!window.Tesseract;}catch{return false;}
}
function validBarcodeValue(value){const clean=String(value||"").replace(/\D/g,"");return clean.length>=8&&clean.length<=14?clean:"";}
function updateBarcodeLookupState(){const input=by("scan-barcode-input"),button=by("lookup-barcode");if(button)button.disabled=!validBarcodeValue(input?.value);}
function updateScanModeUI(){
  const mode=ext.ui.scanMode||"food";qa("[data-scan-mode]").forEach(b=>b.classList.toggle("active",b.dataset.scanMode===mode));by("barcode-tools")?.classList.toggle("hidden",mode!=="barcode");by("label-tools")?.classList.toggle("hidden",mode!=="label");by("photo-tools")?.classList.toggle("hidden",mode!=="food");by("scan-photo-capture")?.classList.toggle("hidden",mode==="barcode");
  const copy={food:"Take a meal photo, then identify and confirm every food before anything is logged.",barcode:"Scan a retail barcode with the camera. Detection stops the camera and looks the product up automatically.",label:"Photograph the Nutrition Information Panel square-on in good light. Review and edit every recognised value before saving."}[mode];if(by("scan-mode-copy"))by("scan-mode-copy").textContent=copy;
  if(mode==="barcode"&&by("barcode-status"))by("barcode-status").textContent="Ready To Scan. If the barcode is not in the online product database, use Nutrition Panel instead.";updateBarcodeLookupState();
}
function renderScanSelect(){updateScanModeUI();updateBarcodeLookupState();}
qa("[data-scan-mode]").forEach(button=>button.addEventListener("click",()=>{const next=button.dataset.scanMode;if(next!=="barcode")stopBarcodeCamera();ext.ui.scanMode=next;saveExt();updateScanModeUI();if(next==="barcode")startBarcodeCamera();}));
function displayScanImage(dataUrl){by("scan-preview").className="scan-preview";by("scan-preview").innerHTML=`<img id="scan-preview-image" src="${dataUrl}" alt="Captured food or package"><p>Image Captured. Review The Applicable Tools Below.</p>`;}
by("scan-image")?.addEventListener("change",event=>{scanFile=event.target.files?.[0]||null;if(!scanFile)return;const reader=new FileReader();reader.onload=async()=>{displayScanImage(reader.result);by("run-label-ocr").disabled=false;if(ext.ui.scanMode==="barcode")await decodeBarcodeFromPreview();};reader.readAsDataURL(scanFile);});
async function lookupBarcodeProduct(code){
  const clean=validBarcodeValue(code);if(!clean){showActionToast("Enter Or Scan A Valid Barcode.",null,2000);return null;}by("scan-barcode-input")?.blur();updateBarcodeLookupState();by("barcode-status").textContent=`Looking Up ${clean}…`;by("scan-review-card")?.classList.add("hidden");scanBarcodeFood=null;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
    const fields="code,product_name,generic_name,brands,countries,countries_tags,nutriments,serving_size,serving_quantity,serving_quantity_unit,ingredients_text,allergens,image_front_small_url,image_front_url";
    const response=await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(clean)}.json?fields=${encodeURIComponent(fields)}`,{headers:{Accept:"application/json"},signal:controller.signal});
    if(!response.ok)throw new Error(`Lookup ${response.status}`);const data=await response.json();if(data.status===0||!data.product)throw new Error("Product not found");const food=makeOpenFoodFactsFood(data.product);if(!hasEnergyValue(food.nutrients?.calories))throw new Error("Nutrition unavailable");
    upsertOnlineFoods([food]);scanBarcodeFood=food;const image=food.imageUrl?`<img class="scan-product-image" src="${esc(food.imageUrl)}" alt="${esc(food.name)} package image">`:"";
    by("scan-food-preview").innerHTML=`<div class="food-detail-title">${image}<div><h3>${esc(food.name)}</h3><p>${esc(food.brand||"Brand Not Listed")} · Barcode ${esc(clean)} · ${esc(food.serving)}</p></div></div>${nutritionCards(food.nutrients)}<div class="status-box scan-review-warning"><strong>Package Check Required</strong><p>Online barcode data can be incomplete or outdated. Compare the serving size and every nutrition value with the package. If they differ, read the Nutrition Panel instead.</p></div>`;
    by("scan-review-card").classList.remove("hidden");by("barcode-status").textContent=`Found ${food.name}. Check It Against The Package Before Continuing.`;setTimeout(()=>by("scan-review-card")?.scrollIntoView({behavior:"smooth",block:"start"}),80);return food;
  }catch(error){by("barcode-status").innerHTML=`No Usable Barcode Record Was Found For <strong>${esc(clean)}</strong>. Switch To <strong>Nutrition Panel</strong> to read the package directly, or create a custom food.`;showActionToast("Barcode Lookup Did Not Find A Usable Product.",null,5000);return null;}finally{clearTimeout(timer);}
}
by("lookup-barcode")?.addEventListener("click",()=>lookupBarcodeProduct(by("scan-barcode-input").value));by("scan-barcode-input")?.addEventListener("input",updateBarcodeLookupState);by("scan-barcode-input")?.addEventListener("keydown",event=>{if(event.key==="Enter"&&validBarcodeValue(event.currentTarget.value)){event.preventDefault();lookupBarcodeProduct(event.currentTarget.value);}});
async function decodeBarcodeFromPreview(){
  const img=by("scan-preview-image");if(!img)return;by("barcode-status").textContent="Reading Barcode From Photo…";
  try{let text="";
    if(window.BarcodeDetector){let supported=[];if(typeof BarcodeDetector.getSupportedFormats==="function"){try{supported=await BarcodeDetector.getSupportedFormats();}catch{supported=[];}}const wanted=["ean_13","ean_8","upc_a","upc_e","code_128"].filter(x=>!supported.length||supported.includes(x));const detector=new BarcodeDetector({formats:wanted.length?wanted:undefined});const codes=await detector.detect(img);text=codes[0]?.rawValue||"";}
    if(!text){const ok=await ensureBarcodeLibrary();if(ok){const reader=new ZXingBrowser.BrowserMultiFormatReader();const result=await reader.decodeFromImageElement(img);text=result?.getText?.()||result?.text||"";}}
    if(text){by("scan-barcode-input").value=text;await lookupBarcodeProduct(text);}else by("barcode-status").textContent="No Barcode Was Detected. Try A Closer, Sharper Photo Or Enter The Number.";
  }catch{by("barcode-status").textContent="No Barcode Was Detected. Try A Closer Photo Or Manual Entry.";}
}
function stopBarcodeCamera(message=""){
  if(scanBarcodeTimer){clearTimeout(scanBarcodeTimer);scanBarcodeTimer=null;}
  scanBarcodeControls?.stop?.();scanBarcodeControls=null;
  if(scanBarcodeStream){scanBarcodeStream.getTracks().forEach(track=>track.stop());scanBarcodeStream=null;}
  const video=by("barcode-video");if(video){try{video.pause();}catch{}video.srcObject=null;}
  barcodeDetectionLocked=false;by("barcode-camera-shell")?.classList.add("hidden");by("stop-barcode-camera")?.classList.add("hidden");
  if(message&&by("barcode-status"))by("barcode-status").textContent=message;
}
async function handleDetectedBarcode(raw){
  const text=validBarcodeValue(raw);if(!text||barcodeDetectionLocked)return false;barcodeDetectionLocked=true;
  by("scan-barcode-input").value=text;updateBarcodeLookupState();stopBarcodeCamera();barcodeDetectionLocked=true;by("barcode-status").textContent=`Barcode ${text} Detected. Looking Up Product…`;await lookupBarcodeProduct(text);return true;
}
async function startNativeBarcodeCamera(video){
  if(!window.BarcodeDetector||!navigator.mediaDevices?.getUserMedia)return false;
  let supported=[];try{if(typeof BarcodeDetector.getSupportedFormats==="function")supported=await BarcodeDetector.getSupportedFormats();}catch{}
  const wanted=["ean_13","ean_8","upc_a","upc_e","code_128"].filter(format=>!supported.length||supported.includes(format));
  let detector;try{detector=new BarcodeDetector(wanted.length?{formats:wanted}:undefined);}catch{return false;}
  scanBarcodeStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}}});
  video.srcObject=scanBarcodeStream;video.setAttribute("playsinline","");await video.play();
  const scan=async()=>{if(!scanBarcodeStream||barcodeDetectionLocked)return;try{const codes=await detector.detect(video);if(codes?.length&&await handleDetectedBarcode(codes[0].rawValue))return;}catch{}scanBarcodeTimer=setTimeout(scan,180);};
  scanBarcodeTimer=setTimeout(scan,120);return true;
}
async function startBarcodeCamera(){
  const video=by("barcode-video"),shell=by("barcode-camera-shell");if(!video||!shell)return;
  stopBarcodeCamera();ext.ui.scanMode="barcode";saveExt();updateScanModeUI();shell.classList.remove("hidden");by("stop-barcode-camera")?.classList.remove("hidden");by("barcode-status").textContent="Opening Camera… Hold The Barcode Steady Inside The Box.";shell.scrollIntoView({behavior:"smooth",block:"center"});
  try{
    if(await startNativeBarcodeCamera(video)){by("barcode-status").textContent="Camera Ready. Hold A Retail Barcode Steady Inside The Box — No Photo Is Needed.";return;}
    const ok=await ensureBarcodeLibrary();if(!ok)throw new Error("Scanner unavailable");
    const reader=new ZXingBrowser.BrowserMultiFormatReader();scanBarcodeControls=await reader.decodeFromVideoDevice(undefined,video,(result)=>{const text=result?.getText?.()||result?.text;if(text)handleDetectedBarcode(text);});
    by("barcode-status").textContent="Camera Ready. Hold A Retail Barcode Steady Inside The Box — No Photo Is Needed.";
  }catch(error){stopBarcodeCamera();by("barcode-status").textContent="Live Barcode Scanning Could Not Start. Check Camera Permission, Then Try Again Or Enter The Barcode Manually.";}
}
window.HECStopBarcodeCamera=stopBarcodeCamera;
by("start-barcode-camera")?.addEventListener("click",startBarcodeCamera);
by("stop-barcode-camera")?.addEventListener("click",()=>stopBarcodeCamera("Barcode Camera Stopped."));
function parsePanelNumber(text,patterns){for(const pattern of patterns){const m=text.match(pattern);if(m)return n(String(m[1]).replace(",","."));}return 0;}
function ocrNumbersWithUnit(line,unit){
  const pattern=unit==="energy"?/(\d+(?:[.,]\d+)?)\s*(kcal|kj)\b/gi:new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${unit}\\b`,"gi");const out=[];let m;while((m=pattern.exec(line))){out.push({value:n(String(m[1]).replace(",",".")),unit:(m[2]||unit).toLowerCase()});}return out;
}
function nutritionRow(lines,tests){return lines.find(line=>tests.some(test=>test.test(line)))||"";}
function rowValues(lines,tests,unit="g"){
  const line=nutritionRow(lines,tests);if(!line)return [];
  if(unit==="energy"){const raw=ocrNumbersWithUnit(line,"energy");const kcal=raw.filter(x=>x.unit==="kcal").map(x=>x.value);if(kcal.length)return kcal;return raw.filter(x=>x.unit==="kj").map(x=>x.value/4.184);}
  return ocrNumbersWithUnit(line,unit).map(x=>x.value);
}
function parseNutritionPanel(text){
  const clean=String(text||"").replace(/\r/g,"\n").replace(/[|]/g," ");const lines=clean.split(/\n+/).map(x=>x.replace(/\s+/g," ").trim()).filter(Boolean);
  const servingMatch=clean.match(/serv(?:ing|e)?\s*size[^\d]{0,24}(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i)||clean.match(/per\s*serve[^\d]{0,16}(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  const servingAmount=servingMatch?n(String(servingMatch[1]).replace(",",".")):0,servingUnit=servingMatch&&/ml/i.test(servingMatch[2])?"mL":"g";
  const bothColumns=/per\s*(serv(?:ing|e)|100\s*(g|ml))/i.test(clean)&&/per\s*100\s*(g|ml)/i.test(clean);
  const raw={
    calories:rowValues(lines,[/^energy\b/i,/^calories?\b/i],"energy"),
    protein:rowValues(lines,[/^protein\b/i],"g"),
    fat:rowValues(lines,[/^total\s+fat\b/i,/^fat\b/i],"g"),
    satFat:rowValues(lines,[/saturat/i],"g"),
    carbs:rowValues(lines,[/^carbohydrate\b/i,/^carbs?\b/i],"g"),
    sugar:rowValues(lines,[/^\s*(?:-|of which\s+)?sugars?\b/i,/sugars?\b/i],"g"),
    fibre:rowValues(lines,[/^fibre\b/i,/^fiber\b/i],"g"),
    sodium:rowValues(lines,[/^sodium\b/i],"mg")
  };
  const perServing={},per100={};
  Object.entries(raw).forEach(([key,values])=>{if(!values.length){perServing[key]=0;per100[key]=0;return;}if(values.length>=2&&bothColumns){perServing[key]=values[0];per100[key]=values[values.length-1];}else if(servingAmount){perServing[key]=values[0];per100[key]=values.length>1?values[values.length-1]:0;}else{per100[key]=values[values.length-1];perServing[key]=0;}});
  return {servingAmount,servingUnit,perServing,per100,basis:(servingAmount&&Object.values(perServing).some(Boolean))?"serving":"100",text:clean};
}
function fillOcrReview(parsed,basis=parsed?.basis||"serving"){
  if(!parsed)return;ocrParsedPanel=parsed;const values=basis==="100"?parsed.per100:parsed.perServing;const map={calories:"ocr-calories",protein:"ocr-protein",carbs:"ocr-carbs",fat:"ocr-fat",satFat:"ocr-sat-fat",fibre:"ocr-fibre",sugar:"ocr-sugar",sodium:"ocr-sodium"};Object.entries(map).forEach(([k,id])=>{if(by(id))by(id).value=values?.[k]||values?.[k]===0?round1(values[k]) : "";});
  if(by("ocr-basis"))by("ocr-basis").value=basis;if(basis==="serving"){by("ocr-serving-amount").value=parsed.servingAmount||1;by("ocr-serving-unit").value=parsed.servingAmount?parsed.servingUnit:"serving";}else{by("ocr-serving-amount").value=100;by("ocr-serving-unit").value=parsed.servingUnit||"g";}by("ocr-review").classList.remove("hidden");
}
by("ocr-basis")?.addEventListener("change",()=>ocrParsedPanel&&fillOcrReview(ocrParsedPanel,by("ocr-basis").value));
async function prepareOcrImage(file){
  try{const bitmap=await createImageBitmap(file),max=2200,scale=Math.min(2.2,max/Math.max(bitmap.width,bitmap.height)),w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale)),canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(bitmap,0,0,w,h);const image=ctx.getImageData(0,0,w,h),d=image.data;for(let i=0;i<d.length;i+=4){let g=.299*d[i]+.587*d[i+1]+.114*d[i+2];g=Math.max(0,Math.min(255,(g-128)*1.35+128));d[i]=d[i+1]=d[i+2]=g;}ctx.putImageData(image,0,0);bitmap.close?.();return canvas;}catch{return file;}
}
by("run-label-ocr")?.addEventListener("click",async()=>{
  if(!scanFile)return;const box=by("ocr-progress");box.classList.remove("hidden");box.textContent="Preparing The Photo For Nutrition Panel Reading…";
  try{const ok=await ensureOcrLibrary();if(!ok)throw new Error("OCR library unavailable");const image=await prepareOcrImage(scanFile);const worker=await Tesseract.createWorker("eng",1,{logger:m=>{if(m.progress)box.textContent=`${String(m.status||"Reading").replace(/\b\w/g,c=>c.toUpperCase())} · ${Math.round(m.progress*100)}%`;}});const result=await worker.recognize(image);await worker.terminate();const text=result.data?.text||"";by("ocr-text").value=text;const parsed=parseNutritionPanel(text);fillOcrReview(parsed);const found=Object.values(parsed[parsed.basis==="100"?"per100":"perServing"]||{}).filter(v=>n(v)>0).length;box.textContent=found?`Recognition Complete · ${found} Nutrition Values Detected. Check Every Value Against The Package.`:"Text Was Read, But The Nutrition Columns Need Manual Review. Enter The Values From The Package Below.";
  }catch(error){box.textContent="OCR Could Not Reliably Read This Image. Try A Closer, Square-On Photo In Brighter Light, Or Enter The Values Manually.";by("ocr-review").classList.remove("hidden");}
});
by("use-ocr-values")?.addEventListener("click",()=>{const pairs=[["custom-food-name","ocr-food-name"],["custom-serving-amount","ocr-serving-amount"],["custom-serving-unit","ocr-serving-unit"],["custom-cal","ocr-calories"],["custom-protein","ocr-protein"],["custom-carbs","ocr-carbs"],["custom-fat","ocr-fat"],["custom-sat-fat","ocr-sat-fat"],["custom-fibre","ocr-fibre"],["custom-sugar","ocr-sugar"],["custom-sodium","ocr-sodium"]];pairs.forEach(([to,from])=>{if(by(to)&&by(from))by(to).value=by(from).value;});openFeature("custom-food");showActionToast("Recognised Values Copied For Review.",null,2000);});
by("photo-find-food")?.addEventListener("click",()=>{ext.ui.libraryTab="all";ext.ui.pendingMeal=ext.ui.pendingMeal||"Other";saveExt();openFeature("food-library");showActionToast("Search And Add Each Food Visible In The Photo.",null,2000);});
by("photo-add-note")?.addEventListener("click",()=>showActionToast("Meal Photos Stay In This Browser Session Only In Alpha 0.6.12.",null,5000));
by("review-scan-food")?.addEventListener("click",()=>{if(scanBarcodeFood)prepareEntry(scanBarcodeFood,{date:ext.ui.diaryDate||isoToday(),meal:ext.ui.pendingMeal||"",source:scanBarcodeFood.source});});

// Meal planner
const PLANNER_WEIGHTS={Breakfast:.24,Lunch:.28,Dinner:.34,Snacks:.09,Other:.05};
function selectedPlannerMeals(){return qa('input[name="planner-meal"]:checked').map(input=>input.value);}
function resetPlannerSelections(){qa('input[name="planner-meal"]').forEach(x=>x.checked=false);if(by("planner-select-all")){by("planner-select-all").checked=false;by("planner-select-all").indeterminate=false;}ext.ui.plannerResults={};ext.ui.plannerRejected={};ext.ui.plannerAccepted={};ext.ui.plannerSessionActive=false;}
function updatePlannerSelectAll(){const boxes=qa('input[name="planner-meal"]'),selected=boxes.filter(x=>x.checked).length,all=by("planner-select-all");if(all){all.checked=boxes.length>0&&selected===boxes.length;all.indeterminate=selected>0&&selected<boxes.length;}ext.ui.plannerSessionActive=selected>0;saveExt();renderPlannerEnergySummary();}
function clearPlannerResults(){ext.ui.plannerResults={};ext.ui.plannerRejected={};ext.ui.plannerAccepted={};saveExt();renderMealSuggestions();renderPlannerEnergySummary();}
function initialisePlanner(){const date=ext.ui.plannerDate||ext.ui.diaryDate||isoToday();ext.ui.plannerDate=date;updateDateControl("planner",date);updatePlannerSelectAll();renderMealSuggestions();renderPlannerEnergySummary();}
function suggestionNutrition(suggestion){return sumNutrients(suggestion.items.map(i=>({nutrients:scaledNutrients(getFood(i.foodId),i.amount,i.unit)})));}
function suggestionGroups(suggestion){return sumGroupValues(suggestion.items.map(i=>({foodGroups:scaledFoodGroups(getFood(i.foodId),i.amount,i.unit)})));}
function suggestionSafety(suggestion){return suggestion.items.map(i=>foodSafety(getFood(i.foodId))).filter(x=>x.blocked).map(x=>x.message);}
function plannerProjectedState(date,excludeMeal=""){
  let nutrients=dayNutrition(date),groups=dayFoodGroups(date);
  Object.entries(ext.ui.plannerResults||{}).forEach(([meal,id])=>{
    if(meal===excludeMeal||ext.ui.plannerAccepted?.[meal]===id)return;
    const suggestion=MEAL_SUGGESTIONS.find(x=>x.id===id);if(!suggestion)return;
    nutrients=sumNutrients([{nutrients},{nutrients:suggestionNutrition(suggestion)}]);
    groups=sumGroupValues([{foodGroups:groups},{foodGroups:suggestionGroups(suggestion)}]);
  });
  return {nutrients,groups};
}
function plannerBudget(){
  const date=ext.ui.plannerDate||isoToday(),selected=selectedPlannerMeals(),goals=currentGoals(date),goal=goals.calories,entries=recordedEntriesForDate(date),fixed=entries.reduce((sum,e)=>sum+n(e.nutrients?.calories),0),type=goals.dayType||"normal";
  const existingByMeal=Object.fromEntries(plannerMealNames().map(m=>[m,entries.filter(e=>e.meal===m).reduce((sum,e)=>sum+n(e.nutrients?.calories),0)]));
  const remaining=Math.max(0,goal-fixed),guides={},unticked=plannerMealNames().filter(m=>!selected.includes(m));
  let reserve=0;
  if(type!=="fasting")reserve=unticked.reduce((sum,m)=>sum+(existingByMeal[m]>0?0:goal*(PLANNER_WEIGHTS[m]||0)),0);
  reserve=Math.min(reserve,remaining*.65);
  const available=Math.max(0,remaining-reserve);
  let desired=[];
  if(type==="fasting"){
    const selectedWeight=selected.reduce((sum,m)=>sum+(PLANNER_WEIGHTS[m]||.1),0)||1;
    desired=selected.map(m=>[m,Math.max(0,remaining*(PLANNER_WEIGHTS[m]||.1)/selectedWeight)]);
  }else desired=selected.map(m=>[m,Math.max(0,goal*(PLANNER_WEIGHTS[m]||.15)-existingByMeal[m])]);
  const prefs=ext.ui.singleMealPreferences||{};
  if(selected.length===1&&prefs.meal===selected[0]&&desired.length){
    let factor=1;
    if(prefs.appetite==="small")factor*=.72;else if(prefs.appetite==="hungry")factor*=1.12;
    if(prefs.style==="light")factor*=.78;
    if(type==="fasting"){
      const shares={small:.25,moderate:.5,most:.78};
      const decide={Breakfast:.42,Lunch:.50,Dinner:.62,Snacks:.24,Other:.30}[selected[0]]||.45;
      factor=Math.min(factor,prefs.fastingShare&&prefs.fastingShare!=="decide"?(shares[prefs.fastingShare]||decide):decide);
      desired[0][1]=Math.min(desired[0][1],remaining*factor);
    }else desired[0][1]*=factor;
  }
  const need=desired.reduce((sum,x)=>sum+x[1],0),scale=need>available&&need?available/need:1;desired.forEach(([m,v])=>guides[m]=Math.max(0,Math.round(v*scale/10)*10));
  return {date,goal,fixed,remaining,reserve,available,guides,unallocated:Math.max(0,remaining-reserve-Object.values(guides).reduce((a,b)=>a+b,0)),type,existingByMeal,goals};
}
function renderPlannerEnergySummary(){const box=by("planner-energy-summary");if(!box)return;const b=plannerBudget(),meals=selectedPlannerMeals(),mode=by("planner-day-mode-note");if(mode)mode.textContent=b.type==="fasting"?"Fasting Day: unticked meal categories are treated as meals you intend to skip. The remaining fasting allowance is divided only across the meals you select.":"Normal Day: the planner keeps a sensible reserve for unticked meals, unless you have already added food there.";box.innerHTML=meals.length?`<span class="eyebrow">Energy Available for Companion Planning</span><strong>${formatNumber(b.available)} Cal</strong><small>Daily goal ${formatNumber(b.goal)} Cal · ${formatNumber(b.fixed)} Cal already recorded${b.reserve?` · ${formatNumber(b.reserve)} Cal kept in reserve for unticked meals`:""}</small><div class="planner-guide-list">${meals.map(m=>`<span>${esc(m)} <b>about ${formatNumber(b.guides[m])} Cal more</b>${b.existingByMeal[m]?` <small>(${formatNumber(b.existingByMeal[m])} Cal already in this meal)</small>`:""}</span>`).join("")}</div>`:`<span class="eyebrow">Start a New Plan</span><strong>Select one or more meals</strong><small>The companion will account for everything already recorded before making suggestions.</small>`;}
function plannerCandidateScore(suggestion,meal,target){
  const b=plannerBudget(),state=plannerProjectedState(b.date,meal),total=suggestionNutrition(suggestion),groups=suggestionGroups(suggestion);let score=Math.abs(total.calories-target)/Math.max(90,target||90);
  FOOD_GROUP_KEYS.forEach(k=>{const gap=n(b.goals.foodGroups[k])-n(state.groups[k]),add=n(groups[k]);if(gap>0)score-=Math.min(add,gap)*.22;else if(add>0)score+=add*.18;});
  const nutrientGoals={protein:b.goals.protein,carbs:b.goals.carbs,fat:b.goals.fat,fibre:b.goals.fibre};Object.entries(nutrientGoals).forEach(([k,g])=>{const gap=n(g)-n(state.nutrients[k]),add=n(total[k]);if(gap>0&&add>0)score-=Math.min(1,add/gap)*.18;else if(gap<=0&&add>0)score+=.08;});
  const free=n(total.freeSugar);if(free>0)score+=Math.max(0,(n(state.nutrients.freeSugar)+free)-b.goals.freeSugar)/Math.max(10,b.goals.freeSugar);
  const prefs=ext.ui.singleMealPreferences||{};
  if(prefs.meal===meal){
    const label=normalise(`${suggestion.name} ${suggestion.reason}`);
    if(prefs.style==="protein")score-=Math.min(.35,n(total.protein)/40*.25);
    if(prefs.style==="quick"&&/oats|yoghurt|yogurt|toast|sandwich|apple|berries|milk/.test(label))score-=.12;
    if(prefs.style==="cooked"&&/egg|chicken|beef|steak|sausage|potato|toast/.test(label))score-=.12;
    if(prefs.style==="different")score-=.03*Math.min(3,suggestion.items.length);
    const recentIds=new Set(recentGroups(14).flatMap(g=>g.items.map(e=>e.foodId)));
    const familiarCount=suggestion.items.filter(i=>recentIds.has(i.foodId)||ext.savedFoodIds.includes(i.foodId)).length;
    if(prefs.familiar==="familiar")score-=familiarCount*.07;
    if(prefs.familiar==="new")score+=familiarCount*.07;
  }
  return score-(suggestion.score||0)*.025;
}
function plannerHardCapForMeal(meal){
  const budget=plannerBudget();if(budget.type!=="fasting")return Infinity;let usedByOtherSuggestions=0;
  Object.entries(ext.ui.plannerResults||{}).forEach(([other,id])=>{if(other===meal||id==="__none__"||ext.ui.plannerAccepted?.[other]===id)return;const suggestion=MEAL_SUGGESTIONS.find(x=>x.id===id);if(suggestion)usedByOtherSuggestions+=n(suggestionNutrition(suggestion).calories);});
  return Math.max(0,budget.available-usedByOtherSuggestions);
}
function plannerChoice(meal,retry=false){
  const min=n(by("planner-min-score")?.value),budget=plannerBudget(),target=budget.guides[meal]??0,current=ext.ui.plannerResults?.[meal],rejected=ext.ui.plannerRejected?.[meal]||[],hardCap=plannerHardCapForMeal(meal);let candidates=MEAL_SUGGESTIONS.filter(s=>(s.meal===meal||(meal==="Other"&&s.meal==="Snacks"))&&s.score>=min&&!suggestionSafety(s).length);
  if(budget.type==="fasting"){
    candidates=candidates.filter(s=>suggestionNutrition(s).calories<=hardCap+.01);
    if(target>0){const softCap=Math.max(80,target*1.35),softFit=candidates.filter(s=>suggestionNutrition(s).calories<=softCap);if(softFit.length)candidates=softFit;}
  }
  const smallest=candidates.length?Math.min(...candidates.map(s=>suggestionNutrition(s).calories)):Infinity;if(!candidates.length||target<=0||(target<80&&smallest>target*1.5)){ext.ui.plannerResults[meal]="__none__";ext.ui.plannerAccepted[meal]="__none__";ext.ui.plannerRejected[meal]=[];return null;}candidates.sort((a,b)=>plannerCandidateScore(a,meal,target)-plannerCandidateScore(b,meal,target));if(retry&&current&&!rejected.includes(current))rejected.push(current);let choice=candidates.find(s=>s.id!==current&&!rejected.includes(s.id));if(!choice){rejected.length=0;if(current)rejected.push(current);choice=candidates.find(s=>s.id!==current)||candidates[0];}if(choice)ext.ui.plannerResults[meal]=choice.id;ext.ui.plannerRejected[meal]=rejected;delete ext.ui.plannerAccepted?.[meal];return choice;
}
function renderMealSuggestions(){
  const results=ext.ui.plannerResults||{},accepted=ext.ui.plannerAccepted||{},meals=Object.keys(results),target=by("meal-suggestions");if(!target)return;const allAccepted=meals.length&&meals.every(m=>results[m]==="__none__"||accepted[m]===results[m]);
  target.innerHTML=meals.length?`<div class="planner-results">${meals.map(meal=>{if(results[meal]==="__none__")return `<article class="planner-result-card planner-no-additional"><header><div><span class="eyebrow">${esc(meal)}</span><h3>No Additional Food Suggested</h3><p>The current plan leaves too little energy for another sensible suggestion in this meal.</p></div></header><p>If you still intend to eat at this meal, change another Diary item, increase the day target only if appropriate, or choose a very small food manually.</p></article>`;const s=MEAL_SUGGESTIONS.find(x=>x.id===results[meal]);if(!s)return "";const total=suggestionNutrition(s),groups=suggestionGroups(s),isAccepted=accepted[meal]===s.id,existing=plannerBudget().existingByMeal[meal]||0;return `<article class="planner-result-card ${isAccepted?"planner-accepted":""}"><header><div><span class="eyebrow">${esc(meal)}</span><h3>${esc(s.name)}</h3><p>${formatNumber(total.calories)} Cal · Protein ${formatNumber(total.protein)} g · Carbohydrate ${formatNumber(total.carbs)} g · Fat ${formatNumber(total.fat)} g · Fibre ${formatNumber(total.fibre)} g · Guide ${formatNumber(plannerBudget().guides[meal])} Cal more</p>${existing?`<p class="fine">This meal already contains ${formatNumber(existing)} Cal you recorded yourself. The suggestion is being considered around those entries.</p>`:""}</div><span class="health-score">${s.score}/10</span></header><p>${esc(s.reason)}</p><ul class="compact-list">${s.items.map(i=>{const f=getFood(i.foodId);return `<li>${esc(f.name)} — ${formatNumber(i.amount,true)} ${esc(unitLabel(f,i.unit))}</li>`}).join("")}</ul><div class="planner-group-line">${FOOD_GROUP_KEYS.filter(k=>groups[k]>0).map(k=>`<span>${esc(FOOD_GROUP_LABELS[k])}: ${formatNumber(groups[k],true)}</span>`).join("")}</div>${isAccepted?`<div class="accepted-plan-confirmation"><strong>Added To Diary ✓</strong><span>${esc(meal)} is now included in Diary and Daily Progress totals.</span><div class="quick-action-row"><button data-open-feature="food-diary" class="secondary">View in Diary</button><button data-plan-undo="${esc(meal)}" class="secondary">Undo</button></div></div>`:`<div class="planner-card-actions"><button class="primary" data-plan-accept="${esc(meal)}">Accept Meal</button><button class="secondary" data-plan-retry="${esc(meal)}">Try Again</button></div>`}</article>`}).join("")}</div>${allAccepted?`<div class="card planner-complete-message"><strong>The companion has finished reviewing the selected meals.</strong><div class="quick-action-row"><button data-open-feature="food-diary" class="secondary">View Day Plan</button><button id="planner-plan-more" class="primary">Plan More Meals</button></div></div>`:""}`:`<div class="card empty-state">Select one or more meals to begin a new planning session.</div>`;
  by("generate-meal-suggestions")?.classList.toggle("hidden",allAccepted);by("try-all-meal-suggestions")?.classList.toggle("hidden",!meals.length||allAccepted);
}
function generatePlannerResults(retryAll=false){const meals=selectedPlannerMeals();if(!meals.length){showActionToast("Choose at least one meal to plan.",null,5000);return;}ext.ui.plannerResults||={};ext.ui.plannerRejected||={};ext.ui.plannerAccepted||={};meals.forEach(meal=>plannerChoice(meal,retryAll));Object.keys(ext.ui.plannerResults).forEach(meal=>{if(!meals.includes(meal))delete ext.ui.plannerResults[meal];});saveExt();renderPlannerEnergySummary();renderMealSuggestions();}
function addPlannedSuggestion(meal,mode="add"){
  const suggestion=MEAL_SUGGESTIONS.find(s=>s.id===ext.ui.plannerResults?.[meal]);if(!suggestion)return;const date=ext.ui.plannerDate||by("planner-date")?.value||isoToday();ext.diary[date]||=[];const uniqueRef=`${date}|${meal}|${suggestion.id}`;if(ext.diary[date].some(e=>e.plannerRef===uniqueRef)){ext.ui.plannerAccepted[meal]=suggestion.id;saveExt();renderMealSuggestions();showActionToast(`${suggestion.name} is already in the Diary.`,null,6000);return;}if(mode==="replace")ext.diary[date]=ext.diary[date].filter(e=>e.meal!==meal);suggestion.items.forEach(i=>{const f=getFood(i.foodId);ext.diary[date].push({id:uid("entry"),foodId:f.id,name:f.name,brand:f.brand,date,meal,status:"eaten",amount:i.amount,unit:i.unit,unitLabel:unitLabel(f,i.unit),time:"",notes:`Meal Planner · ${suggestion.name}`,nutrients:scaledNutrients(f,i.amount,i.unit),foodGroups:scaledFoodGroups(f,i.amount,i.unit),waterMl:scaledWaterMl(f,i.amount,i.unit),hydrationType:f.hydrationType||"food",score:f.score,source:`Meal Planner · ${f.source}`,plannerRef:uniqueRef,localDate:date,timeZone:activeTimeZone(),createdAt:new Date().toISOString()});});ext.ui.diaryDate=date;ext.ui.progressDate=date;ext.ui.plannerAccepted[meal]=suggestion.id;saveExt();renderMealSuggestions();renderPlannerEnergySummary();if(q("#food-diary.active"))renderDiary();showActionToast(`${suggestion.name} added to ${meal}.`,()=>{ext.diary[date]=ext.diary[date].filter(e=>e.plannerRef!==uniqueRef);delete ext.ui.plannerAccepted[meal];saveExt();renderMealSuggestions();renderPlannerEnergySummary();if(q("#food-diary.active"))renderDiary();},2000);
}
function acceptPlannedSuggestion(meal){const date=ext.ui.plannerDate||by("planner-date")?.value||isoToday(),existing=entriesForDate(date).filter(e=>e.meal===meal&&e.status!=="skipped");if(!existing.length){addPlannedSuggestion(meal);return;}openModal(`${meal} already has entries`,`The companion has calculated around what you already recorded. Choose whether to add the suggestion alongside those entries or replace the existing meal entries.`,`Add Alongside Existing`,()=>addPlannedSuggestion(meal,"add"),`<button id="replace-planned-meal" class="secondary wide" type="button">Replace Existing Meal</button>`);by("replace-planned-meal")?.addEventListener("click",()=>{closeModal();addPlannedSuggestion(meal,"replace");},{once:true});}
by("planner-select-all")?.addEventListener("change",event=>{qa('input[name="planner-meal"]').forEach(x=>x.checked=event.target.checked);updatePlannerSelectAll();});qa('input[name="planner-meal"]').forEach(input=>input.addEventListener("change",()=>{clearPlannerResults();updatePlannerSelectAll();}));by("planner-min-score")?.addEventListener("change",()=>{clearPlannerResults();renderPlannerEnergySummary();});by("generate-meal-suggestions")?.addEventListener("click",()=>generatePlannerResults(false));by("try-all-meal-suggestions")?.addEventListener("click",()=>generatePlannerResults(true));document.addEventListener("click",event=>{const retry=event.target.closest("[data-plan-retry]");if(retry){plannerChoice(retry.dataset.planRetry,true);saveExt();renderMealSuggestions();return;}const accept=event.target.closest("[data-plan-accept]");if(accept){acceptPlannedSuggestion(accept.dataset.planAccept);return;}const more=event.target.closest("#planner-plan-more");if(more){resetPlannerSelections();saveExt();renderMealSuggestions();renderPlannerEnergySummary();window.scrollTo({top:0,behavior:"smooth"});return;}const undo=event.target.closest("[data-plan-undo]");if(undo){const meal=undo.dataset.planUndo,date=ext.ui.plannerDate||isoToday(),id=ext.ui.plannerAccepted?.[meal];ext.diary[date]=(ext.diary[date]||[]).filter(e=>!(e.meal===meal&&e.plannerRef?.endsWith(`|${id}`)));delete ext.ui.plannerAccepted[meal];saveExt();renderMealSuggestions();renderPlannerEnergySummary();showActionToast(`${meal} suggestion removed from the Diary.`,null,5000);}});

// Daily progress
function weeklyFoodGroupAverages(endDate){const totals=Object.fromEntries(FOOD_GROUP_KEYS.map(k=>[k,0]));for(let i=0;i<7;i++){const groups=dayFoodGroups(shiftISO(endDate,-i));FOOD_GROUP_KEYS.forEach(k=>totals[k]+=n(groups[k]));}FOOD_GROUP_KEYS.forEach(k=>totals[k]/=7);return totals;}
function renderDailyProgress(){
  const date=ext.ui.progressDate||by("progress-date")?.value||isoToday();ext.ui.progressDate=date;updateDateControl("progress",date);
  const summary=daySummary(date),{nutrients,hydration,steps,goals,foodGroups}=summary;goals.hydration=n(ext.fluidTargets[date])||goals.hydration;
  if(by("today-water"))by("today-water").value=ext.water[date]||0;if(by("today-fluid-target"))by("today-fluid-target").value=goals.hydration;if(by("today-steps"))by("today-steps").value=steps||"";if(by("today-fluid-summary"))by("today-fluid-summary").innerHTML=`<strong>${formatNumber(hydration.drinks)} / ${formatNumber(goals.hydration)} mL Fluids</strong><span>Manual drinks ${formatNumber(n(ext.water[date]))} mL · Diary drinks ${formatNumber(Math.max(0,hydration.drinks-n(ext.water[date])))} mL.</span>`;updateQuickDrinkButtonState();
  const recordedCount=entriesForDate(date).filter(e=>e.status!=="skipped").length,remaining=goals.calories-n(nutrients.calories),parts=[`${formatNumber(goals.calories)} Cal Goal`,`${formatNumber(nutrients.calories)} Cal Recorded`,remaining>=0?`${formatNumber(remaining)} Cal Remaining`:`${formatNumber(Math.abs(remaining))} Cal Above Target`];
  if(!recordedCount)parts.unshift("No Food Recorded Yet.");by("daily-progress-explanation").innerHTML=`<h3>${date===isoToday()?"Today’s":"Day"} Summary</h3><p>${parts.join(" · ")}</p>`;
  if(by("daily-meals-heading"))by("daily-meals-heading").textContent=date===isoToday()?"Today’s Meals":`${relativeDateLabel(date).split(" · ")[0]} Meals`;
  const allEntries=entriesForDate(date).filter(e=>e.status!=="skipped"),meals=plannerMealNames();
  by("daily-meal-status").innerHTML=meals.map(meal=>{const items=allEntries.filter(e=>e.meal===meal),total=sumNutrients(items).calories;return `<div class="meal-progress-shell"><details class="meal-progress-card ${items.length?"complete":"empty"}"><summary><span class="meal-progress-title"><strong>${esc(meal)} · ${formatNumber(total)} Cal</strong><small>${items.length?`${items.length} ${items.length===1?"Entry":"Entries"}`:"No Entries Yet"}</small></span><span class="meal-progress-state">${items.length?"Recorded":"Open Meal"}</span></summary><div class="meal-progress-body">${items.length?items.map(e=>`<div class="meal-progress-item recorded"><span><strong>${esc(e.name)}</strong><small>${formatNumber(e.amount,true)} ${esc(e.unitLabel||e.unit)} · ${formatNumber(e.nutrients?.calories)} Cal</small></span><div class="meal-progress-item-actions"><button data-progress-edit="${esc(e.id)}">Edit</button><button data-entry-delete="${esc(e.id)}" class="delete-action">Delete</button></div></div>`).join(""):'<p class="empty-state">No Entries Yet.</p>'}<div class="meal-progress-actions"><button class="secondary" data-progress-open-meal="${esc(meal)}">Open ${esc(meal)}</button></div></div></details></div>`;}).join("");
  const cards=[["Energy","calories",goals.calories,"Cal","energy"],["Protein","protein",goals.protein,"g","positive"],["Carbohydrate","carbs",goals.carbs,"g","positive"],["Fat","fat",goals.fat,"g","positive"],["Fibre","fibre",goals.fibre,"g","minimum"],["Sodium","sodium",goals.sodium,"mg","limit"]];
  const totalSugar=`<div class="progress-card sugar-info-card"><div><strong>Total Sugars</strong><span>${formatNumber(n(nutrients.sugar))} g</span></div><small>Information only — total sugars include naturally occurring sugars in fruit and milk.</small></div>`,hasFree=entriesForDate(date).some(e=>e.status!=="skipped"&&e.nutrients?.freeSugar!==null&&e.nutrients?.freeSugar!==undefined),freeSugar=hasFree?progressCard("Free Sugars",n(nutrients.freeSugar),goals.freeSugar,"g","limit",date):`<div class="progress-card sugar-info-card"><div><strong>Free Sugars</strong><span>Not Available</span></div><small>This food data does not provide enough information to calculate free sugars reliably.</small></div>`;
  by("daily-progress-grid").innerHTML=cards.map(([label,key,target,unit,type])=>progressCard(label,n(nutrients[key]),target,unit,type,date)).join("")+totalSugar+freeSugar+progressCard("Fluids",hydration.drinks,goals.hydration,"mL","positive",date)+progressCard("Steps",steps,goals.steps,"","positive",date);
  by("daily-food-group-progress").innerHTML=FOOD_GROUP_KEYS.map(key=>foodGroupCard(key,n(foodGroups[key]),goals.foodGroups[key],date)).join("");const weekly=weeklyFoodGroupAverages(date);by("weekly-food-group-progress").innerHTML=`<h4>Seven-Day Diary Average</h4><div>${FOOD_GROUP_KEYS.map(key=>`<span><small>${esc(FOOD_GROUP_LABELS[key])}</small><strong>${formatNumber(weekly[key],true)} / ${formatNumber(goals.foodGroups[key],true)}</strong></span>`).join("")}</div><p>Averages use the foods currently recorded in each day’s Diary.</p>`;saveExt();
}
function updateQuickDrinkButtonState(){const type=by("quick-drink-type")?.value||"",amount=n(by("quick-drink-amount")?.value);if(by("add-quick-drink"))by("add-quick-drink").disabled=!type||amount<10;}
by("quick-drink-type")?.addEventListener("change",updateQuickDrinkButtonState);by("quick-drink-amount")?.addEventListener("input",updateQuickDrinkButtonState);
let progressSaveTimer=null;
function autoSaveProgressFields(){clearTimeout(progressSaveTimer);progressSaveTimer=setTimeout(()=>{const date=ext.ui.progressDate||isoToday();ext.fluidTargets[date]=Math.max(250,n(by("today-fluid-target")?.value)||currentGoals(date).hydration);ext.steps[date]=Math.max(0,whole(by("today-steps")?.value));saveExt();renderDailyProgress();showActionToast("Fluid Target and Steps Updated.",null,2000);},350);}
by("today-fluid-target")?.addEventListener("change",autoSaveProgressFields);by("today-steps")?.addEventListener("change",autoSaveProgressFields);
by("add-quick-drink")?.addEventListener("click",()=>{
  const date=ext.ui.progressDate||isoToday(),type=by("quick-drink-type")?.value||"",amount=Math.max(0,n(by("quick-drink-amount")?.value));if(!type){showActionToast("Choose A Drink Type First.",null,4000);return;}if(amount<10){showActionToast("Enter A Drink Amount Of At Least 10 mL.",null,4500);return;}
  const labels={water:"Water",zero:"Zero-Calorie Drink",coffee:"Tea Or Coffee",milk:"Milk",juice:"Juice","soft drink":"Soft Drink",cordial:"Cordial",smoothie:"Smoothie",soup:"Soup Or Broth",other:"Drink"},label=labels[type]||"Drink";
  if(type==="water"||type==="zero"){
    ext.water[date]=n(ext.water[date])+amount;saveExt();if(by("quick-drink-status"))by("quick-drink-status").textContent=`${label}: ${formatNumber(amount)} mL Added.`;if(by("quick-drink-type"))by("quick-drink-type").value="";if(by("quick-drink-amount"))by("quick-drink-amount").value="";renderDailyProgress();showActionToast(`${formatNumber(amount)} mL ${label} Added.`,null,2000);return;
  }
  ext.ui.pendingDrink={type,label,amount};ext.ui.diaryDate=date;ext.ui.pendingMeal="";ext.ui.libraryTab="all";ext.ui.foodSearch=type==="other"?"":type;if(by("quick-drink-type"))by("quick-drink-type").value="";if(by("quick-drink-amount"))by("quick-drink-amount").value="";saveExt();openFeature("food-library");
});
document.addEventListener("click",event=>{const edit=event.target.closest("[data-progress-edit]");if(edit){const found=findEntry(edit.dataset.progressEdit);if(found)prepareEntry(getFood(found.entry.foodId)||snapshotFood(found.entry),{entry:found.entry});return;}});
document.addEventListener("click",event=>{const open=event.target.closest("[data-progress-open-meal]");if(!open)return;ext.ui.diaryDate=ext.ui.progressDate||isoToday();ext.ui.focusMeal=open.dataset.progressOpenMeal;saveExt();openFeature("food-diary");setTimeout(()=>{q(`[data-meal-name="${CSS.escape(open.dataset.progressOpenMeal)}"]`)?.scrollIntoView({block:"start",behavior:"smooth"});},80);});

// Exercise and activity
function renderExercise(){
  if(!by("exercise-history"))return;
  by("exercise-history").innerHTML=ext.exercise.length?ext.exercise.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<div class="list-row"><span>🏃</span><div><strong>${esc(x.name)}</strong><small>${formatDate(x.localDate||x.date.slice(0,10))} · ${x.minutes} min · ${esc(x.intensity)} · ${formatNumber(x.calories)} Cal burned · ${formatNumber(x.credit)} Cal credited</small><p>${esc(x.notes||"")}</p></div><button data-activity-delete="${esc(x.id)}" class="delete-action">Delete</button></div>`).join(""):`<p class="empty-state">No extra activity logged yet.</p>`;
}
by("add-exercise")?.addEventListener("click",()=>{
  const name=by("exercise-name").value.trim();if(!name)return;const calories=n(by("exercise-calories").value),choice=by("exercise-credit-choice").value,credit=choice==="custom"?n(by("exercise-custom-credit").value):calories*n(choice)/100;
  ext.exercise.push({id:uid("activity"),date:new Date().toISOString(),localDate:isoToday(),timeZone:activeTimeZone(),name,minutes:n(by("exercise-minutes").value),intensity:by("exercise-intensity").value,calories,credit:whole(credit),notes:by("exercise-notes").value});saveExt();renderExercise();showActionToast(`${name} added. ${whole(credit)} Cal credited to today’s allowance.`,null,2000);["exercise-name","exercise-minutes","exercise-calories","exercise-custom-credit","exercise-notes"].forEach(id=>by(id).value="");
});
document.addEventListener("click",event=>{const b=event.target.closest("[data-activity-delete]");if(!b)return;const idx=ext.exercise.findIndex(x=>x.id===b.dataset.activityDelete);if(idx<0)return;const item=ext.exercise[idx];openModal(`Delete ${item.name}?`,`This removes the activity and its credited Calories.`,`Delete`,()=>{const removed=ext.exercise.splice(idx,1)[0];saveExt();renderExercise();showActionToast(`${removed.name} deleted.`,()=>{ext.exercise.splice(idx,0,removed);saveExt();renderExercise();},8000);});});

// Shopping list
const SHOPPING_CATEGORIES=["Fruit & Vegetables","Meat & Seafood","Dairy & Eggs","Bread & Bakery","Breakfast & Cereals","Pantry","Snacks","Frozen","Drinks","Household","Cleaning","Personal Care","Pet Supplies","Other"];
const GROCERY_CATALOG=[
  ["SAO Biscuits","Pantry",["sao","say yo","say-o","sao crackers","sao biscuits"]],["Shredded Cheese","Dairy & Eggs",["grated cheese","why grated cheese"]],["Cheese Slices","Dairy & Eggs",["sliced cheese"]],["Tasty Cheese","Dairy & Eggs",[]],["Mature Cheese","Dairy & Eggs",[]],
  ["Greek Yoghurt","Dairy & Eggs",["greek yogurt","yoghurt","yogurt"]],["Cottage Cheese","Dairy & Eggs",[]],["Light Milk","Dairy & Eggs",["lite milk","milk"]],["Eggs","Dairy & Eggs",["egg"]],["Butter","Dairy & Eggs",[]],["Margarine","Dairy & Eggs",[]],
  ["Chicken Drumsticks","Meat & Seafood",["drumsticks"]],["Hot Chook","Meat & Seafood",["hot chicken","roast chicken","chook"]],["Chicken Breast","Meat & Seafood",[]],["Bacon Pieces","Meat & Seafood",["bacon bits"]],["Shredded Ham","Meat & Seafood",[]],["Beef","Meat & Seafood",[]],["Fish","Meat & Seafood",[]],["Tuna","Meat & Seafood",[]],
  ["Granny Smith Apples","Fruit & Vegetables",["granny smith","green apples"]],["Red Apples","Fruit & Vegetables",[]],["Bananas","Fruit & Vegetables",["banana"]],["Potatoes","Fruit & Vegetables",["potato","spuds"]],["Brown Onions","Fruit & Vegetables",["onions"]],["Carrots","Fruit & Vegetables",["carrot"]],["Broccoli","Fruit & Vegetables",[]],["Salad","Fruit & Vegetables",[]],
  ["White Sandwich Bread","Bread & Bakery",["white bread","sandwich bread"]],["Wholemeal Bread","Bread & Bakery",["bread"]],["Bread Rolls","Bread & Bakery",["rolls"]],["Nutri-Grain Cereal","Breakfast & Cereals",["nutrigrain","nutri grain"]],["Rolled Oats","Breakfast & Cereals",["oats"]],
  ["Sugar","Pantry",[]],["Coffee","Pantry",[]],["Pasta","Pantry",[]],["Brown Rice","Pantry",["rice"]],["Olive Oil","Pantry",["oil"]],["Frozen Vegetables","Frozen",["frozen veges","frozen veggies"]],["Pepsi Max","Drinks",["pepsi"]],["Sparkling Water","Drinks",["water"]],
  ["Toilet Paper","Household",["toilet rolls"]],["Dishwashing Liquid","Cleaning",["dish soap"]]
].map(([name,category,aliases])=>({name,category,aliases}));
function afcdShoppingCategory(name){const nrm=normalise(name);if(/apple|banana|fruit|vegetable|potato|carrot|broccoli|pumpkin|onion|lettuce|tomato|zucchini/.test(nrm))return "Fruit & Vegetables";if(/beef|pork|lamb|chicken|fish|tuna|salmon|prawn|seafood|sausage|bacon|ham/.test(nrm))return "Meat & Seafood";if(/milk|cheese|yoghurt|yogurt|egg|cream|custard/.test(nrm))return "Dairy & Eggs";if(/bread|roll|muffin|bakery/.test(nrm))return "Bread & Bakery";if(/cereal|weet bix|oat|porridge/.test(nrm))return "Breakfast & Cereals";if(/soft drink|juice|water|coffee|tea|beverage|cordial/.test(nrm))return "Drinks";if(/ice cream|frozen/.test(nrm))return "Frozen";if(/biscuit|cracker|chip|snack/.test(nrm))return "Snacks";return "Pantry";}
function closestAfcdName(input){const qn=normalise(input);if(!qn||!AFCD_FOODS.length)return null;let best=null,bestScore=99;for(const food of AFCD_FOODS){const name=normalise(food.name);if(name===qn)return {name:food.name,category:afcdShoppingCategory(food.name),confidence:"exact",food};if(name.includes(qn)||qn.includes(name)){const d=Math.abs(name.length-qn.length);if(d<bestScore){bestScore=d;best=food;}}}return best?{name:best.name,category:afcdShoppingCategory(best.name),confidence:"related",food:best}:null;}
function catalogueMatch(input){const qn=normalise(input);if(!qn)return null;const learned=ext.shoppingVoiceAliases?.[qn];if(learned){const known=GROCERY_CATALOG.find(x=>normalise(x.name)===normalise(learned));if(known)return {...known,confidence:"learned"};const afcd=closestAfcdName(learned);if(afcd)return {...afcd,confidence:"learned"};return {name:learned,category:afcdShoppingCategory(learned),confidence:"learned"};}let best=null,bestScore=Infinity;for(const item of GROCERY_CATALOG){for(const term of [item.name,...item.aliases]){const tn=normalise(term);if(qn===tn)return {...item,confidence:"exact"};const d=editDistance(qn,tn);if((qn.length>=3||tn.length>=3)&&d<bestScore){bestScore=d;best=item;}}}if(best&&bestScore<=Math.max(2,Math.floor(qn.length/4)))return {...best,confidence:"typo"};return closestAfcdName(input);}
function parseShoppingSpeech(text){
  const raw=String(text||"").trim(),words={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,a:1,an:1};
  const m=raw.match(/^\s*(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|a|an)\s*(kilograms?|kilos?|kg|grams?|g|millilitres?|milliliters?|ml|litres?|liters?|litre|liter|l|packets?|packs?|bottles?|cans?|tins?|dozen|items?)?\s*(?:of\s+)?(.+)$/i);
  if(!m)return {item:raw,quantity:""};
  const number=Number(m[1])||words[m[1].toLowerCase()]||1,unitRaw=String(m[2]||"").toLowerCase(),item=m[3].trim();
  const unitMap={kilogram:"kg",kilograms:"kg",kilo:"kg",kilos:"kg",kg:"kg",gram:"g",grams:"g",g:"g",millilitre:"mL",millilitres:"mL",milliliter:"mL",milliliters:"mL",ml:"mL",litre:"L",litres:"L",liter:"L",liters:"L",l:"L",packet:"packet",packets:"packets",pack:"pack",packs:"packs",bottle:"bottle",bottles:"bottles",can:"can",cans:"cans",tin:"tin",tins:"tins",dozen:"dozen",item:"item",items:"items"};
  const unit=unitMap[unitRaw]||unitRaw;return {item,quantity:`${formatNumber(number,true)}${unit?` ${unit}`:""}`};
}
function inferShoppingCategory(name){const match=catalogueMatch(name);return match?.category||afcdShoppingCategory(name)||"Other";}
function parseQuantityText(value){const text=String(value||"").trim();const m=text.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);return m?{number:Number(m[1]),unit:m[2].trim().toLowerCase()}:null;}
function combineQuantities(a,b){const pa=parseQuantityText(a),pb=parseQuantityText(b);if(pa&&pb&&pa.unit===pb.unit){const total=round1(pa.number+pb.number);return `${formatNumber(total,true)}${pa.unit?` ${pa.unit}`:""}`;}return [a,b].filter(Boolean).join(" + ");}
function normaliseShoppingCategories(){const map={"Fruit & vegetables":"Fruit & Vegetables","Meat & seafood":"Meat & Seafood","Dairy & eggs":"Dairy & Eggs","Bakery":"Bread & Bakery"};ext.shopping.forEach(x=>{x.category=map[x.category]||x.category||inferShoppingCategory(x.item);if(x.category==="Other"){const inferred=inferShoppingCategory(x.item);if(inferred!=="Other")x.category=inferred;}});}
function renderShopping(){normaliseShoppingCategories();const groups={};ext.shopping.forEach((x,i)=>(groups[x.category||"Other"]??=[]).push({...x,index:i}));by("shopping-items").innerHTML=ext.shopping.length?Object.entries(groups).sort((a,b)=>SHOPPING_CATEGORIES.indexOf(a[0])-SHOPPING_CATEGORIES.indexOf(b[0])).map(([category,items])=>`<section class="shopping-category"><h4>${esc(category)}</h4>${items.map(item=>`<div class="shopping-row ${item.done?"done":""}"><input type="checkbox" data-shop-check="${item.index}" ${item.done?"checked":""} aria-label="Mark ${esc(item.item)} collected"><button class="shopping-item-main" data-shop-edit="${item.index}"><strong>${esc(item.item)}</strong><small>${esc(item.quantity||"")}${item.brand?` · ${esc(item.brand)}`:""}${item.notes?` · ${esc(item.notes)}`:""}</small></button><button data-shop-menu="${item.index}" class="shopping-more" aria-label="More options">•••</button></div>`).join("")}</section>`).join(""):`<p class="empty-state">Your shopping list is empty. Add an item below or import ingredients from a meal plan.</p>`;by("shopping-suggestions").innerHTML=GROCERY_CATALOG.map(x=>`<option value="${esc(x.name)}">${esc(x.category)}</option>`).join("");const allDone=ext.shopping.length&&ext.shopping.every(x=>x.done);if(by("toggle-all-shopping"))by("toggle-all-shopping").textContent=allDone?"Deselect All":"Select All";renderShoppingPrint();saveExt();}
function shoppingShareText(){normaliseShoppingCategories();const active=ext.shopping.filter(x=>!x.done),groups={};active.forEach(x=>(groups[x.category||"Other"]??=[]).push(x));const sections=Object.entries(groups).sort((a,b)=>SHOPPING_CATEGORIES.indexOf(a[0])-SHOPPING_CATEGORIES.indexOf(b[0])).map(([cat,items])=>`${cat}\n${items.map(x=>`• ${x.item}${x.quantity?` — ${x.quantity}`:""}${x.brand?` · ${x.brand}`:""}`).join("\n")}`).join("\n\n");return `Healthy Eating Companion — Shopping List\n${formatDate(isoToday())}\n\n${sections||"No unchecked items."}`;}
function renderShoppingPrint(){const textGroups={};ext.shopping.filter(x=>!x.done).forEach(x=>(textGroups[x.category||"Other"]??=[]).push(x));by("shopping-print-area").innerHTML=`<h1>Healthy Eating Companion Shopping List</h1><p>${formatDate(isoToday())}</p>${Object.entries(textGroups).sort((a,b)=>SHOPPING_CATEGORIES.indexOf(a[0])-SHOPPING_CATEGORIES.indexOf(b[0])).map(([category,items])=>`<h2>${esc(category)}</h2><ul>${items.map(x=>`<li>☐ <strong>${esc(x.item)}</strong>${x.quantity?` — ${esc(x.quantity)}`:""}${x.brand?` · ${esc(x.brand)}`:""}${x.notes?` · ${esc(x.notes)}`:""}</li>`).join("")}</ul>`).join("")||"<p>No unchecked items.</p>"}`;}
function addShoppingRecord(record){ext.shopping.push({id:uid("shop"),done:false,notes:"",brand:"",...record});saveExt();renderShopping();showActionToast(`${record.item} added to ${record.category}.`,null,2000);}
function requestAddShopping(){const raw=by("shopping-item").value.trim();if(!raw)return;const match=catalogueMatch(raw),quantity=by("shopping-quantity").value.trim(),brand=by("shopping-brand").value.trim(),notes=by("shopping-notes").value.trim(),selected=by("shopping-category").value,itemName=match?.name||raw,category=selected==="auto"?(match?.category||inferShoppingCategory(raw)):selected,exact=ext.shopping.find(x=>!x.done&&normalise(x.item)===normalise(itemName));const doAdd=()=>{const heard=ext.ui.lastShoppingVoiceHeard?parseShoppingSpeech(ext.ui.lastShoppingVoiceHeard).item:"";if(heard&&normalise(heard)!==normalise(itemName)){ext.shoppingVoiceAliases||={};ext.shoppingVoiceAliases[normalise(heard)]=itemName;}addShoppingRecord({item:itemName,quantity,category,brand,notes});ext.ui.lastShoppingVoiceHeard="";["shopping-item","shopping-quantity","shopping-brand","shopping-notes"].forEach(id=>by(id).value="");by("shopping-category").value="auto";};if(match?.confidence==="typo"&&normalise(match.name)!==normalise(raw)){openModal(`Did you mean ${match.name}?`,`We found a close grocery/food match in ${match.category}.`,`Use ${match.name}`,()=>{by("shopping-item").value=match.name;requestAddShopping();},`<button id="keep-shopping-spelling" class="secondary wide">Keep “${esc(raw)}”</button>`);by("keep-shopping-spelling")?.addEventListener("click",()=>{closeModal();addShoppingRecord({item:raw,quantity,category:inferShoppingCategory(raw),brand,notes});},{once:true});return;}if(exact){openModal(`${exact.item} is already on your list`,`Current quantity: ${exact.quantity||"not specified"}. Choose the new combined quantity.`,`Update Quantity`,()=>{exact.quantity=by("duplicate-shopping-quantity").value.trim();if(brand)exact.brand=brand;if(notes)exact.notes=notes;saveExt();renderShopping();showActionToast(`${exact.item} quantity updated.`,null,2000);},`<label>New Quantity<input id="duplicate-shopping-quantity" value="${esc(combineQuantities(exact.quantity,quantity))}"></label><button id="add-shopping-separately" class="secondary wide">Add as a Separate Item</button>`);by("add-shopping-separately")?.addEventListener("click",()=>{closeModal();doAdd();},{once:true});return;}doAdd();}
by("add-shopping-item")?.addEventListener("click",requestAddShopping);by("shopping-item")?.addEventListener("change",()=>{const match=catalogueMatch(by("shopping-item").value);by("shopping-add-status").textContent=match?`${match.name} will be filed under ${match.category}.`:"No confident category match yet. Review the category before adding.";});
function editShoppingItem(index){const item=ext.shopping[index];if(!item)return;openModal(`Edit ${item.item}`,"Change any detail without deleting and re-entering the item.","Save Changes",()=>{item.item=by("edit-shop-name").value.trim()||item.item;item.quantity=by("edit-shop-quantity").value.trim();item.category=by("edit-shop-category").value;item.brand=by("edit-shop-brand").value.trim();item.notes=by("edit-shop-notes").value.trim();saveExt();renderShopping();showActionToast(`${item.item} updated.`,null,2000);},`<div class="form-grid"><label>Item<input id="edit-shop-name" value="${esc(item.item)}"></label><label>Quantity<input id="edit-shop-quantity" value="${esc(item.quantity||"")}"></label><label>Category<select id="edit-shop-category">${SHOPPING_CATEGORIES.map(c=>`<option ${c===item.category?"selected":""}>${esc(c)}</option>`).join("")}</select></label><label>Brand / Substitute<input id="edit-shop-brand" value="${esc(item.brand||"")}"></label><label class="full">Notes<input id="edit-shop-notes" value="${esc(item.notes||"")}"></label></div><button id="delete-shop-from-edit" class="danger-button wide">Delete Item</button>`);by("delete-shop-from-edit")?.addEventListener("click",()=>{closeModal();const removed=ext.shopping.splice(index,1)[0];saveExt();renderShopping();showActionToast(`${removed.item} deleted.`,()=>{ext.shopping.splice(index,0,removed);saveExt();renderShopping();},8000);},{once:true});}
document.addEventListener("change",event=>{if(event.target.dataset.shopCheck!==undefined){ext.shopping[Number(event.target.dataset.shopCheck)].done=event.target.checked;saveExt();renderShopping();}});document.addEventListener("click",event=>{const edit=event.target.closest("[data-shop-edit],[data-shop-menu]");if(edit){editShoppingItem(Number(edit.dataset.shopEdit??edit.dataset.shopMenu));return;}});
by("toggle-all-shopping")?.addEventListener("click",()=>{const makeDone=!(ext.shopping.length&&ext.shopping.every(x=>x.done));ext.shopping.forEach(x=>x.done=makeDone);saveExt();renderShopping();});
by("clear-checked-shopping")?.addEventListener("click",()=>{const removed=ext.shopping.filter(x=>x.done);if(!removed.length){showActionToast("No checked items to clear.",null,4000);return;}openModal("Clear Checked Items?",`Remove ${removed.length} checked item${removed.length===1?"":"s"}.`,`Clear Checked`,()=>{ext.shopping=ext.shopping.filter(x=>!x.done);saveExt();renderShopping();showActionToast("Checked items cleared.",()=>{ext.shopping.push(...removed);saveExt();renderShopping();},8000);});});
by("clear-all-shopping")?.addEventListener("click",()=>{if(!ext.shopping.length)return;openModal("Clear the Entire Shopping List?","This will remove every item from the current list.","Clear All",()=>{const removed=clone(ext.shopping);ext.shopping=[];saveExt();renderShopping();showActionToast("Shopping list cleared.",()=>{ext.shopping=removed;saveExt();renderShopping();},8000);});});
by("print-shopping-list")?.addEventListener("click",()=>{renderShoppingPrint();document.body.classList.add("printing-shopping");setTimeout(()=>{window.print();document.body.classList.remove("printing-shopping");},80);});by("share-shopping-list")?.addEventListener("click",async()=>{const text=shoppingShareText();if(navigator.share)try{await navigator.share({title:"Shopping List",text});}catch{}else{await navigator.clipboard?.writeText(text);showActionToast("Shopping list copied to the clipboard.",null,2000);}});
function speakShopping(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){showActionToast("Speech entry is unavailable in this browser.",null,5000);return;}const r=new SR();r.lang="en-AU";r.interimResults=false;r.maxAlternatives=3;r.onresult=e=>{const alternatives=[...e.results[0]].map(x=>x.transcript),matches=alternatives.map(text=>{const parsed=parseShoppingSpeech(text);return {text,parsed,match:catalogueMatch(parsed.item)}}),best=matches.find(x=>x.match?.confidence==="exact"||x.match?.confidence==="learned")||matches.find(x=>x.match)||matches[0];ext.ui.lastShoppingVoiceHeard=best.text;by("shopping-item").value=best.match?.name||best.parsed.item;if(best.parsed.quantity)by("shopping-quantity").value=best.parsed.quantity;saveExt();by("shopping-item").dispatchEvent(new Event("change"));const interpreted=best.match?.name||best.parsed.item;if(normalise(interpreted)!==normalise(best.text)||best.parsed.quantity)showActionToast(`Heard “${best.text}”. Interpreted as ${best.parsed.quantity?best.parsed.quantity+" ":""}${interpreted}. Review before adding.`,null,7000);};r.start();}
by("speak-shopping-item")?.addEventListener("click",speakShopping);by("shopping-quick-speak")?.addEventListener("click",speakShopping);by("shopping-quick-add")?.addEventListener("click",()=>{by("shopping-add-card")?.scrollIntoView({behavior:"smooth",block:"start"});setTimeout(()=>by("shopping-item")?.focus(),350);});

by("food-data-settings")?.addEventListener("click",()=>{const settings=ext.foodDataSettings||{};openModal("Food Data Sources","Australian verified records are prioritised. Online sources broaden coverage but must be reviewed.","Save",()=>{ext.foodDataSettings={usdaKey:by("usda-api-key")?.value.trim()||""};saveExt();showActionToast("Food data settings saved.",null,2000);},`<p><strong>Open Food Facts</strong> supplies a large international packaged-product database and barcode lookup. Records are community supplied.</p><p><strong>Australian Food Composition Database Release 3</strong> is now built into Alpha 0.6.12 for local searching of 1,588 Australian foods. Values come from Food Standards Australia New Zealand and are shown per the selected quantity.</p><p class="fine">AFCD values are reference averages and can vary by brand, batch, season, processing and ingredient source. Australian data may not be appropriate in other countries. See the AFCD data notice supplied with this build for attribution and licence information.</p><label>USDA FoodData Central API key (optional)<input id="usda-api-key" value="${esc(settings.usdaKey||"")}" placeholder="Leave blank to use the low-limit DEMO_KEY"></label><p class="fine">Do not publish a private API key in a public web build. A production server should protect it.</p>`);});

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
  showActionToast("Food Preferences saved. You can update them at any time.",null,2000);
});
const CONNECTIONS=["Apple Health & Apple Watch","Google Health Connect","Smart Scales","Fitness Trackers","Nutrition Apps","Calendar & Reminders","Private Household Sharing"];
function renderConnections(){by("family-sharing-enabled").checked=!!ext.family.enabled;by("household-name").value=ext.family.name||"";by("family-email").value=ext.family.email||"";by("connections-list").innerHTML=CONNECTIONS.map(name=>`<label class="connection-row"><span><strong>${esc(name)}</strong><small>Preference saved locally; secure connection not active in this static trial.</small></span><input type="checkbox" data-connection="${esc(name)}" ${ext.connections[name]?"checked":""}></label>`).join("");}
by("save-family")?.addEventListener("click",()=>{ext.family={enabled:by("family-sharing-enabled").checked,name:by("household-name").value,email:by("family-email").value};saveExt();showActionToast("Household-sharing preferences saved locally.",null,2000);});
document.addEventListener("change",event=>{if(event.target.dataset.connection){ext.connections[event.target.dataset.connection]=event.target.checked;saveExt();showActionToast(`${event.target.dataset.connection} preference ${event.target.checked?"enabled":"disabled"}.`,null,2000);}});

// Progress history
function currentPeriod(){return q(".history-period button.active")?.dataset.period||"30";}
function renderHistory(period){
  const days=period==="all"?null:n(period),today=isoToday(),cutoff=days?shiftISO(today,-(days-1)):null,within=date=>!!date&&date<=today&&(!cutoff||date>=cutoff);
  const main=mainData(),weights=(main.weightHistory||[]).filter(x=>x?.date&&within(x.date)).sort((a,b)=>a.date.localeCompare(b.date)),dates=Object.keys(ext.diary).filter(within).sort(),recorded=dates.filter(date=>recordedEntriesForDate(date).length>0),totals=recorded.map(date=>({date,...daySummary(date)})),average=key=>recorded.length?totals.reduce((sum,x)=>sum+n(x.nutrients[key]),0)/recorded.length:0,activities=ext.exercise.filter(x=>within(x.localDate||x.date.slice(0,10)));
  by("history-summary").innerHTML=`<strong>Food Diary Days: ${recorded.length} · Weight Check-Ins: ${weights.length} · Activities: ${activities.length}</strong><p>Food averages use days with Diary entries only. Weight Check-Ins are counted separately.</p>`;
  if(weights.length){const values=weights.map(x=>n(x.weightKg)),rawMin=Math.min(...values),rawMax=Math.max(...values),spread=Math.max(.4,rawMax-rawMin),min=rawMin-Math.max(.2,spread*.15),max=rawMax+Math.max(.2,spread*.15),span=Math.max(.4,max-min),last=weights[weights.length-1];by("history-bars").innerHTML=`<div class="weight-bar-scroll" role="img" aria-label="Weight trend from ${formatDate(weights[0].date)} to ${formatDate(last.date)}"><div class="weight-bar-chart" style="--weight-count:${weights.length}">${weights.map(item=>{const value=n(item.weightKg),height=28+((value-min)/span)*64;return `<div class="weight-bar-item"><strong>${Number(value).toFixed(1)} kg</strong><div class="weight-bar-track"><i style="height:${Math.max(12,Math.min(96,height)).toFixed(1)}%"></i></div><span>${esc(new Intl.DateTimeFormat("en-AU",{weekday:"short",day:"numeric",month:"short"}).format(new Date(item.date+"T12:00:00")).replace(",",""))}</span></div>`;}).join("")}</div></div><div class="weight-trend-fallback" aria-label="Weight trend values">${weights.map(item=>`<span><strong>${Number(n(item.weightKg)).toFixed(1)} kg</strong><small>${esc(relativeDateLabel(item.date))}</small></span>`).join("")}</div>`;}else by("history-bars").innerHTML=`<p class="empty-state">Add Weight Check-Ins to build your weight trend.</p>`;
  by("nutrition-history").innerHTML=recorded.length?`<div class="summary-grid"><div class="summary-item"><span>Average Energy On Recorded Days</span><strong>${formatNumber(average("calories"))} Cal</strong></div><div class="summary-item"><span>Average Protein</span><strong>${formatNumber(average("protein"))} g</strong></div><div class="summary-item"><span>Average Fibre</span><strong>${formatNumber(average("fibre"))} g</strong></div><div class="summary-item"><span>Average Sodium</span><strong>${formatNumber(average("sodium"))} mg</strong></div></div><div class="history-list">${totals.map(x=>`<div><span>${formatDate(x.date)}</span><strong>${formatNumber(x.nutrients.calories)} Cal · ${recordedEntriesForDate(x.date).length} entries</strong></div>`).join("")}</div>`:`<p class="empty-state">No recorded food days in this period.</p>`;
  const totalActivity=activities.reduce((sum,x)=>sum+n(x.calories),0),waterDates=Object.keys(ext.water).filter(within),avgWater=waterDates.length?waterDates.reduce((sum,d)=>sum+n(ext.water[d]),0)/waterDates.length:0;by("activity-history-summary").innerHTML=`<div class="summary-grid"><div class="summary-item"><span>Activity Recorded</span><strong>${formatNumber(totalActivity)} Cal Estimated</strong></div><div class="summary-item"><span>Average Quick-Added Zero-Calorie Drinks</span><strong>${formatNumber(avgWater)} mL</strong></div></div>`;
}
q(".history-period")?.addEventListener("click",event=>{const b=event.target.closest("[data-period]");if(!b)return;qa(".history-period button").forEach(x=>x.classList.toggle("active",x===b));renderHistory(b.dataset.period);});

// Printable report
function initialiseReport(){const to=isoToday(),from=shiftISO(to,-6);by("report-from").value ||= from;by("report-to").value ||= to;}
function reportRows(from,to){return Object.keys(ext.diary).filter(d=>d>=from&&d<=to).sort().map(date=>({date,entries:entriesForDate(date),summary:daySummary(date)}));}
function buildReport(){
  const from=by("report-from").value,to=by("report-to").value;if(!from||!to||from>to){showActionToast("Choose a valid report date range.",null,5000);return;}
  const main=mainData(),rows=reportRows(from,to),foodOn=by("report-food").checked,weightOn=by("report-weight").checked,activityOn=by("report-activity").checked,waterOn=by("report-water").checked;const weights=(main.weightHistory||[]).filter(x=>x.date>=from&&x.date<=to);const activities=ext.exercise.filter(x=>(x.localDate||x.date.slice(0,10))>=from&&(x.localDate||x.date.slice(0,10))<=to);
  by("report-preview").innerHTML=`<header class="report-title"><h1>Healthy Eating Companion Progress Report</h1><p>${formatDate(from)} to ${formatDate(to)}</p><p>${esc(main.personal?.preferredName||main.personal?.fullName||"Founder Tester")}</p></header><section><h2>Plain-English Summary</h2><p>${rows.filter(r=>r.entries.some(e=>e.status==="eaten")).length} days contain food records. Unrecorded days are not counted as zero intake. This founder report is for personal review and is not medical advice.</p></section>${foodOn?`<section><h2>Food & Nutrition</h2>${rows.length?rows.map(r=>`<h3>${formatDate(r.date)}</h3><p><strong>${formatNumber(r.summary.nutrients.calories)} Cal</strong> · Protein ${formatNumber(r.summary.nutrients.protein)} g · Fibre ${formatNumber(r.summary.nutrients.fibre)} g · Sodium ${formatNumber(r.summary.nutrients.sodium)} mg</p><table><thead><tr><th>Meal</th><th>Food</th><th>Status</th><th>Amount</th><th>Cal</th></tr></thead><tbody>${r.entries.map(e=>`<tr><td>${esc(e.meal)}</td><td>${esc(e.name)}</td><td>${esc(statusLabel(e.status))}</td><td>${formatNumber(e.amount,true)} ${esc(e.unitLabel||e.unit)}</td><td>${formatNumber(e.nutrients.calories)}</td></tr>`).join("")}</tbody></table>`).join(""):`<p>No food records in this period.</p>`}</section>`:""}${weightOn?`<section><h2>Weight</h2>${weights.length?`<table><thead><tr><th>Date</th><th>Weight</th><th>Note</th></tr></thead><tbody>${weights.map(w=>`<tr><td>${esc(w.date)}</td><td>${formatNumber(w.weightKg,true)} kg</td><td>${esc(w.note||"")}</td></tr>`).join("")}</tbody></table>`:`<p>No weight entries in this period.</p>`}</section>`:""}${activityOn?`<section><h2>Activity</h2>${activities.length?`<table><thead><tr><th>Date</th><th>Activity</th><th>Minutes</th><th>Burned</th><th>Credited</th></tr></thead><tbody>${activities.map(a=>`<tr><td>${esc(a.localDate||a.date.slice(0,10))}</td><td>${esc(a.name)}</td><td>${formatNumber(a.minutes)}</td><td>${formatNumber(a.calories)} Cal</td><td>${formatNumber(a.credit)} Cal</td></tr>`).join("")}</tbody></table>`:`<p>No activity entries in this period.</p>`}</section>`:""}${waterOn?`<section><h2>Hydration & Steps</h2><table><thead><tr><th>Date</th><th>Total Hydration</th><th>Steps</th></tr></thead><tbody>${Object.keys({...ext.diary,...ext.water,...ext.steps}).filter(d=>d>=from&&d<=to).sort().map(d=>`<tr><td>${esc(d)}</td><td>${formatNumber(dayHydration(d).total)} mL</td><td>${formatNumber(ext.steps[d])}</td></tr>`).join("")}</tbody></table></section>`:""}`;
}
by("preview-report")?.addEventListener("click",buildReport);by("print-report")?.addEventListener("click",()=>{buildReport();setTimeout(()=>window.print(),80);});
by("download-data")?.addEventListener("click",()=>{const blob=new Blob([JSON.stringify({profile:mainData(),functional:ext},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`healthy-eating-companion-alpha-0-6-12-data-${isoToday()}.json`;a.click();URL.revokeObjectURL(url);});

// Contextual help
const HELP={
  "food-diary":"The Diary is the main place to build your day. Add food directly inside a meal, or tap Suggest to ask the companion for that meal. Every entry counts immediately. If the day changes, edit the amount, replace the food, add something else or delete it. Edit Day opens Normal/Fasting settings only when you need them. Plan Multiple Meals opens the separate bulk planner.",
  "food-library":"Search prioritises exact Australian matches and your own foods. Review the serving size and source before adding. Save Food is labelled in words rather than relying on a bookmark icon.",
  "quick-log":"Speak or type naturally, correct the transcript, then review the identified foods. Nothing is logged automatically. Accent recognition depends on the device speech service, while the food vocabulary and confirmation flow are controlled here.",
  "scan-centre":"Barcode photos and live camera scanning can look up products in Open Food Facts. Nutrition-panel OCR fills editable review fields. Meal photos never guess calories; identify and confirm every food before logging.",
  "meal-planner":"Use this screen for bulk planning several meals. For a single Breakfast, Lunch, Dinner or snack suggestion, use Suggest directly inside the Diary. Every food already recorded in the Diary is accounted for before new suggestions are calculated.",
  "daily-progress":"Your recorded meals appear first so you can amend the day quickly. Nutrition bars reflect everything currently in the Diary. Fluids include water and other logged drinks. Estimated moisture in solid foods is shown separately. Update entries whenever the day changes.",
  "progress-history":"Averages use days with actual records only. There are no flames, game badges or leaderboards—only meaningful progress information."
};
document.addEventListener("click",event=>{const b=event.target.closest("[data-help]");if(!b)return;const copy=HELP[b.dataset.help]||"Help is available for this screen.";openModal("Help With This Screen",copy,"Close",()=>{});by("a05-modal-confirm").className="primary";if(mainData().companion?.enabled&&typeof window.speakText==="function")window.speakText(copy);});

// Alpha 0.6.12 migration: keep existing records, enforce the five agreed meal categories, and preserve explicit day targets.
function refreshDiaryEnergyPreview(target){const slide=by("diary-day-summary")?.querySelector(".summary-slide");if(!slide)return;const date=diaryDate(),recorded=dayNutrition(date,["eaten","planned"]).calories,exercise=(ext.exercise||[]).filter(x=>(x.localDate||x.date?.slice(0,10))===date).reduce((sum,x)=>sum+n(x.credit),0),goal=n(target)?n(target)+exercise:0;slide.innerHTML=`<span>${date===isoToday()?"Today’s Energy":relativeDateLabel(date).split(" · ")[0]+" Energy"}</span><div class="diary-kpi-row"><div><small>Goal</small><strong>${goal?`${formatNumber(goal)} Cal`:"Needs Review"}</strong></div><div><small>Recorded</small><strong>${formatNumber(recorded)} Cal</strong></div><div><small>Remaining</small><strong>${goal?`${formatNumber(Math.max(0,goal-recorded))} Cal`:"—"}</strong></div></div>`;}
ext.version="0.6.12";Object.keys(ext.diary||{}).forEach(date=>{ext.diary[date]=(ext.diary[date]||[]).filter(entry=>entry&&entry.status!=="skipped").map(entry=>({...entry,status:"eaten",meal:(entry.meal==="Morning Tea"||entry.meal==="Afternoon Tea")?"Snacks":(mealNames().includes(entry.meal)?entry.meal:"Other")}));if(!ext.diary[date].length)delete ext.diary[date];});ext.ui.plannerResults={};ext.ui.plannerRejected={};ext.ui.plannerAccepted={};ext.ui.plannerSessionActive=false;ext.dayTypeTargets||={fasting:500};if(!n(ext.dayTypeTargets.fasting))ext.dayTypeTargets.fasting=500;const recoveredNormal=recommendedNormalTarget();if(recoveredNormal){ext.dayTypeTargets.normal=recoveredNormal;ext.dayTypeTargets.normalSource="profile";}else if(ext.dayTypeTargets.normalSource!=="profile"){delete ext.dayTypeTargets.normal;delete ext.dayTypeTargets.normalSource;}Object.values(ext.daySettings||{}).forEach(settings=>{if(!settings)return;if(settings.type==="normal"&&!settings.customTarget){if(recoveredNormal)settings.targetCal=recoveredNormal;else delete settings.targetCal;}if(settings.customTarget===undefined)settings.customTarget=false;});normaliseShoppingCategories();saveExt();

// Initial setup and integration
function init(){
  // Postal address behaviour and Alpha 0.6.2 profile extensions
  const postalSame=by("postal-same"),postalFields=by("postal-fields");const togglePostal=()=>postalFields?.classList.toggle("hidden",postalSame?.checked);postalSame?.addEventListener("change",togglePostal);togglePostal();
  const dietaryIds=["food-allergies","food-intolerances","medical-restrictions","eating-pattern","pregnancy-status","cultural-restrictions"];
  by("personal-next")?.addEventListener("click",()=>setTimeout(()=>{const d=mainData();d.personal=Object.assign(d.personal||{},{postalSame:postalSame?.checked,postalCountry:by("postal-country")?.value,postalRegion:by("postal-region")?.value,postalPostcode:by("postal-postcode")?.value,postalSuburb:by("postal-suburb")?.value,postalStreet:by("postal-street")?.value});localStorage.setItem(MAIN_KEY,JSON.stringify(d));},30));
  by("calculate-button")?.addEventListener("click",()=>setTimeout(()=>{const d=mainData();d.dietary=Object.assign({},d.dietary||{},Object.fromEntries(dietaryIds.map(id=>[id,by(id)?.value||""])));localStorage.setItem(MAIN_KEY,JSON.stringify(d));},30));
  const d=mainData(),p=d.personal||{};if(postalSame){postalSame.checked=p.postalSame!==false;[["postal-country","postalCountry"],["postal-region","postalRegion"],["postal-postcode","postalPostcode"],["postal-suburb","postalSuburb"],["postal-street","postalStreet"]].forEach(([id,key])=>{if(by(id))by(id).value=p[key]||""});togglePostal();}dietaryIds.forEach(id=>{if(by(id))by(id).value=d.dietary?.[id]||""});
  initialiseDateControls();loadAfcdFoods();renderRecipeSelectOptions();renderScanSelect();renderHomeSummary();
  // Ensure earlier founder profiles can migrate without losing functional data.
  saveExt();
  if(mainData().completed){const profile=mainData();if(profile.firstHomePending){openFeature("home");profile.firstHomePending=false;localStorage.setItem(MAIN_KEY,JSON.stringify(profile));}else openFeature("daily-progress");}
}

/* ===== Alpha 0.6.12 integrated founder-testing refinements ===== */
const BUILD='0.6.12';
const DAY_MS=86400000;
const el=id=>document.getElementById(id);
const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const safe=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* ---------- 1. Migration / version ---------- */
function migrate612(){
  try{
    ext.version=BUILD;
    ext.ui ||= {};
    ext.foodVerification ||= {};
    ext.sharedImports ||= [];
    ext.connections ||= {};
    ext.connections.future ||= {appleHealth:false,healthConnect:false,social:false,cloudAccount:false};
    const main=mainData();
    main.version=BUILD;
    main.health ||= {};
    const history=(main.weightHistory||[]).filter(x=>x?.date&&Number(x.weightKg)>0).sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.recordedAt||'').localeCompare(String(b.recordedAt||'')));
    if(history.length){
      const earliest=history[0];
      main.health.startingWeightDate=earliest.date;
      history.forEach((item,index)=>{
        if(index===0){item.isStartingWeight=true;if(!item.note||/progress check-in/i.test(item.note))item.note='Starting Weight';}
        else if(item.isStartingWeight||/starting weight/i.test(item.note||'')){item.isStartingWeight=false;item.note='Progress Check-In';}
      });
    }
    localStorage.setItem(MAIN_KEY,JSON.stringify(main));
    saveExt();
  }catch(error){console.warn('Alpha 0.6.12 migration',error);}
}
migrate612();

/* ---------- 2. Better natural food units ---------- */
const oldUnitOptions=unitOptions;
const oldDefaultUnit=defaultUnit;
function addNaturalUnit(food,key,label,multiplier){
  if(!food||!Number.isFinite(multiplier)||multiplier<=0)return;
  food.units ||= {};
  food.unitLabels ||= {};
  if(food.units[key]===undefined)food.units[key]=multiplier;
  if(!food.unitLabels[key])food.unitLabels[key]=label;
}
function enrichNaturalUnits(food){
  if(!food)return food;
  const name=norm(`${food.name} ${food.brand||''}`), serving=norm(food.serving||'');
  const baseUnits=food.units||{};
  const gPerServe=baseUnits.g?1/baseUnits.g:0;
  const mlPerServe=baseUnits.mL?1/baseUnits.mL:0;
  if(/\bbanana\b/.test(name)&&baseUnits.item===undefined&&gPerServe)addNaturalUnit(food,'item','Medium Banana (about 118 g)',118/gPerServe);
  if(/\bapple\b/.test(name)&&baseUnits.item===undefined&&gPerServe)addNaturalUnit(food,'item','Medium Apple (about 182 g)',182/gPerServe);
  if(/\borange\b/.test(name)&&baseUnits.item===undefined&&gPerServe)addNaturalUnit(food,'item','Medium Orange (about 130 g)',130/gPerServe);
  if(/\bavocado\b/.test(name)&&gPerServe){if(baseUnits.half===undefined)addNaturalUnit(food,'half','Half Avocado (about 100 g)',100/gPerServe);}
  if(/\b(bar|protein bar|muesli bar|snack bar)\b/.test(name)&&baseUnits.serve!==undefined&&baseUnits.bar===undefined){addNaturalUnit(food,'bar',`Bar${gPerServe?` (${Math.round(gPerServe)} g)`:''}`,baseUnits.serve);}
  if(/\b(cappuccino|coffee mix|instant coffee|hot chocolate)\b/.test(name)&&gPerServe>0&&gPerServe<=60&&baseUnits.serve!==undefined&&baseUnits.sachet===undefined){addNaturalUnit(food,'sachet',`Sachet (${Number(gPerServe.toFixed(1))} g)`,baseUnits.serve);}
  if(/\b(yoghurt|yogurt)\b/.test(name)&&gPerServe&&gPerServe<=250&&baseUnits.tub===undefined)addNaturalUnit(food,'tub',`Tub (${Math.round(gPerServe)} g)`,1);
  if(/\b(bottle|drink)\b/.test(name)&&mlPerServe&&baseUnits.bottle===undefined)addNaturalUnit(food,'bottle',`Bottle (${Math.round(mlPerServe)} mL)`,1);
  if(/\b(can|canned|tinned)\b/.test(name)&&gPerServe&&baseUnits.can===undefined)addNaturalUnit(food,'can',`Can (${Math.round(gPerServe)} g)`,1);
  return food;
}
unitOptions=function(food){return enrichNaturalUnits(food)?.units||oldUnitOptions(food);};
defaultUnit=function(food){
  enrichNaturalUnits(food);
  const name=norm(`${food?.name||''} ${food?.brand||''}`);
  if(food?.units?.bar!==undefined&&/\bbar\b/.test(name))return 'bar';
  if(food?.units?.sachet!==undefined&&/cappuccino|coffee mix|instant coffee|hot chocolate/.test(name))return 'sachet';
  return oldDefaultUnit(food);
};

/* Enrich Open Food Facts results with package language where available. */
const oldMakeOFF=makeOpenFoodFactsFood;
makeOpenFoodFactsFood=function(product){
  const food=oldMakeOFF(product);
  food.packageQuantity=product.quantity||'';
  food.packagingText=product.packaging_text||'';
  const serving=String(product.serving_size||'');
  const qty=String(product.quantity||'');
  const combined=`${serving} ${qty} ${product.product_name||''} ${product.categories||''} ${(product.categories_tags||[]).join(' ')}`;
  const gPerServe=food.units?.g?1/food.units.g:0;
  const unitMatch=combined.match(/(?:^|\b)(?:1\s*)?(bar|sachet|packet|pouch|biscuit|cracker|slice|piece|tub|bottle|can|capsule|pod)\b/i);
  if(unitMatch&&food.units?.serve!==undefined){
    const key=norm(unitMatch[1]).replace(/\s/g,'');
    const label=unitMatch[1].charAt(0).toUpperCase()+unitMatch[1].slice(1).toLowerCase();
    addNaturalUnit(food,key,`${label}${gPerServe?` (${Number(gPerServe.toFixed(1))} g)`:''}`,1);
    food.defaultUnit=key; food.defaultAmount=1;
  }
  if(/\b(bar|bars|protein bars|cereal bars|snack bars)\b/i.test(combined)&&food.units?.serve!==undefined&&food.units.bar===undefined){addNaturalUnit(food,'bar',`Bar${gPerServe?` (${Number(gPerServe.toFixed(1))} g)`:''}`,1);food.defaultUnit='bar';food.defaultAmount=1;}
  const packMatch=qty.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(g|ml)/i);
  if(packMatch&&food.units?.serve!==undefined){
    const count=Number(packMatch[1]);
    if(count>1){food.packCount=count;food.packUnit=food.defaultUnit||'serve';}
  }
  enrichNaturalUnits(food);
  return food;
};

/* Make barcode lookup request the fields needed for natural package units. */
const originalFetch=window.fetch.bind(window);
window.fetch=function(input,init){
  if(typeof input==='string'&&input.includes('world.openfoodfacts.org/api/v2/product/')&&input.includes('fields=')){
    try{
      const url=new URL(input);const fields=(url.searchParams.get('fields')||'').split(',');
      ['quantity','product_quantity','product_quantity_unit','packaging_text','categories','categories_tags'].forEach(f=>{if(!fields.includes(f))fields.push(f);});
      url.searchParams.set('fields',fields.join(','));input=url.toString();
    }catch{}
  }
  return originalFetch(input,init);
};

/* ---------- 3. Search ranking: identity first, saved/verified first, common typo normalisation ---------- */
function searchNorm(value){
  return norm(value).replace(/\bcappucino\b/g,'cappuccino').replace(/\bcappacino\b/g,'cappuccino').replace(/\bcapuccino\b/g,'cappuccino');
}
const oldSearchRank=searchRank;
searchRank=function(food,query){
  const q=searchNorm(query);if(!q)return 1;
  enrichNaturalUnits(food);
  const name=searchNorm(food.name),brand=searchNorm(food.brand),aliases=(food.aliases||[]).map(searchNorm);
  let rank=oldSearchRank(food,q);
  if(name===q)rank=Math.max(rank,1600);
  else if(name.startsWith(q))rank=Math.max(rank,1450);
  else if(aliases.includes(q))rank=Math.max(rank,1425);
  const firstWord=name.split(' ')[0];
  if(firstWord===q)rank+=170;
  if(ext.savedFoodIds?.includes(food.id))rank+=500;
  if(food.source==='User Created'||food.brand==='My Recipe')rank+=360;
  if(food.country==='Australia')rank+=100;
  if(food.verified||ext.foodVerification?.[food.id]?.packageVerifiedAt)rank+=160;
  const flavourOnly=/gelato|ice cream|cake|dessert|chocolate|confection|flavour|flavor/.test(name)&&!name.startsWith(q);
  if(flavourOnly&&name.includes(q))rank-=350;
  return Math.max(0,rank);
};

/* ---------- 4. Profile-aware suggestion safety and preference ranking ---------- */
function splitPrefs(value){return String(value||'').split(/[,;\n]+/).map(part=>norm(part)).filter(s=>s.length>1);}
function containsAny(hay,terms){return terms.filter(t=>t&&hay.includes(t));}
foodSafety=function(food){
  const main=mainData(),d=main.dietary||{};
  const hay=norm([food?.name,food?.brand,food?.category,food?.ingredients,Array.isArray(food?.allergens)?food.allergens.join(' '):food?.allergens].filter(Boolean).join(' '));
  const restrictions=[...splitPrefs(d['food-allergies']),...splitPrefs(d['food-intolerances']),...splitPrefs(d['foods-never']),...splitPrefs(d['cultural-restrictions']),...splitPrefs(d['medical-restrictions']).filter(x=>/avoid|allerg|intoler|no |without|free/.test(x))];
  const direct=containsAny(hay,restrictions);
  if(direct.length)return {blocked:true,message:`Profile restriction match: ${direct.join(', ')}.`};
  const pattern=norm(d['eating-pattern']);
  const meat=/\b(beef|veal|lamb|pork|bacon|ham|chicken|turkey|duck|sausage|salami|meat)\b/.test(hay);
  const fish=/\b(fish|tuna|salmon|prawn|shrimp|seafood|sardine|cod|barramundi)\b/.test(hay);
  const animal=/\b(egg|milk|dairy|cheese|yoghurt|yogurt|cream|butter|honey)\b/.test(hay)||meat||fish;
  if(pattern==='vegetarian'&&(meat||fish))return {blocked:true,message:'Your Vegetarian eating pattern excludes this suggestion.'};
  if(pattern==='vegan'&&animal)return {blocked:true,message:'Your Vegan eating pattern excludes this suggestion.'};
  if(pattern==='pescatarian'&&meat)return {blocked:true,message:'Your Pescatarian eating pattern excludes this suggestion.'};
  if(pattern==='halal'&&/\b(pork|bacon|ham|prosciutto)\b/.test(hay))return {blocked:true,message:'Your Halal preference excludes this food.'};
  if(pattern==='kosher'&&/\b(pork|bacon|ham|shellfish|prawn|shrimp)\b/.test(hay))return {blocked:true,message:'Your Kosher preference excludes this food.'};
  return {blocked:false,message:''};
};
const oldPlannerCandidateScore=plannerCandidateScore;
plannerCandidateScore=function(suggestion,meal,target){
  let score=oldPlannerCandidateScore(suggestion,meal,target);
  const d=mainData().dietary||{};
  const love=splitPrefs(d['foods-love']),like=splitPrefs(d['foods-like']),dislike=splitPrefs(d['foods-dislike']);
  for(const item of suggestion.items||[]){
    const food=getFood(item.foodId),hay=norm(`${food?.name||''} ${food?.brand||''} ${food?.ingredients||''}`);
    if(containsAny(hay,love).length)score-=0.35;
    if(containsAny(hay,like).length)score-=0.16;
    if(containsAny(hay,dislike).length)score+=0.42;
  }
  return score;
};

/* ---------- 5. Voice/Text review gets editable amount + unit and understands quantities ---------- */
const oldParseVoice=parseVoice;
function spokenQuantity(text){
  const t=norm(text);const words={half:.5,a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
  const m=t.match(/^(half|a|an|one|two|three|four|five|six|seven|eight|nine|ten|\d+(?:\.\d+)?)\b/);return m?(Number(m[1])||words[m[1]]||1):1;
}
function spokenUnit(text){const t=norm(text);for(const [re,u] of [[/\bbars?\b/,'bar'],[/\bsachets?\b/,'sachet'],[/\bbiscuits?\b/,'biscuit'],[/\bslices?\b/,'slice'],[/\bbananas?\b/,'item'],[/\boranges?\b/,'item'],[/\bapples?\b/,'item'],[/\beggs?\b/,'item'],[/\bgrams?\b|\bg\b/,'g'],[/\bml\b|millilitres?|milliliters?/,'mL']])if(re.test(t))return u;return '';}
function searchTextWithoutQuantity(text){return norm(text).replace(/^(half|a|an|one|two|three|four|five|six|seven|eight|nine|ten|\d+(?:\.\d+)?)\s+/,'').replace(/\b(pieces?|bars?|sachets?|biscuits?|slices?|grams?|millilitres?|milliliters?)\b/g,' ').replace(/\s+/g,' ').trim();}
parseVoice=function(text){
  let parsed=oldParseVoice(text);
  const qty=spokenQuantity(text),askedUnit=spokenUnit(text);
  if(!parsed.items?.length){
    const query=searchTextWithoutQuantity(text).replace(/\b(add|log|record|please|for|to|my|the|breakfast|lunch|dinner|snacks?|other)\b/g,' ').replace(/\s+/g,' ').trim();
    const ranked=allFoods().filter(f=>f.category!=='Recipe').map(food=>({food,rank:searchRank(food,query)})).filter(x=>x.rank>=620).sort((a,b)=>b.rank-a.rank);
    if(ranked.length){const food=enrichNaturalUnits(ranked[0].food);let unit=askedUnit&&unitOptions(food)[askedUnit]!==undefined?askedUnit:defaultUnit(food);parsed.items=[{foodId:food.id,amount:qty||defaultAmount(food),unit,heard:String(text||'')}];}
  }else{
    parsed.items=parsed.items.map(item=>{const food=enrichNaturalUnits(getFood(item.foodId));let unit=askedUnit&&unitOptions(food)[askedUnit]!==undefined?askedUnit:item.unit;if(qty!==1||/^\s*(a|an|one|1)\b/i.test(String(text||'')))return {...item,amount:qty,unit};return item;});
  }
  return parsed;
};
renderVoiceReview=function(){
  el('voice-review')?.classList.remove('hidden');if(el('voice-meal'))el('voice-meal').value=voiceParsed.meal||'';
  const target=el('voice-review-items');if(!target)return;
  target.innerHTML=voiceParsed.items?.length?voiceParsed.items.map((item,index)=>{const food=enrichNaturalUnits(getFood(item.foodId)),values=scaledNutrients(food,item.amount,item.unit);return `<div class="voice-review-row voice-editable-row"><div class="voice-food-title"><strong>${safe(food.name)}</strong><small>${formatNumber(values.calories)} Cal</small></div><label>Amount<input type="number" min="0.1" step="0.1" value="${safe(item.amount)}" data-voice-amount="${index}"></label><label>Unit<select data-voice-unit="${index}">${Object.keys(unitOptions(food)).map(u=>`<option value="${safe(u)}" ${u===item.unit?'selected':''}>${safe(unitLabel(food,u))}</option>`).join('')}</select></label><button data-remove-voice-item="${index}" class="delete-action">Remove</button></div>`;}).join(''):`<p class="empty-state">No confident food match was identified. Correct the text or search the Food Library.</p>`;
};
document.addEventListener('input',event=>{const input=event.target.closest('[data-voice-amount]');if(!input)return;const i=Number(input.dataset.voiceAmount);if(voiceParsed.items?.[i]){voiceParsed.items[i].amount=Math.max(.1,Number(input.value)||1);renderVoiceReview();}});
document.addEventListener('change',event=>{const select=event.target.closest('[data-voice-unit]');if(!select)return;const i=Number(select.dataset.voiceUnit);if(voiceParsed.items?.[i]){voiceParsed.items[i].unit=select.value;voiceParsed.items[i].amount=1;renderVoiceReview();}});

/* ---------- 6. Daily Progress: remove redundant Recorded/Open Meal badges ---------- */
const oldRenderDailyProgress=renderDailyProgress;
renderDailyProgress=function(){oldRenderDailyProgress();document.querySelectorAll('#daily-meal-status .meal-progress-state').forEach(x=>x.remove());const copy=el('daily-meals-copy');if(copy)copy.textContent='Tap any meal to view, add or change its entries.';};

/* ---------- 7. Weight history repair + compact line graph ---------- */
function earliestWeight(){return [...(data.weightHistory||[])].filter(x=>x?.date&&Number(x.weightKg)>0).sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.recordedAt||'').localeCompare(String(b.recordedAt||'')))[0]||null;}
startingWeightRecord=function(){const start=earliestWeight();if(start){data.health.startingWeightDate=start.date;start.isStartingWeight=true;}return start;};
renderWeightHistoryOnly=function(){
  const history=[...(data.weightHistory||[])].filter(x=>x?.date&&Number(x.weightKg)>0).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.recordedAt||'').localeCompare(String(a.recordedAt||'')));
  const latest=latestApplicableWeightRecord(),start=startingWeightRecord(),change=latest&&start?roundWeight(Number(latest.weightKg)-Number(start.weightKg)):0;
  const summary=latest?`<div class="weight-history-summary"><div><span>Current Weight</span><strong>${safe(formatWeight(latest.weightKg))} kg</strong></div><div><span>Goal Weight</span><strong>${safe(formatWeight(data.health.selectedGoalWeight))} kg</strong></div><div><span>Change Since Start</span><strong>${change>0?'+':''}${safe(formatWeight(change))} kg</strong></div><div><span>Last Recorded</span><strong>${safe(friendlyWeightRelativeDate(latest.date))}</strong></div></div>`:'';
  const rows=items=>items.map(item=>`<button type="button" class="weight-history-row" data-edit-weight-date="${safe(item.date)}"><span><strong>${safe(friendlyWeightRelativeDate(item.date))}</strong><small>${safe(item.date===start?.date?'Starting Weight':(item.note||'Progress Check-In'))}</small></span><b>${safe(formatWeight(item.weightKg))} kg</b><em>Edit</em></button>`).join('');
  el('weight-history').innerHTML=history.length?`${summary}<h4>Recent Weight Entries</h4>${rows(history.slice(0,5))}${history.length>5?`<details class="weight-history-all"><summary>View All Weight History</summary>${rows(history.slice(5))}</details>`:''}`:'<div class="empty-state">No weight check-ins have been recorded yet.</div>';
  const details=el('weight-history')?.querySelector('.weight-history-all');if(details){const s=details.querySelector('summary');details.addEventListener('toggle',()=>{s.textContent=details.open?'Hide Weight History':'View All Weight History';});}
};
function lineWeightChart(weights){
  if(!weights.length)return '<p class="empty-state">Add Weight Check-Ins to build your weight trend.</p>';
  const vals=weights.map(x=>Number(x.weightKg)),rawMin=Math.min(...vals),rawMax=Math.max(...vals),spread=Math.max(.6,rawMax-rawMin),pad=Math.max(.3,spread*.18),min=Math.floor((rawMin-pad)*10)/10,max=Math.ceil((rawMax+pad)*10)/10,span=Math.max(.5,max-min);
  const W=680,H=310,L=60,R=20,T=28,B=58,plotW=W-L-R,plotH=H-T-B;
  const x=i=>weights.length===1?L+plotW/2:L+i*(plotW/(weights.length-1));const y=v=>T+(max-v)/span*plotH;
  const points=weights.map((w,i)=>`${x(i).toFixed(1)},${y(Number(w.weightKg)).toFixed(1)}`).join(' ');
  const ticks=4;let grid='';for(let i=0;i<=ticks;i++){const value=max-(span*i/ticks),yy=T+plotH*i/ticks;grid+=`<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" class="weight-grid-line"/><text x="${L-8}" y="${yy+4}" text-anchor="end" class="weight-axis-label">${value.toFixed(1)}</text>`;}
  const labelEvery=Math.max(1,Math.ceil(weights.length/6));const dateLabels=weights.map((w,i)=>{if(i%labelEvery&&i!==weights.length-1)return '';const label=new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short'}).format(new Date(`${w.date}T12:00:00`));return `<text x="${x(i)}" y="${H-20}" text-anchor="middle" class="weight-date-label">${safe(label)}</text>`;}).join('');
  const dots=weights.map((w,i)=>`<g class="weight-dot"><circle cx="${x(i)}" cy="${y(Number(w.weightKg))}" r="6" class="weight-trend-point" tabindex="0"><title>${safe(friendlyWeightRelativeDate(w.date))}: ${Number(w.weightKg).toFixed(1)} kg</title></circle>${(i===0||i===weights.length-1)?`<text x="${x(i)}" y="${Math.max(16,y(Number(w.weightKg))-12)}" text-anchor="middle" class="weight-point-label">${Number(w.weightKg).toFixed(1)}</text>`:''}</g>`).join('');
  return `<div class="weight-line-chart" role="img" aria-label="Weight trend from ${safe(formatDate(weights[0].date))} to ${safe(formatDate(weights[weights.length-1].date))}"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${grid}<polyline points="${points}" class="weight-trend-line"/>${dots}${dateLabels}<text x="15" y="${T+plotH/2}" class="weight-axis-title" transform="rotate(-90 15 ${T+plotH/2})">kg</text></svg></div><div class="weight-chart-summary"><strong>${Number(weights[weights.length-1].weightKg).toFixed(1)} kg</strong><span>${safe(friendlyWeightRelativeDate(weights[weights.length-1].date))}</span>${weights.length>1?`<small>Change in view: ${(Number(weights[weights.length-1].weightKg)-Number(weights[0].weightKg)>0?'+':'')}${(Number(weights[weights.length-1].weightKg)-Number(weights[0].weightKg)).toFixed(1)} kg</small>`:''}</div>`;
}
const oldRenderHistory=renderHistory;
renderHistory=function(period){
  oldRenderHistory(period);
  const days=period==='all'?null:Number(period),today=isoToday(),cutoff=days?shiftISO(today,-(days-1)):null;
  const weights=(mainData().weightHistory||[]).filter(x=>x?.date&&x.date<=today&&(!cutoff||x.date>=cutoff)&&Number(x.weightKg)>0).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(el('history-bars'))el('history-bars').innerHTML=lineWeightChart(weights);
};

/* ---------- 8. Completed food-entry transactions cannot be accidentally re-submitted ---------- */
const oldPrepareEntry=prepareEntry;
prepareEntry=function(food,opts={}){oldPrepareEntry(food,opts);if(editorState){editorState.transactionId=`tx-${Date.now()}-${Math.random().toString(36).slice(2)}`;editorState.completed=false;}const b=el('save-food-entry');if(b)b.disabled=false;const b2=el('save-food-entry-and-food');if(b2)b2.disabled=false;};
const oldSaveEditorEntry=saveEditorEntry;
saveEditorEntry=function(andSaveFood=false){
  if(editorState?.completed){showActionToast('This entry has already been added. Choose the food again if you intentionally want another serving.',null,5000);return;}
  const editing=!!editorState?.entryId;const beforeCount=Object.values(ext.diary||{}).reduce((sum,list)=>sum+(list?.length||0),0);oldSaveEditorEntry(andSaveFood);const afterCount=Object.values(ext.diary||{}).reduce((sum,list)=>sum+(list?.length||0),0);
  if(editorState&&!editing&&afterCount>beforeCount){editorState.completed=true;const b=el('save-food-entry');if(b){b.disabled=true;b.textContent='Added ✓';}const b2=el('save-food-entry-and-food');if(b2)b2.disabled=true;}
};

/* ---------- 9. Barcode/package verification metadata + compare path ---------- */
function markFoodVerified(foodId,method='package'){if(!foodId)return;ext.foodVerification[foodId]={...(ext.foodVerification[foodId]||{}),packageVerifiedAt:new Date().toISOString(),method};saveExt();}
const oldToggleSavedFood=toggleSavedFood;
toggleSavedFood=function(id){const wasSaved=ext.savedFoodIds.includes(id);oldToggleSavedFood(id);if(!wasSaved){const f=getFood(id);if(f?.barcode)ext.foodVerification[id] ||= {savedAt:new Date().toISOString(),method:'barcode-online'};saveExt();}};
function compareNutrients(food,parsed){
  const panel=parsed?.perServing||{},online=food?.nutrients||{};const keys=[['calories','Calories','Cal'],['protein','Protein','g'],['carbs','Carbohydrate','g'],['fat','Fat','g'],['satFat','Saturated Fat','g'],['fibre','Fibre','g'],['sugar','Sugars','g'],['sodium','Sodium','mg']];
  return keys.filter(([k])=>Number.isFinite(Number(panel[k]))&&Number(panel[k])>0).map(([k,label,unit])=>{const a=Number(online[k]||0),b=Number(panel[k]||0),diff=b-a,pct=a?Math.abs(diff)/Math.abs(a)*100:Infinity;return {k,label,unit,online:a,panel:b,diff,pct,close:pct<=5||Math.abs(diff)<(k==='sodium'?5:.2)};});
}
document.addEventListener('click',event=>{if(!event.target.closest('[data-compare-barcode-panel]'))return;const id=event.target.closest('[data-compare-barcode-panel]').dataset.compareBarcodePanel;ext.ui.compareBarcodeFoodId=id;ext.ui.scanMode='label';saveExt();updateScanModeUI();el('label-tools')?.scrollIntoView({behavior:'smooth',block:'start'});showActionToast('Photograph the package Nutrition Information Panel. The Companion will compare it with the barcode record.',null,5000);});
const oldLookupBarcodeProduct=lookupBarcodeProduct;
lookupBarcodeProduct=async function(code){const food=await oldLookupBarcodeProduct(code);if(food&&el('scan-food-preview')){el('scan-food-preview').insertAdjacentHTML('beforeend',`<button type="button" class="secondary wide compare-package-button" data-compare-barcode-panel="${safe(food.id)}">Compare With Nutrition Panel</button>`);}return food;};
const oldFillOcrReview=fillOcrReview;
fillOcrReview=function(parsed,basis=parsed?.basis||'serving'){
  oldFillOcrReview(parsed,basis);
  const id=ext.ui.compareBarcodeFoodId;if(!id||basis!=='serving')return;const food=getFood(id);if(!food)return;const rows=compareNutrients(food,parsed),box=el('ocr-review');if(!box)return;
  const differences=rows.filter(r=>!r.close);box.querySelector('.barcode-panel-comparison')?.remove();
  box.insertAdjacentHTML('afterbegin',`<div class="barcode-panel-comparison status-box"><strong>${differences.length?'Package Comparison — Review Differences':'Package Information Matches Closely ✓'}</strong><div class="compare-table">${rows.map(r=>`<div class="${r.close?'match':'difference'}"><span>${safe(r.label)}</span><b>${formatNumber(r.online,true)} ${r.unit}</b><span>→</span><b>${formatNumber(r.panel,true)} ${r.unit}</b></div>`).join('')}</div><div class="quick-action-row"><button type="button" class="secondary" data-keep-barcode-values="${safe(id)}">Keep Barcode Values</button><button type="button" class="primary" data-use-package-values="${safe(id)}">Use Package Values</button></div></div>`);
};
document.addEventListener('click',event=>{
  const keep=event.target.closest('[data-keep-barcode-values]'),use=event.target.closest('[data-use-package-values]');if(!keep&&!use)return;const id=(keep||use).dataset.keepBarcodeValues||(keep||use).dataset.usePackageValues;const food=getFood(id);if(!food)return;
  if(use&&ocrParsedPanel?.perServing){food.nutrients={...food.nutrients,...ocrParsedPanel.perServing};if(ocrParsedPanel.servingAmount){food.serving=`${formatNumber(ocrParsedPanel.servingAmount,true)} ${ocrParsedPanel.servingUnit}`;food.units={serve:1,[ocrParsedPanel.servingUnit]:1/ocrParsedPanel.servingAmount};food.unitLabels={serve:`Serve (${food.serving})`,[ocrParsedPanel.servingUnit]:ocrParsedPanel.servingUnit};enrichNaturalUnits(food);}upsertOnlineFoods([food]);}
  markFoodVerified(id,use?'nutrition-panel':'barcode-package-check');ext.ui.compareBarcodeFoodId='';saveExt();showActionToast(use?'Package values saved for this food.':'Barcode values kept and verification date recorded.',null,3000);renderScanSelect();
});

/* ---------- 10. Periodic re-verification prompt ---------- */
function staleSavedFoods(){const now=Date.now();return (ext.savedFoodIds||[]).map(id=>({id,food:getFood(id),meta:ext.foodVerification?.[id]})).filter(x=>x.food&&(x.food.barcode||x.meta?.method)).filter(x=>{const stamp=x.meta?.packageVerifiedAt||x.meta?.savedAt;return stamp&&(now-new Date(stamp).getTime())>180*DAY_MS;});}
function maybePromptFoodReview(){const stale=staleSavedFoods();if(!stale.length)return;const last=Number(ext.ui.lastFoodReviewPromptAt||0);if(Date.now()-last<30*DAY_MS)return;ext.ui.lastFoodReviewPromptAt=Date.now();saveExt();setTimeout(()=>{openModal('Review Saved Package Foods?',`${stale.length} saved ${stale.length===1?'food has':'foods have'} not been checked against a package for more than six months. Manufacturers sometimes change recipes or serving sizes.`,'Review Saved Foods',()=>{ext.ui.libraryTab='saved';ext.ui.foodSearch='';saveExt();openFeature('food-library');showActionToast('Open a saved packaged food, then scan its barcode or compare its current Nutrition Panel.',null,5000);},`<p>You can keep using these foods. Nothing expires automatically.</p><ul class="compact-list">${stale.slice(0,6).map(x=>`<li>${safe(x.food.name)}</li>`).join('')}</ul>`);const cancel=el('a05-modal-cancel');if(cancel)cancel.textContent='Remind Me Later';},1200);}

/* ---------- 11. Sharing foods, meals, recipes now via a portable HEC package ---------- */
function downloadBlob(name,blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function sharePackage(payload,label){const text=JSON.stringify(payload,null,2),file=new File([text],`${label.replace(/[^a-z0-9]+/gi,'_')}.hec.json`,{type:'application/json'});if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:`Healthy Eating Companion — ${label}`,text:'Shared from Healthy Eating Companion',files:[file]});return;}catch(e){if(e?.name==='AbortError')return;}}downloadBlob(file.name,file);showActionToast('Share package prepared. Send the file to the other Companion user.',null,4000);}
function foodSharePayload(id){const food=getFood(id);if(!food)return null;return {format:'HEC-SHARE-1',kind:'food',sharedAt:new Date().toISOString(),item:clone(food),verification:clone(ext.foodVerification?.[id]||{})};}
function recipeSharePayload(id){const r=ext.recipes.find(x=>x.id===id);return r?{format:'HEC-SHARE-1',kind:'recipe',sharedAt:new Date().toISOString(),item:clone(r)}:null;}
function mealSharePayload(id){const m=ext.mealTemplates.find(x=>x.id===id);return m?{format:'HEC-SHARE-1',kind:'meal',sharedAt:new Date().toISOString(),item:clone(m)}:null;}
const oldShowFoodDetails=showFoodDetails;
showFoodDetails=function(id){oldShowFoodDetails(id);const food=getFood(id),meta=ext.foodVerification?.[id];const extra=el('a05-modal-extra');if(extra&&meta&&!extra.querySelector('.food-verification-detail')){const stamp=meta.packageVerifiedAt||meta.savedAt;extra.insertAdjacentHTML('beforeend',`<p class="fine food-verification-detail"><strong>Package Record:</strong> ${meta.packageVerifiedAt?'Package Verified':'Barcode/Panel Saved'}${stamp?` · Last checked ${safe(new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short',year:'numeric'}).format(new Date(stamp)))}`:''}</p>`);}if(!ext.savedFoodIds.includes(id)&&!food?.barcode)return;if(extra&&!extra.querySelector('[data-share-food]'))extra.insertAdjacentHTML('beforeend',`<button type="button" class="secondary wide" data-share-food="${safe(id)}">Share This Food</button>`);};
const oldRenderMealLibrary=renderMealLibrary;
renderMealLibrary=function(query=''){oldRenderMealLibrary(query);document.querySelectorAll('[data-meal-add]').forEach(btn=>{const row=btn.closest('.resource-row');if(!row||row.querySelector('[data-share-meal]'))return;row.insertAdjacentHTML('beforeend',`<button class="resource-share" type="button" data-share-meal="${safe(btn.dataset.mealAdd)}" aria-label="Share saved meal">↗</button>`);});};
const oldRenderRecipeLibrary=renderRecipeLibrary;
renderRecipeLibrary=function(query=''){oldRenderRecipeLibrary(query);for(const r of ext.recipes){const row=document.querySelector(`[data-food-details="${CSS.escape(r.id)}"]`)?.closest('.resource-row');if(row&&!row.querySelector('[data-share-recipe]'))row.insertAdjacentHTML('beforeend',`<button class="resource-share" type="button" data-share-recipe="${safe(r.id)}" aria-label="Share recipe">↗</button>`);}};
document.addEventListener('click',event=>{const f=event.target.closest('[data-share-food]'),m=event.target.closest('[data-share-meal]'),r=event.target.closest('[data-share-recipe]');if(f){const p=foodSharePayload(f.dataset.shareFood);if(p)sharePackage(p,p.item.name);return;}if(m){const p=mealSharePayload(m.dataset.shareMeal);if(p)sharePackage(p,p.item.name);return;}if(r){const p=recipeSharePayload(r.dataset.shareRecipe);if(p)sharePackage(p,p.item.name);return;}});
function installSharingImportUI(){const page=document.querySelector('#family-connections main');if(!page||el('hec-share-import'))return;page.insertAdjacentHTML('beforeend',`<div class="card"><h3>Share Foods, Meals & Recipes</h3><p>Portable Companion share files let another user copy an item into their own private library without sharing your Diary, weight or profile.</p><label class="secondary file-button">Import A Shared Companion Item<input id="hec-share-import" type="file" accept="application/json,.json" hidden></label><p id="hec-share-import-status" class="fine"></p></div><div class="card"><h3>My Devices</h3><p><strong>Automatic iPhone/iPad sync needs the future secure cloud account service.</strong> Until that service is connected, use a full backup file to move a current copy between devices.</p><button id="share-full-device-copy" class="secondary" type="button">Share A Full Device Copy</button><label class="secondary file-button">Restore A Full Device Copy<input id="restore-full-device-copy" type="file" accept="application/json,.json" hidden></label><p class="fine">This is a manual transfer, not live automatic sync. Restoring replaces the data on this device.</p></div>`);
  el('hec-share-import')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const p=JSON.parse(await file.text());if(p.format!=='HEC-SHARE-1')throw new Error('Not a Companion share file');if(p.kind==='food'){const item=p.item;item.id=`shared-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;item.source=`Shared Copy · ${item.source||''}`;ext.customFoods.push(item);ext.savedFoodIds.push(item.id);if(p.verification)ext.foodVerification[item.id]=p.verification;}else if(p.kind==='recipe'){const item=p.item;item.id=`recipe-${Date.now().toString(36)}`;ext.recipes.push(item);}else if(p.kind==='meal'){const item=p.item;item.id=`meal-${Date.now().toString(36)}`;ext.mealTemplates.push(item);}else throw new Error('Unsupported shared item');ext.sharedImports.unshift({kind:p.kind,name:p.item?.name||'Shared item',importedAt:new Date().toISOString()});saveExt();el('hec-share-import-status').textContent=`${p.item?.name||'Item'} copied into this Companion.`;}catch(err){el('hec-share-import-status').textContent=`Could not import: ${err.message}`;}finally{e.target.value='';}});
  el('share-full-device-copy')?.addEventListener('click',async()=>{const payload={format:'HEC-BACKUP-1',version:BUILD,exportedAt:new Date().toISOString(),profile:JSON.parse(localStorage.getItem(MAIN_KEY)||'{}'),functional:JSON.parse(localStorage.getItem(EXT_KEY)||'{}')};await sharePackage(payload,'Healthy Eating Companion Device Copy');});
  el('restore-full-device-copy')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const p=JSON.parse(await file.text());if(!p.profile||!p.functional)throw new Error('Not a complete Companion backup');if(!confirm('Replace the Companion data on this device with this backup?'))return;localStorage.setItem(MAIN_KEY,JSON.stringify(p.profile));localStorage.setItem(EXT_KEY,JSON.stringify(p.functional));location.reload();}catch(err){alert(`Could not restore: ${err.message}`);}finally{e.target.value='';}});
}
installSharingImportUI();

/* ---------- 12. Stronger local persistence mirror (normal browsing); warn about Private Browsing ---------- */
const DB_NAME='HEC-Persistent-Mirror';
function openMirror(){return new Promise((resolve,reject)=>{if(!indexedDB)return reject(new Error('IndexedDB unavailable'));const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('kv'))req.result.createObjectStore('kv');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function mirrorWrite(){try{const db=await openMirror(),tx=db.transaction('kv','readwrite'),s=tx.objectStore('kv');s.put(localStorage.getItem(MAIN_KEY)||'',MAIN_KEY);s.put(localStorage.getItem(EXT_KEY)||'',EXT_KEY);s.put(new Date().toISOString(),'savedAt');await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});db.close();}catch{}}
async function mirrorRestoreIfNeeded(){try{const current=JSON.parse(localStorage.getItem(MAIN_KEY)||'{}');if(current.completed)return false;const db=await openMirror(),tx=db.transaction('kv','readonly'),s=tx.objectStore('kv'),get=k=>new Promise((res,rej)=>{const r=s.get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});const mainRaw=await get(MAIN_KEY),extRaw=await get(EXT_KEY);db.close();if(mainRaw){const m=JSON.parse(mainRaw);if(m.completed){localStorage.setItem(MAIN_KEY,mainRaw);if(extRaw)localStorage.setItem(EXT_KEY,extRaw);location.reload();return true;}}}catch{}return false;}
window.addEventListener('pagehide',mirrorWrite);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')mirrorWrite();});setInterval(mirrorWrite,2500);
navigator.storage?.persist?.().catch(()=>{});
mirrorRestoreIfNeeded();mirrorWrite();
function addPersistenceNotice(){
  if(el('hec-private-storage-note'))return;const host=document.querySelector('#settings main')||document.querySelector('#welcome .welcome-card');if(!host)return;host.insertAdjacentHTML('afterbegin',`<div id="hec-private-storage-note" class="status-box storage-safety-note"><strong>Saving Your Companion Data</strong><p>Use Healthy Eating Companion in a normal Safari tab or Home Screen app. <strong>Private Browsing can delete website data when private tabs are closed</strong>, which no website can override. Alpha 0.6.12 also keeps a second local IndexedDB mirror when the browser allows it.</p></div>`);
}
addPersistenceNotice();

/* ---------- 13. Onboarding/profile future connection architecture (hidden for now) ---------- */
try{const main=mainData();main.futureConnections ||= {health:{appleHealth:false,healthConnect:false,wearables:false},sharing:{household:false,communityFoods:false},social:{enabled:false,providers:[]}};localStorage.setItem(MAIN_KEY,JSON.stringify(main));}catch{}

/* ---------- 14. Scan/saved-food verification metadata ---------- */
document.addEventListener('click',event=>{const addSave=event.target.closest('#save-food-entry-and-food');if(!addSave||!editorState?.foodId)return;const f=getFood(editorState.foodId);if(f?.barcode)setTimeout(()=>{ext.foodVerification[f.id]={...(ext.foodVerification[f.id]||{}),savedAt:new Date().toISOString(),method:'barcode-online'};saveExt();},50);});

/* ---------- 15. Simplify Progress History period controls ---------- */
const period=document.querySelector('.history-period');if(period){period.innerHTML='<button data-period="7">7 Days</button><button data-period="30" class="active">30 Days</button><button data-period="90">3 Months</button><button data-period="365">1 Year</button><button data-period="all">All</button>';period.addEventListener('click',event=>{const b=event.target.closest('[data-period]');if(!b)return;period.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));renderHistory(b.dataset.period);});}

/* ---------- 16. UI copy / version ---------- */
document.querySelectorAll('.badge').forEach(b=>{if(/Founder Trial/.test(b.textContent))b.textContent=`Founder Trial · Alpha ${BUILD}`;});
if(document.title.includes('Founder Trial'))document.title=`Healthy Eating Companion — Founder Trial Alpha ${BUILD}`;
setTimeout(()=>{if(mainData().completed)maybePromptFoodReview();if(document.querySelector('#weight-history'))renderWeightHistoryOnly();if(document.querySelector('#progress-history.active'))renderHistory(currentPeriod());},300);


init();
})();
