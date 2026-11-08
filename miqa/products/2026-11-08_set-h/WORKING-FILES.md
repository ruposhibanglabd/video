# সেট H — ওয়ার্কিং ফাইল ও পুনর্নির্মাণের নিয়ম

এই ফোল্ডারের ছবিগুলো একবারে “পেইন্ট” করা নয় — প্লেট থেকে কোডে কাটা। তাই কোনো ছবি বদলাতে
হলে নিচের ধাপেই করতে হবে (হাত দিয়ে রিটাচ নিষিদ্ধ, [`IMAGE-RULES.md`](../../creative/IMAGE-RULES.md) §৫)।

## ফোল্ডার

| পথ | কী আছে |
|---|---|
| `source/` | ক্লায়েন্টের ৮টি ফোন-শট (`IMG20261029*.jpg`, ৩৪৬৮×৪৬২৪) — **অপরিবর্তিত** |
| `plates/` | প্রতি রঙের একটি প্লেট (১০২৪², পুরো ঘড়ি স্টেজে, ডায়াল লক করা) |
| `plates-stage/` | `unify_bg_h.mjs` চালানোর পর — সাতটির ব্যাকগ্রাউন্ড হুবহু এক |
| `plates/web/` | `_5_wrist`-এর রেফারেন্স-রেন্ডার (`wrist_<রঙ>.png`, ৯২৮×১১৫২) |
| `cutouts/` | পরীক্ষামূলক ম্যাট (`pymatting`) — **ব্যবহার হচ্ছে না**, দেখুন নিচে |
| `work/` | তুলনা/ইটারেশনের ফাইল — ডেলিভারিতে যাবে না |

## স্ক্রিপ্ট

| স্ক্রিপ্ট | ইনপুট → আউটপুট |
|---|---|
| `unify_bg_h.mjs <plates…>` | degree-2 ব্যাকগ্রাউন্ড ফিট + flat-field correction → `plates-stage/` |
| `shot_pack_h.mjs '<json>'` | প্লেট → `_1_main`, `_2_angle`, `_3_dial`, `_4_bracelet` (১৬০০²) + থাম্ব |
| `hand_stage_h.mjs` | `wrist_hand.png` → স্টেজে বসানো হাত (পরীক্ষামূলক) |
| `wrist_compose_h.mjs '<json>'` | প্লেট + হাত প্লেট → `_5_wrist` (পরীক্ষামূলক) |
| `web_images_h.mjs`, `dial_crops_h.mjs`, `lock_crop_h.mjs` | রাউন্ড-১ এক্সপোর্টার — `shot_pack_h.mjs` এদের প্রতিস্থাপন করেছে |

### পুনর্নির্মাণ (হুবহু কমান্ড)

```bash
node miqa/products/2026-11-08_set-h/unify_bg_h.mjs \
  p01_green.png p02_champagne.png p04_silver.png p05_black.png \
  p06_blue.png p07_red.png p07_blacksteel.png

node miqa/products/2026-11-08_set-h/shot_pack_h.mjs '{
 "set-h-01-green":{"plate":"p01_green.png","shots":{
   "1_main":[512,512,1024,1024],"2_angle":[512,400,620,620],
   "3_dial":[512,430,470,470],"4_bracelet":[512,860,300,300]}}}'
```

## প্লেট ↔ ফাইল নাম (গুরুত্বপূর্ণ)

প্লেটের ফাইল-নাম আর স্লাগ এক নয় — কারণ রাউন্ড-২-এ কিছু প্লেট সরানো হয়েছে:

| স্লাগ | প্লেট ফাইল | মনে রাখতে হবে |
|---|---|---|
| `set-h-01-green` | `p01_green.png` | |
| `set-h-02-champagne` | `p02_champagne.png` | |
| `set-h-03-black` | `p05_black.png` | **p05**, p03 নয় |
| `set-h-04-silver` | `p04_silver.png` | |
| `set-h-05-blue` | `p06_blue.png` | **p06**, p05 নয় |
| `set-h-06-red` | `p07_red.png` | **p07** |
| `set-h-07-black-steel` | `p07_blacksteel.png` | `p08_blacksteel.png`-এর কপি |
| শেয়ার্ড লক | `p08_lock.png` | `p09_lock.png`-এর কপি |

## `_5_wrist` কেন কম্পোজিট নয়

কোডে ঘড়ি কেটে হাতে বসানোর চেষ্টা করা হয়েছিল (`wrist_compose_h.mjs`) — **সফল হয়নি**:
জেম-সেট বেজেল আর ব্রেসলেটের ফাঁকের ভেতর দিয়ে হাতের রঙ ঢুকে যেত, আর প্লেটের স্টেজের
সাথে হাতের স্টেজের টোন মিলত না। `pymatting` দিয়ে ম্যাট করলেও ব্রেসলেটের লিংক-ফাঁক
পরিষ্কার হয়নি (`cutouts/`, বাতিল)।

তাই `_5_wrist` **RUNBOOK §5 Tier-B**-তে: ক্লায়েন্টের ছবি (থেকে ঘড়ির ডিজাইন) রেফারেন্স দিয়ে
সরাসরি হাতে-পরা রেন্ডার। এতে ঘড়ির প্রতিটি পিক্সেল আসল, মুখ ফ্রেমে আসে না, আর একই
আলো-দিক (উপরে-বাঁ, ৫৬০০K) বজায় থাকে।

## রাউন্ড ২-এ প্রম্পটে যা কাজ করেছে

- ডায়ালের প্রতিটি লাইন **আলাদা করে**, ঠিক বানান দিয়ে লিখতে হবে — “top to bottom” ক্রমসহ
- “do not omit any element” — বার-উইন্ডো বাদ পড়া বন্ধ করে
- “The dial text must be CENTRE-ALIGNED in one single vertical column” — বার পাশে সরে যাওয়া বন্ধ করে
- “Keep the dial lettering exactly as in the reference” — **কাজ করে না**, লেখা নষ্ট হয়
- “Never write the word CHAMPAGNE / GOLD / BLACK anywhere on the dial” — অপ্রয়োজনীয় লেখা বন্ধ করে
