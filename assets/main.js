// Jay Ar & Princess Wedding — main.js

// ===== Lenis smooth scroll =====
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Anchor smooth scroll (also closes sheet)
function smoothTo(hash){
  const el = document.querySelector(hash);
  if(!el) return;
  lenis.scrollTo(el, {offset: -84});
}
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click",(e)=>{
    const href = a.getAttribute("href");
    if(href && href.length > 1){
      e.preventDefault();
      smoothTo(href);
    }
  });
});

// ===== Toast =====
const toast = document.getElementById("toast");
let toastT;
function showToast(msg="Done!"){
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(toastT);
  toastT = setTimeout(()=> toast.style.display="none", 1800);
}

// ===== RSVP modal =====
const overlay = document.getElementById("modalOverlay");
const openBtns = ["openRsvp","openRsvp2","openRsvp3","openRsvp4"].map(id=>document.getElementById(id)).filter(Boolean);
const closeRsvp = document.getElementById("closeRsvp");

function openModal(){
  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden","false");
  gsap.fromTo(".modal",
    {y:24, opacity:0, scale:.98},
    {y:0, opacity:1, scale:1, duration:.45, ease:"power3.out"}
  );
}
function closeModal(){
  gsap.to(".modal",{y:18, opacity:0, scale:.98, duration:.25, ease:"power2.in", onComplete:()=>{
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden","true");
  }});
}
openBtns.forEach(b=>b.addEventListener("click", ()=>{ closeSheet(); openModal(); }));
closeRsvp.addEventListener("click", closeModal);
overlay.addEventListener("click", (e)=>{ if(e.target === overlay) closeModal(); });

// RSVP submit (demo)
const rsvpForm = document.getElementById("rsvpForm");
let lastRsvp = null;
rsvpForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(rsvpForm).entries());
  lastRsvp = data;
  localStorage.setItem("wedding_rsvp_last", JSON.stringify(data));
  showToast("RSVP saved (demo)");
  rsvpForm.reset();
  closeModal();
  console.log("RSVP:", data);
});

