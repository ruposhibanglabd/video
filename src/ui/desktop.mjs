/**
 * Premium responsive desktop storefront used by the promo's large browser
 * showcases. The same local product photography and demo data power the
 * mobile storefront, so these look like one real shop, not decorative slides.
 */
import { C, alpha, text, fillRR, strokeRR, rr, circle, line, shadow, noShadow, icon, clamp, easeOut, fontStr } from '../render/kit.mjs';
import { PRODUCTS, T, photoCover, sfLogo, demoBadge } from './storefront.mjs';

const ink = '#211D18';
const muted = '#777267';
const cream = '#F7F3EB';
const gold = '#B89462';
const border = '#E8E1D5';

function nav(ctx, w, { dark = false, active = 'সব পণ্য' } = {}) {
  const fg = dark ? '#FFFFFF' : ink;
  ctx.fillStyle = dark ? '#201C17' : '#FFFFFF';
  ctx.fillRect(0, 0, w, 94);
  line(ctx, 0, 93, w, 93, dark ? 'rgba(255,255,255,0.13)' : border, 1);
  sfLogo(ctx, 30, 30, 34, fg);
  const links = ['নতুন কালেকশন', 'ঘড়ি', 'ব্যাগ', 'অ্যাকসেসরিজ'];
  let x = 250;
  for (const label of links) {
    text(ctx, label, x, 56, { size: 17, weight: label === active ? 700 : 500, color: fg });
    if (label === active) fillRR(ctx, x, 72, 38, 2, 1, gold);
    x += label === 'নতুন কালেকশন' ? 150 : 90;
  }
  fillRR(ctx, w - 300, 27, 158, 40, 20, dark ? 'rgba(255,255,255,0.09)' : '#F7F4EE');
  icon(ctx, 'search', w - 286, 37, 19, dark ? 'rgba(255,255,255,0.72)' : muted, 1.8);
  text(ctx, 'খুঁজুন', w - 258, 53, { size: 15, weight: 500, color: dark ? 'rgba(255,255,255,0.68)' : muted });
  icon(ctx, 'users', w - 118, 35, 22, fg, 1.8);
  icon(ctx, 'bag', w - 64, 33, 26, fg, 1.8);
  circle(ctx, w - 45, 32, 8, gold);
  text(ctx, '১', w - 45, 35, { size: 10, weight: 700, color: '#fff', align: 'center' });
}

function announcement(ctx, w, label = 'সারা দেশে ডেলিভারি  •  ক্যাশ অন ডেলিভারি') {
  ctx.fillStyle = '#201C17'; ctx.fillRect(0, 0, w, 30);
  text(ctx, label, w / 2, 21, { size: 13, weight: 500, color: '#E8D8BC', align: 'center', letterSpacing: 0.3 });
}

function demoPill(ctx, x, y, label = 'ডেমো স্টোর') {
  ctx.font = fontStr(13, 600, label);
  const w = ctx.measureText(label).width + 28;
  fillRR(ctx, x, y, w, 29, 15, 'rgba(31,28,23,0.72)');
  text(ctx, label, x + w / 2, y + 20, { size: 13, weight: 600, color: '#FFFFFF', align: 'center' });
}

function productCard(ctx, x, y, w, h, product, delay = 0) {
  const p = easeOut(clamp(delay));
  ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 16);
  shadow(ctx, 'rgba(35,27,17,0.08)', 18, 7);
  fillRR(ctx, x, y, w, h, 15, '#FFFFFF'); noShadow(ctx);
  strokeRR(ctx, x, y, w, h, 15, border, 1);
  photoCover(ctx, product.photo, x + 8, y + 8, w - 16, h * 0.60, { radius: 10, focalY: 0.5 });
  if (product.tag) {
    fillRR(ctx, x + 18, y + 18, 82, 26, 13, product.tag === 'নতুন' ? ink : gold);
    text(ctx, product.tag, x + 59, y + 36, { size: 12, weight: 700, color: '#FFFFFF', align: 'center' });
  }
  text(ctx, product.bn, x + 16, y + h * 0.60 + 34, { size: 17, weight: 700, color: ink, maxWidth: w - 32 });
  text(ctx, `৳${product.price.toLocaleString('en-US')}`, x + 16, y + h * 0.60 + 59, { size: 18, weight: 700, color: ink });
  if (product.old) text(ctx, `৳${product.old.toLocaleString('en-US')}`, x + w - 16, y + h * 0.60 + 59, { size: 13, weight: 500, color: muted, align: 'right' });
  ctx.restore();
}

