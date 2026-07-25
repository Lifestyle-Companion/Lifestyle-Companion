(() => {
"use strict";

const MAIN_KEY = "healthyEatingAlpha05";
const EXT_KEY = "healthyEatingAlpha05Functional";
const OLD_EXT_KEY = "healthyEatingAlpha04Extensions";
const by = id => document.getElementById(id);
const q = selector => document.querySelector(selector);
const qa = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const n = value => Number(value) || 0;
const round1 = value => Math.round((Number(value) || 0) * 10) / 10;
const whole = value => Math.round(Number(value) || 0);
const isoToday = () => new Date().toISOString().slice(0,10);
const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const clone = value => JSON.parse(JSON.stringify(value));
const formatDate = value => value ? new Intl.DateTimeFormat("en-AU", {weekday:"short", day:"numeric", month:"short", year:"numeric"}).format(new Date(value + "T12:00:00")) : "";
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
const FOOD_BY_ID = new Map(FOODS.map(f => [f.id,f]));

const MEAL_SUGGESTIONS = [
  {id:"suggest-breakfast-1",name:"Weet-Bix, Light Milk & Berries",meal:"Breakfast",score:8,reason:"Wholegrain cereal, fibre, fruit and dairy protein.",items:[{foodId:"weetbix-au",amount:2,unit:"biscuit"},{foodId:"light-milk-au",amount:200,unit:"mL"},{foodId:"berries",amount:100,unit:"g"}]},
  {id:"suggest-breakfast-2",name:"Eggs on Wholemeal Toast",meal:"Breakfast",score:8,reason:"Balanced protein and wholegrain carbohydrate.",items:[{foodId:"egg",amount:2,unit:"item"},{foodId:"wholemeal-bread",amount:2,unit:"slice"},{foodId:"baby-carrot",amount:62,unit:"g"}]},
  {id:"suggest-lunch-1",name:"Chicken & Salad Lunch",meal:"Lunch",score:9,reason:"Lean protein, vegetables and a high-volume salad.",items:[{foodId:"chicken-breast",amount:120,unit:"g"},{foodId:"salad",amount:200,unit:"g"},{foodId:"avocado",amount:50,unit:"g"}]},
  {id:"suggest-lunch-2",name:"Tuna & Wholemeal Sandwich",meal:"Lunch",score:7,reason:"Convenient protein with wholemeal bread; sodium is worth checking.",items:[{foodId:"tuna",amount:95,unit:"g"},{foodId:"wholemeal-bread",amount:2,unit:"slice"},{foodId:"salad",amount:100,unit:"g"}]},
  {id:"suggest-dinner-1",name:"Chicken, Potato & Broccoli",meal:"Dinner",score:9,reason:"A straightforward balanced plate with lean protein and vegetables.",items:[{foodId:"chicken-breast",amount:150,unit:"g"},{foodId:"potato",amount:180,unit:"g"},{foodId:"broccoli",amount:150,unit:"g"}]},
  {id:"suggest-dinner-2",name:"Beef Rissole & Vegetables",meal:"Dinner",score:7,reason:"A familiar Australian dinner; a saved homemade recipe will improve accuracy.",items:[{foodId:"beef-rissole",amount:1,unit:"item"},{foodId:"potato",amount:150,unit:"g"},{foodId:"broccoli",amount:150,unit:"g"}]},
  {id:"suggest-snack-1",name:"Greek Yoghurt & Berries",meal:"Afternoon Tea",score:8,reason:"Protein, calcium and fruit in a practical snack.",items:[{foodId:"greek-yoghurt",amount:170,unit:"g"},{foodId:"berries",amount:100,unit:"g"}]},
  {id:"suggest-snack-2",name:"Apple",meal:"Morning Smoko",score:8,reason:"Simple fruit snack with fibre.",items:[{foodId:"apple",amount:1,unit:"item"}]}
];

const EXT_DEFAULTS = {
  version:"0.5", diary:{}, daySettings:{}, water:{}, steps:{}, dailyNotes:{}, exercise:[], shopping:[],
  family:{enabled:false,name:"",email:""}, connections:{}, customFoods:[], savedFoodIds:[], recipes:[], mealTemplates:[],
  ui:{diaryDate:isoToday(), libraryTab:"all", scanMode:"food"}
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
  if(current) return merge(clone(EXT_DEFAULTS),current);
  try {
    const legacy = JSON.parse(localStorage.getItem(OLD_EXT_KEY));
    if(legacy){
      const migrated = merge(clone(EXT_DEFAULTS),legacy);
      if(legacy.daily?.date){
        migrated.water[legacy.daily.date] = legacy.daily.water || 0;
        migrated.steps[legacy.daily.date] = legacy.daily.steps || 0;
      }
      return migrated;
    }
  } catch {}
  return clone(EXT_DEFAULTS);
}
const ext = loadExt();
const saveExt = () => localStorage.setItem(EXT_KEY,JSON.stringify(ext));

function allFoods(){
  const custom = (ext.customFoods || []).map(f => ({...f,source:f.source || "User Created",verified:false}));
  const recipes = (ext.recipes || []).map(r => recipeAsFood(r));
  return [...FOODS,...custom,...recipes];
}
function getFood(id){ return allFoods().find(f => f.id === id); }
function unitOptions(food){ return food?.units || {serving:1}; }
function defaultAmount(food){ return food?.defaultAmount ?? 1; }
function defaultUnit(food){ return food?.defaultUnit || Object.keys(unitOptions(food))[0] || "serving"; }
function unitLabel(food,unit){ return food?.unitLabels?.[unit] || unit; }
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
function sumNutrients(items){
  const totals = {...ZERO_NUTRIENTS};
  items.forEach(item => NUTRIENT_KEYS.forEach(key => { if(item?.nutrients?.[key] !== null && item?.nutrients?.[key] !== undefined) totals[key] += Number(item.nutrients[key]) || 0; }));
  return totals;
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
function recipeAsFood(recipe){
  return {id:recipe.id,name:recipe.name,brand:"My Recipe",category:"Recipe",country:"Australia",aliases:[recipe.name],defaultAmount:1,defaultUnit:"serve",units:{serve:1},unitLabels:{serve:"recipe serving"},serving:`1 of ${recipe.servings} servings`,nutrients:recipe.perServe,score:recipe.score || 7,source:"User Recipe",verified:false,ingredients:recipe.ingredients.map(i => i.name).join(", "),allergens:[]};
}
function currentGoals(date=isoToday()){
  const main = mainData();
  const r = main.recommendations || {};
  const energy = main.personal?.energyUnit === "Cal" ? n(r.energyKj)/4.184 : n(r.energyKj)/4.184;
  const settings = ext.daySettings[date] || {};
  const exerciseCredit = (ext.exercise || []).filter(x => x.date?.slice(0,10) === date).reduce((sum,x) => sum + n(x.credit),0);
  const calTarget = n(settings.targetCal) || whole(energy) || 2000;
  return {calories:calTarget + exerciseCredit,baseCalories:calTarget,exerciseCredit,water:n(r.waterMl)||2200,protein:n(r.protein)||100,fat:n(r.fat)||70,carbs:n(r.carbs)||250,fibre:30,sugar:50,sodium:2000,steps:10000};
}
function entriesForDate(date){ return ext.diary[date] || []; }
function dayNutrition(date,statuses=["eaten"]){ return sumNutrients(entriesForDate(date).filter(e => statuses.includes(e.status))); }
function daySummary(date){
  const nutrients = dayNutrition(date,["eaten"]);
  const planned = dayNutrition(date,["planned"]);
  return {nutrients,planned,water:n(ext.water[date]),steps:n(ext.steps[date]),goals:currentGoals(date)};
}

function openFeature(id){
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

function shiftISO(date,days){ const d = new Date((date || isoToday()) + "T12:00:00"); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
function mealNames(){ return ["Breakfast","Morning Smoko","Lunch","Afternoon Tea","Dinner","Supper","Other"]; }
function statusLabel(status){ return status === "planned" ? "Planned" : "Eaten / Drunk"; }

function renderHomeSummary(){
  if(!by("a05-home-summary")) return;
  const date = isoToday();
  const {nutrients,water,steps,goals} = daySummary(date);
  by("a05-home-date").textContent = formatDate(date);
  const settings = ext.daySettings[date];
  by("a05-home-context").textContent = settings?.type === "fasting" ? `Flexible fasting day · ${goals.baseCalories} Cal target` : "Your live progress comes directly from your diary entries.";
  const cards = [
    ["Energy",nutrients.calories,goals.calories,"Cal",false],["Protein",nutrients.protein,goals.protein,"g",false],
    ["Water",water,goals.water,"mL",false],["Steps",steps,goals.steps,"",false]
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

// Diary and entries
function diaryDate(){ return by("diary-date")?.value || ext.ui.diaryDate || isoToday(); }
function renderDiary(){
  const dateInput = by("diary-date");
  if(!dateInput) return;
  dateInput.value = ext.ui.diaryDate || isoToday();
  const date = dateInput.value;
  ext.ui.diaryDate = date;
  saveExt();
  const goals = currentGoals(date);
  const settings = ext.daySettings[date] || {type:"normal",targetCal:goals.baseCalories};
  by("day-type").value = settings.type || "normal";
  by("day-cal-target").value = n(settings.targetCal) || goals.baseCalories;
  by("day-settings-note").textContent = settings.type === "fasting" ? "This is a flexible fasting day for this date only. Change the target whenever your plan changes." : "Normal day. Exercise calorie credit is shown separately and only added according to your selected preference.";
  const summary = daySummary(date);
  by("diary-day-summary").innerHTML = [
    ["Energy Eaten",summary.nutrients.calories,summary.goals.calories,"Cal","energy"],
    ["Protein",summary.nutrients.protein,summary.goals.protein,"g","positive"],
    ["Fibre",summary.nutrients.fibre,summary.goals.fibre,"g","positive"],
    ["Sodium",summary.nutrients.sodium,summary.goals.sodium,"mg","limit"]
  ].map(x => progressCard(...x,date)).join("");
  const entries = entriesForDate(date);
  by("diary-meals").innerHTML = mealNames().map(meal => {
    const mealEntries = entries.filter(e => e.meal === meal);
    const totals = sumNutrients(mealEntries.filter(e => e.status === "eaten"));
    return `<section class="card meal-section"><div class="meal-heading"><div><h3>${esc(meal)}</h3><p>${mealEntries.length ? `${mealEntries.length} ${mealEntries.length === 1 ? "entry" : "entries"} · ${formatNumber(totals.calories)} Cal eaten` : "Nothing planned or logged yet."}</p></div><div class="quick-action-row"><button data-add-to-meal="${esc(meal)}" class="secondary">Add Food</button>${mealEntries.length ? `<button data-save-meal-template="${esc(meal)}" class="secondary">Save This Meal</button>` : ""}</div></div><div class="meal-entry-list">${mealEntries.length ? mealEntries.map(entryCard).join("") : `<div class="empty-state">Use Add Food, Voice or Text Log, or Meal Planner.</div>`}</div></section>`;
  }).join("");
}
function entryCard(entry){
  const source = entry.source || "Diary Entry";
  const score = n(entry.score) || 0;
  return `<article class="diary-entry ${entry.status === "planned" ? "planned-entry" : ""}" data-entry-id="${esc(entry.id)}"><div class="entry-main"><span class="entry-icon">${entry.status === "planned" ? "🗓️" : "✓"}</span><div><strong>${esc(entry.name)}</strong><small>${formatNumber(entry.amount,true)} ${esc(entry.unitLabel || entry.unit)} · ${statusLabel(entry.status)} · ${formatNumber(entry.nutrients.calories)} Cal</small><p>${esc(source)}${score ? ` · Health Score ${score}/10` : ""}</p></div></div><div class="entry-actions">${entry.status === "planned" ? `<button data-entry-eaten="${esc(entry.id)}" class="primary small-action">Mark Eaten</button>` : ""}<button data-entry-edit="${esc(entry.id)}">Edit</button><button data-entry-copy="${esc(entry.id)}">Copy</button><button data-entry-delete="${esc(entry.id)}" class="delete-action">Delete</button></div></article>`;
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
  if(!food) return;
  const defaultDate = date || ext.ui.diaryDate || isoToday();
  const now = new Date();
  editorState = {foodId:food.id,entryId:entry?.id || null,returnTo:"food-diary",source:source || food.source};
  by("entry-editor-title").textContent = entry ? `Edit ${entry.name}` : `Review ${food.name}`;
  by("entry-date").value = entry?.date || defaultDate;
  by("entry-meal").value = entry?.meal || meal || "Breakfast";
  by("entry-status").value = entry?.status || status;
  by("entry-amount").value = entry?.amount ?? defaultAmount(food);
  by("entry-time").value = entry?.time || `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  by("entry-notes").value = entry?.notes || "";
  by("entry-unit").innerHTML = Object.keys(unitOptions(food)).map(unit => `<option value="${esc(unit)}">${esc(unitLabel(food,unit))}</option>`).join("");
  by("entry-unit").value = entry?.unit || defaultUnit(food);
  const safety = foodSafety(food);
  by("entry-source-warning").innerHTML = `<strong>${food.verified ? "Verified Trial Source" : "Review the Source"}</strong><p>${esc(food.source || "Source not supplied")}. ${safety.blocked ? `<b class="danger-text">${esc(safety.message)}</b>` : "Check the quantity and details before adding."}</p>`;
  by("save-food-entry").textContent = entry ? "Save Changes" : (status === "planned" ? "Add to Plan" : "Add to Diary");
  by("save-food-entry-and-food").classList.toggle("hidden",entry || ext.savedFoodIds.includes(food.id));
  updateEntryPreview();
  openFeature("food-entry-editor");
}
function updateEntryPreview(){
  if(!editorState) return;
  const food = getFood(editorState.foodId);
  if(!food) return;
  const values = scaledNutrients(food,by("entry-amount").value,by("entry-unit").value);
  by("entry-nutrition-preview").innerHTML = `<div class="food-detail-title"><div><h3>${esc(food.name)}</h3><p>${esc(food.brand || "")} · ${esc(food.serving || "")}</p></div><span class="health-score score-${Math.min(10,whole(food.score))}">${whole(food.score)}/10</span></div>${nutritionCards(values)}<p class="fine"><strong>Why this score:</strong> ${esc(scoreExplanation(food.score))}</p>`;
}
by("entry-amount")?.addEventListener("input",updateEntryPreview);
by("entry-unit")?.addEventListener("change",updateEntryPreview);
by("entry-editor-back")?.addEventListener("click",() => openFeature(editorState?.returnTo || "food-library"));
function saveEditorEntry(andSaveFood=false){
  const food = getFood(editorState?.foodId);
  if(!food) return;
  const amount = n(by("entry-amount").value);
  const unit = by("entry-unit").value;
  if(amount <= 0){ showActionToast("Enter an amount greater than zero."); return; }
  const date = by("entry-date").value || isoToday();
  const values = scaledNutrients(food,amount,unit);
  const record = {
    id:editorState.entryId || uid("entry"),foodId:food.id,name:food.name,brand:food.brand || "",date,meal:by("entry-meal").value,status:by("entry-status").value,
    amount,unit,unitLabel:unitLabel(food,unit),time:by("entry-time").value,notes:by("entry-notes").value,nutrients:values,score:food.score,source:editorState.source || food.source,createdAt:new Date().toISOString()
  };
  if(editorState.entryId){
    const found = findEntry(editorState.entryId);
    if(found){ ext.diary[found.date].splice(found.index,1); if(!ext.diary[found.date].length) delete ext.diary[found.date]; }
  }
  addEntry(record);
  if(andSaveFood && !ext.savedFoodIds.includes(food.id)) ext.savedFoodIds.push(food.id);
  ext.ui.diaryDate = date;
  saveExt();
  showActionToast(`${food.name} ${editorState.entryId ? "updated" : record.status === "planned" ? "added to the plan" : "added to the diary"}.`,null,6500);
  openFeature("food-diary");
}
by("save-food-entry")?.addEventListener("click",() => saveEditorEntry(false));
by("save-food-entry-and-food")?.addEventListener("click",() => saveEditorEntry(true));

by("diary-date")?.addEventListener("change",() => {ext.ui.diaryDate=by("diary-date").value;saveExt();renderDiary();});
by("diary-today")?.addEventListener("click",() => {ext.ui.diaryDate=isoToday();saveExt();renderDiary();});
document.addEventListener("click",event => {
  const shift = event.target.closest("[data-diary-shift]");
  if(shift){ ext.ui.diaryDate=shiftISO(diaryDate(),n(shift.dataset.diaryShift));saveExt();renderDiary();return; }
  const add = event.target.closest("[data-add-to-meal]");
  if(add){ ext.ui.pendingMeal=add.dataset.addToMeal;ext.ui.libraryTab="all";saveExt();openFeature("food-library");return; }
  const edit = event.target.closest("[data-entry-edit]");
  if(edit){ const found=findEntry(edit.dataset.entryEdit); if(found) prepareEntry(getFood(found.entry.foodId) || snapshotFood(found.entry),{entry:found.entry}); return; }
  const eaten = event.target.closest("[data-entry-eaten]");
  if(eaten){ const found=findEntry(eaten.dataset.entryEaten);if(found){found.entry.status="eaten";saveExt();renderDiary();showActionToast(`${found.entry.name} marked as eaten.`,null,5000);}return; }
  const del = event.target.closest("[data-entry-delete]");
  if(del){ requestDeleteEntry(del.dataset.entryDelete);return; }
  const copy = event.target.closest("[data-entry-copy]");
  if(copy){ requestCopyEntry(copy.dataset.entryCopy);return; }
  const template = event.target.closest("[data-save-meal-template]");
  if(template){ saveMealTemplatePrompt(template.dataset.saveMealTemplate);return; }
});
by("save-day-settings")?.addEventListener("click",() => {
  const date=diaryDate();ext.daySettings[date]={type:by("day-type").value,targetCal:whole(by("day-cal-target").value)};saveExt();renderDiary();showActionToast("Day settings saved.",null,5000);
});

function snapshotFood(entry){
  return {id:entry.foodId || uid("snapshot"),name:entry.name,brand:entry.brand,defaultAmount:entry.amount,defaultUnit:entry.unit,units:{[entry.unit]:1/entry.amount},unitLabels:{[entry.unit]:entry.unitLabel},serving:`${entry.amount} ${entry.unitLabel}`,nutrients:entry.nutrients,score:entry.score,source:entry.source};
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
    const copy={...clone(found.entry),id:uid("entry"),date,createdAt:new Date().toISOString()};
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
  by("a05-modal-title").textContent=title;by("a05-modal-copy").textContent=copy;by("a05-modal-extra").innerHTML=extra;by("a05-modal-confirm").textContent=confirmLabel;by("a05-modal-confirm").className=confirmLabel.toLowerCase().includes("delete")?"danger-button":"primary";modalConfirm=onConfirm;by("a05-modal").classList.remove("hidden");
}
function closeModal(){by("a05-modal").classList.add("hidden");modalConfirm=null;}
by("a05-modal-cancel")?.addEventListener("click",closeModal);
by("a05-modal-confirm")?.addEventListener("click",() => {const fn=modalConfirm;closeModal();fn?.();});
let toastUndo=null,toastTimer=null;
function showActionToast(copy,action=null,duration=6000){
  clearTimeout(toastTimer);toastUndo=action;by("a05-toast-copy").textContent=copy;by("a05-toast-action").classList.toggle("hidden",!action);by("a05-action-toast").classList.add("show");toastTimer=setTimeout(()=>{by("a05-action-toast").classList.remove("show");toastUndo=null;},duration);
}
by("a05-toast-action")?.addEventListener("click",() => {const fn=toastUndo;by("a05-action-toast").classList.remove("show");toastUndo=null;fn?.();showActionToast("Action undone.",null,4000);});

// Food library
function searchRank(food,query){
  const nq=normalise(query);if(!nq)return 1;
  const name=normalise(food.name),brand=normalise(food.brand),aliases=(food.aliases||[]).map(normalise);
  if(name===nq||brand===nq||aliases.includes(nq))return 1000;
  if(name.startsWith(nq)||aliases.some(a=>a.startsWith(nq)))return 800;
  const tokens=nq.split(" ").filter(Boolean);const hay=[name,brand,...aliases].join(" ");
  if(tokens.every(t=>hay.includes(t)))return 600+tokens.length;
  if(tokens.some(t=>hay.includes(t)))return 100;
  return 0;
}
function activeLibraryTab(){ return ext.ui.libraryTab || "all"; }
function renderLibrary(){
  qa("[data-library-tab]").forEach(b=>b.classList.toggle("active",b.dataset.libraryTab===activeLibraryTab()));
  by("food-search").value=ext.ui.foodSearch||"";
  const tab=activeLibraryTab(),query=by("food-search").value;
  let content=[];
  if(tab==="all"||tab==="saved"||tab==="custom"){
    content=allFoods().filter(food=>tab==="saved"?ext.savedFoodIds.includes(food.id):tab==="custom"?(food.source==="User Created"):food.category!=="Recipe").map(food=>({food,rank:searchRank(food,query)})).filter(x=>x.rank>0).sort((a,b)=>b.rank-a.rank||Number(b.food.country==="Australia")-Number(a.food.country==="Australia")||a.food.name.localeCompare(b.food.name)).map(x=>x.food);
    by("food-results").innerHTML=content.length?`<div class="food-card-grid">${content.map(foodCard).join("")}</div>`:`<div class="card empty-state">No relevant match. Try a simpler Australian food name, create a custom food, or use Scan & Review.</div>`;
  } else if(tab==="recipes") renderRecipeLibrary();
  else renderMealLibrary();
  renderRecipeSelectOptions();renderScanSelect();
}
function foodCard(food){
  const safety=foodSafety(food);const saved=ext.savedFoodIds.includes(food.id);
  return `<article class="food-card ${safety.blocked?"food-warning":""}"><div class="food-card-head"><div><span class="source-chip ${food.verified?"verified":"estimated"}">${food.verified?"Verified Sample":"Review Source"}</span><h3>${esc(food.name)}</h3><p>${esc(food.brand||"")} ${food.country?`· ${esc(food.country)}`:""}</p></div><span class="health-score">${whole(food.score)}/10</span></div><p><strong>${esc(food.serving)}</strong> · ${formatNumber(food.nutrients.calories)} Cal</p><p class="macro-line">P ${nutrientText(food.nutrients.protein,"g",true)} · C ${nutrientText(food.nutrients.carbs,"g",true)} · F ${nutrientText(food.nutrients.fat,"g",true)}</p><p class="fine">${esc(food.source)}${safety.blocked?`<br><b class="danger-text">${esc(safety.message)}</b>`:""}</p><div class="food-card-actions"><button data-food-add="${esc(food.id)}" class="primary">Review & Add</button><button data-food-save="${esc(food.id)}" class="secondary">${saved?"Saved ✓":"Save Food"}</button><button data-food-details="${esc(food.id)}" class="secondary">Nutrition Details</button></div></article>`;
}
document.addEventListener("click",event=>{
  const tab=event.target.closest("[data-library-tab]");if(tab){ext.ui.libraryTab=tab.dataset.libraryTab;saveExt();renderLibrary();return;}
  const add=event.target.closest("[data-food-add]");if(add){const food=getFood(add.dataset.foodAdd);prepareEntry(food,{date:ext.ui.diaryDate||isoToday(),meal:ext.ui.pendingMeal||"Breakfast",status:"eaten"});return;}
  const save=event.target.closest("[data-food-save]");if(save){toggleSavedFood(save.dataset.foodSave);return;}
  const details=event.target.closest("[data-food-details]");if(details){showFoodDetails(details.dataset.foodDetails);return;}
  const recipeAdd=event.target.closest("[data-recipe-add]");if(recipeAdd){prepareEntry(getFood(recipeAdd.dataset.recipeAdd),{date:ext.ui.diaryDate||isoToday(),meal:ext.ui.pendingMeal||"Dinner"});return;}
  const mealAdd=event.target.closest("[data-meal-add]");if(mealAdd){addMealTemplate(mealAdd.dataset.mealAdd);return;}
  const mealDelete=event.target.closest("[data-meal-delete]");if(mealDelete){deleteMealTemplate(mealDelete.dataset.mealDelete);return;}
});
by("food-search")?.addEventListener("input",()=>{ext.ui.foodSearch=by("food-search").value;saveExt();renderLibrary();});
by("clear-food-search")?.addEventListener("click",()=>{ext.ui.foodSearch="";by("food-search").value="";saveExt();renderLibrary();});
function toggleSavedFood(id){
  const food=getFood(id);if(!food)return;
  const idx=ext.savedFoodIds.indexOf(id);
  if(idx>=0){ext.savedFoodIds.splice(idx,1);showActionToast(`${food.name} removed from Saved Foods.`,()=>{ext.savedFoodIds.push(id);saveExt();renderLibrary();},8000);}else{ext.savedFoodIds.push(id);showActionToast(`${food.name} saved to Saved Foods.`,()=>{ext.savedFoodIds=ext.savedFoodIds.filter(x=>x!==id);saveExt();renderLibrary();},8000);}saveExt();renderLibrary();
}
function showFoodDetails(id){
  const food=getFood(id);if(!food)return;
  const safety=foodSafety(food);
  openModal(food.name,`${food.serving} · ${food.source}`,"Close",()=>{},`${nutritionCards(food.nutrients)}<p><strong>Ingredients:</strong> ${esc(food.ingredients||"Not Available")}</p><p><strong>Health Score ${whole(food.score)}/10:</strong> ${esc(scoreExplanation(food.score))}</p>${safety.blocked?`<p class="danger-text"><strong>Profile warning:</strong> ${esc(safety.message)}</p>`:""}`);
  by("a05-modal-confirm").className="primary";
}
function renderRecipeLibrary(){
  by("food-results").innerHTML=ext.recipes.length?`<div class="food-card-grid">${ext.recipes.map(r=>foodCard(recipeAsFood(r))).join("")}</div>`:`<div class="card empty-state">No recipes saved yet. Use Create Recipe for mixed homemade foods such as rissoles, casseroles or soups.</div>`;
}
function renderMealLibrary(){
  by("food-results").innerHTML=ext.mealTemplates.length?`<div class="food-card-grid">${ext.mealTemplates.map(meal=>{const totals=sumNutrients(meal.items);return `<article class="food-card"><h3>${esc(meal.name)}</h3><p>${meal.items.length} ${meal.items.length===1?"item":"items"} · ${formatNumber(totals.calories)} Cal</p><ul class="compact-list">${meal.items.map(i=>`<li>${esc(i.name)} — ${formatNumber(i.amount,true)} ${esc(i.unitLabel||i.unit)}</li>`).join("")}</ul><div class="food-card-actions"><button data-meal-add="${esc(meal.id)}" class="primary">Review & Add Meal</button><button data-meal-delete="${esc(meal.id)}" class="delete-action">Delete Saved Meal</button></div></article>`}).join("")}</div>`:`<div class="card empty-state">No saved meals yet. Save any meal from the Food Diary.</div>`;
}
function addMealTemplate(id){
  const template=ext.mealTemplates.find(m=>m.id===id);if(!template)return;
  const date=ext.ui.diaryDate||isoToday();const meal=ext.ui.pendingMeal||"Breakfast";
  openModal(`Add ${template.name}?`,`This creates independent planned entries on ${formatDate(date)}.`,"Add to Plan",()=>{
    ext.diary[date] ||= [];
    template.items.forEach(item=>ext.diary[date].push({...clone(item),id:uid("entry"),date,meal,status:"planned",createdAt:new Date().toISOString()}));saveExt();openFeature("food-diary");showActionToast(`${template.name} added to the plan.`,null,6000);
  });
}
function deleteMealTemplate(id){const template=ext.mealTemplates.find(m=>m.id===id);if(!template)return;openModal(`Delete ${template.name}?`,`Past diary entries will not be changed.`,`Delete`,()=>{const idx=ext.mealTemplates.findIndex(m=>m.id===id);const removed=ext.mealTemplates.splice(idx,1)[0];saveExt();renderLibrary();showActionToast(`${removed.name} deleted from Saved Meals.`,()=>{ext.mealTemplates.splice(idx,0,removed);saveExt();renderLibrary();},8000);});}

// Custom food
by("save-custom-food")?.addEventListener("click",()=>{
  const name=by("custom-food-name").value.trim(),cal=by("custom-cal").value;
  if(!name||cal===""){by("custom-food-error").textContent="Enter a food name and Calories.";return;}
  const nutrientValue=id=>by(id).value===""?null:Number(by(id).value);
  const amount=n(by("custom-serving-amount").value)||1,unit=by("custom-serving-unit").value;
  const food={id:uid("custom"),name,brand:by("custom-food-brand").value.trim(),category:"Custom Food",country:"Australia",aliases:[name],defaultAmount:amount,defaultUnit:unit,units:{[unit]:1/amount},unitLabels:{[unit]:unit},serving:`${amount} ${unit}`,nutrients:{calories:Number(cal),protein:nutrientValue("custom-protein"),carbs:nutrientValue("custom-carbs"),fat:nutrientValue("custom-fat"),satFat:nutrientValue("custom-sat-fat"),fibre:nutrientValue("custom-fibre"),sugar:nutrientValue("custom-sugar"),sodium:nutrientValue("custom-sodium")},score:7,source:"User Created",verified:false,ingredients:by("custom-ingredients").value.trim(),allergens:[]};
  ext.customFoods.push(food);ext.savedFoodIds.push(food.id);saveExt();["custom-food-name","custom-food-brand","custom-cal","custom-protein","custom-carbs","custom-fat","custom-sat-fat","custom-fibre","custom-sugar","custom-sodium","custom-ingredients"].forEach(id=>by(id).value="");ext.ui.libraryTab="custom";openFeature("food-library");showActionToast(`${food.name} saved to My Foods.`,null,6000);
});

// Recipe builder
let recipeDraft=[];
function renderRecipeSelectOptions(){
  const select=by("recipe-food-select");if(!select)return;const foods=[...FOODS,...ext.customFoods];select.innerHTML=foods.map(f=>`<option value="${esc(f.id)}">${esc(f.name)} — ${esc(f.serving)}</option>`).join("");updateRecipeUnits();
}
function updateRecipeUnits(){const food=getFood(by("recipe-food-select")?.value);if(!food||!by("recipe-ingredient-unit"))return;by("recipe-ingredient-unit").innerHTML=Object.keys(unitOptions(food)).map(u=>`<option value="${esc(u)}">${esc(unitLabel(food,u))}</option>`).join("");by("recipe-ingredient-unit").value=defaultUnit(food);by("recipe-ingredient-amount").value=defaultAmount(food);}
by("recipe-food-select")?.addEventListener("change",updateRecipeUnits);
function renderRecipeBuilder(){renderRecipeSelectOptions();renderRecipeDraft();}
by("add-recipe-ingredient")?.addEventListener("click",()=>{
  const food=getFood(by("recipe-food-select").value);if(!food)return;const amount=n(by("recipe-ingredient-amount").value),unit=by("recipe-ingredient-unit").value;if(amount<=0)return;
  recipeDraft.push({id:uid("ingredient"),foodId:food.id,name:food.name,amount,unit,unitLabel:unitLabel(food,unit),nutrients:scaledNutrients(food,amount,unit),score:food.score});renderRecipeDraft();
});
function renderRecipeDraft(){
  if(!by("recipe-ingredient-list"))return;
  by("recipe-ingredient-list").innerHTML=recipeDraft.length?recipeDraft.map(i=>`<div class="recipe-row"><span><strong>${esc(i.name)}</strong><small>${formatNumber(i.amount,true)} ${esc(i.unitLabel)} · ${formatNumber(i.nutrients.calories)} Cal</small></span><button data-remove-recipe-ingredient="${esc(i.id)}" class="delete-action">Remove</button></div>`).join(""):`<p class="empty-state">No ingredients yet.</p>`;
  const servings=Math.max(1,n(by("recipe-servings")?.value)||1),total=sumNutrients(recipeDraft),per=Object.fromEntries(Object.entries(total).map(([k,v])=>[k,v/servings]));
  by("recipe-nutrition-preview").innerHTML=`<p><strong>Whole recipe:</strong> ${formatNumber(total.calories)} Cal · <strong>Per serving:</strong> ${formatNumber(per.calories)} Cal</p>${nutritionCards(per)}`;
}
document.addEventListener("click",event=>{const b=event.target.closest("[data-remove-recipe-ingredient]");if(b){recipeDraft=recipeDraft.filter(i=>i.id!==b.dataset.removeRecipeIngredient);renderRecipeDraft();}});
by("recipe-servings")?.addEventListener("input",renderRecipeDraft);
by("save-recipe")?.addEventListener("click",()=>{
  const name=by("recipe-name").value.trim(),servings=Math.max(1,whole(by("recipe-servings").value));if(!name||!recipeDraft.length){by("recipe-error").textContent="Enter a recipe name and at least one ingredient.";return;}
  const total=sumNutrients(recipeDraft),per=Object.fromEntries(Object.entries(total).map(([k,v])=>[k,v/servings]));const score=Math.max(1,Math.min(10,round1(recipeDraft.reduce((sum,i)=>sum+n(i.score),0)/recipeDraft.length)));
  const recipe={id:uid("recipe"),name,servings,notes:by("recipe-notes").value,ingredients:clone(recipeDraft),perServe:per,score,createdAt:new Date().toISOString()};ext.recipes.push(recipe);ext.savedFoodIds.push(recipe.id);saveExt();recipeDraft=[];by("recipe-name").value="";by("recipe-notes").value="";ext.ui.libraryTab="recipes";openFeature("food-library");showActionToast(`${recipe.name} saved as a recipe.`,null,6000);
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
function mealFromText(text){const t=normalise(text);if(t.includes("breakfast"))return"Breakfast";if(t.includes("smoko"))return t.includes("afternoon")?"Afternoon Tea":"Morning Smoko";if(t.includes("lunch"))return"Lunch";if(t.includes("dinner")||t.includes("tea"))return"Dinner";if(t.includes("supper"))return"Supper";return by("voice-meal")?.value||"Other";}
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
  voiceParsed.items.forEach(item=>{const food=getFood(item.foodId);ext.diary[date].push({id:uid("entry"),foodId:food.id,name:food.name,brand:food.brand,date,meal,status:"eaten",amount:item.amount,unit:item.unit,unitLabel:unitLabel(food,item.unit),time:new Date().toTimeString().slice(0,5),notes:"Added after voice/text review",nutrients:scaledNutrients(food,item.amount,item.unit),score:food.score,source:`Voice/Text Review · ${food.source}`,createdAt:new Date().toISOString()});});saveExt();ext.ui.diaryDate=date;openFeature("food-diary");showActionToast(`${voiceParsed.items.length} ${voiceParsed.items.length===1?"item":"items"} added after review.`,null,6500);voiceParsed=[];by("voice-transcript").value="";
});

// Scan capture and review
function renderScanSelect(){const select=by("scan-food-select");if(select)select.innerHTML=allFoods().map(f=>`<option value="${esc(f.id)}">${esc(f.name)} — ${esc(f.serving)}</option>`).join("");updateScanPreview();}
qa("[data-scan-mode]").forEach(button=>button.addEventListener("click",()=>{ext.ui.scanMode=button.dataset.scanMode;qa("[data-scan-mode]").forEach(b=>b.classList.toggle("active",b===button));saveExt();}));
by("scan-image")?.addEventListener("change",event=>{
  const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{by("scan-preview").className="scan-preview";by("scan-preview").innerHTML=`<img src="${reader.result}" alt="Captured food or package"><p>Image captured. Choose the matching food below and review the quantity before adding.</p>`;by("scan-review-card").classList.remove("hidden");};reader.readAsDataURL(file);
});
by("scan-food-select")?.addEventListener("change",updateScanPreview);
function updateScanPreview(){const food=getFood(by("scan-food-select")?.value);if(!food||!by("scan-food-preview"))return;by("scan-food-preview").innerHTML=`<h3>${esc(food.name)}</h3><p>${esc(food.serving)} · ${formatNumber(food.nutrients.calories)} Cal · ${esc(food.source)}</p>`;}
by("review-scan-food")?.addEventListener("click",()=>{const food=getFood(by("scan-food-select").value);prepareEntry(food,{date:ext.ui.diaryDate||isoToday(),meal:ext.ui.pendingMeal||"Other",source:`Scan Review · ${food.source}`});});

// Meal planner
function initialisePlanner(){by("planner-date").value=ext.ui.diaryDate||isoToday();renderMealSuggestions([]);}
function suggestionNutrition(suggestion){return sumNutrients(suggestion.items.map(i=>({nutrients:scaledNutrients(getFood(i.foodId),i.amount,i.unit)})));}
function suggestionSafety(suggestion){return suggestion.items.map(i=>foodSafety(getFood(i.foodId))).filter(x=>x.blocked).map(x=>x.message);}
function renderMealSuggestions(list){
  by("meal-suggestions").innerHTML=list.length?`<div class="food-card-grid">${list.map(s=>{const total=suggestionNutrition(s),warnings=suggestionSafety(s);return `<article class="food-card ${warnings.length?"food-warning":""}"><div class="food-card-head"><div><h3>${esc(s.name)}</h3><p>${esc(s.meal)} · ${formatNumber(total.calories)} Cal</p></div><span class="health-score">${s.score}/10</span></div><p>${esc(s.reason)}</p><ul class="compact-list">${s.items.map(i=>{const f=getFood(i.foodId);return `<li>${esc(f.name)} — ${formatNumber(i.amount,true)} ${esc(unitLabel(f,i.unit))}</li>`}).join("")}</ul>${warnings.length?`<p class="danger-text"><strong>Profile check:</strong> ${esc([...new Set(warnings)].join(" "))}</p>`:""}<button data-add-suggestion="${esc(s.id)}" class="primary wide" ${warnings.length?"disabled":""}>Add as Planned Meal</button></article>`}).join("")}</div>`:`<div class="card empty-state">Choose your preferences and select Show Suitable Suggestions.</div>`;
}
by("generate-meal-suggestions")?.addEventListener("click",()=>{
  const meal=by("planner-meal").value,min=n(by("planner-min-score").value),target=n(by("planner-energy").value);let list=MEAL_SUGGESTIONS.filter(s=>s.meal===meal&&s.score>=min);list.sort((a,b)=>Math.abs(suggestionNutrition(a).calories-target)-Math.abs(suggestionNutrition(b).calories-target));renderMealSuggestions(list);
});
document.addEventListener("click",event=>{const b=event.target.closest("[data-add-suggestion]");if(!b)return;const s=MEAL_SUGGESTIONS.find(x=>x.id===b.dataset.addSuggestion);if(!s)return;const date=by("planner-date").value||isoToday();ext.diary[date] ||= [];s.items.forEach(i=>{const f=getFood(i.foodId);ext.diary[date].push({id:uid("entry"),foodId:f.id,name:f.name,brand:f.brand,date,meal:by("planner-meal").value,status:"planned",amount:i.amount,unit:i.unit,unitLabel:unitLabel(f,i.unit),time:"",notes:`Meal Planner · ${s.name}`,nutrients:scaledNutrients(f,i.amount,i.unit),score:f.score,source:`Meal Planner · ${f.source}`,createdAt:new Date().toISOString()});});ext.ui.diaryDate=date;saveExt();openFeature("food-diary");showActionToast(`${s.name} added as a planned meal.`,null,6500);});

// Daily progress
function renderDailyProgress(){
  const date=by("progress-date").value||ext.ui.diaryDate||isoToday();by("progress-date").value=date;const {nutrients,planned,water,steps,goals}=daySummary(date);
  by("today-water").value=water||"";by("today-steps").value=steps||"";by("today-note").value=ext.dailyNotes[date]||"";
  by("daily-progress-grid").innerHTML=[
    ["Energy",nutrients.calories,goals.calories,"Cal","energy"],["Protein",nutrients.protein,goals.protein,"g","positive"],["Carbohydrate",nutrients.carbs,goals.carbs,"g","positive"],["Fat",nutrients.fat,goals.fat,"g","positive"],
    ["Fibre",nutrients.fibre,goals.fibre,"g","positive"],["Sugars",nutrients.sugar,goals.sugar,"g","limit"],["Sodium",nutrients.sodium,goals.sodium,"mg","limit"],["Water",water,goals.water,"mL","positive"],["Steps",steps,goals.steps,"","positive"]
  ].map(x=>progressCard(...x,date)).join("");
  by("daily-progress-explanation").innerHTML=`<h3>Plain-English Summary</h3><p>${entriesForDate(date).length ? `This page uses ${entriesForDate(date).length} diary ${entriesForDate(date).length===1?"entry":"entries"}. Planned food is shown in the diary but is not counted as eaten until you mark it eaten.` : "No food has been recorded for this date. The app does not treat an unrecorded day as a zero-calorie day."}</p><p>Planned energy not yet eaten: <strong>${formatNumber(planned.calories)} Cal</strong>. Exercise credit included in today’s allowance: <strong>${formatNumber(goals.exerciseCredit)} Cal</strong>.</p>`;
}
by("progress-date")?.addEventListener("change",renderDailyProgress);
document.addEventListener("click",event=>{const shift=event.target.closest("[data-day-shift]");if(shift){by("progress-date").value=shiftISO(by("progress-date").value,n(shift.dataset.dayShift));renderDailyProgress();}if(event.target.closest("[data-day-today]")){by("progress-date").value=isoToday();renderDailyProgress();}});
by("save-daily-progress")?.addEventListener("click",()=>{const date=by("progress-date").value||isoToday();ext.water[date]=n(by("today-water").value);ext.steps[date]=n(by("today-steps").value);ext.dailyNotes[date]=by("today-note").value;saveExt();renderDailyProgress();showActionToast("Water, steps and daily note saved.",null,5000);});

// Exercise and activity
function renderExercise(){
  if(!by("exercise-history"))return;
  by("exercise-history").innerHTML=ext.exercise.length?ext.exercise.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<div class="list-row"><span>🏃</span><div><strong>${esc(x.name)}</strong><small>${formatDate(x.date.slice(0,10))} · ${x.minutes} min · ${esc(x.intensity)} · ${formatNumber(x.calories)} Cal burned · ${formatNumber(x.credit)} Cal credited</small><p>${esc(x.notes||"")}</p></div><button data-activity-delete="${esc(x.id)}" class="delete-action">Delete</button></div>`).join(""):`<p class="empty-state">No extra activity logged yet.</p>`;
}
by("add-exercise")?.addEventListener("click",()=>{
  const name=by("exercise-name").value.trim();if(!name)return;const calories=n(by("exercise-calories").value),choice=by("exercise-credit-choice").value,credit=choice==="custom"?n(by("exercise-custom-credit").value):calories*n(choice)/100;
  ext.exercise.push({id:uid("activity"),date:new Date().toISOString(),name,minutes:n(by("exercise-minutes").value),intensity:by("exercise-intensity").value,calories,credit:whole(credit),notes:by("exercise-notes").value});saveExt();renderExercise();showActionToast(`${name} added. ${whole(credit)} Cal credited to today’s allowance.`,null,6000);["exercise-name","exercise-minutes","exercise-calories","exercise-custom-credit","exercise-notes"].forEach(id=>by(id).value="");
});
document.addEventListener("click",event=>{const b=event.target.closest("[data-activity-delete]");if(!b)return;const idx=ext.exercise.findIndex(x=>x.id===b.dataset.activityDelete);if(idx<0)return;const item=ext.exercise[idx];openModal(`Delete ${item.name}?`,`This removes the activity and its credited Calories.`,`Delete`,()=>{const removed=ext.exercise.splice(idx,1)[0];saveExt();renderExercise();showActionToast(`${removed.name} deleted.`,()=>{ext.exercise.splice(idx,0,removed);saveExt();renderExercise();},8000);});});

// Shopping list
function renderShopping(){
  const groups={};ext.shopping.forEach((x,i)=>(groups[x.category]??=[]).push({...x,index:i}));by("shopping-items").innerHTML=ext.shopping.length?Object.entries(groups).map(([category,items])=>`<h4>${esc(category)}</h4>${items.map(item=>`<label class="shopping-row ${item.done?"done":""}"><input type="checkbox" data-shop-check="${item.index}" ${item.done?"checked":""}><span><strong>${esc(item.item)}</strong><small>${esc(item.quantity||"")}${item.brand?` · ${esc(item.brand)}`:""}</small></span><button data-shop-remove="${item.index}" class="delete-action">Delete</button></label>`).join("")}`).join(""):`<p class="empty-state">Your grocery list is empty.</p>`;
}
by("add-shopping-item")?.addEventListener("click",()=>{const item=by("shopping-item").value.trim();if(!item)return;const existing=ext.shopping.find(x=>normalise(x.item)===normalise(item)&&!x.done);if(existing)existing.quantity=[existing.quantity,by("shopping-quantity").value].filter(Boolean).join(" + ");else ext.shopping.push({item,quantity:by("shopping-quantity").value,category:by("shopping-category").value,brand:by("shopping-brand").value,done:false});saveExt();renderShopping();showActionToast(`${item} added to the grocery list.`,null,5000);by("shopping-item").value="";by("shopping-quantity").value="";});
document.addEventListener("change",event=>{if(event.target.dataset.shopCheck!==undefined){ext.shopping[Number(event.target.dataset.shopCheck)].done=event.target.checked;saveExt();renderShopping();}});
document.addEventListener("click",event=>{const b=event.target.closest("[data-shop-remove]");if(!b)return;const idx=Number(b.dataset.shopRemove),item=ext.shopping[idx];openModal(`Delete ${item.item}?`,`Remove this grocery item from the list.`,`Delete`,()=>{const removed=ext.shopping.splice(idx,1)[0];saveExt();renderShopping();showActionToast(`${removed.item} deleted.`,()=>{ext.shopping.splice(idx,0,removed);saveExt();renderShopping();},8000);});});

// Food preferences and family readiness
function renderFoodPreferences(){
  const d=mainData().dietary||{};const rows=[["Foods I Love",d["foods-love"]],["Foods I Like",d["foods-like"]],["Foods I Dislike",d["foods-dislike"]],["Foods I Will Never Eat",d["foods-never"]],["Conditional Preferences",d["food-context"]],["Allergies",d["food-allergies"]],["Medical Restrictions",d["medical-restrictions"]]];
  by("food-preference-summary").innerHTML=rows.map(([label,value])=>`<div class="summary-line"><strong>${label}</strong><span>${esc(value||"Not Entered")}</span></div>`).join("");
}
by("edit-food-profile")?.addEventListener("click",()=>{if(typeof window.show==="function")window.show("health",{speak:false});window.scrollTo(0,900);});
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
  by("activity-history-summary").innerHTML=`<div class="summary-grid"><div class="summary-item"><span>Activity Recorded</span><strong>${formatNumber(totalActivity)} Cal Estimated</strong></div><div class="summary-item"><span>Average Water on Recorded Days</span><strong>${formatNumber(avgWater)} mL</strong></div></div>`;
}
q(".history-period")?.addEventListener("click",event=>{const b=event.target.closest("[data-period]");if(!b)return;qa(".history-period button").forEach(x=>x.classList.toggle("active",x===b));renderHistory(b.dataset.period);});

// Printable report
function initialiseReport(){const to=isoToday(),from=shiftISO(to,-6);by("report-from").value ||= from;by("report-to").value ||= to;}
function reportRows(from,to){return Object.keys(ext.diary).filter(d=>d>=from&&d<=to).sort().map(date=>({date,entries:entriesForDate(date),summary:daySummary(date)}));}
function buildReport(){
  const from=by("report-from").value,to=by("report-to").value;if(!from||!to||from>to){showActionToast("Choose a valid report date range.",null,5000);return;}
  const main=mainData(),rows=reportRows(from,to),foodOn=by("report-food").checked,weightOn=by("report-weight").checked,activityOn=by("report-activity").checked,waterOn=by("report-water").checked;const weights=(main.weightHistory||[]).filter(x=>x.date>=from&&x.date<=to);const activities=ext.exercise.filter(x=>x.date.slice(0,10)>=from&&x.date.slice(0,10)<=to);
  by("report-preview").innerHTML=`<header class="report-title"><h1>Healthy Eating Progress Report</h1><p>${formatDate(from)} to ${formatDate(to)}</p><p>${esc(main.personal?.preferredName||main.personal?.fullName||"Founder Tester")}</p></header><section><h2>Plain-English Summary</h2><p>${rows.filter(r=>r.entries.some(e=>e.status==="eaten")).length} days contain food records. Unrecorded days are not counted as zero intake. This founder report is for personal review and is not medical advice.</p></section>${foodOn?`<section><h2>Food & Nutrition</h2>${rows.length?rows.map(r=>`<h3>${formatDate(r.date)}</h3><p><strong>${formatNumber(r.summary.nutrients.calories)} Cal</strong> · Protein ${formatNumber(r.summary.nutrients.protein)} g · Fibre ${formatNumber(r.summary.nutrients.fibre)} g · Sodium ${formatNumber(r.summary.nutrients.sodium)} mg</p><table><thead><tr><th>Meal</th><th>Food</th><th>Status</th><th>Amount</th><th>Cal</th></tr></thead><tbody>${r.entries.map(e=>`<tr><td>${esc(e.meal)}</td><td>${esc(e.name)}</td><td>${esc(statusLabel(e.status))}</td><td>${formatNumber(e.amount,true)} ${esc(e.unitLabel||e.unit)}</td><td>${formatNumber(e.nutrients.calories)}</td></tr>`).join("")}</tbody></table>`).join(""):`<p>No food records in this period.</p>`}</section>`:""}${weightOn?`<section><h2>Weight</h2>${weights.length?`<table><thead><tr><th>Date</th><th>Weight</th><th>Note</th></tr></thead><tbody>${weights.map(w=>`<tr><td>${esc(w.date)}</td><td>${formatNumber(w.weightKg,true)} kg</td><td>${esc(w.note||"")}</td></tr>`).join("")}</tbody></table>`:`<p>No weight entries in this period.</p>`}</section>`:""}${activityOn?`<section><h2>Activity</h2>${activities.length?`<table><thead><tr><th>Date</th><th>Activity</th><th>Minutes</th><th>Burned</th><th>Credited</th></tr></thead><tbody>${activities.map(a=>`<tr><td>${esc(a.date.slice(0,10))}</td><td>${esc(a.name)}</td><td>${formatNumber(a.minutes)}</td><td>${formatNumber(a.calories)} Cal</td><td>${formatNumber(a.credit)} Cal</td></tr>`).join("")}</tbody></table>`:`<p>No activity entries in this period.</p>`}</section>`:""}${waterOn?`<section><h2>Water & Steps</h2><table><thead><tr><th>Date</th><th>Water</th><th>Steps</th></tr></thead><tbody>${Object.keys({...ext.water,...ext.steps}).filter(d=>d>=from&&d<=to).sort().map(d=>`<tr><td>${esc(d)}</td><td>${formatNumber(ext.water[d])} mL</td><td>${formatNumber(ext.steps[d])}</td></tr>`).join("")}</tbody></table></section>`:""}`;
}
by("preview-report")?.addEventListener("click",buildReport);by("print-report")?.addEventListener("click",()=>{buildReport();setTimeout(()=>window.print(),80);});
by("download-data")?.addEventListener("click",()=>{const blob=new Blob([JSON.stringify({profile:mainData(),functional:ext},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`healthy-eating-alpha-0-5-data-${isoToday()}.json`;a.click();URL.revokeObjectURL(url);});

// Contextual help
const HELP={
  "food-diary":"Use the date controls to plan ahead or review the past. Planned food is kept separate from food actually eaten. Every entry has visible Edit, Copy and Delete buttons, and deletion provides confirmation and Undo.",
  "food-library":"Search prioritises exact Australian matches and your own foods. Review the serving size and source before adding. Save Food is labelled in words rather than relying on a bookmark icon.",
  "quick-log":"Speak or type naturally, correct the transcript, then review the identified foods. Nothing is logged automatically. Accent recognition depends on the device speech service, while the food vocabulary and confirmation flow are controlled here.",
  "scan-centre":"This static trial demonstrates the safe workflow: capture, review, choose the matching item and confirm the quantity. Live barcode lookup and AI recognition will need secure online services later.",
  "meal-planner":"Suggestions respect the selected minimum Health Score and check the saved allergy and never-eat fields. Scores are explained and are guidance only.",
  "daily-progress":"Food totals are calculated from diary entries. Water and steps are entered here. The colours include words and do not judge an incomplete morning as a failed day.",
  "progress-history":"Averages use days with actual records only. There are no flames, game badges or leaderboards—only meaningful progress information."
};
document.addEventListener("click",event=>{const b=event.target.closest("[data-help]");if(!b)return;const copy=HELP[b.dataset.help]||"Help is available for this screen.";openModal("Help With This Screen",copy,"Close",()=>{});by("a05-modal-confirm").className="primary";if(mainData().companion?.enabled&&typeof window.speakText==="function")window.speakText(copy);});

// Initial setup and integration
function init(){
  // Postal address behaviour and Alpha 0.5 profile extensions
  const postalSame=by("postal-same"),postalFields=by("postal-fields");const togglePostal=()=>postalFields?.classList.toggle("hidden",postalSame?.checked);postalSame?.addEventListener("change",togglePostal);togglePostal();
  const dietaryIds=["food-allergies","food-intolerances","medical-restrictions","eating-pattern","pregnancy-status","cultural-restrictions","foods-love","foods-like","foods-dislike","foods-never","food-context"];
  by("personal-next")?.addEventListener("click",()=>setTimeout(()=>{const d=mainData();d.personal=Object.assign(d.personal||{},{postalSame:postalSame?.checked,postalCountry:by("postal-country")?.value,postalRegion:by("postal-region")?.value,postalPostcode:by("postal-postcode")?.value,postalSuburb:by("postal-suburb")?.value,postalStreet:by("postal-street")?.value});localStorage.setItem(MAIN_KEY,JSON.stringify(d));},30));
  by("calculate-button")?.addEventListener("click",()=>setTimeout(()=>{const d=mainData();d.dietary=Object.fromEntries(dietaryIds.map(id=>[id,by(id)?.value||""]));localStorage.setItem(MAIN_KEY,JSON.stringify(d));},30));
  const d=mainData(),p=d.personal||{};if(postalSame){postalSame.checked=p.postalSame!==false;[["postal-country","postalCountry"],["postal-region","postalRegion"],["postal-postcode","postalPostcode"],["postal-suburb","postalSuburb"],["postal-street","postalStreet"]].forEach(([id,key])=>{if(by(id))by(id).value=p[key]||""});togglePostal();}dietaryIds.forEach(id=>{if(by(id))by(id).value=d.dietary?.[id]||""});
  renderRecipeSelectOptions();renderScanSelect();renderHomeSummary();
  // Ensure Alpha 0.4 profile can migrate without losing functional data.
  saveExt();
}
init();
})();
