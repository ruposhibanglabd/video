// v3 shot-driven compositor. Keeps delivered v2 untouched; incomplete assets fall back
// only for work-in-progress QC, never as a final-approved master.
import fs from 'node:fs';
import path from 'node:path';
import {spawn, execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createCanvas, Image, GlobalFonts} from '@napi-rs/canvas';
const require=createRequire(import.meta.url);
const FF=require('@ffmpeg-installer/ffmpeg').path, FP=require('@ffprobe-installer/ffprobe').path;
const HERE=path.dirname(fileURLToPath(import.meta.url)), ROOT=path.resolve(HERE,'../../../..');
const BASE=path.resolve(HERE,'..'), ASSET=path.join(BASE,'assets'), V3=path.join(ASSET,'v3'), OUT=path.join(BASE,'output');
const W=1080,H=1920,FPS=30, paper='#FBF6EA',ink='#16382A',brown='#654816';
for(const [f,n] of [['public/fonts/NotoSansBengali-Regular.ttf','BNU'],['public/fonts/NotoSansBengali-SemiBold.ttf','BNU'],['public/fonts/NotoSansBengali-Bold.ttf','BNU'],['public/fonts/NotoSansBengali-ExtraBold.ttf','BNU'],['creative-studio/assets/fonts/amiri/Amiri-Regular.ttf','Amiri'],['creative-studio/assets/fonts/amiri/AmiriQuran.ttf','AmiriQuran'],['public/fonts/Inter-SemiBold.ttf','Inter']]){
 const p=path.join(ROOT,f);if(fs.existsSync(p))GlobalFonts.registerFromPath(p,n);
}
const shot=(n,fallback)=>({n,fallback});
// 28 genuinely different compositions are specified. Missing new files are a DRAFT
// fallback only; this renderer refuses to label its output 'Final' until all exist.
const data=[
 {id:'s1',audio:'vo-s1.mp3',gap:1.2,shots:[shot(1),shot(2),shot(3,'shot-01.jpg')],lines:[['কাতার সোজা।','শিশুরা পেছনে।'],['শিশুরা এখনো শিখছে।']]},
 {id:'s2',audio:'vo-s2.mp3',gap:1.25,shots:[shot(4),shot(5),shot(6)],lines:[['সালাম ফেরার পর...'],['‘আর মসজিদে আসবি না!’'],['যে দরজা ছিল আপন...']],small:'নাট্যরূপ — হাদিসের সংলাপ নয়'},
 {id:'s3',audio:'vo-s3.mp3',gap:1.3,shots:[shot(7),shot(8,'bg-s3.jpg'),shot(9,'bg-s3.jpg')],lines:[['পরদিন আবার এল।'],['দরজায় দাঁড়াল...'],['একদিনের ধমক।','কত দিনের দূরত্ব?']]},
 {id:'s4',audio:'vo-s4.mp3',gap:1.4,shots:[shot(10,'bg-s4.jpg'),shot(11,'shot-04.jpg')],lines:[['শৃঙ্খলা দরকার।'],['অপমান নয়।']]},
 {id:'s5',audio:'vo-s5.mp3',gap:1.6,shots:[shot(12,'bg-s4.jpg'),shot(13,'bg-s5.jpg')],lines:[['কঠোর হলে মানুষ','সরে যেত।'],['কোমলতার শিক্ষা।']],ref:'সূরা আলে ইমরান · ৩:১৫৯',arabic:'وَلَوْ كُنْتَ فَظًّا غَلِيظَ الْقَلْبِ لَانْفَضُّوا مِنْ حَوْلِكَ'},
 {id:'s6',audio:'vo-s6.mp3',gap:0.85,shots:[shot(14),shot(15,'bg-s6.jpg')],lines:[['নাতনি উমামাকে বহন করতেন।'],['সিজদায় নামাতেন।','দাঁড়ালে আবার তুলতেন।']],ref:'সহীহ বুখারী · ৫১৬'},
 {id:'s6a',audio:'vo-s6-arabic.mp3',gap:1.1,shots:[shot(16,'bg-s5.jpg')],lines:[['সিজদায় নামাতেন।','দাঁড়ালে আবার তুলতেন।']],arabic:'فَإِذَا سَجَدَ وَضَعَهَا، وَإِذَا قَامَ حَمَلَهَا',ref:'সহীহ বুখারী · ৫১৬',silencePad:true},
 {id:'s7',audio:'vo-s7.mp3',gap:1.2,shots:[shot(17,'shot-14.jpg'),shot(18,'bg-s6.jpg')],lines:[['সিজদা দীর্ঘ হলো।'],['শিশুটিকে তাড়াহুড়ো করে','নামাতে চাননি।']],ref:'সুনানে নাসাঈ · ১১৪১ (সহীহ)',small:'বর্ণনায় হাসান অথবা হুসাইন — একজন'},
 {id:'s8',audio:'vo-s8.mp3',gap:1.2,shots:[shot(19,'bg-s8.jpg'),shot(20,'shot-04.jpg'),shot(21,'bg-s8.jpg'),shot(22,'shot-06.jpg')],lines:[['আগে পাশে রাখুন।'],['বিপদ হলে আলতো করে থামান।'],['নামাজ শেষে শান্তভাবে শেখান।'],['নিয়ম শেখাই।','লজ্জা দিয়ে তাড়াই না।']]},
 {id:'s9',audio:'vo-s9-s10.mp3',trim:[0,15.75],gap:0.85,shots:[shot(23,'bg-s9.jpg'),shot(24,'bg-s7.jpg'),shot(25,'bg-s9.jpg')],lines:[['ইবাদতে বেড়ে ওঠা যুবক।'],['যার হৃদয় মসজিদে জড়িয়ে।'],['কোন স্মৃতি নিয়ে ফিরছে শিশু?']],ref:'সহীহ বুখারী · ৬৬০'},
 {id:'s10',audio:'vo-s9-s10.mp3',trim:[15.75,29.304],gap:2.1,shots:[shot(26,'bg-s8.jpg'),shot(27,'shot-07.jpg'),shot(28,'bg-s9.jpg')],lines:[['ধমক দরজা বন্ধ করে।'],['মমতা আবার খুলে দেয়।'],['কাতার সোজা। হৃদয় খোলা।','চল, মসজিদে যাই।']]},
];
const duration=p=>+execFileSync(FP,['-v','error','-show_entries','format=duration','-of','csv=p=0',p],{encoding:'utf8'}).trim();
let clock=0;for(const s of data){s.file=path.join(V3,s.audio);s.voDur=s.trim?s.trim[1]-s.trim[0]:duration(s.file);s.start=clock+0.24;s.end=s.start+s.voDur;s.shotStart=s.start-0.24;s.shotEnd=s.end+s.gap;clock=s.shotEnd;}
const total=clock,missing=data.flatMap(s=>s.shots.filter(q=>!fs.existsSync(path.join(V3,`shot-${String(q.n).padStart(2,'0')}.jpg`))).map(q=>q.n));
const files=new Map();for(const s of data)for(const q of s.shots){const candidate=path.join(V3,`shot-${String(q.n).padStart(2,'0')}.jpg`);const fp=fs.existsSync(candidate)?candidate:path.join(q.fallback?.startsWith('shot-')?V3:ASSET,q.fallback||'bg-s4.jpg');if(!fs.existsSync(fp))throw Error(`Missing ${fp}`);q.path=fp;files.set(fp,true);}
const images=new Map();for(const f of files.keys()){const i=new Image();i.src=fs.readFileSync(f);images.set(f,i);}
// Image decoding can be lazy. Scratch pixel read retries before any frame is painted.
for(const [f,img] of images){const c=createCanvas(16,16),g=c.getContext('2d');let ok=false;for(let j=0;j<12;j++){await new Promise(r=>setTimeout(r,80+j*35));g.clearRect(0,0,16,16);g.drawImage(img,0,0,16,16);const p=g.getImageData(8,8,1,1).data;if(p[3]>10&&p[0]+p[1]+p[2]>5){ok=true;break;}}if(!ok)throw Error('Image did not decode: '+f);}
const avatar=new Image();avatar.src=fs.readFileSync(path.join(ROOT,'creative-studio/assets/brand/avatar-ring.png'));
{const c=createCanvas(16,16),g=c.getContext('2d');let ok=false;for(let j=0;j<15;j++){await new Promise(r=>setTimeout(r,90+j*45));g.clearRect(0,0,16,16);g.drawImage(avatar,0,0,16,16);const p=g.getImageData(8,8,1,1).data;if(p[3]>20&&p[0]+p[1]+p[2]>20){ok=true;break;}}if(!ok)throw Error('Brand avatar failed to decode');}
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const canvas=createCanvas(W,H),ctx=canvas.getContext('2d');
function cover(img,frac,variant){
 const z=1.025+0.035*frac+0.05*(variant%2),scale=Math.max(W/img.width,H/img.height)*z;
 const dw=img.width*scale,dh=img.height*scale,offX=(variant%3-1)*0.18*(dw-W);
 const offY=((variant%2)?-.20:.15)*(dh-H);
 ctx.drawImage(img,(W-dw)/2+offX,(H-dh)/2+offY,dw,dh);
 // A neutral match grade, not a white wash; retain highlight and texture.
 ctx.fillStyle='rgba(255,249,235,.035)';ctx.fillRect(0,0,W,H);
}
function round(x,y,w,h,r=24){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function fit(text,fontMax,maxW,fam='BNU'){let z=fontMax;while(z>30){ctx.font=`700 ${z}px ${fam}`;if(ctx.measureText(text).width<maxW)break;z-=2;}return z;}
function textCard(lines,{y=365,arabic=null,ref=null,small=null,alpha=1}={}){
 ctx.save();ctx.globalAlpha=alpha;
 const h=arabic?Math.max(390,230+lines.length*78):Math.max(170,lines.length*78+80);
 round(70,y,940,h,26);ctx.fillStyle='rgba(251,246,234,.97)';ctx.fill();
 ctx.strokeStyle='rgba(101,72,22,.25)';ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';
 if(arabic){const size=fit(arabic,56,838,'AmiriQuran');ctx.font=`${size}px AmiriQuran`;ctx.fillText(arabic,540,y+90);ctx.fillStyle=brown;ctx.fillRect(410,y+135,260,2);}
 const offset=arabic?220:70;
 for(let j=0;j<lines.length;j++){ctx.fillStyle=ink;ctx.font=`700 ${fit(lines[j],lines.length>1?58:64,840)}px BNU`;ctx.fillText(lines[j],540,y+offset+j*74);}
 ctx.restore();
 if(ref){ctx.save();ctx.font='600 39px BNU';round(86,1658,ctx.measureText(ref).width+65,68,14);ctx.fillStyle='rgba(251,246,234,.97)';ctx.fill();ctx.fillStyle=brown;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(ref,104,1693);ctx.restore();}
 if(small){ctx.save();ctx.font='600 33px BNU';const ww=ctx.measureText(small).width;round(86,1565,Math.min(900,ww+50),58,12);ctx.fillStyle='rgba(251,246,234,.97)';ctx.fill();ctx.fillStyle=brown;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(small,106,1594);ctx.restore();}
}
function watermark(){ctx.save();round(366,1806,680,84,18);ctx.fillStyle='rgba(251,246,234,.96)';ctx.fill();ctx.font='italic 39px serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillStyle=ink;ctx.fillText('Abdur Rahman Nayeem',944,1845);ctx.drawImage(avatar,957,1814,66,66);ctx.restore();}
function paint(t){const s=data.find(q=>t>=q.shotStart&&t<q.shotEnd)||data.at(-1);
 const d=s.shotEnd-s.shotStart,local=clamp((t-s.shotStart)/d),index=Math.min(s.shots.length-1,Math.floor(local*s.shots.length)),pos=local*s.shots.length-index;
 const q=s.shots[index],img=images.get(q.path);cover(img,pos,index);
 // Cross dissolve only at intentional shot changes. No flash through white.
 if(index>0&&pos<0.075){const a=1-smooth(pos/0.075);ctx.save();ctx.globalAlpha=a;cover(images.get(s.shots[index-1].path),1,index-1);ctx.restore();}
 if(index===0&&s!==data[0]&&t-s.shotStart<0.32){const prev=data[data.indexOf(s)-1];ctx.save();ctx.globalAlpha=1-smooth((t-s.shotStart)/0.32);cover(images.get(prev.shots.at(-1).path),1,prev.shots.length-1);ctx.restore();}
 const phrase=s.lines[Math.min(index,s.lines.length-1)];
 const a=smooth(pos/0.16)*(t>s.end?1-smooth((t-s.end)/Math.max(.5,s.gap)):1);
 textCard(phrase,{y:s.id==='s5'||s.id==='s6a'?330:365,arabic:s.arabic||null,ref:s.ref,small:s.small,alpha:a});
 watermark();
 if(t>total-0.75){ctx.fillStyle=`rgba(0,0,0,${smooth((t-total+0.75)/0.75)})`;ctx.fillRect(0,0,W,H);}
}
function audioBuild(){fs.mkdirSync(OUT,{recursive:true});const audio=path.join(OUT,'v3-audio-draft.wav');const inputs=[],filters=[],labels=[];let inputN=0;
 for(let i=0;i<data.length;i++){const s=data[i],n=inputN++;inputs.push('-i',s.file);const ms=Math.round(s.start*1000);const trim=s.trim?`atrim=start=${s.trim[0]}:end=${s.trim[1]},asetpts=PTS-STARTPTS,`:'';filters.push(`[${n}:a]${trim}aresample=48000,aformat=channel_layouts=mono,pan=stereo|c0=c0|c1=c0,adelay=${ms}|${ms}[v${i}]`);labels.push(`[v${i}]`);}
 const ar=data.find(s=>s.id==='s6a');let k=0;for(const [start,end] of [[0,ar.shotStart-0.05],[ar.shotEnd+0.08,total]]){const d=end-start;if(d<=0)continue;const n=inputN++;inputs.push('-f','lavfi','-i',`aevalsrc=exprs=0.55*sin(2*PI*110*t)+0.3*sin(2*PI*164.81*t):s=48000:d=${d.toFixed(3)}`);const ms=Math.round(start*1000);filters.push(`[${n}:a]aformat=channel_layouts=mono,pan=stereo|c0=c0|c1=c0,afade=t=in:st=0:d=0.6,afade=t=out:st=${Math.max(0,d-.8).toFixed(3)}:d=0.8,volume=0.015,adelay=${ms}|${ms}[p${k}]`);labels.push(`[p${k++}]`);}
 filters.push(`${labels.join('')}amix=inputs=${labels.length}:duration=longest,volume=${labels.length},loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.891,volume=-4.7dB,alimiter=limit=0.84,aformat=sample_rates=48000:channel_layouts=stereo[a]`);
 execFileSync(FF,['-hide_banner','-loglevel','error','-y',...inputs,'-filter_complex',filters.join(';'),'-map','[a]','-t',String(total),'-c:a','pcm_s16le',audio],{stdio:'inherit',maxBuffer:1024*1024});return audio;
}
const stamp=t=>{let ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
// Short, legible companion subtitles (not misrepresented as verbatim transcript).
function srt(){const cues=[];for(const s of data){for(let j=0;j<s.lines.length;j++){const a=s.start+s.voDur*j/s.lines.length,b=s.start+s.voDur*(j+1)/s.lines.length; cues.push([a,b,s.lines[j].join('\n')]);}}fs.writeFileSync(path.join(OUT,'Masjid-Shishu-Bukhari-516-v3-draft.srt'),cues.map(([a,b,v],i)=>`${i+1}\n${stamp(a)} --> ${stamp(b)}\n${v}\n`).join('\n'));}
const arg=process.argv.slice(2);const get=(k)=>arg[arg.indexOf(k)+1];
console.log(JSON.stringify({duration:+total.toFixed(2),missing:[...new Set(missing)],scenes:data.map(s=>({id:s.id,start:+s.start.toFixed(2),end:+s.end.toFixed(2)}))}));
if(arg.includes('--plan'))process.exit(0);
if(arg.includes('--still')){paint(+get('--still'));fs.mkdirSync(path.dirname(get('--png')),{recursive:true});fs.writeFileSync(get('--png'),canvas.toBuffer('image/png'));process.exit(0);}
if(arg.includes('--thumb')){paint(data.at(-1).shotStart+data.at(-1).voDur*.78);fs.writeFileSync(get('--thumb'),canvas.toBuffer('image/png'));process.exit(0);}
if(arg.includes('--audio-only')){audioBuild();srt();process.exit(0);}
if(missing.length && !arg.includes('--draft'))throw Error('Cannot render final with missing shot images; use --draft only for internal preview.');
const audio=audioBuild();srt();const dest=path.join(OUT,missing.length?'Masjid-Shishu-Bukhari-516-v3-DRAFT.mp4':'Masjid-Shishu-Bukhari-516-v3-Final.mp4');
const ff=spawn(FF,['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0','-i',audio,'-map','0:v','-map','1:a','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart','-t',String(total),dest],{stdio:['pipe','inherit','inherit']});
ff.stdin.on('error',e=>{if(e.code!=='EPIPE')console.error(e);});
const N=Math.ceil(total*FPS);for(let i=0;i<N;i++){paint(i/FPS);const b=canvas.data();if(!ff.stdin.write(b))await new Promise(r=>ff.stdin.once('drain',r));if(i%600===0)console.log(JSON.stringify({frame:i,total:N,pct:+(i/N*100).toFixed(1)}));}
ff.stdin.end();const code=await new Promise(r=>ff.on('close',r));if(code)throw Error('ffmpeg exit '+code);console.log(JSON.stringify({done:true,dest,duration:total,missing:missing.length}));
