/* ==========================================================
   MATCHA ZEN · interactions
   ========================================================== */
(() => {
'use strict';

// Opening target. The deck says "Coming soon: Houston, TX" and the launch is December 2026.
// Change this one line when the exact opening day is set.
const OPEN_DATE = new Date('2026-12-01T00:00:00-06:00');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
let uid = 0;

/* ---------------- Logo: MΛTCHΛ©ZEN drawn from geometric strokes ---------------- */
const S = 17; // stroke weight on a 100-unit cap height
const LETTERS = {
  M: { w: 100, d: 'M8.5 140 L8.5 0 L50 72 L91.5 0 L91.5 140' },
  A: { w: 94, d: 'M-2 135 L47 -12 L96 135' },
  T: { w: 84, d: 'M-6 8.5 H90 M42 0 V140' },
  C: { w: 92, d: 'M80.2 21.8 A41.5 41.5 0 1 0 80.2 78.2' },
  H: { w: 84, d: 'M8.5 -30 V140 M75.5 -30 V140 M8.5 50 H75.5' },
  Z: { w: 84, d: 'M-4 8.5 H84 L6 91.5 H90' },
  E: { w: 72, d: 'M8.5 -30 V140 M8.5 8.5 H76 M8.5 50 H70 M8.5 91.5 H76' },
  N: { w: 88, d: 'M8.5 140 L8.5 0 L79.5 100 L79.5 -40' }
};
function logoSVG() {
  const seq = ['M', 'A', 'T', 'C', 'H', 'A', '©', 'Z', 'E', 'N'];
  let x = 0, g = '';
  const id = 'lgc' + (++uid);
  seq.forEach((ch, i) => {
    if (ch === '©') {
      g += `<g transform="translate(${x + 2} 0)"><g class="lg-letter" style="transition-delay:${i * 55}ms"><circle cx="13" cy="14" r="11" fill="none" stroke="currentColor" stroke-width="3.6"/><path d="M17.6 9.6 A6 6 0 1 0 17.6 18.4" fill="none" stroke="currentColor" stroke-width="3.2"/></g></g>`;
      x += 30; return;
    }
    const L = LETTERS[ch];
    g += `<g transform="translate(${x} 0)"><g class="lg-letter" style="transition-delay:${i * 55}ms"><path d="${L.d}" fill="none" stroke="currentColor" stroke-width="${S}" stroke-linejoin="miter" stroke-miterlimit="12"/></g></g>`;
    x += L.w + 9;
  });
  const W = x - 9;
  return { svg: `<svg viewBox="-4 0 ${W + 8} 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Matcha Zen"><defs><clipPath id="${id}"><rect x="-10" y="0" width="${W + 20}" height="100"/></clipPath></defs><g clip-path="url(#${id})">${g}</g></svg>`, w: W + 8 };
}
$$('[data-logo]').forEach(el => { el.innerHTML = logoSVG().svg; });
const heroLogo = $('.hero-logo .logo');
requestAnimationFrame(() => setTimeout(() => heroLogo && heroLogo.classList.add('is-in'), 150));

/* Mountain mark */
const MARK = '<svg viewBox="0 0 100 62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M50 0 C46 2 40 15 28 29 C19 39 9 46 2 51 C-1 53 0 56 4 57 C18 60 34 62 50 62 C66 62 82 60 96 57 C100 56 101 53 98 51 C91 46 81 39 72 29 C60 15 54 2 50 0Z"/></svg>';
$$('[data-mark]').forEach(el => { el.innerHTML = MARK; });

/* Favicon-like circular badge text */
const badge = $('.badge-spin');
if (badge) {
  badge.innerHTML = `<svg viewBox="0 0 150 150"><defs><path id="bc" d="M75 75 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0"/></defs><text fill="#F4F1EA" font-family="Figtree, sans-serif" font-weight="800" font-size="13.2" letter-spacing="3.2"><textPath href="#bc">COMING SOON ▲ HOUSTON TX ▲ DEC 2026 ▲</textPath></text></svg>`;
}

/* ---------------- Toast + confetti ---------------- */
const toastEl = $('[data-toast]');
let toastT;
function toast(msg) {
  toastEl.textContent = msg; toastEl.classList.add('is-on');
  clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2800);
}
function confetti(x, y, n = 60) {
  if (reduce) return;
  const colors = ['#56843A', '#C9DE7E', '#DEAA73', '#F4F1EA', '#154520', '#93B661'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    p.style.background = colors[i % colors.length];
    p.style.clipPath = 'polygon(50% 0, 100% 100%, 0 100%)';
    document.body.appendChild(p);
    const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 320;
    const dx = Math.cos(a) * v, dy = Math.sin(a) * v - 200;
    p.animate([
      { transform: `translate(${x}px, ${y}px) rotate(0)`, opacity: 1 },
      { transform: `translate(${x + dx}px, ${y + dy + 420}px) rotate(${Math.random() * 900 - 450}deg)`, opacity: 0 }
    ], { duration: 1300 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => p.remove();
  }
}

/* ---------------- Cursor ---------------- */
const cursor = $('.cursor');
if (fine && cursor && !reduce) {
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`; });
  (function loop() { rx = lerp(rx, mx, .18); ry = lerp(ry, my, .18); ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
  document.addEventListener('pointerover', e => { cursor.classList.toggle('is-hover', !!e.target.closest('a, button, .card, [data-tilt], .dna-card, .swatch, input, canvas')); });
  document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));
}

/* ---------------- Nav: progress, hide on scroll, active link, mobile ---------------- */
const nav = $('#nav'), bar = $('.progress span');
let lastY = scrollY;
function onScrollNav() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle('is-scrolled', y > 40);
  const menuOpen = $('.mobile-menu').classList.contains('is-open');
  nav.classList.toggle('is-hidden', !menuOpen && y > 500 && y > lastY + 4);
  if (y < lastY - 4) nav.classList.remove('is-hidden');
  lastY = y;
}
const links = $$('.nav-links a');
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['menu', 'build', 'whisk', 'cakes', 'space', 'visit'].forEach(id => { const s = document.getElementById(id); s && io.observe(s); });

const burger = $('.nav-burger'), mm = $('.mobile-menu');
burger.addEventListener('click', () => {
  const open = !mm.classList.contains('is-open');
  mm.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open); mm.setAttribute('aria-hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
});
$$('a', mm).forEach(a => a.addEventListener('click', () => { mm.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); mm.setAttribute('aria-hidden', true); document.body.style.overflow = ''; }));

/* ---------------- Reveal ---------------- */
$$('.reveal-words').forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w, i) => `<span class="w"><span style="transition-delay:${i * 45}ms">${w}</span></span>`).join(' ');
});
const rio = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('is-in'); rio.unobserve(en.target); }
}), { threshold: .2 });
$$('.reveal, .reveal-words').forEach(el => rio.observe(el));

/* "Not a tea shop" strike sequence */
const strikes = $$('[data-strike]'), finalLine = $('.nota-final');
const sio = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  strikes.forEach((li, i) => setTimeout(() => li.classList.add('is-struck'), 500 + i * 650));
  setTimeout(() => finalLine.classList.add('is-in'), 500 + strikes.length * 650);
  sio.disconnect();
}), { threshold: .45 });
sio.observe($('.nota'));

/* ---------------- Countdown ---------------- */
const cds = $$('[data-countdown]');
const prev = {};
function tickCountdown() {
  let diff = Math.max(0, OPEN_DATE - Date.now());
  const d = Math.floor(diff / 864e5); diff -= d * 864e5;
  const h = Math.floor(diff / 36e5); diff -= h * 36e5;
  const m = Math.floor(diff / 6e4); diff -= m * 6e4;
  const s = Math.floor(diff / 1e3);
  const vals = { d, h, m, s };
  cds.forEach((cd, ci) => Object.entries(vals).forEach(([k, v]) => {
    const el = $(`[data-cd="${k}"]`, cd), txt = String(v).padStart(2, '0');
    if (el.textContent !== txt) {
      el.textContent = txt;
      if (prev[ci + k] !== undefined && !reduce) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
      prev[ci + k] = txt;
    }
  }));
  if (OPEN_DATE - Date.now() <= 0) $$('.cd-label').forEach(l => l.textContent = "It's December. Doors open any day now.");
}
tickCountdown(); setInterval(tickCountdown, 1000);

/* ---------------- Hero parallax + stickers ---------------- */
const heroBg = $('.hero-bg'), stickers = $$('.sticker');
let pmx = 0, pmy = 0, tmx = 0, tmy = 0;
if (!reduce) {
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; });
}
const parallaxEls = $$('[data-parallax]');
function frame() {
  pmx = lerp(pmx, tmx, .06); pmy = lerp(pmy, tmy, .06);
  if (!reduce) {
    const y = scrollY;
    if (y < innerHeight * 1.2) {
      heroBg.style.transform = `translate3d(${pmx * -24}px, ${y * .28 + pmy * -18}px, 0) scale(1.04)`;
      stickers.forEach(s => { const dpt = +s.dataset.depth; s.style.transform = `translate3d(${pmx * dpt * 2}px, ${pmy * dpt * 2 - y * dpt * .02}px, 0)`; });
    }
    parallaxEls.forEach(el => {
      if (el === heroBg) return;
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - innerHeight / 2) * -.18}px, 0)`;
    });
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------------- Marquees + reels (scroll-velocity boosted) ---------------- */
let vel = 0, lastScroll = scrollY;
addEventListener('scroll', () => { vel = clamp(scrollY - lastScroll, -60, 60); lastScroll = scrollY; onScrollNav(); onScrollHS(); }, { passive: true });
const loops = [];
$$('[data-marquee] .marquee-track').forEach((t, i) => loops.push({ t, x: 0, speed: i % 2 ? -.6 : .8 }));
$$('[data-reel]').forEach(r => {
  const t = $('.reel-track', r);
  t.innerHTML += t.innerHTML; // duplicate for seamless loop
  const lp = { t, x: 0, speed: r.classList.contains('reel-rev') ? -.5 : .5, paused: false };
  r.addEventListener('pointerenter', () => lp.paused = true);
  r.addEventListener('pointerleave', () => lp.paused = false);
  loops.push(lp);
});
function runLoops() {
  vel *= .92;
  loops.forEach(l => {
    if (reduce) return;
    const half = l.t.scrollWidth / 2;
    if (!half) return;
    const boost = 1 + Math.abs(vel) * .12;
    const dir = vel < -1 ? -1 : 1;
    l.x -= l.paused ? 0 : l.speed * boost * dir;
    if (l.x <= -half) l.x += half;
    if (l.x > 0) l.x -= half;
    l.t.style.transform = `translate3d(${l.x}px,0,0)`;
  });
  requestAnimationFrame(runLoops);
}
requestAnimationFrame(runLoops);

/* ---------------- Magnetic buttons + tilt ---------------- */
if (fine && !reduce) {
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
  $$('[data-tilt]').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
  });
}

