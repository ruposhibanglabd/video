import numpy as np, cv2, sys, os
from PIL import Image
S = 3468/1176
X0, Y0 = np.load('/tmp/job/cut_B_offset.npy')
def pc(x, y): return (x*S - X0, y*S - Y0)
CUT = np.array(Image.open('/tmp/job/cut_B_rt.png')).astype(np.float32)/255
# mild global lift on the watch (dial reads clean white, highlights protected)
# studio-exposure correction (photo was shot in dim light): levels + gamma, then punchier contrast on metal only
_rgb = np.clip(CUT[..., :3]/0.84, 0, 1)**0.8
_dial = np.zeros(CUT.shape[:2], np.uint8)
cv2.fillPoly(_dial, [np.array([((x*S - X0), (y*S - Y0)) for x, y in [(382,394),(658,394),(673,600),(650,818),(390,818),(370,600)]], np.int32)], 1)
_m = 1 - cv2.GaussianBlur(_dial.astype(np.float32), (0, 0), 4)[..., None]
_case = np.zeros(CUT.shape[:2], np.uint8)
cv2.fillPoly(_case, [np.array([((x*S - X0), (y*S - Y0)) for x, y in q], np.int32) for q in
    ([(366,366),(676,368),(694,600),(672,846),(370,846),(346,600)], [(686,572),(732,572),(732,646),(686,646)])], 1)
_br = (1 - cv2.GaussianBlur(_case.astype(np.float32), (0, 0), 3))[..., None]
_lift = _rgb*(1 - _br) + (0.24 + 0.76*_rgb)*_br            # bracelet: lift heavy dark reflections
_sc = 0.66*_lift + 0.34*(0.5 - 0.5*np.cos(np.pi*_lift))
CUT[..., :3] = _rgb*(1 - _m) + _sc*_m
CASE_C = pc(520, 605); CASE_TOP = pc(0, 372)[1]; CASE_BOT = pc(0, 838)[1]; TOP_END = pc(0, 165)[1]
OUT = '/tmp/job/out'; N = 2000
def hx(h): return np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], np.float32)/255
def smooth(t): t = np.clip(t, 0, 1); return t*t*(3 - 2*t)
def radial_bg(center, base, lift, edge, seed=1):
    yy, xx = np.mgrid[:N, :N].astype(np.float32)
    d = np.sqrt((xx - center[0])**2 + (yy - center[1])**2)/(N*0.72)
    t1 = smooth(d/0.55)[..., None]; t2 = smooth((d - 0.55)/0.65)[..., None]
    col = hx(lift)*(1 - t1) + hx(base)*t1
    col = col*(1 - t2) + hx(edge)*t2
    col += np.random.default_rng(seed).normal(0, 0.004, (N, N, 1)).astype(np.float32)
    return np.clip(col, 0, 1)
def fade(cut, top=None, bot=None):
    y = np.arange(cut.shape[0], dtype=np.float32); r = np.ones_like(y)
    if top: r *= smooth((y - top[0])/(top[1] - top[0]))
    if bot: r *= smooth((bot[1] - y)/(bot[1] - bot[0]))
    o = cut.copy(); o[..., 3] *= r[:, None]; return o
def place(cut, scale, angle, src, dst):
    pm = cut.copy(); pm[..., :3] *= pm[..., 3:4]
    sm = cv2.resize(pm, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    ax, ay = src[0]*scale, src[1]*scale
    M = cv2.getRotationMatrix2D((ax, ay), angle, 1.0); M[0, 2] += dst[0] - ax; M[1, 2] += dst[1] - ay
    o = cv2.warpAffine(sm, M, (N, N), flags=cv2.INTER_CUBIC, borderValue=(0, 0, 0, 0))
    a = np.clip(o[..., 3], 0, 1)
    rgb = np.clip(o[..., :3]/np.maximum(a, 1e-4)[..., None], 0, 1); rgb[a < 1e-4] = 0
    return rgb, a, M
def shadow(a, blur, off, op):
    s = cv2.GaussianBlur(a, (0, 0), blur)
    s = cv2.warpAffine(s, np.float32([[1, 0, off[0]], [0, 1, off[1]]]), (N, N))
    return np.clip(s*op, 0, 1)
def darken(img, s, mult):
    return img*(1 - s[..., None]) + img*np.array(mult, np.float32)*s[..., None]
def over(img, rgb, a): return rgb*a[..., None] + img*(1 - a[..., None])
def save(img, name):
    im = Image.fromarray((np.clip(img, 0, 1)*255 + 0.5).astype(np.uint8))
    p = f'{OUT}/{name}.jpg'
    for q in (92, 90, 88, 85):
        im.save(p, quality=q, subsampling=0, optimize=True)
        if os.path.getsize(p) < 1.5e6: break
    print(name, q, round(os.path.getsize(p)/1e6, 2), 'MB')
WOMEN = dict(base='#F6E1E7', lift='#FCEFF2', edge='#EFD0D9'); SH_W = (0.62, 0.50, 0.55)

def img01():
    c = fade(CUT, top=(TOP_END + 40, TOP_END + 340), bot=(CASE_BOT + 745 - 490, CASE_BOT + 745))
    rgb, a, _ = place(c, 0.51, 0, CASE_C, (1000, 820))
    img = radial_bg((1000, 820), **WOMEN)
    img = darken(img, shadow(a, 60, (28, 44), 0.24), SH_W)
    img = darken(img, shadow(a, 12, (8, 14), 0.42), SH_W)
    img = over(img, rgb, a)
    chip = np.array(Image.open('/tmp/job/chip_primary.png')).astype(np.float32)/255
    img = over(img, chip[..., :3], chip[..., 3])
    save(img, '01_primary')

def img03():
    rgb, a, _ = place(CUT, 0.95, 7, CASE_C, (985, 1000))
    img = radial_bg((985, 1000), **WOMEN, seed=3)
    img = darken(img, shadow(a, 90, (40, 64), 0.22), SH_W)
    img = darken(img, shadow(a, 18, (12, 20), 0.42), SH_W)
    save(over(img, rgb, a), '03_dial-closeup')

def img04():
    th = np.deg2rad(18); sc = 0.95; d = (CASE_BOT - CASE_C[1])*sc
    bc = (840, 560); cc = (bc[0] - d*np.sin(th), bc[1] - d*np.cos(th))
    rgb, a, _ = place(CUT, sc, 18, CASE_C, cc)
    img = radial_bg((1000, 1100), **WOMEN, seed=4)
    img = darken(img, shadow(a, 80, (36, 58), 0.22), SH_W)
    img = darken(img, shadow(a, 16, (10, 18), 0.42), SH_W)
    save(over(img, rgb, a), '04_bracelet-closeup')

def img05():
    p = np.array(Image.open('/tmp/job/plate_silk.png').convert('RGB'))
    lab = cv2.cvtColor(p, cv2.COLOR_RGB2LAB).astype(np.float32)
    lab[..., 1] += 3; lab[..., 2] -= 7; lab[..., 0] = np.clip(lab[..., 0]*1.02, 0, 255)
    p = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB)
    p = cv2.resize(p, (N, N), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)/255
    p = np.clip(p + (p - cv2.GaussianBlur(p, (0, 0), 2.0))*0.5, 0, 1)
    sc = 0.6; cy = 330 + (CASE_C[1] - CASE_TOP)*sc
    rgb, a, _ = place(CUT, sc, 0, CASE_C, (1000, cy))
    img = darken(p, shadow(a, 40, (18, 28), 0.26), (0.60, 0.46, 0.48))
    img = darken(img, shadow(a, 9, (6, 10), 0.42), (0.60, 0.46, 0.48))
    save(over(img, rgb, a), '05_styled')

