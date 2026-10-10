import subprocess, sys, numpy as np
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 16000
def medir(p):
    raw = subprocess.run([FF, '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    n = int(0.04 * SR); paso = int(0.01 * SR)
    f0 = []; db = []
    lo, hi = SR // 400, SR // 90
    for i in range(0, len(x) - n, paso):
        w = x[i:i + n]
        e = float(np.sqrt(np.mean(w * w)) + 1e-9)
        if e < 0.02: continue
        w = w - w.mean()
        ac = np.correlate(w, w, 'full')[n - 1:]
        if ac[0] <= 0: continue
        seg = ac[lo:hi] / ac[0]
        k = int(np.argmax(seg))
        if seg[k] < 0.45: continue
        f0.append(SR / (k + lo)); db.append(20 * np.log10(e))
    f0 = np.array(f0); st = 12 * np.log2(f0 / np.median(f0))
    st = st[np.abs(st) < 12]
    return np.median(f0), np.std(st), np.percentile(st, 95) - np.percentile(st, 5), np.std(db)
for p in sys.argv[1:]:
    m, s, r, d = medir(p)
    print(f"{p.split('/')[-1]:40s} tono medio {m:5.0f} Hz | variación {s:4.2f} semitonos | rango 5-95 {r:4.1f} | volumen ±{d:3.1f} dB")
