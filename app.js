const $ = id => document.getElementById(id);
const APP = window.HEC_APP || {name:"Healthy Eating Companion",shortName:"HEC",version:"0.6.2",storageKey:"healthyEatingCompanionAlpha06",functionalStorageKey:"healthyEatingCompanionAlpha06Functional",locale:"en-AU"};
const KEY = APP.storageKey;
const LEGACY_KEYS = ["healthyEatingAlpha05","healthyEatingAlpha04"];
const VERSION = APP.version;
const COMPANIONS = window.HEC_COMPANIONS || [];

const DEFAULTS = {
  version: VERSION,
  email: "",
  code: "",
  passwordSet: false,
  completed: false,
  preferences: { language: "en-AU", theme: "garden", inspirationIndex: 0 },
  personal: {
    givenName: "", fullName: "", preferredName: "", preferredPronunciation: "", email: "", dob: "",
    energyUnit: "kJ", country: "Australia", region: "", postcode: "", suburb: "",
    streetAddress: "", mobile: "", mobileInternational: "", phone: "", phoneInternational: ""
  },
  health: {
    sex: "", heightCm: 0, startingWeightKg: 0, currentWeightKg: 0,
    goal: "", lossRate: "recommended", fasting: "none", fastingDays: [],
    fastingEnergyKj: 2092, activity: 0, exerciseCredit: 0,
    selectedGoalWeight: 0, recommendedGoalWeight: 0, lastCalculationWeightKg: 0
  },
  recommendations: {},
  companion: {
    enabled: true, configured: false, id: "percy-pelican", character: "🐦", characterName: "Percy the Pelican",
    name: "Percy", customName: "", pronunciation: "", personality: "planner", voice: "", speechEnabled: true
  },
  heightUnit: "metric",
  weightUnit: "metric",
  goalMilestones: [],
  weightHistory: []
};

let data = clone(DEFAULTS);
let voices = [];
let editMode = null;
let returnToSettingsAfterRecommendations = false;

