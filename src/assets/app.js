/* Nine Roads Out: page behaviour. Everything here enhances pages that already work without JavaScript. */
(function(){
'use strict';
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.prototype.slice.call((r||document).querySelectorAll(s));
const RM=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const RAD=Math.PI/180;
const fmtMins=m=>{m=Math.round(m);if(m<60)return m+' min';const h=Math.floor(m/60),r=m%60;return r?h+' h '+String(r).padStart(2,'0'):h+' h';};
const escH=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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
function sunTimes(date,lat,lon){
  const JD=date.getTime()/864e5+2440587.5,n=Math.ceil(JD-2451545+0.0008),Js=n-lon/360,M=(357.5291+0.98560028*Js)%360;
  const C=1.9148*Math.sin(M*RAD)+0.02*Math.sin(2*M*RAD)+0.0003*Math.sin(3*M*RAD),L=(M+C+180+102.9372)%360;
  const Jt=2451545+Js+0.0053*Math.sin(M*RAD)-0.0069*Math.sin(2*L*RAD);
  const sd=Math.sin(L*RAD)*Math.sin(23.44*RAD),cd=Math.cos(Math.asin(sd));
  const cw=(Math.sin(-0.833*RAD)-Math.sin(lat*RAD)*sd)/(Math.cos(lat*RAD)*cd),w0=Math.acos(Math.max(-1,Math.min(1,cw)))/RAD;
  const toD=J=>new Date((J-2440587.5)*864e5);return{rise:toD(Jt-w0/360),set:toD(Jt+w0/360)};
}
const TF={hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Europe/Dublin'};
function daylight(trips){
  if(!$('#dl-rise'))return;
  try{
    const now=new Date(),s=sunTimes(now,53.3498,-6.2603);
    $('#dl-date').textContent=now.toLocaleDateString('en-IE',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/Dublin'});
    $('#dl-rise').textContent=s.rise.toLocaleTimeString('en-IE',TF);
    $('#dl-set').textContent=s.set.toLocaleTimeString('en-IE',TF);
    const dh=(s.set-s.rise)/36e5;$('#dl-len').textContent=fmtMins(dh*60)+' of daylight';
    if(trips){
      const miss=trips.filter(t=>t.drive+3>dh),fit=trips.length-miss.length;
      $('#dl-advice').textContent=miss.length===0
        ?'Enough light today for any of the nine, allowing about three hours for stops. Leave early for the long ones.'
        :'Enough light today for '+fit+' of the nine, allowing about three hours for stops. '+miss.map(t=>t.en).join(', ').replace(/, ([^,]*)$/,' and $1')+(miss.length>1?' need':' needs')+' a longer day or a night away.';
    }
  }catch(e){}
}

/* ---------- traveller levels: saved only in this browser ---------- */
const KEY='nro-progress-v1',TOTAL=26;
const LEVELS=[{n:0,name:'Not on the road yet',min:0},{n:1,name:'Day-tripper',min:1},{n:2,name:'Road-tripper',min:9},{n:3,name:'Grand tourer',min:18}];
function readP(){
  try{const v=JSON.parse(localStorage.getItem(KEY)||'null')||{};
    return{drives:Array.isArray(v.drives)?v.drives:[],manual:Array.isArray(v.manual)?v.manual:[],dc:v.dc&&typeof v.dc==='object'?v.dc:{}};
  }catch(e){return{drives:[],manual:[],dc:{}};}
}
function writeP(p){try{localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}refreshLevels();}
function fromDrives(p){const s=new Set();p.drives.forEach(id=>(p.dc[id]||[]).forEach(c=>s.add(c)));return s;}
function statsOf(p){
  const all=new Set(p.manual);fromDrives(p).forEach(c=>all.add(c));
  const n=all.size,pct=Math.round(n/TOTAL*100);let L=LEVELS[0];LEVELS.forEach(l=>{if(n>=l.min)L=l;});
  return{all:all,n:n,pct:pct,L:L,N:LEVELS.find(l=>l.min>n)||null};
}
const levelLine=st=>'Level '+st.L.n+' '+st.L.name.toLowerCase()+', with '+st.pct+'% of Ireland\'s counties';
function shareText(st){return st.n?'I\'m a Level '+st.L.n+' '+st.L.name.toLowerCase()+' on Nine Roads Out: I\'ve driven '+st.n+' of Ireland\'s 26 counties ('+st.pct+'%). How much of Ireland have you driven?':'How much of Ireland have you driven?';}
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
    if(msg&&on){msg.innerHTML='Counted. You\'re a '+escH(levelLine(st))+'. <a href="'+escH(($('.lvl-pill')||{}).getAttribute?$('.lvl-pill').getAttribute('href'):'#')+'">See your map</a>.';}
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
  paths.forEach(el=>{const c=el.getAttribute('data-county');
    el.addEventListener('click',()=>toggleCounty(c));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleCounty(c);}});});
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
    $('[data-lvl-next]',root).textContent=!st.n?'Tick off a drive or tap a county to start.':st.N?(st.N.min-st.n)+' more '+(st.N.min-st.n===1?'county':'counties')+' to Level '+st.N.n+', '+st.N.name.toLowerCase()+'.':'Top level. You\'ve driven most of Ireland.';
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
  [['N',0,-R-16],['S',0,R+27],['E',R+19,5],['W',-R-19,5]].forEach(c=>{el('text',{x:CX+c[1],y:CY+c[2],'text-anchor':'middle',class:'d-compass'}).textContent=c[0];});
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
    trips.forEach(t=>{const out=t.mins>v;if(shown(t)){m++;if(!out)n++;}$$('.row[data-id="'+t.id+'"],.d-trip[data-id="'+t.id+'"]').forEach(e=>e.classList.toggle('is-out',out));});
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
  let started=false;const history=[];const ctx={tags:[],max:null,trip:null,last:[],offset:0};
  const START=['The coast','Mountains','History and ruins','Under an hour','Lunch stops','Surprise me'];

  function open(){panel.hidden=false;launch.setAttribute('aria-expanded','true');host.classList.add('is-open');if(!started){started=true;load().then(greet).catch(greet);}setTimeout(()=>input.focus(),60);}
  function close(){panel.hidden=true;launch.setAttribute('aria-expanded','false');host.classList.remove('is-open');launch.focus();}
  launch.addEventListener('click',()=>{if(panel.hidden)open();else close();});
  $('.pl-close',host).addEventListener('click',close);
  panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  $$('[data-open-planner]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();open();}));
  form.addEventListener('submit',e=>{e.preventDefault();const v=input.value.trim();if(!v)return;input.value='';ask(v);});

  function add(cls,html){const m=document.createElement('div');m.className='pl-msg '+cls;m.innerHTML=html;log.appendChild(m);log.scrollTop=log.scrollHeight;return m;}
  function bot(text,extra){const m=add('pl-bot','<p>'+text+'</p>'+(extra||''));$$('.pl-chip',m).forEach(b=>b.addEventListener('click',()=>ask(b.getAttribute('data-q'))));const names=$$('.pl-card-n,.pl-eat-n',m).map(x=>x.textContent);history.push({role:'assistant',content:(m.querySelector('p').textContent+(names.length?' ('+names.join(', ')+')':'')).slice(0,600)});log.scrollTop=log.scrollHeight;}
  const chips=list=>'<div class="pl-chips">'+list.filter(Boolean).map(c=>'<button type="button" class="chip pl-chip" data-q="'+escH(c)+'">'+escH(c)+'</button>').join('')+'</div>';
  const link=(href,label)=>' <a href="'+escH(href)+'">'+escH(label)+'</a>';
  function ask(q){
    add('pl-user','<p>'+escH(q)+'</p>');history.push({role:'user',content:q});
    const typing=add('pl-bot pl-typing','<p><span></span><span></span><span></span></p>');
    load().then(()=>{setTimeout(()=>{typing.remove();try{respond(q);}catch(e){bot('Sorry, something went wrong there. Try one of these.',chips(START));}},RM.matches?0:280);})
      .catch(()=>{typing.remove();bot('I couldn\'t load the drive details just now. Check your connection and try again.');});
  }
  const byId=id=>D.trips.filter(t=>t.id===id)[0];
  const card=t=>'<a class="pl-card" href="'+urlOf(t.slug)+'"><img src="'+img(t.id)+'" alt="" width="96" height="64" loading="lazy"><span><span class="pl-card-n">'+escH(t.en)+'</span><span class="pl-card-m">'+fmtMins(t.mins)+' '+t.wind+', about '+fmtMins(t.drive*60)+' at the wheel</span></span></a>';
  const eatRow=(r,t)=>'<div class="pl-eat"><span class="pl-eat-n">'+escH(r.name)+'</span><span class="pl-eat-m">'+(r.featured?'Featured · ':'')+escH(r.type)+' in '+escH(r.town)+(t?', on the '+escH(t.en)+' drive':'')+'</span><a href="'+escH(r.map)+'" target="_blank" rel="noopener">Map</a></div>';
  const TAGNAME={coast:'the coast',mountains:'mountains',heritage:'history and ruins'};
  const TYPEPL={'Café':'cafés','Pub':'pubs','Restaurant':'restaurants','Fine dining':'fine dining'};

  function greet(){
    const t=PAGE_TRIP&&D?byId(PAGE_TRIP):null;
    if(t){ctx.trip=t;ctx.last=[t];bot('Planning the '+escH(t.en)+' drive? I can find places to eat on it, suggest something similar, or answer questions about timing and tolls.',chips(['Where to eat on this drive','Something similar','Something shorter','The coast']));}
    else bot('Where do you want to go? Pick a kind of day out, or tell me a place, how far you\'ll drive or what you\'d like to eat.',chips(START));
  }

  function parse(q){
    const T=' '+q.toLowerCase().replace(/[’‘]/g,"'")+' ';
    const it={tags:[],max:null,food:false,type:null,cuisine:null,diet:false,trip:null,surprise:false,greet:false,thanks:false,topic:null,level:false,longer:false,another:false,similar:false,shorter:false,clear:false,all:false};
    if(/\b(coast|coastal|sea|seaside|beach|beaches|cliffs?|ocean|coves?|harbour|lighthouse)\b/.test(T))it.tags.push('coast');
    if(/\b(mountains?|hills?|hike|hiking|pass|passes|views?|scenic|bog|lakes?|lough|wild|walks?|walking)\b/.test(T))it.tags.push('mountains');
    if(/\b(histor\w*|castles?|abbeys?|monaster\w*|ancient|tombs?|ruins?|heritage|cathedral|church|neolithic|celtic|medieval|monuments?)\b/.test(T))it.tags.push('heritage');
    let m;
    if((m=T.match(/(\d+)\s*(?:h|hr|hrs|hours?)\s*(\d{1,2})\b/)))it.max=parseInt(m[1],10)*60+parseInt(m[2],10);
    else if((m=T.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)\b/)))it.max=Math.round(parseFloat(m[1])*60);
    else if((m=T.match(/(\d+)\s*(?:m|mins?|minutes?)\b/)))it.max=parseInt(m[1],10);
    if(/hour and a half|one and a half hours?/.test(T))it.max=90;
    else if(it.max==null&&/\b(an|one) hour\b/.test(T))it.max=60;
    else if(it.max==null&&/\btwo hours\b/.test(T))it.max=120;
    if(it.max==null&&/\b(close|near|nearby|short|quick|not far|closest|nearest)\b/.test(T)&&!/\bnear [a-z]/.test(T.replace(/\bnear (me|dublin|the city)\b/,'')))it.max=60;
    it.longer=/\b(long|longer|far|further|farther|full day|weekend|furthest)\b/.test(T);
    it.food=/\b(eat|eating|food|lunch|dinner|breakfast|brunch|restaurants?|cafes?|cafés?|coffee|pubs?|pint|seafood|fish|oysters?|fine dining|fancy|hungry|bite|cuisines?|meal|cake)\b/.test(T);
    if(/\b(cafes?|cafés?|coffee|brunch|breakfast|cake|snack)\b/.test(T))it.type='Café';
    else if(/\b(pubs?|pint|gastro)\b/.test(T))it.type='Pub';
    else if(/\b(fine dining|fancy|special occasion|tasting|treat|romantic|anniversary|posh)\b/.test(T))it.type='Fine dining';
    else if(/\b(restaurants?|dinner)\b/.test(T))it.type='Restaurant';
    if(/\b(seafood|fish|oysters?|shellfish|mussels|crab)\b/.test(T))it.cuisine='Seafood';
    else if(/\bfrench\b/.test(T))it.cuisine='French';
    else if(/\bmediterranean\b/.test(T))it.cuisine='Mediterranean';
    else if(/\beuropean\b/.test(T))it.cuisine='European';
    it.diet=/\b(vegan|vegetarian|veggie|gluten|coeliac|celiac|halal|kosher|allerg\w*|dairy)\b/.test(T);
    it.surprise=/\b(surprise|random|you choose|you pick|dunno|don't know|no idea|whatever|another surprise)\b/.test(T);
    it.greet=/^\s*(hi|hello|hey|hiya|howya|good (morning|afternoon|evening))\b/.test(T);
    it.thanks=/\b(thanks|thank you|cheers)\b/.test(T);
    if(/\b(toll|tolls|m50|eflow)\b/.test(T))it.topic='tolls';
    else if(/\b(speed|limits?|km\/h)\b/.test(T))it.topic='speed';
    else if(/\b(sunset|sunrise|daylight|dark|light)\b/.test(T))it.topic='daylight';
    else if(/\b(weather|rain|fog|snow|forecast)\b/.test(T))it.topic='weather';
    else if(/\broad signs?\b|\bsigns?\b/.test(T)&&!it.food)it.topic='signs';
    else if(/\b(no car|without a car|don't have a car|dont have a car|tours?|guided|public transport|bus|by bus|buses|train|trains)\b/.test(T))it.topic='nocar';
    else if(/\b(car hire|hire a car|hiring a car|rent a car|renting|rental|hire car|insurance|excess|automatic)\b/.test(T))it.topic='car';
    it.level=/\b(level|levels|how much of ireland|counties|my map|badge|traveller)\b/.test(T);
    it.another=/\b(another|other|different|something else|next)\b/.test(T);
    it.similar=/\b(similar|like this|like that)\b/.test(T);
    it.shorter=/\b(shorter|closer|nearer)\b/.test(T);
    it.clear=/\b(clear|reset|start again|start over)\b/.test(T);
    it.all=/\b(all nine|all of them|show all|every drive|all drives|list)\b/.test(T);
    let best=null,score=0;
    const hit=w=>new RegExp('(^|[^a-z\u00e0-\u00fa])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z\u00e0-\u00fa]|$)').test(T);
    D.trips.forEach(t=>{let s=0;[t.en.toLowerCase()].concat(t.words,t.stops.map(x=>x.toLowerCase())).forEach(w=>{if(w&&w.length>2&&hit(w))s+=w.length;});if(s>score){score=s;best=t;}});
    if(/\b(this drive|this one|these|that one|on it)\b/.test(T)&&!best)best=ctx.trip;
    it.trip=best;
    // "anything" on its own means "you pick"; "anything near Kells" or "anything coastal" doesn't.
    if(!it.surprise&&/\banything\b/.test(T)&&!it.trip&&!it.tags.length&&!it.food&&it.max==null&&!it.topic)it.surprise=true;
    it.any=!!(it.tags.length||it.max!=null||it.food||it.trip||it.surprise||it.topic||it.level||it.diet||it.another||it.similar||it.shorter||it.clear||it.all||it.longer);
    return it;
  }

  function respond(q){
    const it=parse(q);
    if(it.greet&&!it.any){bot('Hello! Where do you want to go? Pick a kind of day out, or tell me a place, how far you\'ll drive or what you\'d like to eat.',chips(START));return;}
    if(it.thanks&&!it.any){bot('You\'re welcome. Enjoy the drive, and check opening times before you set off.',chips(['Another drive','Lunch stops']));return;}
    if(it.topic){topic(it.topic);return;}
    if(it.level&&!it.trip&&!it.food){level();return;}
    if(it.clear){ctx.tags=[];ctx.max=null;ctx.trip=null;ctx.last=[];bot('Cleared. Where do you want to go?',chips(START));return;}
    if(it.food||it.diet){food(it);return;}
    if(it.similar&&ctx.trip){const base=ctx.trip;const list=D.trips.filter(t=>t.id!==base.id&&t.tags.some(g=>base.tags.indexOf(g)>-1)).sort((a,b)=>Math.abs(a.mins-base.mins)-Math.abs(b.mins-base.mins));
      if(list.length){ctx.last=list;ctx.trip=list[0];bot('If you like '+escH(base.en)+', try these. They share its '+base.tags.map(g=>TAGNAME[g]).join(' and ')+'.',list.slice(0,3).map(card).join('')+chips(['Where to eat on '+list[0].en,'Something shorter','Show all nine']));return;}}
    if(it.shorter&&ctx.trip&&!it.tags.length&&it.max==null){const base=ctx.trip;const list=D.trips.filter(t=>t.mins<base.mins).sort((a,b)=>b.mins-a.mins);
      if(!list.length){bot(escH(base.en)+' is already one of the closest drives, at '+fmtMins(base.mins)+' from Dublin.',chips(['Something similar','Where to eat on this drive']));return;}
      ctx.last=list;ctx.trip=list[0];bot('Closer to Dublin than '+escH(base.en)+':',list.slice(0,3).map(card).join('')+chips(['Where to eat on '+list[0].en,'Something similar']));return;}
    if(it.trip&&it.max==null&&!it.surprise&&!it.another&&!it.all){one(it.trip);return;}
    if(it.another&&!it.tags.length&&it.max==null&&ctx.last.length>1){ctx.offset=(ctx.offset+3)%ctx.last.length;const list=ctx.last.slice(ctx.offset,ctx.offset+3);bot('Here are some more:',list.map(card).join('')+chips(refine()));return;}
    if(it.tags.length||it.max!=null||it.surprise||it.longer||it.all||it.another){drives(it);return;}
    fallback();
  }

  function describe(){const p=[];if(ctx.tags.length)p.push(ctx.tags.map(g=>TAGNAME[g]).join(' or '));if(ctx.max!=null)p.push('within '+fmtMins(ctx.max)+' of Dublin');return p.length?p.join(', '):'';}
  function refine(){return['Where to eat on these',ctx.max==null||ctx.max>90?'Under 1 h 30':'Under 2 h 15',ctx.tags.indexOf('coast')>-1?'Mountains':'The coast','Clear filters'];}
  function drives(it){
    if(it.all){ctx.tags=[];ctx.max=null;}
    if(it.tags.length)ctx.tags=it.tags;
    if(it.max!=null)ctx.max=it.max;
    let list=D.trips.slice();
    if(it.surprise){const t=list[Math.floor(Math.random()*list.length)];ctx.last=[t];ctx.trip=t;bot('How about this one: <strong>'+escH(t.en)+'</strong>. '+escH(t.blurb||t.desc),card(t)+chips(['Where to eat on this drive','Another surprise','Something similar']));return;}
    if(ctx.tags.length)list=list.filter(t=>ctx.tags.some(g=>t.tags.indexOf(g)>-1));
    if(ctx.max!=null)list=list.filter(t=>t.mins<=ctx.max+5);
    list.sort((a,b)=>it.longer?b.mins-a.mins:a.mins-b.mins);
    if(!list.length){const d=describe();ctx.max=null;bot('None of the nine drives match '+escH(d||'that')+'. The closest start about 50 minutes from the city.',chips(['Under an hour','The coast','Mountains','Show all nine']));return;}
    ctx.last=list;ctx.offset=0;ctx.trip=list[0];
    const d=describe();
    const lead=it.all||!d?'All nine drives, '+(it.longer?'longest first':'closest first')+'.':(list.length===1?'One drive fits '+escH(d)+'.':list.length+' drives fit '+escH(d)+(list.length>3?'. Here are the '+(it.longer?'longest':'closest')+' three.':'.'));
    bot(lead,(it.all?list:list.slice(0,3)).map(card).join('')+chips(list.length>3&&!it.all?['Another drive'].concat(refine()):refine()));
  }
  function one(t){
    ctx.trip=t;ctx.last=[t];const n=(D.eat[t.id]||[]).length;
    bot('<strong>'+escH(t.en)+'</strong>. '+escH(t.blurb||t.desc)+' Best time: '+escH(t.best.charAt(0).toLowerCase()+t.best.slice(1))+'.',card(t)+chips([n?'Where to eat on this drive':null,'Something similar','Something shorter']));
  }
  function food(it){
    const trips=it.trip?[it.trip]:ctx.trip?[ctx.trip]:null;
    let pre='';
    if(it.diet)pre='The listings here don\'t include dietary details I can check, but most Irish cafés and restaurants can cater for vegetarian, vegan and coeliac diets if you ask ahead. Ring before you go to be sure. ';
    let rows=[];(trips||D.trips).forEach(t=>(D.eat[t.id]||[]).forEach(r=>rows.push([r,t])));
    if(it.type)rows=rows.filter(x=>x[0].type===it.type);
    if(it.cuisine)rows=rows.filter(x=>x[0].cuisine.indexOf(it.cuisine)>-1);
    const where=trips?'on the '+escH(trips[0].en)+' drive':'across the nine drives';
    const what=(it.cuisine?it.cuisine.toLowerCase()+' ':'')+(it.type?TYPEPL[it.type]:'places to eat');
    if(!rows.length){
      const avail=trips?[...new Set((D.eat[trips[0].id]||[]).map(r=>r.type))]:[];
      bot(pre+'I don\'t have any '+escH(what)+' listed '+where+'.',chips(avail.length?avail.map(ty=>TYPEPL[ty].charAt(0).toUpperCase()+TYPEPL[ty].slice(1)+' on this drive'):['Seafood','Cafés','Fine dining']));return;
    }
    if(it.trip)ctx.trip=it.trip;
    const more=trips?['Cafés','Pubs','Restaurants','Fine dining'].filter(l=>(D.eat[trips[0].id]||[]).some(r=>TYPEPL[r.type]===l.toLowerCase())&&(!it.type||TYPEPL[it.type]!==l.toLowerCase())).map(l=>l+' on this drive'):D.trips.slice(0,3).map(t=>'Lunch near '+t.en);
    bot(pre+escH(what.charAt(0).toUpperCase()+what.slice(1))+' '+where+':',rows.slice(0,6).map(x=>eatRow(x[0],trips?null:x[1])).join('')+(rows.length>6?'<p class="pl-more">And '+(rows.length-6)+' more. Tell me which drive to narrow it down.</p>':'')+'<p class="pl-more">Opening hours change, so check before you go.</p>'+chips(more));
  }
  function topic(k){
    if(k==='tolls')bot('The M50 toll around Dublin is barrier-free: pay online at eflow.ie by 8pm the next day. The M1, M3 and M7/M8 have toll plazas you pay as you pass.'+link(guide('tolls'),'More on tolls'),chips(['Speed limits','Under an hour']));
    else if(k==='speed')bot('Default limits are 120 km/h on motorways, 100 on national roads, 80 on regional roads, 60 on rural local roads and 50 in towns. The posted sign always wins.'+link(guide('speed'),'Speed limits in full'),chips(['Tolls','Daylight today']));
    else if(k==='daylight'){const s=sunTimes(new Date(),53.3498,-6.2603),dh=(s.set-s.rise)/36e5,ok=D.trips.filter(t=>t.drive+3<=dh);
      bot('Today in Dublin the sun rises at '+s.rise.toLocaleTimeString('en-IE',TF)+' and sets at '+s.set.toLocaleTimeString('en-IE',TF)+', which is '+fmtMins(dh*60)+' of daylight. That\'s enough for '+(ok.length===D.trips.length?'any of the nine drives':ok.length+' of the nine drives')+', allowing about three hours for stops.'+link(guide('daylight'),'Daylight by month'),chips(['Under an hour','Surprise me']));}
    else if(k==='weather')bot('On the mountain and coast drives, the weather is the view: in fog you see nothing at all. Check Met Éireann the night before and keep a closer drive in reserve. Some mountain roads aren\'t gritted in ice or snow.'+link(guide('weather'),'Weather tips'),chips(['History and ruins','Under an hour']));
    else if(k==='signs')bot('Blue signs mean motorways, green mean national roads, white mean regional roads and brown point to attractions. Place names show Irish in italics above English in capitals.'+link(guide('signs'),'Reading Irish road signs'),chips(['Speed limits','Tolls']));
    else if(k==='nocar')bot('Glendalough and the Boyne Valley work well without a car: there\'s a daily bus to Glendalough, and guided tours from Dublin go to Newgrange. You can reach Carlingford, Tramore and Cashel by public transport too, but most of the other drives need a car.'+link(noCarUrl,'Which drives work without a car'),chips(['Glendalough','Boyne Valley','Hiring a car']));
    else bot('Most of these drives need a car. Book early for summer weekends, especially if you need an automatic, check the insurance excess before you sign, and ask who pays the M50 toll.'+link(hireUrl,'Hiring a car in Dublin: what to know'),chips(['Under an hour','No car? Tours and buses']));
  }
  function level(){
    const st=statsOf(readP());
    bot(st.n?'You\'re a '+escH(levelLine(st))+'.'+(st.N?' '+(st.N.min-st.n)+' more counties to Level '+st.N.n+'.':'')+link(mapUrl,'Open your map'):'You haven\'t marked any counties yet. Tick off drives and counties on your map to find your traveller level.'+link(mapUrl,'Open your map'),chips(['Surprise me','The coast']));
  }
  function fallback(){
    if(AI){ai();return;}
    bot('I can help you pick a drive, find somewhere to eat and plan timing. Try one of these, or ask something like "coast within 2 hours" or "lunch near Glendalough".',chips(START));
  }
  function ai(){
    const typing=add('pl-bot pl-typing','<p><span></span><span></span><span></span></p>');
    fetch(AI,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:history.slice(-8)})})
      .then(r=>r.ok?r.json():Promise.reject(r.status)).then(d=>{
        typing.remove();const text=String(d.reply||'');const found=D.trips.filter(t=>text.indexOf(t.en)>-1).slice(0,3);
        if(found.length){ctx.trip=found[0];ctx.last=found;}
        bot(escH(text).replace(/\n{2,}/g,'</p><p>').replace(/\n/g,'<br>'),found.map(card).join('')+chips(found.length?['Where to eat on '+found[0].en,'Something similar']:START.slice(0,3)));
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
