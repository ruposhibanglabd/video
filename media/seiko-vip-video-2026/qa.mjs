import {execFileSync,spawnSync} from 'node:child_process';import fs from 'node:fs';import ff from '@ffmpeg-installer/ffmpeg';import probe from '@ffprobe-installer/ffprobe';
fs.mkdirSync('.tmp/seiko-vip/qa',{recursive:true});
for(const name of ['MIQA-SEIKO-VIP-4K','MIQA-SEIKO-VIP-Facebook-1080p']){
 const file=`downloads/${name}.mp4`;
 const info=execFileSync(probe.path,['-v','error','-count_frames','-show_format','-show_streams','-of','json',file],{maxBuffer:1e7}).toString();fs.writeFileSync(`.tmp/seiko-vip/qa/${name}-probe.json`,info);
 const metadata=JSON.parse(info),v=metadata.streams.find(s=>s.codec_type==='video'),a=metadata.streams.find(s=>s.codec_type==='audio');
 const w=name.endsWith('1080p')?1080:2160;
 if(!v||!a||v.width!==w||v.height!==w*16/9||v.avg_frame_rate!=='30/1'||Number(v.nb_read_frames)!==1560||Math.abs(Number(v.duration)-52)>.001||v.pix_fmt!=='yuv420p'||a.sample_rate!=='48000'||a.channels!==2)throw new Error('Unexpected final media format: '+info);
 const run=spawnSync(ff.path,['-hide_banner','-i',file,'-vf','blackdetect=d=0.05:pix_th=0.03:pic_th=0.98','-af','ebur128=peak=true','-f','null','-'],{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:20e6});fs.writeFileSync(`.tmp/seiko-vip/qa/${name}-decode-audio.log`,run.stderr);if(run.status!==0||/black_start:|Error while decoding|Invalid data found/.test(run.stderr))throw new Error(run.stderr);console.log(name,JSON.parse(info).streams.map(s=>({codec:s.codec_name,width:s.width,height:s.height,frames:s.nb_read_frames,duration:s.duration})));console.log(run.stderr.slice(-600));
}

execFileSync(ff.path,['-y','-v','error','-i','downloads/MIQA-SEIKO-VIP-Facebook-1080p.mp4','-vf','fps=2,scale=270:480','-q:v','2','.tmp/seiko-vip/qa/frame-%03d.jpg']);
