# Set D — image generation prompt

For each of the 8 client photos, `generate_image` was called with the photo as
the reference and this prompt:

> Use the reference photo as the exact watch. Keep the case shape, dial, dial
> brand name and spelling, hands, markers, bracelet, crystal and colour exactly
> as in the reference. Re-render the whole watch, complete with the full
> bracelet, centered on a clean ivory-pearl studio background in the MIQA Ivory &
> Champagne theme (ivory #F6EDE3, pearl #FBF4F1, champagne #D9B779, rose-gold
> #E2A99A). Soft warm studio light, gentle shadow, premium e-commerce catalogue
> photography, square 1:1, 8k, sharp detail. No text overlays, no Bengali
> characters, no watermark, no hands, no model, no cropped bracelet, no extra
> logos. Keep the dial name exactly as in the reference.

## Reference → output

| output | reference |
|---|---|
| `set-d_01.jpg` | `IMG20261029120020.jpg` |
| `set-d_02.jpg` | `IMG20261029120021.jpg` |
| `set-d_03.jpg` | `IMG20261029120026.jpg` |
| `set-d_04.jpg` | `IMG20261029120027.jpg` |
| `set-d_05.jpg` | `IMG20261029120059.jpg` |
| `set-d_06.jpg` | `IMG20261029120100.jpg` |
| `set-d_07.jpg` | `IMG20261029120715.jpg` |
| `set-d_08.jpg` | `IMG20261029120716.jpg` |

## Feature chip

`make_chip.mjs` draws the Bengali feature chip with `@napi-rs/canvas` (Hind
Siliguri) and composites it at the bottom of each 1024×1024 render:

> ওয়াটার রেজিস্ট্যান্স · ৭ দিনের রিপ্লেসমেন্ট

## Theme

MIQA Ivory & Champagne: ivory #F6EDE3, pearl #FBF4F1, champagne #D9B779,
rose-gold #E2A99A. Soft warm studio light, premium e-commerce catalogue look.