function clone(value){ return JSON.parse(JSON.stringify(value)); }
function mergeDeep(target, source){
  if(!source || typeof source !== "object") return target;
  for(const [key, value] of Object.entries(source)){
    if(value && typeof value === "object" && !Array.isArray(value)){
      target[key] = mergeDeep(target[key] && typeof target[key] === "object" ? target[key] : {}, value);
    } else if(value !== undefined) target[key] = value;
  }
  return target;
}
function escapeHtml(value){
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}
function validEmail(value){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value).trim()); }
function selected(name){ return document.querySelector(`input[name="${name}"]:checked`)?.value || ""; }
function checkedValues(name){ return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value); }
function setRadio(name, value){
  const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if(el) el.checked = true;
}
function roundWhole(value){ return Math.round(Number(value) || 0); }
function roundWeight(value){ return Math.round((Number(value) || 0) * 10) / 10; }
function formatWeight(value){
  const n = roundWeight(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
function todayISO(){ return new Date().toISOString().slice(0,10); }
function ageFromDob(value){
  if(!value) return NaN;
  const dob = new Date(value + "T00:00:00");
  if(Number.isNaN(dob.getTime())) return NaN;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const month = now.getMonth() - dob.getMonth();
  if(month < 0 || (month === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}
function displayName(){
  return (data.personal.preferredName || data.personal.fullName || "").trim().split(/\s+/)[0] || "";
}
function spokenUserName(){ return (data.personal.preferredPronunciation || displayName()).trim(); }
function companionDisplayName(){ return data.companion.customName || data.companion.name || data.companion.characterName || "Companion"; }
function spokenCompanionName(){ return (data.companion.pronunciation || data.companion.customName || data.companion.name || "Companion").trim(); }
function personaliseSpeech(text){
  return String(text || "")
    .replaceAll("{name}", spokenUserName())
    .replaceAll("{companion}", spokenCompanionName());
}
function toast(message){
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => element.classList.remove("show"), 5000);
}
function friendlyError(id, text, spoken, inputId){
  $(id).textContent = text;
  if(inputId) $(inputId)?.classList.add("invalid");
  speakText(spoken || text);
  return false;
}
function save(){ localStorage.setItem(KEY, JSON.stringify(data)); }

function migrateLegacy(legacy){
  const migrated = clone(DEFAULTS);
  migrated.email = legacy.email || "";
  migrated.code = legacy.code || "";
  migrated.passwordSet = !!legacy.passwordSet;
  migrated.completed = !!legacy.completed;

  const oldPersonal = legacy.personal || {};
  migrated.personal.fullName = oldPersonal.name || "";
  migrated.personal.preferredName = (oldPersonal.name || "").trim().split(/\s+/)[0] || "";
  migrated.personal.email = oldPersonal.email || legacy.email || "";
  migrated.personal.dob = oldPersonal.dob || "";
  migrated.personal.energyUnit = oldPersonal.energyUnit === "Calories" ? "Cal" : (oldPersonal.energyUnit || "kJ");
  migrated.personal.country = oldPersonal.country || "Australia";
  migrated.personal.streetAddress = oldPersonal.address || "";
  migrated.personal.mobile = oldPersonal.mobile || "";
  migrated.personal.phone = oldPersonal.phone || "";

  const oldHealth = legacy.health || {};
  migrated.health.sex = oldHealth.sex || "";
  migrated.health.heightCm = Number(oldHealth.heightCm) || 0;
  migrated.health.startingWeightKg = Number(oldHealth.weightKg) || 0;
  migrated.health.currentWeightKg = Number(oldHealth.weightKg) || 0;
  migrated.health.goal = oldHealth.goal || "";
  migrated.health.lossRate = oldHealth.lossRate === "faster" ? "fast" : (oldHealth.lossRate === "slow" ? "slow" : "recommended");
  migrated.health.fasting = oldHealth.fasting === "none" ? "none" : "custom";
  migrated.health.fastingDays = oldHealth.fasting === "52" ? ["Monday","Thursday"] : [];
  migrated.health.activity = Number(oldHealth.activity) || 0;
  migrated.health.exerciseCredit = Number(oldHealth.exerciseCredit) || 0;

  const oldRec = legacy.recommendations || {};
  migrated.recommendations = {...oldRec};
  migrated.health.recommendedGoalWeight = Number(oldRec.goalWeight) || 0;
  migrated.health.selectedGoalWeight = Number(oldRec.goalWeight) || 0;
  migrated.health.lastCalculationWeightKg = migrated.health.currentWeightKg;
  if(migrated.health.selectedGoalWeight){
    migrated.goalMilestones = [{weightKg:migrated.health.selectedGoalWeight, targetDate:""}];
  }

  const oldCompanion = legacy.companion || {};
  migrated.companion = mergeDeep(migrated.companion, oldCompanion);
  migrated.companion.enabled = true;
  migrated.companion.configured = true;
  migrated.preferences.theme = oldCompanion.theme || "garden";
  migrated.heightUnit = legacy.heightUnit || "metric";
  migrated.weightUnit = legacy.weightUnit || "metric";
  return migrated;
}
function normaliseCompanionRecord(record){
  const result = mergeDeep(clone(DEFAULTS.companion), record || {});
  let selectedCompanion = COMPANIONS.find(item => item.id === result.id);
  if(!selectedCompanion){
    const oldName = String(result.name || result.characterName || "").toLowerCase();
    selectedCompanion = COMPANIONS.find(item => oldName.includes(item.name.toLowerCase()) || oldName.includes(item.species.toLowerCase()));
  }
  selectedCompanion ||= COMPANIONS.find(item => item.id === "percy-pelican") || COMPANIONS[0];
  if(selectedCompanion){
    result.id = selectedCompanion.id;
    result.name = selectedCompanion.name;
    result.character = selectedCompanion.icon;
    result.characterName = `${selectedCompanion.name} the ${selectedCompanion.species}`;
    result.personality = selectedCompanion.personality;
  }
  return result;
}
function loadStoredData(){
  try{
    const current = JSON.parse(localStorage.getItem(KEY));
    if(current){
      const loaded = mergeDeep(clone(DEFAULTS), current);
      loaded.companion = normaliseCompanionRecord(loaded.companion);
      return loaded;
    }
  }catch(error){}
  for(const key of LEGACY_KEYS){
    try{
      const legacy = JSON.parse(localStorage.getItem(key));
      if(legacy){
        const migrated = mergeDeep(clone(DEFAULTS), legacy);
        migrated.version = VERSION;
        migrated.companion = normaliseCompanionRecord(migrated.companion);
        return migrated;
      }
    }catch(error){}
  }
  const fresh = clone(DEFAULTS);
  fresh.companion = normaliseCompanionRecord(fresh.companion);
  return fresh;
}

const THEME_COLOURS = {garden:"#2e6d4d",coast:"#17759b",outback:"#a64f2b",classic:"#385f84"};
function applyTheme(theme = data.preferences.theme){
  const safe = THEME_COLOURS[theme] ? theme : "garden";
  data.preferences.theme = safe;
  document.body.dataset.theme = safe;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOURS[safe]);
  document.querySelectorAll("[data-theme-choice]").forEach(card => card.classList.toggle("selected", card.dataset.themeChoice === safe));
}
function applyLanguage(){
  document.documentElement.lang = data.preferences.language || "en-AU";
  setRadio("language", data.preferences.language || "en-AU");
}
function currentCompanionChoice(){
  const radio = selected("companion-choice");
  return $("companion")?.classList.contains("active") && radio ? radio === "yes" : !!data.companion.enabled;
}
function updateCompanionUI(){
  const enabled = currentCompanionChoice();
  $("companion-details")?.classList.toggle("hidden", !enabled);
  if($("companion-guide-copy")){
    $("companion-guide-copy").textContent = enabled
      ? "A Companion can explain, encourage and speak instructions. You can turn it off at any time."
      : "Healthy Eating Companion will use clear written instructions. You can turn the Companion on later in Settings.";
  }
  document.querySelectorAll(".companion-only").forEach(el => el.classList.toggle("hidden", !enabled));
  document.querySelectorAll(".live-avatar").forEach(el => el.textContent = enabled ? data.companion.character : "🧭");
  if($("setup-avatar")) $("setup-avatar").textContent = enabled ? data.companion.character : "🧭";
}
function show(id, {speak=true} = {}){
  window.speechSynthesis?.cancel?.();
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo(0,0);

  if($("language-back")) $("language-back").dataset.go = editMode === "language" ? "settings" : "welcome";
  if($("companion-back")) $("companion-back").dataset.go = editMode === "companion" ? "settings" : "password";
  if($("personal-back")) $("personal-back").dataset.go = editMode === "personal" ? "settings" : "companion";
  if($("health-back")) $("health-back").dataset.go = editMode === "health" ? "settings" : "personal";

  applyTheme();
  applyLanguage();
  updateCompanionUI();
  if(id === "settings") renderSettings();
  if(id === "home") renderHome();
  if(id === "weight-checkin") renderWeightCheckin();

  const text = $(id).dataset.speech;
  if(speak && text && data.companion.enabled && data.companion.configured && data.companion.speechEnabled){
    setTimeout(() => speakText(personaliseSpeech(text)), 260);
  }
  if(id === "settings"){
    editMode = null;
    returnToSettingsAfterRecommendations = false;
  }
}

function speakText(text, {force=false, allowWithoutCompanion=false} = {}){
  if(!("speechSynthesis" in window)){
    toast("Spoken guidance is not supported by this browser.");
    return;
  }
  if(!force){
    if(!data.companion.enabled || !data.companion.configured || !data.companion.speechEnabled) return;
  }else if(!allowWithoutCompanion && !currentCompanionChoice()) return;

  const utterance = new SpeechSynthesisUtterance(String(text || ""));
  const chosen = voices.find(voice => voice.name === data.companion.voice);
  if(chosen) utterance.voice = chosen;
  utterance.lang = chosen?.lang || data.preferences.language || "en-AU";
  const voiceStyle = {calm:[0.92,1],encouraging:[1,1.03],steady:[0.94,.98],thoughtful:[0.9,1],loyal:[.98,1],curious:[1,1.04],"light-hearted":[1.02,1.07],social:[1.03,1.05],planner:[.95,1],confident:[.98,.97],energetic:[1.07,1.06],direct:[1,.95],protective:[.93,1],resourceful:[1,1.02],relaxed:[.9,.98],patient:[.88,1]}[data.companion.personality] || [.96,1];
  utterance.rate = voiceStyle[0];
  utterance.pitch = voiceStyle[1];
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
function populateVoices(){
  if(!("speechSynthesis" in window)) return;
  voices = window.speechSynthesis.getVoices();
  const select = $("voice-select");
  if(!select) return;
  const current = data.companion.voice;
  select.innerHTML = '<option value="">Default device voice</option>' +
    voices.map(v => `<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)}${v.lang ? " · " + escapeHtml(v.lang) : ""}</option>`).join("");
  select.value = current;
}
if("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = populateVoices;

const COUNTRY_CONFIG = {
  "Australia": {
    regionLabel:"State or territory", postcodeLabel:"Postcode", suburbLabel:"Suburb or town",
    postcodePlaceholder:"0000", phonePlaceholder:"0412 345 678",
    regions:["ACT","NSW","NT","QLD","SA","TAS","VIC","WA"],
    postcode:/^\d{4}$/
  },
  "New Zealand": {
    regionLabel:"Region", postcodeLabel:"Postcode", suburbLabel:"Suburb or town",
    postcodePlaceholder:"0000", phonePlaceholder:"021 123 4567",
    regions:["Auckland","Bay of Plenty","Canterbury","Gisborne","Hawke's Bay","Manawatū-Whanganui","Marlborough","Nelson","Northland","Otago","Southland","Taranaki","Tasman","Waikato","Wellington","West Coast"],
    postcode:/^\d{4}$/
  },
  "United Kingdom": {
    regionLabel:"County or region", postcodeLabel:"Postcode", suburbLabel:"Town or city",
    postcodePlaceholder:"SW1A 1AA", phonePlaceholder:"07123 456789",
    regions:[], postcode:/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i
  },
  "United States": {
    regionLabel:"State", postcodeLabel:"ZIP code", suburbLabel:"City",
    postcodePlaceholder:"12345", phonePlaceholder:"(555) 123-4567",
    regions:["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"],
    postcode:/^\d{5}(?:-\d{4})?$/
  },
  "Canada": {
    regionLabel:"Province or territory", postcodeLabel:"Postal code", suburbLabel:"City",
    postcodePlaceholder:"A1A 1A1", phonePlaceholder:"(555) 123-4567",
    regions:["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"],
    postcode:/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i
  },
  "Other": {
    regionLabel:"State, province or region", postcodeLabel:"Postcode or postal code", suburbLabel:"Town or city",
    postcodePlaceholder:"", phonePlaceholder:"+00 000 000 000",
    regions:[], postcode:null
  }
};
function suggestedCountryForLanguage(language){
  return {"en-AU":"Australia","en-NZ":"New Zealand","en-GB":"United Kingdom","en-US":"United States"}[language] || "Australia";
}
function updateCountryFields(){
  const country = $("country").value || "Other";
  const config = COUNTRY_CONFIG[country] || COUNTRY_CONFIG.Other;
  $("region-label").textContent = config.regionLabel;
  $("postcode-label").textContent = config.postcodeLabel;
  $("suburb-label").textContent = config.suburbLabel;
  $("postcode").placeholder = config.postcodePlaceholder;
  $("mobile").placeholder = config.phonePlaceholder;
  $("region-options").innerHTML = config.regions.map(region => `<option value="${escapeHtml(region)}"></option>`).join("");
  updateAddressPreview();
}
function formatPostcode(value, country){
  let result = String(value || "").trim().toUpperCase().replace(/\s+/g,"");
  if(country === "United Kingdom" && result.length > 3) result = result.slice(0,-3) + " " + result.slice(-3);
  if(country === "Canada" && result.length > 3) result = result.slice(0,3) + " " + result.slice(3,6);
  return result;
}
function validPostcode(value, country){
  if(!value) return true;
  const rule = (COUNTRY_CONFIG[country] || COUNTRY_CONFIG.Other).postcode;
  return !rule || rule.test(value.trim());
}
function updateAddressPreview(){
  if(!$("address-preview")) return;
  const country = $("country").value;
  const street = $("street-address").value.trim();
  const suburb = $("suburb").value.trim();
  const region = $("region").value.trim();
  const postcode = formatPostcode($("postcode").value, country);
  const parts = [];
  if(street) parts.push(street);
  const locality = [suburb, region, postcode].filter(Boolean).join(" ");
  if(locality) parts.push(locality);
  if(country) parts.push(country);
  $("address-preview").querySelector("p").textContent =
    parts.length > 1 || street || suburb || region || postcode ? parts.join(", ") : "No address entered yet.";
}
function phoneDigits(value){ return String(value || "").replace(/\D/g,""); }
function normaliseLocalDigits(value, country){
  let digits = phoneDigits(value);
  const prefixes = {"Australia":"61","New Zealand":"64","United Kingdom":"44","United States":"1","Canada":"1"};
  const prefix = prefixes[country];
  if(prefix && digits.startsWith(prefix)){
    digits = digits.slice(prefix.length);
    if(["Australia","New Zealand","United Kingdom"].includes(country)) digits = "0" + digits;
  }
  return digits;
}
function formatPhone(value, country){
  const digits = normaliseLocalDigits(value, country);
  if(!digits) return "";
  if(country === "Australia"){
    if(/^04\d{8}$/.test(digits)) return `${digits.slice(0,4)} ${digits.slice(4,7)} ${digits.slice(7)}`;
    if(/^0[2378]\d{8}$/.test(digits)) return `(${digits.slice(0,2)}) ${digits.slice(2,6)} ${digits.slice(6)}`;
  }
  if(country === "New Zealand"){
    if(/^02\d{7,9}$/.test(digits)) return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`.trim();
    if(/^0\d{8}$/.test(digits)) return `(${digits.slice(0,2)}) ${digits.slice(2,5)} ${digits.slice(5)}`;
  }
  if(country === "United Kingdom"){
    if(/^07\d{9}$/.test(digits)) return `${digits.slice(0,5)} ${digits.slice(5)}`;
    if(/^0\d{9,10}$/.test(digits)) return `${digits.slice(0,4)} ${digits.slice(4)}`;
  }
  if((country === "United States" || country === "Canada") && digits.length === 10){
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  return String(value || "").trim().replace(/\s+/g," ");
}
function toInternationalPhone(value, country){
  const digits = normaliseLocalDigits(value, country);
  const prefixes = {"Australia":"61","New Zealand":"64","United Kingdom":"44","United States":"1","Canada":"1"};
  const prefix = prefixes[country];
  if(!digits) return "";
  if(!prefix) return "+" + digits;
  if(["Australia","New Zealand","United Kingdom"].includes(country) && digits.startsWith("0")) return "+" + prefix + digits.slice(1);
  return "+" + prefix + digits;
}
function validPhone(value, country){
  if(!value.trim()) return true;
  const digits = normaliseLocalDigits(value, country);
  if(country === "Australia") return /^(?:04\d{8}|0[2378]\d{8})$/.test(digits);
  if(country === "New Zealand") return /^0\d{7,10}$/.test(digits);
  if(country === "United Kingdom") return /^0\d{9,10}$/.test(digits);
  if(country === "United States" || country === "Canada") return digits.length === 10;
  return digits.length >= 7 && digits.length <= 15;
}

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-go]");
  if(nav){
    show(nav.dataset.go);
    return;
  }
  const repeat = event.target.closest(".speak-note");
  if(repeat){
    const screen = repeat.closest(".screen");
    const message = repeat.closest(".guide-note,.home-message")?.querySelector("p")?.textContent || screen?.dataset.speech || "";
    speakText(personaliseSpeech(message), {force:true});
  }
});

$("join-check").addEventListener("change", event => $("join-button").disabled = !event.target.checked);
$("join-button").addEventListener("click", () => show("language"));
$("cancel-button").addEventListener("click", () => show("goodbye"));

$("language-next").addEventListener("click", () => {
  const language = selected("language");
  if(!language) return friendlyError("language-error", "Please choose a language.", "Please choose a language before we continue.");
  const oldSuggested = suggestedCountryForLanguage(data.preferences.language);
  data.preferences.language = language;
  if(!data.personal.country || data.personal.country === oldSuggested) data.personal.country = suggestedCountryForLanguage(language);
  save();
  applyLanguage();
  if(editMode === "language"){
    editMode = null;
    populateForms();
    show("settings", {speak:false});
  }else show("register");
});

$("register-email").addEventListener("input", () => {
  const value = $("register-email").value;
  const okay = validEmail(value);
  $("register-email").classList.toggle("invalid", value.length > 2 && !okay);
  $("email-error").textContent = value.length > 2 && !okay ? "Please enter a valid email address." : "";
});
function generateCode(){
  data.code = String(Math.floor(100000 + Math.random() * 900000));
  $("preview-code").textContent = data.code.slice(0,3) + " " + data.code.slice(3);
}
$("send-code").addEventListener("click", () => {
  const email = $("register-email").value.trim();
  if(!validEmail(email)){
    return friendlyError("email-error", "Please enter a valid email address.", "It looks like that email address is not complete yet. Please check it and try again.", "register-email");
  }
  data.email = email;
  data.personal.email = email;
  generateCode();
  save();
  $("verify-message").textContent = `A six-digit verification code has been prepared for ${email}.`;
  $("verify-code").value = "";
  show("verify");
});
$("resend-code").addEventListener("click", () => {
  generateCode();
  save();
  toast("A new prototype code has been generated.");
  speakText("I have generated a new six digit code for you.");
});
$("verify-code").addEventListener("input", event => event.target.value = event.target.value.replace(/\D/g,"").slice(0,6));
$("verify-button").addEventListener("click", () => {
  if($("verify-code").value !== data.code){
    return friendlyError("code-error", "That code does not match. Check the six digits and try again.", "That code does not match yet. Please check all six digits and try again.", "verify-code");
  }
  $("code-error").textContent = "";
  show("password");
});
function passwordScore(value){
  let score = 0;
  if(value.length >= 8) score++;
  if(/[A-Za-z]/.test(value) && /\d/.test(value)) score++;
  if(/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if(/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}
$("password-one").addEventListener("input", () => {
  const score = passwordScore($("password-one").value);
  const labels = ["Not entered","Weak","Fair","Good","Strong"];
  const widths = [0,25,50,75,100];
  const bar = $("password-strength").querySelector("span");
  bar.style.width = widths[score] + "%";
  bar.style.background = score < 2 ? "#ad4646" : score < 3 ? "#b88a2c" : "#3b7e58";
  $("password-strength").querySelector("small").textContent = labels[score];
});
$("password-next").addEventListener("click", () => {
  const first = $("password-one").value;
  const second = $("password-two").value;
  if(first.length < 8 || !/[A-Za-z]/.test(first) || !/\d/.test(first)){
    return friendlyError("password-error", "Use at least eight characters, including a letter and a number.", "Your password needs at least eight characters, including a letter and a number.");
  }
  if(first !== second){
    return friendlyError("password-error", "The passwords do not match. Please enter them again.", "It looks like your passwords do not match yet. Let us fix that together.");
  }
  data.passwordSet = true;
  save();
  show("companion", {speak:false});
});

function selectedCompanionDefinition(){
  return COMPANIONS.find(item => item.id === data.companion.id) || COMPANIONS.find(item => item.id === "percy-pelican") || COMPANIONS[0] || null;
}
function applyCompanionDefinition(definition){
  if(!definition) return;
  data.companion.id = definition.id;
  data.companion.name = definition.name;
  data.companion.character = definition.icon;
  data.companion.characterName = `${definition.name} the ${definition.species}`;
  data.companion.personality = definition.personality;
}
function renderCompanionPreview(){
  const companion = selectedCompanionDefinition();
  const panel = $("companion-preview");
  if(!panel || !companion) return;
  panel.innerHTML = `<div class="companion-preview-portrait"><img src="assets/companions/${escapeHtml(companion.id)}.svg" alt="${escapeHtml(companion.name)} the ${escapeHtml(companion.species)}"></div><div><span class="source-chip verified">Australian Companion</span><h3>${escapeHtml(companion.name)} the ${escapeHtml(companion.species)}</h3><p class="companion-tagline">${escapeHtml(companion.tagline)}</p><p><strong>Speaking style:</strong> ${escapeHtml(companion.speakingStyle)}</p><p><strong>Especially helpful with:</strong> ${companion.strengths.map(escapeHtml).join(" · ")}</p><blockquote>“${escapeHtml(companion.intro)}”</blockquote></div>`;
}
function renderCharacters(){
  const grid = $("character-grid");
  if(!grid) return;
  grid.innerHTML = COMPANIONS.map(companion =>
    `<button type="button" class="character companion-card ${data.companion.id === companion.id ? "selected" : ""}" data-companion-id="${escapeHtml(companion.id)}" aria-pressed="${data.companion.id === companion.id}"><img src="assets/companions/${escapeHtml(companion.id)}.svg" alt=""><span><strong>${escapeHtml(companion.name)}</strong><small>${escapeHtml(companion.species)}</small></span></button>`
  ).join("");
  grid.querySelectorAll("[data-companion-id]").forEach(button => button.addEventListener("click", () => {
    const definition = COMPANIONS.find(item => item.id === button.dataset.companionId);
    applyCompanionDefinition(definition);
    grid.querySelectorAll("[data-companion-id]").forEach(item => {
      const chosen = item === button;
      item.classList.toggle("selected", chosen);
      item.setAttribute("aria-pressed", String(chosen));
    });
    renderCompanionPreview();
    updateCompanionUI();
  }));
  renderCompanionPreview();
}
function syncCompanionForm(){
  data.companion.enabled = selected("companion-choice") !== "no";
  applyCompanionDefinition(selectedCompanionDefinition());
  data.companion.voice = $("voice-select")?.value || "";
  data.companion.speechEnabled = $("speech-enabled")?.checked !== false;
  data.preferences.theme = document.body.dataset.theme || data.preferences.theme;
}
document.querySelectorAll('input[name="companion-choice"]').forEach(input => input.addEventListener("change", () => {
  updateCompanionUI();
  if(selected("companion-choice") === "no") window.speechSynthesis?.cancel?.();
}));
document.querySelectorAll("[data-theme-choice]").forEach(card => card.addEventListener("click", () => {
  data.preferences.theme = card.dataset.themeChoice;
  applyTheme();
}));
$("preview-voice")?.addEventListener("click", () => {
  syncCompanionForm();
  const companion = selectedCompanionDefinition();
  speakText(companion?.intro || `Hello ${spokenUserName() || "there"}. I am ${spokenCompanionName()}.`, {force:true,allowWithoutCompanion:true});
});
$("companion-next")?.addEventListener("click", () => {
  syncCompanionForm();
  data.companion.configured = true;
  $("companion-error").textContent = "";
  save();
  updateCompanionUI();
  if(editMode === "companion"){
    editMode = null;
    show("settings", {speak:false});
  }else{
    $("personal-email").value = data.email;
    show("personal");
  }
});

["street-address","suburb","region","postcode"].forEach(id => $(id).addEventListener("input", updateAddressPreview));
$("country").addEventListener("change", () => {
  updateCountryFields();
  $("postcode").value = formatPostcode($("postcode").value, $("country").value);
  if($("mobile").value) $("mobile").value = formatPhone($("mobile").value, $("country").value);
  if($("phone").value) $("phone").value = formatPhone($("phone").value, $("country").value);
});
$("postcode").addEventListener("blur", () => {
  $("postcode").value = formatPostcode($("postcode").value, $("country").value);
  updateAddressPreview();
});
["mobile","phone"].forEach(id => $(id).addEventListener("blur", () => {
  $(id).value = formatPhone($(id).value, $("country").value);
}));

$("preview-user-name")?.addEventListener("click", () => {
  const given = $("full-name").value.trim();
  const preferred = $("preferred-name").value.trim() || given;
  const pronunciation = $("preferred-pronunciation").value.trim() || preferred;
  if(!preferred) return friendlyError("personal-error", "Enter your given name before previewing it.", "Please enter your given name first.");
  speakText(`Hello ${pronunciation}.`, {force:true,allowWithoutCompanion:true});
});

$("personal-next").addEventListener("click", () => {
  const givenName = $("full-name").value.trim();
  const preferredName = $("preferred-name").value.trim() || givenName;
  const email = (data.email || $("personal-email")?.value || "").trim();
  let error = "", spoken = "";
  if(!givenName){ error = "Please enter your given name."; spoken = "Please enter your given name before we continue."; }
  else if(!validEmail(email)){ error = "Please check your email address."; spoken = "Please check your email address before we continue."; }
  if(error) return friendlyError("personal-error", error, spoken);

  data.personal = {
    ...data.personal,
    givenName,
    fullName: givenName,
    preferredName,
    preferredPronunciation: $("preferred-pronunciation").value.trim(),
    email
  };
  data.email = email;
  save();
  if(editMode === "personal"){
    editMode = null;
    show("settings", {speak:false});
  }else show("health");
});

document.querySelectorAll(".segmented").forEach(group => group.addEventListener("click", event => {
  if(event.target.tagName !== "BUTTON") return;
  group.querySelectorAll("button").forEach(button => button.classList.toggle("active", button === event.target));
  const type = group.dataset.group;
  const value = event.target.dataset.value;
  if(type === "height-unit"){
    data.heightUnit = value;
    $("height-metric").classList.toggle("hidden", value !== "metric");
    $("height-imperial").classList.toggle("hidden", value !== "imperial");
  }else if(type === "weight-unit"){
    data.weightUnit = value;
    $("weight-metric").classList.toggle("hidden", value !== "metric");
    $("weight-imperial").classList.toggle("hidden", value !== "imperial");
  }
}));
function updateGoalOptions(){
  const goal = selected("goal");
  $("goal-options").classList.toggle("hidden", !goal);
  $("loss-options").classList.toggle("hidden", goal !== "lose");
  if(goal === "maintain"){
    const current = getWeightKg();
    if(current) $("selected-goal-weight").value = formatWeight(current);
  }
}
document.querySelectorAll('input[name="goal"]').forEach(input => input.addEventListener("change", updateGoalOptions));
function updateFastingOptions(){
  const custom = selected("fasting") === "custom";
  $("custom-fasting").classList.toggle("hidden", !custom);
}
document.querySelectorAll('input[name="fasting"]').forEach(input => input.addEventListener("change", updateFastingOptions));

function getHeightCm(){
  return data.heightUnit === "metric"
    ? Number($("height-cm").value)
    : Number($("height-ft").value) * 30.48 + Number($("height-in").value) * 2.54;
}
function getWeightKg(){
  return data.weightUnit === "metric"
    ? Number($("weight-kg").value)
    : Number($("weight-st").value) * 6.35029318 + Number($("weight-lb").value) * 0.45359237;
}
function fastingInputToKj(){
  const value = Number($("fasting-energy").value);
  if(!value) return 0;
  return data.personal.energyUnit === "Cal" ? roundWhole(value * 4.184) : roundWhole(value);
}
function fastingKjToDisplay(value){
  if(!value) return data.personal.energyUnit === "Cal" ? 500 : 2092;
  return data.personal.energyUnit === "Cal" ? roundWhole(value / 4.184) : roundWhole(value);
}
function energyDisplay(kj){
  if(!kj) return "Set manually";
  return data.personal.energyUnit === "Cal"
    ? `${roundWhole(kj / 4.184).toLocaleString()} Cal`
    : `${roundWhole(kj).toLocaleString()} kJ`;
}
function goalLabel(value){
  return value === "lose" ? "Lose weight" : value === "maintain" ? "Maintain weight" : value === "gain" ? "Gain weight" : "Not set";
}
function lossRateLabel(value){
  return value === "slow" ? "Slow & steady" : value === "fast" ? "Fast" : "Recommended";
}
function recommendedGoalFor(goal, weightKg, healthyLow, healthyHigh){
  if(goal === "maintain") return roundWhole(weightKg);
  if(goal === "lose") return roundWhole(Math.max(healthyLow, Math.min(weightKg - 1, healthyHigh)));
  return roundWhole(Math.max(weightKg + 1, healthyLow));
}
function validateGoalWeight(goal, currentWeight, targetWeight, healthyLow){
  if(!targetWeight || targetWeight < 30 || targetWeight > 400) return "Please enter a valid selected goal weight.";
  if(goal === "lose" && targetWeight >= currentWeight) return "For a weight-loss goal, your selected goal must be below your current weight.";
  if(goal === "lose" && targetWeight < roundWhole(healthyLow)) return "The selected goal is below the healthy-range estimate used by this trial. Please choose a higher goal or seek professional guidance.";
  if(goal === "gain" && targetWeight <= currentWeight) return "For a weight-gain goal, your selected goal must be above your current weight.";
  if(goal === "maintain" && Math.abs(targetWeight - currentWeight) > 1) return "For a maintenance goal, choose a goal close to your current weight.";
  return "";
}
function calculateRecommendationSet({
  sex, heightCm, weightKg, goal, lossRate, activity, age, selectedGoalWeight
}){
  const bmiRaw = weightKg / ((heightCm / 100) ** 2);
  const healthyLowRaw = 18.5 * ((heightCm / 100) ** 2);
  const healthyHighRaw = 24.9 * ((heightCm / 100) ** 2);
  const recommendedGoalWeight = recommendedGoalFor(goal, weightKg, healthyLowRaw, healthyHighRaw);
  let energyKj = null;
  let bmrCal = null;
  let tdeeCal = null;
  let adjustmentCal = 0;
  let minimumCal = null;
  let targetCal = null;

  if(sex !== "manual"){
    bmrCal = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
    tdeeCal = bmrCal * activity;
    adjustmentCal = goal === "lose"
      ? (lossRate === "slow" ? -250 : lossRate === "fast" ? -750 : -500)
      : goal === "gain" ? 250 : 0;
    minimumCal = sex === "male" ? 1500 : 1200;
    targetCal = Math.max(tdeeCal + adjustmentCal, minimumCal);
    energyKj = Math.round((targetCal * 4.184) / 100) * 100;
  }

  const protein = roundWhole((goal === "lose" ? 1.6 : 1.4) * weightKg);
  const fat = energyKj ? roundWhole(((energyKj / 4.184) * 0.28) / 9) : roundWhole(0.8 * weightKg);
  const carbs = energyKj ? Math.max(0, roundWhole(((energyKj / 4.184) - protein * 4 - fat * 9) / 4)) : 0;
  const chosenGoal = selectedGoalWeight || recommendedGoalWeight;
  const activityOptions = {1.2:"Mostly seated",1.375:"Lightly active",1.55:"Moderately active",1.725:"Very active",1.9:"Heavy physical work"};

  return {
    bmi: roundWeight(bmiRaw),
    healthyLow: roundWhole(healthyLowRaw),
    healthyHigh: roundWhole(healthyHighRaw),
    recommendedGoalWeight,
    selectedGoalWeight: roundWeight(chosenGoal),
    energyKj,
    protein,
    fat,
    carbs,
    basedOnWeightKg: roundWeight(weightKg),
    formulaName: "Mifflin–St Jeor",
    formulaVersion: "HEC-MSJ-1.0",
    bmrCal: bmrCal === null ? null : roundWhole(bmrCal),
    activityFactor: activity,
    activityLabel: activityOptions[activity] || "Manual activity factor",
    tdeeCal: tdeeCal === null ? null : roundWhole(tdeeCal),
    adjustmentCal,
    minimumCal,
    targetCal: targetCal === null ? null : roundWhole(targetCal),
    calculatedAt: new Date().toISOString()
  };
}
function collectHealthForm(){
  return {
    sex: $("calculation-sex").value,
    heightCm: getHeightCm(),
    weightKg: getWeightKg(),
    goal: selected("goal"),
    lossRate: selected("loss-rate") || "recommended",
    fasting: selected("fasting") || "none",
    fastingDays: checkedValues("fasting-day"),
    fastingEnergyKj: fastingInputToKj(),
    activity: Number($("activity").value),
    exerciseCredit: Number(selected("exercise-credit") || 0),
    selectedGoalWeight: Number($("selected-goal-weight").value) || 0
  };
}
$("calculate-button").addEventListener("click", () => {
  data.personal.dob = $("dob").value;
  data.personal.energyUnit = $("energy-unit").value;
  const form = collectHealthForm();
  const age = ageFromDob(data.personal.dob);
  let error = "", spoken = "";
  if(!data.personal.dob || age < 18 || age > 100){ error = "Please enter a valid date of birth for an adult user."; spoken = "Please check your date of birth. This founder trial is currently designed for adults."; }
  else if(!form.sex){ error = "Please select the option used for the energy calculation."; spoken = "Please choose the option used for your energy calculation."; }
  else if(!form.heightCm || form.heightCm < 100 || form.heightCm > 250){ error = "Please enter a valid height."; spoken = "Please check your height before we continue."; }
  else if(!form.weightKg || form.weightKg < 30 || form.weightKg > 400){ error = "Please enter a valid weight."; spoken = "Please check your weight before we continue."; }
  else if(!form.goal){ error = "Please choose a goal."; spoken = "Please choose whether you want to lose, maintain, or gain weight."; }
  else if(!form.activity){ error = "Please choose your daily activity."; spoken = "Please choose the daily activity level that suits you best."; }
  // Flexible fasting tools do not require permanent days or a fixed energy target during setup.
  if(error) return friendlyError("health-error", error, spoken);

  const preview = calculateRecommendationSet({
    sex: form.sex, heightCm: form.heightCm, weightKg: form.weightKg, goal: form.goal,
    lossRate: form.lossRate, activity: form.activity, age, selectedGoalWeight: form.selectedGoalWeight
  });
  const selectedError = validateGoalWeight(form.goal, form.weightKg, preview.selectedGoalWeight, preview.healthyLow);
  if(selectedError && form.selectedGoalWeight) return friendlyError("health-error", selectedError, selectedError);

  const startingWeight = data.health.startingWeightKg || form.weightKg;
  data.health = {
    ...data.health,
    sex: form.sex,
    heightCm: roundWeight(form.heightCm),
    startingWeightKg: roundWeight(startingWeight),
    currentWeightKg: roundWeight(form.weightKg),
    goal: form.goal,
    lossRate: form.lossRate,
    fasting: form.fasting,
    fastingDays: form.fasting === "custom" ? form.fastingDays : [],
    fastingEnergyKj: form.fasting === "custom" ? form.fastingEnergyKj : 0,
    activity: form.activity,
    exerciseCredit: form.exerciseCredit,
    selectedGoalWeight: preview.selectedGoalWeight,
    recommendedGoalWeight: preview.recommendedGoalWeight,
    lastCalculationWeightKg: roundWeight(form.weightKg)
  };
  data.recommendations = preview;
  if(form.goal === "maintain") data.goalMilestones = [];
  else if(!data.goalMilestones.length) data.goalMilestones = [];
  save();
  renderRecommendations();
  returnToSettingsAfterRecommendations = editMode === "health";
  show("recommendations");
});


function hydrationReference(){
  const status = String(data.dietary?.["pregnancy-status"] || "none").toLowerCase();
  if(status.includes("breast")) return {totalMl:3500, fluidsMl:2600, label:"Breastfeeding reference"};
  if(status.includes("pregnant")) return {totalMl:3100, fluidsMl:2300, label:"Pregnancy reference"};
  if(data.health.sex === "female") return {totalMl:2800, fluidsMl:2100, label:"Adult women reference"};
  if(data.health.sex === "male") return {totalMl:3400, fluidsMl:2600, label:"Adult men reference"};
  return {totalMl:2800, fluidsMl:2100, label:"General adult starting reference"};
}

function renderRecommendations(){
  const r = data.recommendations;
  if(!r || !Object.keys(r).length) return;
  const items = [
    ["BMI planning estimate", formatWeight(r.bmi), "One screening measure only; it does not define your health"],
    ["Reference weight range", `${r.healthyLow}–${r.healthyHigh} kg`, "General BMI reference, not a compulsory destination"],
    ["Recommended goal", `${formatWeight(r.recommendedGoalWeight)} kg`, "Guidance, not a compulsory target"],
    ["Daily energy", energyDisplay(r.energyKj), `Based on ${formatWeight(r.basedOnWeightKg)} kg`],
    ["Daily protein", `${roundWhole(r.protein)} g`, "Rounded starting estimate"],
    ["Daily fat", `${roundWhole(r.fat)} g`, "Rounded starting estimate"],
    ["Daily carbohydrate", r.carbs ? `${roundWhole(r.carbs)} g` : "Set manually", "Remaining energy estimate"]
  ];
  $("recommendation-grid").innerHTML = items.map(item =>
    `<div class="recommendation"><span>${escapeHtml(item[0])}</span><strong>${escapeHtml(item[1])}</strong><small>${escapeHtml(item[2])}</small></div>`
  ).join("");
  if($("calculation-breakdown")){
    if(r.targetCal){
      const adjustmentText = r.adjustmentCal === 0 ? "No goal adjustment" : `${r.adjustmentCal > 0 ? "+" : ""}${r.adjustmentCal.toLocaleString()} Cal goal adjustment`;
      const minimumText = r.targetCal === r.minimumCal ? ` The ${r.minimumCal.toLocaleString()} Cal founder-trial minimum was applied.` : "";
      $("calculation-breakdown").innerHTML = `<h3>How this energy figure was calculated</h3><div class="calculation-steps"><div><span>1 · Resting estimate</span><strong>${r.bmrCal.toLocaleString()} Cal</strong><small>${escapeHtml(r.formulaName)} · age, sex, height and weight</small></div><div><span>2 · Daily activity</span><strong>× ${r.activityFactor}</strong><small>${escapeHtml(r.activityLabel)} → ${r.tdeeCal.toLocaleString()} Cal maintenance estimate</small></div><div><span>3 · Goal adjustment</span><strong>${escapeHtml(adjustmentText)}</strong><small>Selected goal: ${escapeHtml(goalLabel(data.health.goal))} · ${escapeHtml(lossRateLabel(data.health.lossRate))}</small></div><div><span>4 · Starting target</span><strong>${r.targetCal.toLocaleString()} Cal</strong><small>${escapeHtml(energyDisplay(r.energyKj))}.${escapeHtml(minimumText)}</small></div></div><p class="fine">Calculation record: ${escapeHtml(r.formulaVersion)}. You can adjust the target manually before accepting it.</p>`;
    }else{
      $("calculation-breakdown").innerHTML = `<h3>Energy target set manually</h3><p>You chose not to use the automatic sex-based calculation. Enter the daily energy target you want to use.</p>`;
    }
  }
  if($("micronutrient-grid")){
    const age = ageFromDob(data.personal.dob);
    const hydration = hydrationReference();
    const micros = [["Fibre", data.health.sex === "male" ? "30 g" : "25 g"],["Hydration", `${hydration.totalMl.toLocaleString()} mL`, `Total water from drinks and food · about ${hydration.fluidsMl.toLocaleString()} mL usually comes from fluids`],["Sodium limit", "2,000 mg"],["Added sugar limit", "50 g"],["Calcium", age >= 70 ? "1,300 mg" : "1,000 mg"],["Iron", data.health.sex === "female" && age < 51 ? "18 mg" : "8 mg"],["Potassium", "3,500 mg"],["Magnesium", data.health.sex === "male" ? "420 mg" : "320 mg"],["Vitamin C", data.health.sex === "male" ? "90 mg" : "75 mg"],["Vitamin D", age >= 70 ? "20 µg" : "15 µg"],["Vitamin B12", "2.4 µg"],["Folate", "400 µg"]];
    $("micronutrient-grid").innerHTML = micros.map(x=>`<div class="recommendation"><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]||"General daily reference"}</small></div>`).join("");
    data.recommendations.waterMl=hydration.totalMl;
    data.recommendations.fluidsMl=hydration.fluidsMl;
    data.recommendations.hydrationReference=hydration.label;
  }
  $("recommended-goal-display").textContent = `${formatWeight(r.recommendedGoalWeight)} kg`;
  $("review-selected-goal").value = formatWeight(data.health.selectedGoalWeight || r.selectedGoalWeight);
  $("manual-energy-unit").textContent = data.personal.energyUnit;
  $("manual-energy").value = data.personal.energyUnit === "Cal" && r.energyKj ? roundWhole(r.energyKj / 4.184) : (r.energyKj || "");
  $("manual-protein").value = r.protein || "";
  $("manual-fat").value = r.fat || "";
  $("manual-carbs").value = r.carbs || "";
  $("accept-recommendations").checked = false;
  $("recommendation-error").textContent = "";
  $("milestone-error").textContent = "";
  data.goalMilestones = [];
  if(!r.energyKj){
    $("manual-fields").classList.remove("hidden");
    $("accept-recommendations").checked = false;
  }else $("manual-fields").classList.add("hidden");
}
function renderMilestones(){
  const container = $("milestone-list");
  if(!data.goalMilestones.length){
    container.innerHTML = '<div class="empty-state">No future goal stages added yet. Your selected goal above is your current target.</div>';
    return;
  }
  container.innerHTML = data.goalMilestones.map((milestone, index) => `
    <div class="milestone-row" data-index="${index}">
      <label>Future stage ${index + 1} weight (kg)<input class="milestone-weight" type="number" min="30" max="400" step="0.1" value="${escapeHtml(formatWeight(milestone.weightKg || ""))}"></label>
      <label>Optional target date<input class="milestone-date" type="date" value="${escapeHtml(milestone.targetDate || "")}"></label>
      <button type="button" class="remove-milestone" aria-label="Remove future goal stage">Remove</button>
    </div>`).join("");
  container.querySelectorAll(".remove-milestone").forEach(button => button.addEventListener("click", () => {
    const index = Number(button.closest(".milestone-row").dataset.index);
    data.goalMilestones.splice(index,1);
    renderMilestones();
  }));
}
$("add-milestone")?.addEventListener("click", () => {
  if(data.goalMilestones.length >= 5){
    toast("Up to five future goal stages can be added in this trial.");
    return;
  }
  data.goalMilestones.push({weightKg:"",targetDate:""});
  renderMilestones();
});
function collectMilestones(selectedGoalWeight){
  const rows = [...document.querySelectorAll(".milestone-row")];
  const milestones = rows.map(row => ({
    weightKg: Number(row.querySelector(".milestone-weight").value),
    targetDate: row.querySelector(".milestone-date").value
  }));
  let previous = selectedGoalWeight;
  for(let index=0; index<milestones.length; index++){
    const milestone = milestones[index];
    if(!milestone.weightKg || milestone.weightKg < 30 || milestone.weightKg > 400){
      return {error:`Please enter a valid weight for future stage ${index + 1}.`,milestones:[]};
    }
    if(data.health.goal === "lose" && milestone.weightKg >= previous){
      return {error:`Future stage ${index + 1} must be lower than the goal before it.`,milestones:[]};
    }
    if(data.health.goal === "gain" && milestone.weightKg <= previous){
      return {error:`Future stage ${index + 1} must be higher than the goal before it.`,milestones:[]};
    }
    previous = milestone.weightKg;
  }
  return {error:"", milestones:milestones.map(m => ({weightKg:roundWeight(m.weightKg),targetDate:m.targetDate}))};
}
$("manual-toggle").addEventListener("click", () => {
  $("manual-fields").classList.toggle("hidden");
  $("accept-recommendations").checked = false;
});
$("finish-setup").addEventListener("click", () => {
  const selectedGoalWeight = Number($("review-selected-goal").value);
  const goalError = validateGoalWeight(data.health.goal, data.health.currentWeightKg, selectedGoalWeight, data.recommendations.healthyLow);
  if(goalError) return friendlyError("milestone-error", goalError, goalError);

  const manual = !$("manual-fields").classList.contains("hidden");
  if(manual){
    const energy = Number($("manual-energy").value);
    const protein = Number($("manual-protein").value);
    const fat = Number($("manual-fat").value);
    const carbs = Number($("manual-carbs").value);
    if([energy,protein,fat,carbs].some(value => !value || value <= 0)){
      return friendlyError("recommendation-error", "Please enter a positive number in every manual field.", "Please complete every manual recommendation field with a positive number.");
    }
    data.recommendations.energyKj = data.personal.energyUnit === "Cal" ? roundWhole(energy * 4.184) : roundWhole(energy);
    data.recommendations.protein = roundWhole(protein);
    data.recommendations.fat = roundWhole(fat);
    data.recommendations.carbs = roundWhole(carbs);
  }else if(!$("accept-recommendations").checked){
    return friendlyError("recommendation-error", "Please accept the recommendations or choose manual adjustments.", "Please accept the recommendations, or choose manual adjustments before we continue.");
  }

  data.health.selectedGoalWeight = roundWeight(selectedGoalWeight);
  data.recommendations.selectedGoalWeight = roundWeight(selectedGoalWeight);
  data.recommendations.manual = manual;
  data.goalMilestones = [];
  data.completed = true;
  if(!data.weightHistory.length){
    data.weightHistory.push({date:todayISO(),weightKg:data.health.startingWeightKg,note:"Starting weight"});
  }
  save();
  if(returnToSettingsAfterRecommendations){
    returnToSettingsAfterRecommendations = false;
    editMode = null;
    show("settings", {speak:false});
  }else if(typeof window.openAlpha05Feature === "function") window.openAlpha05Feature("daily-progress");
  else show("daily-progress", {speak:false});
});

function greeting(){
  const hour = new Date().getHours();
  return hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
}
const HOME_GUIDANCE = [
  "Your plan is a flexible starting point. It can change as your life and progress change.",
  "You do not need a perfect day. Focus on the next helpful choice.",
  "Use Weight Check-in when your weight or selected goal changes.",
  "Planning tomorrow’s meals today can make healthy choices easier.",
  "A difficult meal does not spoil the whole day. Your next choice is a fresh start."
];
const INSPIRATION = [
  {type:"Joke",text:"Why did the tomato blush? It saw the salad dressing."},
  {type:"Healthy eating tip",text:"Build meals around foods you enjoy, then make small changes you can repeat."},
  {type:"Quote",text:"Progress grows from ordinary choices repeated often."},
  {type:"Food fact",text:"Frozen vegetables can be just as useful as fresh vegetables and are often easier to keep on hand."},
  {type:"Joke",text:"What is a vegetable’s favourite kind of music? Anything with a good beet."},
  {type:"Food thought",text:"One unplanned choice does not undo the helpful food choices you made before it."},
  {type:"Planning tip",text:"Deciding on lunch before the day becomes busy can reduce last-minute decisions."},
  {type:"Quote",text:"A realistic plan is more powerful than a perfect plan you cannot live with."},
  {type:"Food fact",text:"Protein and fibre can help a meal feel more satisfying."},
  {type:"Joke",text:"Why did the banana visit the doctor? It was not peeling well."},
  {type:"Hydration tip",text:"Keep water where you can see it. Visible reminders are easier to act on."},
  {type:"Food thought",text:"Today’s eating does not need to be flawless to be worthwhile."}
];
function currentDayIsFasting(){
  try{
    const functional = JSON.parse(localStorage.getItem(APP.functionalStorageKey)) || {};
    const date = todayISO();
    return functional.daySettings?.[date]?.type === "fasting";
  }catch(error){ return false; }
}
function homeMessage(){
  const name = displayName();
  const companion = selectedCompanionDefinition();
  if(data.companion.enabled){
    const support = currentDayIsFasting() && companion?.fasting ? companion.fasting : companion?.tagline || "Your plan is ready, and I’m here whenever you need guidance.";
    return `${greeting()}${name ? ", " + name : ""}. I’m ${companionDisplayName()}. ${support}`;
  }
  return `${greeting()}${name ? ", " + name : ""}. Your Healthy Eating Companion plan is ready. Written guidance is available throughout the app.`;
}
function renderHome(){
  const name = displayName();
  $("home-greeting").textContent = `${greeting()}${name ? ", " + name : ""}`;
  $("home-summary").textContent =
    `Current: ${formatWeight(data.health.currentWeightKg)} kg · Goal: ${formatWeight(data.health.selectedGoalWeight)} kg · Daily energy: ${energyDisplay(data.recommendations.energyKj)}`;

  const enabled = data.companion.enabled;
  const avatar = enabled ? data.companion.character : "🥗";
  const companionDefinition = selectedCompanionDefinition();
  const portrait = $("home-avatar-image");
  if(portrait){
    portrait.classList.toggle("hidden", !enabled || !companionDefinition);
    portrait.src = companionDefinition ? `assets/companions/${companionDefinition.id}.svg` : "";
    portrait.alt = companionDefinition ? `${companionDefinition.name} the ${companionDefinition.species}` : "";
  }
  $("home-avatar").classList.toggle("hidden", enabled && !!companionDefinition);
  $("home-avatar").textContent = avatar;
  $("message-avatar").textContent = avatar;
  $("home-companion-name").textContent = enabled ? companionDisplayName() : "Healthy Eating Companion";
  $("message-name").textContent = "Healthy Eating Companion";
  $("home-companion-action").textContent = enabled ? "Tap for guidance" : "Tap for written guidance";
  $("home-companion").classList.toggle("no-companion", !enabled);
  const dayNumber = Math.floor(Date.now() / 86400000);
  const index = Math.abs(dayNumber) % INSPIRATION.length;
  const item = INSPIRATION[index];
  $("message-type").textContent = item.type;
  $("message-text").textContent = item.text;
  updateCompanionUI();
}
$("home-companion").addEventListener("click", () => {
  const companion = selectedCompanionDefinition();
  const message = currentDayIsFasting() && companion?.fasting ? companion.fasting : HOME_GUIDANCE[Math.floor(Math.random() * HOME_GUIDANCE.length)];
  const full = data.companion.enabled ? `${displayName() ? displayName() + ", " : ""}${message}` : message;
  toast(full);
  if(data.companion.enabled) speakText(personaliseSpeech(full));
});
$("speak-home").addEventListener("click", () => speakText($("message-text").textContent, {force:true}));

document.querySelectorAll(".room").forEach(button => button.addEventListener("click", () => {
  const room = button.dataset.room;
  if(room === "settings"){ show("settings"); return; }
  if(room === "progress-weight"){ show("progress-weight-hub", {speak:false}); return; }
  if(typeof window.openAlpha05Feature === "function"){
    if(room === "daily-progress"){ window.openAlpha05Feature("daily-progress"); return; }
    if(room === "diary"){ window.openAlpha05Feature("food-diary"); return; }
    if(room === "database"){ window.openAlpha05Feature("food-library"); return; }
    if(room === "meal-planner"){ window.openAlpha05Feature("meal-planner"); return; }
    if(room === "shopping-list"){ window.openAlpha05Feature("shopping-list"); return; }
  }
  const map = {
    "daily-progress":["Daily Progress","📊","Today’s progress is loading."],
    diary:["Food Diary & Day Plan","🍽️","Meal planning and food logging are loading."],
    database:["Australian Food Library","🥕","The food library is loading."],
    "meal-planner":["Meal Planner","🗓️","Meal planning is loading."],
    "shopping-list":["Shopping List","🛒","Your shopping list is loading."]
  };
  const [title,icon,copy] = map[room] || ["Healthy Eating Companion","🧭","This room is being prepared."];
  $("placeholder-title").textContent = title;
  $("placeholder-icon").textContent = icon;
  $("placeholder-copy").textContent = copy;
  show("placeholder");
}));

function formatSavedAddress(){
  const p = data.personal;
  const parts = [];
  if(p.streetAddress) parts.push(p.streetAddress);
  const locality = [p.suburb,p.region,p.postcode].filter(Boolean).join(" ");
  if(locality) parts.push(locality);
  if(p.country) parts.push(p.country);
  return parts.join(", ") || "Not entered";
}
function renderSettings(){
  const companionText = data.companion.enabled
    ? `${escapeHtml(companionDisplayName())} ${data.companion.character}`
    : "Off — written guidance only";
  $("settings-summary").innerHTML = `
    <h3>${escapeHtml(data.personal.preferredName || data.personal.fullName || "Founder tester")}</h3>
    <div class="summary-grid">
      <div class="summary-item"><span>Language</span><strong>${escapeHtml(data.preferences.language)}</strong></div>
      <div class="summary-item"><span>Theme</span><strong>${escapeHtml(data.preferences.theme[0].toUpperCase() + data.preferences.theme.slice(1))}</strong></div>
      <div class="summary-item"><span>Email</span><strong>${escapeHtml(data.personal.email || data.email)}</strong></div>
      <div class="summary-item"><span>Address</span><strong>${escapeHtml(formatSavedAddress())}</strong></div>
      <div class="summary-item"><span>Mobile</span><strong>${escapeHtml(data.personal.mobile || "Not entered")}</strong></div>
      <div class="summary-item"><span>Companion</span><strong>${companionText}</strong></div>
      <div class="summary-item"><span>Goal</span><strong>${escapeHtml(goalLabel(data.health.goal))}: ${escapeHtml(formatWeight(data.health.selectedGoalWeight))} kg</strong></div>
      <div class="summary-item"><span>Current weight</span><strong>${escapeHtml(formatWeight(data.health.currentWeightKg))} kg</strong></div>
      <div class="summary-item"><span>Daily energy</span><strong>${escapeHtml(energyDisplay(data.recommendations.energyKj))}</strong></div>
      <div class="summary-item"><span>Spoken guidance</span><strong>${data.companion.enabled && data.companion.speechEnabled ? "On" : "Off"}</strong></div>
    </div>`;
  $("toggle-companion").textContent = data.companion.enabled ? "Turn Companion off" : "Turn Companion on";
  $("toggle-speech").textContent = data.companion.speechEnabled ? "Turn spoken guidance off" : "Turn spoken guidance on";
  $("toggle-speech").disabled = !data.companion.enabled;
}
$("edit-language").addEventListener("click", () => {
  editMode = "language";
  populateForms();
  show("language", {speak:false});
});
$("edit-personal").addEventListener("click", () => {
  editMode = "personal";
  populateForms();
  show("personal");
});
$("edit-health").addEventListener("click", () => {
  editMode = "health";
  populateForms();
  show("health");
});
$("edit-companion").addEventListener("click", () => {
  editMode = "companion";
  populateForms();
  show("companion", {speak:false});
});
$("toggle-companion").addEventListener("click", () => {
  if(data.companion.enabled){
    data.companion.enabled = false;
    window.speechSynthesis?.cancel?.();
    save();
    renderSettings();
    toast("Companion turned off. The full app remains available with written guidance.");
  }else if(!data.companion.name){
    data.companion.enabled = true;
    setRadio("companion-choice","yes");
    editMode = "companion";
    populateForms();
    show("companion", {speak:false});
  }else{
    data.companion.enabled = true;
    data.companion.configured = true;
    save();
    renderSettings();
    toast("Companion turned on.");
    if(data.companion.speechEnabled) speakText(`Hello ${spokenUserName() || "there"}. ${spokenCompanionName()} is ready.`, {force:true});
  }
});
$("toggle-speech").addEventListener("click", () => {
  if(!data.companion.enabled) return;
  data.companion.speechEnabled = !data.companion.speechEnabled;
  $("speech-enabled").checked = data.companion.speechEnabled;
  save();
  renderSettings();
  toast(`Spoken guidance turned ${data.companion.speechEnabled ? "on" : "off"}.`);
  if(data.companion.speechEnabled) speakText("Spoken guidance is now on.", {force:true});
});

function recalculateFromStored(){
  const age = ageFromDob(data.personal.dob);
  const fresh = calculateRecommendationSet({
    sex:data.health.sex,
    heightCm:data.health.heightCm,
    weightKg:data.health.currentWeightKg,
    goal:data.health.goal,
    lossRate:data.health.lossRate,
    activity:data.health.activity,
    age,
    selectedGoalWeight:data.health.selectedGoalWeight
  });
  if(data.recommendations.manual){
    fresh.energyKj = data.recommendations.energyKj;
    fresh.protein = data.recommendations.protein;
    fresh.fat = data.recommendations.fat;
    fresh.carbs = data.recommendations.carbs;
    fresh.manual = true;
  }else fresh.manual = false;
  data.recommendations = fresh;
  data.health.recommendedGoalWeight = fresh.recommendedGoalWeight;
  data.health.lastCalculationWeightKg = data.health.currentWeightKg;
}
function renderWeightCheckin(){
  $("checkin-date").value = todayISO();
  $("checkin-weight").value = formatWeight(data.health.currentWeightKg || data.health.startingWeightKg);
  $("checkin-goal").value = formatWeight(data.health.selectedGoalWeight || data.health.recommendedGoalWeight);
  $("checkin-error").textContent = "";
  $("checkin-result").classList.add("hidden");
  const history = [...data.weightHistory].sort((a,b) => String(b.date).localeCompare(String(a.date)));
  $("weight-history").innerHTML = history.length
    ? `<table class="history-table"><thead><tr><th>Date</th><th>Weight</th><th>Note</th></tr></thead><tbody>${history.map(item =>
        `<tr><td>${escapeHtml(item.date)}</td><td>${escapeHtml(formatWeight(item.weightKg))} kg</td><td>${escapeHtml(item.note || "")}</td></tr>`
      ).join("")}</tbody></table>`
    : '<div class="empty-state">No weight check-ins have been recorded yet.</div>';
  updateCompanionUI();
}
$("save-checkin").addEventListener("click", () => {
  const date = $("checkin-date").value || todayISO();
  const weight = Number($("checkin-weight").value);
  const goal = Number($("checkin-goal").value);
  if(!weight || weight < 30 || weight > 400) return friendlyError("checkin-error", "Please enter a valid current weight.", "Please check your current weight.");
  const goalError = validateGoalWeight(data.health.goal, weight, goal, data.recommendations.healthyLow || 0);
  if(goalError) return friendlyError("checkin-error", goalError, goalError);

  const previousCalculationWeight = Number(data.health.lastCalculationWeightKg || data.health.currentWeightKg || weight);
  const goalChanged = Math.abs(goal - Number(data.health.selectedGoalWeight || 0)) >= 0.1;
  const meaningfulWeightChange = Math.abs(weight - previousCalculationWeight) >= 1;

  data.health.currentWeightKg = roundWeight(weight);
  data.health.selectedGoalWeight = roundWeight(goal);
  data.recommendations.selectedGoalWeight = roundWeight(goal);

  const existing = data.weightHistory.find(item => item.date === date);
  if(existing){
    existing.weightKg = roundWeight(weight);
    existing.note = "Updated check-in";
  }else data.weightHistory.push({date,weightKg:roundWeight(weight),note:"Progress check-in"});

  let message;
  if(meaningfulWeightChange || goalChanged){
    recalculateFromStored();
    message = data.recommendations.manual
      ? `Check-in saved. Your goal and health estimates were refreshed, while your manually chosen energy and nutrient targets were retained.`
      : `Check-in saved. Recommendations were recalculated using ${formatWeight(weight)} kg and your selected goal of ${formatWeight(goal)} kg.`;
  }else{
    message = "Check-in saved. The change was less than 1 kg, so your recommendations stayed steady to avoid reacting to a small fluctuation.";
  }
  save();
  $("checkin-result").innerHTML = `<strong>Saved</strong><p>${escapeHtml(message)} Current daily energy: ${escapeHtml(energyDisplay(data.recommendations.energyKj))}.</p>`;
  $("checkin-result").classList.remove("hidden");
  renderWeightHistoryOnly();
  if(data.companion.enabled) speakText(message);
});
function renderWeightHistoryOnly(){
  const history = [...data.weightHistory].sort((a,b) => String(b.date).localeCompare(String(a.date)));
  $("weight-history").innerHTML = `<table class="history-table"><thead><tr><th>Date</th><th>Weight</th><th>Note</th></tr></thead><tbody>${history.map(item =>
    `<tr><td>${escapeHtml(item.date)}</td><td>${escapeHtml(formatWeight(item.weightKg))} kg</td><td>${escapeHtml(item.note || "")}</td></tr>`
  ).join("")}</tbody></table>`;
}

$("reset-trial").addEventListener("click", () => {
  if(confirm("Reset this founder trial and delete the saved profile on this device?")){
    localStorage.removeItem(KEY);
    LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
    location.reload();
  }
});

function populateForms(){
  applyTheme();
  applyLanguage();

  $("register-email").value = data.email || "";
  $("personal-email").value = data.personal.email || data.email || "";
  $("full-name").value = data.personal.givenName || data.personal.fullName || "";
  $("preferred-name").value = data.personal.preferredName || "";
  $("preferred-pronunciation").value = data.personal.preferredPronunciation || "";
  $("dob").value = data.personal.dob || "";
  $("energy-unit").value = data.personal.energyUnit || "kJ";

  $("country").value = data.personal.country || suggestedCountryForLanguage(data.preferences.language);
  $("region").value = data.personal.region || "";
  $("postcode").value = data.personal.postcode || "";
  $("suburb").value = data.personal.suburb || "";
  $("street-address").value = data.personal.streetAddress || "";
  $("mobile").value = data.personal.mobile || "";
  $("phone").value = data.personal.phone || "";
  updateCountryFields();

  data.companion = normaliseCompanionRecord(data.companion);
  setRadio("companion-choice", data.companion.enabled ? "yes" : "no");
  if($("speech-enabled")) $("speech-enabled").checked = data.companion.speechEnabled !== false;

  $("calculation-sex").value = data.health.sex || "";
  const height = Number(data.health.heightCm) || 0;
  $("height-cm").value = height ? formatWeight(height) : "";
  if(height){
    const totalInches = height / 2.54;
    $("height-ft").value = Math.floor(totalInches / 12);
    $("height-in").value = roundWeight(totalInches % 12);
  }else{
    $("height-ft").value = "";
    $("height-in").value = "";
  }

  const weight = Number(data.health.currentWeightKg || data.health.startingWeightKg) || 0;
  $("weight-kg").value = weight ? formatWeight(weight) : "";
  if(weight){
    const totalPounds = weight / 0.45359237;
    $("weight-st").value = Math.floor(totalPounds / 14);
    $("weight-lb").value = roundWeight(totalPounds % 14);
  }else{
    $("weight-st").value = "";
    $("weight-lb").value = "";
  }

  document.querySelectorAll('[data-group="height-unit"] button').forEach(button => button.classList.toggle("active", button.dataset.value === data.heightUnit));
  document.querySelectorAll('[data-group="weight-unit"] button').forEach(button => button.classList.toggle("active", button.dataset.value === data.weightUnit));
  $("height-metric").classList.toggle("hidden", data.heightUnit !== "metric");
  $("height-imperial").classList.toggle("hidden", data.heightUnit !== "imperial");
  $("weight-metric").classList.toggle("hidden", data.weightUnit !== "metric");
  $("weight-imperial").classList.toggle("hidden", data.weightUnit !== "imperial");

  setRadio("goal", data.health.goal);
  setRadio("loss-rate", data.health.lossRate || "recommended");
  setRadio("fasting", data.health.fasting || "none");
  setRadio("exercise-credit", String(data.health.exerciseCredit || 0));
  $("selected-goal-weight").value = data.health.selectedGoalWeight ? formatWeight(data.health.selectedGoalWeight) : "";
  $("activity").value = data.health.activity || "";
  document.querySelectorAll('input[name="fasting-day"]').forEach(input => input.checked = (data.health.fastingDays || []).includes(input.value));
  $("fasting-unit-label").textContent = data.personal.energyUnit || "kJ";
  $("fasting-energy").value = fastingKjToDisplay(data.health.fastingEnergyKj);
  $("weight-legend").textContent = data.completed ? "Current weight *" : "Starting weight *";
  updateGoalOptions();
  updateFastingOptions();

  renderCharacters();
  populateVoices();
  updateCompanionUI();
  updateAddressPreview();
  if(Object.keys(data.recommendations || {}).length) renderRecommendations();
}

data = loadStoredData();
data.version = VERSION;
if(data.personal.energyUnit === "Calories") data.personal.energyUnit = "Cal";
if(!data.personal.givenName && data.personal.fullName) data.personal.givenName = data.personal.fullName.trim().split(/\s+/)[0];
if(!data.personal.fullName && data.personal.givenName) data.personal.fullName = data.personal.givenName;
if(!data.personal.preferredName && (data.personal.givenName || data.personal.fullName)) data.personal.preferredName = (data.personal.givenName || data.personal.fullName).trim().split(/\s+/)[0];
data.companion = normaliseCompanionRecord(data.companion);
if(!data.preferences) data.preferences = clone(DEFAULTS.preferences);
if(!data.goalMilestones) data.goalMilestones = [];
if(!data.weightHistory) data.weightHistory = [];
applyTheme();
populateForms();
save();
if(data.completed) show("home", {speak:false}); // alpha06.js immediately opens Daily Progress once functional data is ready.
else show("welcome", {speak:false});

if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}
