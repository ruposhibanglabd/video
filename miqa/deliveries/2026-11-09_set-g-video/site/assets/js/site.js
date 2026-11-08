/* Steel Night — product data + card slider + order form.
   Copy rules: only client-approved claims.
   butterfly lock · water resistant · quality: good · ৳850 · 1-year warranty ·
   colour guarantee · 7-day replacement. No "waterproof", no ATM rating. */

const PRICE = '৳৮৫০';
const PRICE_EN = 850;

const PRODUCTS = [
  {
    slug: 'set-g-01-black',
    bn: 'ব্ল্যাক নেভি',
    en: 'Black Navy',
    one: 'ব্ল্যাক কেস, ব্ল্যাক ব্রেসলেট, তার মধ্যে গাঢ় নেভি ডায়াল।',
    short: 'ব্ল্যাক কেস ও ব্ল্যাক ৫-লিংক ব্রেসলেট, গাঢ় নেভি ডায়াল। ফ্লুটেড রেজেল, বাটারফ্লাই লক।',
    detail: 'ব্ল্যাক নেভি হলো কালেকশনের সবচেয়ে ডার্ক ঘড়িটা। কেস আর ব্রেসলেট দুটোই ব্ল্যাক ফিনিশে — পলিশড আর ম্যাট লিংক পালা করে বসানো, তাই একদম ফ্ল্যাট কালো দেখায় না, আলো পড়লে লিংকের কিনারায় রেখা ফুটে ওঠে।\n\nডায়ালটা গাঢ় নেভি — প্রায় কালোর কাছাকাছি, কিন্তু আলোয় নীলচে আভা ছাড়ে। তার উপরে সোনালি XII আর VI, ঘণ্টা-চিহ্নে ছোট পাথর বসানো মার্কার, আর সোনালি হাতা — কালোর মধ্যে এই সোনালিটাই পুরো ঘড়িটার কনট্রাস্ট।\n\nরেজেলটা ফ্লুটেড: চারপাশে খাঁজকাটা খাঁজ। ৩টার ঘরে তারিখ, তার উপরে ম্যাগনিফায়ার। ব্রেসলেটে বাটারফ্লাই লক — দুই পাশ থেকে ভাঁজ হয়ে বন্ধ হয়।',
    forWhom: 'কালো/নেভি পোশাক, সাদা শার্ট — অফিস, রাতের অনুষ্ঠান, ট্রাভেল।',
    alt: 'ব্ল্যাক নেভি — ব্ল্যাক কেস ও ব্রেসলেট, গাঢ় নেভি ডায়ালের ছেলেদের হাতঘড়ি',
  },
  {
    slug: 'set-g-02-twotone-navy',
    bn: 'টু-টোন রয়্যাল ব্লু',
    en: 'Two-Tone Royal Blue',
    one: 'সিলভার কেসে গোল্ড রেজেল, গাঢ় নীল ডায়াল।',
    short: 'সিলভার-গোল্ড টু-টোন কেস ও ব্রেসলেট, রয়্যাল ব্লু ডায়াল। ফ্লুটেড রেজেল।',
    detail: 'টু-টোন রয়্যাল ব্লু হলো এই সেটের সবচেয়ে চেনা-জানা ক্লাসিক কম্বিনেশন। কেসের পাশ দুটো সিলভার, আর ফ্লুটেড রেজেলটা গোল্ড — এই দুই ধাতুর মিশ্রণেই ঘড়িটা একসাথে স্মার্ট আর উষ্ণ লাগে।\n\nব্রেসলেটেও একই খেলা: বাইরের লিংক সিলভার, মাঝের তিন লিংক গোল্ড। ফলে হাত নাড়ালে দুই রঙ পালা করে আলো ধরে।\n\nডায়ালটা রয়্যাল ব্লু সানবার্স্ট, সোনালি XII আর VI, পাথর বসানো মার্কার, সোনালি হাতা। ৩টার ঘরে তারিখ, ম্যাগনিফায়ার সহ। লক বাটারফ্লাই।',
    forWhom: 'নেভি/সাদা শার্ট, ধূসর স্যুট, ব্লেজার — অফিস, বিয়ে, ফরমাল ডিনার।',
    alt: 'টু-টোন রয়্যাল ব্লু — সিলভার-গোল্ড কেস ও ব্রেসলেট, নীল ডায়ালের ছেলেদের হাতঘড়ি',
  },
  {
    slug: 'set-g-03-twotone-slate',
    bn: 'টু-টোন স্লেট',
    en: 'Two-Tone Slate',
    one: 'সিলভার-গোল্ড কেসে ধূসর স্লেট ডায়াল, সবচেয়ে শান্ত লুক।',
    short: 'সিলভার-গোল্ড টু-টোন কেস, স্লেট-গ্রে ডায়াল ও গোল্ড মার্কার। ফ্লুটেড রেজেল।',
    detail: 'স্লেটটা এই কালেকশনের সবচেয়ে শান্ত ঘড়ি। কেস আর ব্রেসলেট সেই একই টু-টোন — সিলভার বাইরে, গোল্ড ভেতরে — কিন্তু ডায়ালটা ধূসর স্লেট, একটু ঠান্ডা, একটু ধাতব। নেভি ডায়ালের মতো চোখ টানে না, বরং পোশাকের সাথে মিশে যায়।\n\nআলোয় স্লেট ডায়ালে সূক্ষ্ম সানবার্স্ট। তার উপরে সোনালি XII ও VI, পাথর বসানো মার্কার আর সোনালি হাতা; গোল্ডের উষ্ণতা ধূসরের ঠান্ডাকে ভেঙে দেয়।\n\nফ্লুটেড রেজেল, ৫-লিংক জুবিলি ব্রেসলেট, ৩টার ঘরে তারিখ, বাটারফ্লাই লক, ওয়াটার রেজিস্ট্যান্ট।',
    forWhom: 'ধূসর/চারকোল স্যুট, সাদা শার্ট, নেভি ব্লেজার — অফিস, মিটিং, ইন্টারভিউ।',
    alt: 'টু-টোন স্লেট — ধূসর ডায়াল, সিলভার-গোল্ড কেসের ছেলেদের হাতঘড়ি',
  },
  {
    slug: 'set-g-04-gold-navy',
    bn: 'গোল্ড রয়্যাল ব্লু',
    en: 'Gold Royal Blue',
    one: 'ফুল গোল্ড কেস আর গাঢ় নীল ডায়াল, সবচেয়ে জমকালো লুক।',
    short: 'ফুল গোল্ড কেস ও গোল্ড ৫-লিংক ব্রেসলেট, রয়্যাল ব্লু ডায়াল। ফ্লুটেড রেজেল।',
    detail: 'গোল্ড রয়্যাল ব্লু হলো সেটের সবচেয়ে “গহনা” ঘড়িটা। কেস থেকে ব্রেসলেট — সবটাই গোল্ড টোনে, আর মাঝখানে গাঢ় নীল ডায়াল। নীল আর সোনালি এমন একটা জোড়া যা পুরোনো জমানার ঘড়িতেও ছিল, আজও একই রকম কাজ করে।\n\nব্রেসলেটের পাঁচ-লিংক গঠন এখানে সবচেয়ে ভালো বোঝা যায়: পলিশড মাঝের লিংক, ব্রাশড বাইরের লিংক — আলো পড়লে সোনালিতে দুই রকম টেক্সচার ফুটে ওঠে।\n\nডায়ালটা রয়্যাল ব্লু সানবার্স্ট, সোনালি XII ও VI, পাথর বসানো মার্কার। ফ্লুটেড রেজেল, বাটারফ্লাই লক, ওয়াটার রেজিস্ট্যান্ট, কোয়ালিটি Good।',
    forWhom: 'কালো/নেভি স্যুট, সাদা শেরওয়ানি — বিয়ে ও উৎসব।',
    alt: 'গোল্ড রয়্যাল ব্লু — ফুল গোল্ড কেস ও ব্রেসলেট, নীল ডায়ালের ছেলেদের হাতঘড়ি',
  },
  {
    slug: 'set-g-05-gold-champagne',
    bn: 'গোল্ড শ্যাম্পেন',
    en: 'Gold Champagne',
    one: 'ফুল গোল্ড কেসে শ্যাম্পেন ডায়াল, সবচেয়ে উষ্ণ ও হালকা।',
    short: 'ফুল গোল্ড কেস ও ব্রেসলেট, শ্যাম্পেন-গোল্ড ডায়াল। ফ্লুটেড রেজেল।',
    detail: 'গোল্ড শ্যাম্পেনটাই সেটের সবচেয়ে উষ্ণ ঘড়ি। কেস আর ব্রেসলেট গোল্ড, আর ডায়ালটাও গোল্ড — তবে নীল বা ধূসরের বদলে শ্যাম্পেন শেড, হালকা ক্রিম-সোনালি। ফলে পুরো ঘড়িটা এক রঙের ভেতরে থেকে গভীরতা তৈরি করে।\n\nডায়ালে সূক্ষ্ম সানবার্স্ট — আলো পড়লে মাঝ থেকে বাইরে রেখা ছড়ায়। XII আর VI, পাথর বসানো ঘণ্টা-মার্কার, হাতা — সবই গোল্ড টোনে; তাই ছবিতে দেখলে মনে হয় একটা গয়না, ঘড়ি নয়।\n\nফ্লুটেড রেজেল, ৫-লিংক জুবিলি ব্রেসলেট, ৩টার ঘরে তারিখ, বাটারফ্লাই লক, ওয়াটার রেজিস্ট্যান্ট, কোয়ালিটি Good, ১ বছরের ওয়ারেন্টি।',
    forWhom: 'ক্রিম/বেইজ পোশাক, ব্রাউন স্যুট — উৎসব ও বিয়ের অনুষ্ঠান।',
    alt: 'গোল্ড শ্যাম্পেন — ফুল গোল্ড কেস, শ্যাম্পেন ডায়ালের ছেলেদের হাতঘড়ি',
  },
];