/** Real desktop-style home page, with a moving content viewport for scroll beats. */
export function desktopHome(ctx, w, h, o = {}) {
  ctx.fillStyle = cream; ctx.fillRect(0, 0, w, h);
  announcement(ctx, w);
  nav(ctx, w, { active: o.active || 'নতুন কালেকশন' });
  const scroll = clamp(o.scroll || 0);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 124, w, h - 124); ctx.clip();
  ctx.translate(0, -scroll * 256);
  const mx = 30, heroY = 122, heroW = w - 60, heroH = Math.min(350, h * 0.37);
  fillRR(ctx, mx, heroY, heroW, heroH, 19, '#29231B');
  photoCover(ctx, 'hero', mx, heroY, heroW, heroH, { radius: 19, focalX: 0.62, focalY: 0.52 });
  ctx.save(); rr(ctx, mx, heroY, heroW, heroH, 19); ctx.clip();
  const shade = ctx.createLinearGradient(mx, heroY, mx + heroW, heroY);
  shade.addColorStop(0, 'rgba(16,15,13,0.82)'); shade.addColorStop(0.48, 'rgba(16,15,13,0.53)'); shade.addColorStop(1, 'rgba(16,15,13,0.03)');
  ctx.fillStyle = shade; ctx.fillRect(mx, heroY, heroW, heroH); ctx.restore();
  text(ctx, 'A U R U M   /   নতুন কালেকশন', mx + 42, heroY + 66, { size: 14, weight: 600, color: '#EAD8B8', letterSpacing: 1.6 });
  text(ctx, 'সময়ের নিজস্ব ছন্দ', mx + 42, heroY + 138, { size: 42, weight: 700, color: '#FFFFFF', maxWidth: heroW * 0.52 });
  text(ctx, 'প্রতিদিনের স্টাইলে যোগ হোক আভিজাত্য', mx + 42, heroY + 180, { size: 18, weight: 500, color: 'rgba(255,255,255,0.82)' });
  fillRR(ctx, mx + 42, heroY + 218, 162, 48, 24, '#E6D1AF');
  text(ctx, 'কালেকশন দেখুন', mx + 123, heroY + 249, { size: 16, weight: 700, color: '#241D15', align: 'center' });
  demoPill(ctx, mx + heroW - 112, heroY + 18);

  const sectionY = heroY + heroH + 34;
  text(ctx, 'জনপ্রিয় ক্যাটাগরি', mx, sectionY + 24, { size: 22, weight: 700, color: ink });
  text(ctx, 'সব ক্যাটাগরি  →', w - mx, sectionY + 24, { size: 14, weight: 600, color: gold, align: 'right' });
  const cats = [['ঘড়ি','hero'],['ব্যাগ','bag'],['জুতা','shoe'],['বিউটি','beauty']];
  const catGap = 14, catW = (heroW - catGap * 3) / 4, catY = sectionY + 42;
  cats.forEach(([label, image], i) => {
    const x = mx + i * (catW + catGap);
    fillRR(ctx, x, catY, catW, 118, 13, '#EAE2D5');
    photoCover(ctx, image, x, catY, catW, 118, { radius: 13, focalX: image === 'hero' ? 0.65 : 0.5 });
    ctx.save(); rr(ctx, x, catY + 76, catW, 42, 13); ctx.clip();
    const g = ctx.createLinearGradient(0, catY + 70, 0, catY + 118); g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.58)');ctx.fillStyle=g;ctx.fillRect(x,catY+70,catW,48);ctx.restore();
    text(ctx, label, x + 14, catY + 103, { size: 16, weight: 700, color: '#FFFFFF' });
  });
  const prodY = catY + 150;
  text(ctx, 'এই সপ্তাহের পছন্দ', mx, prodY + 22, { size: 22, weight: 700, color: ink });
  text(ctx, 'ডেমো পণ্যের নমুনা', w - mx, prodY + 22, { size: 13, weight: 500, color: muted, align: 'right' });
  const gap = 14, cw = (heroW - gap * 3) / 4, cardY = prodY + 38, cardH = Math.min(260, h * 0.28);
  PRODUCTS.slice(0,4).forEach((product,i)=>productCard(ctx,mx+i*(cw+gap),cardY,cw,cardH,product,clamp((o.p ?? 1)*1.6-i*.12)));
  ctx.restore();
  demoBadge(ctx, w - 110, h - 25, 12);
}

