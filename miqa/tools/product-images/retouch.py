import numpy as np, cv2
from PIL import Image
S = 3468/1176
X0, Y0 = np.load('/tmp/job/cut_B_offset.npy')
rgba = np.array(Image.open('/tmp/job/cut_B.png'))
rgb = rgba[..., :3].copy(); A = rgba[..., 3]
H, W = A.shape
def P(pts): return np.array([[(x*S - X0), (y*S - Y0)] for x, y in pts], np.int32)
# case + crown region (keep untouched): case outline with small margin, crown
case_poly = [(366,366),(676,368),(694,600),(672,846),(370,846),(346,600)]
crown_poly = [(686,572),(732,572),(732,646),(686,646)]
case_m = np.zeros((H, W), np.uint8)
cv2.fillPoly(case_m, [P(case_poly), P(crown_poly)], 1)
brace = ((A > 8) & (case_m == 0)).astype(np.uint8)
# 1) neutralise colour of reflections on the (silver) bracelet: chroma -> 12%
lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
k = 0.12
w = cv2.GaussianBlur(brace.astype(np.float32), (0, 0), 3)       # soft transition at case border
a2 = 128 + (a - 128)*(1 - w*(1-k)); b2 = 128 + (b - 128)*(1 - w*(1-k))
# 2) camera-lens reflections: compact dark round blobs (eroded first so touching dots separate)
dark = ((L < 78) & (brace == 1)).astype(np.uint8)
dark_e = cv2.erode(dark, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
n, lab_i, st, cen = cv2.connectedComponentsWithStats(dark_e, 8)
seeds = np.zeros_like(dark); kept = 0
for i in range(1, n):
    x, y, ww, hh, area = st[i]
    if area < 25 or area > 4000: continue
    if max(ww, hh) > 1.9*min(ww, hh): continue
    cnt, _ = cv2.findContours((lab_i[y:y+hh, x:x+ww] == i).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    per = cv2.arcLength(cnt[0], True); circ = 4*np.pi*area/(per*per + 1e-6)
    if circ < 0.55: continue
    seeds[lab_i == i] = 1; kept += 1
# grow seeds back over their own dark blob only (geodesic), then a small safety margin
grown = seeds.copy()
for _ in range(6):
    grown = cv2.dilate(grown, np.ones((3, 3), np.uint8)) & dark
spots = cv2.dilate(grown, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))) & brace
lab2 = np.dstack([L, a2, b2]).clip(0, 255).astype(np.uint8)
rgb2 = cv2.cvtColor(lab2, cv2.COLOR_LAB2RGB)
rgb2 = cv2.inpaint(rgb2, spots*255, 5, cv2.INPAINT_TELEA)
# 3) gentle tone: lift deep shadows on the bracelet a touch (keeps highlights)
f = rgb2.astype(np.float32)/255
lifted = 1 - (1 - f)**1.12
f = f*(1 - w[..., None]*0.35) + lifted*(w[..., None]*0.35)
blur = cv2.GaussianBlur(f, (0, 0), 2.0)
f = f + (f - blur)*0.5*w[..., None]          # crisp polished edges
rgb3 = (f*255).clip(0, 255).astype(np.uint8)
out = np.dstack([rgb3, A])
Image.fromarray(out).save('/tmp/job/cut_B_rt.png')
print('spots kept', kept)
# before/after sheet of a bracelet section
y0, y1 = int((900-140)*S), int((1250-140)*S); x0, x1 = 250, 1300
def over(img):
    a_ = A[y0:y1, x0:x1, None]/255.0; bg = np.empty((y1-y0, x1-x0, 3)); bg[:] = (246, 225, 231)
    return (img[y0:y1, x0:x1]*a_ + bg*(1-a_)).astype(np.uint8)
sh = np.hstack([over(rgb), np.full((y1-y0, 20, 3), 255, np.uint8), over(rgb3)])
Image.fromarray(sh).resize((sh.shape[1]//2, sh.shape[0]//2), Image.LANCZOS).save('/tmp/job/retouch_check.jpg', quality=90)
