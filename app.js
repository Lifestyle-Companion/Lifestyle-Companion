(() => {
  'use strict';

  const STORAGE_KEY = 'lifestyleCompanionAlpha1';
  const MAX_PROFILES = 10;
  const characters = [
    ['chimp','🐵','Chimpanzee'],['horse','🐴','Horse'],['dog','🐶','Dog'],['cow','🐮','Cow'],
    ['cat','🐱','Cat'],['koala','🐨','Koala'],['kangaroo','🦘','Kangaroo'],['owl','🦉','Owl'],
    ['panda','🐼','Panda'],['penguin','🐧','Penguin'],['frog','🐸','Frog'],['bear','🐻','Bear']
  ];
  const thoughts = {
    cheerful: [
      'Small steps count. Let’s make today a good one.',
      'You don’t have to do everything today — just the next helpful thing.',
      'Welcome back. I’m glad you’re here.'
    ],
    calm: [
      'Take a breath. We can work through today one step at a time.',
      'There is no rush. Choose the Room that feels most useful.',
      'A steady day is still a successful day.'
    ],
    funny: [
      'I’m ready when you are — unless the kettle boils first.',
      'Today’s exercise: opening the right Room on the first try.',
      'I tried to organise my thoughts. They requested annual leave.'
    ],
    encouraging: [
      'You’ve already done the hardest part: showing up.',
      'Progress does not need to be perfect to be worthwhile.',
      'We’ll adjust the plan to fit your life, not the other way around.'
    ],
    minimal: ['Ready when you are.', 'What shall we do?', 'Welcome back.']
  };
  const kitchenThoughts = [
    'The kitchen is open. Let’s make the plan fit real life.',
    'A balanced day can still include food you genuinely enjoy.',
    'I’m wearing the chef’s hat, but you’re still in charge of the menu.',
    'Barbecue rule number one: someone has to supervise the onions.'
  ];

  const state = loadState();
  let selectedCharacter = 'chimp';
  let settingsDirty = false;
  let pendingNavigation = null;
  let voices = [];

  const $ = id => document.getElementById(id);
  const screens = [...document.querySelectorAll('.screen')];

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && Array.isArray(parsed.profiles)) return parsed;
    } catch (_) {}
    return { profiles: [], activeProfileId: null, seenWelcome: false };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function activeProfile() {
    return state.profiles.find(p => p.id === state.activeProfileId) || null;
  }

  function show(screenId) {
    screens.forEach(s => s.classList.toggle('active', s.id === screenId));
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (screenId === 'home-screen') renderHome();
    if (screenId === 'food-room') renderFoodRoom();
    if (screenId === 'profile-picker') renderProfiles();
    if (screenId === 'settings-room') renderSettings();
  }

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function profileEmoji(profile) {
    return characters.find(c => c[0] === profile.character)?.[1] || '🙂';
  }

  function greetingPart() {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  }

  function renderCharacterGrid(containerId, current, onSelect) {
    const el = $(containerId);
    el.innerHTML = characters.map(([id, emoji, label]) => `
      <button type="button" class="character-choice ${id === current ? 'selected' : ''}" data-character="${id}">
        <span>${emoji}</span><small>${label}</small>
      </button>`).join('');
    el.querySelectorAll('[data-character]').forEach(btn => btn.addEventListener('click', () => {
      onSelect(btn.dataset.character);
      renderCharacterGrid(containerId, btn.dataset.character, onSelect);
    }));
  }

  function renderProfiles() {
    const list = $('profile-list');
    list.innerHTML = state.profiles.map(p => `
      <button class="profile-card" data-profile-id="${p.id}">
        <div class="big-character">${profileEmoji(p)}</div>
        <strong>${escapeHtml(p.userName)}</strong>
        <small>${escapeHtml(p.companionName)}</small>
      </button>`).join('');
    if (state.profiles.length < MAX_PROFILES) {
      list.insertAdjacentHTML('beforeend', `<button class="profile-card add-card" id="inline-add"><div class="big-character">＋</div><strong>Add tester</strong><small>${MAX_PROFILES - state.profiles.length} places remaining</small></button>`);
      $('inline-add').addEventListener('click', startNewProfile);
    }
    list.querySelectorAll('[data-profile-id]').forEach(btn => btn.addEventListener('click', () => {
      state.activeProfileId = btn.dataset.profileId;
      saveState();
      applyTheme(activeProfile()?.theme || 'forest');
      show('home-screen');
    }));
  }

  function startNewProfile() {
    if (state.profiles.length >= MAX_PROFILES) return toast('This trial build supports up to 10 profiles on this device.');
    $('tester-name').value = '';
    $('companion-name').value = '';
    $('personality-select').value = 'cheerful';
    $('theme-select').value = 'forest';
    selectedCharacter = 'chimp';
    renderCharacterGrid('character-grid', selectedCharacter, id => selectedCharacter = id);
    populateVoiceOptions();
    show('setup-screen');
  }

  function createProfile() {
    const userName = $('tester-name').value.trim();
    const companionName = $('companion-name').value.trim();
    if (!userName || !companionName) return toast('Please enter both your name and your Companion’s name.');
    const profile = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      userName,
      companionName,
      character: selectedCharacter,
      voiceURI: $('voice-select').value || '',
      personality: $('personality-select').value,
      theme: $('theme-select').value,
      activityLevel: 'moderate',
      weightGoal: 'gradual',
      fastingPlan: 'none',
      createdAt: new Date().toISOString()
    };
    state.profiles.push(profile);
    state.activeProfileId = profile.id;
    state.seenWelcome = true;
    saveState();
    applyTheme(profile.theme);
    show('home-screen');
    speak(`Hello ${userName}. I’m ${companionName}. I’ll be your Lifestyle Companion.`);
  }

  function renderHome() {
    const p = activeProfile();
    if (!p) return show('profile-picker');
    $('home-greeting').textContent = `Good ${greetingPart()}, ${p.userName}`;
    $('home-character').textContent = profileEmoji(p);
    $('home-companion-name').textContent = p.companionName;
    $('profile-button').textContent = profileEmoji(p);
    setThought();
  }

  function setThought() {
    const p = activeProfile();
    if (!p) return;
    const options = thoughts[p.personality] || thoughts.cheerful;
    $('thought-label').textContent = `A thought from ${p.companionName}`;
    $('thought-text').textContent = options[Math.floor(Math.random() * options.length)];
  }

  function renderFoodRoom() {
    const p = activeProfile();
    if (!p) return;
    $('food-character').textContent = profileEmoji(p);
    $('food-companion-name').textContent = p.companionName;
    $('food-profile-button').textContent = profileEmoji(p);
    $('kitchen-note').textContent = kitchenThoughts[Math.floor(Math.random() * kitchenThoughts.length)];
  }

  function renderSettings() {
    const p = activeProfile();
    if (!p) return;
    $('activity-level').value = p.activityLevel || 'moderate';
    $('weight-goal').value = p.weightGoal || 'gradual';
    $('fasting-plan').value = p.fastingPlan || 'none';
    $('settings-companion-name').value = p.companionName;
    $('settings-personality').value = p.personality;
    selectedCharacter = p.character;
    renderCharacterGrid('settings-character-grid', selectedCharacter, id => {
      selectedCharacter = id;
      settingsDirty = true;
    });
    settingsDirty = false;
  }

  function saveSettings() {
    const p = activeProfile();
    if (!p) return;
    p.activityLevel = $('activity-level').value;
    p.weightGoal = $('weight-goal').value;
    p.fastingPlan = $('fasting-plan').value;
    p.companionName = $('settings-companion-name').value.trim() || p.companionName;
    p.character = selectedCharacter;
    p.personality = $('settings-personality').value;
    saveState();
    settingsDirty = false;
    toast('Preferences saved');
    renderHome();
  }

  function applyTheme(theme) {
    const themes = {
      forest:['#185c43','#e7f1eb'],ocean:['#276a93','#e6f1f8'],sunset:['#a95d2b','#f8eadf'],plum:['#6d4e7d','#f0e8f3'],charcoal:['#394744','#e9edec']
    };
    const [accent, soft] = themes[theme] || themes.forest;
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-soft', soft);
  }

  function openPlaceholder(title, icon, copy, back='home-screen') {
    $('placeholder-title').textContent = title;
    $('placeholder-icon').textContent = icon;
    $('placeholder-heading').textContent = `${title} is planned for a later Alpha sprint`;
    $('placeholder-copy').textContent = copy;
    $('placeholder-back').dataset.target = back;
    show('placeholder-room');
  }

  function openVoice() {
    const p = activeProfile();
    if (!p) return;
    $('voice-avatar').textContent = profileEmoji(p);
    $('voice-title').textContent = `Speak to ${p.companionName}`;
    $('voice-status').textContent = 'Tap the microphone and speak naturally.';
    $('voice-sheet').classList.add('open');
    $('voice-sheet').setAttribute('aria-hidden','false');
  }

  function closeVoice() {
    $('voice-sheet').classList.remove('open');
    $('voice-sheet').setAttribute('aria-hidden','true');
  }

  function populateVoiceOptions() {
    voices = window.speechSynthesis?.getVoices?.() || [];
    const select = $('voice-select');
    const english = voices.filter(v => /^en(-|_)/i.test(v.lang));
    const usable = english.length ? english : voices;
    select.innerHTML = `<option value="">Device default voice</option>` + usable.map(v => `<option value="${escapeHtml(v.voiceURI)}">${escapeHtml(v.name)} (${escapeHtml(v.lang)})</option>`).join('');
  }

  function speak(text) {
    const p = activeProfile();
    if (!('speechSynthesis' in window) || !p) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const chosen = voices.find(v => v.voiceURI === p.voiceURI);
    if (chosen) utter.voice = chosen;
    utter.rate = p.personality === 'calm' ? 0.9 : p.personality === 'funny' ? 1.05 : 0.98;
    speechSynthesis.speak(utter);
  }

  function handleCommand(raw) {
    const command = raw.toLowerCase().trim();
    const p = activeProfile();
    let response = '';
    if (/food|nutrition|kitchen/.test(command) && /open|go|enter|take/.test(command)) {
      closeVoice(); show('food-room'); response = 'Certainly. Let’s head into Food and Nutrition.';
    } else if (/setting|preference/.test(command) && /open|go|enter|take/.test(command)) {
      closeVoice(); show('settings-room'); response = 'Opening Preferences and Settings.';
    } else if (/joke|funny/.test(command)) {
      const joke = thoughts.funny[Math.floor(Math.random()*thoughts.funny.length)];
      $('voice-transcript').textContent = joke; response = joke;
    } else if (/home/.test(command) && /open|go|take/.test(command)) {
      closeVoice(); show('home-screen'); response = 'Taking you home.';
    } else if (/fast/.test(command)) {
      response = p.fastingPlan === 'none' ? 'Fasting is not currently enabled in your preferences.' : `Your fasting preference is set to ${p.fastingPlan === '5-2' ? 'five two fasting' : 'a custom fasting plan'}.`;
      $('voice-transcript').textContent = response;
    } else {
      response = 'I heard you, but this Alpha foundation only understands a small set of navigation commands so far.';
      $('voice-transcript').textContent = response;
    }
    speak(response);
  }

  function startListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      $('voice-status').textContent = 'Speech recognition is not available in this browser. The quick command buttons still work.';
      return toast('Voice recognition is not supported by this browser.');
    }
    const rec = new Recognition();
    rec.lang = 'en-AU';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    $('start-listening').classList.add('listening');
    $('voice-status').textContent = 'Listening…';
    rec.onresult = e => {
      const transcript = e.results[0][0].transcript;
      $('voice-transcript').textContent = `You said: “${transcript}”`;
      handleCommand(transcript);
    };
    rec.onerror = () => $('voice-status').textContent = 'I could not hear that clearly. Please try again.';
    rec.onend = () => {
      $('start-listening').classList.remove('listening');
      $('voice-status').textContent = 'Tap the microphone to speak again.';
    };
    rec.start();
  }

  function askBeforeLeaving(target) {
    if (!settingsDirty) return show(target);
    pendingNavigation = target;
    $('confirm-sheet').classList.add('open');
    $('confirm-sheet').setAttribute('aria-hidden','false');
  }

  function closeConfirm() {
    $('confirm-sheet').classList.remove('open');
    $('confirm-sheet').setAttribute('aria-hidden','true');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  // Setup and navigation
  $('begin-setup').addEventListener('click', startNewProfile);
  $('returning-user').addEventListener('click', () => show('profile-picker'));
  $('add-profile').addEventListener('click', startNewProfile);
  $('save-profile').addEventListener('click', createProfile);
  document.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', () => {
    const target = btn.dataset.nav;
    btn.classList.contains('leave-check') ? askBeforeLeaving(target) : show(target);
  }));

  document.querySelectorAll('[data-room]').forEach(btn => btn.addEventListener('click', () => {
    const room = btn.dataset.room;
    if (room === 'food') return show('food-room');
    const map = {
      planner:['Planner','📅','Planning, reminders and calendars will arrive in a future Alpha sprint.'],
      exercise:['Exercise & Activity','👟','Exercise logging and adaptive activity plans will arrive in a future Alpha sprint.'],
      journal:['Journal','📖','Diary, reflection and mood support will arrive in a future Alpha sprint.'],
      family:['Family & Friends','👨‍👩‍👧','Optional sharing will be private by default and added later.'],
      budget:['Money & Budget','💰','Budgeting and savings goals will be added after the healthy-living foundation.'],
      mylife:['My Life','❤️','Long-term life planning will grow here over time.']
    };
    openPlaceholder(...map[room]);
  }));

  document.querySelectorAll('[data-subroom]').forEach(btn => btn.addEventListener('click', () => {
    const room = btn.dataset.subroom;
    if (room === 'settings') return show('settings-room');
    const map = {
      plan:['Food Plan','🍽️','Daily food logging, backdating and a professional food database are scheduled for the daily-use sprint.'],
      fasting:['Fasting Planner','🌙','The 5:2 and custom fasting workflows are part of the next daily-use sprint.'],
      weight:['Weight Check-in','⚖️','Weight backdating, trend graphs and time-range views are part of the next daily-use sprint.'],
      summary:['Daily Summary','📊','Planned-versus-target summaries will be included with daily food logging.'],
      recipes:['Recipes','📒','Personal recipes and family meals will connect to the food database later.'],
      water:['Water','💧','Water logging will be included in the daily-use sprint.']
    };
    openPlaceholder(...map[room], 'food-room');
  }));

  $('placeholder-back').addEventListener('click', e => show(e.currentTarget.dataset.target || 'home-screen'));
  $('profile-button').addEventListener('click', () => show('profile-picker'));
  $('food-profile-button').addEventListener('click', () => show('profile-picker'));
  $('companion-centre').addEventListener('click', openVoice);
  $('food-companion-centre').addEventListener('click', openVoice);
  $('another-thought').addEventListener('click', setThought);
  $('close-voice').addEventListener('click', closeVoice);
  $('start-listening').addEventListener('click', startListening);
  document.querySelectorAll('[data-command]').forEach(btn => btn.addEventListener('click', () => handleCommand(btn.dataset.command)));

  $('settings-form').addEventListener('input', () => settingsDirty = true);
  $('settings-form').addEventListener('change', () => settingsDirty = true);
  $('settings-form').addEventListener('submit', e => { e.preventDefault(); saveSettings(); });
  $('save-and-leave').addEventListener('click', () => { saveSettings(); closeConfirm(); show(pendingNavigation || 'food-room'); pendingNavigation = null; });
  $('discard-and-leave').addEventListener('click', () => { settingsDirty = false; closeConfirm(); show(pendingNavigation || 'food-room'); pendingNavigation = null; });
  $('cancel-leave').addEventListener('click', () => { closeConfirm(); pendingNavigation = null; });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  if ('speechSynthesis' in window) {
    populateVoiceOptions();
    speechSynthesis.onvoiceschanged = populateVoiceOptions;
  }

  renderCharacterGrid('character-grid', selectedCharacter, id => selectedCharacter = id);
  if (state.activeProfileId && activeProfile()) {
    applyTheme(activeProfile().theme || 'forest');
    show('home-screen');
  } else if (state.profiles.length) {
    show('profile-picker');
  } else {
    show('welcome-screen');
  }
})();