/** Fashion-led campaign landing page for a distinct campaign example. */
export function desktopCampaign(ctx, w, h, o = {}) {
  ctx.fillStyle = cream; ctx.fillRect(0,0,w,h); announcement(ctx,w,'নতুন কালেকশন  •  ডেমো ক্যাম্পেইন'); nav(ctx,w,{active:'নতুন কালেকশন'});
  const mx=30, y=122, heroW=w-60, heroH=486;
  fillRR(ctx,mx,y,heroW,heroH,19,'#A99478');
  photoCover(ctx,'fashion',mx,y,heroW,heroH,{radius:19,focalX:.68,focalY:.5});
  ctx.save();rr(ctx,mx,y,heroW,heroH,19);ctx.clip();const g=ctx.createLinearGradient(mx,y,mx+heroW,y);g.addColorStop(0,'rgba(17,15,13,.76)');g.addColorStop(.46,'rgba(17,15,13,.32)');g.addColorStop(1,'rgba(17,15,13,0)');ctx.fillStyle=g;ctx.fillRect(mx,y,heroW,heroH);ctx.restore();
  text(ctx,'AURUM  /  STYLE EDIT',mx+38,y+64,{size:14,weight:700,color:'#EAD8B8',letterSpacing:1.6});
  text(ctx,'নতুন স্টাইল,\nনিজের পরিচয়ে',mx+38,y+162,{size:44,weight:700,color:'#FFFFFF',maxWidth:490});
  text(ctx,'আপনার পছন্দের কালেকশন এক জায়গায়',mx+38,y+214,{size:17,weight:500,color:'rgba(255,255,255,.88)'});
  fillRR(ctx,mx+38,y+254,164,48,24,'#E6D1AF');text(ctx,'কালেকশন দেখুন',mx+120,y+285,{size:15,weight:700,color:'#241D15',align:'center'});
  demoPill(ctx,mx+heroW-112,y+18,'ক্যাম্পেইন ডেমো');
  const sy=y+heroH+28;text(ctx,'এডিট থেকে বেছে নিন',mx,sy+22,{size:21,weight:700,color:ink});
  const picks=[['fashion','ফ্যাশন'],['bag','ব্যাগ'],['shoe','জুতা']];const gap=16,cw=(heroW-gap*2)/3;
  picks.forEach(([image,label],i)=>{const x=mx+i*(cw+gap);fillRR(ctx,x,sy+38,cw,190,14,'#E8E0D2');photoCover(ctx,image,x,sy+38,cw,190,{radius:14,focalX:image==='fashion'?.68:.5});text(ctx,label,x+14,sy+213,{size:16,weight:700,color:ink})});
  demoBadge(ctx,w-110,h-25,12);
}

