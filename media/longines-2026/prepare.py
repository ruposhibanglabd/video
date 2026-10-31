"""Prepare the confirmed two-variant, generated-only campaign timeline."""
import json
from pathlib import Path
base='downloads/longines-batch-01/'
extra='.tmp/longines/generated/'
files={p.stem[:2]:str(p) for p in Path(base).glob('*.png')}
files.update({p.stem[:2]:str(p) for p in Path(extra).glob('*.png')})
s=[]
def add(id,a,b,img,eyebrow,title,line,sub,kind='normal'):
 s.append(dict(id=id,start=a,end=b,image=files[img],eyebrow=eyebrow,title=title,line=line,sub=sub,kind=kind))
add('hook',0,3.3,'01','LONGINES','সময় বদলায়','রুচি থেকে যায়','আপনার নিজস্ব স্টাইল')
add('leather-detail',3.3,8.6,'08','LEATHER COLLECTION','১০০% চামড়ার বেল্ট','টেক্সচার ও ফিনিশ','লেদার ভ্যারিয়েন্ট')
add('leather-water',8.6,10.4,'10','LEATHER COLLECTION','ওয়াটারপ্রুফ সুবিধা','লেদার ভ্যারিয়েন্ট','পানির ফোঁটায় ফিচারের উপস্থাপনা')
add('leather-price',10.4,13.4,'01','LONGINES · LEATHER','লেদার ভ্যারিয়েন্ট','৳১,৫০০','১০০% চামড়ার বেল্ট • ওয়াটারপ্রুফ','price')
add('white-roman',13.4,15.1,'03','CHOOSE YOUR LOOK','সাদা ডায়াল','রোমান ডিজাইন','কালো লেদার বেল্ট')
add('black-roman',15.1,16.8,'04','CHOOSE YOUR LOOK','কালো ডায়াল','রোমান ডিজাইন','কালো লেদার বেল্ট')
add('black-champagne',16.8,18.2,'02','CHOOSE YOUR LOOK','শ্যাম্পেন ডায়াল','সিম্পল ডিজাইন','কালো লেদার বেল্ট')
add('chain-hero',18.2,20,'05','CHAIN COLLECTION','পরিপাটি ফিনিশ','নজরকাড়া উপস্থিতি','চেইন ভ্যারিয়েন্ট')
add('butterfly',20,23.2,'09','CHAIN COLLECTION','বাটারফ্লাই লক','পরিপাটি ডিজাইন','চেইন ভ্যারিয়েন্টের ক্ল্যাস্প')
add('chain-guarantee',23.2,25.7,'07','CHAIN COLLECTION','চেইন কালার','গ্যারান্টি','টু টোন চেইনের ফিনিশিং')
add('chain-water',25.7,27.5,'11','CHAIN COLLECTION','ওয়াটারপ্রুফ সুবিধা','চেইন ভ্যারিয়েন্ট','কোনো গভীরতা বা চাপের রেটিং দাবি নয়')
add('chain-warranty',27.5,30.4,'15','CHAIN COLLECTION','এক বছরের ওয়ারেন্টি','শুধু চেইন ভ্যারিয়েন্টে','পরিপাটি পছন্দের সঙ্গে নিশ্চয়তা','warranty')
add('chain-price',30.4,34.3,'05','LONGINES · CHAIN','চেইন ভ্যারিয়েন্ট','৳১,৭৯৯','বাটারফ্লাই লক • এক বছরের ওয়ারেন্টি','price')
add('gold-black',34.3,35.9,'06','CHOOSE YOUR LOOK','গোল্ড চেইন','কালো ডায়াল','আপনার পছন্দের ফিনিশ')
add('two-tone',35.9,37.5,'07','CHOOSE YOUR LOOK','টু টোন চেইন','কালো ডায়াল','আপনার পছন্দের ফিনিশ')
add('leather-life',37.5,38.8,'13','EVERYDAY STYLE','লেদারে পরিপাটি','LONGINES','অফিস কিংবা ফরমাল সাজে')
add('chain-life',38.8,40.1,'14','EVERYDAY STYLE','চেইনে আকর্ষণীয়','LONGINES','অফিস কিংবা ফরমাল সাজে')
add('free-gifts',40.1,44.7,'12','COMPLIMENTARY GIFTS','ব্যাটারি ও চেইন কাটার','একদম ফ্রি','উভয় ভ্যারিয়েন্টের সঙ্গে','gifts')
add('final',44.7,48,'01','LONGINES · MIQA','আপনার পছন্দ, আপনার স্টাইল','অর্ডার করুন মিকায়','উভয়ের সঙ্গে ব্যাটারি ও চেইন কাটার ফ্রি','dual')
s[-1]['image2']=files['05']
Path('media/longines-2026/storyboard.json').write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n')
