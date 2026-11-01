"""Confirmed TISSOT rectangular leather-watch campaign, generated imagery only."""
from pathlib import Path
import json
files={p.stem[:2]:str(p) for p in Path('.tmp/tissot/generated').glob('*.png')}
s=[]
def add(id,a,b,img,title,line,sub,kind='normal',eyebrow='TISSOT'):
 s.append(dict(id=id,start=a,end=b,image=files[img],title=title,line=line,sub=sub,kind=kind,eyebrow=eyebrow))
add('hook',0,3,'01','পরিপাটি স্টাইলের','নতুন পরিচয়','মিনিমাল ডিজাইন • রুচিশীল উপস্থিতি')
add('hero',3,7,'01','আয়তাকার ডায়াল','মিনিমাল ডিজাইন','টিসো · TISSOT')
add('leather',7,11,'08','১০০% চামড়ার বেল্ট','টেক্সচার ও ফিনিশ','পরিপাটি সাজের সঙ্গী',eyebrow='LEATHER DETAIL')
add('water',11,13,'09','ওয়াটারপ্রুফ সুবিধা','প্রতিদিনের পছন্দ','পানির ফোঁটায় ফিচারের উপস্থাপনা',eyebrow='EVERYDAY CONFIDENCE')
add('warranty',13,15.5,'05','এক বছরের ওয়ারেন্টি','আপনার পছন্দের সঙ্গে','',kind='warranty',eyebrow='ADDED ASSURANCE')
looks=[('01','সিলভার কেস','সাদা ডায়াল','কালো লেদার বেল্ট'),('03','গোল্ড কেস','কালো ডায়াল','কালো লেদার বেল্ট'),('06','ব্ল্যাক কেস','কালো ডায়াল','কালো লেদার বেল্ট'),('02','সিলভার কেস','ডার্ক ডায়াল','কালো লেদার বেল্ট'),('04','সিলভার কেস','সাদা ডায়াল','বাদামি লেদার বেল্ট'),('05','গোল্ড কেস','সাদা ডায়াল','বাদামি লেদার বেল্ট'),('07','সিলভার কেস','নীল ডায়াল','কালো লেদার বেল্ট')]
for i,(im,title,line,sub) in enumerate(looks):add(f'look-{i+1}',15.5+i*1.5,17+i*1.5,im,title,line,sub,kind='look',eyebrow='CHOOSE YOUR LOOK');s[-1]['index']=i
add('price',26,30.5,'01','আপনার পছন্দের টিসো','৳১,৫০০','প্রিমিয়াম বক্স ও ব্যাটারি ফ্রি',kind='price',eyebrow='TISSOT · MIQA')
add('gifts',30.5,34.2,'10','প্রিমিয়াম বক্স ও ব্যাটারি','একদম ফ্রি','বক্সের ডিজাইন উপস্থাপনামূলক',kind='gifts',eyebrow='COMPLIMENTARY GIFTS')
add('final',34.2,40,'07','আপনার স্টাইলে টিসো','৳১,৫০০','অর্ডার করুন মিকায়',kind='final',eyebrow='TISSOT · MIQA')
assert len(s)==15
Path('media/tissot-2026/storyboard.json').write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n')