// Download RSVP json
document.getElementById("downloadRsvp").addEventListener("click", ()=>{
  const stored = lastRsvp || (localStorage.getItem("wedding_rsvp_last") ? JSON.parse(localStorage.getItem("wedding_rsvp_last")) : null);
  if(!stored){
    showToast("Submit one RSVP first");
    return;
  }
  const blob = new Blob([JSON.stringify(stored,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rsvp.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Copy details
document.getElementById("copyDetails").addEventListener("click", async ()=>{
  const text = "Jay Ar & Princess Wedding — July 23, 2026 • 3:30 PM — Guinayangan, Quezon";
  try{
    await navigator.clipboard.writeText(text);
    showToast("Copied details");
  }catch{
    showToast("Copy not supported");
  }
});

// Copy link (for Vercel once deployed)
document.getElementById("shareLink").addEventListener("click", async ()=>{
  const text = window.location.href;
  try{
    await navigator.clipboard.writeText(text);
    showToast("Copied website link");
  }catch{
    showToast("Copy not supported");
  }
});

// Add to calendar (basic .ics)
document.getElementById("addToCal").addEventListener("click", ()=>{
  // July 23, 2026 3:30 PM GMT+8 -> 07:30Z
  const dtStart = "20260723T073000Z";
  const dtEnd   = "20260723T113000Z"; // 7:30 PM GMT+8 -> 11:30Z
  const stamp = new Date().toISOString().replace(/[-:]/g,"").split(".")[0] + "Z";
  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JayArPrincessWedding//EN
BEGIN:VEVENT
UID:${Date.now()}@jayarprincess
DTSTAMP:${stamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:Jay Ar & Princess Wedding
LOCATION:Guinayangan, Quezon
DESCRIPTION:Ceremony at 3:30 PM. Reception follows.
END:VEVENT
END:VCALENDAR`;
  const blob = new Blob([ics], {type:"text/calendar;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "JayAr-Princess-Wedding.ics";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Calendar file downloaded");
});

// ===== Mobile menu sheet =====
const sheet = document.getElementById("sheet");
const openMenu = document.getElementById("openMenu");
const closeMenu = document.getElementById("closeMenu");
function openSheet(){
  sheet.style.display = "block";
  sheet.setAttribute("aria-hidden","false");
  gsap.fromTo(".sheetPanel",{y:-10, opacity:0},{y:0, opacity:1, duration:.35, ease:"power2.out"});
}
function closeSheet(){
  if(sheet.style.display !== "block") return;
  gsap.to(".sheetPanel",{y:-10, opacity:0, duration:.22, ease:"power2.in", onComplete:()=>{
    sheet.style.display="none";
    sheet.setAttribute("aria-hidden","true");
  }});
}
openMenu?.addEventListener("click", openSheet);
closeMenu?.addEventListener("click", closeSheet);
sheet.addEventListener("click",(e)=>{ if(e.target === sheet) closeSheet(); });
sheet.querySelectorAll("[data-close-sheet]").forEach(a=>{
  a.addEventListener("click", ()=> closeSheet());
});

// ===== Lightbox =====
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeLightbox = document.getElementById("closeLightbox");
document.querySelectorAll(".g").forEach(el=>{
  el.addEventListener("click", ()=>{
    lightboxImg.src = el.getAttribute("data-full");
    lightbox.style.display = "flex";
    lightbox.setAttribute("aria-hidden","false");
    gsap.fromTo(lightboxImg,{opacity:0, scale:.99},{opacity:1, scale:1, duration:.35, ease:"power2.out"});
  });
});
function closeLB(){
  lightbox.style.display = "none";
  lightbox.setAttribute("aria-hidden","true");
}
closeLightbox.addEventListener("click", closeLB);
lightbox.addEventListener("click",(e)=>{ if(e.target === lightbox) closeLB(); });

// ===== Dust particles (soft, wedding vibe) =====
const canvas = document.getElementById("dust");
const ctx = canvas.getContext("2d");
let W,H, pts=[];
function resize(){
  const dpr = devicePixelRatio || 1;
  W = canvas.width = window.innerWidth * dpr;
  H = canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resize);
resize();

function rand(a,b){ return a + Math.random()*(b-a); }
function makePt(){
  const dpr = devicePixelRatio || 1;
  return {
    x: rand(0, W),
    y: rand(0, H),
    r: rand(0.8, 2.2) * dpr,
    vx: rand(-0.20, 0.25) * dpr,
    vy: rand(0.10, 0.35) * dpr,
    a: rand(0.10, 0.35),
  };
}
pts = Array.from({length: 70}, makePt);

function tickDust(){
  ctx.clearRect(0,0,W,H);
  for(const p of pts){
    p.x += p.vx;
    p.y += p.vy;

    if(p.y > H + 20) { p.y = -20; p.x = rand(0, W); }
    if(p.x < -20) p.x = W + 20;
    if(p.x > W + 20) p.x = -20;

    ctx.save();
    ctx.globalAlpha = p.a;
    const grad = ctx.createRadialGradient(p.x,p.y,p.r*0.1, p.x,p.y,p.r);
    grad.addColorStop(0, "rgba(244,226,198,.95)");
    grad.addColorStop(0.55, "rgba(203,176,138,.55)");
    grad.addColorStop(1, "rgba(203,176,138,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  requestAnimationFrame(tickDust);
}
tickDust();

// ===== GSAP animations =====
gsap.registerPlugin(ScrollTrigger);

// Nav + hero entrance
gsap.from(".nav", {y:-18, opacity:0, duration:.7, ease:"power3.out", delay:.08});
gsap.from(".heroCard", {y:18, opacity:0, duration:.9, ease:"power3.out", delay:.12});
gsap.from(".portrait", {y:22, opacity:0, duration:.9, ease:"power3.out", delay:.18});
gsap.to("#heroImg", {scale:1.02, duration: 8, ease:"sine.inOut", yoyo:true, repeat:-1});

// Reveal on scroll
document.querySelectorAll(".reveal").forEach((el)=>{
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: .85,
    ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 82%" }
  });
});

// Subtle parallax for portrait
gsap.to("#heroImg", {
  y: 18,
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
});

// Gallery hover micro-animation
document.querySelectorAll(".g").forEach((g)=>{
  g.addEventListener("mouseenter", ()=> gsap.to(g, {scale:1.01, duration:.25, ease:"power2.out"}));
  g.addEventListener("mouseleave", ()=> gsap.to(g, {scale:1.00, duration:.25, ease:"power2.out"}));
});

// ===== Countdown (flip + orbit ring) =====
// Set wedding date here (Asia/Manila)
const WEDDING_DATE = new Date("2026-07-23T15:30:00+08:00");

function pad2(n){ return String(n).padStart(2,"0"); }

function setFlip(unit, value){
  const el = document.querySelector(`.flip[data-unit="${unit}"]`);
  if(!el) return;
  const top = el.querySelector(".flipTop");
  const bottom = el.querySelector(".flipBottom");

  const current = top.textContent;
  const next = value;

  if(current === next) return;

  bottom.textContent = next;

  gsap.killTweensOf([top, bottom]);
  gsap.set(bottom, {opacity:0, y:10, filter:"blur(0px)"});
  gsap.to(top, {opacity:0, y:-10, duration:0.18, ease:"power2.in"});
  gsap.to(bottom, {
    opacity:1, y:0, duration:0.32, ease:"power3.out",
    onComplete: ()=>{
      top.textContent = next;
      gsap.set(top, {opacity:1, y:0});
      gsap.set(bottom, {opacity:0, y:10});
    }
  });

  // small glow pulse
  gsap.fromTo(el.querySelector(".flipBox"), {boxShadow:"inset 0 0 0 1px rgba(255,255,255,.04)"}, {
    boxShadow:"0 0 0 1px rgba(203,176,138,.22), 0 0 22px rgba(203,176,138,.22), inset 0 0 0 1px rgba(255,255,255,.04)",
    duration:0.35, ease:"power2.out", yoyo:true, repeat:1
  });
}

const ring = document.getElementById("ringProg");
const ringDot = document.getElementById("ringDot");
const countdownText = document.getElementById("countdownText");
const CIRC = 302; // dasharray in CSS
function setRingProgress(p){
  // p: 0..1
  const clamped = Math.max(0, Math.min(1, p));
  const offset = CIRC * (1 - clamped);
  ring.style.strokeDashoffset = offset.toFixed(2);

  // move dot along ring
  const angle = (-90 + clamped * 360) * (Math.PI/180);
  const cx = 60, cy = 60, r = 48;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  ringDot.setAttribute("cx", x.toFixed(2));
  ringDot.setAttribute("cy", y.toFixed(2));
}

let lastTick = "";
function updateCountdown(){
  const now = new Date();
  const diff = WEDDING_DATE - now;

  if(diff <= 0){
    setFlip("days", "00");
    setFlip("hours", "00");
    setFlip("mins", "00");
    setFlip("secs", "00");
    countdownText.textContent = "0";
    setRingProgress(1);
    return;
  }

  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff / (1000*60*60)) % 24);
  const mins = Math.floor((diff / (1000*60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  // only animate flip when changes (avoid constant tweens)
  const key = `${days}|${hours}|${mins}|${secs}`;
  if(key !== lastTick){
    setFlip("days", String(days));
    setFlip("hours", pad2(hours));
    setFlip("mins", pad2(mins));
    setFlip("secs", pad2(secs));
    countdownText.textContent = String(days);
    lastTick = key;
  }

  // ring progress based on seconds in current minute (non-boring subtle movement)
  const secProgress = (60 - secs) / 60; // 0..1
  setRingProgress(secProgress);
}
updateCountdown();
setInterval(updateCountdown, 1000);