const SHOTS = ['1_main', '2_angle', '3_dial', '4_bracelet', '5_wrist'];
const SHOT_LABEL = ['সামনে', 'অ্যাঙ্গেল', 'ডায়াল', 'ব্রেসলেট', 'হাতে'];

/* ────────────────────────────── cards */
function card(p, i, wide) {
  const imgs = SHOTS.map((s, k) =>
    `<img src="assets/img/${p.slug}_${s}.jpg" alt="${p.bn} — ${SHOT_LABEL[k]}" width="1600" height="1600" ${k === 0 ? 'class="on"' : ''} loading="${k === 0 ? 'eager' : 'lazy'}">`
  ).join('');
  const dots = SHOTS.map((_, k) => `<button aria-label="${SHOT_LABEL[k]}"${k === 0 ? ' class="on"' : ''}></button>`).join('');

  return `
  <article class="card reveal${wide ? ' wide' : ''}" data-slug="${p.slug}">
    <div class="slides" data-i="0">
      ${imgs}
      <button class="arrow prev" aria-label="আগের ছবি">‹</button>
      <button class="arrow next" aria-label="পরের ছবি">›</button>
      <div class="dots">${dots}</div>
    </div>
    <div class="card-body">
      <div class="card-top">
        <h3 class="card-name">${p.bn}</h3>
        <span class="card-price">${PRICE}</span>
      </div>
      <p class="card-short">${p.short}</p>
      <p class="card-detail">${p.detail.split('\n\n').map((t) => `<span>${t}</span>`).join('<br><br>')}</p>
      <div class="card-foot">
        <button class="toggle" type="button">বিস্তারিত বিবরণ</button>
        <a class="mini" href="#order" data-pick="${p.slug}">এই রঙে অর্ডার</a>
      </div>
    </div>
  </article>`;
}

