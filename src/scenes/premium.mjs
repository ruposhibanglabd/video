/** Premium, photo-led showcase scenes that replace the older sparse mockups. */
import { C, W, alpha, clamp, easeOutBack, easeInOut, rr, fillRR, strokeRR, text, icon, circle, shadow, noShadow } from '../render/kit.mjs';
import { L, browserStage, phoneStage, brandWatermark } from './stage.mjs';
import { desktopHome, desktopCampaign, desktopProduct, desktopCheckout } from '../ui/desktop.mjs';
import * as SF from '../ui/storefront.mjs';

const browser = (ctx, t, draw, opts = {}) => browserStage(ctx, t, {
  x: 120, y: 500, w: 1120, h: 1080, scale: 0.9,
  enter: clamp((t + 0.1) / 0.8), url: 'aurum.store', glow: C.gold,
  draw: (w, h) => draw(ctx, w, h), ...opts,
});

function tinyFeature(ctx, t, x, y, label, glyph, delay = 0) {
  const p = easeOutBack(clamp((t - delay) / 0.6));
  if (!p) return;
  ctx.save(); ctx.globalAlpha *= p; ctx.translate((1 - p) * 24, 0);
  shadow(ctx, 'rgba(0,0,0,0.22)', 22, 8);
  fillRR(ctx, x, y, 250, 60, 20, 'rgba(255,255,255,0.96)'); noShadow(ctx);
  strokeRR(ctx, x, y, 250, 60, 20, 'rgba(184,148,98,0.24)', 1.2);
  circle(ctx, x + 31, y + 30, 18, '#F1E5D2');
  icon(ctx, glyph, x + 19, y + 18, 24, '#8A6840', 1.8);
  text(ctx, label, x + 60, y + 37, { size: 17, weight: 700, color: '#28231C', maxWidth: 176 });
  ctx.restore();
}

