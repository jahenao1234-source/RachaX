import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { LlamaDe, SiluetaLlama, MasLlamas, nombreLlama, ETAPAS, HAZ, MESES_LL, etapaDeNivel, LlamaRara, HAZ_INFO, CajaArte } from '../juego/Llama';
import { LlamaDetailModal } from '../juego/LlamaDetailModal';
import { CajaSorpresaSheet } from '../juego/CajaSorpresaSheet';
import { CajaResultSheet } from '../juego/CajaResultSheet';
import { CajasResult } from '../../store/HabitContext';
import { getTodayString } from '../../utils/habitUtils';
import { tasaPeriodo } from '../../utils/progresoUtils';

interface CollectionScreenProps {
  onClose: () => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onClose }) => {
  const { llamasGanadas, companera, nivelActual, insignias, habitosActivos, registros, diasCongelados, cajasPorAbrir, abrirCajas, setCompanera, cajasSinRara } = useHabitStore();
  const [selectedLlamaId, setSelectedLlamaId] = useState<string | null>(null);

  const [cajasResult, setCajasResult] = useState<CajasResult | null>(null);

  const handleAbrir = () => {
    const res = abrirCajas();
    if (res) {
      setCajasResult(res);
    }
  };

  const totalLlamas = Object.keys(llamasGanadas).length;
  const etapaLlamaActual = etapaDeNivel(nivelActual);
  const companeraId = companera || `etapa_${etapaLlamaActual}`;
  const companeraRealName = nombreLlama(companeraId);

  // Calcular lo proximo
  const hoyStr = getTodayString();
  const yyyy = parseInt(hoyStr.substring(0, 4));
  const mm = parseInt(hoyStr.substring(5, 7));
  const primerDiaMes = `${yyyy}-${String(mm).padStart(2, '0')}-01`;
  
  // Ayer o hoy si es el 1
  const ayerObj = new Date(yyyy, mm - 1, parseInt(hoyStr.substring(8, 10)) - 1);
  const ayerStr = `${ayerObj.getFullYear()}-${String(ayerObj.getMonth() + 1).padStart(2, '0')}-${String(ayerObj.getDate()).padStart(2, '0')}`;
  const endPeriod = ayerStr >= primerDiaMes ? ayerStr : primerDiaMes;
  const tasaMes = tasaPeriodo(habitosActivos, registros, diasCongelados, primerDiaMes, endPeriod);

  const mesActualId = `mes_${String(mm).padStart(2, '0')}`;
  const mesNombre = (MESES_LL[mm - 1][0] as string).toLowerCase();

  // Hazañas: progreso de la insignia que las trae
  const progresoHazana = (k: string) => {
    const b = insignias.find(x => x.id === HAZ_INFO[k].insignia);
    return { actual: b ? b.progresoActual : 0, meta: b ? b.meta : 1 };
  };
  const requisitoHazana = (k: string) => `${progresoHazana(k).meta} ${HAZ_INFO[k].unidad}`;
  const subPendiente = (k: string) => {
    const p = progresoHazana(k);
    return p.actual > 0 ? `${HAZ_INFO[k].corta} ${p.actual} de ${p.meta}` : requisitoHazana(k);
  };
  const hazanasPendientes = (HAZ.map(h => h[3] as string))
    .filter(k => !llamasGanadas[`hazana_${k}`])
    .sort((a, b) => progresoHazana(b).actual / progresoHazana(b).meta - progresoHazana(a).actual / progresoHazana(a).meta);

  // Lo próximo que puedes ganar: la llama del mes y la hazaña más cercana (máximo 2)
  const proximos: { titulo: string; valor: string; pct: number }[] = [];
  if (!llamasGanadas[mesActualId]) {
    proximos.push({ titulo: `Llama de ${mesNombre}`, valor: `${tasaMes.pct}% de 80%`, pct: Math.min(100, Math.round((tasaMes.pct / 80) * 100)) });
  }
  const hzCerca = hazanasPendientes.find(k => progresoHazana(k).actual > 0);
  if (hzCerca) {
    const p = progresoHazana(hzCerca);
    proximos.push({ titulo: nombreLlama(`hazana_${hzCerca}`), valor: `${p.actual} de ${p.meta} ${HAZ_INFO[hzCerca].unidad}`, pct: Math.round((p.actual / p.meta) * 100) });
  }
  if (proximos.length === 0 && etapaLlamaActual < 10) {
    const e = ETAPAS[etapaLlamaActual];
    proximos.push({ titulo: `${e[0]} · tu próxima etapa`, valor: `nivel ${e[1]}`, pct: Math.min(100, Math.round((nivelActual / (e[1] as number)) * 100)) });
  }
  const hazanasVisibles = hazanasPendientes.slice(0, 2);

  // Calculate missing stages
  const numEtapas = Object.keys(llamasGanadas).filter(k => k.startsWith('etapa_')).length;
  // Calculate missing hazanas
  const numHazanas = Object.keys(llamasGanadas).filter(k => k.startsWith('hazana_')).length;
  // Calculate missing meses
  const numMeses = Object.keys(llamasGanadas).filter(k => k.startsWith('mes_')).length;
  // Calculate raras
  const numRaras = Object.keys(llamasGanadas).filter(k => k.startsWith('rara_')).length;

  return (
    <div className="flex flex-col animate-slideUp bg-bg min-h-screen">
      <div className="flex items-center gap-2 py-3.5 border-b border-line shrink-0">
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-[12px] bg-surface border border-line text-text flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Volver al Perfil"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
      </div>

      <div className="flex-1 pb-24 overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="cond" style={{ margin: 0, fontSize: '44px', lineHeight: 1, marginTop: '16px' }}>Tu colección</h1>
        <p className="sub text-text-muted" style={{ marginTop: '6px' }}>
          {totalLlamas} de 40 llamas · Tu compañera: {companeraRealName}. Toca otra para cambiarla.
        </p>

        
        {cajasPorAbrir > 0 && (
          <section className="boxrow" aria-labelledby="cs_cajas" style={{ marginTop: '14px' }}>
            <span aria-hidden="true">
              <CajaArte size={40} />
            </span>
            <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <b id="cs_cajas" style={{ display: 'block' }}>
                {cajasPorAbrir} caja{cajasPorAbrir !== 1 ? 's' : ''} sorpresa
              </b>
              <span className="sub" style={{ display: 'block', fontSize: '13px' }}>
                {cajasPorAbrir !== 1 ? 'Ábrelas cuando quieras.' : 'Ábrela cuando quieras.'}
              </span>
            </span>
            <button
              className="btn2"
              style={{ borderColor: 'var(--text-muted)' }}
              aria-haspopup="dialog"
              aria-label={cajasPorAbrir !== 1 ? `Abrir tus ${cajasPorAbrir} cajas sorpresa` : 'Abrir tu caja sorpresa'}
              onClick={handleAbrir}
            >
              {cajasPorAbrir !== 1 ? `Abrir las ${cajasPorAbrir}` : 'Abrir'}
            </button>
          </section>
        )}

        <section className="next2" aria-labelledby="nx_lo_proximo">
          <h2 className="cond" id="nx_lo_proximo" style={{ fontSize: '17px', margin: 0 }}>Lo próximo que puedes ganar</h2>
          {proximos.map((p, n) => (
            <React.Fragment key={p.titulo}>
              <div className="nrow" style={n > 0 ? { marginTop: '12px' } : undefined}>
                <span>{p.titulo}</span>
                <span className="sub text-text-muted">{p.valor}</span>
              </div>
              <i className="track" aria-hidden="true"><b style={{ width: `${p.pct}%` }}></b></i>
            </React.Fragment>
          ))}
        </section>

        <section className="sec" aria-labelledby="cs_etapas">
          <div className="cardhead">
            <h2 className="cond" id="cs_etapas">Etapas</h2>
            <span className="sub text-text-muted">{numEtapas} de 10 · crecen con tu nivel</span>
          </div>
          <ul className="cgrid g4" role="list">
            {ETAPAS.map((et, i) => {
              const id = `etapa_${i + 1}`;
              const ok = llamasGanadas[id];
              const isComp = id === companeraId;
              if (ok) {
                return (
                  <li className={`ct ok ${isComp ? 'comp' : ''}`} key={id}>
                    <button className="ctbtn" onClick={() => setSelectedLlamaId(id)} aria-haspopup="dialog" aria-label={`${et[0]}, conseguida${isComp ? ', tu compañera' : ''}`}>
                      <span className="ctart">
                        <LlamaDe id={id} size={60} />
                        {isComp && <div className="compdot"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>}
                      </span>
                      <span className="ctn">{et[0]}</span>
                    </button>
                  </li>
                );
              }
              if (i + 1 === etapaLlamaActual + 1) {
                return (
                  <li className="ct now" key={id} aria-current="step">
                    <button className="ctbtn" onClick={() => setSelectedLlamaId(id)} aria-haspopup="dialog" aria-label={`La siguiente etapa, en el nivel ${et[1]}`}>
                      <span className="ctart">
                        <SiluetaLlama size={60} />
                      </span>
                      <span className="ctn">Nivel {et[1]}</span>
                    </button>
                  </li>
                );
              }
              return null;
            })}
            {10 - etapaLlamaActual - 1 > 0 && <li className="ct lock">
              <button className="ctbtn" aria-label={`${10 - etapaLlamaActual - 1} etapas más por descubrir`}>
                <span className="ctart">
                  <svg width="60" height="60" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="var(--surface-raised)"/><circle cx="50" cy="50" r="45" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 4"/><text x="50" y="60" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="30" fill="var(--text)">+{10 - etapaLlamaActual - 1}</text></svg>
                </span>
                <span className="ctn">por descubrir</span>
              </button>
            </li>}
          </ul>
        </section>

        <section className="sec" aria-labelledby="cs_hazanas">
          <div className="cardhead">
            <h2 className="cond" id="cs_hazanas">Hazañas</h2>
            <span className="sub text-text-muted">{numHazanas} de 8 · premios de tus insignias</span>
          </div>
          <ul className="cgrid g4" role="list">
            {HAZ.map(h => {
              const id = `hazana_${h[3]}`;
              const ok = llamasGanadas[id];
              const isComp = id === companeraId;
              if (ok) {
                const badgeReq = requisitoHazana(h[3] as string);
                const nombre = nombreLlama(id);
                return (
                  <li className={`ct ok ${isComp ? 'comp' : ''}`} key={id}>
                    <button className="ctbtn" onClick={() => setSelectedLlamaId(id)} aria-haspopup="dialog" aria-label={`${nombre}, conseguida: ${badgeReq}${isComp ? ', tu compañera' : ''}`}>
                      <span className="ctart">
                        <LlamaDe id={id} size={60} />
                        {isComp && <div className="compdot"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>}
                      </span>
                      <span className="ctn">{nombre}</span>
                      <span className="cts">{badgeReq}</span>
                    </button>
                  </li>
                );
              }
              return null;
            })}
            
            {/* Siluetas for unachieved max 2 */}
            {hazanasVisibles.map(k => {
              const id = `hazana_${k}`;
              const nombre = nombreLlama(id);
              const badgeReq = subPendiente(k);
              return (
                <li className="ct lock" key={id}>
                  <button className="ctbtn" onClick={() => setSelectedLlamaId(id)} aria-haspopup="dialog" aria-label={`${nombre}, por conseguir: ${badgeReq}`}>
                    <span className="ctart">
                      <svg width="60" height="60" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="var(--surface-raised)"/><circle cx="50" cy="50" r="45" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 4"/><g transform="translate(22 26) scale(.56)"><path d="M50 8C58 24 76 34 78 58C80 78 66 92 50 92C34 92 20 80 22 60C23 48 30 40 36 34C36 44 40 50 45 52C42 38 44 22 50 8Z" fill="var(--line)"/></g><text x="50" y="66" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="26" fill="var(--text)">?</text></svg>
                    </span>
                    <span className="ctn">{nombre}</span>
                    <span className="cts">{badgeReq}</span>
                  </button>
                </li>
              );
            })}
            
            {/* Remainder */}
            {8 - numHazanas - hazanasVisibles.length > 0 && <li className="ct lock">
              <button className="ctbtn" aria-label={`${8 - numHazanas - hazanasVisibles.length} hazañas más por descubrir`}>
                <span className="ctart">
                  <svg width="60" height="60" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="var(--surface-raised)"/><circle cx="50" cy="50" r="45" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 4"/><text x="50" y="60" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="30" fill="var(--text)">+{8 - numHazanas - hazanasVisibles.length}</text></svg>
                </span>
                <span className="ctn">por descubrir</span>
              </button>
            </li>}
          </ul>
        </section>

        <section className="sec" aria-labelledby="cs_meses">
          <div className="cardhead">
            <h2 className="cond" id="cs_meses">Llamas del mes</h2>
            <span className="sub text-text-muted">{numMeses} de 12 · con 80% ese mes</span>
          </div>
          <ul className="cgrid g6" role="list">
            {MESES_LL.map((m, i) => {
              const id = `mes_${String(i + 1).padStart(2, '0')}`;
              const ok = llamasGanadas[id];
              const isComp = id === companeraId;
              const isCurrentMonth = i + 1 === mm;

              if (ok) {
                return (
                  <li className={`ct ok ${isComp ? 'comp' : ''}`} key={id}>
                    <button className="ctbtn" onClick={() => setSelectedLlamaId(id)} aria-haspopup="dialog" aria-label={`Llama de ${(m[0] as string).toLowerCase()}, conseguida${isComp ? ', tu compañera' : ''}`}>
                      <span className="ctart">
                        <LlamaDe id={id} size={50} />
                        {isComp && <div className="compdot"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>}
                      </span>
                      <span className="ctn">{(m[0] as string).substring(0, 3)}</span>
                    </button>
                  </li>
                );
              }
              if (isCurrentMonth) {
                // mesAnillo
                return (
                  <li className="ct lock now" key={id}>
                    <button className="ctbtn" onClick={() => setSelectedLlamaId(id)} aria-haspopup="dialog" aria-label={`Llama de ${(m[0] as string).toLowerCase()}: vas en ${tasaMes.pct}% de 80%`}>
                      <span className="ctart">
                        <svg width="50" height="50" viewBox="0 0 100 100" aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--track)" strokeWidth="6"/>
                          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--ambar-text)" strokeWidth="6" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * tasaMes.pct / 100)} strokeLinecap="round"/>
                          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontFamily="sans-serif" fontWeight="700" fontSize="24" fill="var(--text)" style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>{tasaMes.pct}%</text>
                        </svg>
                      </span>
                      <span className="ctn">{(m[0] as string).substring(0, 3)}</span>
                    </button>
                  </li>
                );
              }
              return (
                <li className="ct lock" key={id}>
                  <button className="ctbtn" onClick={() => setSelectedLlamaId(id)} aria-haspopup="dialog" aria-label={`Llama de ${(m[0] as string).toLowerCase()}, por conseguir`}>
                    <span className="ctart">
                      <svg width="50" height="50" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 4"/></svg>
                    </span>
                    <span className="ctn">{(m[0] as string).substring(0, 3)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="sec mb-8" aria-labelledby="cs_raras">
          <div className="cardhead">
            <h2 className="cond" id="cs_raras">Raras</h2>
            <span className="sub text-text-muted">{numRaras} de 10 · salen de la caja sorpresa</span>
          </div>
          <ul className="cgrid g4" role="list">
            {Object.keys(llamasGanadas).filter(k => k.startsWith('rara_')).map(id => {
              const isComp = id === companeraId;
              const n = nombreLlama(id);
              return (
                <li className={`ct ok ${isComp ? 'comp' : ''}`} key={id}>
                  <button className="ctbtn" onClick={() => setSelectedLlamaId(id)} aria-haspopup="dialog" aria-label={`${n}, conseguida`}>
                    <span className="ctart">
                      <LlamaDe id={id} size={60} />
                      {isComp && <div className="compdot"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>}
                    </span>
                    <span className="ctn">{n}</span>
                  </button>
                </li>
              );
            })}
            <li className="ct lock rare">
              <button className="ctbtn" onClick={() => setSelectedLlamaId('raras')} aria-haspopup="dialog" aria-label={`${10 - numRaras} raras por descubrir`}>
                <span className="ctart">
                  <svg width="60" height="60" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#15121F"/><circle cx="50" cy="50" r="45" fill="none" stroke="#6B5FA8" strokeWidth="1.5" strokeDasharray="4 4"/><text x="50" y="60" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="30" fill="#D8D2FF">+{10 - numRaras}</text></svg>
                </span>
                <span className="ctn">por descubrir</span>
              </button>
            </li>
          </ul>
          {numRaras < 10 && (
            <p className="sub text-text-muted mt-3" style={{ fontSize: '13px' }}>
              {cajasSinRara > 0 ? `Una rara segura cada 15 cajas · llevas ${cajasSinRara}. Nunca se repiten.` : 'Una rara segura cada 15 cajas. Nunca se repiten.'}
            </p>
          )}
        </section>

      </div>

      {selectedLlamaId && (
        <LlamaDetailModal id={selectedLlamaId} onClose={() => setSelectedLlamaId(null)} />
      )}
      {cajasResult && (
        <CajaResultSheet resultado={cajasResult} onClose={() => setCajasResult(null)} />
      )}
    </div>
  );
};