/** Desktop product page with visible gallery, variants, fulfilment and CTA. */
export function desktopProduct(ctx, w, h, o = {}) {
  ctx.fillStyle = cream; ctx.fillRect(0,0,w,h); announcement(ctx,w); nav(ctx,w,{active:'ঘড়ি'});
  text(ctx,'হোম  /  ঘড়ি  /  হেরিটেজ ক্রোনো',30,147,{size:13,weight:500,color:muted});
  const top=170, left=30, galleryW=Math.round(w*.53), gap=34, right=left+galleryW+gap, rightW=w-right-30;
  fillRR(ctx,left,top,galleryW,h-220,18,'#E8E0D2');
  photoCover(ctx,'leather',left,top,galleryW,h-220,{radius:18,focalY:.53});
  // thumbnail rail
  const thumbs=['leather','noir','hero'];
  thumbs.forEach((name,i)=>{const x=left+i*94;fillRR(ctx,x,top+h-274,80,72,10,'#fff');photoCover(ctx,name,x,top+h-274,80,72,{radius:10});if(i===0)strokeRR(ctx,x,top+h-274,80,72,10,gold,2)});
  text(ctx,'AURUM  /  SIGNATURE',right,top+38,{size:13,weight:700,color:gold,letterSpacing:1.5});
  text(ctx,'হেরিটেজ ক্রোনো',right,top+92,{size:36,weight:700,color:ink,maxWidth:rightW});
  text(ctx,'মিনিমাল ডিজাইন • ৪০ mm • লেদার স্ট্র্যাপ',right,top+126,{size:16,weight:500,color:muted,maxWidth:rightW});
  text(ctx,'৳৪,৮৯০',right,top+194,{size:34,weight:700,color:ink});
  text(ctx,'ক্যাশ অন ডেলিভারি',right,top+234,{size:15,weight:600,color:'#3A7D60'});
  line(ctx,right,top+258,w-30,top+258,border,1);
  text(ctx,'রঙ বেছে নিন',right,top+294,{size:16,weight:700,color:ink});
  ['#3B2A1D','#8B5D3D','#C9A46A'].forEach((c,i)=>{circle(ctx,right+16+i*42,top+329,13,c);if(i===0)strokeRR(ctx,right+2,top+314,28,28,14,ink,1.4)});
  text(ctx,'ডেলিভারি',right,top+384,{size:16,weight:700,color:ink});
  text(ctx,'ঢাকায় ১–২ দিন  •  ঢাকার বাইরে ২–৩ দিন',right,top+411,{size:14,weight:500,color:muted,maxWidth:rightW});
  fillRR(ctx,right,top+450,rightW,54,12,ink);icon(ctx,'bag',right+18,top+466,22,'#fff',1.8);text(ctx,o.added?'কার্টে যোগ হয়েছে ✓':'কার্টে যোগ করুন',right+54,top+484,{size:16,weight:700,color:'#fff'});
  fillRR(ctx,right,top+516,rightW,52,12,'#E6D1AF');text(ctx,'এখনই অর্ডার করুন',right+rightW/2,top+548,{size:16,weight:700,color:'#251E16',align:'center'});
  fillRR(ctx,right,top+590,rightW,60,12,'#FFFFFF');strokeRR(ctx,right,top+590,rightW,60,12,border,1);icon(ctx,'truck',right+16,top+609,22,gold,1.8);text(ctx,'সারা দেশে ডেলিভারি',right+50,top+615,{size:14,weight:700,color:ink});text(ctx,'ডেমো চেকআউট • তথ্য নমুনা',right+50,top+638,{size:12,weight:500,color:muted});
  demoBadge(ctx,w-110,h-25,12);
}