const grid = document.getElementById('productGrid');
if (grid) {
  grid.innerHTML = PRODUCTS.map((p, i) => card(p, i, i === 4)).join('');
  // last card spans two columns on wide screens → 3 + 2 layout stays balanced
}

/* ────────────────────────────── sliders */
grid?.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;

  const slides = card.querySelector('.slides');
  if (e.target.closest('.arrow') || e.target.closest('.dots button')) {
    const total = SHOTS.length;
    let i = +slides.dataset.i;
    if (e.target.closest('.next')) i = (i + 1) % total;
    else if (e.target.closest('.prev')) i = (i - 1 + total) % total;
    else i = [...slides.querySelectorAll('.dots button')].indexOf(e.target);
    slides.dataset.i = i;
    slides.querySelectorAll('img').forEach((im, k) => im.classList.toggle('on', k === i));
    slides.querySelectorAll('.dots button').forEach((d, k) => d.classList.toggle('on', k === i));
    return;
  }

  if (e.target.closest('.toggle')) {
    card.classList.toggle('open');
    const btn = e.target.closest('.toggle');
    btn.textContent = card.classList.contains('open') ? 'বিস্তারিত লুকান' : 'বিস্তারিত বিবরণ';
  }
});

/* swipe on touch */
let sx = 0, sy = 0, moved = null;
grid?.addEventListener('touchstart', (e) => {
  sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  moved = e.target.closest('.slides');
}, { passive: true });

