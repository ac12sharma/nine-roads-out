/* Nine Roads Out: illustrated scenes, painted on canvas. Still frames of these are pre-rendered to /images/scenes/. */
(function(){
'use strict';
/* ================= painting kit ================= */
const TAU=Math.PI*2;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function noise1(seed){const r=mulberry32(seed),N=512,v=new Float32Array(N);for(let i=0;i<N;i++)v[i]=r();return x=>{const xi=Math.floor(x),f=x-xi,a=v[((xi%N)+N)%N],b=v[(((xi+1)%N)+N)%N],k=(1-Math.cos(f*Math.PI))/2;return a+(b-a)*k;};}
function fbm(nz,x,oct,rough){let s=0,a=1,f=1,tot=0;for(let i=0;i<oct;i++){s+=a*nz(x*f+i*31.7);tot+=a;a*=rough;f*=2.03;}return s/tot;}
function rgba(hex,a){const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}
function vgrad(ctx,y0,y1,stops){const g=ctx.createLinearGradient(0,y0,0,y1);stops.forEach(s=>g.addColorStop(s[0],s[1]));return g;}
function hgrad(ctx,x0,x1,stops){const g=ctx.createLinearGradient(x0,0,x1,0);stops.forEach(s=>g.addColorStop(s[0],s[1]));return g;}
function paintSky(ctx,w,h,stops){ctx.fillStyle=vgrad(ctx,0,h,stops);ctx.fillRect(0,0,w,h);}
function glow(ctx,x,y,r,col,a){if(r<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(col,a));g.addColorStop(1,rgba(col,0));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function disc(ctx,x,y,r,col){ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,TAU);ctx.fillStyle=col;ctx.fill();}
function poly(ctx,pts,col){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();if(col){ctx.fillStyle=col;ctx.fill();}}
function unitOf(w,h){return Math.min(h,w/1.6);}
function ridge(ctx,w,h,o){
  const nz=noise1(o.seed);
  const f=u=>{let n=fbm(nz,u*o.freq+(o.off||0),o.oct||4,o.rough||.5);if(o.ridged)n=1-Math.abs(2*n-1);let y=o.base-(n-.5)*2*o.amp;if(o.bumps)for(const b of o.bumps)y-=b[2]*Math.exp(-Math.pow((u-b[0])/b[1],2));if(o.tilt)y+=o.tilt*(u-.5);return y*h;};
  const step=Math.max(1,w/480);
  ctx.beginPath();ctx.moveTo(-2,h+2);
  for(let x=-2;x<=w+step;x+=step)ctx.lineTo(x,f(x/w));
  ctx.lineTo(w+2,h+2);ctx.closePath();ctx.fillStyle=o.color;ctx.fill();
  if(o.rim){ctx.beginPath();let first=true;for(let x=-2;x<=w+step;x+=step){const y=f(x/w);if(first){ctx.moveTo(x,y);first=false;}else ctx.lineTo(x,y);}ctx.strokeStyle=o.rim;ctx.lineWidth=o.rimW||1.5;ctx.stroke();}
  return f;
}
const mistCache={};
function mistSprite(col){if(mistCache[col])return mistCache[col];const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.setTransform(1,0,0,.25,0,0);const g=x.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,rgba(col,1));g.addColorStop(.55,rgba(col,.45));g.addColorStop(1,rgba(col,0));x.fillStyle=g;x.fillRect(0,0,256,256);return(mistCache[col]=c);}
function mist(ctx,x,y,w,h,col,a){ctx.save();ctx.globalAlpha=a;ctx.drawImage(mistSprite(col),x-w/2,y-h/2,w,h);ctx.restore();}
function mistBand(ctx,w,h,t,o){const sp=mistSprite(o.col),n=o.n||4,bw=w*o.wf,span=w+bw;ctx.save();ctx.globalAlpha=o.a;for(let i=0;i<n;i++){let x=((i/n)*span+t*o.speed*w*.01)%span-bw/2;const y=o.y*h+Math.sin(t*.25+i*1.7)*h*.006;ctx.drawImage(sp,x-bw/2,y-o.hf*h/2,bw,o.hf*h);}ctx.restore();}
function starField(w,h,n,seed,maxY){const r=mulberry32(seed),a=[];for(let i=0;i<n;i++)a.push([r()*w,Math.pow(r(),1.5)*maxY*h,r()*1.1+.35,r()]);return a;}
function drawStars(ctx,stars,alpha){ctx.save();ctx.fillStyle='#FFFFFF';stars.forEach(s=>{ctx.globalAlpha=(.3+.7*s[3])*alpha;ctx.beginPath();ctx.arc(s[0],s[1],s[2],0,TAU);ctx.fill();});ctx.restore();}
let GR=null;
function grainCanvas(){if(!GR){GR=document.createElement('canvas');GR.width=GR.height=128;const g=GR.getContext('2d'),d=g.createImageData(128,128),r=mulberry32(99);for(let i=0;i<d.data.length;i+=4){const v=r()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}g.putImageData(d,0,0);}return GR;}
function vignette(ctx,w,h,a){const g=ctx.createRadialGradient(w/2,h*.55,Math.min(w,h)*.3,w/2,h*.55,Math.max(w,h)*.78);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(12,8,22,'+a+')');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
function reflect(ctx,src,w,h,y0,a){const tmp=document.createElement('canvas');tmp.width=src.width;tmp.height=src.height;tmp.getContext('2d').drawImage(src,0,0);ctx.save();ctx.beginPath();ctx.rect(0,y0,w,h-y0);ctx.clip();ctx.globalAlpha=a;ctx.translate(0,2*y0);ctx.scale(1,-1);ctx.drawImage(tmp,0,0,w,h);ctx.restore();}
function ripples(ctx,w,y0,y1,seed,col,a,n){const r=mulberry32(seed);ctx.save();ctx.strokeStyle=col;for(let i=0;i<n;i++){const y=y0+(y1-y0)*Math.pow(r(),1.4),d=(y-y0)/Math.max(1,(y1-y0)),len=(8+r()*36)*(.5+d*1.6),x=r()*w;ctx.globalAlpha=a*(.5+r()*.5);ctx.lineWidth=.6+d*1.1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+len,y);ctx.stroke();}ctx.restore();}
function speckle(ctx,x0,x1,y0,y1,n,seed,col,rmin,rmax){const r=mulberry32(seed);ctx.fillStyle=col;for(let i=0;i<n;i++){ctx.beginPath();ctx.arc(x0+r()*(x1-x0),y0+r()*(y1-y0),rmin+r()*(rmax-rmin),0,TAU);ctx.fill();}}
function fields(ctx,x0,x1,y0,y1,seed,pal,hedge){
  const r=mulberry32(seed);let y=y0,rh=(y1-y0)*.045;ctx.save();ctx.beginPath();ctx.rect(x0,y0,x1-x0,y1-y0);ctx.clip();
  while(y<y1){const d=(y-y0)/(y1-y0),sk=(r()-.5)*rh*1.6;let x=x0-r()*60;
    while(x<x1){const fw=(x1-x0)*(.035+r()*.07)*(1+d*2);ctx.fillStyle=pal[(r()*pal.length)|0];
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+fw,y);ctx.lineTo(x+fw+sk,y+rh+.6);ctx.lineTo(x+sk,y+rh+.6);ctx.closePath();ctx.fill();
      ctx.strokeStyle=hedge;ctx.lineWidth=.6+d*1.3;ctx.beginPath();ctx.moveTo(x+fw,y);ctx.lineTo(x+fw+sk,y+rh);ctx.stroke();
      if(r()<.3)disc(ctx,x+fw+sk*.5,y+rh*.4,1+d*2.6,hedge);
      x+=fw;}
    ctx.fillStyle=hedge;ctx.fillRect(x0,y+rh-.4,x1-x0,.6+d*1.3);y+=rh;rh*=1.28;}
  ctx.restore();
}

