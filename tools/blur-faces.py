"""Blur children's faces harder. Sharp adult faces stay visible."""
import cv2
import numpy as np
from pathlib import Path
from PIL import Image, ImageOps

MODEL = r"C:\Users\jacov\AppData\Local\Temp\face_detection_yunet_2023mar.onnx"
ROOT = Path(r"C:\Users\jacov\Desktop\JackOza\Work\Jaco & Ansucha Website\project\assets\photos")


def smear(arr, x, y, fw, fh):
    h, w = arr.shape[:2]
    x0 = max(0, x - int(fw * 0.62))
    y0 = max(0, y - int(fh * 0.85))
    x1 = min(w, x + fw + int(fw * 0.62))
    y1 = min(h, y + fh + int(fh * 0.55))
    roi = arr[y0:y1, x0:x1]
    if roi.size == 0:
        return
    bh, bw = roi.shape[:2]
    block = max(16, min(bw, bh) // 5)
    small = cv2.resize(roi, (max(1, bw // block), max(1, bh // block)), interpolation=cv2.INTER_LINEAR)
    pix = cv2.resize(small, (bw, bh), interpolation=cv2.INTER_NEAREST)
    pix = cv2.GaussianBlur(pix, (0, 0), sigmaX=max(14, block))
    mask = np.zeros((bh, bw), np.float32)
    cv2.ellipse(mask, (bw // 2, int(bh * 0.48)), (int(bw * 0.46), int(bh * 0.46)), 0, 0, 360, 1, -1)
    mask = cv2.GaussianBlur(mask, (0, 0), sigmaX=max(8, block * 0.4))
    mask = np.clip(mask, 0, 1)[..., None]
    arr[y0:y1, x0:x1] = (pix * mask + roi * (1 - mask)).astype(np.uint8)


def main():
    changed = 0
    for f in sorted(ROOT.iterdir()):
        if f.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        arr = np.array(im)
        h, w = arr.shape[:2]
        bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
        det = cv2.FaceDetectorYN.create(MODEL, "", (w, h), 0.35, 0.3, 5000)
        _, faces = det.detect(bgr)
        if faces is None:
            print(f"{f.name}: no faces")
            continue
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        found = []
        for face in faces:
            x, y, fw, fh = [int(v) for v in face[:4]]
            score = float(face[-1])
            if fw < 28 or fh < 36:
                continue
            x0, y0 = max(0, x), max(0, y)
            x1, y1 = min(w, x + fw), min(h, y + fh)
            crop = gray[y0:y1, x0:x1]
            sharp = float(cv2.Laplacian(crop, cv2.CV_64F).var()) if crop.size else 0
            found.append((sharp, x, y, fw, fh, score))
        if not found:
            print(f"{f.name}: only tiny detections")
            continue
        max_sharp = max(row[0] for row in found)
        blurred = 0
        for sharp, x, y, fw, fh, score in found:
            area = fw * fh / (w * h)
            if score < 0.55 and area > 0.12:
                continue
            keep = sharp >= 30 and (sharp >= 45 or sharp >= max_sharp * 0.55 or sharp >= max_sharp * 0.42 and sharp >= 40)
            if keep:
                continue
            smear(arr, x, y, fw, fh)
            blurred += 1
        if not blurred:
            print(f"{f.name}: adults only")
            continue
        out = Image.fromarray(arr)
        if f.suffix.lower() == ".png":
            out.save(f)
        else:
            out.save(f, quality=90, optimize=True)
        changed += 1
        print(f"{f.name}: blurred {blurred}")
    print("files", changed)


if __name__ == "__main__":
    main()
