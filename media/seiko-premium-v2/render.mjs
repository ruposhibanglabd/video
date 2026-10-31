// Generated imagery input only. Run from repository root. Each scene is a fresh process.
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';import {spawn} from 'node:child_process';import ff from '@ffmpeg-installer/ffmpeg';
const scenes=JSON.parse(fs.readFileSync('media/seiko-premium-v2/storyboard.json'));
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');GlobalFonts.registerFromPath('assets/fonts/Inter-Regular.ttf','Inter');
const idx=Number(process.argv[2]||0),s=scenes[idx],W=2160,H=3840; const cv=createCanvas(W,H),c=cv.getContext('2d');
const im=await loadImage(`.tmp/seiko-v2/generated/${s.id}.png`);
const n0=Math.round(s.start*30),n1=Math.round(s.end*30),N=n1-n0;
const enc=spawn(ff.path,['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-threads','2','-x264-params','rc-lookahead=10','-pix_fmt','yuv420p','-profile:v','high','-level','5.1',`.tmp/seiko-v2/render/${String(idx).padStart(2,'0')}.mp4`],{stdio:['pipe','inherit','inherit']});
let error;enc.on('error',e=>error=e);const done=new Promise((resolve,reject)=>enc.on('exit',code=>code===0?resolve():reject(new Error(`encoder ${code}`))));
const text=(str,x,y,size,color='#FFF8E9',font='Bengali',align='center')=>{c.font=`${size}px ${font}`;c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y);};
for(let i=0;i<N;i++){
 const p=i/Math.max(1,N-1),t=(n0+i)/30;c.resetTransform();c.fillStyle='#082E25';c.fillRect(0,0,W,H);
 const z=s.id==='00-cinematic'?1.065-.045*p:1.015+.035*p;let iw=im.width,ih=im.height;let scale=Math.max(W/iw,H/ih)*z;let dx=(W-iw*scale)/2,dy=(H-ih*scale)/2;
 // Black portrait emphasizes the correctly preserved dial and top gold-center links.
 if(s.id==='05B-black'){scale*=1.12;dx=(W-iw*scale)/2;dy=(H-ih*scale)/2+90;}
 c.drawImage(im,dx,dy,iw*scale,ih*scale);
 let g=c.createLinearGradient(0,0,0,1100);g.addColorStop(0,'rgba(3,26,21,.97)');g.addColorStop(.64,'rgba(3,26,21,.80)');g.addColorStop(1,'rgba(3,26,21,0)');c.fillStyle=g;c.fillRect(0,0,W,1100);
 g=c.createLinearGradient(0,2600,0,H);g.addColorStop(0,'rgba(3,26,21,0)');g.addColorStop(.35,'rgba(3,26,21,.88)');g.addColorStop(1,'rgba(3,26,21,1)');c.fillStyle=g;c.fillRect(0,2600,W,H-2600);
 c.save();c.scale(2,2);
 text('MIQA',125,142,26,'#D7B87A','Inter','left');text('WATCH COLLECTION',955,142,17,'#E9DFC9','Inter','right');
 c.strokeStyle='#BC9A55';c.lineWidth=1;c.globalAlpha=.45;c.beginPath();c.moveTo(125,172);c.lineTo(955,172);c.stroke();c.globalAlpha=1;
 text(s.eyebrow,540,238,19,'#D7B87A','Inter');
 const enter=Math.min(1,i/8);c.globalAlpha=.35+.65*enter;const shift=8*(1-enter);
 text(s.title,540,321+shift,s.id==='09-gifts'?43:47,s.id==='00-cinematic'?'#FFF8E9':'#FFF8E9',s.title==='SEIKO'?'Inter':'Bengali');text(s.line,540,s.id==='08-final'?1477:398+shift,s.id==='08-final'?91:32,'#D7B87A');c.globalAlpha=1;
 if(s.id==='04C-warranty'){ // Typeset a real Bengali overlay, not a fabricated certificate.
 c.fillStyle='#FFF8E9';c.fillRect(108,983,382,300);text('১ বছর',299,1104,61,'#0A372E');text('ওয়ারেন্টি',299,1176,35,'#0A372E');}
 if(s.id.startsWith('05')){for(let q=0;q<4;q++){c.fillStyle=q===idx-6?'#D7B87A':'#698177';c.beginPath();c.arc(492+q*32,1490,4,0,Math.PI*2);c.fill();}}
 if(s.id==='09-gifts'){text('চেইন কাটার',325,1475,29);text('ব্যাটারি',760,1475,29);text(s.sub,540,1587,28);text('বিক্রেতা: মিকা · MIQA',540,1665,23,'#D7B87A');}
 else if(s.id==='08-final'){
 text(s.sub,540,1573,42);text('বিক্রেতা: মিকা · MIQA',540,1639,25,'#D7B87A');text('miqawatch.vercel.app',540,1681,22,'#FFF8E9','Inter');
 }else{text(s.sub,540,1587,s.id==='06C-gift'?24:30);text('মিকা · MIQA',540,1665,22,'#D7B87A');}
 c.fillStyle='#BC9A55';c.globalAlpha=.65;c.fillRect(125,1738,830*t/44,2);c.globalAlpha=1;c.restore();
 if(i===Math.floor(N/2))fs.writeFileSync(`.tmp/seiko-v2/review/${s.id}.png`,cv.toBuffer('image/png'));
 const buf=cv.data();
 if(!enc.stdin.write(buf))await new Promise(r=>enc.stdin.once('drain',r));
 if(i%30===0&&global.gc)global.gc();
}
enc.stdin.end();await done;if(error)throw error;console.log(`Scene ${idx+1}/${scenes.length} ${s.id}: ${N} frames`);
