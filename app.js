const $=id=>document.getElementById(id);
const KEY="healthyEatingAlpha01";
let data={
 email:"", code:"", profile:{}, recommendations:{}, companion:{character:"🐵",characterName:"Clever Chimp",name:"",personality:"calm",theme:"garden",voice:""},
 heightUnit:"metric",weightUnit:"metric"
};
let editingProfile=false;

function show(id){
 document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
 $(id).classList.add("active");
 window.scrollTo({top:0,behavior:"instant"});
}
function toast(message){
 const t=$("toast");t.textContent=message;t.classList.add("show");
 clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2600);
}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function load(){
 try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored)data={...data,...stored}}catch(e){}
 if(data.completed){renderHome();show("home")}
}
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.go)));

$("join-check").addEventListener("change",e=>$("join-button").disabled=!e.target.checked);
$("join-button").addEventListener("click",()=>show("register"));
$("cancel-button").addEventListener("click",()=>show("goodbye"));

function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim())}
$("register-email").addEventListener("input",()=>{
 const ok=validEmail($("register-email").value);
 $("register-email").classList.toggle("invalid",$("register-email").value.length>2&&!ok);
 $("email-error").textContent=$("register-email").value.length>2&&!ok?"Please enter a valid email address.":"";
});
function generateCode(){
 data.code=String(Math.floor(100000+Math.random()*900000));
 $("preview-code").textContent=data.code.slice(0,3)+" "+data.code.slice(3);
}
$("send-code").addEventListener("click",()=>{
 const email=$("register-email").value.trim();
 if(!validEmail(email)){ $("register-email").classList.add("invalid");$("email-error").textContent="Please enter a valid email address.";return}
 data.email=email;generateCode();save();
 $("verify-message").textContent=`A six-digit verification code has been prepared for ${email}.`;
 $("verify-code").value="";$("code-error").textContent="";show("verify");
});
$("resend-code").addEventListener("click",()=>{generateCode();save();toast("A new prototype code has been generated.")});
$("verify-code").addEventListener("input",e=>e.target.value=e.target.value.replace(/\D/g,"").slice(0,6));
$("verify-button").addEventListener("click",()=>{
 if($("verify-code").value!==data.code){$("verify-code").classList.add("invalid");$("code-error").textContent="That code does not match. Check the six digits and try again.";return}
 $("verify-code").classList.remove("invalid");$("code-error").textContent="";show("password");
});

function passwordScore(v){
 let score=0;if(v.length>=8)score++;if(/[A-Za-z]/.test(v)&&/\d/.test(v))score++;if(/[A-Z]/.test(v)&&/[a-z]/.test(v))score++;if(/[^A-Za-z0-9]/.test(v))score++;return score;
}
$("password-one").addEventListener("input",()=>{
 const score=passwordScore($("password-one").value), labels=["Not entered","Weak","Fair","Good","Strong"];
 const widths=[0,25,50,75,100];
 $("password-strength").querySelector("span").style.width=widths[score]+"%";
 $("password-strength").querySelector("span").style.background=score<2?"#ad4646":score<3?"#b88a2c":"#3b7e58";
 $("password-strength").querySelector("small").textContent=labels[score];
});
$("password-next").addEventListener("click",()=>{
 const a=$("password-one").value,b=$("password-two").value;
 let msg="";
 if(a.length<8||!/[A-Za-z]/.test(a)||!/\d/.test(a))msg="Use at least eight characters, including a letter and a number.";
 else if(a!==b)msg="The passwords do not match. Please enter them again.";
 $("password-error").textContent=msg;
 if(msg)return;
 data.passwordSet=true;save();show("profile");
});

document.querySelectorAll(".segmented").forEach(group=>{
 group.addEventListener("click",e=>{
  if(e.target.tagName!=="BUTTON")return;
  group.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===e.target));
  const type=group.dataset.group,value=e.target.dataset.value;
  if(type==="height-unit"){
   data.heightUnit=value;$("height-metric").classList.toggle("hidden",value!=="metric");$("height-imperial").classList.toggle("hidden",value!=="imperial");
  }else{
   data.weightUnit=value;$("weight-metric").classList.toggle("hidden",value!=="metric");$("weight-imperial").classList.toggle("hidden",value!=="imperial");
  }
 });
});
document.querySelectorAll('input[name="goal"]').forEach(r=>r.addEventListener("change",()=>$("loss-options").classList.toggle("hidden",r.value!=="lose"||!r.checked)));

