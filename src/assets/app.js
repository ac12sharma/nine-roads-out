/* Nine Roads Out: page behaviour. Everything here enhances pages that already work without JavaScript.
   Written as a module so it can import src/shared/; src/bundle.mjs turns it into one classic script. */
import { esc, fmtMins, sunTimes, fmtClock, DUBLIN } from '../shared/format.mjs';
import { normalise, fromDrives, statsOf, levelLine, nextLine, shareText, TOTAL } from '../shared/levels.mjs';
import { START, newContext, greeting, reply } from '../shared/planner.mjs';
(function(){
'use strict';
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.prototype.slice.call((r||document).querySelectorAll(s));
const RM=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const RAD=Math.PI/180;

/* ---------- menu ---------- */
$$('.menu-panel a').forEach(a=>a.addEventListener('click',()=>{const d=a.closest('details');if(d)d.removeAttribute('open');}));
document.addEventListener('click',e=>{const d=$('.menu[open]');if(d&&!d.contains(e.target))d.removeAttribute('open');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const d=$('.menu[open]');if(d){d.removeAttribute('open');d.querySelector('summary').focus();}}});

/* ---------- copy and share ---------- */
function say(el,msg){if(!el)return;el.textContent=msg;clearTimeout(el.__t);el.__t=setTimeout(()=>{el.textContent='';},2600);}
function copyText(text,msgEl){
  const fallback=()=>{const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy');}catch(e){}ta.remove();say(msgEl,ok?'Copied':'Select the text to copy it');};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(()=>say(msgEl,'Copied'),fallback);else fallback();
}
$$('.share').forEach(box=>{
  if(box.classList.contains('lvl-share'))return; /* wired up by the map page */
  const url=box.getAttribute('data-url'),title=box.getAttribute('data-title'),msg=$('.share-msg',box);
  const c=$('[data-share="copy"]',box);if(c)c.addEventListener('click',()=>copyText(url,msg));
  const n=$('[data-share="native"]',box);
  if(n&&navigator.share){n.hidden=false;n.addEventListener('click',()=>{navigator.share({title:title,url:url}).catch(()=>{});});}
});
$$('[data-copy]').forEach(b=>b.addEventListener('click',()=>{const el=$(b.getAttribute('data-copy'));if(el)copyText(el.textContent.trim(),b.parentElement.querySelector('.share-msg'));}));

/* ---------- cookie settings (Google's consent message, configured in AdSense > Privacy & messaging) ---------- */
$$('[data-consent]').forEach(b=>b.addEventListener('click',()=>{
  window.googlefc=window.googlefc||{};window.googlefc.callbackQueue=window.googlefc.callbackQueue||[];
  window.googlefc.callbackQueue.push(()=>{if(typeof window.googlefc.showRevocationMessage==='function')window.googlefc.showRevocationMessage();});
}));

/* ---------- daylight ---------- */
function daylight(trips){
  if(!$('#dl-rise'))return;
  try{
    const now=new Date(),s=sunTimes(now,DUBLIN.lat,DUBLIN.lon);
    $('#dl-date').textContent=now.toLocaleDateString('en-IE',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/Dublin'});
    $('#dl-rise').textContent=fmtClock(s.rise);
    $('#dl-set').textContent=fmtClock(s.set);
    const dh=(s.set.getTime()-s.rise.getTime())/36e5;$('#dl-len').textContent=fmtMins(dh*60)+' of daylight';
    if(trips){
      const miss=trips.filter(t=>t.drive+3>dh),fit=trips.length-miss.length;
      $('#dl-advice').textContent=miss.length===0
        ?'Enough light today for any of the nine, allowing about three hours for stops. Leave early for the long ones.'
        :'Enough light today for '+fit+' of the nine, allowing about three hours for stops. '+miss.map(t=>t.en).join(', ').replace(/, ([^,]*)$/,' and $1')+(miss.length>1?' need':' needs')+' a longer day or a night away.';
    }
  }catch(e){}
}

/* ---------- traveller levels: saved only in this browser ---------- */
const KEY='nro-progress-v1';
function readP(){try{return normalise(JSON.parse(localStorage.getItem(KEY)||'null'));}catch(e){return normalise(null);}}
function writeP(p){try{localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}refreshLevels();}
function toggleDrive(id,counties,on){
  const p=readP(),i=p.drives.indexOf(id);
  if(on&&i<0){p.drives.push(id);p.dc[id]=counties;}
  if(!on&&i>-1){p.drives.splice(i,1);delete p.dc[id];}
  writeP(p);
}

function refreshLevels(){
  const p=readP(),st=statsOf(p);
  const pill=$('.lvl-pill');
  if(pill){if(st.n){pill.hidden=false;pill.innerHTML='<span class="mark" aria-hidden="true">'+st.L.n+'</span><span>Level '+st.L.n+', '+st.pct+'%</span>';pill.setAttribute('aria-label','Your traveller level: '+levelLine(st));}else pill.hidden=true;}
  const now=$('[data-lvl-now]');
  if(now){if(st.n){now.hidden=false;now.textContent='You\'re a '+levelLine(st)+'.';}else now.hidden=true;}
  $$('.done-b').forEach(b=>{
    const id=b.getAttribute('data-done'),on=p.drives.indexOf(id)>-1;b.setAttribute('aria-pressed',String(on));
    $('.done-t',b).textContent=on?'You\'ve done this drive':'I\'ve done this drive';
    const msg=b.parentElement.querySelector('[data-done-msg]');
    if(msg&&on){msg.innerHTML='Counted. You\'re a '+esc(levelLine(st))+'. <a href="'+esc(($('.lvl-pill')||{}).getAttribute?$('.lvl-pill').getAttribute('href'):'#')+'">See your map</a>.';}
    else if(msg&&msg.__orig)msg.innerHTML=msg.__orig;
  });
  if(mapView)mapView(p,st);
}
$$('.done-b').forEach(b=>{
  const msg=b.parentElement.querySelector('[data-done-msg]');if(msg)msg.__orig=msg.innerHTML;
  b.addEventListener('click',()=>toggleDrive(b.getAttribute('data-done'),b.getAttribute('data-counties').split('|'),b.getAttribute('aria-pressed')!=='true'));
});
window.addEventListener('storage',e=>{if(e.key===KEY)refreshLevels();});

/* ---------- Your Ireland map ---------- */
let mapView=null;
(function(){
  const root=$('.ie');if(!root)return;
  const paths=$$('.ie-c',root),chips=$$('[data-county-chip]',root),boxes=$$('[data-drive]',root);
  const toast=document.createElement('p');toast.className='ie-toast';toast.setAttribute('role','status');$('.ie-fig',root).appendChild(toast);
  const tell=m=>{toast.textContent=m;toast.classList.add('is-on');clearTimeout(toast.__t);toast.__t=setTimeout(()=>toast.classList.remove('is-on'),3200);};
  function toggleCounty(c){
    const p=readP(),i=p.manual.indexOf(c);
    if(i>-1){p.manual.splice(i,1);if(fromDrives(p).has(c))tell(c+' stays on: it\'s counted from a drive you\'ve ticked off.');}
    else if(fromDrives(p).has(c)){tell(c+' is already counted from a drive you\'ve ticked off.');return;}
    else p.manual.push(c);
    writeP(p);
  }
  /* Keyboard: the map is a single Tab stop (roving tabindex). Arrow keys move to the nearest county
     in that direction, measured between county centres, so 26 counties don't cost 26 Tab presses.
     The list of county buttons below the map offers the same choices in alphabetical order. */
  const centre=el=>{const b=el.getBBox();return[b.x+b.width/2,b.y+b.height/2];};
  const DIRS={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]};
  function neighbour(from,key){
    const [fx,fy]=centre(from),[dx,dy]=DIRS[key];let best=null,bs=Infinity;
    paths.forEach(el=>{if(el===from)return;const [x,y]=centre(el),along=(x-fx)*dx+(y-fy)*dy,across=Math.abs((x-fx)*dy-(y-fy)*dx);
      if(along<=0)return;const s=along+across*2;if(s<bs){bs=s;best=el;}});
    return best;
  }
  function moveTo(el){paths.forEach(p=>p.setAttribute('tabindex',p===el?'0':'-1'));el.focus();}
  paths.forEach(el=>{const c=el.getAttribute('data-county');
    el.addEventListener('click',()=>{toggleCounty(c);paths.forEach(p=>p.setAttribute('tabindex',p===el?'0':'-1'));});
    el.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleCounty(c);return;}
      if(DIRS[e.key]){e.preventDefault();const n=neighbour(el,e.key);if(n)moveTo(n);return;}
      if(e.key==='Home'||e.key==='End'){e.preventDefault();moveTo(paths[e.key==='Home'?0:paths.length-1]);}
    });});
  chips.forEach(b=>b.addEventListener('click',()=>toggleCounty(b.getAttribute('data-county-chip'))));
  boxes.forEach(b=>b.addEventListener('change',()=>toggleDrive(b.getAttribute('data-drive'),b.getAttribute('data-counties').split('|'),b.checked)));
  const share=$('.lvl-share',root),msg=$('.share-msg',share),url=share.getAttribute('data-url');
  $('[data-share="copy-level"]',share).addEventListener('click',()=>copyText(shareText(statsOf(readP()))+' '+url,msg));
  const nat=$('[data-share="native-level"]',share);
  if(navigator.share){nat.hidden=false;nat.addEventListener('click',()=>{navigator.share({title:'How much of Ireland have you driven?',text:shareText(statsOf(readP())),url:url}).catch(()=>{});});}
  const reset=$('[data-reset]',root);let armed=false;
  reset.addEventListener('click',()=>{
    if(!armed){armed=true;reset.textContent='Tap again to clear everything';setTimeout(()=>{armed=false;reset.textContent='Clear my map';},4000);return;}
    armed=false;reset.textContent='Clear my map';writeP({drives:[],manual:[],dc:{}});tell('Your map is clear.');
  });
  mapView=function(p,st){
    const fd=fromDrives(p);
    paths.forEach(el=>{const c=el.getAttribute('data-county'),on=st.all.has(c);el.classList.toggle('is-on',on);el.classList.toggle('is-drive',fd.has(c));el.setAttribute('aria-checked',String(on));});
    chips.forEach(b=>{const c=b.getAttribute('data-county-chip');b.setAttribute('aria-pressed',String(st.all.has(c)));b.classList.toggle('is-drive',fd.has(c));});
    boxes.forEach(b=>{b.checked=p.drives.indexOf(b.getAttribute('data-drive'))>-1;});
    $('[data-lvl-num]',root).textContent=st.L.n;
    $('[data-lvl-k]',root).textContent=st.n?'Level '+st.L.n:'Your level';
    $('[data-lvl-name]',root).textContent=st.L.name;
    $('[data-lvl-pct]',root).textContent=st.pct;
    $('[data-lvl-count]',root).textContent=st.n+' of 26 counties driven';
    $('[data-lvl-fill]',root).style.width=(st.n/TOTAL*100).toFixed(2)+'%';
    $('[data-lvl-next]',root).textContent=nextLine(st);
    const wa=$('[data-share-wa]',root);if(wa)wa.href='https://wa.me/?text='+encodeURIComponent(shareText(st)+' '+url);
    root.classList.toggle('lvl-3',st.L.n===3);
  };
})();