def img02():
    p0 = np.array(Image.open('/tmp/job/plate_hand2.png').convert('RGB'))
    x0, y0, sz = 175, 172, 680                     # crop of the 1024 plate around the wrist
    p0 = p0[y0:y0+sz, x0:x0+sz]; k = N/sz
    p = cv2.resize(p0, (N, N), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)/255
    lab = cv2.cvtColor((p*255).astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
    bb = cv2.GaussianBlur(lab[..., 2] - 128, (0, 0), 4)               # warm skin vs pink set & its cast shadow
    p = np.clip(p + (p - cv2.GaussianBlur(p, (0, 0), 2.5))*0.6, 0, 1)
    wx = int((495 - x0)*k)
    def run(x):
        on = bb[:, x] >= 17; yc = int(np.argmax(np.convolve(on, np.ones(301), 'same')))
        t = yc
        while t > 0 and on[t - 1]: t -= 1
        e = yc
        while e < N - 1 and on[e + 1]: e += 1
        return t, e
    top, bot = run(wx); width = bot - top
    yy = np.arange(N, dtype=np.float32)
    vis = np.zeros((N, N), np.float32)
    for x in range(max(0, wx - 330), min(N, wx + 331)):
        t, e = run(x); vis[:, x] = smooth((yy - t - 2)/24)*smooth((e - yy - 2)/24)
    band = np.zeros((N, N), np.float32)
    for x in range(N):
        t, e = run(x) if (x % 8 == 0) else (t, e)
        band[t:e, x] = 1
    band = cv2.GaussianBlur(band, (0, 0), 5)
    case_h = 0.58*width; sc = case_h/(CASE_BOT - CASE_TOP); cy = (top + bot)/2
    case_m = np.zeros(CUT.shape[:2], np.uint8)
    poly = np.array([pc(*q) for q in [(366,366),(676,368),(694,600),(672,846),(370,846),(346,600)]], np.int32)
    crown = np.array([pc(*q) for q in [(686,572),(732,572),(732,646),(686,646)]], np.int32)
    cv2.fillPoly(case_m, [poly, crown], 1)
    case_m = cv2.GaussianBlur(case_m.astype(np.float32), (0, 0), 2)
    br = CUT.copy(); br[..., 3] *= (1 - case_m); cs = CUT.copy(); cs[..., 3] *= case_m
    rb, ab, _ = place(br, sc, 0, CASE_C, (wx, cy)); rc, ac, _ = place(cs, sc, 0, CASE_C, (wx, cy))
    ab = ab*vis
    edge = np.minimum(np.clip((yy - top)/110, 0, 1), np.clip((bot - yy)/110, 0, 1))[:, None]
    rb = rb*(0.45 + 0.55*smooth(edge))[..., None]                  # bracelet turns into shade as it wraps
    rb = rb*np.array([1.0, 0.975, 0.97], np.float32); rc = rc*np.array([1.0, 0.98, 0.975], np.float32)
    a_all = np.clip(ab + ac, 0, 1)
    img = darken(p, shadow(a_all, 22, (10, 18), 0.34)*band, (0.55, 0.45, 0.42))
    img = darken(img, shadow(a_all, 5, (4, 8), 0.55)*band, (0.55, 0.45, 0.42))
    img = over(img, rb, ab); img = over(img, rc, ac)
    print('wrist', top, bot, 'width', width, 'case px', round(case_h), 'scale', round(sc, 3))
    save(img, '02_on-wrist')

for f in sys.argv[1:]: globals()[f]()
