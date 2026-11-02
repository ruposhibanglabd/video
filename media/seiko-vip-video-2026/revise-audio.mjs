// Add the missing opening narration without re-encoding either video stream.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import ff from '@ffmpeg-installer/ffmpeg';
const names=['MIQA-SEIKO-VIP-4K','MIQA-SEIKO-VIP-Facebook-1080p'];
const videoHash=p=>execFileSync(ff.path,['-v','error','-i',p,'-map','0:v:0','-c:v','copy','-f','hash','-hash','sha256','-'],{encoding:'utf8'}).trim();
const checks=[];
for(const name of names){
 const input=`downloads/${name}.mp4`,temp=`.tmp/seiko-vip/render/${name}-audio-fixed.mp4`;
 fs.copyFileSync(input,`.tmp/seiko-vip/render/${name}-before-hook.mp4`);
 execFileSync(ff.path,['-y','-v','warning','-i',input,'-i','.tmp/seiko-vip/render/mix.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-af','loudnorm=I=-15:TP=-2:LRA=7','-c:a','aac','-b:a','256k','-ar','48000','-t','52','-movflags','+faststart',temp],{stdio:'inherit'});
 const before=videoHash(input),after=videoHash(temp);
 if(before!==after)throw new Error(`Unexpected video stream change: ${name}`);
 checks.push({file:input,beforeVideoPacketHash:before,afterVideoPacketHash:after,unchanged:true});
}
for(const name of names)fs.renameSync(`.tmp/seiko-vip/render/${name}-audio-fixed.mp4`,`downloads/${name}.mp4`);
fs.writeFileSync('media/seiko-vip-video-2026/qa/opening-fix-video-integrity.json',JSON.stringify(checks,null,2)+'\n');
console.log('Opening voice added to both exports; original video packets preserved.');
