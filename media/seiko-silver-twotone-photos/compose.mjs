import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');
const dir='.tmp/seiko-silver-twotone-v2/review/';fs.mkdirSync(dir,{recursive:true});
const image=await loadImage('media/seiko-silver-twotone-photos/source-main.webp');
const clasp=await loadImage('media/seiko-blue-twotone-photos/clasp-illustration.webp');
const cv=createCanvas(1024,1536),c=cv.getContext('2d'),bg='#1a403a';
c.fillStyle=bg;c.fillRect(0,0,1024,1536);
const x=(1024-image.width)/2,y=20;c.drawImage(image,x,y);
// Native scale; blend background margins only, not product pixels.
for(const [a,b,left] of [[x,x+55,true],[x+image.width-55,x+image.width,false]]){
 const g=c.createLinearGradient(a,0,b,0);g.addColorStop(0,left?bg:'#1a403a00');g.addColorStop(1,left?'#1a403a00':bg);c.fillStyle=g;c.fillRect(a,y,b-a,image.height);
}
for(const [a,b,top] of [[y,y+50,true],[y+image.height-70,y+image.height,false]]){
 const g=c.createLinearGradient(0,a,0,b);g.addColorStop(0,top?bg:'#1a403a00');g.addColorStop(1,top?'#1a403a00':bg);c.fillStyle=g;c.fillRect(x,a,image.width,b-a);
}
c.fillStyle='#082f2a';c.beginPath();c.roundRect(40,1250,944,230,18);c.fill();c.strokeStyle='#b69a5f';c.lineWidth=1.2;c.stroke();
c.save();c.beginPath();c.roundRect(65,1304,320,320*500/1376,10);c.clip();
c.drawImage(clasp,0,150,1376,500,65,1304,320,320*500/1376);c.restore();
c.fillStyle='#fff8e9';c.font='600 42px Bengali';c.fillText('বাটারফ্লাই লক',420,1340);
c.fillStyle='#d7b87a';c.font='600 25px Bengali';c.fillText('টু-টোন স্টেইনলেস স্টিল চেইন',422,1388);
c.fillStyle='#c8cec3';c.font='600 21px Bengali';c.fillText('লকের উপস্থাপনামূলক ছবি',422,1430);
fs.writeFileSync(dir+'01-main-master.png',cv.toBuffer('image/png'));
