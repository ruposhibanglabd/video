from pathlib import Path
import json,shutil
R=Path('.tmp/seiko-vip');[ (R/d).mkdir(parents=True,exist_ok=True) for d in ['generated','audio','render','review','qa'] ]
for name,src in [
 ('08-blue-gold-wrist.webp','downloads/seiko-blue-gold/02-wrist.webp'),
 ('look-01-blue-gold.webp','media/seiko-blue-gold-photos/source-main.webp'),
 ('look-02-blue-twotone.webp','media/seiko-blue-twotone-photos/source-main.webp'),
 ('look-03-aqua-gold.webp','media/seiko-aqua-gold-photos/source-main.webp'),
 ('look-04-silver-twotone.webp','media/seiko-silver-twotone-photos/source-main.webp')]:shutil.copy2(src,R/'generated'/name)
scenes=[]
def add(id,start,end,image,kind,eyebrow,title,line='',sub='',**kw):
 scenes.append(dict(id=id,start=start,end=end,image=str(R/'generated'/image) if image else None,kind=kind,eyebrow=eyebrow,title=title,line=line,sub=sub,**kw))
add('crystal-hook',0,2.2,'01-crystal-macro.png','hook','SEIKO VIP','SEIKO VIP','স্টাইলের নতুন পরিচয়','৫টি লুক • আপনার পছন্দ')
add('angle-left',2.2,4.4,'02-angle-left.png','angle','SEIKO VIP','SEIKO VIP','প্রতিটি অ্যাঙ্গেলে','ব্লু ডায়াল • গোল্ডেন ফিনিশ')
add('angle-right',4.4,7.4,'03-angle-right.png','angle','SEIKO VIP','আপনার স্টাইলের সঙ্গী','৫টি আকর্ষণীয় লুক','ব্লু ডায়াল • গোল্ডেন ফিনিশ')
add('steel',7.4,11.5,'04-steel-macro.png','steel','MATERIAL & FINISH','স্টেইনলেস স্টিল চেইন','পরিপাটি প্রিমিয়াম ফিনিশ','কালার গ্যারান্টি')
add('butterfly',11.5,15.8,'05-butterfly.png','feature','BUTTERFLY CLASP','বাটারফ্লাই লক','মার্জিত ডিজাইন','লকের ধরন বোঝাতে উপস্থাপনা')
add('water',15.8,18.1,'06-water.png','feature','EVERYDAY CONFIDENCE','ওয়াটারপ্রুফ সুবিধা','স্টাইলে আত্মবিশ্বাস','পানির ফোঁটায় ফিচারের উপস্থাপনা')
add('warranty',18.1,20.9,'07-white-gold.png','warranty','ADDED ASSURANCE','এক বছরের ওয়ারেন্টি','নিশ্চিন্ত পছন্দের সঙ্গে','',badge='১ বছর')
add('replacement',20.9,24,'03-angle-right.png','replacement','ADDED CONFIDENCE','রিপ্লেসমেন্ট গ্যারান্টি','পছন্দে বাড়তি নিশ্চয়তা','',badge='৭ দিন')
looks=[('look-01-blue-gold.webp','রয়্যাল ব্লু ডায়াল','গোল্ডেন কেস ও চেইন'),('look-02-blue-twotone.webp','রয়্যাল ব্লু ডায়াল','সিলভার–গোল্ড টু-টোন'),('look-03-aqua-gold.webp','অ্যাকোয়া ব্লু ডায়াল','গোল্ডেন কেস ও চেইন'),('look-04-silver-twotone.webp','সিলভার গ্রে ডায়াল','সিলভার–গোল্ড টু-টোন'),('07-white-gold.png','সাদা / সিলভার ডায়াল','গোল্ডেন কেস ও চেইন')]
for i,(im,title,line) in enumerate(looks):add('look-'+str(i+1),24+i*2,26+i*2,im,'look','CHOOSE YOUR LOOK',title,line,'পাঁচটি লুক • আপনার পছন্দ',index=i)
add('price',34,39,'08-blue-gold-wrist.webp','price','SEIKO VIP · MIQA','হাতে পরলে যেমন দেখায়','৳১,৭৫০','নিজের স্টাইল বেছে নিন')
add('commitment',39,46.5,None,'commitment','MIQA · OUR COMMITMENT','মিকার অঙ্গীকার','','এটি মিকার ভবিষ্যৎ অঙ্গীকার')
add('final',46.5,52,None,'final','SEIKO VIP · MIQA','পছন্দের লুক বেছে নিন','৳১,৭৫০','অর্ডার করতে ওয়েবসাইটে যান')
assert len(scenes)==16 and sum(round((s['end']-s['start'])*30) for s in scenes)==1560
Path('media/seiko-vip-video-2026/storyboard.json').write_text(json.dumps(scenes,ensure_ascii=False,indent=2)+'\n')
print('16 scenes, 52 seconds, 1560 frames')
