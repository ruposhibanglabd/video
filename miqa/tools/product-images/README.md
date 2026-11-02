# Product-image tools

## সক্রিয় V2: সম্পূর্ণ জেনারেটেড রিডিজাইন

বর্তমান নিয়ম: [`creative/PRODUCT-IMAGES-GUIDE.md`](../../creative/PRODUCT-IMAGES-GUIDE.md)। ক্লায়েন্টের ছবি রেফারেন্স; পুরো দৃশ্য নতুন করে জেনারেট করতে হবে। কোনো কাটআউট, ফিচার-পিল বা আরোপিত ছায়া নয়।

| ফাইল | কাজ |
|---|---|
| `export_redesign.py` | সম্পূর্ণ জেনারেটেড পাঁচটি বর্গাকার দৃশ্যকে 2000×2000 sRGB JPG, ZIP ও hash manifest-এ রপ্তানি করে। কোনো ঘড়ি সেগমেন্টেশন, লেখা বা কম্পোজিটিং করে না। নেটিভ মাপ আলাদা রেকর্ড করে |

```bash
python3 -m venv /tmp/miqa-image-tools
/tmp/miqa-image-tools/bin/pip install pillow
/tmp/miqa-image-tools/bin/python miqa/tools/product-images/export_redesign.py \
  miqa/products/fiyota-silver/work/redesign-v2 \
  miqa/deliveries/2026-11-03_set-a/01_fiyota-silver/redesign-v2 \
  fiyota-silver
```

অন্য প্রোডাক্টের ফিচার-শটের জন্য স্ক্রিপ্টের `SHOTS` ম্যাপ বদলাতে হবে। জেনারেট করা PNG ও QC ক্রপ `products/<slug>/work/`-এ থাকে, Git-এ যায় না।

## ঐতিহাসিক V1 — নতুন কাজে ব্যবহার করবেন না

নিচের স্ক্রিপ্টগুলো আগের কাটআউট-ভিত্তিক ডেলিভারির রেকর্ড। **D32–D35 এগুলোর ওয়েবসাইট-ছবির কর্মপ্রবাহ বাতিল করেছে।** কোড ইতিহাসের জন্য রাখা হয়েছে; নতুন প্রোডাক্টে চালালে আবার ভুল ডেলিভারি হবে।

| ফাইল | পুরোনো কাজ |
|---|---|
| `segment.py` | GrabCut ও edge refinement দিয়ে ঘড়ির কাটআউট |
| `retouch.py` | চেনের প্রতিফলন রিটাচ |
| `compose.py` | পাঁচটি কম্পোজিট, ছায়া ও হাতে-পরা প্লেটে কাটআউট বসানো |
| `chip.mjs` | গোল ইনসেট ও বাংলা লেখার পিল |

পুরোনো ধাপের বিস্তারিত: [`RUNBOOK-PRODUCT-IMAGES-V1.md`](../../production/RUNBOOK-PRODUCT-IMAGES-V1.md)। বর্তমান ধাপ: [`RUNBOOK §9`](../../production/RUNBOOK.md)।