grid?.addEventListener('touchend', (e) => {
  if (!moved) return;
  const dx = e.changedTouches[0].clientX - sx;
  const dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
    const slides = moved;
    let i = +slides.dataset.i;
    const total = SHOTS.length;
    i = dx < 0 ? (i + 1) % total : (i - 1 + total) % total;
    slides.dataset.i = i;
    slides.querySelectorAll('img').forEach((im, k) => im.classList.toggle('on', k === i));
    slides.querySelectorAll('.dots button').forEach((d, k) => d.classList.toggle('on', k === i));
  }
  moved = null;
});

/* ────────────────────────────── revon scroll */
const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
  es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { rootMargin: '0px 0px -8% 0px' }) : null;

document.querySelectorAll('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));

/* ────────────────────────────── finish chips + order */
const chipBox = document.getElementById('finishChips');
const form = document.getElementById('orderForm');
let picked = PRODUCTS[0].slug;

if (chipBox) {
  chipBox.innerHTML = PRODUCTS.map((p) =>
    `<button type="button" data-slug="${p.slug}"${p.slug === picked ? ' class="on"' : ''}>${p.bn}</button>`
  ).join('');

  chipBox.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-slug]');
    if (!b) return;
    picked = b.dataset.slug;
    chipBox.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
  });
}

document.addEventListener('click', (e) => {
  const pick = e.target.closest('[data-pick]');
  if (!pick || !chipBox) return;
  picked = pick.dataset.pick;
  chipBox.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.slug === picked));
});

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.name?.trim() || !data.phone?.trim() || !data.address?.trim()) {
    form.querySelectorAll('input,textarea').forEach((el) => {
      el.style.borderColor = el.value.trim() ? '' : 'rgba(255,120,120,.65)';
    });
    return;
  }
  // no backend in this static build: hand the order to whatever the host wires up
  const order = { ...data, finish: picked, price: PRICE_EN, currency: 'BDT' };
  console.log('order', order);
  window.dispatchEvent(new CustomEvent('miqa:order', { detail: order }));
  document.getElementById('formOk').hidden = false;
  form.querySelectorAll('button,input,textarea').forEach((el) => (el.disabled = true));
  form.querySelector('.btn').textContent = 'অর্ডার গ্রহণ হয়েছে';
});

/* ────────────────────────────── footer colour list */
const footColours = document.getElementById('footColours');
if (footColours) {
  footColours.innerHTML = PRODUCTS.map(
    (p) => `<li><a href="#collection" data-pick="${p.slug}">${p.bn}</a></li>`
  ).join('');
}

/* ────────────────────────────── film player */
const film = document.getElementById('filmVideo');
const playBtn = document.getElementById('playBtn');
playBtn?.addEventListener('click', () => {
  film.muted = false;
  film.play();
  film.closest('.player').classList.add('playing');
});
film?.addEventListener('pause', () => film.closest('.player').classList.remove('playing'));
film?.addEventListener('click', () => {
  if (film.paused) { film.play(); film.closest('.player').classList.add('playing'); }
  else { film.pause(); }
});
