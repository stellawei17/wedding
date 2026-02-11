function $(s,r=document){return r.querySelector(s)}; function $all(s,r=document){return Array.from(r.querySelectorAll(s))}

// Smooth scroll
let lenis=null;
if(window.Lenis){
  lenis=new Lenis({duration:1.15,easing:(t)=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
  const raf=(t)=>{lenis.raf(t); requestAnimationFrame(raf)}; requestAnimationFrame(raf);
}
function smoothTo(hash){
  const el=document.querySelector(hash); if(!el) return;
  if(lenis) lenis.scrollTo(el,{offset:-88}); else el.scrollIntoView({behavior:"smooth"});
}
$all('a[href^="#"]').forEach(a=>a.addEventListener("click",(e)=>{const h=a.getAttribute("href"); if(h && h.length>1){e.preventDefault(); smoothTo(h)}}));

// Toast
const toast=$("#toast"); let tt=null;
function showToast(msg){toast.textContent=msg||"Saved!"; toast.style.display="block"; clearTimeout(tt); tt=setTimeout(()=>toast.style.display="none",1800);}

// Mobile sheet
const sheet=$("#sheet");
function openSheet(){sheet.style.display="block"; sheet.setAttribute("aria-hidden","false"); if(window.gsap) gsap.fromTo(".sheetPanel",{y:-10,opacity:0},{y:0,opacity:1,duration:.35,ease:"power2.out"});}
function closeSheet(){ if(sheet.style.display!=="block") return;
  if(window.gsap) gsap.to(".sheetPanel",{y:-10,opacity:0,duration:.22,ease:"power2.in",onComplete:()=>{sheet.style.display="none"; sheet.setAttribute("aria-hidden","true");}});
  else {sheet.style.display="none"; sheet.setAttribute("aria-hidden","true");}
}
$("#openMenu")?.addEventListener("click",openSheet);
$("#closeMenu")?.addEventListener("click",closeSheet);
sheet?.addEventListener("click",(e)=>{if(e.target===sheet) closeSheet()});
$all("[data-close-sheet]").forEach(a=>a.addEventListener("click",closeSheet));

// Music
const bgm=$("#bgm"); const musicLabel=$("#musicLabel"); let musicOn=false;
async function toggleMusic(){
  try{
    if(!musicOn){ await bgm.play(); musicOn=true; musicLabel.textContent="Music: On"; showToast("Music on"); }
    else { bgm.pause(); musicOn=false; musicLabel.textContent="Music: Off"; showToast("Music off"); }
  }catch{ showToast("Tap again to allow audio"); }
}
$("#musicBtn")?.addEventListener("click",toggleMusic);

// Calendar (ICS)
$("#addToCal")?.addEventListener("click",()=>{
  const dtStart="20260723T073000Z", dtEnd="20260723T113000Z";
  const stamp=new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
  const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//JayArPrincessWedding//EN\nBEGIN:VEVENT\nUID:${Date.now()}@jayarprincess\nDTSTAMP:${stamp}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nSUMMARY:Jay Ar & Princess Wedding\nLOCATION:Guinayangan, Quezon\nDESCRIPTION:Ceremony at 3:30 PM. Reception follows.\nEND:VEVENT\nEND:VCALENDAR`;
  const url=URL.createObjectURL(new Blob([ics],{type:"text/calendar;charset=utf-8"}));
  const a=document.createElement("a"); a.href=url; a.download="JayAr-Princess-Wedding.ics"; a.click(); URL.revokeObjectURL(url);
  showToast("Calendar downloaded");
});

// Copy
$("#copyDetails")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText("Jay Ar & Princess Wedding — July 23, 2026 • 3:30 PM — Guinayangan, Quezon"); showToast("Copied details");}catch{showToast("Copy not supported");}});
$("#copyAddress")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText("Guinayangan, Quezon (add exact venue address here)"); showToast("Copied address");}catch{showToast("Copy not supported");}});
$("#copySite")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(window.location.href); showToast("Copied website link");}catch{showToast("Copy not supported");}});
$("#scrollToRsvp")?.addEventListener("click",()=>smoothTo("#rsvp"));

