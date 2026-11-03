import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');
const base='.tmp/womens-stone-silver/masters',out='downloads/womens-stone-silver';
fs.mkdirSync(out,{recursive:true});
const image=await loadImage(base+'/main.png');
if(image.width!==image.height)throw new Error('Main must be square');
const cv=createCanvas(image.width,image.height),c=cv.getContext('2d');c.drawImage(image,0,0);
const scale=image.width/1024;const label='বাটারফ্লাই লক';c.font=`600 ${Math.round(34*scale)}px Bengali`;
const x=Math.round(42*scale),y=image.height-Math.round(86*scale),w=Math.ceil(c.measureText(label).width)+Math.round(46*scale),h=Math.round(60*scale);
c.fillStyle='rgba(255,250,247,.96)';c.beginPath();c.roundRect(x,y,w,h,12);c.fill();
c.strokeStyle='#c08f9a';c.lineWidth=1.3;c.stroke();c.fillStyle='#653b4a';c.textAlign='center';c.fillText(label,x+w/2,y+Math.round(42*scale));
fs.writeFileSync(out+'/01-main.png',cv.toBuffer('image/png'));
for(const [kind,name] of [['wrist','02-wrist'],['detail','03-detail']]){
 const im=await loadImage(base+'/'+kind+'.png');if(im.width!==im.height)throw new Error(kind+' must be square');
 fs.copyFileSync(base+'/'+kind+'.png',out+'/'+name+'.png');
}
console.log('Three square native-pixel masters; main-only Bengali clasp label.');
