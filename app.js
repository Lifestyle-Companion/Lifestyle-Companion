(() => {
"use strict";
const KEY="lifestyleCompanionAlpha141";
const characters=["🐵","🐶","🐨","🦘","🦉","🐯","🐻","🦊","🐰","🧑","👩","🧔"];
const rooms=[
 {id:"food",icon:"🍽️",name:"Food & Nutrition",available:true},
 {id:"planner",icon:"📅",name:"Planner",available:false},
 {id:"shopping",icon:"🛒",name:"Shopping",available:false},
 {id:"budget",icon:"💰",name:"Budget",available:false},
 {id:"journal",icon:"📖",name:"Journal",available:false},
 {id:"exercise",icon:"🚶",name:"Exercise",available:false},
 {id:"navigation",icon:"🧭",name:"Navigation",available:false},
 {id:"settings",icon:"⚙️",name:"Settings",available:true}
];
const steps=[
 ["Welcome","A quick explanation before we begin.","We’ll take this one page at a time. Nothing here should feel rushed."],
 ["About you","The basics your Companion needs.","Tell me what you prefer to be called. You can change any detail later."],
 ["Address","Your main and postal addresses.","This page is optional. Tick the box when your postal address is the same."],
 ["Phone numbers","Only the numbers you use.","Every phone number is optional. Leave any field blank if it does not apply."],
 ["Your Companion","Choose the character and personality.","Pick the Companion that feels welcoming to you."],
 ["Companion voice","Choose and preview a device voice.","The list depends on voices installed on this device."],
 ["Your Rooms","Set up only what you want now.","All Rooms remain visible. You are not committing to every feature today."],
 ["Review","Check every section before creating the profile.","Use Edit beside any section that needs correcting, then tick each section when it is right."]
];
let state={profiles:[],activeId:null,analytics:[]};
let draft=null, step=1, editingId=null, voices=[], selectedVoiceIndex=-1;

const $=id=>document.getElementById(id);
const qsa=s=>[...document.querySelectorAll(s)];
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&Array.isArray(x.profiles))state=x}catch(e){}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function show(id){qsa(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active");window.scrollTo({top:0,left:0,behavior:"auto"})}
function toast(t){const x=$("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function newDraft(){return {id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),preferredName:"",fullName:"",dob:"",email:"",home:{street:"",suburb:"",state:"",postcode:"",country:"Australia"},postalSame:true,postal:{street:"",suburb:"",state:"",postcode:"",country:"Australia"},phones:{mobile:{cc:"+61",number:""},home:{cc:"+61",number:""},business:{cc:"+61",number:""},other:{cc:"+61",number:""}},companion:{name:"",phonetic:"",character:"🐵",personality:"calm",theme:"garden",voiceURI:""},rooms:["food","settings"],food:{weight:"",height:"",activity:"",goal:"",goalWeight:"",fasting:"No fasting plan"},reviewed:{}}}
function startWizard(profile=null, goto=1){editingId=profile?.id||null;draft=profile?JSON.parse(JSON.stringify(profile)):newDraft();step=goto;fill();renderStep();show("wizard")}
function readForm(){
 draft.preferredName=$("preferred-name").value.trim();draft.fullName=$("full-name").value.trim();draft.dob=$("dob").value;draft.email=$("email").value.trim();
 draft.home={street:$("home-street").value.trim(),suburb:$("home-suburb").value.trim(),state:$("home-state").value,postcode:$("home-postcode").value.trim(),country:$("home-country").value.trim()};
 draft.postalSame=$("postal-same").checked;draft.postal={street:$("postal-street").value.trim(),suburb:$("postal-suburb").value.trim(),state:$("postal-state").value,postcode:$("postal-postcode").value.trim(),country:$("postal-country").value.trim()};
 draft.phones={mobile:{cc:$("mobile-country").value,number:$("mobile-number").value.trim()},home:{cc:$("home-phone-country").value,number:$("home-phone-number").value.trim()},business:{cc:$("business-country").value,number:$("business-number").value.trim()},other:{cc:$("other-country").value,number:$("other-number").value.trim()}};
 draft.companion.name=$("companion-name").value.trim();draft.companion.phonetic=$("companion-phonetic").value.trim();draft.companion.personality=$("personality").value;draft.companion.theme=$("theme").value;
 draft.rooms=qsa("[data-room-check]:checked").map(x=>x.value);if(!draft.rooms.includes("settings"))draft.rooms.push("settings");
 draft.food={weight:$("weight").value,height:$("height").value,activity:$("activity").value,goal:$("goal").value,goalWeight:$("goal-weight").value,fasting:$("fasting").value};
}
function fill(){
 $("preferred-name").value=draft.preferredName;$("full-name").value=draft.fullName;$("dob").value=draft.dob;$("email").value=draft.email;
 for(const k of ["street","suburb","state","postcode","country"])$("home-"+k).value=draft.home[k]||"";
 $("postal-same").checked=draft.postalSame;for(const k of ["street","suburb","state","postcode","country"])$("postal-"+k).value=draft.postal[k]||"";
 $("postal-fields").classList.toggle("hidden",draft.postalSame);
 [["mobile","mobile"],["home","home-phone"],["business","business"],["other","other"]].forEach(([k,p])=>{$(p+"-country").value=draft.phones[k].cc;$(p+"-number").value=draft.phones[k].number});
 $("companion-name").value=draft.companion.name;$("companion-phonetic").value=draft.companion.phonetic;$("personality").value=draft.companion.personality;$("theme").value=draft.companion.theme;
 renderCharacters();renderRooms();$("weight").value=draft.food.weight;$("height").value=draft.food.height;$("activity").value=draft.food.activity;$("goal").value=draft.food.goal;$("goal-weight").value=draft.food.goalWeight;$("fasting").value=draft.food.fasting;
}
function renderCharacters(){
 $("character-grid").innerHTML=characters.map(c=>`<button type="button" class="character ${draft.companion.character===c?"selected":""}" data-character="${c}">${c}</button>`).join("");
 qsa("[data-character]").forEach(b=>b.onclick=()=>{draft.companion.character=b.dataset.character;renderCharacters();updateTeacher()});
}
function renderRooms(){
 $("room-list").innerHTML=rooms.map(r=>`<div class="room-row"><span>${r.icon}</span><label><span><b>${r.name}</b><small>${r.available?"Available in this trial":"Coming Soon"}</small></span><input data-room-check type="checkbox" value="${r.id}" ${draft.rooms.includes(r.id)?"checked":""} ${r.id==="settings"?"disabled":""}></label></div>`).join("");
 qsa("[data-room-check]").forEach(x=>x.onchange=()=>{readForm();$("food-panel").classList.toggle("hidden",!draft.rooms.includes("food"))});
 $("food-panel").classList.toggle("hidden",!draft.rooms.includes("food"));
}
function renderStep(){
 qsa(".step").forEach(x=>x.classList.toggle("active",Number(x.dataset.step)===step));
 $("step-title").textContent=steps[step-1][0];$("step-subtitle").textContent=steps[step-1][1];$("step-count").textContent=`${step} of 8`;$("progress-bar").style.width=`${step*12.5}%`;
 $("previous").style.visibility=step===1?"hidden":"visible";$("next").textContent=step===8?(editingId?"Save Changes":"Create Profile"):"Continue";if(step<8){$("next").disabled=false;$("next").style.opacity="1"}
 if(step===8)renderReview();updateTeacher();window.scrollTo({top:0,left:0,behavior:"auto"});
}
function updateTeacher(){
 const enabled=$("teacher-enabled").checked;document.querySelector(".teacher").style.display=enabled?"flex":"none";
 $("teacher-avatar").textContent=draft?.companion?.character||"🐵";$("teacher-name").textContent=draft?.companion?.name||"Your Companion";$("teacher-text").textContent=steps[step-1][2];
}

function digitsOnly(value){return String(value||"").replace(/\D/g,"")}
function formatAustralianPhone(value,type){
 const d=digitsOnly(value).slice(0,10);
 if(type==="mobile"){
   if(d.length<=4)return d;
   if(d.length<=7)return `${d.slice(0,4)} ${d.slice(4)}`;
   return `${d.slice(0,4)} ${d.slice(4,7)} ${d.slice(7)}`;
 }
 if(d.startsWith("0")){
   if(d.length<=2)return d;
   if(d.length<=6)return `${d.slice(0,2)} ${d.slice(2)}`;
   return `${d.slice(0,2)} ${d.slice(2,6)} ${d.slice(6)}`;
 }
 if(d.length<=4)return d;
 if(d.length<=7)return `${d.slice(0,4)} ${d.slice(4)}`;
 return `${d.slice(0,4)} ${d.slice(4,7)} ${d.slice(7)}`;
}
function validateAustralianPhone(inputId,countryId,errorId,type,showEmpty=false){
 const input=$(inputId), cc=$(countryId).value, error=$(errorId), d=digitsOnly(input.value);
 input.classList.remove("invalid");error.textContent="";
 if(!d)return true;
 if(cc!=="+61")return true;
 let message="";
 if(d.length!==10)message=`This number has ${d.length} digits. Australian ${type==="mobile"?"mobile":"phone"} numbers normally have 10 digits.`;
 else if(type==="mobile"&&!d.startsWith("04"))message="Australian mobile numbers should begin with 04.";
 else if(type!=="mobile"&&!/^0[2378]/.test(d))message="This does not look like a valid Australian landline number. It should begin with 02, 03, 07 or 08.";
 if(message){input.classList.add("invalid");error.textContent=message;return false}
 return true;
}
function validateAllPhones(){
 const checks=[
  validateAustralianPhone("mobile-number","mobile-country","mobile-error","mobile"),
  validateAustralianPhone("home-phone-number","home-phone-country","home-phone-error","landline"),
  validateAustralianPhone("business-number","business-country","business-error","landline"),
  validateAustralianPhone("other-number","other-country","other-error","other")
 ];
 return checks.every(Boolean);
}
function formatAustralianDate(value){
 if(!value)return "Not provided";
 const parts=value.split("-");
 return parts.length===3?`${parts[2]}-${parts[1]}-${parts[0]}`:value;
}
function titleCase(value){return String(value||"").replace(/\b\w/g,c=>c.toUpperCase())}

function validate(){
 if(step===2&&(!$("preferred-name").value.trim()||!$("full-name").value.trim())){toast("Please enter preferred name and full name.");return false}
 if(step===4&&!validateAllPhones()){toast("Please check the highlighted phone number.");return false}
 if(step===5&&!$("companion-name").value.trim()){toast("Please give your Companion a name.");return false}
 return true;
}
function formatAddress(a){return [a.street,a.suburb,[a.state,a.postcode].filter(Boolean).join(" "),a.country].filter(Boolean).join(", ")||"Not provided"}
function phoneText(p){return p.number?`${p.cc} ${p.number}`:"Not provided"}
const reviewDefs=[
 ["about","About you",2,()=>`Preferred name: ${draft.preferredName||"Not provided"}\nFull name: ${draft.fullName||"Not provided"}\nDate of birth: ${formatAustralianDate(draft.dob)}\nEmail: ${draft.email||"Not provided"}`],
 ["address","Address",3,()=>`Main: ${formatAddress(draft.home)}\nPostal: ${draft.postalSame?"Same as main address":formatAddress(draft.postal)}`],
 ["phones","Phone numbers",4,()=>`Mobile: ${phoneText(draft.phones.mobile)}\nHome: ${phoneText(draft.phones.home)}\nBusiness: ${phoneText(draft.phones.business)}\nOther: ${phoneText(draft.phones.other)}`],
 ["companion","Companion",5,()=>`Name: ${draft.companion.name||"Not provided"}\nCharacter: ${draft.companion.character}\nPersonality: ${titleCase(draft.companion.personality)}\nTheme: ${titleCase(draft.companion.theme)}`],
 ["voice","Voice",6,()=>draft.companion.voiceURI?`Selected device voice: ${draft.companion.voiceURI}`:"Default device voice"],
 ["rooms","Rooms",7,()=>`Set up now: ${rooms.filter(r=>draft.rooms.includes(r.id)).map(r=>r.name).join(", ")}`],
 ["food","Food & Nutrition",7,()=>draft.rooms.includes("food")?`Starting Weight: ${draft.food.weight||"Not provided"} kg\nHeight: ${draft.food.height||"Not provided"} cm\nActivity: ${draft.food.activity||"Not provided"}\nGoal: ${draft.food.goal||"Not provided"}\nGoal weight: ${draft.food.goalWeight||"Not provided"} kg\nFasting: ${draft.food.fasting}`:"Not selected for setup"]
];
function renderReview(){
 readForm();$("review-avatar").textContent=draft.companion.character;
 $("review-sections").innerHTML=reviewDefs.map(([id,title,target,text])=>`<section class="review-block"><div class="review-head"><h4>${title}</h4><button type="button" class="secondary" data-edit-step="${target}">Edit</button></div><div class="review-content">${escapeHtml(text())}</div><label class="review-confirm"><input type="checkbox" data-reviewed="${id}" ${draft.reviewed[id]?"checked":""}> I have reviewed this section</label></section>`).join("");
 qsa("[data-edit-step]").forEach(b=>b.onclick=()=>{readForm();step=Number(b.dataset.editStep);renderStep()});
 qsa("[data-reviewed]").forEach(c=>c.onchange=()=>{draft.reviewed[c.dataset.reviewed]=c.checked;updateReviewStatus()});updateReviewStatus();
}
function updateReviewStatus(){const all=reviewDefs.every(d=>draft.reviewed[d[0]]);$("review-status").classList.toggle("ready",all);$("review-status").textContent=all?"Everything has been reviewed. Your profile is ready.":"Review all sections to create the profile.";$("next").disabled=!all;$("next").style.opacity=all?"1":".5"}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function finish(){
 readForm();const i=state.profiles.findIndex(p=>p.id===draft.id);if(i>=0)state.profiles[i]=draft;else state.profiles.push(draft);state.activeId=draft.id;save();openHome(draft)
}
function renderProfiles(){
 if(!state.profiles.length){$("profile-list").innerHTML='<div class="card centre"><h3>No profiles yet</h3><p>Create the first Alpha 1.4 trial profile.</p></div>';return}
 $("profile-list").innerHTML=state.profiles.map(p=>`<div class="profile-card"><div class="profile-avatar">${p.companion.character}</div><div class="grow"><b>${escapeHtml(p.preferredName)}</b><small>${escapeHtml(p.companion.name)} · ${p.rooms.length} Rooms selected</small></div><div class="profile-actions"><button data-open="${p.id}">Open</button><button data-edit="${p.id}">Edit</button><button data-delete="${p.id}">Delete</button></div></div>`).join("");
 qsa("[data-open]").forEach(b=>b.onclick=()=>{state.activeId=b.dataset.open;save();openHome(state.profiles.find(p=>p.id===b.dataset.open))});
 qsa("[data-edit]").forEach(b=>b.onclick=()=>startWizard(state.profiles.find(p=>p.id===b.dataset.edit),2));
 qsa("[data-delete]").forEach(b=>b.onclick=()=>{if(confirm("Delete this profile?")){state.profiles=state.profiles.filter(p=>p.id!==b.dataset.delete);if(state.activeId===b.dataset.delete)state.activeId=null;save();renderProfiles()}});
}
function openHome(p){
 $("profile-chip").textContent=p.companion.character;$("home-avatar").textContent=p.companion.character;$("thought-avatar").textContent=p.companion.character;$("home-companion").textContent=p.companion.name;
 const h=new Date().getHours(),part=h<12?"morning":h<18?"afternoon":"evening";$("greeting").textContent=`Good ${part}, ${p.preferredName}`;$("home-message").textContent=`${p.companion.name} is ready to help.`;$("thought-text").textContent=`Welcome, ${p.preferredName}. Tap any Room. Unfinished Rooms will clearly say “Coming Soon”.`;
 qsa(".room").forEach(b=>b.classList.toggle("enabled",p.rooms.includes(b.dataset.room)));show("home")
}
function activeProfile(){return state.profiles.find(p=>p.id===state.activeId)||state.profiles[0]}
function loadVoices(){
 voices=speechSynthesis?.getVoices?.()||[];const au=voices.filter(v=>/en-AU/i.test(v.lang)), en=voices.filter(v=>/^en/i.test(v.lang));const list=(au.length?au:en.length?en:voices).slice(0,12);
 $("voice-note").textContent=list.length?`${list.length} compatible voice${list.length===1?"":"s"} found on this device.`:"No selectable browser voices were reported. The device default will be used.";
 $("voice-list").innerHTML=list.length?list.map((v,i)=>`<div class="voice-row ${draft?.companion?.voiceURI===v.voiceURI?"selected":""}"><label><input type="radio" name="voice" value="${escapeHtml(v.voiceURI)}" ${draft?.companion?.voiceURI===v.voiceURI?"checked":""}><span><b>${escapeHtml(v.name)}</b><small>${escapeHtml(v.lang)}</small></span></label><button type="button" data-preview="${i}">Play</button></div>`).join(""):'<div class="review-status">The default device voice will be used.</div>';
 qsa('input[name="voice"]').forEach(r=>r.onchange=()=>{draft.companion.voiceURI=r.value;loadVoices()});qsa("[data-preview]").forEach(b=>b.onclick=()=>speakPreview(list[Number(b.dataset.preview)]));
 selectedVoiceIndex=list.findIndex(v=>v.voiceURI===draft?.companion?.voiceURI);
}
function speakPreview(v=null){if(!("speechSynthesis" in window))return toast("Speech preview is not supported in this browser.");speechSynthesis.cancel();const name=$("companion-phonetic").value.trim()||$("companion-name").value.trim()||"your Companion";const u=new SpeechSynthesisUtterance(`Hello. My name is ${name}. I will help you use Lifestyle Companion.`);if(v)u.voice=v;else{const x=voices.find(v=>v.voiceURI===draft?.companion?.voiceURI);if(x)u.voice=x}u.lang=u.voice?.lang||"en-AU";speechSynthesis.speak(u)}
function roomOpen(id){
 const p=activeProfile();state.analytics.push({room:id,at:new Date().toISOString(),enabled:p.rooms.includes(id)});save();
 if(id==="settings")return show("settings");if(id==="food"&&p.rooms.includes("food"))return show("food");
 const r=rooms.find(x=>x.id===id);$("placeholder-title").textContent=r.name;$("placeholder-icon").textContent=r.icon;$("placeholder-text").textContent=`${r.name} is visible by design but is not yet built in Alpha 1.4. Your tap has been recorded locally for founder testing.`;show("placeholder")
}


function bindPhoneFormatting(inputId,countryId,errorId,type){
 const input=$(inputId);
 input.addEventListener("input",()=>{
   if($(countryId).value==="+61")input.value=formatAustralianPhone(input.value,type);
   else input.value=input.value.replace(/[^\d +()-]/g,"");
   validateAustralianPhone(inputId,countryId,errorId,type);
 });
 input.addEventListener("blur",()=>validateAustralianPhone(inputId,countryId,errorId,type));
 $(countryId).addEventListener("change",()=>{
   if($(countryId).value==="+61")input.value=formatAustralianPhone(input.value,type);
   validateAustralianPhone(inputId,countryId,errorId,type);
 });
}

load();
bindPhoneFormatting("mobile-number","mobile-country","mobile-error","mobile");
bindPhoneFormatting("home-phone-number","home-phone-country","home-phone-error","landline");
bindPhoneFormatting("business-number","business-country","business-error","landline");
bindPhoneFormatting("other-number","other-country","other-error","other");
$("start-new").onclick=()=>startWizard();
$("open-profiles").onclick=()=>{renderProfiles();show("profiles")};
$("new-profile").onclick=()=>startWizard();
$("delete-all").onclick=()=>{if(confirm("Delete every Alpha 1.4.1 profile on this device?")){state={profiles:[],activeId:null,analytics:[]};save();renderProfiles();toast("All Alpha 1.4.1 data deleted.")}};
qsa("[data-go]").forEach(b=>b.onclick=()=>{const id=b.dataset.go;if(id==="profiles")renderProfiles();show(id)});
$("postal-same").onchange=()=>{$("postal-fields").classList.toggle("hidden",$("postal-same").checked)};
$("previous").onclick=()=>{readForm();if(step>1){step--;renderStep()}};
$("wizard-back").onclick=()=>{if(step>1){readForm();step--;renderStep()}else show("welcome")};
$("next").onclick=()=>{if(!validate())return;readForm();if(step<8){step++;if(step===6)loadVoices();renderStep()}else finish()};
$("teacher-enabled").onchange=updateTeacher;
$("speak-help").onclick=()=>{if("speechSynthesis" in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance($("teacher-text").textContent);u.lang="en-AU";const v=voices.find(x=>x.voiceURI===draft?.companion?.voiceURI);if(v)u.voice=v;speechSynthesis.speak(u)}};
$("preview-selected-voice").onclick=()=>speakPreview();
$("profile-chip").onclick=()=>{renderProfiles();show("profiles")};
$("companion-centre").onclick=()=>toast(`${activeProfile().companion.name} is here to guide you.`);
qsa(".room").forEach(b=>b.onclick=()=>roomOpen(b.dataset.room));
qsa("[data-settings]").forEach(b=>b.onclick=()=>{const x=b.dataset.settings;if(x==="profiles"){renderProfiles();show("profiles")}else if(["profile","companion","rooms"].includes(x)){const p=activeProfile();startWizard(p,x==="profile"?2:x==="companion"?5:7)}else toast("This Settings area is planned for a later release.")});
if("speechSynthesis" in window){speechSynthesis.onvoiceschanged=loadVoices;voices=speechSynthesis.getVoices()}
})();