export const premiumScenes = {
  hook(ctx, t, d) {
    browser(ctx, t, (c, w, h) => desktopHome(c, w, h, { p: clamp(t / 1.1), scroll: clamp((t - 3.2) / 4) * 0.18 }), { url: 'aurum.store' });
    tinyFeature(ctx, t, 74, 1510, 'আপনার ব্যবসার নিজস্ব স্টোরফ্রন্ট', 'globe', 1.0);
    tinyFeature(ctx, t, 398, 1510, 'কাস্টমার-প্রথম ডিজাইন', 'sparkle', 2.0);
    brandWatermark(ctx, t, 0.28);
  },

  browse(ctx, t, d) {
    browser(ctx, t, (c, w, h) => desktopProduct(c, w, h, { added: clamp((t - 6.8) / 0.7) > 0.8 }), { url: 'aurum.store/product/heritage-chrono' });
    tinyFeature(ctx, t, 92, 1510, 'পণ্যের ছবি ও বিস্তারিত', 'box', 0.8);
    tinyFeature(ctx, t, 424, 1510, 'সহজে কার্টে যোগ করুন', 'cart', 2.4);
    brandWatermark(ctx, t, 0.26);
  },

  storefrontWalk(ctx, t, d) {
    const scroll = easeInOut(clamp((t - 1.2) / 8.4));
    browser(ctx, t, (c, w, h) => desktopHome(c, w, h, { scroll: scroll * 0.76, p: clamp(t / 1.1) }), { y: 500 });
    tinyFeature(ctx, t, 74, 1510, 'ক্যাটাগরি ও কালেকশন', 'grid', 1.0);
    tinyFeature(ctx, t, 376, 1510, 'সার্চ ও পণ্যের তথ্য', 'search', 3.2);
    tinyFeature(ctx, t, 678, 1510, 'সহজ অর্ডার', 'bag', 5.6);
    brandWatermark(ctx, t, 0.25);
  },

  checkoutFlow(ctx, t, d) {
    const transition = easeInOut(clamp((t - 2.1) / 0.8));
    browser(ctx, t, (c, w, h) => {
      if (t < 2.1) desktopProduct(c, w, h, { added: clamp(t / 1.15) > 0.8 });
      else if (t < 2.9) {
        c.save(); c.fillStyle = '#F7F3EB'; c.fillRect(0, 0, w, h);
        c.save(); c.translate(-w * transition, 0); desktopProduct(c, w, h, { added: true }); c.restore();
        c.save(); c.translate(w * (1 - transition), 0); desktopCheckout(c, w, h, { step: 1 }); c.restore(); c.restore();
      } else desktopCheckout(c, w, h, { step: t > 7.6 ? 2 : 1 });
    }, { url: t < 2.1 ? 'aurum.store/product' : 'aurum.store/checkout' });
    if (t > 8.2) {
      const p = easeOutBack(clamp((t - 8.2) / 0.7));
      ctx.save(); ctx.globalAlpha *= p;
      shadow(ctx, 'rgba(0,0,0,0.28)', 36, 14);
      fillRR(ctx, 340, 1478, 400, 78, 25, '#FFFFFF'); noShadow(ctx);
      circle(ctx, 382, 1517, 23, '#2F8C68'); icon(ctx, 'check', 368, 1503, 27, '#FFFFFF', 2.4);
      text(ctx, 'ডেমো অর্ডার সম্পন্ন', 420, 1526, { size: 22, weight: 700, color: '#24231F' });
      ctx.restore();
    }
    brandWatermark(ctx, t, 0.22);
  },

  landingIntro(ctx, t, d) {
    browser(ctx, t, (c, w, h) => desktopHome(c, w, h, { scroll: clamp((t - 3) / 5) * 0.56, p: clamp(t / 1.4) }), { url: 'aurum.store/campaign' });
    tinyFeature(ctx, t, 72, 1510, 'ক্যাম্পেইন ল্যান্ডিং পেজ', 'globe', 1.2);
    tinyFeature(ctx, t, 380, 1510, 'নিজস্ব ব্যানার ও অফার', 'tag', 3.1);
    brandWatermark(ctx, t, 0.25);
  },

  landingUnlimited(ctx, t, d) {
    browser(ctx, t, (c, w, h) => desktopCampaign(c, w, h, { p: clamp(t / 1.2) }), { url: 'aurum.store/campaign/style-edit' });
    tinyFeature(ctx, t, 78, 1510, 'প্রতিটি ক্যাম্পেইনে আলাদা ডিজাইন', 'sparkle', 1.0);
    tinyFeature(ctx, t, 402, 1510, 'পণ্য, ব্যানার ও তথ্য একসাথে', 'box', 3.0);
    brandWatermark(ctx, t, 0.22);
  },

  landingThree(ctx, t, d) {
    const items = [
      { image: 'fashion', title: 'ফ্যাশন', sub: 'নতুন স্টাইল, নতুন কালেকশন' },
      { image: 'restaurant', title: 'রেস্টুরেন্ট', sub: 'মেনু থেকে সহজ অর্ডার' },
      { image: 'beauty', title: 'বিউটি', sub: 'কেয়ার, প্রতিদিন' },
    ];
    items.forEach((it, i) => {
      const p = easeOutBack(clamp((t - 0.25 - i * 0.38) / 0.7));
      if (!p) return;
      const x = 62 + i * 324, y = 720 + (1 - p) * 50;
      ctx.save(); ctx.globalAlpha *= p;
      shadow(ctx, 'rgba(0,0,0,0.32)', 36, 16);
      fillRR(ctx, x, y, 302, 540, 22, '#F7F3EB'); noShadow(ctx);
      ctx.save(); rr(ctx, x, y, 302, 540, 22); ctx.clip();
      SF.photoCover(ctx, it.image, x, y, 302, 540, { focalX: it.image === 'fashion' ? 0.68 : 0.54 });
      const grad = ctx.createLinearGradient(x, y + 260, x, y + 540);
      grad.addColorStop(0, 'rgba(20,18,15,0)'); grad.addColorStop(1, 'rgba(20,18,15,0.88)');
      ctx.fillStyle = grad; ctx.fillRect(x, y + 260, 302, 280); ctx.restore();
      text(ctx, it.title, x + 24, y + 466, { size: 28, weight: 700, color: '#FFFFFF' });
      text(ctx, it.sub, x + 24, y + 502, { size: 15, weight: 500, color: 'rgba(255,255,255,0.86)', maxWidth: 254 });
      fillRR(ctx, x + 24, y + 38, 120, 30, 15, 'rgba(255,255,255,0.92)');
      text(ctx, 'ওয়েবসাইট ডেমো', x + 84, y + 58, { size: 12, weight: 700, color: '#27221C', align: 'center' });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  landingDetail(ctx, t, d) {
    browser(ctx, t, (c, w, h) => desktopProduct(c, w, h, { added: clamp((t - 4) / 1.2) > 0.85 }), { url: 'aurum.store/product/heritage-chrono' });
    tinyFeature(ctx, t, 74, 1510, 'ছবি ও পণ্যের বিবরণ', 'box', 0.8);
    tinyFeature(ctx, t, 378, 1510, 'অফার ও ভ্যারিয়েন্ট', 'tag', 2.6);
    tinyFeature(ctx, t, 682, 1510, 'সরাসরি অর্ডার', 'cart', 4.4);
    brandWatermark(ctx, t, 0.2);
  },

  customDesign(ctx, t, d) {
    browser(ctx, t, (c, w, h) => desktopHome(c, w, h, { scroll: clamp((t - 2) / 5) * 0.32, p: clamp(t / 1.2) }), { url: 'aurum.store', y: 350 });
    tinyFeature(ctx, t, 70, 1510, 'আপনার ব্যবসার উপযোগী', 'sparkle', 0.8);
    tinyFeature(ctx, t, 374, 1510, 'রেডিমেড নয়, কাস্টম', 'edit', 2.2);
    brandWatermark(ctx, t, 0.22);
  },

  designBoard(ctx, t, d) {
    browser(ctx, t, (c, w, h) => desktopHome(c, w, h, { scroll: clamp((t - 2.2) / 6) * 0.2, p: clamp(t / 1.2) }), { url: 'preview.aurum.store' });
    // floating real design tokens, not a generic blank moodboard
    const p = easeOutBack(clamp((t - 2.8) / 0.8));
    ctx.save(); ctx.globalAlpha *= p;
    shadow(ctx, 'rgba(0,0,0,0.25)', 26, 10);
    fillRR(ctx, 744, 1476, 270, 94, 19, '#FFFFFF'); noShadow(ctx);
    text(ctx, 'ব্র্যান্ড কালার', 764, 1503, { size: 14, weight: 700, color: '#484238' });
    ['#211D18','#B89462','#F7F3EB','#627B69'].forEach((col,i)=>{circle(ctx,778+i*54,1537,16,col);strokeRR(ctx,762+i*54,1521,32,32,16,'rgba(32,25,17,0.13)',1)});
    ctx.restore(); brandWatermark(ctx,t,0.2);
  },

  brandCustomize(ctx, t, d) {
    browser(ctx, t, (c, w, h) => desktopHome(c, w, h, { scroll: clamp((t - 3) / 6) * 0.66, p: clamp(t / 1.2) }), { url: 'preview.aurum.store' });
    tinyFeature(ctx, t, 74, 1510, 'কালার • লোগো • ব্যানার', 'edit', 0.6);
    tinyFeature(ctx, t, 378, 1510, 'নিজের ব্র্যান্ড পরিচয়', 'sparkle', 2.8);
    brandWatermark(ctx,t,0.22);
  },

  categoriesMontage(ctx, t, d) {
    const items = [
      { image:'fashion', title:'ফ্যাশন', sub:'পোশাক • জুতা • অ্যাকসেসরিজ' },
      { image:'restaurant', title:'রেস্টুরেন্ট', sub:'মেনু • স্পেশাল • অর্ডার' },
      { image:'beauty', title:'বিউটি', sub:'স্কিনকেয়ার • কসমেটিক্স' },
    ];
    items.forEach((it,i)=>{
      const p=easeOutBack(clamp((t-.2-i*.3)/.7)); if(!p)return;
      const x=70+i*320,y=760+(1-p)*52;
      ctx.save();ctx.globalAlpha*=p;shadow(ctx,'rgba(0,0,0,.3)',32,14);fillRR(ctx,x,y,300,500,23,'#fff');noShadow(ctx);
      SF.photoCover(ctx,it.image,x,y,300,390,{radius:23,focalX:i===0?.68:.52});
      ctx.save();ctx.beginPath();ctx.rect(x,y+368,300,132);ctx.clip();fillRR(ctx,x,y+360,300,150,0,'#fff');ctx.restore();
      text(ctx,it.title,x+22,y+428,{size:27,weight:700,color:'#211D18'});text(ctx,it.sub,x+22,y+466,{size:14,weight:500,color:'#777267',maxWidth:256});
      ctx.restore();
    });
    brandWatermark(ctx,t,.25);
  },

  mobileFriendly(ctx, t, d) {
    browserStage(ctx,t,{x:45,y:790,w:1000,h:760,scale:.68,enter:clamp(t/.7),url:'aurum.store',glow:C.gold,
      draw:(w,h)=>desktopHome(ctx,w,h,{scroll:.12,p:1})});
    phoneStage(ctx,t,{x:516,y:682,scale:.88,enter:clamp((t-.35)/.8),float:false,glow:C.gold,
      draw:(w,h)=>SF.sfHome(ctx,w,h,{scroll:.16,activeCat:1})});
    tinyFeature(ctx,t,74,1510,'ডেস্কটপ ও মোবাইলে মানানসই','phone',1.3);
    brandWatermark(ctx,t,.25);
  },
};
