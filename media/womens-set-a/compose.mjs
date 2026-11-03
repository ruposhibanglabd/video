// Native-size export of the user-selected product image with correctly shaped Bengali label.
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';
import crypto from 'node:crypto';
GlobalFonts.registerFromPath('assets/fonts/NotoSansBengali-SemiBold.ttf','Bengali');
const source='media/womens-set-a/selected-product.png';
const im=await loadImage(source),canvas=createCanvas(im.width,im.height),c=canvas.getContext('2d');
c.drawImage(im,0,0); // No enlargement, no change of product proportions.
const label='বাটারফ্লাই লক',fontSize=34;
c.font=`600 ${fontSize}px Bengali`;
const width=Math.ceil(c.measureText(label).width)+48,x=56,y=im.height-87,h=62;
c.fillStyle='rgba(255,250,247,.96)';c.beginPath();c.roundRect(x,y,width,h,13);c.fill();
c.strokeStyle='#c68f9d';c.lineWidth=1.4;c.stroke();
c.fillStyle='#653b4a';c.textAlign='center';c.fillText(label,x+width/2,y+43);
fs.mkdirSync('downloads/womens-set-a',{recursive:true});
const output='downloads/womens-set-a/01-main.png';fs.writeFileSync(output,canvas.toBuffer('image/png'));
fs.writeFileSync('media/womens-set-a/manifest.json',JSON.stringify({
 file:output,width:im.width,height:im.height,format:'PNG',upscaled:false,
 label,bytes:fs.statSync(output).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex'),
 source,selectedOption:2,brandSpellingConfirmed:false,
 note:'AI-generated reference-based photograph, not recovered documentary detail. Generated dial wordmark is not verified brand transcription. No factual diamond/material/water-depth claim.'
},null,2)+'\n');
console.log(`${output}: ${im.width}×${im.height}, ${fs.statSync(output).size} bytes`);