function ageFromDob(v){
 const d=new Date(v+"T00:00:00"),now=new Date();let a=now.getFullYear()-d.getFullYear();
 const m=now.getMonth()-d.getMonth();if(m<0||(m===0&&now.getDate()<d.getDate()))a--;return a;
}
function getHeightCm(){
 return data.heightUnit==="metric"?Number($("height-cm").value):(Number($("height-ft").value)*30.48+Number($("height-in").value)*2.54);
}
function getWeightKg(){
 return data.weightUnit==="metric"?Number($("weight-kg").value):(Number($("weight-st").value)*6.35029318+Number($("weight-lb").value)*0.45359237);
}
function selected(name){return document.querySelector(`input[name="${name}"]:checked`)?.value||""}
function round(n,step=1){return Math.round(n/step)*step}
function calculate(){
 const name=$("full-name").value.trim(),dob=$("dob").value,sex=$("calculation-sex").value,h=getHeightCm(),w=getWeightKg(),goal=selected("goal"),activity=Number($("activity").value);
 let err="";
 if(!name)err="Please enter your full name.";
 else if(!dob||ageFromDob(dob)<18||ageFromDob(dob)>100)err="Please enter a valid date of birth for an adult user.";
 else if(!sex)err="Please select the option used for the energy calculation.";
 else if(!h||h<100||h>250)err="Please enter a valid height.";
 else if(!w||w<30||w>400)err="Please enter a valid starting weight.";
 else if(!goal)err="Please choose a goal.";
 else if(!activity)err="Please choose your daily activity.";
 $("profile-error").textContent=err;if(err)return;

 const age=ageFromDob(dob),bmi=w/((h/100)**2),healthyLow=18.5*((h/100)**2),healthyHigh=24.9*((h/100)**2);
 let bmr=null,tdee=null,energyKj=null;
 if(sex!=="manual"){
  bmr=10*w+6.25*h-5*age+(sex==="male"?5:-161);
  tdee=bmr*activity;
  const rate=selected("loss-rate")||"slow";
  let adjustment=goal==="lose"?(rate==="faster"?-500:-300):goal==="gain"?250:0;
  let targetKcal=tdee+adjustment;
  const floor=sex==="male"?1500:1200;
  targetKcal=Math.max(targetKcal,floor);
  energyKj=round(targetKcal*4.184,10);
 }
 let goalWeight=goal==="maintain"?w:goal==="lose"?Math.max(healthyLow,Math.min(w-0.05,healthyHigh)):Math.max(w+0.05,healthyLow);
 goalWeight=round(goalWeight,0.1);
 const protein=round((goal==="lose"?1.6:1.4)*w);
 const fat=energyKj?round((energyKj/4.184*0.28)/9):round(0.8*w);
 const carbs=energyKj?round((energyKj/4.184-protein*4-fat*9)/4):0;

 data.profile={name,dob,age,sex,heightCm:round(h,0.1),weightKg:round(w,0.1),goal,lossRate:selected("loss-rate"),fasting:selected("fasting")||"none",activity,exerciseCredit:Number(selected("exercise-credit"))};
 data.recommendations={bmi:round(bmi,0.1),healthyLow:round(healthyLow,0.1),healthyHigh:round(healthyHigh,0.1),goalWeight,energyKj,protein,fat,carbs};
 save();renderRecommendations();show("recommendations");
}
$("calculate-button").addEventListener("click",calculate);

function renderRecommendations(){
 const r=data.recommendations;
 const items=[
  ["BMI",r.bmi,"Screening estimate"],
  ["Healthy weight range",`${r.healthyLow}–${r.healthyHigh} kg`,"Based on BMI 18.5–24.9"],
  ["Recommended weight goal",`${r.goalWeight} kg`,"Editable"],
  ["Daily energy",r.energyKj?`${r.energyKj.toLocaleString()} kJ`:"Set manually","Starting estimate"],
  ["Daily protein",`${r.protein} g`,"Starting estimate"],
  ["Daily fat",`${r.fat} g`,"Starting estimate"],
  ["Daily carbohydrate",r.carbs?`${r.carbs} g`:"Set manually","Remaining energy estimate"]
 ];
 $("recommendation-grid").innerHTML=items.map(x=>`<div class="recommendation"><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></div>`).join("");
 $("manual-goal-weight").value=r.goalWeight;$("manual-energy").value=r.energyKj||"";$("manual-protein").value=r.protein;$("manual-fat").value=r.fat;$("manual-carbs").value=r.carbs||"";
 $("accept-recommendations").checked=false;$("recommendation-error").textContent="";
}
$("manual-toggle").addEventListener("click",()=>{
 $("manual-fields").classList.toggle("hidden");
 $("accept-recommendations").checked=false;
});
$("recommendation-next").addEventListener("click",()=>{
 const manual=!$("manual-fields").classList.contains("hidden");
 if(manual){
  const vals=["manual-goal-weight","manual-energy","manual-protein","manual-fat","manual-carbs"].map(id=>Number($(id).value));
  if(vals.some(v=>!v||v<=0)){$("recommendation-error").textContent="Please enter a positive number in every manual recommendation field.";return}
  [data.recommendations.goalWeight,data.recommendations.energyKj,data.recommendations.protein,data.recommendations.fat,data.recommendations.carbs]=vals;
 }else if(!$("accept-recommendations").checked){
  $("recommendation-error").textContent="Please accept the recommendations or choose manual adjustments.";return
 }
 $("recommendation-error").textContent="";save();show("companion");
});

