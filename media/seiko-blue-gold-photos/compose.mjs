import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');
const base='.tmp/seiko-blue-gold/';
fs.mkdirSync(base+'review',{recursive:true});
const image=await loadImage('media/seiko-blue-gold-photos/source-main.webp');
const clasp=await loadImage('downloads/longines-batch-01/09-chain-butterfly-clasp.png');
const w=2048,h=2048,cv=createCanvas(w,h),c=cv.getContext('2d');
c.fillStyle='#032d29';c.fillRect(0,0,w,h);
// Preserve the complete selected 1600px image at its native scale, with no product crop.
const x=(w-image.width)/2,y=30;c.drawImage(image,x,y);
// Feather only the external photographic background margins, far from the product.
for(const [a,b,left] of [[x,x+90,true],[x+image.width-90,x+image.width,false]]){
 const g=c.createLinearGradient(a,0,b,0);g.addColorStop(0,left?'#032d29':'#032d2900');g.addColorStop(1,left?'#032d2900':'#032d29');c.fillStyle=g;c.fillRect(a,y,b-a,image.height);
}
for(const [a,b,top] of [[y,y+55,true],[y+image.height-55,y+image.height,false]]){
 const g=c.createLinearGradient(0,a,0,b);g.addColorStop(0,top?'#032d29':'#032d2900');g.addColorStop(1,top?'#032d2900':'#032d29');c.fillStyle=g;c.fillRect(x,a,image.width,b-a);
}
c.fillStyle='#082f2a';c.beginPath();c.roundRect(180,1690,1688,286,28);c.fill();
c.strokeStyle='#b69a5f';c.lineWidth=1.5;c.beginPath();c.roundRect(180,1690,1688,286,28);c.stroke();
// Aspect-preserving crop of the already-authorized generic gold butterfly mechanism.
const sx=0,sy=560,sw=768,sh=350,dx=222,dy=1723,dw=560,dh=560*sh/sw;
c.save();c.beginPath();c.roundRect(dx,dy,dw,dh,16);c.clip();c.drawImage(clasp,sx,sy,sw,sh,dx,dy,dw,dh);c.restore();
c.fillStyle='#fff8e9';c.font='600 68px Bengali';c.fillText('বাটারফ্লাই লক',850,1810);
c.fillStyle='#d7b87a';c.font='600 39px Bengali';c.fillText('স্টেইনলেস স্টিল চেইন',853,1873);
c.fillStyle='#c8cec3';c.font='600 27px Bengali';c.fillText('লকের উপস্থাপনামূলক ছবি',853,1922);
fs.writeFileSync(base+'review/01-main-master.png',cv.toBuffer('image/png'));
