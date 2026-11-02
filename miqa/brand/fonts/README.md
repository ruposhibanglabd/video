# MIQA Fonts

সব ফন্ট **SIL Open Font License 1.1** (বাণিজ্যিক ভিডিওতে ব্যবহারযোগ্য) — লাইসেন্স ফাইল: `OFL-*.txt`।
উৎস: [google/fonts](https://github.com/google/fonts) (GitHub API দিয়ে নামানো, ২ নভেম্বর ২০২৬)।
ভেরিয়েবল ফন্ট থেকে `fontTools.varLib.instancer` দিয়ে স্ট্যাটিক ইনস্ট্যান্স বানানো; ল্যাটিন ফন্টগুলো Latin-1 + যতিচিহ্নে subset করা (সাইজ কম)।

রেন্ডারে রেজিস্টার করুন **ফাইল-নাম = ফ্যামিলি alias** হিসেবে (যেমন `"TiroBangla-Regular"`), weight-matching নয় — দেখুন `miqa/tools/style-board.mjs`।

| ফাইল | ভূমিকা | লাইন |
|---|---|---|
| TiroBangla-Regular / -Italic | বাংলা ডিসপ্লে (সেরিফ, মার্জিত), দাম | মেয়েদের, কাপল |
| HindSiliguri-Light / Regular / Medium / SemiBold / Bold | বাংলা টেক্সট, CTA, সাবটাইটেল | সব |
| AnekBanglaSemiCondensed-Bold, AnekBangla-SemiBold / Bold / ExtraBold | বাংলা ডিসপ্লে (শক্তিশালী), দাম | ছেলেদের |
| CormorantGaramond-Light / Medium / SemiBold / Italic / MediumItalic | ইংরেজি ডিসপ্লে, ট্যাগলাইন | মেয়েদের, কাপল, সব (ট্যাগলাইন) |
| BodoniModa-Medium / Bold / MediumItalic (opsz 28) | ইংরেজি ডিসপ্লে | ছেলেদের |
| Montserrat-Regular / Medium / SemiBold / Bold | ইংরেজি লেবেল (ট্র্যাকড ক্যাপস) | সব |
| Cinzel-Medium / Bold | অস্থায়ী MIQA ওয়ার্ডমার্ক | সব (অফিসিয়াল লোগো আসা পর্যন্ত) |

## যাচাই করা নিয়ম (Skia / @napi-rs/canvas, ২ নভেম্বর ২০২৬)

- বাংলা যুক্তাক্ষর, য-ফলা, রেফ, ৳ — Tiro Bangla, Hind Siliguri, Anek Bangla-তে সঠিকভাবে রেন্ডার হয়।
- **বাংলা টেক্সটে `letterSpacing` দিলে কার-চিহ্ন ও যুক্তাক্ষর ভেঙে যায়** → বাংলায় ট্র্যাকিং সবসময় 0; শুধু ইংরেজি রানে ট্র্যাকিং।
- ল্যাটিন ফন্টে ৳ গ্লিফ নেই → ফন্ট-স্ট্যাকে সবসময় একটি বাংলা ফন্ট রাখুন: `"Montserrat-SemiBold", "HindSiliguri-SemiBold"` (fallback কাজ করে)।
- ♭ / ♯ জাতীয় চিহ্ন কোনো ফন্টে নেই — টেক্সটে "b"/"#" লিখুন।
