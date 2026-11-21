/* Kriljoona v4: separate in-depth statistics page. No login or chart dependency. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const dict = {
    fi: {
      brandCaption:'Krillionin tulostaulu',back:'← Tulostaulu',navDeep:'Syvätilastot',
      eyebrow:'✦ KRILJOONA / TILASTOLABORATORIO',title:'Syvemmälle<br><em>numeroihin.</em>',
      intro:'Tutki tulosten kehitystä, vertaile pelaajia ja löydä ennätykset. Kaikki luvut perustuvat yhteisön itse ilmoittamiin pisteisiin.',
      period:'AIKAVÄLI',dayUnit:'PÄIVÄÄ',loading:'Haetaan tuloksia…',ready:'Päivitetty · {from} – {to}',
      error:'Tilastojen lataus epäonnistui. Tarkista API ja päivitä sivu.',
      kpiPlays:'KIRJATUT TULOKSET',kpiPlaysNote:'Yksi tulos / pelaaja / päivä',
      kpiPlayers:'ERI PELAAJIA',kpiPlayersNote:'Yhdistetyt selaimet lasketaan kerran',
      kpiAverage:'PISTEKESKIARVO',kpiBest:'KAUDEN PARAS',kpiActive:'PELIPÄIVIÄ',kpiActiveNote:'Päiviä, joilta löytyy tuloksia',
      trendsTag:'SUUNTAVIIVAT',trendsTitle:'Tuloskehitys',trendsDesc:'Päivän keskiarvo ja korkein pistemäärä. Tyhjät päivät eivät tarkoita nollaa.',
      distributionTag:'JAKAUMA',distributionTitle:'Pistejakauma',distributionDesc:'Kuinka moneen pistehaarukkaan ilmoitetut tulokset osuvat?',
      activityTag:'AKTIIVISUUS',activityTitle:'Osallistumisaktiivisuus',activityDesc:'Tulosten määrä päivittäin tai viikoittain aikavälin mukaan.',
      versusTag:'VERTAILU',versusTitle:'Pelaaja vastaan pelaaja',versusDesc:'Valitse kaksi pelaajaa ja vertaa heidän pisteitään samoilla päivillä.',
      playerA:'PELAAJA A',playerB:'PELAAJA B',playersTag:'PELAAJAT',playersTitle:'Pelaajakohtaiset luvut',
      playersDesc:'Valitse rivi tarkempaa näkymää varten. Vakaus = pisteiden keskihajonta (pienempi on tasaisempi).',
      sortBy:'JÄRJESTÄ',sortPlays:'Eniten pelejä',sortAverage:'Korkein keskiarvo',sortBest:'Paras yksittäinen tulos',sortTotal:'Kokonaispisteet',sortConsistent:'Tasaisin (vähintään 3 peliä)',
      colPlayer:'PELAAJA',colPlays:'PELEJÄ',colAverage:'KESKIARVO',colBest:'PARAS',colTotal:'YHTEENSÄ',colConsistency:'VAKAUS (σ)',
      spotlightTag:'PELAAJAKORTTI',spotlightTitle:'Yksittäisen pelaajan kehitys',spotAverage:'KESKIARVO',spotBest:'ENNÄTYS',spotStreak:'PISIN PELIPUTKI',spotChange:'VIIMEISET 3 VS. ENSIMMÄISET 3',
      spotDesc:'Näkyvissä vain tämän aikavälin ilmoitetut tulokset, ei arvioituja tuloksia.',
      disclaimer:'Tilastot perustuvat itse ilmoitettuihin pisteisiin. Sama linkitetty pelaaja lasketaan samalta päivältä vain kerran (paras tulos). Näyttönimet eivät ole vahvistettuja henkilöllisyyksiä.',
      unofficial:'Epävirallinen faniprojekti',game:'Virallinen peli ↗',demo:'ESITTELYTILA · Näytetään kuvitteellisia esimerkkituloksia, ei oikeaa tietokantaa.',
      empty:'Ei tuloksia valitulta aikaväliltä.',average:'Keskiarvo',best:'Päivän paras',daily:'Tuloksia / päivä',weekly:'Tuloksia / 7 päivää',scores:'pistettä',
      compareAvg:'Keskiarvo',comparePlays:'Pelejä',selectPlayer:'Valitse pelaaja',showing:'Näytetään {count} / {total} pelaajaa. Näkymässä ovat aktiivisimmat pelaajat.',
      allShown:'{count} pelaajaa tällä aikavälillä',streakUnit:'päivää',na:'Ei riittävästi tuloksia'
    },
    en: {
      brandCaption:'Krillion leaderboard',back:'← Leaderboard',navDeep:'Deep statistics',
      eyebrow:'✦ KRILJOONA / ANALYSIS DECK',title:'A deeper<br><em>dive into data.</em>',
      intro:'Explore score trends, compare players, and discover personal bests. All figures are based on community-submitted scores.',
      period:'DATE RANGE',dayUnit:'DAYS',loading:'Loading results…',ready:'Updated · {from} – {to}',
      error:'Could not load statistics. Check the API and refresh.',
      kpiPlays:'RECORDED SCORES',kpiPlaysNote:'One result / player / day',
      kpiPlayers:'UNIQUE PLAYERS',kpiPlayersNote:'Linked browsers count once',
      kpiAverage:'AVERAGE SCORE',kpiBest:'TOP SCORE',kpiActive:'ACTIVE DAYS',kpiActiveNote:'Days with at least one result',
      trendsTag:'TRENDS',trendsTitle:'Score trends',trendsDesc:'Daily average and highest score. Missing days are not zero scores.',
      distributionTag:'DISTRIBUTION',distributionTitle:'Score distribution',distributionDesc:'How many submitted scores fall into each score band?',
      activityTag:'ACTIVITY',activityTitle:'Participation over time',activityDesc:'Number of results per day or week, depending on the selected range.',
      versusTag:'COMPARISON',versusTitle:'Head-to-head comparison',versusDesc:'Choose two players to compare their scores on the same calendar days.',
      playerA:'PLAYER A',playerB:'PLAYER B',playersTag:'PLAYERS',playersTitle:'Player breakdown',
      playersDesc:'Select a row to see the detailed view. Consistency = standard deviation (smaller means steadier).',
      sortBy:'SORT BY',sortPlays:'Most plays',sortAverage:'Highest average',sortBest:'Best single score',sortTotal:'Total points',sortConsistent:'Most consistent (min. 3 plays)',
      colPlayer:'PLAYER',colPlays:'PLAYS',colAverage:'AVERAGE',colBest:'BEST',colTotal:'TOTAL',colConsistency:'CONSISTENCY (σ)',
      spotlightTag:'PLAYER PROFILE',spotlightTitle:'Individual score progression',spotAverage:'AVERAGE',spotBest:'PERSONAL BEST',spotStreak:'LONGEST PLAY STREAK',spotChange:'LAST 3 VS FIRST 3',
      spotDesc:'Only recorded scores are shown for this period; missing days are not estimated.',
      disclaimer:'Scores are self-reported. A linked player counts once per day (highest score). Display names are not verified identities.',
      unofficial:'Unofficial fan project',game:'Official game ↗',demo:'DEMO MODE · These are fictional sample results, not your live database.',
      empty:'No scores in this period.',average:'Average',best:'Daily best',daily:'Results / day',weekly:'Results / 7 days',scores:'points',
      compareAvg:'Average',comparePlays:'Plays',selectPlayer:'Choose player',showing:'Showing {count} / {total} players. The most active players are included.',
      allShown:'{count} players in this period',streakUnit:'days',na:'Not enough scores'
    }
  };
  const colors = ['#aceada','#f2b893','#a8bbf4'];
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => {try{return localStorage.getItem(key);}catch{return null;}};
  const store = (key,val) => {try{localStorage.setItem(key,val);}catch{}};
  let lang = read('kriljoona-lang') === 'en' ? 'en' : 'fi';
  const state = {days:90, data:null, request:0, sort:'plays', spot:null, a:null, b:null, loading:false, failed:false};
  const t = (key,args={}) => String(dict[lang][key] ?? key).replace(/\{(\w+)\}/g,(_,v)=>String(args[v]??''));
  const n = value => Number(value || 0).toLocaleString(lang==='fi'?'fi-FI':'en-GB',{maximumFractionDigits:1});
  const nyFmt = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'});
  const today = () => {const p=Object.fromEntries(nyFmt.formatToParts(new Date()).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;};
  const shiftDay = (day,days) => {const date=new Date(day+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10);};
  const shortDate = day => {const [y,m,d]=day.split('-').map(Number);return new Date(Date.UTC(y,m-1,d,12)).toLocaleDateString(lang==='fi'?'fi-FI':'en-GB',{day:'numeric',month:'short',timeZone:'UTC'});};
  const daysBetween = (a,b) => Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000);
  const apiBase = String(window.KRILJOONA_CONFIG?.apiBaseUrl || '').trim().replace(/\/+$/,'');
  const API = (/^https:\/\/[^\s/]+/.test(apiBase) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(apiBase)) ? apiBase.replace(/\/api$/,'') + '/api' : '';
  const sampleMode = !API;

  function demoPayload(days) {
    const end=today(), since=shiftDay(end,-days+1);
    const names=['Juulia','Kim','Lilja','Tuukka','Aku','Ben','Meritähti','Sukeltaja'];
    const rows=[];
    for(let d=0;d<days;d++){
      const day=shiftDay(since,d);
      for(let p=0;p<names.length;p++){
        if((d*3+p*7+13)%11<3 || (d+p*5)%17===1) continue;
        const value=Math.min(700,Math.max(0,Math.round(225+(p*39)%130+d*.52+Math.sin(d*.36+p)*67+Math.cos(d*.12+p*.8)*37)));
        rows.push({id:`p${p+1}`,name:names[p],day,score:value});
      }
    }
    const daily=[];const byDay=new Map();const byId=new Map();const dist=Array(7).fill(0);
    for(const row of rows){const list=byDay.get(row.day)||[];list.push(row.score);byDay.set(row.day,list);const p=byId.get(row.id)||{id:row.id,name:row.name,results:[]};p.results.push({day:row.day,score:row.score});byId.set(row.id,p);dist[Math.min(6,Math.floor(row.score/100))]++;}
    for(const [day,values] of byDay)daily.push({day,count:values.length,average:Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10,best:Math.max(...values)});
    const players=[...byId.values()].map(p=>({...p,plays:p.results.length,total:p.results.reduce((a,r)=>a+r.score,0),average:Math.round(p.results.reduce((a,r)=>a+r.score,0)/p.results.length*10)/10,best:Math.max(...p.results.map(r=>r.score))})).sort((a,b)=>b.plays-a.plays||b.total-a.total);
    return {days,since,until:end,summary:{plays:rows.length,players:players.length,average:rows.length?Math.round(rows.reduce((a,r)=>a+r.score,0)/rows.length*10)/10:0,best:rows.length?Math.max(...rows.map(r=>r.score)):0,activeDays:daily.length},daily,distribution:dist.map((count,bucket)=>({bucket,count})),players,playerLimit:60,limited:false};
  }

  function fmtChanged(diff){if(diff==null)return '—';return `${diff>0?'+':''}${n(Math.round(diff))}`;}
  function stdev(player){const vals=player.results.map(r=>Number(r.score));if(vals.length<3)return null;const mean=vals.reduce((a,b)=>a+b,0)/vals.length;return Math.sqrt(vals.reduce((a,v)=>a+(v-mean)**2,0)/vals.length);}
  function streak(player){let run=0,max=0,last=null;for(const {day} of [...player.results].sort((a,b)=>a.day.localeCompare(b.day))){run=last&&daysBetween(last,day)===1?run+1:1;max=Math.max(max,run);last=day;}return max;}
  function change(player){const results=[...player.results].sort((a,b)=>a.day.localeCompare(b.day));if(results.length<6)return null;const avg=arr=>arr.reduce((a,r)=>a+Number(r.score),0)/arr.length;return avg(results.slice(-3))-avg(results.slice(0,3));}
  function dates(){return Array.from({length:state.days},(_,i)=>shiftDay(state.data.since,i));}

  function lineSVG(series, allDates, height=274, showDots=true) {
    if(!series.some(s=>s.items.length))return `<div class="empty">${safe(t('empty'))}</div>`;
    const width=800,padL=40,padR=20,padT=24,padB=34,xrange=width-padL-padR,yrange=height-padT-padB;
    const toX=i=>padL+(i/Math.max(1,allDates.length-1))*xrange;
    const toY=v=>padT+(1-(Number(v)/700))*yrange;
    const grids=[0,175,350,525,700].map(v=>`<line x1="${padL}" x2="${width-padR}" y1="${toY(v)}" y2="${toY(v)}" stroke="#45616a" stroke-opacity=".6"/><text x="${padL-9}" y="${toY(v)+3}" font-size="10" text-anchor="end" fill="#91a9af">${v}</text>`).join('');
    const steps=[0,Math.floor((allDates.length-1)/2),allDates.length-1];
    const labels=steps.map(i=>`<text x="${toX(i)}" y="${height-7}" fill="#91a9af" text-anchor="middle" font-size="10">${safe(shortDate(allDates[i]))}</text>`).join('');
    const path=series.map((s,k)=>{
      const points=new Map(s.items.map(r=>[r.day,Number(r.score)]));let segments=[],current=[];
      allDates.forEach((day,i)=>{const value=points.get(day);if(Number.isFinite(value)){current.push(`${toX(i).toFixed(1)},${toY(value).toFixed(1)}`);}else if(current.length){segments.push(current);current=[];}});
      if(current.length)segments.push(current);
      const lines=segments.map(seg=>seg.length===1?`<circle cx="${seg[0].split(',')[0]}" cy="${seg[0].split(',')[1]}" r="3.2" fill="${colors[k%colors.length]}"/>`:`<polyline points="${seg.join(' ')}" stroke="${colors[k%colors.length]}" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`).join('');
      const dots=showDots&&allDates.length<=90?s.items.filter(r=>allDates.includes(r.day)).map(r=>{const i=allDates.indexOf(r.day);return `<circle cx="${toX(i)}" cy="${toY(r.score)}" r="3.2" fill="${colors[k%colors.length]}" stroke="#0e2b36" stroke-width="1"><title>${safe(s.name)} · ${safe(r.day)} · ${Number(r.score)}/700</title></circle>`;}).join(''):'';
      return lines+dots;
    }).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${safe(series.map(s=>s.name).join(' · '))}"><title>${safe(series.map(s=>s.name).join(' / '))}</title>${grids}${labels}${path}</svg>`;
  }
  function legend(items){return items.map((name,i)=>`<span><i style="--color:${colors[i%colors.length]}"></i>${safe(name)}</span>`).join('');}
  function renderCharts(data){
    const d=dates();$('trends-chart').innerHTML=lineSVG([
      {name:t('average'),items:data.daily.map(r=>({day:r.day,score:r.average}))},
      {name:t('best'),items:data.daily.map(r=>({day:r.day,score:r.best}))}
    ],d);
    $('trends-legend').innerHTML=legend([t('average'),t('best')]);
    const distribution=Array.from({length:7},(_,bucket)=>({bucket,count:Number(data.distribution.find(r=>Number(r.bucket)===bucket)?.count||0)}));
    const max=Math.max(1,...distribution.map(r=>r.count)),total=distribution.reduce((a,r)=>a+r.count,0);
    $('distribution').innerHTML=distribution.map(({bucket,count})=>{const min=bucket*100,maxScore=bucket===6?700:min+99;return `<div class="dist-row"><span class="dist-name">${min}–${maxScore}</span><div class="track" role="meter" aria-label="${min}–${maxScore}" aria-valuemin="0" aria-valuemax="${Math.max(1,total)}" aria-valuenow="${count}"><div class="fill" style="width:${100*count/max}%"></div></div><span class="dist-count">${n(count)} · ${total?Math.round(100*count/total):0}%</span></div>`;}).join('');
    renderActivity(data,d);
  }
  function renderActivity(data,allDates){
    const span=state.days>=90?7:1,bucketCount=Math.ceil(allDates.length/span),bars=Array.from({length:bucketCount},(_,i)=>({from:allDates[i*span],count:0}));
    const countByDay=new Map(data.daily.map(row=>[row.day,Number(row.count)]));
    allDates.forEach((day,i)=>{bars[Math.floor(i/span)].count+=countByDay.get(day)||0;});
    const width=800,height=274,left=30,right=13,top=24,bottom=34,max=Math.max(1,...bars.map(b=>b.count));
    const usable=width-left-right,gap=Math.min(6,usable/bars.length*.18),barWidth=(usable/bars.length)-gap;
    const grid=[0,0.5,1].map(v=>{const y=top+(height-top-bottom)*(1-v);return `<line x1="${left}" x2="${width-right}" y1="${y}" y2="${y}" stroke="#45616a" stroke-opacity=".6"/>`;}).join('');
    const rects=bars.map((bar,i)=>{const h=(height-top-bottom)*bar.count/max,x=left+i*usable/bars.length+gap/2,y=height-bottom-h;return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${Math.max(1,barWidth).toFixed(2)}" height="${Math.max(0,h).toFixed(2)}" rx="2.5" fill="#aceada" opacity="${bar.count?.85:.2}"><title>${safe(bar.from)} · ${bar.count}</title></rect>`;}).join('');
    const marks=[0,Math.floor((bars.length-1)/2),bars.length-1].map(i=>`<text x="${left+(i+.5)*usable/bars.length}" y="${height-7}" fill="#91a9af" text-anchor="middle" font-size="10">${safe(shortDate(bars[i].from))}</text>`).join('');
    $('activity-chart').innerHTML=bars.some(b=>b.count)?`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${safe(t(span===1?'daily':'weekly'))}"><title>${safe(t(span===1?'daily':'weekly'))}</title>${grid}${rects}${marks}</svg>`:`<div class="empty">${safe(t('empty'))}</div>`;
    $('activity-legend').innerHTML=legend([t(span===1?'daily':'weekly')]);
  }
  function addOptions(select,id){select.innerHTML=state.data.players.map(p=>`<option value="${safe(p.id)}" ${p.id===id?'selected':''}>${safe(p.name)}</option>`).join('');if(id)select.value=id;}
  function renderCompare(){
    const data=state.data;if(!data)return;
    const a=data.players.find(p=>p.id===state.a),b=data.players.find(p=>p.id===state.b);
    if(!a||!b){$('compare-chart').innerHTML=`<div class="empty">${safe(t('empty'))}</div>`;$('compare-summary').textContent='';return;}
    $('compare-chart').innerHTML=lineSVG([{name:a.name,items:a.results},{name:b.name,items:b.results}],dates(),265);
    $('compare-summary').innerHTML=`<span><i style="color:${colors[0]}">●</i> ${safe(a.name)} — ${safe(t('compareAvg'))}: <b>${n(a.average)}</b> · ${safe(t('comparePlays'))}: <b>${n(a.plays)}</b></span><span><i style="color:${colors[1]}">●</i> ${safe(b.name)} — ${safe(t('compareAvg'))}: <b>${n(b.average)}</b> · ${safe(t('comparePlays'))}: <b>${n(b.plays)}</b></span>`;
  }
  function renderTable(){
    const data=state.data;if(!data)return;
    let players=[...data.players];
    const sort=state.sort;
    players.sort((a,b)=>{
      if(sort==='consistent'){
        const av=stdev(a),bv=stdev(b);return (av===null?Infinity:av)-(bv===null?Infinity:bv)||b.plays-a.plays;
      }
      return Number(b[sort])-Number(a[sort])||b.plays-a.plays||a.name.localeCompare(b.name);
    });
    $('player-body').innerHTML=players.map(p=>`<tr class="${p.id===state.spot?'selected':''}"><td><button class="player-button" type="button" data-player="${safe(p.id)}" aria-label="${safe(p.name)}">${safe(p.name)}</button></td><td class="number-cell">${n(p.plays)}</td><td class="number-cell">${n(p.average)}</td><td class="number-cell">${n(p.best)}</td><td class="number-cell">${n(p.total)}</td><td class="number-cell">${stdev(p)===null?'—':n(stdev(p))}</td></tr>`).join('') || `<tr><td colspan="6">${safe(t('empty'))}</td></tr>`;
    $('table-note').textContent=data.limited?t('showing',{count:data.players.length,total:data.summary.players}):t('allShown',{count:data.players.length});
    $('player-body').querySelectorAll('[data-player]').forEach(btn=>btn.addEventListener('click',()=>{state.spot=btn.dataset.player;renderTable();renderSpot();document.getElementById('spotlight').scrollIntoView({behavior:'smooth',block:'center'});}));
  }
  function renderSpot(){const p=state.data?.players.find(row=>row.id===state.spot);
    if(!p){$('spot-name').textContent='—';$('spot-chart').innerHTML=`<div class="empty">${safe(t('empty'))}</div>`;return;}
    $('spot-name').textContent=p.name;$('spot-average').textContent=n(p.average);$('spot-best').textContent=n(p.best);
    $('spot-streak').textContent=`${n(streak(p))} ${t('streakUnit')}`;$('spot-change').textContent=fmtChanged(change(p));
    $('spot-chart').innerHTML=lineSVG([{name:p.name,items:p.results}],dates(),236);
  }
  function render(){if(!state.data)return;const d=state.data;
    $('kpi-plays').textContent=n(d.summary.plays);$('kpi-players').textContent=n(d.summary.players);
    $('kpi-average').textContent=n(d.summary.average);$('kpi-best').textContent=n(d.summary.best);$('kpi-days').textContent=n(d.summary.activeDays);
    renderCharts(d);addOptions($('compare-a'),state.a);addOptions($('compare-b'),state.b);renderCompare();renderTable();renderSpot();
    $('status').className='status';$('status').textContent=sampleMode?'DEMO · '+t('ready',{from:shortDate(d.since),to:shortDate(d.until)}):t('ready',{from:shortDate(d.since),to:shortDate(d.until)});
  }
  function setLanguage(next){lang=next;store('kriljoona-lang',lang);document.documentElement.lang=lang;
    document.title=lang==='fi'?'Kriljoona — Syvätilastot':'Kriljoona — Deep statistics';
    document.querySelector('meta[name=description]').content=lang==='fi'?'Kriljoona: tarkemmat tulostilastot, vertailut ja kehityskäyrät.':'Kriljoona: detailed statistics, comparisons, and score trends.';
    document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    document.querySelectorAll('[data-i18n-html]').forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));
    for(const l of ['fi','en']){$(l).classList.toggle('active',l===lang);$(l).setAttribute('aria-pressed',String(l===lang));}
    if(state.data)render();else if(!state.loading)$('status').textContent=state.failed?t('error'):t('loading');
  }
  async function load(days){state.days=days;state.loading=true;state.failed=false;
    for(const btn of document.querySelectorAll('[data-days]')){const active=Number(btn.dataset.days)===days;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));}
    $('status').className='status';$('status').textContent=t('loading');const request=++state.request;
    try{
      let result;
      if(sampleMode){result=demoPayload(days);}else{
        const res=await fetch(`${API}/insights?days=${days}`,{cache:'no-store'});
        if(!res.ok)throw Error(`HTTP ${res.status}`);
        result=await res.json();
      }
      if(request!==state.request)return;
      if(!result||!Array.isArray(result.players)||!Array.isArray(result.daily)||!result.summary)throw Error('Malformed response');
      state.data=result;
      const ids=result.players.map(p=>p.id);
      state.a=ids.includes(state.a)?state.a:ids[0]||null;
      state.b=ids.includes(state.b)?state.b:ids[1]||ids[0]||null;
      state.spot=ids.includes(state.spot)?state.spot:ids[0]||null;
      render();
    }catch(err){if(request!==state.request)return;console.error('Kriljoona insights:',err);state.failed=true;$('status').className='status error';$('status').textContent=t('error');}
    finally{if(request===state.request)state.loading=false;}
  }
  $('year').textContent=new Date().getFullYear();
  for(const next of ['fi','en'])$(next).addEventListener('click',()=>setLanguage(next));
  document.querySelectorAll('[data-days]').forEach(btn=>btn.addEventListener('click',()=>load(Number(btn.dataset.days))));
  $('compare-a').addEventListener('change',e=>{state.a=e.target.value;renderCompare();});
  $('compare-b').addEventListener('change',e=>{state.b=e.target.value;renderCompare();});
  $('sort').addEventListener('change',e=>{state.sort=e.target.value;renderTable();});
  $('demo').classList.toggle('hidden',!sampleMode);
  setLanguage(lang);load(90);
})();
