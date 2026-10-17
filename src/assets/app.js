/* Nine Roads Out: page behaviour. Everything here enhances pages that already work without JavaScript. */
(function(){
'use strict';
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.prototype.slice.call((r||document).querySelectorAll(s));
const RM=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const RAD=Math.PI/180;
const fmtMins=m=>{m=Math.round(m);if(m<60)return m+' min';const h=Math.floor(m/60),r=m%60;return r?h+' h '+String(r).padStart(2,'0'):h+' h';};

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
function daylight(trips){
  if(!$('#dl-rise'))return;
  try{
    const now=new Date(),s=sunTimes(now,53.3498,-6.2603),tf={hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Europe/Dublin'};
    $('#dl-date').textContent=now.toLocaleDateString('en-IE',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/Dublin'});
    $('#dl-rise').textContent=s.rise.toLocaleTimeString('en-IE',tf);
    $('#dl-set').textContent=s.set.toLocaleTimeString('en-IE',tf);
    const dh=(s.set-s.rise)/36e5;$('#dl-len').textContent=fmtMins(dh*60)+' of daylight';
    if(trips){
      const miss=trips.filter(t=>t.drive+3>dh),fit=trips.length-miss.length;
      $('#dl-advice').textContent=miss.length===0
        ?'Enough light today for any of the nine, allowing about three hours for stops. Leave early for the long ones.'
        :'Enough light today for '+fit+' of the nine, allowing about three hours for stops. '+miss.map(t=>t.en).join(', ').replace(/, ([^,]*)$/,' and $1')+(miss.length>1?' need':' needs')+' a longer day or a night away.';
    }
  }catch(e){}
}

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

const dataEl=$('#trip-data');
let trips=null;
if(dataEl){try{trips=JSON.parse(dataEl.textContent);}catch(e){}}
if(trips)home(trips);
daylight(trips);
})();