/* ---------- places to eat filters ---------- */
$$('[data-eat]').forEach(sec=>{
  const items=$$('.eat-item',sec),btns=$$('.eat-filters .chip',sec);
  btns.forEach(b=>b.addEventListener('click',()=>{
    const f=b.getAttribute('data-f');btns.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    items.forEach(li=>{let on=true;if(f.indexOf('type:')===0)on=li.getAttribute('data-type')===f.slice(5);else if(f.indexOf('cuisine:')===0)on=li.getAttribute('data-cuisine').split('|').indexOf(f.slice(8))>-1;li.hidden=!on;});
  }));
});

/* ---------- home: drive-time map, filters, list ---------- */
function home(trips){
  const svg=$('#dial');if(!svg)return;
  const NS='http://www.w3.org/2000/svg',CX=260,CY=260,R=205,MAX=150,sc=m=>m/MAX*R;
  const el=(n,a,p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e;};
  el('line',{x1:CX,y1:CY-R-4,x2:CX,y2:CY+R+4,class:'d-axis'});el('line',{x1:CX-R-4,y1:CY,x2:CX+R+4,y2:CY,class:'d-axis'});
  const reach=el('circle',{cx:CX,cy:CY,r:sc(105),class:'d-reach'});
  [60,90,120,150].forEach(m=>{el('circle',{cx:CX,cy:CY,r:sc(m),class:'d-ring'+(m===150?' outer':'')});el('text',{x:CX+sc(m)-5,y:CY-6,'text-anchor':'end',class:'d-ringlab'}).textContent=fmtMins(m);});
  for(let i=0;i<16;i++){const a=i*22.5*RAD,r2=R+(i%4===0?9:5);el('line',{x1:CX+R*Math.sin(a),y1:CY-R*Math.cos(a),x2:CX+r2*Math.sin(a),y2:CY-r2*Math.cos(a),class:'d-tick'});}
  /** @type {[string,number,number][]} */([['N',0,-R-16],['S',0,R+27],['E',R+19,5],['W',-R-19,5]]).forEach(c=>{el('text',{x:CX+c[1],y:CY+c[2],'text-anchor':'middle',class:'d-compass'}).textContent=c[0];});
  el('text',{x:CX+162*Math.sin(112*RAD),y:CY-162*Math.cos(112*RAD),'text-anchor':'middle',class:'d-sea'}).textContent='Irish Sea';
  const LEFT={loughcrew:1,slievebloom:1,leinster:1,cashel:1,copper:1};
  trips.forEach(t=>{
    const r=sc(t.mins),a=t.b*RAD,x=CX+r*Math.sin(a),y=CY-r*Math.cos(a),left=!!LEFT[t.id];
    const g=el('a',{href:t.url,class:'d-trip','data-id':t.id});
    el('title',{},g).textContent=t.en+', '+fmtMins(t.mins)+' '+t.wind+' of Dublin';
    el('line',{x1:CX,y1:CY,x2:x,y2:y,class:'d-spoke'},g);el('circle',{cx:x,cy:y,r:7,class:'d-dot'},g);
    el('text',{x:x+(left?-12:12),y:y+5,'text-anchor':left?'end':'start',class:'d-lab'},g).textContent=t.en;
  });
  el('circle',{cx:CX,cy:CY,r:5.5,class:'d-home'});el('text',{x:CX+11,y:CY+19,class:'d-homelab'}).textContent='DUBLIN';

  let filt='all';
  const shown=t=>filt==='all'||t.tags.indexOf(filt)>-1;
  const input=$('#reach');
  function setReach(){
    const v=+input.value;reach.style.r=sc(v)+'px';$('#reach-out').textContent=fmtMins(v);
    let n=0,m=0;
    trips.forEach(t=>{const out=t.mins>v;if(shown(t)){m++;if(!out)n++;}$$('.row[data-id="'+t.id+'"],.d-trip[data-id="'+t.id+'"]').forEach(e=>e.classList.toggle('is-out',out));
      /* The muted style isn't announced, so say it in words for screen readers. */
      const row=$('.row[data-id="'+t.id+'"]');if(row){let sr=$('.row-out',row);if(!sr){sr=document.createElement('span');sr.className='sr row-out';row.appendChild(sr);}sr.textContent=out?' (further than '+fmtMins(v)+')':'';}});
    $('#reach-count').textContent=n+' of '+m+' drives each way';
  }
  input.addEventListener('input',setReach);setReach();

  const labels={all:'',coast:'coast',mountains:'mountain',heritage:'heritage'};
  function applyFilter(){
    $$('#filters .chip').forEach(b=>b.setAttribute('aria-pressed',String(b.getAttribute('data-f')===filt)));
    trips.forEach(t=>{const on=shown(t);
      const card=$('.card[data-id="'+t.id+'"]');if(card)card.hidden=!on;
      const row=$('.row[data-id="'+t.id+'"]');if(row)row.parentElement.hidden=!on;
      const dot=$('.d-trip[data-id="'+t.id+'"]');if(dot){dot.classList.toggle('is-hidden',!on);dot.setAttribute('tabindex',on?'0':'-1');}});
    const n=trips.filter(shown).length;
    $('#filter-note').textContent=filt==='all'?'':'Showing the '+n+' '+labels[filt]+' drives, here and on the map below.';
    setReach();
  }
  $$('#filters .chip').forEach(b=>b.addEventListener('click',()=>{
    const k=b.getAttribute('data-f');if(k===filt)return;const y=window.scrollY;
    const run=()=>{filt=k;applyFilter();try{window.scrollTo({top:y,behavior:'instant'});}catch(e){window.scrollTo(0,y);}};
    if(document.startViewTransition&&!RM.matches){try{document.startViewTransition(run);}catch(e){run();}}else run();
  }));

  const hot=(id,on)=>$$('.row[data-id="'+id+'"],.d-trip[data-id="'+id+'"]').forEach(e=>e.classList.toggle('is-hot',on));
  $$('.row,.d-trip').forEach(e=>{const id=e.getAttribute('data-id');
    ['mouseenter','focus'].forEach(ev=>e.addEventListener(ev,()=>hot(id,true)));
    ['mouseleave','blur'].forEach(ev=>e.addEventListener(ev,()=>hot(id,false)));});
}

