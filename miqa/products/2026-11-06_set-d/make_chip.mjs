import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
const F='miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`,'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`,'HindM');
const W=1024,H=112;
const c=createCanvas(W,H); const ctx=c.getContext('2d');
// soft ivory plate
ctx.fillStyle='rgba(253,246,243,0.94)';
ctx.beginPath(); ctx.roundRect(1,1,W-2,H-2,18); ctx.fill();
ctx.strokeStyle='rgba(184,146,90,0.60)'; ctx.lineWidth=2;
ctx.beginPath(); ctx.roundRect(1,1,W-2,H-2,18); ctx.stroke();
// gold dot
ctx.beginPath(); ctx.arc(52,H/2,6,0,Math.PI*2); ctx.fillStyle='#B8925A'; ctx.fill();
// text
ctx.font='30px HindSB'; ctx.textAlign='left'; ctx.textBaseline='middle';
ctx.fillStyle='#5A1A2E';
ctx.fillText('ওয়াটার রেজিস্ট্যান্স  ·  ৭ দিনের রিপ্লেসমেন্ট', 76, H/2+1);
fs.writeFileSync('miqa/products/2026-11-06_set-d/work/chip.png', c.toBuffer('image/png'));
console.log('chip written');
