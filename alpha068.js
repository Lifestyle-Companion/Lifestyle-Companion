(() => {
"use strict";
const $=id=>document.getElementById(id);
const APP=window.HEC_APP||{};
const mainKey=APP.storageKey||"healthyEatingCompanionAlpha06";
const extKey=APP.functionalStorageKey||"healthyEatingCompanionAlpha06Functional";
const read=(k)=>{try{return JSON.parse(localStorage.getItem(k))||{};}catch{return {};}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const toast=(m)=>{const t=$("a05-toast-copy");if(t){t.textContent=m;$("a05-action-toast")?.classList.add("show");setTimeout(()=>$("a05-action-toast")?.classList.remove("show"),3500);}else alert(m);};

// Country-dependent region choices.
const regions={
 Australia:["Australian Capital Territory","New South Wales","Northern Territory","Queensland","South Australia","Tasmania","Victoria","Western Australia"],
 "New Zealand":["Auckland","Bay of Plenty","Canterbury","Gisborne","Hawke's Bay","Manawatū-Whanganui","Marlborough","Nelson","Northland","Otago","Southland","Taranaki","Tasman","Waikato","Wellington","West Coast"],
 Canada:["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Nova Scotia","Ontario","Prince Edward Island","Quebec","Saskatchewan","Northwest Territories","Nunavut","Yukon"],
 "United States":["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"]
};
function updateRegion(){const country=$("profile-country")?.value||"Australia",select=$("profile-region"),label=$("profile-region-label");if(!select)return;const current=select.value;const list=regions[country]||[];label.textContent=country==="Australia"?"State Or Territory":country==="Canada"?"Province Or Territory":"State, Territory Or Province";select.innerHTML=`<option value="">Choose ${label.textContent}</option>`+list.map(x=>`<option>${x}</option>`).join("")+(list.length?"":`<option>Other</option>`);if([...select.options].some(o=>o.value===current))select.value=current;}
$("profile-country")?.addEventListener("change",updateRegion);updateRegion();

// Companion preview overlay immediately after tapping a companion.
document.addEventListener("click",e=>{const card=e.target.closest("[data-companion-id]");if(!card)return;setTimeout(()=>{const preview=$("companion-preview");if(!preview?.innerHTML)return;let overlay=$("companion-preview-overlay");if(!overlay){overlay=document.createElement("div");overlay.id="companion-preview-overlay";overlay.className="companion-preview-overlay";overlay.innerHTML='<div class="companion-preview-dialog"><button class="companion-preview-close" type="button">× Back To Companions</button><div class="companion-preview-content"></div><button class="primary wide companion-preview-choose" type="button">Choose This Companion</button></div>';document.body.appendChild(overlay);overlay.addEventListener("click",ev=>{if(ev.target===overlay||ev.target.closest(".companion-preview-close"))overlay.classList.remove("open");});overlay.querySelector(".companion-preview-choose").addEventListener("click",()=>overlay.classList.remove("open"));}overlay.querySelector(".companion-preview-content").innerHTML=preview.innerHTML;const name=overlay.querySelector("h3")?.textContent?.split(" the ")[0]||"Companion";overlay.querySelector(".companion-preview-choose").textContent=`Choose ${name}`;overlay.classList.add("open");},0);},true);

// Keep live food results visible above the mobile keyboard.
$("food-search")?.addEventListener("input",()=>{setTimeout(()=>{$("food-results")?.scrollIntoView({behavior:"smooth",block:"nearest"});},120);});

// Clear an entire meal with confirmation and undo-friendly local update.
document.addEventListener("click",e=>{const btn=e.target.closest("[data-clear-diary-meal]");if(!btn)return;e.preventDefault();e.stopImmediatePropagation();const meal=btn.dataset.clearDiaryMeal;if(!confirm(`Clear all entries from ${meal}?`))return;const ext=read(extKey),date=ext.ui?.diaryDate||new Date().toISOString().slice(0,10);const before=[...(ext.diary?.[date]||[])];ext.diary[date]=(ext.diary?.[date]||[]).filter(x=>x.meal!==meal);write(extKey,ext);toast(`${meal} cleared. Reloading the Diary.`);setTimeout(()=>location.reload(),350);},true);

// Quick drink workflow. Nutrient drinks become Diary entries; water/zero drinks update hydration.
$("quick-drink-type")?.addEventListener("change",e=>$("quick-drink-other-wrap")?.classList.toggle("hidden",e.target.value!=="other"));
$("add-quick-drink")?.addEventListener("click",()=>{const type=$("quick-drink-type").value,amount=Number($("quick-drink-amount").value);if(!type||!amount){toast("Choose a drink and amount first.");return;}const ext=read(extKey),date=ext.ui?.progressDate||new Date().toISOString().slice(0,10);ext.water=ext.water||{};const zero=["water","tea","diet-soft-drink"];if(zero.includes(type)){ext.water[date]=Number(ext.water[date]||0)+amount;write(extKey,ext);toast("Drink added to hydration.");location.reload();return;}const map={"light-milk-au":["Australian Light Milk",86,7,10,2.8,10],juice:["Fruit Juice",110,2,25,.5,21],"soft-drink":["Regular Soft Drink",161,0,40,0,40],cordial:["Cordial",100,0,25,0,24],smoothie:["Smoothie",180,6,32,3,25],soup:["Soup Or Broth",80,4,10,2,3],other:[$("quick-drink-other").value.trim()||"Other Drink",100,0,25,0,20]};const m=map[type],factor=amount/250;ext.diary=ext.diary||{};ext.diary[date]=ext.diary[date]||[];ext.diary[date].push({id:`drink-${Date.now()}`,foodId:type,name:m[0],brand:"Quick Drink",date,meal:"Snacks",status:"eaten",amount,unit:"mL",unitLabel:"mL",time:"",notes:"Added from Daily Progress",nutrients:{calories:m[1]*factor,protein:m[2]*factor,carbs:m[3]*factor,fat:m[4]*factor,satFat:0,fibre:0,sugar:m[5]*factor,sodium:0},foodGroups:{vegetables:0,fruit:type==="juice"?.5:0,grains:0,proteinFoods:0,dairy:type==="light-milk-au"?amount/250:0},waterMl:amount,hydrationType:"drink",createdAt:new Date().toISOString()});write(extKey,ext);toast(`${m[0]} added to hydration and Diary.`);location.reload();});

// Voice review must have a meal and preserves full recognised phrase guidance.
const confirmVoice=$("confirm-voice-log");if(confirmVoice)confirmVoice.addEventListener("click",e=>{if(!$("voice-meal")?.value){e.preventDefault();e.stopImmediatePropagation();toast("Choose where this food should be added.");$("voice-meal")?.focus();}},true);

// Details label changes when expanded.
document.querySelectorAll(".recommendation-details").forEach(d=>d.addEventListener("toggle",()=>{const a=d.querySelector(".details-action");if(a)a.textContent=d.open?"Hide Details":"Show Details";}));
})();
