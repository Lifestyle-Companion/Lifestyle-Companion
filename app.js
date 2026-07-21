const $=id=>document.getElementById(id);
const KEY="healthyEatingAlpha02";
let data={
  email:"",code:"",passwordSet:false,completed:false,
  personal:{name:"",email:"",country:"Australia",address:"",mobile:"",phone:"",dob:"",energyUnit:"kJ"},
  health:{sex:"",heightCm:0,weightKg:0,goal:"",lossRate:"slow",fasting:"none",activity:0,exerciseCredit:0},
  recommendations:{},
  companion:{character:"🐵",characterName:"Clever Chimp",name:"",personality:"calm",theme:"garden",voice:"",speechEnabled:true},
  heightUnit:"metric",weightUnit:"metric"
};
let editingFromSettings=false;
let voices=[];

function show(id,{speak=true}={}){
  speechSynthesis?.cancel?.();
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo({top:0,behavior:'instant'});
  updateLiveAvatars();
  if(id==='settings') renderSettings();
  if(id==='home') renderHome();
  const text=$(id).dataset.speech;
  if(speak&&text) setTimeout(()=>speakText(personalise(text)),280);
}
function personalName(){return (data.personal.name||'').trim().split(/\s+/)[0]||''}
function personalisationName(){return data.companion.name||'your Companion'}
function personalise(text){return text.replaceAll('{name}',personalName()).replaceAll('{companion}',personalisationName())}
function toast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function load(){
  try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored)data={...data,...stored,personal:{...data.personal,...stored.personal},health:{...data.health,...stored.health},recommendations:{...stored.recommendations},companion:{...data.companion,...stored.companion}}}catch(e){}
  populateForms();renderCharacters();populateVoices();
  if(data.completed){renderHome();show('home',{speak:false})}
}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim())}
function selected(name){return document.querySelector(`input[name="${name}"]:checked`)?.value||''}
function setRadio(name,value){const el=document.querySelector(`input[name="${name}"][value="${value}"]`);if(el)el.checked=true}
function round(n,step=1){return Math.round(n/step)*step}
function ageFromDob(v){const d=new Date(v+'T00:00:00'),now=new Date();let a=now.getFullYear()-d.getFullYear();const m=now.getMonth()-d.getMonth();if(m<0||(m===0&&now.getDate()<d.getDate()))a--;return a}
function updateLiveAvatars(){document.querySelectorAll('.live-avatar').forEach(el=>el.textContent=data.companion.character||'🐵');if($('setup-avatar'))$('setup-avatar').textContent=data.companion.character||'🐵'}

function speakText(text,{force=false}={}){
  if(!('speechSynthesis' in window)){toast('Spoken guidance is not supported by this browser.');return}
  if(!force&&!data.companion.speechEnabled)return;
  const utter=new SpeechSynthesisUtterance(text);
  const chosen=voices.find(v=>v.name===data.companion.voice);
  if(chosen)utter.voice=chosen;
  utter.rate=data.companion.personality==='brief'?1.08:0.96;
  utter.pitch=data.companion.personality==='cheerful'?1.08:1;
  speechSynthesis.cancel();speechSynthesis.speak(utter);
}
function populateVoices(){
  if(!('speechSynthesis' in window))return;
  voices=speechSynthesis.getVoices();
  const select=$('voice-select'); if(!select)return;
  const current=data.companion.voice;
  select.innerHTML='<option value="">Default device voice</option>'+voices.map(v=>`<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)}${v.lang?' · '+escapeHtml(v.lang):''}</option>`).join('');
  select.value=current;
}
if('speechSynthesis' in window)speechSynthesis.onvoiceschanged=populateVoices;
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

// Generic navigation and spoken repeat buttons
document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-go]');if(nav){show(nav.dataset.go);return}
  const speak=e.target.closest('.speak-note');if(speak){
    const section=speak.closest('.screen');
    const message=speak.closest('.companion-note,.home-message')?.querySelector('p')?.textContent||section?.dataset.speech||'';
    speakText(personalise(message),{force:true});
  }
});