/* ---------------- Cup illustration ---------------- */
function cupSVG({ layers, top = 'none', topColor, ice = 2, dust = false, fizz = false, w = 140 }) {
  const id = 'cup' + (++uid);
  const cupPath = 'M18 70 L32 211 Q33 220 42 220 L98 220 Q107 220 108 211 L122 70 Z';
  const fillTop = top === 'whip' || top === 'gelato' ? 76 : 84;
  const total = 220 - fillTop;
  // Draw from the top layer down so lower layers sit over upper ones with a wavy seam
  let y = 220, seams = [];
  layers.forEach(L => { const h = L.h * total; seams.push({ c: L.c, top: y - h }); y -= h; });
  let liquid = '';
  for (let i = seams.length - 1; i >= 0; i--) {
    const t = seams[i].top, amp = i === seams.length - 1 ? 1.5 : 4;
    liquid += `<path fill="${seams[i].c}" d="M10 ${t} Q30 ${t - amp} 50 ${t} T90 ${t} T130 ${t} V230 H10 Z"/>`;
  }
  let iceSvg = '';
  const cubes = [[40, 92, -12], [72, 98, 9], [92, 86, -4], [56, 118, 20], [86, 124, -16]].slice(0, ice === 0 ? 0 : ice === 1 ? 2 : 5);
  cubes.forEach(([x, yy, r]) => { iceSvg += `<rect x="${x}" y="${yy}" width="20" height="20" rx="4" transform="rotate(${r} ${x + 10} ${yy + 10})" fill="rgba(255,255,255,.28)" stroke="rgba(255,255,255,.55)" stroke-width="1"/>`; });
  let bubbles = '';
  if (fizz) for (let i = 0; i < 18; i++) { const bx = 34 + ((i * 37) % 72), by = 120 + ((i * 53) % 92), br = 1.2 + (i % 3); bubbles += `<circle cx="${bx}" cy="${by}" r="${br}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1"/>`; }
  let topper = '';
  if (top === 'whip') {
    topper = `<g><path d="M22 72 Q20 56 40 56 Q38 40 58 42 Q60 26 72 24 Q86 24 84 40 Q104 38 102 54 Q122 54 118 72 Z" fill="#FBF7EE" stroke="#E6DDCB" stroke-width="1.5"/>
      <path d="M40 56 Q56 62 70 56 M58 42 Q70 48 84 40 M30 66 Q60 72 110 64" fill="none" stroke="#E6DDCB" stroke-width="1.5"/></g>`;
    if (dust) for (let i = 0; i < 26; i++) topper += `<circle cx="${34 + ((i * 41) % 74)}" cy="${30 + ((i * 29) % 38)}" r="${.8 + (i % 3) * .5}" fill="#56843A" opacity=".85"/>`;
  } else if (top === 'gelato') {
    const c = topColor || '#93B85A';
    topper = `<g><circle cx="70" cy="48" r="34" fill="${c}"/><path d="M36 58 Q44 72 52 64 Q60 76 70 66 Q80 78 88 64 Q98 74 104 58 L104 52 L36 52 Z" fill="${c}"/>
      <circle cx="70" cy="48" r="34" fill="url(#${id}sh)"/><circle cx="58" cy="34" r="7" fill="rgba(255,255,255,.35)"/>
      <circle cx="80" cy="40" r="1.4" fill="rgba(0,0,0,.18)"/><circle cx="66" cy="56" r="1.2" fill="rgba(0,0,0,.18)"/><circle cx="86" cy="58" r="1.4" fill="rgba(0,0,0,.15)"/></g>`;
  } else if (dust) {
    for (let i = 0; i < 22; i++) topper += `<circle cx="${30 + ((i * 41) % 80)}" cy="${82 + ((i * 7) % 6)}" r="${.8 + (i % 3) * .4}" fill="#4B7A2E" opacity=".9"/>`;
  }
  return `<svg viewBox="0 0 140 230" width="${w}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <clipPath id="${id}c"><path d="${cupPath}"/></clipPath>
      <filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>
      <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".12" stop-color="#fff" stop-opacity=".35"/><stop offset=".22" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
      <radialGradient id="${id}sh" cx=".35" cy=".3" r=".8"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
    </defs>
    <g clip-path="url(#${id}c)">
      <rect x="0" y="0" width="140" height="230" fill="rgba(255,255,255,.07)"/>
      <g filter="url(#${id}b)">${liquid}</g>
      ${iceSvg}${bubbles}
      <rect x="0" y="0" width="140" height="230" fill="url(#${id}g)"/>
    </g>
    <path d="${cupPath}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>
    <ellipse cx="70" cy="70" rx="52" ry="3.5" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2"/>
    <text x="70" y="150" text-anchor="middle" font-family="Figtree, sans-serif" font-weight="800" font-size="10.5" letter-spacing=".6" fill="#1C1C1C" opacity=".82">MΛTCHΛ·ZEN</text>
    <path transform="translate(62 192) scale(.16)" fill="#1C1C1C" opacity=".85" d="M50 0 C46 2 40 15 28 29 C19 39 9 46 2 51 C-1 53 0 56 4 57 C18 60 34 62 50 62 C66 62 82 60 96 57 C100 56 101 53 98 51 C91 46 81 39 72 29 C60 15 54 2 50 0Z"/>
    ${topper}
  </svg>`;
}