// Gallery lightbox
const lightbox=$("#lightbox"), lightboxImg=$("#lightboxImg");
function openLightbox(src){ lightboxImg.src=src; lightbox.style.display="flex"; lightbox.setAttribute("aria-hidden","false"); if(window.gsap) gsap.fromTo(lightboxImg,{opacity:0,scale:.99},{opacity:1,scale:1,duration:.35,ease:"power2.out"}); }
function closeLightbox(){ lightbox.style.display="none"; lightbox.setAttribute("aria-hidden","true"); }
$all(".g").forEach(el=>el.addEventListener("click",()=>openLightbox(el.getAttribute("data-full"))));
$("#closeLightbox")?.addEventListener("click",closeLightbox);
lightbox?.addEventListener("click",(e)=>{if(e.target===lightbox) closeLightbox()});

// RSVP local
const STORAGE_KEY="jayar_princess_rsvps_v1";
const load=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return[]}};
const save=(x)=>localStorage.setItem(STORAGE_KEY,JSON.stringify(x));
const esc=(s)=>String(s||"").replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
function render(){
  const box=$("#rsvpList"); if(!box) return;
  const list=load();
  if(list.length===0){box.innerHTML='<p class="sub">No RSVPs yet—submit one to test.</p>'; return;}
  box.innerHTML=list.slice().reverse().map(i=>`
    <div class="rsvpItem">
      <div>
        <b>${esc(i.name)} <span class="tag">${esc(i.attending)}</span></b>
        <span>${esc(i.contact)} • Guests: ${esc(i.guests)}</span>
        ${i.notes?`<span>“${esc(i.notes)}”</span>`:""}
      </div>
      <div class="tag">${new Date(i.ts).toLocaleString()}</div>
    </div>`).join("");
}
render();
function handleSubmit(form){
  const data=Object.fromEntries(new FormData(form).entries());
  const list=load(); list.push({...data, ts: Date.now()}); save(list);
  form.reset(); render(); showToast("RSVP saved (local)");
}
$("#rsvpInline")?.addEventListener("submit",(e)=>{e.preventDefault(); handleSubmit(e.target);});
$("#downloadRsvps")?.addEventListener("click",()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(load(),null,2)],{type:"application/json"}));
  const a=document.createElement("a"); a.href=url; a.download="rsvps.json"; a.click(); URL.revokeObjectURL(url);
  showToast("Downloaded RSVPs");
});
$("#clearRsvps")?.addEventListener("click",()=>{localStorage.removeItem(STORAGE_KEY); render(); showToast("Cleared local RSVPs");});

// Modal
const modal=$("#modalOverlay");
function openModal(){ modal.style.display="flex"; modal.setAttribute("aria-hidden","false"); if(window.gsap) gsap.fromTo(".modal",{y:18,opacity:0,scale:.99},{y:0,opacity:1,scale:1,duration:.35,ease:"power3.out"}); }
function closeModal(){ if(window.gsap) gsap.to(".modal",{y:12,opacity:0,scale:.99,duration:.22,ease:"power2.in",onComplete:()=>{modal.style.display="none"; modal.setAttribute("aria-hidden","true");}}); else {modal.style.display="none"; modal.setAttribute("aria-hidden","true");} }
["openRsvpTop","openRsvp2","openRsvp3","openRsvp4","openRsvpModal"].forEach(id=>$("#"+id)?.addEventListener("click",()=>{closeSheet(); openModal();}));
$("#closeRsvp")?.addEventListener("click",closeModal);
modal?.addEventListener("click",(e)=>{if(e.target===modal) closeModal()});
$("#rsvpModalForm")?.addEventListener("submit",(e)=>{e.preventDefault(); handleSubmit(e.target); closeModal();});

// Petals canvas
const c=$("#petals"), ctx=c.getContext("2d"); let W=0,H=0,petals=[];
const rand=(a,b)=>a+Math.random()*(b-a);
function resize(){const d=devicePixelRatio||1; W=c.width=innerWidth*d; H=c.height=innerHeight*d; c.style.width=innerWidth+"px"; c.style.height=innerHeight+"px";}
addEventListener("resize",resize); resize();
function makePetal(){const d=devicePixelRatio||1, r=rand(5,14)*d; return {x:rand(0,W), y:rand(-H*0.2,H), r,
  vx:rand(-0.25,0.35)*d, vy:rand(0.45,1.05)*d, rot:rand(0,Math.PI*2), vr:rand(-0.02,0.02), a:rand(0.18,0.45)};}
