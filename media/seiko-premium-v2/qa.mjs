import {execFileSync,spawnSync} from 'node:child_process';import fs from 'node:fs';import ff from '@ffmpeg-installer/ffmpeg';import probe from '@ffprobe-installer/ffprobe';
fs.mkdirSync('.tmp/seiko-v2/qa',{recursive:true});
for(const name of ['MIQA-SEIKO-Premium-V2-4K','MIQA-SEIKO-Premium-V2-Facebook-1080p']){
 const file=`downloads/${name}.mp4`;
 const info=execFileSync(probe.path,['-v','error','-count_frames','-show_format','-show_streams','-of','json',file],{maxBuffer:1e7}).toString();fs.writeFileSync(`.tmp/seiko-v2/qa/${name}-probe.json`,info);
 const run=spawnSync(ff.path,['-hide_banner','-i',file,'-vf','blackdetect=d=0.05:pix_th=0.03:pic_th=0.98','-af','ebur128=peak=true','-f','null','-'],{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:20e6});fs.writeFileSync(`.tmp/seiko-v2/qa/${name}-decode-audio.log`,run.stderr);if(run.status!==0)throw new Error(run.stderr);console.log(name,JSON.parse(info).streams.map(s=>({codec:s.codec_name,width:s.width,height:s.height,frames:s.nb_read_frames,duration:s.duration})));console.log(run.stderr.slice(-600));
}

execFileSync(ff.path,['-y','-v','error','-i','downloads/MIQA-SEIKO-Premium-V2-Facebook-1080p.mp4','-vf','fps=2,scale=270:480','-q:v','2','.tmp/seiko-v2/qa/frame-%03d.jpg']);