/* ---------------- Menu tabs ---------------- */
const tabs = $$('.tab'), ink = $('.tab-ink');
function moveInk(t) { ink.style.width = t.offsetWidth + 'px'; ink.style.height = t.offsetHeight + 'px'; ink.style.transform = `translate(${t.offsetLeft - 6}px, ${t.offsetTop - 6}px)`; }
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', x === t); });
  $$('.panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === t.dataset.tab));
  moveInk(t);
}));
addEventListener('resize', () => moveInk($('.tab.is-active')));
moveInk($('.tab.is-active'));
$$('.card.flip').forEach(c => c.addEventListener('click', e => { if (!e.target.closest('a')) c.classList.toggle('is-flipped'); }));

/* ---------------- Drinks shelf (names from the deck menu) ---------------- */
const DRINKS = [
  { n: 'Signature Matcha Latte', l: [['#F2EFE6', .55], ['#5E8E35', .45]], ice: 2, d: 'Ceremonial-grade organic matcha poured over cold milk. Clean, creamy, and the one every ritual starts with.', t: ['Iced', 'Signature', 'Organic'] },
  { n: 'Whipped Matcha Einspanner', l: [['#93B661', 1]], top: 'whip', dust: true, ice: 1, d: 'Velvety iced matcha under a thick crown of whipped cream, finished with a dusting of matcha.', t: ['Whipped', 'Rich', 'Fan favorite'] },
  { n: 'Dirty Matcha Cold Foam', l: [['#EFE9DE', .42], ['#6B4A2E', .24], ['#A9C46E', .34]], dust: true, ice: 2, d: 'Matcha meets espresso. Cold milk, a shot of coffee and a matcha cold foam on top.', t: ['Matcha + coffee', 'Cold foam'] },
  { n: 'Coconut Matcha Cloud', l: [['#F7F5EF', .5], ['#7FA650', .3], ['#FFFFFF', .2]], ice: 2, d: 'Coconut, matcha and a soft cloud on top. Light, a little tropical, very dreamy.', t: ['Coconut', 'Cloud foam'] },
  { n: 'White Champaca Matcha', l: [['#FAF5E4', .55], ['#A3C06C', .45]], ice: 2, d: 'Matcha with floral white champaca notes over milk. Soft and fragrant.', t: ['Floral', 'Iced'] },
  { n: 'Coconut Matcha Cold Foam', l: [['#F4F1EA', .45], ['#6E9B3E', .35], ['#FBFAF5', .2]], ice: 2, d: 'Coconut base, matcha middle, cold foam top. Three layers, one sip.', t: ['Coconut', 'Cold foam'] },
  { n: 'Jasmine Matcha', l: [['#EEF0DA', .5], ['#7FA650', .5]], ice: 2, d: 'Jasmine-scented matcha over milk. Floral, calm and a little bit fancy.', t: ['Floral', 'Calm'] },
  { n: 'Apple Matcha Cold Foam', l: [['#F1C4CB', .5], ['#7FA650', .3], ['#FBF6F2', .2]], ice: 2, d: 'A pink apple base under bright matcha and silky cold foam. Sweet, tart, very pink.', t: ['Fruity', 'Cold foam'] },
  { n: 'Whipped Vanilla Matcha', l: [['#F4EEDD', .5], ['#8DB25A', .5]], top: 'whip', dust: true, ice: 1, d: 'Vanilla-kissed matcha with whipped cream on top. Basically dessert in a cup.', t: ['Vanilla', 'Whipped'] },
  { n: 'Lemonade Matcha Fizz', l: [['#F3E08E', .55], ['#5E8E35', .45]], fizz: true, ice: 2, d: 'Lemonade below, matcha above, bubbles all through. Bright, fizzy and made for Texas heat.', t: ['Sparkling', 'Citrus'] }
];
const shelf = $('[data-drinks]'), dd = $('[data-drink-detail]');
DRINKS.forEach((dr, i) => {
  const b = document.createElement('button');
  b.className = 'drink' + (i === 0 ? ' is-active' : '');
  b.setAttribute('aria-label', dr.n);
  b.innerHTML = cupSVG({ layers: dr.l.map(([c, h]) => ({ c, h })), top: dr.top, dust: dr.dust, fizz: dr.fizz, ice: dr.ice }) + `<span>${dr.n}</span>`;
  b.addEventListener('click', () => selectDrink(i, b));
  b.addEventListener('pointerenter', () => fine && selectDrink(i, b));
  shelf.appendChild(b);
});
function selectDrink(i, b) {
  const dr = DRINKS[i];
  if ($('[data-dd-name]').textContent === dr.n) return;
  $$('.drink', shelf).forEach(x => x.classList.toggle('is-active', x === b));
  $('[data-dd-name]').textContent = dr.n;
  $('[data-dd-desc]').textContent = dr.d;
  $('[data-dd-tags]').innerHTML = dr.t.map(t => `<span class="chip">${t}</span>`).join('');
  dd.classList.remove('swap'); void dd.offsetWidth; dd.classList.add('swap');
}
$('[data-dd-desc]').textContent = DRINKS[0].d;
$('[data-dd-tags]').innerHTML = DRINKS[0].t.map(t => `<span class="chip">${t}</span>`).join('');