$('join-check').addEventListener('change',e=>$('join-button').disabled=!e.target.checked);
$('join-button').addEventListener('click',()=>show('register'));
$('cancel-button').addEventListener('click',()=>show('goodbye'));
$('register-email').addEventListener('input',()=>{const ok=validEmail($('register-email').value);$('register-email').classList.toggle('invalid',$('register-email').value.length>2&&!ok);$('email-error').textContent=$('register-email').value.length>2&&!ok?'Please enter a valid email address.':''});
function generateCode(){data.code=String(Math.floor(100000+Math.random()*900000));$('preview-code').textContent=data.code.slice(0,3)+' '+data.code.slice(3)}
$('send-code').addEventListener('click',()=>{const email=$('register-email').value.trim();if(!validEmail(email)){return friendlyError('email-error','Please enter a valid email address.','It looks like that email address is not complete yet. Please check it and try again.','register-email')}data.email=email;data.personal.email=email;generateCode();save();$('verify-message').textContent=`A six-digit verification code has been prepared for ${email}.`;$('verify-code').value='';show('verify')});
$('resend-code').addEventListener('click',()=>{generateCode();save();toast('A new prototype code has been generated.');speakText('I have generated a new six digit code for you.')});
$('verify-code').addEventListener('input',e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,6));
$('verify-button').addEventListener('click',()=>{if($('verify-code').value!==data.code)return friendlyError('code-error','That code does not match. Check the six digits and try again.','That code does not match yet. Please check all six digits and try again.','verify-code');$('code-error').textContent='';show('password')});
function passwordScore(v){let score=0;if(v.length>=8)score++;if(/[A-Za-z]/.test(v)&&/\d/.test(v))score++;if(/[A-Z]/.test(v)&&/[a-z]/.test(v))score++;if(/[^A-Za-z0-9]/.test(v))score++;return score}
$('password-one').addEventListener('input',()=>{const score=passwordScore($('password-one').value),labels=['Not entered','Weak','Fair','Good','Strong'],widths=[0,25,50,75,100];$('password-strength').querySelector('span').style.width=widths[score]+'%';$('password-strength').querySelector('span').style.background=score<2?'#ad4646':score<3?'#b88a2c':'#3b7e58';$('password-strength').querySelector('small').textContent=labels[score]});
$('password-next').addEventListener('click',()=>{const a=$('password-one').value,b=$('password-two').value;let msg='',spoken='';if(a.length<8||!/[A-Za-z]/.test(a)||!/\d/.test(a)){msg='Use at least eight characters, including a letter and a number.';spoken='Your password needs at least eight characters, including a letter and a number.'}else if(a!==b){msg='The passwords do not match. Please enter them again.';spoken='It looks like your passwords do not match yet. Let us fix that together.'}if(msg)return friendlyError('password-error',msg,spoken);data.passwordSet=true;save();show('companion')});

const characters=[["🐵","Clever Chimp"],["🐶","Friendly Puppy"],["🦉","Wise Owl"],["🐨","Gentle Koala"],["🦊","Bright Fox"],["🐧","Cheery Penguin"],["🦁","Brave Lion"],["🐼","Calm Panda"],["🐰","Kind Rabbit"],["🧑‍🍳","Food Guide"]];
function renderCharacters(){$('character-grid').innerHTML=characters.map(([icon,name])=>`<button type="button" class="character ${data.companion.character===icon?'selected':''}" data-icon="${icon}" data-name="${name}"><span>${icon}</span><small>${name}</small></button>`).join('');document.querySelectorAll('.character').forEach(btn=>btn.addEventListener('click',()=>{data.companion.character=btn.dataset.icon;data.companion.characterName=btn.dataset.name;document.querySelectorAll('.character').forEach(b=>b.classList.toggle('selected',b===btn));updateLiveAvatars()}))}
$('preview-voice').addEventListener('click',()=>{syncCompanionForm();const name=data.companion.name||'your Companion';speakText(`Hello. I am ${name}. I will help you plan, explain each step, and encourage you along the way.`,{force:true})});
function syncCompanionForm(){data.companion.name=$('companion-name').value.trim();data.companion.personality=$('personality').value;data.companion.theme=$('theme').value;data.companion.voice=$('voice-select').value;data.companion.speechEnabled=$('speech-enabled').checked}
$('companion-next').addEventListener('click',()=>{syncCompanionForm();if(!data.companion.name)return friendlyError('companion-error','Please give your Companion a name.','Your Companion needs a name before we continue.');$('companion-error').textContent='';save();$('personal-email').value=data.email;show('personal')});

