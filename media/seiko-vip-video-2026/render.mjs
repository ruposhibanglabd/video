import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';import {spawn} from 'node:child_process';import ff from '@ffmpeg-installer/ffmpeg';
const scenes=JSON.parse(fs.readFileSync('media/seiko-vip-video-2026/storyboard.json'));
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');GlobalFonts.registerFromPath('assets/fonts/Inter-Regular.ttf','Inter');GlobalFonts.registerFromPath('assets/fonts/Inter-SemiBold.ttf','Inter');
const idx=Number(process.argv[2]||0),s=scenes[idx],still=process.argv.includes('--still'),W=2160,H=3840,cv=createCanvas(W,H),c=cv.getContext('2d');
const im=s.image?await loadImage(s.image):null;
const lookScenes=scenes.filter(x=>x.kind==='look');
const comparisonImages=s.kind==='final'?await Promise.all(lookScenes.map(x=>loadImage(x.image))):[];
const CROPS=[[330,50,940,1500],[260,30,734,1190],[400,100,1248,1848],[80,50,736,1110],[95,190,578,1070]];
const n0=Math.round(s.start*30),n1=Math.round(s.end*30),N=n1-n0;
let enc,done;if(!still){enc=spawn(ff.path,['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-threads','2','-x264-params','rc-lookahead=10','-pix_fmt','yuv420p','-profile:v','high','-level','5.1',`.tmp/seiko-vip/render/${String(idx).padStart(2,'0')}.mp4`],{stdio:['pipe','inherit','inherit']});done=new Promise((resolve,reject)=>{enc.on('error',reject);enc.on('exit',code=>code===0?resolve():reject(Error(`encoder ${code}`)));});}
function text(str,x,y,size,color='#FFF8E9',font='Bengali',align='center',max=830){if(!str)return;c.font=`600 ${size}px ${font}`;while(c.measureText(str).width>max&&size>15){size-=1;c.font=`600 ${size}px ${font}`;}c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y);}
function plate(p){
 c.fillStyle='#082e25';c.fillRect(0,0,W,H);let g=c.createRadialGradient(1080,1900,100,1080,1900,1800);g.addColorStop(0,'#245447');g.addColorStop(1,'#061f19');c.fillStyle=g;c.fillRect(0,0,W,H);
 const z=1+.015*p,box={x:190,y:910,w:1780,h:2170};let [sx,sy,sw,sh]=CROPS[s.index];const k=Math.min(box.w/sw,box.h/sh)*z,dw=sw*k,dh=sh*k,x=1080-dw/2,y=box.y+(box.h-dh)/2;
 c.save();c.shadowColor='rgba(0,0,0,.25)';c.shadowBlur=40;c.shadowOffsetY=14;c.fillStyle='#082e25';c.beginPath();c.roundRect(x-2,y-2,dw+4,dh+4,20);c.fill();c.restore();
 c.save();c.beginPath();c.roundRect(x,y,dw,dh,18);c.clip();c.drawImage(im,sx,sy,sw,sh,x,y,dw,dh);c.restore();c.strokeStyle='rgba(215,184,122,.24)';c.lineWidth=1.5;c.beginPath();c.roundRect(x,y,dw,dh,18);c.stroke();
}
// Coordinates below are logical 1080×1920; rendering is native 2× UHD.
function priceCard(x,y,w,h,size=82){
 c.fillStyle='#fff8e9';c.beginPath();c.roundRect(x,y,w,h,12);c.fill();
 c.strokeStyle='#bc9a55';c.lineWidth=1.5;c.stroke();
 text('৳১,৭৫০',x+w/2,y+h*.73,size,'#0a372e');
}
function comparison(){
 const labels=['ব্লু · গোল্ড','ব্লু · টু-টোন','অ্যাকোয়া · গোল্ড','গ্রে · টু-টোন','সাদা · গোল্ড'];
 const numbers=['০১','০২','০৩','০৪','০৫'];
 for(let q=0;q<5;q++){
  const x=q<3?125+q*274:262+(q-3)*274,y=q<3?450:800,w=250,h=330;
  c.fillStyle='#113d31';c.beginPath();c.roundRect(x,y,w,h,16);c.fill();
  c.strokeStyle='rgba(215,184,122,.48)';c.lineWidth=1.3;c.stroke();
  const img=comparisonImages[q],[sx,sy,sw,sh]=CROPS[q];
  if(sx<0||sy<0||sx+sw>img.width||sy+sh>img.height)throw new Error('Invalid appearance crop');
  const k=Math.min(226/sw,254/sh),dw=sw*k,dh=sh*k;
  c.save();c.beginPath();c.roundRect(x+8,y+8,w-16,266,10);c.clip();
  c.drawImage(img,sx,sy,sw,sh,x+(w-dw)/2,y+12+(254-dh)/2,dw,dh);c.restore();
  c.fillStyle='#fff8e9';c.beginPath();c.roundRect(x+10,y+10,45,37,7);c.fill();text(numbers[q],x+32.5,y+37,25,'#0a372e');
  text(labels[q],x+w/2,y+306,30,'#fff8e9','Bengali','center',w-18);
 }
}
for(let i=still?Math.floor(N/2):0;i<N;i++){
 const p=i/Math.max(1,N-1),ease=.5-.5*Math.cos(Math.PI*p),t=(n0+i)/30;c.resetTransform();c.globalAlpha=1;c.fillStyle='#062b22';c.fillRect(0,0,W,H);
 if(s.kind==='look')plate(ease);
 else if(['commitment','final'].includes(s.kind)){
  const g=c.createRadialGradient(1080,1700,180,1080,1700,2350);g.addColorStop(0,'#174b3d');g.addColorStop(1,'#041d17');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.strokeStyle='rgba(215,184,122,.07)';c.lineWidth=2;for(let q=0;q<5;q++){c.beginPath();c.arc(1080,1810,600+q*80+20*ease,-2.6,.6);c.stroke();}
 }else{
  c.save();c.translate(W/2,H/2);const roll=s.kind==='hook'?(-.45+.8*ease):s.id==='angle-left'?(-.35+.55*ease):0;c.rotate(roll*Math.PI/180);const zoom=s.kind==='hook'?1.06-.035*ease:1.015+.025*ease;c.scale(zoom,zoom);c.translate(-W/2,-H/2);
  if(s.kind==='hook')c.drawImage(im,250,80,500,889,0,0,W,H);
  else{const k=Math.max(W/im.width,H/im.height);const dx=(W-im.width*k)/2+(s.kind==='angle'?16*(ease-.5):0);c.drawImage(im,dx,(H-im.height*k)/2,im.width*k,im.height*k);}c.restore();
 }
 if(!['commitment','final'].includes(s.kind)){
  let g=c.createLinearGradient(0,0,0,1130);g.addColorStop(0,'rgba(3,25,20,.96)');g.addColorStop(.60,'rgba(3,25,20,.83)');g.addColorStop(1,'rgba(3,25,20,0)');c.fillStyle=g;c.fillRect(0,0,W,1130);
  g=c.createLinearGradient(0,2660,0,H);g.addColorStop(0,'rgba(3,25,20,0)');g.addColorStop(.37,'rgba(3,25,20,.86)');g.addColorStop(1,'rgba(3,25,20,.99)');c.fillStyle=g;c.fillRect(0,2660,W,H-2660);
 }
 c.save();c.scale(2,2);text('MIQA',125,142,26,'#D7B87A','Inter','left');text('WATCH COLLECTION',955,142,17,'#E9DFC9','Inter','right');c.strokeStyle='rgba(188,154,85,.42)';c.lineWidth=1;c.beginPath();c.moveTo(125,172);c.lineTo(955,172);c.stroke();
 text(s.eyebrow,540,238,28,'#D7B87A','Inter');const enter=Math.min(1,i/9),shift=9*(1-enter);c.globalAlpha=.5+.5*enter;text(s.title,540,321+shift,s.title==='SEIKO VIP'?66:52,'#FFF8E9',s.title==='SEIKO VIP'?'Inter':'Bengali');if(!['price','final','commitment'].includes(s.kind))text(s.line,540,406+shift,40,'#D7B87A');c.globalAlpha=1;
 if(['warranty','replacement'].includes(s.kind)){
  c.fillStyle='#fff8e9';c.beginPath();c.roundRect(323,1350,434,166,7);c.fill();text(s.badge,540,1468,76,'#0a372e');
 }
 if(s.kind==='steel'){
  c.strokeStyle='#bc9a55';c.lineWidth=1.5;c.beginPath();c.roundRect(220,1390,640,112,14);c.stroke();text('কালার গ্যারান্টি',540,1465,44,'#D7B87A');
 }
 if(s.kind==='look'){
  c.fillStyle='#fff8e9';c.beginPath();c.roundRect(355,1438,370,94,10);c.fill();
  text('লুক '+['০১ / ০৫','০২ / ০৫','০৩ / ০৫','০৪ / ০৫','০৫ / ০৫'][s.index],540,1502,37,'#0a372e');
 }else if(s.kind==='price')priceCard(270,1320,540,151,88);
 else if(s.kind==='final'){
  text('পাঁচটি রঙ ও ফিনিশ',540,397,35,'#D7B87A');comparison();priceCard(280,1200,520,128,80);
 }
 if(['hook','angle'].includes(s.kind))priceCard(310,1290,460,118,74);
 if(s.kind==='commitment'){
  text('নিট লাভের',540,620,56);text('৫%',540,955,265,'#D7B87A');c.strokeStyle='#BC9A55';c.lineWidth=1.4;c.beginPath();c.moveTo(365,1030);c.lineTo(715,1030);c.stroke();
  text('পথশিশুদের কর্মসংস্থানে',540,1150,45);text('ব্যয় করার অঙ্গীকার',540,1230,39,'#d7b87a');
  // Abstract opportunity/briefcase icon, not documentary beneficiary or outcome imagery.
  c.strokeStyle='rgba(215,184,122,.65)';c.lineWidth=2;c.beginPath();c.roundRect(498,1330,84,60,7);c.stroke();c.beginPath();c.roundRect(521,1317,38,16,4);c.stroke();c.beginPath();c.moveTo(499,1354);c.lineTo(581,1354);c.stroke();text(s.sub,540,1515,34,'#d8dfd2');
 }else if(s.kind==='final'){
  text(s.sub,540,1405,43);
  c.fillStyle='#fff8e9';c.beginPath();c.roundRect(175,1440,730,100,12);c.fill();
  text('miqawatch.vercel.app',540,1507,42,'#0a372e','Inter');
  text('১ বছরের ওয়ারেন্টি • ৭ দিনের রিপ্লেসমেন্ট',540,1600,31,'#d7b87a');
 }else if(s.kind!=='look'&&!['warranty','replacement','steel'].includes(s.kind))text(s.sub,540,['hook','angle'].includes(s.kind)?1510:1570,['water','butterfly'].includes(s.id)?30:37);
 text('বিক্রেতা: মিকা · MIQA',540,1702,27,'#d7b87a');
 c.fillStyle='#bc9a55';c.globalAlpha=.65;c.fillRect(125,1790,830*t/52,2);c.globalAlpha=1;c.restore();
 if(i===Math.floor(N/2))fs.writeFileSync(`.tmp/seiko-vip/review/${s.id}.png`,cv.toBuffer('image/png'));
 if(still)break;const buf=cv.data();if(!enc.stdin.write(buf))await new Promise(r=>enc.stdin.once('drain',r));if(i%30===0&&global.gc)global.gc();
}
if(!still){enc.stdin.end();await done;console.log(`Scene ${idx+1}/${scenes.length} ${s.id}: ${N} frames`);}else console.log(`Preflight ${s.id}`);
