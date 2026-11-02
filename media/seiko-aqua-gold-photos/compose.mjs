import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');
const dir='.tmp/seiko-aqua-gold/review/';fs.mkdirSync(dir,{recursive:true});
const image=await loadImage('media/seiko-aqua-gold-photos/source-main.webp');
const clasp=await loadImage('downloads/longines-batch-01/09-chain-butterfly-clasp.png');
const cv=createCanvas(2560,2560),c=cv.getContext('2d'),bg='#022d23';
c.fillStyle=bg;c.fillRect(0,0,2560,2560);
const x=(2560-image.width)/2,y=30;c.drawImage(image,x,y);
// Native photo scale preserved; only empty background margins blended.
for(const [a,b,left] of [[x,x+220,true],[x+image.width-220,x+image.width,false]]){
 const g=c.createLinearGradient(a,0,b,0);g.addColorStop(0,left?bg:'#022d2300');g.addColorStop(1,left?'#022d2300':bg);c.fillStyle=g;c.fillRect(a,y,b-a,image.height);
}
for(const [a,b,top] of [[y,y+130,true],[y+image.height-200,y+image.height,false]]){
 const g=c.createLinearGradient(0,a,0,b);g.addColorStop(0,top?bg:'#022d2300');g.addColorStop(1,top?'#022d2300':bg);c.fillStyle=g;c.fillRect(x,a,image.width,b-a);
}
c.fillStyle='#082f2a';c.beginPath();c.roundRect(150,2160,2260,300,28);c.fill();c.strokeStyle='#b69a5f';c.lineWidth=1.6;c.stroke();
c.save();c.beginPath();c.roundRect(195,2190,550,550*350/768,16);c.clip();
c.drawImage(clasp,0,560,768,350,195,2190,550,550*350/768);c.restore();
c.fillStyle='#fff8e9';c.font='600 80px Bengali';c.fillText('বাটারফ্লাই লক',825,2270);
c.fillStyle='#d7b87a';c.font='600 48px Bengali';c.fillText('স্টেইনলেস স্টিল চেইন',828,2340);
c.fillStyle='#c8cec3';c.font='600 32px Bengali';c.fillText('লকের উপস্থাপনামূলক ছবি',828,2405);
fs.writeFileSync(dir+'01-main-master.png',cv.toBuffer('image/png'));
