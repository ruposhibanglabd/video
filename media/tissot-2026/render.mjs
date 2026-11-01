// All input images are newly generated, not customer photo cutouts.
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';import {spawn} from 'node:child_process';import ff from '@ffmpeg-installer/ffmpeg';
const scenes=JSON.parse(fs.readFileSync('media/tissot-2026/storyboard.json'));
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');GlobalFonts.registerFromPath('assets/fonts/Inter-Regular.ttf','Inter');
const idx=Number(process.argv[2]||0),s=scenes[idx],W=2160,H=3840,cv=createCanvas(W,H),c=cv.getContext('2d');
const im=await loadImage(s.image),n0=Math.round(s.start*30),n1=Math.round(s.end*30),N=n1-n0;
const enc=spawn(ff.path,['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-threads','2','-x264-params','rc-lookahead=10','-pix_fmt','yuv420p','-profile:v','high','-level','5.1',`.tmp/tissot/render/${String(idx).padStart(2,'0')}.mp4`],{stdio:['pipe','inherit','inherit']});
const done=new Promise((resolve,reject)=>{enc.on('error',reject);enc.on('exit',code=>code===0?resolve():reject(Error(`encoder ${code}`)));});
const text=(str,x,y,size,color='#FFF8E9',font='Bengali',align='center')=>{c.font=`${size}px ${font}`;c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y);};
for(let i=0;i<N;i++){
 const p=i/Math.max(1,N-1),t=(n0+i)/30;c.resetTransform();c.fillStyle='#082E25';c.fillRect(0,0,W,H);
 const z=s.id==='hook'?1.45-.06*p:1.015+.035*p,scale=Math.max(W/im.width,H/im.height)*z;
 if(s.id==='leather'){
  // Emphasize the reference-matched black leather front in the material macro.
  c.drawImage(im,0,300,500,889,0,0,W,H);
 }else c.drawImage(im,(W-im.width*scale)/2,(H-im.height*scale)/2,im.width*scale,im.height*scale);
 let g=c.createLinearGradient(0,0,0,1100);g.addColorStop(0,'rgba(3,26,21,.97)');g.addColorStop(.64,'rgba(3,26,21,.82)');g.addColorStop(1,'rgba(3,26,21,0)');c.fillStyle=g;c.fillRect(0,0,W,1100);
 g=c.createLinearGradient(0,2600,0,H);g.addColorStop(0,'rgba(3,26,21,0)');g.addColorStop(.35,'rgba(3,26,21,.88)');g.addColorStop(1,'rgba(3,26,21,1)');c.fillStyle=g;c.fillRect(0,2600,W,H-2600);
 c.save();c.scale(2,2);
 text('MIQA',125,142,26,'#D7B87A','Inter','left');text('WATCH COLLECTION',955,142,17,'#E9DFC9','Inter','right');
 c.strokeStyle='#BC9A55';c.lineWidth=1;c.globalAlpha=.45;c.beginPath();c.moveTo(125,172);c.lineTo(955,172);c.stroke();c.globalAlpha=1;
 text(s.eyebrow,540,238,19,'#D7B87A','Inter');
 const enter=Math.min(1,i/8),shift=8*(1-enter);c.globalAlpha=.35+.65*enter;
 text(s.title,540,321+shift,s.kind==='gifts'?41:45);
 if(!['price','final'].includes(s.kind))text(s.line,540,398+shift,32,'#D7B87A');c.globalAlpha=1;
 if(['price','final'].includes(s.kind))text(s.line,540,1480,90,'#D7B87A');
 if(s.kind==='warranty'){
  // Retailer warranty information, never a manufacturer's certificate.
  c.fillStyle='#FFF8E9';c.fillRect(324,1432,432,166);text('১ বছর',540,1547,67,'#0A372E');
 }
 if(s.kind==='look')for(let q=0;q<7;q++){c.fillStyle=q===s.index?'#D7B87A':'#698177';c.beginPath();c.arc(444+q*32,1490,4,0,Math.PI*2);c.fill();}
 if(s.kind==='final'){
  text(s.sub,540,1575,42);text('বক্স ও ব্যাটারি একদম ফ্রি',540,1643,27,'#D7B87A');text('বিক্রেতা: মিকা · MIQA',540,1702,22);text('miqawatch.vercel.app',540,1750,21,'#FFF8E9','Inter');
 }else{
  if(s.sub)text(s.sub,540,1587,s.kind==='gifts'?23:29);
  text('বিক্রেতা: মিকা · MIQA',540,1665,22,'#D7B87A');
 }
 c.fillStyle='#BC9A55';c.globalAlpha=.65;c.fillRect(125,1790,830*t/40,2);c.globalAlpha=1;c.restore();
 if(i===Math.floor(N/2))fs.writeFileSync(`.tmp/tissot/review/${s.id}.png`,cv.toBuffer('image/png'));
 const buf=cv.data();if(!enc.stdin.write(buf))await new Promise(r=>enc.stdin.once('drain',r));if(i%30===0&&global.gc)global.gc();
}
enc.stdin.end();await done;console.log(`Scene ${idx+1}/${scenes.length} ${s.id}: ${N} frames`);