/** Desktop checkout page with a clear two-column order flow. */
export function desktopCheckout(ctx,w,h,o={}) {
  ctx.fillStyle='#F6F7F9';ctx.fillRect(0,0,w,h);announcement(ctx,w,'নিরাপদ চেকআউট  •  আপনার তথ্য শুধুমাত্র ডেমো');nav(ctx,w,{active:''});
  text(ctx,'চেকআউট',32,154,{size:32,weight:700,color:ink});
  text(ctx,'আপনার অর্ডারটি সম্পন্ন করতে তথ্য দিন',32,183,{size:15,weight:500,color:muted});
  const y=212,left=32,leftW=Math.round(w*.57),right=left+leftW+24,rightW=w-right-32;
  // stepper
  const steps=['তথ্য','ডেলিভারি','পেমেন্ট'];steps.forEach((label,i)=>{const x=left+i*150;circle(ctx,x+12,y+14,12,i<=(o.step??1)?gold:'#D9DEE5');text(ctx,String(i+1),x+12,y+18,{size:11,weight:700,color:'#fff',align:'center'});text(ctx,label,x+34,y+19,{size:14,weight:i===o.step?700:500,color:i<=o.step?ink:muted});if(i<2)line(ctx,x+112,y+14,x+142,y+14,'#D9DEE5',2)});
  const formY=y+46;fillRR(ctx,left,formY,leftW,490,16,'#FFFFFF');strokeRR(ctx,left,formY,leftW,490,16,border,1);
  text(ctx,'ডেলিভারি তথ্য',left+24,formY+38,{size:19,weight:700,color:ink});
  function field(label,value,x,yy,ww){text(ctx,label,x,yy,{size:13,weight:600,color:'#4C514F'});fillRR(ctx,x,yy+10,ww,48,9,'#FFFFFF');strokeRR(ctx,x,yy+10,ww,48,9,'#DADFE4',1);text(ctx,value,x+14,yy+40,{size:14,weight:500,color:value==='লিখুন'?'#9A9E9B':ink})}
  field('আপনার নাম','রাইসা রহমান',left+24,formY+78,leftW-48);
  field('মোবাইল নম্বর','০১৭১২৩৪৫৬৭৮',left+24,formY+160,(leftW-64)*.52);
  field('এলাকা','ঢাকা',left+40+(leftW-64)*.52,formY+160,(leftW-64)*.48);
  field('সম্পূর্ণ ঠিকানা','বাসা, রোড, এলাকা লিখুন',left+24,formY+244,leftW-48);
  text(ctx,'পেমেন্ট পদ্ধতি',left+24,formY+340,{size:17,weight:700,color:ink});
  fillRR(ctx,left+24,formY+358,leftW-48,62,10,'#FBF8F1');strokeRR(ctx,left+24,formY+358,leftW-48,62,10,gold,1.4);circle(ctx,left+48,formY+389,9,gold);text(ctx,'ক্যাশ অন ডেলিভারি',left+70,formY+394,{size:14,weight:700,color:ink});text(ctx,'পণ্য হাতে পেয়ে পেমেন্ট করুন',left+70,formY+412,{size:12,weight:500,color:muted});
  // summary card
  fillRR(ctx,right,y,rightW,536,16,'#FFFFFF');strokeRR(ctx,right,y,rightW,536,16,border,1);
  text(ctx,'অর্ডার সারাংশ',right+20,y+36,{size:19,weight:700,color:ink});
  photoCover(ctx,'leather',right+20,y+58,82,82,{radius:11});text(ctx,'হেরিটেজ ক্রোনো',right+116,y+90,{size:14,weight:700,color:ink,maxWidth:rightW-136});text(ctx,'৪০ mm • ব্রাউন',right+116,y+114,{size:12,weight:500,color:muted});text(ctx,'৳৪,৮৯০',right+rightW-20,y+136,{size:14,weight:700,color:ink,align:'right'});
  line(ctx,right+20,y+160,right+rightW-20,y+160,border,1);
  [['সাবটোটাল','৳৪,৮৯০'],['ডেলিভারি চার্জ','৳৭০'],['ডিসকাউন্ট','− ৳০']].forEach(([a,b],i)=>{text(ctx,a,right+20,y+198+i*38,{size:13,weight:500,color:muted});text(ctx,b,right+rightW-20,y+198+i*38,{size:13,weight:600,color:ink,align:'right'})});
  line(ctx,right+20,y+320,right+rightW-20,y+320,border,1);text(ctx,'মোট',right+20,y+360,{size:16,weight:700,color:ink});text(ctx,'৳৪,৯৬০',right+rightW-20,y+360,{size:20,weight:700,color:ink,align:'right'});
  fillRR(ctx,right+20,y+392,rightW-40,56,11,ink);text(ctx,'অর্ডার নিশ্চিত করুন',right+rightW/2,y+427,{size:15,weight:700,color:'#fff',align:'center'});
  text(ctx,'ডেমো UI • প্রকৃত অর্ডার জমা হয় না',right+20,y+482,{size:11,weight:500,color:muted});demoBadge(ctx,w-110,h-25,12);
}