const characters=[
 ["🐵","Clever Chimp"],["🐶","Friendly Puppy"],["🦉","Wise Owl"],["🐨","Gentle Koala"],["🦊","Bright Fox"],
 ["🐧","Cheery Penguin"],["🦁","Brave Lion"],["🐼","Calm Panda"],["🐰","Kind Rabbit"],["🧑‍🍳","Food Guide"]
];
function renderCharacters(){
 $("character-grid").innerHTML=characters.map(([icon,name])=>`<button type="button" class="character ${data.companion.character===icon?"selected":""}" data-icon="${icon}" data-name="${name}"><span>${icon}</span><small>${name}</small></button>`).join("");
 document.querySelectorAll(".character").forEach(b=>b.addEventListener("click",()=>{
  data.companion.character=b.dataset.icon;data.companion.characterName=b.dataset.name;
  $("setup-avatar").textContent=b.dataset.icon;renderCharacters();
 }));
}
renderCharacters();
let voices=[];
function loadVoices(){
 voices=speechSynthesis?.getVoices?.()||[];
 $("voice-select").innerHTML='<option value="">Default device voice</option>'+voices.map((v,i)=>`<option value="${i}">${v.name} — ${v.lang}</option>`).join("");
}
if("speechSynthesis" in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices}
$("preview-voice").addEventListener("click",()=>{
 const name=$("companion-name").value.trim()||"your Companion";
 if(!("speechSynthesis" in window)){toast("Voice preview is not available in this browser.");return}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(`Hello. I’m ${name}. I’m looking forward to helping you with Healthy Eating.`);
 const i=$("voice-select").value;if(i!==""&&voices[Number(i)])u.voice=voices[Number(i)];
 speechSynthesis.speak(u);
});
$("finish-setup").addEventListener("click",()=>{
 const name=$("companion-name").value.trim();
 if(!name){$("companion-error").textContent="Please give your Companion a name.";return}
 data.companion={...data.companion,name,personality:$("personality").value,theme:$("theme").value,voice:$("voice-select").value};
 data.completed=true;save();renderHome();show("home");
});

function firstName(){return (data.profile.name||"").trim().split(/\s+/)[0]||"there"}
function titleCase(v){return String(v||"").replace(/\b\w/g,c=>c.toUpperCase())}
function renderHome(){
 const c=data.companion,r=data.recommendations;
 $("home-greeting").textContent=`Welcome, ${firstName()}`;
 $("home-summary").textContent=`Starting plan: ${r.energyKj?r.energyKj.toLocaleString()+" kJ per day":"manual energy"} · Goal ${r.goalWeight} kg`;
 $("home-avatar").textContent=c.character;$("thought-avatar").textContent=c.character;$("home-companion-name").textContent=c.name||"Companion";
 $("thought-text").textContent=`I’m ${c.name}. Your Healthy Eating home is ready. The rooms marked here will be developed one at a time.`;
}
$("home-companion").addEventListener("click",()=>toast(`${data.companion.name}: We’ll take this one healthy choice at a time.`));
const roomInfo={
 diary:["Diary","🍽️","Meal entry and meal planning will live here."],
 database:["Food Database","🥕","This will include My Foods, My Recipes and searchable foods."],
 weight:["Weight Check-in","⚖️","This will record check-ins and display weight history."],
 graphs:["Graphs","📈","This will show weight and energy graphs for one week, two weeks, one month, three months and longer periods."]
};
document.querySelectorAll(".room").forEach(b=>b.addEventListener("click",()=>{
 if(b.dataset.room==="settings"){renderSettings();show("settings");return}
 const x=roomInfo[b.dataset.room];$("placeholder-title").textContent=x[0];$("placeholder-icon").textContent=x[1];$("placeholder-copy").textContent=x[2];show("placeholder");
}));
function renderSettings(){
 const p=data.profile,r=data.recommendations,c=data.companion;
 $("settings-summary").innerHTML=`<h3>${p.name}</h3>
 <p><strong>Email:</strong> ${data.email}</p>
 <p><strong>Date of birth:</strong> ${p.dob.split("-").reverse().join("-")}</p>
 <p><strong>Starting weight:</strong> ${p.weightKg} kg &nbsp; <strong>Height:</strong> ${p.heightCm} cm</p>
 <p><strong>Goal weight:</strong> ${r.goalWeight} kg &nbsp; <strong>Energy:</strong> ${r.energyKj?r.energyKj.toLocaleString()+" kJ":"Manual"}</p>
 <p><strong>Companion:</strong> ${c.character} ${c.name} · ${titleCase(c.personality)} · ${titleCase(c.theme)}</p>`;
}
$("edit-profile").addEventListener("click",()=>{editingProfile=true;show("profile")});
$("edit-companion").addEventListener("click",()=>show("companion"));
$("reset-trial").addEventListener("click",()=>{
 if(confirm("Delete this Healthy Eating Alpha 0.1 trial profile and begin again?")){
  localStorage.removeItem(KEY);location.reload();
 }
});
load();
