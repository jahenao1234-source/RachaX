# Arma los argumentos @N=segundos de voz-sin-pausas.py para la voz del guion 11, buscando cada palabra por su texto.
import json, sys, re, unicodedata
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
J = json.load(open(sys.argv[1], encoding='utf8')); J = J if isinstance(J, list) else J['palabras']; w = [norm(x['t']) for x in J]
def idx(pal, n=0, tras=None):
    c = [i for i, x in enumerate(w) if x == norm(pal)]
    if tras is not None: c = [i for i in c if i > tras]
    return c[n]
P = {}
P[idx('Italia')] = 0.55; P[idx('1987')] = 0.5; P[idx('Tenia')] = 0.95; P[idx('abria')] = 0.45
P[idx('dia') - 1] = 0.9; P[idx('Soy')] = 0.55; P[idx('Solo')] = 0.85; P[idx('Fue')] = 0.9
P[idx('Tenia', 1)] = 0.6; P[idx('Lo')] = 0.6; P[idx('Mientras')] = 0.85; P[idx('Cuando')] = 0.45
asi = idx('Asi'); P[asi] = 0.75; P[idx('a', tras=asi)] = 0.45; P[idx('Hoy')] = 1.0
P[idx('Y', tras=idx('Hoy'))] = 0.55; P[idx('pomodoro')] = 0.6; P[idx('tomate', 1)] = 0.65
ch = idx('no', tras=idx('italiano')) - 1; P[ch] = 1.1
se = idx('se', tras=idx('tarde')); P[se] = 0.8; P[len(w) - 2] = 0.5
print(' '.join(f'@{k}={v}' for k, v in sorted(P.items())))
