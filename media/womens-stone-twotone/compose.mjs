import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');
const base='.tmp/womens-stone-twotone/masters',out='downloads/womens-stone-twotone';
fs.mkdirSync(out,{recursive:true});
const image=await loadImage(base+'/main.png');
if(image.width!==image.height)throw new Error('Main must be square');
const cv=createCanvas(image.width,image.height),c=cv.getContext('2d');c.drawImage(image,0,0);
const label='বাটারফ্লাই লক';c.font='600 34px Bengali';
const x=42,y=image.height-86,w=Math.ceil(c.measureText(label).width)+46,h=60;
c.fillStyle='rgba(255,250,247,.96)';c.beginPath();c.roundRect(x,y,w,h,12);c.fill();
c.strokeStyle='#c08f9a';c.lineWidth=1.3;c.stroke();c.fillStyle='#653b4a';c.textAlign='center';c.fillText(label,x+w/2,y+42);
fs.writeFileSync(out+'/01-main.png',cv.toBuffer('image/png'));
for(const [kind,name] of [['wrist','02-wrist'],['detail','03-detail']]){
 const im=await loadImage(base+'/'+kind+'.png');if(im.width!==im.height)throw new Error(kind+' must be square');
 fs.copyFileSync(base+'/'+kind+'.png',out+'/'+name+'.png');
}
console.log('Three square native-pixel masters; main-only Bengali clasp label.');
