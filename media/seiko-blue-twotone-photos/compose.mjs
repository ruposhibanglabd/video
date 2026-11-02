import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');
const dir='.tmp/seiko-blue-twotone/review/';fs.mkdirSync(dir,{recursive:true});
const image=await loadImage('media/seiko-blue-twotone-photos/source-main.webp');
const clasp=await loadImage('media/seiko-blue-twotone-photos/clasp-illustration.webp');
const cv=createCanvas(1600,1600),c=cv.getContext('2d'),bg='#0c3027';
c.fillStyle=bg;c.fillRect(0,0,1600,1600);
const x=(1600-image.width)/2,y=30;c.drawImage(image,x,y);
// Blend only empty background edges, never the watch or bracelet.
for(const [a,b,left] of [[x,x+90,true],[x+image.width-90,x+image.width,false]]){
 const g=c.createLinearGradient(a,0,b,0);g.addColorStop(0,left?bg:'#0c302700');g.addColorStop(1,left?'#0c302700':bg);c.fillStyle=g;c.fillRect(a,y,b-a,image.height);
}
for(const [a,b,top] of [[y,y+55,true],[y+image.height-55,y+image.height,false]]){
 const g=c.createLinearGradient(0,a,0,b);g.addColorStop(0,top?bg:'#0c302700');g.addColorStop(1,top?'#0c302700':bg);c.fillStyle=g;c.fillRect(x,a,image.width,b-a);
}
c.fillStyle='#082f2a';c.beginPath();c.roundRect(95,1335,1410,218,23);c.fill();
c.strokeStyle='#b69a5f';c.lineWidth=1.4;c.stroke();
c.save();c.beginPath();c.roundRect(125,1368,430,156,12);c.clip();
// Source crop keeps the open silver mechanism and two-tone end links. Equal aspect ratio.
c.drawImage(clasp,0,150,1376,500,125,1368,430,156.25);c.restore();
c.fillStyle='#fff8e9';c.font='600 54px Bengali';c.fillText('বাটারফ্লাই লক',610,1425);
c.fillStyle='#d7b87a';c.font='600 33px Bengali';c.fillText('টু-টোন স্টেইনলেস স্টিল চেইন',612,1475);
c.fillStyle='#c8cec3';c.font='600 23px Bengali';c.fillText('লকের উপস্থাপনামূলক ছবি',612,1514);
fs.writeFileSync(dir+'01-main-master.png',cv.toBuffer('image/png'));
