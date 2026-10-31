// Generated photos only; native UHD typography. One process per scene bounds memory.
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';import {spawn} from 'node:child_process';import ff from '@ffmpeg-installer/ffmpeg';
const scenes=JSON.parse(fs.readFileSync('media/longines-2026/storyboard.json'));
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');GlobalFonts.registerFromPath('assets/fonts/Inter-Regular.ttf','Inter');
const idx=Number(process.argv[2]||0),s=scenes[idx],W=2160,H=3840,cv=createCanvas(W,H),c=cv.getContext('2d');
const im=await loadImage(s.image),im2=s.image2?await loadImage(s.image2):null;
const n0=Math.round(s.start*30),n1=Math.round(s.end*30),N=n1-n0;
const enc=spawn(ff.path,['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-threads','2','-x264-params','rc-lookahead=10','-pix_fmt','yuv420p','-profile:v','high','-level','5.1',`.tmp/longines/render/${String(idx).padStart(2,'0')}.mp4`],{stdio:['pipe','inherit','inherit']});
const done=new Promise((resolve,reject)=>{enc.on('error',reject);enc.on('exit',code=>code===0?resolve():reject(Error(`encoder ${code}`)));});
const text=(str,x,y,size,color='#FFF8E9',font='Bengali',align='center')=>{c.font=`${size}px ${font}`;c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y);};
for(let i=0;i<N;i++){
 const p=i/Math.max(1,N-1),t=(n0+i)/30;c.resetTransform();c.fillStyle='#082E25';c.fillRect(0,0,W,H);
 if(s.kind!=='dual'){
  const z=s.id==='hook'?1.14-.05*p:1.015+.035*p;let scale=Math.max(W/im.width,H/im.height)*z;
  if(s.id==='chain-guarantee')scale*=1.10;
  c.drawImage(im,(W-im.width*scale)/2,(H-im.height*scale)/2,im.width*scale,im.height*scale);
  let g=c.createLinearGradient(0,0,0,1100);g.addColorStop(0,'rgba(3,26,21,.97)');g.addColorStop(.64,'rgba(3,26,21,.82)');g.addColorStop(1,'rgba(3,26,21,0)');c.fillStyle=g;c.fillRect(0,0,W,1100);
  g=c.createLinearGradient(0,2600,0,H);g.addColorStop(0,'rgba(3,26,21,0)');g.addColorStop(.35,'rgba(3,26,21,.88)');g.addColorStop(1,'rgba(3,26,21,1)');c.fillStyle=g;c.fillRect(0,2600,W,H-2600);
 }
 c.save();c.scale(2,2);
 text('MIQA',125,142,26,'#D7B87A','Inter','left');text('WATCH COLLECTION',955,142,17,'#E9DFC9','Inter','right');
 c.strokeStyle='#BC9A55';c.lineWidth=1;c.globalAlpha=.45;c.beginPath();c.moveTo(125,172);c.lineTo(955,172);c.stroke();c.globalAlpha=1;
 text(s.eyebrow,540,238,19,'#D7B87A','Inter');
 const enter=Math.min(1,i/8),shift=8*(1-enter);c.globalAlpha=.35+.65*enter;
 text(s.title,540,321+shift,s.kind==='gifts'?42:45);if(s.kind!=='price'&&s.kind!=='dual')text(s.line,540,398+shift,32,'#D7B87A',s.line==='LONGINES'?'Inter':'Bengali');c.globalAlpha=1;
 if(s.kind==='price')text(s.line,540,1480,90,'#D7B87A');
 if(s.kind==='warranty'){
  // Blank staging card is generic retailer information, never a manufacturer certificate.
  c.fillStyle='#FFF8E9';c.fillRect(93,815,360,300);text('১ বছর',273,950,65,'#0A372E');text('ওয়ারেন্টি',273,1030,36,'#0A372E');
 }
 if(s.kind==='dual'){
  // Equal-aspect source crops keep both watch cases round on the dual card.
  c.drawImage(im,109,120,550,1157,118,470,404,850);c.drawImage(im2,109,120,550,1157,558,470,404,850);
  text('লেদার ভ্যারিয়েন্ট',320,1386,31);text('চেইন ভ্যারিয়েন্ট',760,1386,31);
  text('৳১,৫০০',320,1472,60,'#D7B87A');text('৳১,৭৯৯',760,1472,60,'#D7B87A');
  text(s.sub,540,1563,29);text(s.line,540,1640,41);text('বিক্রেতা: মিকা · MIQA',540,1704,22,'#D7B87A');text('miqawatch.vercel.app',540,1750,21,'#FFF8E9','Inter');
 }else{
  text(s.sub,540,s.kind==='price'?1587:1587,s.id==='chain-water'?24:29);text('বিক্রেতা: মিকা · MIQA',540,1665,22,'#D7B87A');
  if(s.kind==='gifts'){text('চেইন কাটার',340,1460,27);text('ব্যাটারি',760,1460,27);}
 }
 c.fillStyle='#BC9A55';c.globalAlpha=.65;c.fillRect(125,1790,830*t/48,2);c.globalAlpha=1;c.restore();
 if(i===Math.floor(N/2))fs.writeFileSync(`.tmp/longines/review/${s.id}.png`,cv.toBuffer('image/png'));
 const buf=cv.data();if(!enc.stdin.write(buf))await new Promise(r=>enc.stdin.once('drain',r));if(i%30===0&&global.gc)global.gc();
}
enc.stdin.end();await done;console.log(`Scene ${idx+1}/${scenes.length} ${s.id}: ${N} frames`);