petals=Array.from({length:50},makePetal);
function draw(p){
  ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.globalAlpha=p.a;
  const g=ctx.createRadialGradient(0,0,p.r*0.1,0,0,p.r);
  g.addColorStop(0,"rgba(255,255,255,.95)"); g.addColorStop(.55,"rgba(232,214,183,.70)"); g.addColorStop(1,"rgba(187,160,122,0)");
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.moveTo(0,-p.r);
  ctx.bezierCurveTo(p.r*0.9,-p.r*0.6,p.r*0.9,p.r*0.6,0,p.r);
  ctx.bezierCurveTo(-p.r*0.9,p.r*0.6,-p.r*0.9,-p.r*0.6,0,-p.r);
  ctx.closePath(); ctx.fill(); ctx.restore();
}
(function tick(){
  ctx.clearRect(0,0,W,H);
  for(const p of petals){
    p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
    p.x += Math.sin((p.y/(180*(devicePixelRatio||1)))+p.rot)*0.35*(devicePixelRatio||1);
    if(p.y>H+p.r*2||p.x<-p.r*2||p.x>W+p.r*2) Object.assign(p, makePetal(), {y:-p.r*2});
    draw(p);
  }
  requestAnimationFrame(tick);
})();

// GSAP reveals (CDN required)
if(window.gsap && window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".nav",{y:-12,opacity:0,duration:.7,ease:"power3.out",delay:.08});
  gsap.from(".headline",{y:12,opacity:0,duration:.85,ease:"power3.out",delay:.10});
  gsap.to(".photo",{scale:1.02,duration:7.5,ease:"sine.inOut",yoyo:true,repeat:-1});
  $all(".reveal").forEach(el=>gsap.to(el,{opacity:1,y:0,duration:.85,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 82%"}}));
}

// Countdown
const WEDDING_DATE=new Date("2026-07-23T15:30:00+08:00");
const ring=$("#ringProg"), ringDot=$("#ringDot"), daysLeftEl=$("#daysLeft");
const CIRC=302;
function setRing(p){
  const cl=Math.max(0,Math.min(1,p)); ring.style.strokeDashoffset=(CIRC*(1-cl)).toFixed(2);
  const ang=(-90+cl*360)*(Math.PI/180), cx=60, cy=60, r=48;
  ringDot.setAttribute("cx",(cx+r*Math.cos(ang)).toFixed(2)); ringDot.setAttribute("cy",(cy+r*Math.sin(ang)).toFixed(2));
}
const pad2=(n)=>String(n).padStart(2,"0");
function setFlip(unit,val){
  const el=document.querySelector(`.flip[data-unit="${unit}"]`); if(!el) return;
  const cur=el.querySelector(".cur"), nxt=el.querySelector(".nxt"); const v=String(val);
  if(cur.textContent===v) return; nxt.textContent=v;
  if(window.gsap){
    gsap.killTweensOf([cur,nxt]); gsap.set(nxt,{opacity:0,y:12});
    gsap.to(cur,{opacity:0,y:-10,duration:.18,ease:"power2.in"});
    gsap.to(nxt,{opacity:1,y:0,duration:.32,ease:"power3.out",onComplete:()=>{cur.textContent=v; gsap.set(cur,{opacity:1,y:0}); gsap.set(nxt,{opacity:0,y:12});}});
  } else cur.textContent=v;
}
function update(){
  const diff=WEDDING_DATE-new Date();
  if(diff<=0){setFlip("days","00");setFlip("hours","00");setFlip("mins","00");setFlip("secs","00");daysLeftEl.textContent="0";setRing(1);return;}
  const days=Math.floor(diff/(1000*60*60*24));
  const hours=Math.floor((diff/(1000*60*60))%24);
  const mins=Math.floor((diff/(1000*60))%60);
  const secs=Math.floor((diff/1000)%60);
  setFlip("days",String(days)); setFlip("hours",pad2(hours)); setFlip("mins",pad2(mins)); setFlip("secs",pad2(secs));
  daysLeftEl.textContent=String(days);
  setRing((60-secs)/60);
}
update(); setInterval(update,1000);