/* ---------- landmarks ---------- */
function roundTower(ctx,x,base,H,stone,shade,cap){
  const bw=H*.15,tw=H*.12,capH=H*.15,top=base-H+capH;
  poly(ctx,[[x-bw/2,base],[x-tw/2,top],[x+tw/2,top],[x+bw/2,base]],stone);
  poly(ctx,[[x+bw*.12,base],[x+tw*.12,top],[x+tw/2,top],[x+bw/2,base]],shade);
  ctx.save();ctx.strokeStyle='rgba(0,0,0,.07)';ctx.lineWidth=1;for(let i=1;i<16;i++){const k=i/16,y=base-(base-top)*k,hw=(bw+(tw-bw)*k)/2;ctx.beginPath();ctx.moveTo(x-hw,y);ctx.lineTo(x+hw,y);ctx.stroke();}ctx.restore();
  poly(ctx,[[x-tw/2-H*.006,top],[x,base-H],[x+tw/2+H*.006,top]],cap);
  ctx.fillStyle=cap;
  ctx.fillRect(x-tw*.3,top+H*.03,tw*.15,H*.045);ctx.fillRect(x+tw*.1,top+H*.03,tw*.15,H*.045);
  const dy=base-H*.25;ctx.beginPath();ctx.moveTo(x-bw*.1,dy);ctx.lineTo(x-bw*.1,dy-H*.05);ctx.arc(x,dy-H*.05,bw*.1,Math.PI,0);ctx.lineTo(x+bw*.1,dy);ctx.closePath();ctx.fill();
  ctx.fillRect(x-tw*.05,base-H*.52,tw*.1,H*.03);
}
function kevinsKitchen(ctx,x,base,U){
  const w=U*.21,wh=U*.075,rh=U*.1,g=x+w*.28;
  poly(ctx,[[x-w/2,base],[x-w/2,base-wh],[g,base-wh],[g,base]],'#CBC1AC');
  poly(ctx,[[g,base],[g,base-wh],[g+w*.11,base-wh-rh],[x+w/2,base-wh],[x+w/2,base]],'#A59B87');
  poly(ctx,[[x-w/2-U*.004,base-wh],[g,base-wh],[g+w*.11,base-wh-rh],[x-w/2+w*.11,base-wh-rh]],'#58564F');
  const bx=x-w*.36,bb=base-wh-rh*.95,bh=U*.07,bw=U*.03;
  poly(ctx,[[bx-bw/2,bb+2],[bx-bw*.42,bb-bh*.7],[bx+bw*.42,bb-bh*.7],[bx+bw/2,bb+2]],'#CBC1AC');
  poly(ctx,[[bx-bw*.46,bb-bh*.7],[bx,bb-bh],[bx+bw*.46,bb-bh*.7]],'#58564F');
  ctx.fillStyle='#3A3833';ctx.fillRect(x-w*.12,base-wh*.72,w*.1,wh*.72);ctx.fillRect(x+w*.12,base-wh*.7,w*.05,wh*.22);
}
function highCross(ctx,x,base,H,col){ctx.fillStyle=col;const sw=H*.14;ctx.fillRect(x-sw*1.3,base-H*.12,sw*2.6,H*.12);ctx.fillRect(x-sw/2,base-H*.95,sw,H*.85);ctx.fillRect(x-H*.28,base-H*.76,H*.56,sw);ctx.beginPath();ctx.arc(x,base-H*.7,H*.17,0,TAU);ctx.lineWidth=H*.05;ctx.strokeStyle=col;ctx.stroke();}
function newgrange(ctx,cx,base,W,H){
  ctx.beginPath();ctx.ellipse(cx,base,W/2,H,0,Math.PI,TAU);ctx.closePath();ctx.fillStyle=vgrad(ctx,base-H,base,[[0,'#6E7A58'],[1,'#3E4939']]);ctx.fill();
  ctx.beginPath();ctx.ellipse(cx,base,W/2,H,0,Math.PI*1.03,Math.PI*1.48);ctx.strokeStyle='rgba(255,210,150,.75)';ctx.lineWidth=Math.max(1.5,H*.03);ctx.stroke();
  const n=64,tops=[];for(let i=0;i<=n;i++){const u=-.84+1.68*i/n;tops.push([cx+u*W/2,base-H*.4*Math.pow(1-u*u,.35)]);}
  ctx.beginPath();ctx.moveTo(cx-.84*W/2,base);tops.forEach(p=>ctx.lineTo(p[0],p[1]));ctx.lineTo(cx+.84*W/2,base);ctx.closePath();
  ctx.fillStyle=vgrad(ctx,base-H*.4,base,[[0,'#F6EADB'],[1,'#D6C9BB']]);ctx.fill();
  const r=mulberry32(77);ctx.fillStyle='rgba(78,76,82,.5)';
  for(let i=0;i<300;i++){const u=-.82+1.64*r(),ty=base-H*.4*Math.pow(1-u*u,.35),y=ty+(base-ty)*r();ctx.beginPath();ctx.arc(cx+u*W/2,y,H*(.008+r()*.01),0,TAU);ctx.fill();}
  const ex=cx+W*.05,ew=H*.09,eh=H*.2;
  ctx.fillStyle='#1B1A1F';ctx.fillRect(ex-ew*.6,base-eh-H*.085,ew*1.2,H*.035);ctx.fillRect(ex-ew/2,base-eh,ew,eh);
  glow(ctx,ex,base-eh*.5,H*.3,'#FFC97A',.45);
  ctx.beginPath();ctx.ellipse(ex,base-H*.02,ew*1.7,H*.055,0,0,TAU);ctx.fillStyle='#918A7F';ctx.fill();
  ctx.fillStyle='#57524C';for(let i=0;i<26;i++){const u=-.97+1.94*i/25;ctx.beginPath();ctx.ellipse(cx+u*W/2,base,W*.022,H*.035,0,Math.PI,TAU);ctx.fill();}
  return[ex,base-eh*.5];
}
function castleRuin(ctx,x,base,U,col,win){
  const P=[[-.13,0],[-.13,-.075],[-.115,-.075],[-.115,-.087],[-.1,-.087],[-.1,-.07],[-.06,-.07],[-.06,-.115],[-.047,-.115],[-.047,-.104],[-.032,-.104],[-.032,-.12],[-.012,-.12],[-.012,-.09],[.03,-.09],[.03,-.1],[.045,-.1],[.045,-.085],[.08,-.085],[.08,-.06],[.11,-.06],[.12,0]];
  poly(ctx,P.map(p=>[x+p[0]*U,base+p[1]*U]),col);
  ctx.fillStyle=win;[[-.05,-.085,.02],[-.02,-.1,.018],[.0,-.07,.016],[.055,-.065,.016],[-.095,-.055,.014]].forEach(q=>ctx.fillRect(x+q[0]*U,base+q[1]*U,U*.006,U*q[2]));
}
function house(ctx,x,base,w,hh,wall,roof){poly(ctx,[[x,base],[x,base-hh],[x+w,base-hh],[x+w,base]],wall);poly(ctx,[[x-w*.05,base-hh],[x+w*.5,base-hh-hh*.6],[x+w*1.05,base-hh]],roof);}
function boat(ctx,x,y,s){poly(ctx,[[x-s/2,y],[x+s/2,y],[x+s*.38,y+s*.17],[x-s*.38,y+s*.17]],'#2C3440');ctx.fillStyle='#2C3440';ctx.fillRect(x-s*.02,y-s*.9,s*.04,s*.9);poly(ctx,[[x+s*.04,y-s*.86],[x+s*.04,y-s*.08],[x+s*.38,y-s*.08]],'#F1E6D4');poly(ctx,[[x-s*.04,y-s*.7],[x-s*.04,y-s*.08],[x-s*.26,y-s*.08]],'#E2D4C2');}
function cairn(ctx,x,base,W,H,seed,lit){
  ctx.save();ctx.beginPath();ctx.ellipse(x,base,W/2,H,0,Math.PI,TAU);ctx.closePath();ctx.fillStyle='#6E6A62';ctx.fill();ctx.clip();
  const r=mulberry32(seed);const n=Math.round(W*1.8);for(let i=0;i<n;i++){const sx=x-W/2+r()*W,sy=base-r()*H;ctx.beginPath();ctx.ellipse(sx,sy,W*(.01+r()*.014),H*(.03+r()*.04),0,0,TAU);ctx.fillStyle=r()<.5?'#89847B':'#55524C';ctx.fill();}
  ctx.fillStyle=hgrad(ctx,x-W/2,x+W/2,[[0,'rgba(20,20,40,.4)'],[1,lit?'rgba(255,196,130,.32)':'rgba(255,196,130,.12)']]);ctx.fillRect(x-W/2,base-H,W,H);
  ctx.restore();
  ctx.fillStyle='#8C867B';for(let i=0;i<15;i++){const u=-.96+1.92*i/14;ctx.beginPath();ctx.ellipse(x+u*W/2,base,W*.03,H*.13,0,Math.PI,TAU);ctx.fill();}
}
function sheep(ctx,x,y,s){ctx.fillStyle='#EAE3D6';ctx.beginPath();ctx.ellipse(x,y,s,s*.6,0,0,TAU);ctx.fill();ctx.fillStyle='#262626';ctx.beginPath();ctx.ellipse(x+s*.95,y-s*.12,s*.3,s*.24,0,0,TAU);ctx.fill();ctx.fillRect(x-s*.5,y+s*.4,s*.14,s*.45);ctx.fillRect(x+s*.38,y+s*.4,s*.14,s*.45);}
function conifer(ctx,x,base,H,col){poly(ctx,[[x,base-H],[x+H*.2,base-H*.55],[x+H*.12,base-H*.55],[x+H*.27,base-H*.18],[x+H*.16,base-H*.18],[x+H*.3,base],[x-H*.3,base],[x-H*.16,base-H*.18],[x-H*.27,base-H*.18],[x-H*.12,base-H*.55],[x-H*.2,base-H*.55]],col);}
function mast(ctx,x,base,H,col){
  const bw=H*.1;ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-bw/2,base);ctx.lineTo(x-bw*.08,base-H);ctx.moveTo(x+bw/2,base);ctx.lineTo(x+bw*.08,base-H);ctx.stroke();
  ctx.lineWidth=.7;ctx.beginPath();const n=11;for(let i=0;i<n;i++){const y0=base-H*i/n,y1=base-H*(i+1)/n,w0=bw/2-bw*.42*i/n,w1=bw/2-bw*.42*(i+1)/n;ctx.moveTo(x-w0,y0);ctx.lineTo(x+w1,y1);ctx.moveTo(x+w0,y0);ctx.lineTo(x-w1,y1);}ctx.stroke();
  ctx.fillStyle=col;ctx.fillRect(x-bw*.55,base-H*.7,bw*1.1,H*.02);ctx.fillRect(x-H*.09,base-H*.05,H*.18,H*.05);ctx.restore();
}
function battlements(ctx,x,y,w,m,col){ctx.fillStyle=col;const n=Math.max(3,Math.round(w/(m*1.6)));const st=w/n;for(let i=0;i<n;i+=2)ctx.fillRect(x+i*st,y-m,st,m+.5);}
function rockOfCashel(ctx,cx,T,U,baseY){
  const rock='#4A3343',b='#2F1F2C',win='#F9CB84';
  poly(ctx,[[cx-.68*U,baseY],[cx-.52*U,T+.11*U],[cx-.42*U,T+.05*U],[cx-.34*U,T+.022*U],[cx-.2*U,T+.006*U],[cx,T],[cx+.18*U,T+.004*U],[cx+.3*U,T+.016*U],[cx+.37*U,T+.05*U],[cx+.47*U,T+.115*U],[cx+.72*U,baseY]],rock);
  poly(ctx,[[cx-.52*U,T+.11*U],[cx-.42*U,T+.05*U],[cx-.38*U,T+.075*U],[cx-.47*U,T+.14*U]],'#5E4353');
  poly(ctx,[[cx+.37*U,T+.05*U],[cx+.47*U,T+.115*U],[cx+.52*U,T+.16*U],[cx+.42*U,T+.1*U]],'#3C2937');
  ctx.fillStyle=b;
  ctx.fillRect(cx-.35*U,T-.03*U,.7*U,.035*U);
  const tx=cx-.25*U;ctx.fillRect(tx-.045*U,T-.2*U,.09*U,.2*U);battlements(ctx,tx-.045*U,T-.2*U,.09*U,.012*U,b);
  ctx.fillRect(cx-.21*U,T-.105*U,.17*U,.105*U);
  ctx.fillRect(cx-.045*U,T-.225*U,.075*U,.225*U);battlements(ctx,cx-.045*U,T-.225*U,.075*U,.012*U,b);
  ctx.fillRect(cx+.03*U,T-.125*U,.18*U,.125*U);
  poly(ctx,[[cx-.085*U,T],[cx-.085*U,T-.13*U],[cx-.015*U,T-.195*U],[cx+.055*U,T-.13*U],[cx+.055*U,T]],'#3A2836');
  ctx.fillStyle=win;[-.035,-.015,.005].forEach((o,i)=>{const hh=i===1?.065:.05;const yy=T-.145*U+(i===1?0:.015*U);ctx.fillRect(cx+(o-.004)*U,yy,.008*U,hh*U);});
  [.07,.1,.13,.16].forEach(o=>ctx.fillRect(cx+o*U,T-.1*U,.007*U,.04*U));
  const rx=cx+.25*U;poly(ctx,[[rx-.022*U,T],[rx-.018*U,T-.27*U],[rx+.018*U,T-.27*U],[rx+.022*U,T]],b);poly(ctx,[[rx-.02*U,T-.27*U],[rx,T-.31*U],[rx+.02*U,T-.27*U]],b);
  const kx=cx+.1*U,kb=T+.01*U;poly(ctx,[[kx-.05*U,kb],[kx-.05*U,kb-.06*U],[kx+.06*U,kb-.06*U],[kx+.06*U,kb]],'#3A2836');poly(ctx,[[kx-.055*U,kb-.06*U],[kx+.005*U,kb-.13*U],[kx+.065*U,kb-.06*U]],'#3A2836');
  ctx.fillStyle='#3A2836';ctx.fillRect(kx+.045*U,kb-.12*U,.03*U,.12*U);poly(ctx,[[kx+.043*U,kb-.12*U],[kx+.06*U,kb-.15*U],[kx+.077*U,kb-.12*U]],'#3A2836');
}
function engineHouse(ctx,x,base,U,col,win){
  const bw=U*.07,bh=U*.12;
  poly(ctx,[[x-bw/2,base],[x-bw/2,base-bh],[x-bw*.12,base-bh-U*.035],[x+bw*.05,base-bh-U*.022],[x+bw*.2,base-bh-U*.005],[x+bw/2,base-bh],[x+bw/2,base]],col);
  const cx=x+bw/2+U*.012;poly(ctx,[[cx-U*.013,base],[cx-U*.009,base-U*.24],[cx+U*.009,base-U*.24],[cx+U*.013,base]],col);
  ctx.fillStyle=win;const wx=x-bw*.14,wy=base-bh*.42;ctx.beginPath();ctx.moveTo(wx-bw*.1,wy);ctx.lineTo(wx-bw*.1,wy-bh*.2);ctx.arc(wx,wy-bh*.2,bw*.1,Math.PI,0);ctx.lineTo(wx+bw*.1,wy);ctx.closePath();ctx.fill();
  ctx.fillRect(x+bw*.14,base-bh*.3,bw*.15,bh*.3);ctx.fillRect(x-bw*.2,base-bh*.9,bw*.12,bh*.12);
}
function seaStack(ctx,x,base,W,H,col,lit){poly(ctx,[[x-W/2,base],[x-W*.42,base-H*.7],[x-W*.3,base-H],[x+W*.25,base-H*.95],[x+W*.4,base-H*.6],[x+W/2,base]],col);poly(ctx,[[x+W*.05,base],[x+W*.1,base-H*.9],[x+W*.25,base-H*.95],[x+W*.4,base-H*.6],[x+W/2,base]],lit);ctx.save();ctx.strokeStyle='rgba(255,226,196,.55)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-W*.7,base+1);ctx.lineTo(x+W*.7,base+1);ctx.stroke();ctx.restore();}
function lighthouse(ctx,x,base,H){
  const bh=H*.7,bw=H*.36,tw=H*.31,top=base-bh;
  const ed=y=>{const k=(base-y)/bh;return(bw+(tw-bw)*k)/2;};
  const band=(a,c,col)=>{const y0=base-bh*a,y1=base-bh*c;poly(ctx,[[x-ed(y0),y0],[x-ed(y1),y1],[x+ed(y1),y1],[x+ed(y0),y0]],col);};
  band(0,1,'#DADCE5');band(.24,.38,'#15171C');band(.56,.7,'#15171C');
  ctx.save();ctx.globalAlpha=.3;poly(ctx,[[x+bw*.14,base],[x+tw*.14,top],[x+tw/2,top],[x+bw/2,base]],'#1A2340');ctx.restore();
  ctx.fillStyle='#262A38';[[.12,.04],[.46,.035],[.8,.035]].forEach(q=>ctx.fillRect(x-H*.018,base-bh*q[0]-H*q[1],H*.03,H*q[1]));
  ctx.fillStyle='#FFD98A';ctx.fillRect(x-H*.015,base-bh*.46-H*.03,H*.024,H*.022);
  ctx.fillStyle='#15171C';ctx.fillRect(x-H*.2,top-H*.025,H*.4,H*.025);
  ctx.save();ctx.strokeStyle='#15171C';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-H*.19,top-H*.065);ctx.lineTo(x+H*.19,top-H*.065);for(let i=0;i<=12;i++){const px=x-H*.19+H*.38*i/12;ctx.moveTo(px,top-H*.025);ctx.lineTo(px,top-H*.065);}ctx.stroke();ctx.restore();
  ctx.fillStyle='#DADCE5';ctx.fillRect(x-H*.085,top-H*.08,H*.17,H*.055);
  const gy=top-H*.08,gh=H*.095;
  ctx.fillStyle='#FFE8A6';ctx.fillRect(x-H*.07,gy-gh,H*.14,gh);
  ctx.save();ctx.strokeStyle='#15171C';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=4;i++){const px=x-H*.07+H*.14*i/4;ctx.moveTo(px,gy-gh);ctx.lineTo(px,gy);}ctx.stroke();ctx.restore();
  ctx.fillStyle='#15171C';ctx.beginPath();ctx.ellipse(x,gy-gh,H*.078,H*.045,0,Math.PI,TAU);ctx.fill();ctx.fillRect(x-1,gy-gh-H*.075,2,H*.035);
  glow(ctx,x,gy-gh/2,H*.22,'#FFE39A',.35);
  return[x,gy-gh/2];
}
function cottages(ctx,x,base,U){
  const w=U*.22,hh=U*.045;poly(ctx,[[x-w/2,base],[x-w/2,base-hh],[x+w/2,base-hh],[x+w/2,base]],'#AEB3C4');
  poly(ctx,[[x-w/2-U*.005,base-hh],[x-w/2+U*.022,base-hh-U*.03],[x+w/2-U*.022,base-hh-U*.03],[x+w/2+U*.005,base-hh]],'#1D2230');
  ctx.fillStyle='#1D2230';ctx.fillRect(x-w*.3,base-hh-U*.045,U*.012,U*.02);ctx.fillRect(x+w*.28,base-hh-U*.045,U*.012,U*.02);
  ctx.fillStyle='#FFD68A';[-.36,-.16,.08,.3].forEach(o=>ctx.fillRect(x+o*w,base-hh*.72,U*.011,U*.014));
  ctx.fillStyle='#1D2230';ctx.fillRect(x-w*.03,base-hh*.6,U*.012,hh*.6);
}
function roadPath(ctx,pts,wb,wt,col,dash){
  const n=pts.length,L=[],Rr=[];for(let i=0;i<n;i++){const k=i/(n-1),hw=(wb+(wt-wb)*k)/2;L.push([pts[i][0]-hw,pts[i][1]]);Rr.push([pts[i][0]+hw,pts[i][1]]);}
  ctx.beginPath();ctx.moveTo(L[0][0],L[0][1]);L.forEach(p=>ctx.lineTo(p[0],p[1]));for(let i=n-1;i>=0;i--)ctx.lineTo(Rr[i][0],Rr[i][1]);ctx.closePath();ctx.fillStyle=col;ctx.fill();
  if(dash){ctx.save();ctx.strokeStyle=dash;for(let i=0;i<n-1;i+=3){const k=i/(n-1);ctx.lineWidth=Math.max(.6,(1-k)*3.2);ctx.beginPath();ctx.moveTo(pts[i][0],pts[i][1]);ctx.lineTo(pts[i+1][0],pts[i+1][1]);ctx.stroke();}ctx.restore();}
}
function sunGlints(ctx,x,hy,h,U,t,n,a,seed){
  const r=mulberry32(seed);ctx.save();ctx.fillStyle='#FFCB86';
  for(let i=0;i<n;i++){const d=Math.pow(r(),1.2),y=hy+2+d*(h-hy),spread=U*(.02+d*.22),ox=(r()-.5)*2*spread,len=U*(.008+d*.05)*(.5+r());
    const f=t?(.5+.5*Math.sin(t*2.6+i*2.17)):1;ctx.globalAlpha=a*(1-d*.75)*f;ctx.fillRect(x+ox-len/2,y,len,Math.max(1,d*2.2));}
  ctx.restore();
}
function beam(ctx,x,y,t,w,h,U){
  const a=t*TAU/3,c=Math.cos(a),s=Math.sin(a),tw=Math.max(0,s),L=Math.max(w,h)*1.1;
  const ex=x+c*L,ey=y+s*L*.035,sp=L*(.045+.06*tw);
  ctx.save();ctx.globalCompositeOperation='lighter';
  const g=ctx.createLinearGradient(x,y,ex,ey);g.addColorStop(0,'rgba(255,236,170,'+(.3+.3*tw)+')');g.addColorStop(1,'rgba(255,236,170,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,y-U*.012);ctx.lineTo(ex,ey-sp);ctx.lineTo(ex,ey+sp);ctx.lineTo(x,y+U*.012);ctx.closePath();ctx.fill();
  const f=Math.pow(tw,6);glow(ctx,x,y,U*(.05+.3*f),'#FFF2C8',.25+.65*f);
  ctx.restore();
}

/* ---------- scenes ---------- */
const S={};
S.hero={
  sky(ctx,w,h,t){
    const U=unitOf(w,h),k=1-Math.pow(1-Math.min(1,t/5),3);
    paintSky(ctx,w,h,[[0,'#232E4A'],[.3,'#5D6184'],[.5,'#D39C89'],[.6,'#F4C79C'],[1,'#F4C79C']]);
    const sx=w*(w>h?.82:.72),sy=h*(.64-.17*k);
    glow(ctx,sx,sy,Math.max(w,h)*.6,'#FFCF98',.22+.26*k);
    glow(ctx,sx,sy,U*.24,'#FFF0D2',.5+.25*k);
    disc(ctx,sx,sy,U*.036,'#FFF7EA');
  },
  draw(ctx,w,h){
    const U=unitOf(w,h);
    ridge(ctx,w,h,{seed:3,base:.575,amp:.03,freq:2,oct:3,rough:.45,color:'#9A8FA8',bumps:[[.2,.14,.05],[.8,.12,.035]]});
    mist(ctx,w*.5,h*.6,w*1.3,h*.08,'#F7D9C0',.55);
    ridge(ctx,w,h,{seed:5,base:.62,amp:.03,freq:2.6,oct:3,rough:.45,color:'#7A7493',bumps:[[.05,.16,.06],[.55,.1,.02],[.95,.1,.04]]});
    mist(ctx,w*.55,h*.65,w*1.2,h*.07,'#F2CFB7',.5);
    ridge(ctx,w,h,{seed:8,base:.675,amp:.015,freq:3,color:'#625C7D'});
    mist(ctx,w*.52,h*.7,w*.7,h*.05,'#F2CFB7',.4);
    const lx=w*.515,ly=h*.84,lrx=Math.max(w*.08,U*.13),lry=Math.max(h*.045,U*.035);
    ctx.save();ctx.translate(lx,ly);ctx.rotate(-.14);
    ctx.beginPath();ctx.ellipse(0,0,lrx,lry,0,0,TAU);ctx.fillStyle=vgrad(ctx,-lry,lry,[[0,'#2E2C42'],[1,'#0B0C12']]);ctx.fill();
    ctx.beginPath();ctx.ellipse(-lrx*.05,-lry*.4,lrx*.72,lry*.16,0,0,TAU);ctx.fillStyle='rgba(244,199,156,.2)';ctx.fill();
    ctx.beginPath();ctx.ellipse(0,0,lrx,lry,0,Math.PI*1.38,Math.PI*1.72);ctx.strokeStyle='#F1E4C8';ctx.lineWidth=Math.max(2.5,lry*.3);ctx.lineCap='round';ctx.stroke();
    ctx.restore();
    ctx.beginPath();ctx.moveTo(-2,h*.5);ctx.bezierCurveTo(w*.18,h*.53,w*.3,h*.62,w*.4,h*.72);ctx.bezierCurveTo(w*.46,h*.78,w*.47,h*.86,w*.44,h+2);ctx.lineTo(-2,h+2);ctx.closePath();
    ctx.fillStyle=hgrad(ctx,0,w*.47,[[0,'#3A3048'],[1,'#5A4760']]);ctx.fill();
    poly(ctx,[[w*.18,h*.535],[w*.3,h*.62],[w*.26,h*.64],[w*.12,h*.56]],'rgba(140,110,140,.35)');
    poly(ctx,[[w*.34,h*.665],[w*.4,h*.72],[w*.36,h*.74],[w*.3,h*.69]],'rgba(140,110,140,.3)');
    poly(ctx,[[w+2,h*.4],[w*.93,h*.42],[w*.86,h*.47],[w*.8,h*.53],[w*.74,h*.6],[w*.68,h*.67],[w*.625,h*.75],[w*.59,h*.83],[w*.6,h+2],[w+2,h+2]],'#2E293B');
    poly(ctx,[[w*.86,h*.47],[w*.8,h*.53],[w*.84,h*.575],[w*.9,h*.5]],'#4A4058');
    poly(ctx,[[w*.74,h*.6],[w*.68,h*.67],[w*.72,h*.71],[w*.78,h*.64]],'#42394F');
    poly(ctx,[[w*.93,h*.42],[w*.9,h*.445],[w*.96,h*.5],[w+2,h*.47],[w+2,h*.41]],'#3F3650');
    poly(ctx,[[w*.625,h*.75],[w*.59,h*.83],[w*.64,h*.86],[w*.68,h*.78]],'#3A3249');
    ridge(ctx,w,h,{seed:13,base:.93,amp:.02,freq:3,color:'#1F1A27',bumps:[[.12,.22,.05],[.9,.2,.03]]});
    speckle(ctx,0,w*.45,h*.62,h,Math.round(w*.35),4,'rgba(138,90,131,.5)',.5,1.7);
    speckle(ctx,0,w,h*.88,h,Math.round(w*.4),6,'rgba(120,80,112,.55)',.6,1.9);
  },
  anim(ctx,w,h,t){
    mistBand(ctx,w,h,t,{y:.71,hf:.07,wf:.55,n:4,col:'#F6D8C2',a:.16,speed:.6});
    mistBand(ctx,w,h,t+40,{y:.62,hf:.06,wf:.7,n:3,col:'#FBE3CC',a:.13,speed:.4});
  }
};
S.glendalough={
  draw(ctx,w,h,st,cv){
    const U=unitOf(w,h);
    paintSky(ctx,w,h,[[0,'#8FAFBF'],[.45,'#CFDAD3'],[.62,'#EFE7CF']]);
    glow(ctx,w*.28,h*.18,Math.max(w,h)*.5,'#FFF3D6',.35);
    ridge(ctx,w,h,{seed:21,base:.53,amp:.02,freq:1.6,oct:3,color:'#A6B6B2',bumps:[[.5,.16,.07]]});
    mist(ctx,w*.5,h*.56,w*1.2,h*.06,'#F4EEDD',.5);
    ridge(ctx,w,h,{seed:22,base:.66,amp:.02,freq:3,color:'#7F9A8E',bumps:[[0,.32,.36],[.18,.12,.05]]});
    ridge(ctx,w,h,{seed:23,base:.67,amp:.02,freq:3,color:'#62806F',bumps:[[1,.34,.4],[.84,.12,.05]]});
    const wy=h*.665;
    ctx.fillStyle=vgrad(ctx,wy,h*.76,[[0,'#A2BBB9'],[1,'#5B7C7E']]);ctx.fillRect(0,wy,w,h-wy);
    reflect(ctx,cv,w,h,wy,.42);
    ripples(ctx,w,wy+2,h*.75,7,'#EEF2EA',.35,80);
    mist(ctx,w*.4,wy,w*.9,h*.03,'#F6F1E2',.5);
    ridge(ctx,w,h,{seed:24,base:.758,amp:.018,freq:55,oct:2,rough:.6,color:'#37543F'});
    ridge(ctx,w,h,{seed:26,base:.79,amp:.015,freq:70,oct:2,rough:.6,color:'#2A4435'});
    ridge(ctx,w,h,{seed:25,base:.875,amp:.012,freq:2,color:'#5C7A4E'});
    ridge(ctx,w,h,{seed:27,base:.955,amp:.01,freq:2,color:'#4A6640'});
    kevinsKitchen(ctx,w*.4,h*.89,U);
    roundTower(ctx,w*.64,h*.905,U*.6,'#D6CDB8','#A99F8A','#48474A');
    [[.2,.95,.07],[.27,.935,.05],[.52,.945,.055],[.8,.965,.08],[.87,.94,.05]].forEach(c=>highCross(ctx,w*c[0],h*c[1],U*c[2],'#34402F'));
    vignette(ctx,w,h,.18);
  },
  anim(ctx,w,h,t){mistBand(ctx,w,h,t,{y:.675,hf:.035,wf:.6,n:4,col:'#F6F1E2',a:.22,speed:.5});}
};
S.boyne={
  draw(ctx,w,h){
    const U=unitOf(w,h);
    paintSky(ctx,w,h,[[0,'#1F2A48'],[.34,'#6D6690'],[.52,'#E0A184'],[.6,'#F8D69B']]);
    const sx=w*.2,sy=h*.605;
    glow(ctx,sx,sy,Math.max(w,h)*.55,'#FFC98A',.42);glow(ctx,sx,sy,U*.2,'#FFF1CF',.7);disc(ctx,sx,sy,U*.04,'#FFF8E8');
    ridge(ctx,w,h,{seed:31,base:.615,amp:.012,freq:2.5,oct:3,color:'#8B7F98'});
    ridge(ctx,w,h,{seed:32,base:.65,amp:.015,freq:3,color:'#6E6A80'});
    mist(ctx,w*.4,h*.66,w*1.2,h*.05,'#F4CFAE',.45);
    ridge(ctx,w,h,{seed:33,base:.695,amp:.012,freq:2,color:'#555C57'});
    const top=[[-.02,.77],[.2,.745],[.45,.718],[.7,.703],[1.02,.695]],bot=[[1.02,.703],[.7,.714],[.45,.735],[.2,.772],[-.02,.812]];
    ctx.beginPath();ctx.moveTo(top[0][0]*w,top[0][1]*h);top.forEach(p=>ctx.lineTo(p[0]*w,p[1]*h));bot.forEach(p=>ctx.lineTo(p[0]*w,p[1]*h));ctx.closePath();
    ctx.fillStyle=hgrad(ctx,0,w,[[0,'#F9D39B'],[1,'#C99A86']]);ctx.fill();
    ripples(ctx,w*.6,h*.72,h*.8,33,'#FFF1D8',.5,26);
    ridge(ctx,w,h,{seed:34,base:.835,amp:.01,freq:2,color:'#3F483E'});
    const ent=newgrange(ctx,w*.64,h*.8,Math.min(U*1.02,w*.62),U*.19);
    ctx.save();ctx.globalCompositeOperation='lighter';
    const g=ctx.createLinearGradient(sx,sy,ent[0],ent[1]);g.addColorStop(0,'rgba(255,214,150,.22)');g.addColorStop(1,'rgba(255,214,150,.05)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(sx,sy-U*.02);ctx.lineTo(ent[0],ent[1]-U*.006);ctx.lineTo(ent[0],ent[1]+U*.006);ctx.lineTo(sx,sy+U*.02);ctx.closePath();ctx.fill();ctx.restore();
    ridge(ctx,w,h,{seed:35,base:.935,amp:.012,freq:2,color:'#2A3029'});
    speckle(ctx,0,w,h*.9,h,Math.round(w*.25),36,'rgba(230,226,240,.35)',.5,1.2);
    vignette(ctx,w,h,.2);
  }
};
S.cooley={
  draw(ctx,w,h,st,cv){
    const U=unitOf(w,h);
    paintSky(ctx,w,h,[[0,'#3B5578'],[.3,'#7F97B4'],[.47,'#E3B996'],[.56,'#F2CDA3']]);
    glow(ctx,w*.06,h*.5,Math.max(w,h)*.6,'#FFD9A8',.35);
    ridge(ctx,w,h,{seed:41,base:.52,amp:.07,freq:2.6,oct:5,rough:.52,ridged:true,color:hgrad(ctx,0,w,[[0,'#BE97A1'],[1,'#8B7392']]),bumps:[[.42,.07,.08],[.62,.09,.06]]});
    ridge(ctx,w,h,{seed:42,base:.555,amp:.02,freq:3,color:'#7C6A88'});
    ridge(ctx,w,h,{seed:43,base:.568,amp:.004,freq:4,color:'#5D5873'});
    const wy=h*.576;
    ctx.fillStyle=vgrad(ctx,wy,h,[[0,'#AFBDCB'],[1,'#557490']]);ctx.fillRect(0,wy,w,h-wy);
    reflect(ctx,cv,w,h,wy,.4);
    ripples(ctx,w,wy+2,h*.9,44,'#F6E4CC',.4,110);
    mist(ctx,w*.6,wy,w,h*.03,'#F6E1C8',.35);
    boat(ctx,w*.6,h*.665,U*.055);boat(ctx,w*.77,h*.635,U*.035);
    ctx.save();ctx.strokeStyle='rgba(36,44,52,.7)';ctx.lineWidth=1.5;for(let i=0;i<9;i++){const y=h*(.75+i*.01),x0=w*(.62+i*.012);ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x0+w*.18,y);ctx.stroke();}ctx.restore();
    const f=ridge(ctx,w,h,{seed:44,base:.84,amp:.012,freq:2,color:'#2F3B36',bumps:[[0,.3,.45],[.14,.12,.08]]});
    poly(ctx,[[0,h*.39],[w*.05,h*.42],[w*.11,h*.5],[w*.06,h*.52],[0,h*.46]],'#3E4A45');
    poly(ctx,[[w*.12,h*.52],[w*.2,h*.62],[w*.15,h*.64],[w*.09,h*.57]],'#394540');
    [[.5,.02,.03,'#DCD2C2','#3A3A42'],[.535,.025,.035,'#C9BFB0','#34343C'],[.575,.02,.028,'#E3D9CA','#3A3A42'],[.36,.02,.03,'#D2C8B8','#34343C']].forEach(q=>{const x=w*q[0];house(ctx,x,f(q[0])+1,U*q[1],U*q[2],q[3],q[4]);});
    castleRuin(ctx,w*.44,f(.44)+2,U,'#37393C','#F2C9A0');
    ridge(ctx,w,h,{seed:45,base:.96,amp:.008,freq:2,color:'#222B28'});
    vignette(ctx,w,h,.16);
  }
};
S.loughcrew={
  draw(ctx,w,h,st){
    const U=unitOf(w,h);
    paintSky(ctx,w,h,[[0,'#46558A'],[.28,'#A690A8'],[.5,'#F1C39E'],[.58,'#FCE2B6']]);
    const sx=w*.68,sy=h*.58;
    glow(ctx,sx,sy,Math.max(w,h)*.7,'#FFD7A0',.4);glow(ctx,sx,sy,U*.18,'#FFF4DC',.8);disc(ctx,sx,sy,U*.042,'#FFFAF0');
    const cols=['#D8BFC2','#C0A7B6','#A690A8','#8C7C9C','#736A8E'];
    for(let i=0;i<5;i++){ridge(ctx,w,h,{seed:51+i,base:.59+i*.035,amp:.012+i*.003,freq:2+i*.6,oct:3,color:cols[i]});mist(ctx,w*.5,h*(.605+i*.035),w*1.4,h*.035,'#FCE0C0',.34-i*.04);}
    const f=ridge(ctx,w,h,{seed:57,base:.955,amp:.004,freq:1.5,oct:2,bumps:[[.4,.45,.265]],color:vgrad(ctx,h*.69,h,[[0,'#3E4836'],[1,'#222720']]),rim:'rgba(255,212,160,.85)',rimW:2});
    const cx=w*.4,cy=f(.4)+U*.004,W=U*.26,H=U*.08;
    const ex=cx+W*.3,ey=cy-H*.18;
    ctx.save();ctx.globalCompositeOperation='lighter';
    const g=ctx.createLinearGradient(sx,sy,ex,ey);g.addColorStop(0,'rgba(255,220,160,.35)');g.addColorStop(1,'rgba(255,220,160,.08)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(sx,sy-U*.018);ctx.lineTo(ex,ey-U*.004);ctx.lineTo(ex,ey+U*.004);ctx.lineTo(sx,sy+U*.018);ctx.closePath();ctx.fill();ctx.restore();
    cairn(ctx,cx,cy,W,H,58,true);
    ctx.fillStyle='#17140F';ctx.fillRect(ex-U*.007,ey-U*.012,U*.014,U*.024);glow(ctx,ex,ey,U*.04,'#FFD69A',.6);
    cairn(ctx,w*.77,f(.77)+U*.003,U*.12,U*.04,59,false);
    const r=mulberry32(60);for(let i=0;i<12;i++){const u=.08+r()*.84;if(Math.abs(u-.4)<.1)continue;disc(ctx,w*u,f(u)+U*(.01+r()*.03),U*(.004+r()*.005),'#6E6A62');}
    [[.2,.05],[.27,.08],[.56,.06],[.62,.1],[.86,.07]].forEach(q=>sheep(ctx,w*q[0],f(q[0])+U*q[1],U*.012));
    vignette(ctx,w,h,.2);
  },
  anim(ctx,w,h,t){mistBand(ctx,w,h,t,{y:.66,hf:.04,wf:.6,n:4,col:'#FCE0C0',a:.16,speed:.45});}
};
S.slievebloom={
  draw(ctx,w,h,st){
    const U=unitOf(w,h);
    paintSky(ctx,w,h,[[0,'#0C152C'],[.3,'#26345C'],[.47,'#8E5A6A'],[.565,'#EE9F66']]);
    st.stars=starField(w,h,Math.round(w*h/2400),61,.42);drawStars(ctx,st.stars,.85);
    glow(ctx,w*.32,h*.575,Math.max(w,h)*.5,'#F7A465',.35);
    ridge(ctx,w,h,{seed:62,base:.58,amp:.006,freq:3,color:'#3B3F66'});
    ridge(ctx,w,h,{seed:63,base:.61,amp:.004,freq:4,color:'#30355A'});
    ctx.save();ctx.beginPath();for(let x=0;x<=w;x+=3){const y=h*(.628+.01*Math.sin(x/w*9)+.005*Math.sin(x/w*23));if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.strokeStyle='rgba(247,178,120,.85)';ctx.lineWidth=1.4;ctx.stroke();ctx.restore();
    ridge(ctx,w,h,{seed:64,base:.655,amp:.004,freq:4,color:'#282C4A'});
    speckle(ctx,0,w,h*.6,h*.66,Math.round(w*.03),65,'rgba(255,208,140,.85)',.6,1.2);
    ridge(ctx,w,h,{seed:66,base:.73,amp:.02,freq:2,color:'#1C2338',bumps:[[.12,.2,.06],[.9,.2,.05]]});
    const f=ridge(ctx,w,h,{seed:67,base:.87,amp:.008,freq:2,color:'#111726',bumps:[[0,.26,.16],[1,.3,.18]]});
    const r=mulberry32(68);
    for(let x=-10;x<w+10;x+=U*.016+r()*U*.012){const u=x/w,c=Math.abs(u-.5);if(c<.12)continue;const th=U*(.045+r()*.05)*(.7+c*1.4);conifer(ctx,x,f(u)+th*.2,th,'#0C111D');}
    const pts=[];for(let i=0;i<=40;i++){const k=i/40,y=h*(1.02-(1.02-.86)*(1-Math.pow(1-k,1.6))),x=w*(.5+.07*Math.sin(k*Math.PI*1.3)*(1-k));pts.push([x,y]);}
    roadPath(ctx,pts,w*.34,w*.012,'#3A3E50','rgba(230,226,214,.75)');
    ridge(ctx,w,h,{seed:69,base:1.0,amp:.005,freq:2,color:'#0A0E18',bumps:[[0,.12,.1],[1,.12,.1]]});
    vignette(ctx,w,h,.25);
  },
  anim(ctx,w,h,t,st){if(!st.stars)return;ctx.save();ctx.fillStyle='#FFFFFF';for(let i=0;i<st.stars.length;i+=5){const s=st.stars[i],a=.5+.5*Math.sin(t*2.2+i*1.3);ctx.globalAlpha=a*.85;ctx.beginPath();ctx.arc(s[0],s[1],s[2]*1.35,0,TAU);ctx.fill();}ctx.restore();}
};
S.leinster={
  draw(ctx,w,h,st){
    const U=unitOf(w,h);
    paintSky(ctx,w,h,[[0,'#86AACB'],[.42,'#CFDCDD'],[.58,'#F0E4C4']]);
    glow(ctx,w*.18,h*.12,Math.max(w,h)*.5,'#FFF6DC',.45);
    ridge(ctx,w,h,{seed:71,base:.6,amp:.01,freq:2,color:'#B4BCC8'});
    fields(ctx,0,w,h*.605,h*.8,72,['#A4B47C','#8FA86C','#B9BC82','#83A065','#ADB073','#C7BB86','#98AE70'],'#63744C');
    const f=ridge(ctx,w,h,{seed:73,base:.745,amp:.012,freq:1.6,oct:4,color:hgrad(ctx,0,w,[[0,'#9483A8'],[.64,'#806E96'],[.641,'#665678'],[1,'#5A4C72']]),bumps:[[.64,.17,.3],[.88,.12,.11],[.42,.14,.05]]});
    const px=w*.64,py=f(.64);
    ctx.save();ctx.strokeStyle='rgba(236,228,214,.6)';ctx.lineWidth=1.3;ctx.beginPath();
    const zz=[[.52,.02],[.6,.004],[.55,-.01],[.615,-.03],[.64,0]];let started=false;zz.forEach(q=>{const u=q[0],y=f(u)+U*.06*(1-(u-.5)/.14)*.4+q[1]*U;const X=w*u,Y=Math.max(py+2,Math.min(y,h*.8));if(!started){ctx.moveTo(X,Y);started=true;}else ctx.lineTo(X,Y);});ctx.stroke();ctx.restore();
    mast(ctx,px,py+U*.004,U*.17,'#2B2A35');st.mast=[px,py-U*.17+U*.004];
    ctx.save();ctx.lineCap='round';
    for(let k=-4;k<=4;k++){if(!k)continue;const x0=px+k*U*.018,y0=py+U*(.03+Math.abs(k)*.012),x1=px+k*U*.11,y1=py+U*(.2+Math.abs(k)*.02);
      ctx.strokeStyle=k<0?'rgba(70,52,92,.28)':'rgba(40,30,60,.3)';ctx.lineWidth=U*.006;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo((x0+x1)/2+k*U*.01,(y0+y1)/2,x1,y1);ctx.stroke();}
    ctx.restore();
    {const r=mulberry32(79);ctx.fillStyle='rgba(150,96,140,.35)';for(let i=0,n=Math.round(w*.3);i<n;i++){const u=.3+r()*.7,top=f(u),y=top+r()*Math.max(0,h*.8-top);ctx.beginPath();ctx.arc(w*u,y,.5+r(),0,TAU);ctx.fill();}}
    ridge(ctx,w,h,{seed:80,base:.8,amp:.02,freq:2.5,color:'#7C5B82',bumps:[[.5,.12,.035],[.8,.1,.045]]});
    ridge(ctx,w,h,{seed:74,base:.845,amp:.015,freq:2.2,color:'#744C68',bumps:[[.1,.2,.04]]});
    speckle(ctx,0,w,h*.82,h*.95,Math.round(w*.35),75,'rgba(176,102,150,.5)',.6,1.8);
    const f2=ridge(ctx,w,h,{seed:76,base:.935,amp:.012,freq:2.5,color:'#4E3148'});
    speckle(ctx,0,w,h*.91,h,Math.round(w*.5),77,'rgba(160,92,138,.55)',.7,2);
    const r=mulberry32(78);for(let i=0;i<14;i++){const x=r()*w,y=h*(.86+r()*.12),n=6+r()*8|0;for(let j=0;j<n;j++)disc(ctx,x+(r()-.5)*U*.05,y+(r()-.5)*U*.02,U*(.003+r()*.004),'#E6B73A');}
    for(let i=0;i<9;i++){const u=.1+i*.03,x=w*u,y=f2(u)+U*.035,s=U*(.009+(i%3)*.002);ctx.fillStyle='#8E8378';ctx.beginPath();ctx.ellipse(x+1.5,y+1,s*1.1,s*.5,0,0,TAU);ctx.fill();ctx.fillStyle='#DDD4C6';ctx.beginPath();ctx.ellipse(x,y-s*.3,s*.8,s*.9,0,Math.PI,TAU);ctx.fill();}
    vignette(ctx,w,h,.14);
  },
  anim(ctx,w,h,t,st){if(!st.mast)return;const a=.5+.5*Math.sin(t*3);glow(ctx,st.mast[0],st.mast[1],5+5*a,'#FF4A3A',.55*a);disc(ctx,st.mast[0],st.mast[1],1.6,'rgba(255,90,70,'+(.4+.6*a)+')');}
};
S.cashel={
  draw(ctx,w,h){
    const U=unitOf(w,h);
    paintSky(ctx,w,h,[[0,'#5E557F'],[.28,'#C67B77'],[.46,'#F2AE69'],[.56,'#FAD690']]);
    const cx=w*.56,T=h*.62,sx=cx+.08*U,sy=T-.2*U;
    glow(ctx,sx,sy,Math.max(w,h)*.6,'#FFCB7A',.45);glow(ctx,sx,sy,U*.2,'#FFF0C8',.8);disc(ctx,sx,sy,U*.055,'#FFF6DE');
    ridge(ctx,w,h,{seed:81,base:.655,amp:.01,freq:2,color:'#C8927F',bumps:[[.92,.12,.07],[.8,.08,.03],[.08,.1,.02]]});
    mist(ctx,w*.5,h*.67,w*1.3,h*.04,'#FBD9A2',.5);
    fields(ctx,0,w,h*.675,h*.9,82,['#C9A060','#BA8F55','#D6B26D','#AD8752','#C69F5E','#B89A62'],'#7A5B3C');
    rockOfCashel(ctx,cx,T,U,h*.86);
    ridge(ctx,w,h,{seed:83,base:.94,amp:.012,freq:2,color:'#3B2C2B'});
    const hx=w*.14,hb=h*.925;ctx.fillStyle='#2C2024';ctx.fillRect(hx-U*.06,hb-U*.045,U*.12,U*.045);ctx.fillRect(hx-U*.012,hb-U*.08,U*.03,U*.08);poly(ctx,[[hx+U*.03,hb-U*.045],[hx+U*.045,hb-U*.07],[hx+U*.06,hb-U*.045]],'#2C2024');
    ctx.save();ctx.strokeStyle='rgba(60,40,56,.7)';ctx.lineWidth=1.3;[[.3,.22],[.33,.19],[.36,.24]].forEach(q=>{const x=w*q[0],y=h*q[1],s=U*.012;ctx.beginPath();ctx.moveTo(x-s,y-s*.5);ctx.quadraticCurveTo(x-s*.4,y-s*.7,x,y);ctx.quadraticCurveTo(x+s*.4,y-s*.7,x+s,y-s*.5);ctx.stroke();});ctx.restore();
    vignette(ctx,w,h,.18);
  }
};
S.copper={
  draw(ctx,w,h,st){
    const U=unitOf(w,h);
    paintSky(ctx,w,h,[[0,'#27304F'],[.25,'#6E4461'],[.42,'#D26A4E'],[.53,'#F7A45C']]);
    const hy=h*.53,sx=w*.77,sy=hy-U*.012;
    glow(ctx,sx,sy,Math.max(w,h)*.6,'#FFB36A',.45);glow(ctx,sx,sy,U*.2,'#FFE2AA',.7);disc(ctx,sx,sy,U*.06,'#FFE6B4');
    poly(ctx,[[w*.86,hy+1],[w*.89,hy-h*.025],[w*.94,hy-h*.04],[w+2,hy-h*.045],[w+2,hy+1]],'#5A3246');
    ctx.fillStyle=vgrad(ctx,hy,h,[[0,'#C9755F'],[.15,'#7E5A6C'],[1,'#1E3346']]);ctx.fillRect(0,hy,w,h-hy);
    st.sun=[sx,hy];sunGlints(ctx,sx,hy,h,U,0,160,.5,90);
    ripples(ctx,w,hy+3,h,91,'#F3B48A',.25,70);
    poly(ctx,[[-2,hy-h*.02],[w*.18,hy-h*.015],[w*.28,hy-h*.005],[w*.31,hy+h*.02],[w*.3,hy+h*.035],[-2,hy+h*.035]],'#4B2E3E');
    seaStack(ctx,w*.52,h*.64,U*.05,U*.13,'#3A2433','#6A3E44');
    seaStack(ctx,w*.59,h*.62,U*.03,U*.08,'#3A2433','#6A3E44');
    const top=[[-2,h*.6],[w*.12,h*.605],[w*.26,h*.625],[w*.38,h*.655],[w*.42,h*.665]];
    poly(ctx,top.concat([[w*.43,h*.7],[w*.415,h*.74],[w*.44,h*.79],[w*.43,h*.84],[w*.46,h*.9],[w*.45,h+2],[-2,h+2]]),'#7A3C2C');
    poly(ctx,[[w*.3,h*.64],[w*.42,h*.665],[w*.43,h*.7],[w*.34,h*.7]],'#9C5236');
    poly(ctx,[[w*.33,h*.74],[w*.415,h*.74],[w*.44,h*.79],[w*.36,h*.78]],'#A35A3B');
    poly(ctx,[[w*.3,h*.82],[w*.43,h*.84],[w*.46,h*.9],[w*.33,h*.88]],'#6A3325');
    poly(ctx,[[0,h*.7],[w*.3,h*.72],[w*.3,h*.735],[0,h*.715]],'rgba(60,24,18,.35)');
    poly(ctx,top.concat([[w*.42,h*.685],[w*.38,h*.675],[w*.26,h*.645],[w*.12,h*.625],[-2,h*.62]]),'#4F5B39');
    engineHouse(ctx,w*.2,h*.612,U,'#2A1D24','#F6B06A');
    ctx.save();ctx.strokeStyle='rgba(255,232,210,.6)';ctx.lineWidth=1.4;for(let i=0;i<5;i++){const y=h*(.72+i*.045);ctx.beginPath();ctx.moveTo(w*(.44+i*.005),y);ctx.quadraticCurveTo(w*(.47+i*.01),y-h*.006,w*(.52+i*.02),y+h*.004);ctx.stroke();}ctx.restore();
    vignette(ctx,w,h,.2);
  },
  anim(ctx,w,h,t,st){if(!st.sun)return;sunGlints(ctx,st.sun[0],st.sun[1],h,unitOf(w,h),t,70,.8,92);}
};
S.hook={
  draw(ctx,w,h,st){
    const U=unitOf(w,h);
    paintSky(ctx,w,h,[[0,'#0A1230'],[.35,'#1B2855'],[.56,'#4A5A8E'],[.62,'#877FA6']]);
    st.stars=starField(w,h,Math.round(w*h/2200),93,.45);drawStars(ctx,st.stars,.8);
    const hy=h*.62;
    poly(ctx,[[-2,hy+1],[-2,hy-h*.02],[w*.08,hy-h*.024],[w*.2,hy-h*.018],[w*.3,hy-h*.006],[w*.34,hy+1]],'#1A2244');
    speckle(ctx,w*.02,w*.28,hy-h*.014,hy-h*.004,14,94,'rgba(255,214,140,.9)',.7,1.2);
    ctx.fillStyle=vgrad(ctx,hy,h,[[0,'#2A3A66'],[.3,'#132142'],[1,'#08112A']]);ctx.fillRect(0,hy,w,h-hy);
    ripples(ctx,w,hy+2,h,95,'#8E9CC8',.22,90);
    poly(ctx,[[w*.2,h*.752],[w*.23,h*.736],[w*.3,h*.724],[w*.5,h*.714],[w*.8,h*.706],[w+2,h*.7],[w+2,h+2],[w*.07,h+2],[w*.13,h*.86],[w*.18,h*.79]],'#1C2334');
    poly(ctx,[[w*.2,h*.752],[w*.23,h*.736],[w*.3,h*.724],[w*.3,h*.735],[w*.22,h*.755]],'#384260');
    poly(ctx,[[w*.18,h*.79],[w*.2,h*.77],[w*.26,h*.775],[w*.24,h*.795]],'#2E3752');
    poly(ctx,[[w*.13,h*.86],[w*.16,h*.83],[w*.22,h*.84],[w*.2,h*.865]],'#2E3752');
    ctx.save();ctx.strokeStyle='rgba(200,214,255,.45)';ctx.lineWidth=1.2;[[.2,.755],[.18,.793],[.13,.862],[.09,.93]].forEach(q=>{ctx.beginPath();ctx.moveTo(w*(q[0]-.04),h*q[1]+2);ctx.quadraticCurveTo(w*(q[0]-.015),h*q[1]-2,w*q[0]+2,h*q[1]+1);ctx.stroke();});ctx.restore();
    const lx=w*.56,lb=h*.716;
    cottages(ctx,lx-U*.22,lb+1,U);
    ctx.fillStyle='#2A3044';ctx.fillRect(lx-U*.36,lb-U*.012,U*.72,U*.012);
    st.lamp=lighthouse(ctx,lx,lb,U*.42);
    vignette(ctx,w,h,.22);
  },
  anim(ctx,w,h,t,st){if(st.lamp)beam(ctx,st.lamp[0],st.lamp[1],t,w,h,unitOf(w,h));}
};


/* ---------- runtime ---------- */
const RM=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
class Plate{
  constructor(c,s){this.c=c;this.s=s;this.st={};this.buf=document.createElement('canvas');this.dirty=true;this.visible=false;this.near=false;this.w=0;this.h=0;this.live=false;}
  paint(W,H,dpr){
    this.w=W;this.h=H;this.dpr=dpr;
    [this.c,this.buf].forEach(cv=>{cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);});
    const b=this.buf.getContext('2d');b.setTransform(dpr,0,0,dpr,0,0);b.clearRect(0,0,W,H);this.st={};
    try{this.s.draw(b,W,H,this.st,this.buf);}catch(e){console.error(e);}
    this.ctx=this.c.getContext('2d');this.pat=this.ctx.createPattern(grainCanvas(),'repeat');
  }
  resize(){
    const W=this.c.clientWidth,H=this.c.clientHeight;if(W<2||H<2)return false;
    const dpr=Math.min(2,window.devicePixelRatio||1);
    if(W===this.w&&H===this.h&&dpr===this.dpr)return true;
    this.paint(W,H,dpr);return true;
  }
  frame(t){
    if(!this.w)return;const ctx=this.ctx,W=this.w,H=this.h;
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.clearRect(0,0,W,H);
    if(this.s.sky)this.s.sky(ctx,W,H,t,this.st);
    ctx.drawImage(this.buf,0,0,W,H);
    if(this.s.anim)this.s.anim(ctx,W,H,t,this.st);
    ctx.save();ctx.globalAlpha=.13;ctx.globalCompositeOperation='overlay';ctx.fillStyle=this.pat;ctx.fillRect(0,0,W,H);ctx.restore();
    if(!this.live){this.live=true;this.c.classList.add('is-live');}
  }
}
/* Used by scripts/render-images.mjs to export still frames at t=0, matching what the live canvas starts from. */
function renderStill(canvas,name,W,H,dpr,t){const p=new Plate(canvas,S[name]);p.paint(W,H,dpr||1);p.frame(t||0);return canvas;}
window.NRO_SCENES={names:Object.keys(S),renderStill:renderStill};

const plates=[];let raf=0,t0=0;
function loop(now){
  raf=0;if(!t0)t0=now;const moving=!document.hidden;const t=(now-t0)/1000;let again=false,budget=1;
  for(const p of plates){
    if(p.dirty&&p.near){if(budget>0){budget--;if(p.resize())p.frame(t);p.dirty=false;}else again=true;}
    else if(!p.dirty&&moving&&p.visible&&(p.s.anim||p.s.sky))p.frame(t);
    if(moving&&p.visible&&(p.s.anim||p.s.sky))again=true;
  }
  if(again)raf=requestAnimationFrame(loop);
}
function kick(){if(!raf)raf=requestAnimationFrame(loop);}
function boot(){
  if(RM.matches||window.NRO_NO_BOOT)return; /* still images already on the page cover reduced-motion visitors */
  document.querySelectorAll('canvas[data-scene]').forEach(c=>{const s=S[c.getAttribute('data-scene')];if(s){const p=new Plate(c,s);c.__plate=p;plates.push(p);}});
  if(!plates.length)return;
  if('ResizeObserver' in window){const ro=new ResizeObserver(es=>{es.forEach(e=>{if(e.target.__plate)e.target.__plate.dirty=true;});kick();});plates.forEach(p=>ro.observe(p.c));}
  if('IntersectionObserver' in window){
    const vis=new IntersectionObserver(es=>{es.forEach(e=>{if(e.target.__plate)e.target.__plate.visible=e.isIntersecting;});kick();},{rootMargin:'60px'});
    const near=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&e.target.__plate)e.target.__plate.near=true;});kick();},{rootMargin:'100% 0px'});
    plates.forEach(p=>{vis.observe(p.c);near.observe(p.c);});
  }else plates.forEach(p=>{p.visible=true;p.near=true;});
  document.addEventListener('visibilitychange',kick);
  kick();
}
/* The pre-rendered still is the page's main image, so the live canvas waits until the page has loaded
   and the browser is idle. Painting a scene is a long task on a phone; doing it earlier delays the still
   image and input. Visitors who ask to save data keep the still. */
function later(){
  const c=navigator.connection;if(c&&c.saveData)return;
  if('requestIdleCallback' in window)requestIdleCallback(boot,{timeout:3000});else setTimeout(boot,200);
}
if(document.readyState==='complete')later();else window.addEventListener('load',later,{once:true});
})();