/* ---------------- Build your cup ---------------- */
const OPTS = {
  base: [
    { k: 'ceremonial', n: 'Ceremonial', c: '#5E8E35' },
    { k: 'jasmine', n: 'Jasmine', c: '#7FA650' },
    { k: 'champaca', n: 'White Champaca', c: '#A3C06C' },
    { k: 'dirty', n: 'Dirty (+ espresso)', c: '#6B4A2E' }
  ],
  milk: [
    { k: 'oat', n: 'Oat', c: '#EADFC8' },
    { k: 'whole', n: 'Whole milk', c: '#F6F3EA' },
    { k: 'coconut', n: 'Coconut', c: '#FBFAF5' },
    { k: 'apple', n: 'Apple', c: '#F1C4CB' },
    { k: 'lemonade', n: 'Lemonade', c: '#F3E08E' }
  ],
  top: [
    { k: 'none', n: 'Keep it clean', c: 'transparent' },
    { k: 'foam', n: 'Cold foam', c: '#FBF8F1' },
    { k: 'whip', n: 'Whipped cream', c: '#FFFDF7' },
    { k: 'gm', n: 'Matcha gelato scoop', c: '#93B85A' },
    { k: 'gv', n: 'Vanilla gelato scoop', c: '#F5EEDC' }
  ]
};
const state = { base: 'ceremonial', milk: 'oat', top: 'gm', sweet: 50, ice: 2 };
const NAMES = ['Zen Mode', 'Soft Launch', 'Green Flag', 'Main Character', 'Touch Grass', 'Slow Morning', 'Cloud Nine', 'Little Treat', 'Ritual Era', 'Calm Chaos', 'Matcha Moment', 'Quiet Luxury', 'Big Green Energy', 'Sip Happens', 'Whisk Taker', 'Gelato Glow'];
const ICE = ['No ice', 'Light', 'Regular'];
$$('.opt').forEach(fs => {
  const key = fs.dataset.opt, row = $('.opt-row', fs);
  OPTS[key].forEach(o => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'opt-btn'; b.dataset.k = o.k;
    b.innerHTML = `<i style="background:${o.c};${o.c === 'transparent' ? 'box-shadow:inset 0 0 0 2px rgba(244,241,234,.5)' : ''}"></i>${o.n}`;
    b.addEventListener('click', () => { state[key] = o.k; renderBuild(true); });
    row.appendChild(b);
  });
});
$$('[data-range]').forEach(r => r.addEventListener('input', () => { state[r.dataset.range] = +r.value; renderBuild(true); }));
function buildSpec() {
  const base = OPTS.base.find(o => o.k === state.base), milk = OPTS.milk.find(o => o.k === state.milk), top = OPTS.top.find(o => o.k === state.top);
  const layers = [{ c: milk.c, h: .5 }];
  if (base.k === 'dirty') { layers.push({ c: '#6B4A2E', h: .2 }); layers.push({ c: '#5E8E35', h: .3 }); }
  else layers.push({ c: base.c, h: .5 });
  if (top.k === 'foam') { layers[layers.length - 1].h -= .2; layers.push({ c: top.c, h: .2 }); }
  return {
    base, milk, top,
    cup: { layers, ice: state.ice, top: top.k === 'whip' ? 'whip' : top.k.startsWith('g') ? 'gelato' : 'none', topColor: top.c, dust: top.k === 'whip', fizz: milk.k === 'lemonade' }
  };
}
function buildName() {
  const key = state.base + state.milk + state.top + state.sweet + state.ice;
  let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return NAMES[h % NAMES.length];
}
function buildDesc(sp) {
  const ice = state.ice === 0 ? '' : 'Iced ';
  const base = sp.base.k === 'dirty' ? 'Dirty Matcha' : sp.base.n + ' Matcha';
  const topTxt = sp.top.k === 'none' ? '' : ' + ' + sp.top.n.toLowerCase();
  return `${ice}${base} on ${sp.milk.n.toLowerCase()}${topTxt} · ${state.sweet}% sweet · ${ICE[state.ice].toLowerCase()}`;
}
const cupBox = $('[data-build-cup]');
function renderBuild(animate) {
  const sp = buildSpec();
  cupBox.innerHTML = cupSVG({ ...sp.cup, w: 300 });
  $$('.opt').forEach(fs => $$('.opt-btn', fs).forEach(b => b.setAttribute('aria-pressed', b.dataset.k === state[fs.dataset.opt])));
  $('[data-build-title]').textContent = buildName();
  $('[data-build-desc]').textContent = buildDesc(sp);
  $('[data-out="sweet"]').textContent = state.sweet + '%';
  $('[data-out="ice"]').textContent = ICE[state.ice];
  $('[data-range="sweet"]').value = state.sweet; $('[data-range="ice"]').value = state.ice;
  if (animate && !reduce) { cupBox.classList.remove('pop'); void cupBox.offsetWidth; cupBox.classList.add('pop'); }
}
renderBuild(false);
$('[data-shuffle]').addEventListener('click', e => {
  const pick = a => a[Math.floor(Math.random() * a.length)].k;
  state.base = pick(OPTS.base); state.milk = pick(OPTS.milk); state.top = pick(OPTS.top);
  state.sweet = [0, 25, 50, 75, 100][Math.floor(Math.random() * 5)]; state.ice = Math.floor(Math.random() * 3);
  renderBuild(true);
  const r = cupBox.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 3, 34);
});
$('[data-save]').addEventListener('click', async () => {
  try {
    await document.fonts.ready;
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1d5a2b'); g.addColorStop(1, '#154520');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(201,222,126,.25)'; x.beginPath(); x.arc(W / 2, 600, 380, 0, Math.PI * 2); x.fill();
    const toImg = svg => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
    const sp = buildSpec();
    const cupImg = await toImg(cupSVG({ ...sp.cup, w: 420 }).replace('<svg ', '<svg height="690" '));
    x.drawImage(cupImg, W / 2 - 210, 230, 420, 690);
    const lg = logoSVG();
    const logoImg = await toImg(lg.svg.replace('<svg ', `<svg width="${lg.w}" height="100" style="color:#F4F1EA" `).replace(/currentColor/g, '#F4F1EA'));
    const lw = 560, lh = lw * 100 / lg.w; x.drawImage(logoImg, W / 2 - lw / 2, 90, lw, lh);
    x.textAlign = 'center'; x.fillStyle = '#C9DE7E';
    x.font = '800 30px Figtree, sans-serif'; x.fillText('MY RITUAL', W / 2, 1010);
    x.fillStyle = '#F4F1EA'; x.font = '900 84px Figtree, sans-serif'; x.fillText(buildName().toUpperCase(), W / 2, 1100);
    x.font = '500 32px Figtree, sans-serif'; x.globalAlpha = .85; x.fillText(buildDesc(sp), W / 2, 1160); x.globalAlpha = 1;
    x.fillStyle = '#C9DE7E'; x.font = '800 26px Figtree, sans-serif'; x.fillText('OPENING DECEMBER 2026 · HOUSTON, TX · @MATCHAZENHOUSE', W / 2, 1270);
    const a = document.createElement('a'); a.download = 'my-matcha-zen-ritual.png'; a.href = c.toDataURL('image/png'); a.click();
    toast('Saved! Show it to us on opening day 💚');
  } catch (err) { console.error(err); toast('Could not save the image on this browser. Try a screenshot!'); }
});

