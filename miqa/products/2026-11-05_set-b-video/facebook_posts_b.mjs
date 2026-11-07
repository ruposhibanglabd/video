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

const CREAM_DEFAULT = '#FDF1E7';

function gold(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  return g;
}
const GOLD_B = [[0, '#C9A46B'], [0.34, '#F7E7C6'], [0.62, '#E4C795'], [1, '#B9905A']];

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
    key: 'set-b',
    plates: 'miqa/products/2026-11-05_set-b-video/plates',
    out: 'miqa/deliveries/2026-11-05_set-b-video',
    slug: 'set-b-sylvelle',
    brand: 'MIQA',
    name: 'সিলভেল',
    tagline: 'চারটি রঙ · একই ফ্লোরাল ডিজাইন',
    price: '৳৩৫০',
    count: '৪টি রঙ · একটাই দাম',
    countShort: '৪টি রঙ',
    grid: ['p01', 'p02', 'p03', 'p04'],
    big: ['p01', 'p02', 'p03'],
    top: '#0E3A36', bot: '#04110F',
    pools: [[0.24, 0.72, 0.55, 'rgba(120,78,36,ALPHA)', 0.5], [0.76, 0.16, 0.45, 'rgba(28,96,98,ALPHA)', 0.5]],
    gold: GOLD_B,
    footer: '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
    cream: '#F2FBFA',
    accent: '#BFE6DC',
    caption: {
      primary:
        'সিলভেল — চারটি রঙ, একই ফ্লোরাল ডিজাইন।\n'
        + 'ক্রিস্টাল বসানো রোজ-গোল্ড বেজেল, ডায়ালে ব্র্যান্ড-নাম, '
        + 'আর ফ্লোরাল লিংকের ব্রেসলেটে ক্রিস্টালের ক্লাস্টার। দাম ৳৩৫০।\n\n'
        + 'প্রতিটি ঘড়িতে ৭ দিনের মধ্যে রিপ্লেসমেন্ট গ্যারান্টি।\n'
        + 'মিকার মুনাফার ৫% পথশিশুদের কল্যাণে।',
      short:
        'সিলভেল — চারটি রঙ, একটাই দাম ৳৩৫০। ফ্লোরাল ক্রিস্টাল ব্রেসলেট, '
        + '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি।',
      story:
        'সিলভেল · ৳৩৫০\n৪টি রঙ\n৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
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
  const cream = set.cream || CREAM_DEFAULT;
  const accent = set.accent || '#EFC7A6';
  text(ctx, set.name, W / 2, titleY + 100, '92px HindB', cream, 38);
  text(ctx, set.tagline, W / 2, titleY + 148, '32px HindSB', accent, 28);

  // 2 x 2 grid of four looks — a small product wall, like the reel's opening
  const side = square ? 224 : 300;
  const gap = square ? 20 : 26;
  const rowY = square ? 528 : 672;
  const colX = [W / 2 - (side + gap) / 2, W / 2 + (side + gap) / 2];
  for (let i = 0; i < 4; i++) {
    const cx = colX[i % 2];
    const cy = rowY + (i < 2 ? -(side + gap) / 2 : (side + gap) / 2);
    await placePlate(ctx, `${set.plates}/${set.grid[i]}.png`, cx, cy, side, 0.12);
  }

  // price block
  const py = square ? 872 : 1090;
  text(ctx, set.price, W / 2, py, square ? '116px HindB' : '146px HindB',
    gold(ctx, W * 0.28, 0, W * 0.72, 0, set.gold), square ? 40 : 46);
  text(ctx, set.count, W / 2, py + (square ? 46 : 52), square ? '30px HindSB' : '32px HindSB', cream, 28);
  text(ctx, set.footer || 'ওয়াটার রেজিস্ট্যান্স  ·  ৭ দিনের রিপ্লেসমেন্ট', W / 2,
    py + (square ? 96 : 108), square ? '26px HindSB' : '28px HindSB', accent, 26);
  pill(ctx, W / 2, H - (square ? 52 : 76), W * 0.46, square ? 64 : 72, square ? 32 : 36,
    'rgba(227,196,137,0.94)');
  ctx.font = square ? '29px HindSB' : '31px HindSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2A0C16';
  ctx.fillText('ক্যাশ অন ডেলিভারি', W / 2, H - (square ? 50 : 74));
  return c;
}

async function story(set, W, H) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  stage(ctx, W, H, set.top, set.bot, set.pools);
  spaced(ctx, set.brand, W / 2, 190, '36px CinzelM', gold(ctx, W * 0.34, 0, W * 0.66, 0, set.gold), 13);
  rule(ctx, W / 2, 212, W * 0.26, 0.8, 2);
  const cream = set.cream || CREAM_DEFAULT;
  text(ctx, set.name, W / 2, 320, '104px HindB', cream, 42);
  text(ctx, set.tagline, W / 2, 376, '34px HindSB', set.accent || '#EFC7A6', 30);

  const big = set.big[0];
  await placePlate(ctx, `${set.plates}/${big}.png`, W / 2, 900, 1000, 0.13);

  text(ctx, set.price, W / 2, 1560, '150px HindB', gold(ctx, W * 0.28, 0, W * 0.72, 0, set.gold), 46);
  text(ctx, set.count, W / 2, 1618, '34px HindSB', cream, 26);
  text(ctx, set.footer || 'ওয়াটার রেজিস্ট্যান্স  ·  ৭ দিনের রিপ্লেসমেন্ট', W / 2, 1682, '29px HindSB', set.accent || '#EFC7A6', 24);
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