/* ---------- trip planner chat ----------
   Answers from the site's own data in the browser. If an AI endpoint is configured, questions it
   can't answer are passed to it (see functions/api/chat.js). */
function planner(){
  const host=$('#planner');if(!host)return;
  const ROOT=host.getAttribute('data-root')||'/',IDX=host.getAttribute('data-index')||'',AI=host.getAttribute('data-ai')||'',PAGE_TRIP=host.getAttribute('data-trip')||'';
  const urlOf=s=>ROOT+s+'/'+IDX,img=id=>ROOT+'images/scenes/'+id+'-card-sm.webp',guide=a=>ROOT+'driving-guide/'+IDX+(a?'#'+a:''),mapUrl=ROOT+'how-much-of-ireland/'+IDX,hireUrl=ROOT+'car-hire-dublin/'+IDX,noCarUrl=ROOT+'day-trips-from-dublin-without-a-car/'+IDX;
  let D=null,loading=null;
  const load=()=>D?Promise.resolve(D):(loading||(loading=fetch(host.getAttribute('data-src')).then(r=>{if(!r.ok)throw new Error('load');return r.json();}).then(d=>(D=d)).catch(e=>{loading=null;throw e;})));
  host.innerHTML='<button type="button" class="pl-launch" aria-expanded="false" aria-controls="pl-panel">Plan a trip</button>'+
    '<section class="pl-panel" id="pl-panel" role="dialog" aria-modal="false" aria-labelledby="pl-title" hidden>'+
    '<header class="pl-head"><div><h2 class="pl-title" id="pl-title">Trip planner</h2><p class="pl-sub">Drives, places to eat and timing</p></div><button type="button" class="pl-close" aria-label="Close the trip planner"><span aria-hidden="true">×</span></button></header>'+
    '<div class="pl-log" role="log" aria-live="polite"></div>'+
    '<form class="pl-form" autocomplete="off"><label class="sr" for="pl-input">Ask the trip planner</label><input id="pl-input" type="text" maxlength="300" placeholder="Try: coast within 2 hours"><button type="submit">Send</button></form>'+
    (AI?'<p class="pl-note">Questions the planner can\'t answer itself are sent to an AI service. Please don\'t include personal details.</p>':'')+
    '</section>';
  const launch=$('.pl-launch',host),panel=$('.pl-panel',host),log=$('.pl-log',host),form=$('.pl-form',host),input=$('#pl-input',host);
  let started=false;const history=[];const ctx=newContext();

  /* On small screens the panel covers the whole page, so it behaves as a modal dialog: the rest of the
     page is made inert so Tab can't reach controls hidden behind it. On wider screens it floats beside
     the page and stays non-modal. Matches the 560px breakpoint in site.css. */
  const FULL=/** @type {MediaQueryList} */(window.matchMedia?window.matchMedia('(max-width: 560px)'):{matches:false});
  const setModal=on=>{
    const modal=on&&FULL.matches;panel.setAttribute('aria-modal',String(modal));
    $$('body > *').forEach(el=>{if(el!==host&&el.tagName!=='SCRIPT'){if(modal)el.setAttribute('inert','');else el.removeAttribute('inert');}});
  };
  if(FULL.addEventListener)FULL.addEventListener('change',()=>setModal(!panel.hidden));
  function open(){panel.hidden=false;launch.setAttribute('aria-expanded','true');host.classList.add('is-open');setModal(true);if(!started){started=true;load().then(greet).catch(greet);}setTimeout(()=>input.focus(),60);}
  function close(){panel.hidden=true;launch.setAttribute('aria-expanded','false');host.classList.remove('is-open');setModal(false);launch.focus();}
  launch.addEventListener('click',()=>{if(panel.hidden)open();else close();});
  $('.pl-close',host).addEventListener('click',close);
  panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  $$('[data-open-planner]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();open();}));
  form.addEventListener('submit',e=>{e.preventDefault();const v=input.value.trim();if(!v)return;input.value='';ask(v);});

  function add(cls,html){const m=document.createElement('div');m.className='pl-msg '+cls;m.innerHTML=html;log.appendChild(m);log.scrollTop=log.scrollHeight;return m;}
  function bot(text,extra){const m=add('pl-bot','<p>'+text+'</p>'+(extra||''));$$('.pl-chip',m).forEach(b=>b.addEventListener('click',()=>ask(b.getAttribute('data-q'))));const names=$$('.pl-card-n,.pl-eat-n',m).map(x=>x.textContent);history.push({role:'assistant',content:(m.querySelector('p').textContent+(names.length?' ('+names.join(', ')+')':'')).slice(0,600)});log.scrollTop=log.scrollHeight;}
  const chips=list=>'<div class="pl-chips">'+list.filter(Boolean).map(c=>'<button type="button" class="chip pl-chip" data-q="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div>';
  function ask(q){
    add('pl-user','<p>'+esc(q)+'</p>');history.push({role:'user',content:q});
    const typing=add('pl-bot pl-typing','<p><span></span><span></span><span></span></p>');
    load().then(()=>{setTimeout(()=>{typing.remove();try{respond(q);}catch(e){bot('Sorry, something went wrong there. Try one of these.',chips(START));}},RM.matches?0:280);})
      .catch(()=>{typing.remove();bot('I couldn\'t load the drive details just now. Check your connection and try again.');});
  }
  const card=t=>'<a class="pl-card" href="'+urlOf(t.slug)+'"><img src="'+img(t.id)+'" alt="" width="96" height="64" loading="lazy"><span><span class="pl-card-n">'+esc(t.en)+'</span><span class="pl-card-m">'+fmtMins(t.mins)+' '+t.wind+', about '+fmtMins(t.drive*60)+' at the wheel</span></span></a>';
  const eatRow=(r,t)=>'<div class="pl-eat"><span class="pl-eat-n">'+esc(r.name)+'</span><span class="pl-eat-m">'+(r.featured?'Featured · ':'')+esc(r.type)+' in '+esc(r.town)+(t?', on the '+esc(t.en)+' drive':'')+'</span><a href="'+esc(r.map)+'" target="_blank" rel="noopener">Map</a></div>';
  /* The answers come from src/shared/planner.mjs, which tests/planner-eval.test.mjs also runs. */
  const env={url:{guide:guide,map:mapUrl,hire:hireUrl,noCar:noCarUrl},stats:()=>statsOf(readP()),ai:!!AI};
  function show(r){
    if(r.kind==='ai'){ai();return;}
    bot(r.text,(r.cards||[]).map(card).join('')+(r.eats||[]).map(e=>eatRow(e.r,e.t)).join('')+(r.notes||[]).map(n=>'<p class="pl-more">'+n+'</p>').join('')+chips(r.chips));
  }
  function greet(){show(greeting(D,ctx,PAGE_TRIP));}
  function respond(q){show(reply(q,D,ctx,env));}
  function ai(){
    const typing=add('pl-bot pl-typing','<p><span></span><span></span><span></span></p>');
    fetch(AI,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:history.slice(-8)})})
      .then(r=>r.ok?r.json():Promise.reject(r.status)).then(d=>{
        typing.remove();const text=String(d.reply||'');const found=D.trips.filter(t=>text.indexOf(t.en)>-1).slice(0,3);
        if(found.length){ctx.trip=found[0];ctx.last=found;}
        bot(esc(text).replace(/\n{2,}/g,'</p><p>').replace(/\n/g,'<br>'),found.map(card).join('')+chips(found.length?['Where to eat on '+found[0].en,'Something similar']:START.slice(0,3)));
      }).catch(()=>{typing.remove();bot('I couldn\'t get an answer to that just now. Try one of these instead.',chips(START));});
  }
}

/* ---------- boot ---------- */
const dataEl=$('#trip-data');
let trips=null;
if(dataEl){try{trips=JSON.parse(dataEl.textContent);}catch(e){}}
if(trips)home(trips);
daylight(trips);
refreshLevels();
planner();
/* ---------- print route card ---------- */
$$('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));

/* ---------- newsletter preview ---------- */
$$('form[data-demo]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const m=f.parentNode.querySelector('.news-small');if(m)m.textContent='This is the preview: sign-ups go live once a newsletter provider is connected in site.config.mjs.';}));
})();
