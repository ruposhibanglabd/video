import numpy as np, cv2
from PIL import Image
S = 3468/1176                     # preview -> full-res
img = np.array(Image.open('/tmp/job/B.png').convert('RGB'))
H, W = img.shape[:2]
# crop window (full res)
X0, Y0, X1, Y1 = int(280*S), int(140*S), int(760*S), H
crop = img[Y0:Y1, X0:X1].copy()
def P(pts, scale):                # preview pts -> crop coords at given scale
    return np.array([[(x*S - X0)*scale, (y*S - Y0)*scale] for x, y in pts], np.int32)
outer = [(390,150),(672,150),(675,362),(700,372),(708,570),(738,568),(738,648),(706,652),(690,848),(665,852),
         (655,1000),(635,1200),(615,1400),(605,1568),(300,1568),(320,1400),(343,1200),(360,1000),(372,852),
         (352,845),(335,600),(352,368),(390,360)]
core_case = [(392,398),(648,398),(664,600),(642,812),(398,812),(376,600)]
core_crown = [(700,592),(716,592),(716,624),(700,624)]
core_top = [(428,192),(636,192),(636,362),(428,362)]
core_bot = [(418,862),(622,862),(608,1000),(590,1200),(570,1400),(560,1568),(345,1568),(360,1400),(382,1200),(398,1000)]
sc = 0.5
small = cv2.resize(crop, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
h, w = small.shape[:2]
mask = np.full((h, w), cv2.GC_BGD, np.uint8)
outer_m = np.zeros((h, w), np.uint8); cv2.fillPoly(outer_m, [P(outer, sc)], 1)
dil = cv2.dilate(outer_m, np.ones((31, 31), np.uint8))
mask[dil == 1] = cv2.GC_PR_BGD
mask[outer_m == 1] = cv2.GC_PR_FGD
for poly in (core_case, core_crown, core_top, core_bot):
    cv2.fillPoly(mask, [P(poly, sc)], cv2.GC_FGD)
bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
cv2.grabCut(cv2.cvtColor(small, cv2.COLOR_RGB2BGR), mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 1, 0).astype(np.uint8)
# keep the largest component, fill holes
n, lab, stats, _ = cv2.connectedComponentsWithStats(fg, 8)
big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]); fg = (lab == big).astype(np.uint8)
inv = 1 - fg; n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv, 4)
for i in range(1, n2):
    if st2[i, cv2.CC_STAT_AREA] < 400: fg[lab2 == i] = 1
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
# upsample to full-res crop & guided-filter refine
def guided(I, p, r, eps):
    I = I.astype(np.float32); p = p.astype(np.float32)
    mI = cv2.boxFilter(I, -1, (r, r)); mp = cv2.boxFilter(p, -1, (r, r))
    cov = cv2.boxFilter(I*p, -1, (r, r)) - mI*mp; var = cv2.boxFilter(I*I, -1, (r, r)) - mI*mI
    a = cov/(var+eps); b = mp - a*mI
    return cv2.boxFilter(a, -1, (r, r))*I + cv2.boxFilter(b, -1, (r, r))
alpha = cv2.resize(fg.astype(np.float32), (crop.shape[1], crop.shape[0]), interpolation=cv2.INTER_LINEAR)
gray = cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY).astype(np.float32)/255
alpha = np.clip(guided(gray, alpha, 9, 2e-3), 0, 1)
hard_in = cv2.erode((alpha > 0.5).astype(np.uint8), np.ones((9, 9), np.uint8))
alpha[hard_in == 1] = 1.0
alpha[cv2.dilate((alpha > 0.02).astype(np.uint8), np.ones((3, 3), np.uint8)) == 0] = 0
# local background estimate for colour decontamination
fgd_small = cv2.dilate((cv2.resize(alpha, (w, h)) > 0.01).astype(np.uint8), np.ones((9, 9), np.uint8))
bg_small = cv2.inpaint(small, fgd_small*255, 7, cv2.INPAINT_TELEA)
bg_full = cv2.resize(bg_small, (crop.shape[1], crop.shape[0]), interpolation=cv2.INTER_LINEAR).astype(np.float32)
a3 = alpha[..., None]
F = (crop.astype(np.float32) - (1 - a3)*bg_full) / np.maximum(a3, 0.08)
F = np.where(a3 > 0.98, crop.astype(np.float32), F)
F = np.clip(F, 0, 255).astype(np.uint8)
rgba = np.dstack([F, (alpha*255).astype(np.uint8)])
Image.fromarray(rgba).save('/tmp/job/cut_B.png')
np.save('/tmp/job/cut_B_offset.npy', np.array([X0, Y0]))
print('crop', crop.shape, 'alpha>0.5 px', int((alpha > 0.5).sum()))
# check sheet: over dark grey and blush, downsized
def over(bgc):
    bg = np.empty_like(crop, dtype=np.float32); bg[:] = bgc
    return (F.astype(np.float32)*a3 + bg*(1-a3)).astype(np.uint8)
sheet = np.hstack([over((40, 44, 52)), over((246, 225, 231))])
Image.fromarray(sheet).resize((sheet.shape[1]//3, sheet.shape[0]//3), Image.LANCZOS).save('/tmp/job/cut_check.jpg', quality=88)
