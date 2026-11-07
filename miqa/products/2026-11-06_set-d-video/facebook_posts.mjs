/**
 * Facebook posts for the two finished videos — set D "Velora" and set C
 * "Octavia". Both use the video's own look (wine-plum / rosewood, warm candle
 * key, gold type) so the post and the reel read as one campaign.
 *
 * Output per set: 1080x1350 (feed 4:5), 1080x1080 (square), 1080x1920 (story).
 * Rules: price + the client's own feature words only, no URL / phone / discount.
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Bold.ttf`, 'HindB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');

const cream = '#FDF1E7';

function gold(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  return g;
}
const GOLD_D = [[0, '#C79E5E'], [0.34, '#F6E3B8'], [0.62, '#DDB877'], [1, '#B98B4A']];
const GOLD_C = [[0, '#D9A276'], [0.33, '#FBE7CE'], [0.62, '#EBC59B'], [1, '#C08F63']];

function shadow(ctx, blur, a = 0.6, y = 6) {
  ctx.shadowColor = `rgba(18,4,8,${a})`;
  ctx.shadowBlur = blur; ctx.shadowOffsetY = y; ctx.shadowOffsetX = 0;
}
function noShadow(ctx) {
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
}
function text(ctx, s, x, y, font, fill, blur = 30) {
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (blur) shadow(ctx, blur);
  ctx.fillStyle = fill; ctx.fillText(s, x, y); noShadow(ctx);
}
function spaced(ctx, s, x, y, font, fill, gap, blur = 20) {
  ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const chars = [...s];
  const ws = chars.map(c => ctx.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let cx = x - total / 2;
  if (blur) shadow(ctx, blur, 0.55, 4);
  ctx.fillStyle = fill;
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + gap; });
  noShadow(ctx);
}
function rule(ctx, cx, y, w, a = 0.75, th = 2.5) {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, `rgba(227,196,137,0)`);
  g.addColorStop(0.5, `rgba(227,196,137,${a})`);
  g.addColorStop(1, `rgba(227,196,137,0)`);
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, y, w, th);
}
function pill(ctx, cx, cy, w, h, r, fill) {
  const x = cx - w / 2, y = cy - h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
}

/** deep stage: colour pair + two warm pools, matching the video grade */
function stage(ctx, W, H, top, bot, pools) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, col, a] of pools) {
    const rg = ctx.createRadialGradient(W * x, H * y, 0, W * x, H * y, Math.max(W, H) * r);
    rg.addColorStop(0, col.replace('ALPHA', a));
    rg.addColorStop(1, col.replace('ALPHA', 0));
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }
  // vignette
  const vg = ctx.createRadialGradient(W / 2, H * 0.46, Math.min(W, H) * 0.30, W / 2, H * 0.46, Math.max(W, H) * 0.80);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(10,2,5,0.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

/** draw one plate, feathered top & bottom into the stage */
async function placePlate(ctx, path, cx, cy, side, feather = 0.10) {
  const im = await loadImage(path);
  const h = Math.round(im.height * side / im.width);
  // draw first, then feather with a destination-in gradient in place:
  // a detached mask canvas returns an empty buffer on this build.
  const buf = createCanvas(side, h);
  const bx = buf.getContext('2d');
  bx.drawImage(im, 0, 0, side, h);
  const g = bx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(feather, 'rgba(0,0,0,1)');
  g.addColorStop(1 - feather, 'rgba(0,0,0,1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  bx.globalCompositeOperation = 'destination-in';
  bx.fillStyle = g;
  bx.fillRect(0, 0, side, h);
  ctx.drawImage(buf, cx - side / 2, cy - h / 2, side, h);
}

const SETS = [
  {
    key: 'set-d',
    plates: 'miqa/products/2026-11-06_set-d-video/plates',
    out: 'miqa/deliveries/2026-11-06_set-d-video',
    slug: 'set-d-velora',
    brand: 'MIQA',
    name: 'ভেলোরা',
    tagline: 'মেয়েদের স্পেশাল কালেকশন',
    price: '৳৩৯৯',
    count: '১৪টি ডিজাইন · একটাই দাম',
    countShort: '১৪টি ডিজাইন',
    looks: ['01', '05', '09', '10', '11', '13'],
    grid: ['p10', 'p01', 'p13', 'p09'],
    big: ['p10', 'p01', 'p13'],
    top: '#340A14', bot: '#12040A',
    pools: [[0.22, 0.74, 0.55, 'rgba(112,48,26,ALPHA)', 0.55], [0.78, 0.16, 0.45, 'rgba(84,34,44,ALPHA)', 0.45]],
    gold: GOLD_D,
    caption: {
      primary:
        'মেয়েদের স্পেশাল কালেকশন — ভেলোরা।\n'
        + 'ক্রিস্টাল বসানো সোনালি কেস, ডায়ালে রোমান XII, সরু গোল্ড কাঁটা — '
        + 'আর সোনালি-সিরামিক ব্রেসলেট। চোদ্দটি ডিজাইন, একটাই দাম ৳৩৯৯।\n\n'
        + 'প্রতিটি ঘড়িতে ওয়াটার রেজিস্ট্যান্স — হালকা পানির ছিটা সহনশীল, পানিতে ডুবাবেন না।\n'
        + 'আর আছে ৭ দিনের রিপ্লেসমেন্ট সুবিধা।',
      short:
        'ভেলোরা — মেয়েদের স্পেশাল কালেকশন। চোদ্দটি ডিজাইন, একটাই দাম ৳৩৯৯। '
        + 'ওয়াটার রেজিস্ট্যান্স · ৭ দিনের রিপ্লেসমেন্ট।',
      story:
        'ভেলোরা · ৳৩৯৯\nচোদ্দটি ডিজাইন\nওয়াটার রেজিস্ট্যান্স · ৭ দিনের রিপ্লেসমেন্ট',
    },
  },
  {
    key: 'set-c',
    plates: 'miqa/products/2026-11-05_set-c-video/plates',
    out: 'miqa/deliveries/2026-11-05_set-c-video',
    slug: 'set-c-octavia',
    brand: 'MIQA',
    name: 'অক্টেভিয়া',
    tagline: 'পাঁচটি রঙ · একই আভিজাত্য',
    price: '৳৩৫০',
    count: '৫টি রঙ · একটাই দাম',
    countShort: '৫টি রঙ',
    looks: ['01', '02', '03', '04', '05'],
    grid: ['p01', 'p02', 'p03', 'p04'],
    big: ['p01', 'p02', 'p03'],
    top: '#2E1014', bot: '#12060A',
    pools: [[0.24, 0.72, 0.55, 'rgba(120,58,38,ALPHA)', 0.55], [0.76, 0.18, 0.45, 'rgba(92,38,40,ALPHA)', 0.45]],
    gold: GOLD_C,
    caption: {
      primary:
        'অক্টেভিয়া — পাঁচটি রঙ, একই আভিজাত্য।\n'
        + 'অষ্টকোণ সোনালি কেস, XII-এর নিচে ব্র্যান্ড-নাম, ডায়ালে ১২টি ক্রিস্টাল ডট মার্কার '
        + 'আর হার্ট-কাট ক্রিস্টালের ব্রেসলেট। দাম ৳৩৫০।\n\n'
        + 'প্রতিটি ঘড়িতে ওয়াটার রেজিস্ট্যান্স — হালকা পানির ছিটা সহনশীল, পানিতে ডুবাবেন না।\n'
        + '৭ দিনের রিপ্লেসমেন্ট সুবিধা আছে।\n'
        + 'মিকার মুনাফার ৫% পথশিশুদের কল্যাণে।',
      short:
        'অক্টেভিয়া — পাঁচটি রঙ, একটাই দাম ৳৩৫০। অষ্টকোণ কেস, হার্ট-কাট ব্রেসলেট, '
        + 'ওয়াটার রেজিস্ট্যান্স ও ৭ দিনের রিপ্লেসমেন্ট।',
      story:
        'অক্টেভিয়া · ৳৩৫০\nপাঁচটি রঙ\nওয়াটার রেজিস্ট্যান্স · ৭ দিনের রিপ্লেসমেন্ট',
    },
  },
];

async function post4x5(set, W, H, square) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  stage(ctx, W, H, set.top, set.bot, set.pools);

  const titleY = square ? 116 : 122;
  spaced(ctx, set.brand, W / 2, titleY, '34px CinzelM', gold(ctx, W * 0.34, 0, W * 0.66, 0, set.gold), 12);
  rule(ctx, W / 2, titleY + 18, W * 0.26, 0.8, 2);
  text(ctx, set.name, W / 2, titleY + 100, '92px HindB', cream, 38);
  text(ctx, set.tagline, W / 2, titleY + 148, '32px HindSB', '#EFC7A6', 28);

  // 2 x 2 grid of four looks — a small product wall, like the reel's opening
  const side = square ? 246 : 300;
  const gap = square ? 22 : 26;
  const rowY = square ? 560 : 672;
  const colX = [W / 2 - (side + gap) / 2, W / 2 + (side + gap) / 2];
  for (let i = 0; i < 4; i++) {
    const cx = colX[i % 2];
    const cy = rowY + (i < 2 ? -(side + gap) / 2 : (side + gap) / 2);
    await placePlate(ctx, `${set.plates}/${set.grid[i]}.png`, cx, cy, side, 0.12);
  }

  // price block
  const py = square ? 900 : 1090;
  text(ctx, set.price, W / 2, py, square ? '132px HindB' : '146px HindB',
    gold(ctx, W * 0.28, 0, W * 0.72, 0, set.gold), 46);
  text(ctx, set.count, W / 2, py + 52, '32px HindSB', cream, 28);
  text(ctx, 'ওয়াটার রেজিস্ট্যান্স  ·  ৭ দিনের রিপ্লেসমেন্ট', W / 2,
    py + 108, '28px HindSB', '#EFC7A6', 26);
  pill(ctx, W / 2, H - (square ? 62 : 76), W * 0.46, 72, 36, 'rgba(227,196,137,0.94)');
  ctx.font = '31px HindSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2A0C16';
  ctx.fillText('ক্যাশ অন ডেলিভারি', W / 2, H - (square ? 60 : 74));
  return c;
}

async function story(set, W, H) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  stage(ctx, W, H, set.top, set.bot, set.pools);
  spaced(ctx, set.brand, W / 2, 190, '36px CinzelM', gold(ctx, W * 0.34, 0, W * 0.66, 0, set.gold), 13);
  rule(ctx, W / 2, 212, W * 0.26, 0.8, 2);
  text(ctx, set.name, W / 2, 320, '104px HindB', cream, 42);
  text(ctx, set.tagline, W / 2, 376, '34px HindSB', '#EFC7A6', 30);

  const big = set.big[0];
  await placePlate(ctx, `${set.plates}/${big}.png`, W / 2, 900, 1000, 0.13);

  text(ctx, set.price, W / 2, 1560, '150px HindB', gold(ctx, W * 0.28, 0, W * 0.72, 0, set.gold), 46);
  text(ctx, set.count, W / 2, 1618, '34px HindSB', cream, 26);
  text(ctx, 'ওয়াটার রেজিস্ট্যান্স  ·  ৭ দিনের রিপ্লেসমেন্ট', W / 2, 1682, '29px HindSB', '#EFC7A6', 24);
  pill(ctx, W / 2, 1790, W * 0.56, 82, 41, 'rgba(227,196,137,0.94)');
  ctx.font = '34px HindSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2A0C16';
  ctx.fillText('ক্যাশ অন ডেলিভারি', W / 2, 1792);
  return c;
}

const main = async () => {
  for (const set of SETS) {
    fs.mkdirSync(`${set.out}/facebook`, { recursive: true });
    const a = await post4x5(set, 1080, 1350, false);
    fs.writeFileSync(`${set.out}/facebook/${set.slug}_post_1080x1350.jpg`,
      a.toBuffer('image/jpeg', 92));
    const b = await post4x5(set, 1080, 1080, true);
    fs.writeFileSync(`${set.out}/facebook/${set.slug}_post_1080x1080.jpg`,
      b.toBuffer('image/jpeg', 92));
    const s = await story(set, 1080, 1920);
    fs.writeFileSync(`${set.out}/facebook/${set.slug}_story_1080x1920.jpg`,
      s.toBuffer('image/jpeg', 92));
    console.log('done', set.key);
  }
};
main();