/* ---------------- Whisk mini-game ---------------- */
(function whisk() {
  const cv = $('[data-whisk]'); if (!cv) return;
  const x = cv.getContext('2d'), W = cv.width, C = W / 2, R = 200;
  const meterEl = $('[data-meter]'), pctEl = $('[data-meter-pct]'), msgEl = $('[data-meter-msg]'), hint = $('[data-whisk-hint]');
  let froth = 0, down = false, px = C, py = C, wx = C + 120, wy = C + 60, lastDx = 0, done = false, visible = false, raf = 0;
  const foam = [];
  const specks = Array.from({ length: 420 }, () => { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (R - 6); return [C + Math.cos(a) * r, C + Math.sin(a) * r, .6 + Math.random() * 2.2]; });
  const MSG = [[0, 'Start whisking →'], [.15, 'Nice wrist.'], [.4, 'Getting frothy…'], [.7, 'Almost zen…'], [.92, 'So close!']];
  function mix(a, b, t) { const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16)); return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(',')})`; }
  function draw() {
    x.clearRect(0, 0, W, W);
    // bowl
    let g = x.createRadialGradient(C - 60, C - 80, 40, C, C, 270);
    g.addColorStop(0, '#3a3a38'); g.addColorStop(1, '#121211');
    x.fillStyle = g; x.beginPath(); x.arc(C, C, 262, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 3; x.beginPath(); x.arc(C, C, 252, 0, Math.PI * 2); x.stroke();
    // matcha
    const f = clamp(froth, 0, 1);
    g = x.createRadialGradient(C - 40, C - 50, 20, C, C, R);
    g.addColorStop(0, mix('4E7F2C', 'C4DC8A', f)); g.addColorStop(1, mix('2F5A1C', '9DBE62', f));
    x.fillStyle = g; x.beginPath(); x.arc(C, C, R, 0, Math.PI * 2); x.fill();
    // micro-foam specks grow with froth
    x.fillStyle = `rgba(236,244,206,${.15 + f * .6})`;
    const n = Math.floor(specks.length * f);
    for (let i = 0; i < n; i++) { const s = specks[i]; x.beginPath(); x.arc(s[0], s[1], s[2], 0, Math.PI * 2); x.fill(); }
    // fresh bubbles
    for (let i = foam.length - 1; i >= 0; i--) {
      const b = foam[i]; b.life -= .012;
      if (b.life <= 0) { foam.splice(i, 1); continue; }
      x.strokeStyle = `rgba(245,250,225,${b.life * .8})`; x.lineWidth = 1.2;
      x.beginPath(); x.arc(b.x, b.y, b.r, 0, Math.PI * 2); x.stroke();
    }
    // rim shine
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 8; x.beginPath(); x.arc(C, C, R + 4, 0, Math.PI * 2); x.stroke();
    // whisk (top-down chasen)
    wx = lerp(wx, down ? px : wx, .5); wy = lerp(wy, down ? py : wy, .5);
    x.save(); x.translate(wx, wy);
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; x.strokeStyle = i % 2 ? '#C9A86A' : '#B8945A'; x.lineWidth = 2; x.beginPath(); x.moveTo(Math.cos(a) * 10, Math.sin(a) * 10); x.lineTo(Math.cos(a) * 38, Math.sin(a) * 38); x.stroke(); }
    x.fillStyle = '#D8BC84'; x.beginPath(); x.arc(0, 0, 13, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#A9874F'; x.beginPath(); x.arc(0, 0, 6, 0, Math.PI * 2); x.fill();
    x.restore();
    if (visible) raf = requestAnimationFrame(draw);
  }
  function pos(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * W / r.height]; }
  cv.addEventListener('pointerdown', e => { down = true; cv.setPointerCapture(e.pointerId); [px, py] = pos(e); hint.style.opacity = 0; });
  addEventListener('pointerup', () => { down = false; });
  cv.addEventListener('pointermove', e => {
    if (!down) return;
    const [nx, ny] = pos(e);
    const dx = nx - px, dy = ny - py; px = nx; py = ny;
    const inBowl = Math.hypot(px - C, py - C) < R;
    if (!inBowl || done) return;
    const sp = Math.min(Math.hypot(dx, dy), 50);
    const flip = Math.sign(dx) !== Math.sign(lastDx) && Math.abs(dx) > 2;
    if (Math.abs(dx) > 2) lastDx = dx;
    froth += sp * (flip ? .0016 : .00075);
    if (Math.random() < .7) foam.push({ x: px + (Math.random() - .5) * 50, y: py + (Math.random() - .5) * 50, r: 2 + Math.random() * 5, life: 1 });
    update();
  });
  function update() {
    const f = clamp(froth, 0, 1), p = Math.round(f * 100);
    meterEl.style.width = p + '%'; pctEl.textContent = p + '%';
    if (f >= 1 && !done) {
      done = true; msgEl.textContent = "Perfect froth. That's the Ritual of Cha.";
      const r = cv.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, 90); toast('You whisked it! 🍵 See you in December.');
    } else if (!done) { msgEl.textContent = MSG.filter(m => f >= m[0]).pop()[1]; }
  }
  $('[data-whisk-reset]').addEventListener('click', () => { froth = 0; done = false; foam.length = 0; hint.style.opacity = 1; update(); });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; cancelAnimationFrame(raf); if (visible) raf = requestAnimationFrame(draw); }).observe(cv);
  draw();
})();

/* ---------------- Gelato cake picker ---------------- */
const CAKES = [
  { n: 'Matcha', c: '#8FA544', bg: 'assets/img/texture.jpg', d: 'Velvet matcha shell, matcha gelato center, cocoa crumb base. The core classic.' },
  { n: 'Ocean', c: '#2D78BE', bg: 'assets/img/tex-blue.jpg', d: 'Bold blue velvet over a matcha gelato heart. The one everyone photographs.' },
  { n: 'Guava', c: '#E07463', bg: 'assets/img/tex-guava.jpg', d: 'Seasonal pink guava velvet. Bright, tropical and made for birthdays.' },
  { n: 'Citrus', c: '#F2A31B', bg: 'assets/img/tex-orange.jpg', d: 'Seasonal sunny citrus velvet for celebrations that need a little glow.' },
  { n: 'Cocoa', c: '#6A3E2B', bg: 'assets/img/tex-choc.jpg', d: 'Deep chocolate velvet. Rich, moody and very giftable.' },
  { n: 'Ruby', c: '#BE2830', bg: 'assets/img/tex-guava.jpg', d: 'Ruby red velvet finish. For the big days and the big reveals.' }
];
function cakeSVG(color) {
  const lg = logoSVG();
  const inner = lg.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/currentColor/g, 'rgba(0,0,0,.28)').replace(/id="lgc(\d+)"/, 'id="ck$1"').replace(/url\(#lgc(\d+)\)/, 'url(#ck$1)');
  const sc = 230 / lg.w;
  return `<svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="ckShade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset=".35" stop-color="#fff" stop-opacity=".08"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
      <filter id="ckVelvet"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .22"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/><feBlend in2="SourceGraphic" mode="multiply"/></filter>
    </defs>
    <ellipse cx="200" cy="292" rx="190" ry="40" fill="#0e0e0d" opacity=".55"/>
    <ellipse cx="200" cy="282" rx="178" ry="38" fill="#2a2a29"/>
    <path d="M40 228 V262 A160 30 0 0 0 360 262 V228 Z" fill="#2B1B12"/>
    <path d="M40 228 V262 A160 30 0 0 0 360 262 V228 Z" fill="url(#ckShade)"/>
    <g filter="url(#ckVelvet)">
      <path class="cake-body" d="M40 112 V228 A160 30 0 0 0 360 228 V112 Z" fill="${color}"/>
      <ellipse class="cake-body" cx="200" cy="112" rx="160" ry="42" fill="${color}"/>
    </g>
    <path d="M40 112 V228 A160 30 0 0 0 360 228 V112 Z" fill="url(#ckShade)"/>
    <ellipse cx="200" cy="112" rx="160" ry="42" fill="#fff" opacity=".1"/>
    <g transform="translate(${200 - 115} 103) scale(${sc} ${sc * .32}) skewX(-8)">${inner}</g>
  </svg>`;
}
const cakeEl = $('[data-cake]'), cakeBg = $('[data-cake-bg]'), swWrap = $('[data-swatches]');
CAKES.forEach((ck, i) => {
  const b = document.createElement('button');
  b.className = 'swatch'; b.style.background = ck.c; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', ck.n); b.setAttribute('aria-checked', i === 0);
  b.addEventListener('click', () => setCake(i));
  swWrap.appendChild(b);
  const pre = new Image(); pre.src = ck.bg;
});
function setCake(i) {
  const ck = CAKES[i];
  $$('.swatch', swWrap).forEach((s, j) => s.setAttribute('aria-checked', i === j));
  $$('.cake-body', cakeEl).forEach(p => p.setAttribute('fill', ck.c));
  $('[data-cake-name]').textContent = ck.n;
  $('[data-cake-desc]').textContent = ck.d;
  cakeBg.style.backgroundImage = `url(${ck.bg})`;
  if (!reduce) { cakeEl.classList.remove('bounce'); void cakeEl.offsetWidth; cakeEl.classList.add('bounce'); }
}
cakeEl.innerHTML = cakeSVG(CAKES[0].c);
setCake(0);

/* ---------------- DNA accordion ---------------- */
const dnaCards = $$('.dna-card');
dnaCards.forEach(c => {
  const open = () => dnaCards.forEach(x => x.classList.toggle('is-open', x === c));
  c.addEventListener('click', open); c.addEventListener('focus', open);
  if (fine) c.addEventListener('pointerenter', open);
});

/* ---------------- Horizontal scroll section ---------------- */
const hsSec = $('.visit-steps'), hsTrack = $('[data-hs]'), hsBar = $('[data-hs-bar]');
let hsDist = 0;
function sizeHS() {
  hsDist = Math.max(0, hsTrack.scrollWidth - innerWidth);
  hsSec.style.height = (innerHeight + hsDist) + 'px';
  onScrollHS();
}
function onScrollHS() {
  const r = hsSec.getBoundingClientRect();
  const p = clamp(-r.top / Math.max(1, hsDist), 0, 1);
  hsTrack.style.transform = `translate3d(${-p * hsDist}px,0,0)`;
  hsBar.style.transform = `scaleX(${p})`;
}
addEventListener('resize', sizeHS);
addEventListener('load', sizeHS);
sizeHS();

/* ---------------- Add to calendar (.ics) ---------------- */
$('[data-ics]').addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Matcha Zen//Opening//EN', 'BEGIN:VEVENT',
    'UID:matchazen-opening-2026@matchazen', 'DTSTAMP:20261101T000000Z',
    'DTSTART;VALUE=DATE:20261201', 'DTEND;VALUE=DATE:20261202',
    'SUMMARY:Matcha Zen opens this December (Houston\\, TX)',
    'DESCRIPTION:Our first matcha ritual house opens in Houston this December. Follow @matchazenhouse on Instagram for the exact day.',
    'LOCATION:Houston\\, TX', 'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'matcha-zen-opening.ics'; a.click();
  toast('Reminder saved for December 1 🍵');
});

onScrollNav();
})();
