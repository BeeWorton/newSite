/* Kriljoona — a bilingual, unofficial Krillion community leaderboard.
   Default language: Finnish. API URL: ./config.js. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const translations = {
    fi: {
      adminLink:'Ylläpito ↗',brandCaption:'Krillionin tulostaulu',navLeaderboard:'Tulostaulu',navHow:'Ohjeet',navSubmit:'Ilmoita tulos ↗',
      heroEyebrow:'Pientä kisailua',heroTitle:'Kuinka <em>syvälle</em><br> pääsit?',
      heroCopy:'Seitsemän kysymystä. Yksi sukellus päivässä. Vertaile tuloksia kavereiden kanssa ja nouse tulostaulun kärkeen.',
      heroSubmit:'Ilmoita tulos ↗',heroPlay:'Pelaa ensin Krillionia ↗',heroOpen:'Päivän tulostaulu on auki',heroMax:'Enintään 700 pistettä',heroReset:'Päivä vaihtuu keskiyöllä ET',
      depthReport:'PÄIVÄN SYVYYSRAPORTTI',depthToday:'Päivän syvin sukellus',depthUnit:'metriä pinnan alla',conditions:'Tilanne nyt',awaiting:'Odotetaan ensimmäistä tulosta',
      diversLabel:'Osallistujat tänään',s1subToday:'Päivän tulostaululla',topScore:'Paras tulos',outOf700:'700 pisteestä',avgDive:'Keskiarvo',perPlayer:'Pistettä pelaajaa kohti',
      yourPosition:'Oma sijoituksesi',joinBoard:'Ilmoita tulos ja pääse mukaan',standings:'✦ &nbsp; Tulokset',
      boardTitleDaily:'Päivän <em>tulostaulu.</em>',boardTitleAll:'Kaikkien aikojen <em>tulostaulu.</em>',
      boardCaptionDaily:'Uusi tulostaulu joka päivä. Päivän tulosta voi korjata.',boardCaptionAll:'Jokainen päivittäinen tulos kasvattaa kokonaispisteitä.',
      panelTitleToday:'Päivän tulostaulu',panelSubtitleToday:'Mitä enemmän pisteitä, sitä parempi sijoitus.',daily:'Päivä',alltime:'Kaikki ajat',allDivers:'Kaikki pelaajat',totalZero:'0 yhteensä',
      selfReported:'Pelaajien itse ilmoittamat tulokset',copyBoard:'Kopioi linkki ↗',
      submitKicker:'✧ &nbsp; Päivän sukellus',submitTitle:'Ilmoita tuloksesi.',submitDesc:'Pelasitko jo päivän Krillionin? Lisää tuloksesi ja katso sijoituksesi.',
      displayName:'Näyttönimi',todayScore:'Päivän pistemäärä',estimatedDepth:'Arvioitu syvyys',submitButton:'Ilmoita tulokseni ↗',updateButton:'Päivitä tulokseni ↗',
      formNote:'Yksi tulos selainta ja päivää kohti. Voit korjata tulostasi. Tiliä ei tarvita.',loggedTag:'✓ &nbsp; Tuloksesi on tallennettu',pointsZero:'— pistettä',
      loggedDetail:'Olet mukana päivän tulostaululla.',shareResult:'Kopioi tulos ↗',seeRanking:'Katso sijoitus ↑',
      howTitle:'Ei kikkailua. Vain kisailua.',howDesc:'Pelaa Krillionin seitsemän kysymyksen Daily Dive, ilmoita lopulliset pisteesi ja nouse yhteisön tulostaululla. Tulokset perustuvat pelaajien omaan ilmoitukseen.',
      playToday:'Pelaa päivän peli ↗',footerCopyright:'© <span id="year"></span> Kriljoona · Epävirallinen Krillion-faniprojekti.',footerFun:'Hyvässä hengessä ♡',officialGame:'Virallinen peli ↗',
      demoRibbon:'ESITTELYTILA · Tulokset tallentuvat vain tähän selaimeen. Yhteinen tulostaulu edellyttää palvelimen asetuksia.',
      mainNav:'Päävalikko',oceanAria:'Päivän parhaan tuloksen näyttö',statsAria:'Tulostaulun tilastot',previousDay:'Edellinen päivä',nextDay:'Seuraava päivä',
      dateAria:'Tulostaulun päivämäärä',tabAria:'Tulostaulun näkymä',podiumAria:'Kolme parasta pelaajaa',formAria:'Tuloksen ilmoittaminen',
      namePlaceholder:'esim. sukeltaja',scorePlaceholder:'Anna 0–700',
      openSpot:'Vapaa paikka',points:'pistettä',pts:'p',you:'SINÄ',dives:'sukellusta',oneDive:'sukellus',loggedDives:'sukellusta kirjattu',
      emptyTitle:'Vielä hiljaista.',emptyToday:'Tälle päivälle ei ole tuloksia. Ole ensimmäinen!',emptyAll:'Tuloksia ei ole vielä ilmoitettu. Ole ensimmäinen!',
      metresDeep:'{depth} metriä syvällä',diversAll:'Pelaajia yhteensä',diversOnBoard:'Pelaajia tulostaululla',acrossAll:'Kaikilta päiviltä',forDate:'Päivältä {date}',
      highestTotal:'Eniten pisteitä',totalPoints:'Kertyneet pisteet',divesLogged:'Ilmoitettuja tuloksia',allDays:'Kaikilta päiviltä',
      improveRank:'Uusi tulos voi nostaa sijoitusta',noPastScore:'Ei tulosta tältä päivältä',
      rankToday:'Sijoitus {rank} tänään · {depth} metriä syvällä. Hyvä sukellus!',
      totalCount:'{count} yhteensä',panelAll:'Kaikkien aikojen kärki',panelDate:'{date} – tulokset',
      subtitleAll:'Kaikkien päivien pisteet yhteenlaskettuina.',subtitleDaily:'Pistejärjestys · {date}',today:'tänään',
      footnote:'100 parasta näkyvissä · Pelaajien ilmoittamat pisteet{demo}',demoSuffix:' · Esimerkkituloksia',
      oneSurfaced:'1 pelaaja pinnalla',manySurfaced:'{count} pelaajaa pinnalla',
      badName:'Anna 2–22 merkin pituinen näyttönimi.',badScore:'Anna kokonaisluku väliltä 0–700.',
      submitting:'Tallennetaan tulosta…',submitSuccess:'Tulos tallennettu! Löydät sen tulostaululta.',toastSuccess:'Tulos tallennettu ✧',
      fetchFail:'Yhteys tulospalvelimeen epäonnistui.',connectionTitle:'Yhteys katkesi.',connectionBody:'Tuloksia ei voitu ladata. Päivitä sivu ja yritä uudelleen.',
      copied:'Kopioitu leikepöydälle ✧',copyFailed:'Kopiointi ei onnistunut tässä selaimessa.',
      shareText:'Sukelsin {depth} metriä ({score}/700) päivän Krillionissa! 🌊\nKriljoonan tulostaulu: {url}',
      pageTitle:'Kriljoona – päivän tulostaulu',pageDescription:'Kriljoona: Krillionin päivittäinen yhteisötulostaulu. Ilmoita tuloksesi ja vertaa sijoitustasi muihin pelaajiin.'
    },
    en: {
      adminLink:'Admin ↗',brandCaption:'The Krillion leaderboard',navLeaderboard:'Leaderboard',navHow:'How it works',navSubmit:'Submit score ↗',
      heroEyebrow:'A little friendly competition',heroTitle:'How <em>deep</em><br> did you dive?',
      heroCopy:'Seven questions. One daily dive. Compare scores with your friends and claim your spot on the board.',
      heroSubmit:'Submit score ↗',heroPlay:'Play Krillion first ↗',heroOpen:'Today’s board is open',heroMax:'700 max points',heroReset:'Resets at midnight ET',
      depthReport:'DAILY DEPTH REPORT',depthToday:'Today’s deepest dive',depthUnit:'metres below the surface',conditions:'Current conditions',awaiting:'Awaiting the first score',
      diversLabel:'Divers today',s1subToday:'On today’s board',topScore:'Top score',outOf700:'Out of 700 points',avgDive:'Average score',perPlayer:'Points per player',
      yourPosition:'Your position',joinBoard:'Submit to join the board',standings:'✦ &nbsp; The standings',
      boardTitleDaily:'The daily <em>deep end.</em>',boardTitleAll:'The all-time <em>deep end.</em>',
      boardCaptionDaily:'A fresh board every day. You can correct your daily score.',boardCaptionAll:'Each daily score adds to your lifetime total.',
      panelTitleToday:'Today’s leaderboard',panelSubtitleToday:'The more points, the higher the rank.',daily:'Daily',alltime:'All time',allDivers:'All divers',totalZero:'0 total',
      selfReported:'Player-submitted scores',copyBoard:'Copy board link ↗',
      submitKicker:'✧ &nbsp; Your daily dive log',submitTitle:'Make a splash.',submitDesc:'Finished today’s Krillion? Enter your score and see where you land.',
      displayName:'Your display name',todayScore:'Today’s score',estimatedDepth:'Estimated depth',submitButton:'Submit my score ↗',updateButton:'Update my score ↗',
      formNote:'One entry per browser per day. You can correct your score. No account needed.',loggedTag:'✓ &nbsp; Your score is logged',pointsZero:'— points',
      loggedDetail:'You’re on today’s leaderboard.',shareResult:'Copy result ↗',seeRanking:'See ranking ↑',
      howTitle:'No mystery. Just bragging rights.',howDesc:'Play the seven-question Daily Dive on Krillion, enter your final score, and climb the community leaderboard. Scores are self-reported.',
      playToday:'Play today’s game ↗',footerCopyright:'© <span id="year"></span> Kriljoona · Unofficial Krillion fan project.',footerFun:'Made for friendly competition ♡',officialGame:'Official game ↗',
      demoRibbon:'DEMO MODE · Scores are saved in this browser only. Configure the backend for a shared leaderboard.',
      mainNav:'Main navigation',oceanAria:'Today’s highest score display',statsAria:'Leaderboard statistics',previousDay:'Previous day',nextDay:'Next day',
      dateAria:'Leaderboard date',tabAria:'Leaderboard view',podiumAria:'Top three divers',formAria:'Score submission',
      namePlaceholder:'e.g. deepdiver',scorePlaceholder:'Enter 0–700',
      openSpot:'Open spot',points:'points',pts:'pts',you:'YOU',dives:'dives',oneDive:'dive',loggedDives:'dives logged',
      emptyTitle:'Uncharted waters.',emptyToday:'No scores for this day yet. Be the first!',emptyAll:'No scores logged yet. Be the first!',
      metresDeep:'{depth} metres deep',diversAll:'Total divers',diversOnBoard:'Divers on board',acrossAll:'Across all daily dives',forDate:'For {date}',
      highestTotal:'Highest total',totalPoints:'Accumulated points',divesLogged:'Dives logged',allDays:'Across every day',
      improveRank:'Keep diving to rise higher',noPastScore:'No score logged for this day',
      rankToday:'Ranked {rank} today · {depth} metres deep. Nice dive!',
      totalCount:'{count} total',panelAll:'All-time legends',panelDate:'{date} leaderboard',
      subtitleAll:'Your scores across all daily dives.',subtitleDaily:'Ranked by points · {date}',today:'today',
      footnote:'Top 100 shown · Player-submitted scores{demo}',demoSuffix:' · Example entries',
      oneSurfaced:'1 diver has surfaced',manySurfaced:'{count} divers have surfaced',
      badName:'Enter a display name between 2 and 22 characters.',badScore:'Enter a whole number between 0 and 700.',
      submitting:'Saving your score…',submitSuccess:'Score saved! You’re on the leaderboard.',toastSuccess:'Score saved ✧',
      fetchFail:'The scoreboard server could not be reached.',connectionTitle:'Connection interrupted.',connectionBody:'Could not load scores. Please reload and try again.',
      copied:'Copied to clipboard ✧',copyFailed:'Copying is not available in this browser.',
      shareText:'I dove {depth} metres ({score}/700) on today’s Krillion! 🌊\nKriljoona leaderboard: {url}',
      pageTitle:'Kriljoona – daily leaderboard',pageDescription:'Kriljoona: an unofficial community leaderboard for daily Krillion scores. Submit your score and compare rankings.'
    }
  };
  const getSaved = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const putSaved = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  let language = getSaved('kriljoona-lang') === 'en' ? 'en' : 'fi';
  const t = (key, vars = {}) => String(translations[language][key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
  const esc = text => String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const number = n => Number(n || 0).toLocaleString(language === 'fi' ? 'fi-FI' : 'en-GB');
  const shortDate = day => { const [y,m,d] = day.split('-').map(Number); return new Date(Date.UTC(y,m-1,d,12)).toLocaleDateString(language==='fi'?'fi-FI':'en-GB', {year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}); };
  const pastDate = (day, offset) => { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+offset); return d.toISOString().slice(0,10); };
  const nyFmt = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'});
  const dateToday = () => { const p = Object.fromEntries(nyFmt.formatToParts(new Date()).map(x=>[x.type,x.value])); return `${p.year}-${p.month}-${p.day}`; };
  const today = dateToday();
  const configured = String(window.KRILJOONA_CONFIG?.apiBaseUrl || '').trim().replace(/\/+$/, '');
  // The public frontend lives on GitHub Pages. The backend is a separate Cloudflare Worker.
  const API_ROOT = /^https:\/\/[^\s/]+\//.test(configured + '/') || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(configured + '/') ? configured.replace(/\/api$/, '') + '/api' : '';
  const state = {date:today,tab:'daily',demo:!API_ROOT,data:null,lastScore:null,requestId:0};
  const demoKey = 'kriljoona-demo-v1';
  function getDemoDB() {
    try {const d=JSON.parse(getSaved(demoKey)); if(d && d.seedDate===today && Array.isArray(d.entries)) return d;} catch {}
    const d={entries:[],seedDate:today};
    const sample=[['meritähti',485],['sukeltaja',455],['krillikuningas',430],['manta',400],['syvänne',380],['mustekala',325],['plankton',295]];
    sample.forEach(([name,score],i) => d.entries.push({id:`sample${i}`,name,score,day:today,created_at:new Date(Date.now()-i*780000).toISOString()}));
    [['meritähti',395],['manta',505],['mustekala',305],['syvänne',375]].forEach(([name,score],i) => d.entries.push({id:`sample${sample.findIndex(s=>s[0]===name)}`,name,score,day:pastDate(today,-1),created_at:new Date(Date.now()-86400000-i*780000).toISOString()}));
    putSaved(demoKey,JSON.stringify(d));return d;
  }
  function demoLeaderboard(day) {
    const all=getDemoDB().entries.filter(e=>e.day===day).sort((a,b)=>b.score-a.score||a.created_at.localeCompare(b.created_at));
    const entries=all.slice(0,100).map((e,i)=>({name:e.name,score:e.score,rank:i+1,created_at:e.created_at,isYou:e.id==='me'}));
    const me=all.find(e=>e.id==='me');return {date:day,entries,count:all.length,topScore:all[0]?.score??0,average:all.length?Math.round(all.reduce((s,e)=>s+e.score,0)/all.length):0,me:me?{name:me.name,score:me.score,rank:all.indexOf(me)+1}:null};
  }
  function demoAllTime() {
    const db=getDemoDB(),byId=new Map();for(const e of db.entries){const v=byId.get(e.id)||{id:e.id,name:e.name,score:0,dives:0,best:0,day:''};v.score+=e.score;v.dives++;v.best=Math.max(v.best,e.score);if(e.day>=v.day){v.name=e.name;v.day=e.day;}byId.set(e.id,v);}
    const all=[...byId.values()].sort((a,b)=>b.score-a.score||b.best-a.best),me=all.find(e=>e.id==='me');
    return {entries:all.slice(0,100).map((e,i)=>({...e,rank:i+1,isYou:e.id==='me'})),count:all.length,dives:db.entries.length,topScore:all[0]?.score??0,me:me?{...me,rank:all.indexOf(me)+1}:null};
  }
  function playerToken() {
    let token=getSaved('kriljoona-player-token');
    if(token && /^[a-f0-9]{64}$/.test(token)) return token;
    token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
    putSaved('kriljoona-player-token',token);return token;
  }
  async function getJSON(path,options={}) {
    const res=await fetch(`${API_ROOT}${path}`,{...options,headers:{'X-Kriljoona-Player':playerToken(),...(options.headers||{})},cache:'no-store'});
    let data;try{data=await res.json();}catch{throw Error(t('fetchFail'));}
    if(!res.ok) throw Error(data?.code ? t('fetchFail') : t('fetchFail'));
    return data;
  }
  function setText(id,text){$(id).textContent=text;}
  let toastTimeout;
  function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('show'),2900);}
  function formFeedback(msg,type){const el=$('form-feedback');el.textContent=msg;el.className=`form-feedback show ${type}`;}
  const rankWord=n=>'#'+number(n);
  function setLanguage(lang) {
    language=lang;putSaved('kriljoona-lang',lang);document.documentElement.lang=lang;
    document.title=t('pageTitle');document.querySelector('meta[name="description"]').content=t('pageDescription');
    document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    document.querySelectorAll('[data-i18n-html]').forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAriaLabel)));
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
    setText('year',new Date().getFullYear());
    for(const choice of ['fi','en']){$('lang-'+choice).classList.toggle('lang-active',choice===language);$('lang-'+choice).setAttribute('aria-pressed',String(choice===language));}
    $('demo-ribbon').classList.toggle('hidden',!state.demo);
    updateTabLabels();if(state.data) render(state.data);else updatePreview();
  }
  function updateTabLabels() {
    const all=state.tab==='alltime';$('daily-tab').classList.toggle('active',!all);$('alltime-tab').classList.toggle('active',all);
    $('daily-tab').setAttribute('aria-pressed',String(!all));$('alltime-tab').setAttribute('aria-pressed',String(all));
    $('day-controls').classList.toggle('hidden',all);
    $('board-title').innerHTML=t(all?'boardTitleAll':'boardTitleDaily');$('board-caption').textContent=t(all?'boardCaptionAll':'boardCaptionDaily');
  }
  function activateTab(tab){state.tab=tab;updateTabLabels();}
  function renderPodium(entries) {
    const ordered=[entries[1],entries[0],entries[2]],positions=[2,1,3];
    $('podium').innerHTML=ordered.map((entry,i)=>{const rank=positions[i];
      if(!entry)return `<div class="podium-slot ${rank===1?'first':''}"><span class="podium-rank">${rank}</span><div class="podium-avatar">?</div><span class="podium-empty">${esc(t('openSpot'))}</span></div>`;
      return `<div class="podium-slot ${rank===1?'first':''}"><span class="podium-rank">${rank===1?'★':rank}</span><div class="podium-avatar">${esc(entry.name.trim().charAt(0).toUpperCase())}</div><div class="podium-name" title="${esc(entry.name)}">${esc(entry.name)}</div><div class="podium-score">${number(entry.score)}</div><div class="podium-small">${state.tab==='alltime'?number(entry.dives)+' '+t(entry.dives===1?'oneDive':'dives'):t('points')}</div></div>`;
    }).join('');
  }
  function renderRows(entries) {
    if(!entries.length){$('leaderboard-list').innerHTML=`<div class="empty-state"><div class="empty-state-icon">✧</div><strong>${esc(t('emptyTitle'))}</strong><p>${esc(t(state.tab==='alltime'?'emptyAll':'emptyToday'))}</p></div>`;return;}
    $('leaderboard-list').innerHTML=entries.map(e=>{
      const width=state.tab==='alltime'?Math.min(100,Math.round(100*e.score/Math.max(entries[0].score,1))):Math.min(100,Math.round(100*e.score/700));
      const note=state.tab==='alltime'?`${number(e.dives)} ${t('loggedDives')}`:t('metresDeep',{depth:number(e.score*10)});
      return `<div class="leader-row ${e.isYou?'is-me':''}"><div class="leader-rank">${e.rank}</div><div class="leader-profile"><div class="leader-avatar">${esc(e.name.trim().charAt(0).toUpperCase())}</div><div class="leader-name-wrap"><div class="leader-name">${esc(e.name)}${e.isYou?`<span class="you-pill">${esc(t('you'))}</span>`:''}</div><div class="leader-note">${esc(note)}</div></div></div><div class="mini-track"><div class="mini-fill" style="width:${width}%"></div></div><div class="leader-score">${number(e.score)}<small>${esc(t('pts'))}</small></div></div>`;
    }).join('');
  }
  function renderMyScore(data) {
    const me=state.tab==='daily'&&state.date===today?data.me:null;
    $('my-score-card').classList.toggle('hidden',!me);
    if(me){state.lastScore=me.score;setText('my-score-main',`${number(me.score)} ${t('points')}`);setText('my-score-detail',t('rankToday',{rank:rankWord(me.rank),depth:number(me.score*10)}));$('player-score').value=me.score;if(!$('player-name').value)$('player-name').value=me.name;}
    setText('submit-button',t(me?'updateButton':'submitButton'));updatePreview();
  }
  function renderStats(data) {
    const all=state.tab==='alltime';
    setText('s1label',t(all?'diversAll':'diversOnBoard'));setText('s1',number(data.count));setText('s1sub',all?t('acrossAll'):state.date===today?t('s1subToday'):t('forDate',{date:shortDate(state.date)}));
    setText('s2label',t(all?'highestTotal':'topScore'));setText('s2',number(data.topScore));setText('s2sub',t(all?'totalPoints':'outOf700'));
    setText('s3label',t(all?'divesLogged':'avgDive'));setText('s3',number(all?data.dives:data.average));setText('s3sub',t(all?'allDays':'perPlayer'));
    setText('s4label',t('yourPosition'));setText('s4',data.me?rankWord(data.me.rank):'—');setText('s4sub',data.me?t('improveRank'):state.date===today||all?t('joinBoard'):t('noPastScore'));
  }
  function updateHero(board){setText('hero-depth',board.count?number(board.topScore*10):'—');setText('ocean-status',board.count===0?t('awaiting'):board.count===1?t('oneSurfaced'):t('manySurfaced',{count:number(board.count)}));}
  function render(data){state.data=data;renderStats(data);renderPodium(data.entries);renderRows(data.entries);renderMyScore(data);
    setText('board-count',t('totalCount',{count:number(data.count)}));
    setText('panel-title',state.tab==='alltime'?t('panelAll'):state.date===today?t('panelTitleToday'):t('panelDate',{date:shortDate(state.date)}));
    setText('panel-subtitle',state.tab==='alltime'?t('subtitleAll'):t('subtitleDaily',{date:state.date===today?t('today'):shortDate(state.date)}));
    setText('board-footnote',t('footnote',{demo:state.demo?t('demoSuffix'):''}));
    if(state.tab==='daily'&&state.date===today)updateHero(data);
  }
  async function load(){const requestId=++state.requestId,all=state.tab==='alltime';$('leaderboard-list').classList.add('loading');
    try {const data=state.demo?(all?demoAllTime():demoLeaderboard(state.date)):await getJSON(all?'/all-time':`/leaderboard?date=${encodeURIComponent(state.date)}`);
      if(requestId===state.requestId)render(data);
    }catch{if(requestId===state.requestId){$('leaderboard-list').innerHTML=`<div class="empty-state"><strong>${esc(t('connectionTitle'))}</strong><p>${esc(t('connectionBody'))}</p></div>`;toast(t('fetchFail'));}}
    finally{if(requestId===state.requestId)$('leaderboard-list').classList.remove('loading');}
  }
  function updateURL(){const u=new URL(location.href);if(state.tab==='alltime'){u.searchParams.delete('date');u.searchParams.set('view','alltime');}else{u.searchParams.delete('view');if(state.date===today)u.searchParams.delete('date');else u.searchParams.set('date',state.date);}try{history.replaceState({},'',u.href);}catch{}}
  function selectDate(day){if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||day>today)return;state.date=day;$('selected-date').value=day;$('next-day').disabled=day>=today;if(state.tab!=='daily')activateTab('daily');updateURL();load();}
  async function submit(event){event.preventDefault();const name=$('player-name').value.trim(),raw=$('player-score').value.trim(),score=Number(raw);
    if(name.length<2||name.length>22||/[\x00-\x1f\x7f<>]/.test(name)){formFeedback(t('badName'),'error');return;}
    if(!raw||!Number.isInteger(score)||score<0||score>700){formFeedback(t('badScore'),'error');return;}
    const button=$('submit-button');button.disabled=true;button.textContent=t('submitting');
    try {if(state.demo){const db=getDemoDB(),existing=db.entries.find(e=>e.day===today&&e.id==='me');if(existing){existing.name=name;existing.score=score;}else db.entries.push({id:'me',name,score,day:today,created_at:new Date().toISOString()});putSaved(demoKey,JSON.stringify(db));}
      else await getJSON('/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,score})});
      putSaved('kriljoona-name',name);formFeedback(t('submitSuccess'),'success');toast(t('toastSuccess'));
      state.lastScore=score;activateTab('daily');state.date=today;$('selected-date').value=today;$('next-day').disabled=true;updateURL();await load();
    }catch{formFeedback(t('fetchFail'),'error');}
    finally{button.disabled=false;button.textContent=t(state.data?.me&&state.tab==='daily'&&state.date===today?'updateButton':'submitButton');}
  }
  function updatePreview(){const score=Number($('player-score').value);setText('depth-preview',`${number(Number.isFinite(score)?Math.max(0,Math.min(700,score))*10:0)} m ↓`);}
  async function copyText(value){try{await navigator.clipboard.writeText(value);toast(t('copied'));}catch{const ta=document.createElement('textarea');ta.value=value;document.body.append(ta);ta.select();try{document.execCommand('copy');toast(t('copied'));}catch{toast(t('copyFailed'));}ta.remove();}}
  async function loadTodayHero(){try{const board=state.demo?demoLeaderboard(today):await getJSON(`/leaderboard?date=${today}`);updateHero(board);}catch{}}
  function boot(){
    setText('hero-day',today.replace(/-/g,'.'));$('selected-date').max=today;$('selected-date').value=today;$('next-day').disabled=true;
    $('player-name').value=getSaved('kriljoona-name')||'';
    const params=new URLSearchParams(location.search);
    if(params.get('view')==='alltime')activateTab('alltime');
    else if(params.get('date')&&/^\d{4}-\d{2}-\d{2}$/.test(params.get('date'))&&params.get('date')<=today){state.date=params.get('date');$('selected-date').value=state.date;$('next-day').disabled=state.date===today;}
    for(const lang of ['fi','en'])$('lang-'+lang).addEventListener('click',()=>setLanguage(lang));
    $('daily-tab').addEventListener('click',()=>{activateTab('daily');updateURL();load();});
    $('alltime-tab').addEventListener('click',()=>{activateTab('alltime');updateURL();load();});
    $('selected-date').addEventListener('change',ev=>selectDate(ev.target.value));
    $('previous-day').addEventListener('click',()=>selectDate(pastDate(state.date,-1)));
    $('next-day').addEventListener('click',()=>selectDate(pastDate(state.date,1)));
    $('player-score').addEventListener('input',updatePreview);$('submit-form').addEventListener('submit',submit);
    $('copy-board').addEventListener('click',()=>copyText(location.href));
    $('share-result').addEventListener('click',()=>copyText(t('shareText',{depth:number((state.lastScore??0)*10),score:number(state.lastScore??0),url:location.origin==='null'?'benworton.com/kriljoona':location.origin+location.pathname})));
    setLanguage(language);load();if(state.tab==='alltime'||state.date!==today)loadTodayHero();
  }
  boot();
})();
