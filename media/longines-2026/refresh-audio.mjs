// Optional: refresh the soundtrack without re-encoding either video stream.
import fs from 'node:fs';import ff from '@ffmpeg-installer/ffmpeg';import {execFileSync} from 'node:child_process';
const master='downloads/MIQA-LONGINES-4K.mp4',social='downloads/MIQA-LONGINES-Facebook-1080p.mp4';
execFileSync(ff.path,['-y','-v','warning','-i',master,'-i','.tmp/longines/render/mix.wav','-map','0:v','-map','1:a','-c:v','copy','-af','loudnorm=I=-15:TP=-2:LRA=7','-c:a','aac','-b:a','256k','-ar','48000','-t','48','-movflags','+faststart','.tmp/longines/render/master-audio-refresh.mp4'],{stdio:'inherit'});
fs.renameSync('.tmp/longines/render/master-audio-refresh.mp4',master);
execFileSync(ff.path,['-y','-v','warning','-i',social,'-i',master,'-map','0:v','-map','1:a','-c','copy','-t','48','-movflags','+faststart','.tmp/longines/render/social-audio-refresh.mp4'],{stdio:'inherit'});
fs.renameSync('.tmp/longines/render/social-audio-refresh.mp4',social);