$('personal-next').addEventListener('click',()=>{const p={name:$('full-name').value.trim(),email:$('personal-email').value.trim(),country:$('country').value,address:$('address').value.trim(),mobile:$('mobile').value.trim(),phone:$('phone').value.trim(),dob:$('dob').value,energyUnit:$('energy-unit').value};let err='',spoken='';if(!p.name){err='Please enter your full name.';spoken='Please enter your full name so I know what to call you.'}else if(!validEmail(p.email)){err='Please enter a valid email address.';spoken='Please check your email address before we continue.'}else if(!p.country){err='Please choose your country.';spoken='Please choose your country so I can use the right local settings.'}else if(!p.dob||ageFromDob(p.dob)<18||ageFromDob(p.dob)>100){err='Please enter a valid date of birth for an adult user.';spoken='Please check your date of birth. This founder trial is currently designed for adults.'}if(err)return friendlyError('personal-error',err,spoken);data.personal=p;data.email=p.email;save();show('health')});

document.querySelectorAll('.segmented').forEach(group=>group.addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')return;group.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===e.target));const type=group.dataset.group,value=e.target.dataset.value;if(type==='height-unit'){data.heightUnit=value;$('height-metric').classList.toggle('hidden',value!=='metric');$('height-imperial').classList.toggle('hidden',value!=='imperial')}else{data.weightUnit=value;$('weight-metric').classList.toggle('hidden',value!=='metric');$('weight-imperial').classList.toggle('hidden',value!=='imperial')}}));
document.querySelectorAll('input[name="goal"]').forEach(r=>r.addEventListener('change',()=>{$('loss-options').classList.toggle('hidden',selected('goal')!=='lose')}));
function getHeightCm(){return data.heightUnit==='metric'?Number($('height-cm').value):(Number($('height-ft').value)*30.48+Number($('height-in').value)*2.54)}
function getWeightKg(){return data.weightUnit==='metric'?Number($('weight-kg').value):(Number($('weight-st').value)*6.35029318+Number($('weight-lb').value)*0.45359237)}
$('calculate-button').addEventListener('click',calculate);
function calculate(){
  const sex=$('calculation-sex').value,h=getHeightCm(),w=getWeightKg(),goal=selected('goal'),activity=Number($('activity').value),age=ageFromDob(data.personal.dob);let err='',spoken='';
  if(!sex){err='Please select the option used for the energy calculation.';spoken='Please choose the option used for your energy calculation.'}
  else if(!h||h<100||h>250){err='Please enter a valid height.';spoken='Please check your height before we continue.'}
  else if(!w||w<30||w>400){err='Please enter a valid starting weight.';spoken='Please check your starting weight before we continue.'}
  else if(!goal){err='Please choose a goal.';spoken='Please choose whether you want to lose, maintain, or gain weight.'}
  else if(!activity){err='Please choose your daily activity.';spoken='Please choose the daily activity level that suits you best.'}
  if(err)return friendlyError('health-error',err,spoken);
  const bmi=w/((h/100)**2),healthyLow=18.5*((h/100)**2),healthyHigh=24.9*((h/100)**2);let energyKj=null;
  if(sex!=='manual'){
    const bmr=10*w+6.25*h-5*age+(sex==='male'?5:-161),tdee=bmr*activity,rate=selected('loss-rate')||'slow';
    let target=tdee+(goal==='lose'?(rate==='faster'?-500:-300):goal==='gain'?250:0);target=Math.max(target,sex==='male'?1500:1200);energyKj=round(target*4.184,100);
  }
  let goalWeight=goal==='maintain'?w:goal==='lose'?Math.max(healthyLow,Math.min(w-0.1,healthyHigh)):Math.max(w+0.1,healthyLow);goalWeight=round(goalWeight,0.1);
  const protein=round((goal==='lose'?1.6:1.4)*w,5),fat=energyKj?round((energyKj/4.184*.28)/9,5):round(.8*w,5),carbs=energyKj?Math.max(0,round((energyKj/4.184-protein*4-fat*9)/4,5)):0;
  data.health={sex,heightCm:round(h,.1),weightKg:round(w,.1),goal,lossRate:selected('loss-rate')||'slow',fasting:selected('fasting')||'none',activity,exerciseCredit:Number(selected('exercise-credit'))};
  data.recommendations={bmi:round(bmi,.1),healthyLow:round(healthyLow,.1),healthyHigh:round(healthyHigh,.1),goalWeight,energyKj,protein,fat,carbs};save();renderRecommendations();show('recommendations');
}
function energyDisplay(kj){if(!kj)return 'Set manually';return data.personal.energyUnit==='Calories'?`${Math.round(kj/4.184).toLocaleString()} Calories`:`${kj.toLocaleString()} kJ`}
function renderRecommendations(){const r=data.recommendations;const items=[["BMI",r.bmi,"Screening estimate"],["Healthy weight range",`${r.healthyLow}–${r.healthyHigh} kg`,"Based on BMI 18.5–24.9"],["Recommended weight goal",`${r.goalWeight} kg`,"Editable starting target"],["Daily energy",energyDisplay(r.energyKj),"Rounded planning estimate"],["Daily protein",`${r.protein} g`,"Rounded starting estimate"],["Daily fat",`${r.fat} g`,"Rounded starting estimate"],["Daily carbohydrate",r.carbs?`${r.carbs} g`:'Set manually',"Remaining energy estimate"]];$('recommendation-grid').innerHTML=items.map(x=>`<div class="recommendation"><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></div>`).join('');$('manual-goal-weight').value=r.goalWeight||'';$('manual-energy').value=data.personal.energyUnit==='Calories'&&r.energyKj?Math.round(r.energyKj/4.184):(r.energyKj||'');$('manual-protein').value=r.protein||'';$('manual-fat').value=r.fat||'';$('manual-carbs').value=r.carbs||'';$('accept-recommendations').checked=false;$('recommendation-error').textContent=''}
$('manual-toggle').addEventListener('click',()=>{$('manual-fields').classList.toggle('hidden');$('accept-recommendations').checked=false});
$('finish-setup').addEventListener('click',()=>{const manual=!$('manual-fields').classList.contains('hidden');if(manual){const vals=['manual-goal-weight','manual-energy','manual-protein','manual-fat','manual-carbs'].map(id=>Number($(id).value));if(vals.some(v=>!v||v<=0))return friendlyError('recommendation-error','Please enter a positive number in every manual recommendation field.','Please complete every manual recommendation field with a positive number.');data.recommendations.goalWeight=vals[0];data.recommendations.energyKj=data.personal.energyUnit==='Calories'?round(vals[1]*4.184,10):vals[1];data.recommendations.protein=vals[2];data.recommendations.fat=vals[3];data.recommendations.carbs=vals[4]}else if(!$('accept-recommendations').checked)return friendlyError('recommendation-error','Please accept the recommendations or choose manual adjustments.','Please accept the recommendations, or choose manual adjustments before we continue.');data.completed=true;save();renderHome();show('home')});

function greeting(){const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening'}
const tips=['Small changes are easier to repeat than perfect days.','Planning tomorrow’s meals today can make healthy choices easier.','Water, fibre and protein can help meals feel more satisfying.','A difficult meal does not spoil the whole day. Your next choice is a fresh start.','Healthy eating should fit real life, not fight against it.'];
function homeMessage(){const first=personalName();const name=data.companion.name||'Your Companion';return `${greeting()}${first?', '+first:''}. I’m ${name}. Your starting plan is ready, and I’m here whenever you need guidance.`}
function renderHome(){const first=personalName();$('home-greeting').textContent=`${greeting()}${first?', '+first:''}`;$('home-summary').textContent=`Goal: ${goalLabel(data.health.goal)} · Daily energy: ${energyDisplay(data.recommendations.energyKj)}`;$('home-avatar').textContent=data.companion.character;$('message-avatar').textContent=data.companion.character;$('home-companion-name').textContent=data.companion.name||'Companion';$('message-name').textContent=data.companion.name||'Companion';$('message-text').textContent=homeMessage();$('daily-tip').textContent=tips[new Date().getDate()%tips.length]}
function goalLabel(v){return v==='lose'?'Lose weight':v==='maintain'?'Maintain weight':v==='gain'?'Gain weight':'Not set'}
$('home-companion').addEventListener('click',()=>{const messages=[homeMessage(),`Your daily energy starting point is ${energyDisplay(data.recommendations.energyKj)}. Remember, this is a flexible planning guide.`,`You do not need a perfect day. Let us focus on the next helpful choice.`,`When you are ready, open the Diary room to begin planning meals. That room is coming in a future build.`];const msg=messages[Math.floor(Math.random()*messages.length)];$('message-text').textContent=msg;speakText(msg,{force:true})});
$('speak-home').addEventListener('click',()=>speakText($('message-text').textContent,{force:true}));
document.querySelectorAll('.room').forEach(btn=>btn.addEventListener('click',()=>{const room=btn.dataset.room;if(room==='settings'){show('settings');return}const map={diary:['Diary','🍽️','Meal planning and food logging will be added here.'],database:['Food Database','🥕','Australian foods and recipes will be added here.'],weight:['Weight Check-in','⚖️','Weight history and check-ins will be added here.'],graphs:['Graphs','📈','Progress graphs will be added here.']};const [title,icon,copy]=map[room];$('placeholder-title').textContent=title;$('placeholder-icon').textContent=icon;$('placeholder-copy').textContent=copy;show('placeholder');speakText(`${title} is coming soon. ${copy}`)}));

function renderSettings(){$('settings-summary').innerHTML=`<h3>${escapeHtml(data.personal.name||'Founder tester')}</h3><p><strong>Email:</strong> ${escapeHtml(data.personal.email||data.email)}</p><p><strong>Country:</strong> ${escapeHtml(data.personal.country)}</p><p><strong>Companion:</strong> ${escapeHtml(data.companion.name)} ${data.companion.character}</p><p><strong>Goal:</strong> ${goalLabel(data.health.goal)}</p><p><strong>Starting weight:</strong> ${data.health.weightKg||'—'} kg</p><p><strong>Daily energy:</strong> ${energyDisplay(data.recommendations.energyKj)}</p><p><strong>Spoken guidance:</strong> ${data.companion.speechEnabled?'On':'Off'}</p>`;$('toggle-speech').textContent=data.companion.speechEnabled?'Turn spoken guidance off':'Turn spoken guidance on'}
$('edit-personal').addEventListener('click',()=>{editingFromSettings=true;populateForms();show('personal')});
$('edit-health').addEventListener('click',()=>{editingFromSettings=true;populateForms();show('health')});
$('edit-companion').addEventListener('click',()=>{editingFromSettings=true;populateForms();show('companion')});
$('toggle-speech').addEventListener('click',()=>{data.companion.speechEnabled=!data.companion.speechEnabled;$('speech-enabled').checked=data.companion.speechEnabled;save();renderSettings();toast(`Spoken guidance turned ${data.companion.speechEnabled?'on':'off'}.`);if(data.companion.speechEnabled)speakText('Spoken guidance is now on.',{force:true})});
$('reset-trial').addEventListener('click',()=>{if(confirm('Reset this founder trial and delete the saved profile on this device?')){localStorage.removeItem(KEY);location.reload()}});

function friendlyError(id,text,spoken,inputId){$(id).textContent=text;if(inputId)$(inputId).classList.add('invalid');speakText(spoken||text);return false}
function populateForms(){
  $('register-email').value=data.email||'';$('personal-email').value=data.personal.email||data.email||'';$('full-name').value=data.personal.name||'';$('country').value=data.personal.country||'Australia';$('address').value=data.personal.address||'';$('mobile').value=data.personal.mobile||'';$('phone').value=data.personal.phone||'';$('dob').value=data.personal.dob||'';$('energy-unit').value=data.personal.energyUnit||'kJ';
  $('companion-name').value=data.companion.name||'';$('personality').value=data.companion.personality||'calm';$('theme').value=data.companion.theme||'garden';$('speech-enabled').checked=data.companion.speechEnabled!==false;
  $('calculation-sex').value=data.health.sex||'';$('height-cm').value=data.health.heightCm||'';$('weight-kg').value=data.health.weightKg||'';$('activity').value=data.health.activity||'';setRadio('goal',data.health.goal);setRadio('loss-rate',data.health.lossRate||'slow');setRadio('fasting',data.health.fasting||'none');setRadio('exercise-credit',String(data.health.exerciseCredit||0));$('loss-options').classList.toggle('hidden',data.health.goal!=='lose');
  updateLiveAvatars();renderCharacters();populateVoices();
}
load();
