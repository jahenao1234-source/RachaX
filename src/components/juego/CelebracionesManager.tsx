import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, Gift } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { getTodayString, contarProgresoReto, formatDateToString } from '../../utils/habitUtils';
import { tasaPeriodo } from '../../utils/progresoUtils';
import { RetoCumplidoSheet } from '../screens/RetoCumplidoSheet';
import { ETAPAS, Llama, LlamaMes } from './Llama';
import { CajaArte } from './Llama';
import { CajaResultSheet } from './CajaResultSheet';
import { useTheme } from '../../store/ThemeContext';
import { TEMAS } from '../../types';
import { TuMesSheet } from './TuMesSheet';

export const CelebracionesManager: React.FC = () => {
  const {
    habitosActivos,
    registros,
    editarHabito,
    agregarPremio,
    celebrado,
    setCelebrado,
    lastRegistroUpdate,
    isFocusModeOpen,
    etapaLlama,
    nivelActual,
    llamasGanadas,
    insigniasGanadas,
    insignias,
    abrirCajas,
    diasCongelados,
    setAbrirColeccion,
    setActiveTab,
  } = useHabitStore();

  const { acento, setAcento } = useTheme();

  const [activeCeleb, setActiveCeleb] = useState<any>(null);
  const [canShow, setCanShow] = useState(false);
  const [cajasResult, setCajasResult] = useState<any>(null);
  const [prevAcentoForUndo, setPrevAcentoForUndo] = useState<any>(null);
  const [tick, setTick] = useState(0);

  // 1. Detectar Retos Cumplidos (esto antes estaba en AppShell)
  useEffect(() => {
    const today = getTodayString();
    for (const habito of habitosActivos) {
      if (habito.reto && !habito.reto.cumplidoEn) {
        const progreso = contarProgresoReto(habito, registros);
        if (progreso >= habito.reto.meta) {
          // Marcar como cumplido y dar premio
          editarHabito(habito.id, { reto: { ...habito.reto, cumplidoEn: today } });
          const meta = habito.reto.meta;
          const clave = `reto-habito:${habito.id}:${habito.reto.inicio}`;
          const normalizedMeta = meta === 4 ? 7 : (meta === 8 ? 30 : (meta === 12 ? 66 : meta));
          if (meta === 7 || meta === 4) {
            agregarPremio(`Reto de ${meta} ${meta === 4 ? 'semanas' : 'días'} completado`, 100, clave, { cajas: 1, tipo: 'reto_habito', meta: normalizedMeta });
          } else if (meta === 30 || meta === 8) {
            agregarPremio(`Reto de ${meta} ${meta === 8 ? 'semanas' : 'días'} completado`, 300, clave, { comodines: 1, cajas: 1, tipo: 'reto_habito', meta: normalizedMeta });
          } else if (meta === 66 || meta === 12) {
            agregarPremio(`Reto de ${meta} ${meta === 12 ? 'semanas' : 'días'} completado`, 1000, clave, { comodines: 1, cajas: 1, tipo: 'reto_habito', meta: normalizedMeta });
          }
          break; // Procesar uno a la vez
        }
      }
    }
  }, [habitosActivos, registros, editarHabito, agregarPremio]);

  // 2. Controlar si podemos mostrar algo (Timer 2.5s y Focus)
  useEffect(() => {
    setCanShow(false);
    const timer = setTimeout(() => {
      setCanShow(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [lastRegistroUpdate]);

  // 3. Cola de celebraciones
  useEffect(() => {
    if (activeCeleb || !canShow || isFocusModeOpen || cajasResult) return;

    // Verificar si hay otras hojas abiertas (que no sean la nuestra de cajas)
    const otrasHojas = document.querySelectorAll('section.sheet[role="dialog"]');
    if (otrasHojas.length > 0) {
      const t = setTimeout(() => setTick(n => n + 1), 1000);
      return () => clearTimeout(t);
    }

    // a. Reto Cumplido
    const retoHabito = habitosActivos.find((h) => h.reto?.cumplidoEn);
    if (retoHabito) {
      setActiveCeleb({ tipo: 'reto', habito: retoHabito });
      return;
    }

    // b. Etapa
    if (etapaLlama > celebrado.etapa) {
      setActiveCeleb({ tipo: 'etapa', nuevaEtapa: etapaLlama, viejaEtapa: celebrado.etapa });
      return;
    }

    // c. Mes
    const mesesGanados = Object.keys(llamasGanadas).filter(k => k.startsWith('mes_'));
    const mesPendiente = mesesGanados.find(m => !celebrado.meses.includes(m));
    if (mesPendiente) {
      setActiveCeleb({ tipo: 'mes', mesId: mesPendiente });
      return;
    }

    // d. Insignia
    const insigniasKeys = Object.keys(insigniasGanadas);
    const insPendiente = insigniasKeys.find(i => !celebrado.insignias.includes(i));
    if (insPendiente) {
      setActiveCeleb({ tipo: 'insignia', insigniaId: insPendiente });
      return;
    }

    // e. Nivel
    if (nivelActual > celebrado.nivel) {
      setActiveCeleb({ tipo: 'nivel', nivel: nivelActual });
      return;
    }

    // f. Tu mes en Racha del mes anterior (50% a 79%, sin llama del mes): una vez, desde el día 1
    const hoyStr = getTodayString();
    const prev = new Date(parseInt(hoyStr.slice(0, 4)), parseInt(hoyStr.slice(5, 7)) - 2, 1);
    const pAnio = prev.getFullYear();
    const pMes = prev.getMonth() + 1;
    const clave = `${pAnio}-${String(pMes).padStart(2, '0')}`;
    const resumenes = celebrado.resumenes || [];
    if (!resumenes.includes(clave) && !llamasGanadas[`mes_${String(pMes).padStart(2, '0')}`] && habitosActivos.length > 0) {
      const tasa = tasaPeriodo(habitosActivos, registros, diasCongelados, `${clave}-01`, formatDateToString(new Date(pAnio, pMes, 0)));
      if (tasa.pct >= 50 && tasa.pct < 80) {
        setActiveCeleb({ tipo: 'resumen', anio: pAnio, mes: pMes, clave });
      } else {
        setCelebrado({ ...celebrado, resumenes: [...resumenes, clave] });
      }
    }

  }, [activeCeleb, canShow, isFocusModeOpen, habitosActivos, etapaLlama, nivelActual, llamasGanadas, insigniasGanadas, celebrado, cajasResult, tick, registros, diasCongelados]);

  // Función para cerrar y marcar como celebrado TODO lo que estaba pendiente hasta este momento
  const cerrarYMarcar = () => {
    setCelebrado({
      nivel: nivelActual,
      etapa: etapaLlama,
      insignias: Object.keys(insigniasGanadas),
      meses: Object.keys(llamasGanadas).filter(k => k.startsWith('mes_')),
      resumenes: celebrado.resumenes || []
    });

    setActiveCeleb(null);
    setPrevAcentoForUndo(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCeleb && activeCeleb.tipo !== 'resumen') {
        cerrarYMarcar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeCeleb, cerrarYMarcar]);

  useEffect(() => {
    if (activeCeleb?.tipo === 'insignia') {
      const bd = insignias.find(x => x.id === activeCeleb.insigniaId);
      if (!bd) {
        setCelebrado({
          nivel: nivelActual,
          etapa: etapaLlama,
          insignias: Object.keys(insigniasGanadas),
          meses: Object.keys(llamasGanadas).filter(k => k.startsWith('mes_')),
          resumenes: celebrado.resumenes || []
        });
        setActiveCeleb(null);
        setPrevAcentoForUndo(null);
      }
    }
  }, [activeCeleb, insignias, nivelActual, etapaLlama, insigniasGanadas, llamasGanadas, setCelebrado]);

  if (cajasResult) {
    return <CajaResultSheet resultado={cajasResult} onClose={() => setCajasResult(null)} />;
  }

  // Si no hay nada activo
  if (!activeCeleb) return null;

  // Calculamos la línea "También: ..."
  const getTambien = () => {
    const extras: string[] = [];
    
    // tu llama pasó a Hoguera
    if (etapaLlama > celebrado.etapa && activeCeleb.tipo !== 'etapa') {
      const nextName = ETAPAS[etapaLlama - 1]?.[0] || 'Hoguera';
      extras.push(`tu llama pasó a ${nextName}`);
    }

    // ganaste la llama de septiembre
    const mesesGanadosList = Object.keys(llamasGanadas).filter(k => k.startsWith('mes_'));
    const mesesPendientes = mesesGanadosList.filter(m => !celebrado.meses.includes(m));
    for (const m of mesesPendientes) {
      if (activeCeleb.tipo === 'mes' && activeCeleb.mesId === m) continue;
      const nMes = parseInt(m.split('_')[1]);
      const mesDef = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      extras.push(`ganaste la llama de ${mesDef[nMes - 1] || 'este mes'}`);
    }

    // ganaste la insignia X
    const insKeys = Object.keys(insigniasGanadas);
    const insigniasPendientes = insKeys.filter(i => !celebrado.insignias.includes(i));
    for (const i of insigniasPendientes) {
      if (activeCeleb.tipo === 'insignia' && activeCeleb.insigniaId === i) continue;
      const bd = insignias.find(x => x.id === i);
      if (bd) {
        if (activeCeleb.tipo === 'reto') {
          const meta = activeCeleb.habito.reto?.meta;
          const normalizedMeta = meta === 4 ? 7 : (meta === 8 ? 30 : (meta === 12 ? 66 : meta));
          if (bd.id === `rh_${normalizedMeta}`) continue;
        }
        extras.push(`ganaste la insignia ${bd.nombre}`);
      }
    }

    // subiste al nivel N
    if (nivelActual > celebrado.nivel && activeCeleb.tipo !== 'nivel') {
      extras.push(`subiste al nivel ${nivelActual}`);
    }
    
    if (extras.length === 0) return null;
    if (extras.length === 1) return `También: ${extras[0]}.`;
    const last = extras.pop();
    return `También: ${extras.join(', ')} y ${last}.`;
  };

  const tambien = getTambien();

  // Renderizados por tipo
  if (activeCeleb.tipo === 'reto') {
    const meta = activeCeleb.habito.reto?.meta;
    const normalizedMeta = meta === 4 ? 7 : (meta === 8 ? 30 : (meta === 12 ? 66 : meta));
    const badgeName = `Retos ${normalizedMeta}`;
    
    let hasBadge = false;
    for (const k of Object.keys(insigniasGanadas)) {
      if (!celebrado.insignias.includes(k)) {
        const bd = insignias.find(x => x.id === k);
        if (bd && bd.id === `rh_${normalizedMeta}`) {
          hasBadge = true;
          break;
        }
      }
    }

    return (
      <RetoCumplidoSheet
        habito={activeCeleb.habito}
        onSiguienteNivel={(siguienteMeta) => {
          editarHabito(activeCeleb.habito.id, { reto: { meta: siguienteMeta, inicio: activeCeleb.habito.reto.inicio } });
          cerrarYMarcar();
        }}
        onQuitarReto={() => {
          editarHabito(activeCeleb.habito.id, { reto: undefined });
          cerrarYMarcar();
        }}
        tambien={tambien}
        onAbrirCajas={() => {
          const res = abrirCajas();
          if (res) setCajasResult(res);
        }}
        insigniaGanada={hasBadge ? badgeName : null}
      />
    );
  }

  if (activeCeleb.tipo === 'etapa') {
    const { nuevaEtapa, viejaEtapa } = activeCeleb;
    const nameOld = ETAPAS[viejaEtapa - 1]?.[0] || 'Chispa';
    const nameNew = ETAPAS[nuevaEtapa - 1]?.[0] || 'Brasa';
    return createPortal(
      <div className="fullscr" role="dialog" aria-modal="true" aria-labelledby="ld_t" aria-describedby="ld_d">
        <button className="x" aria-label="Cerrar" onClick={cerrarYMarcar} style={{ position: 'absolute', right: '14px', top: '14px' }}>
          <X size={20} strokeWidth={2.4} />
        </button>
        <p className="sub" id="ld_t" style={{ textAlign: 'center', marginTop: '56px' }}>Nivel {nivelActual}</p>
        <h2 className="cond" tabIndex={-1} style={{ margin: '6px 0 0', fontSize: '28px', textAlign: 'center' }}>Tu llama creció</h2>
        
        <div className="evo" role="img" aria-label={`De ${nameOld} a ${nameNew}`}>
          <span className="evo-old" aria-hidden="true">
            <Llama etapa={viejaEtapa} size={64} sola />
            <span className="sub">{nameOld}</span>
          </span>
          <span className="evo-ar" aria-hidden="true">
            <ArrowRight size={22} strokeWidth={2.2} />
          </span>
          <span aria-hidden="true">
            <Llama etapa={nuevaEtapa} size={170} sola />
          </span>
        </div>
        
        <p className="cond" style={{ textAlign: 'center', fontSize: '44px', lineHeight: 1, margin: '6px 0 0' }}>{nameNew}</p>
        <p className="celebs" id="ld_d" style={{ textAlign: 'center' }}>Tu llama nunca se apaga. Mira lo que construiste.</p>
        
        <div style={{ padding: '18px 20px 0', display: 'grid', gap: '8px' }}>
          {tambien && <p className="sub" style={{ textAlign: 'center', margin: '0 0 10px' }}>{tambien}</p>}
          <button className="btnp full" style={{ margin: 0 }} onClick={cerrarYMarcar}>Seguir</button>
          <button className="link quiet center" onClick={() => { cerrarYMarcar(); setActiveTab('perfil'); setAbrirColeccion(true); }}>Verla en tu colección</button>
        </div>
      </div>,
      document.body
    );
  }

  if (activeCeleb.tipo === 'nivel') {
    const { nivel } = activeCeleb;
    let nextEtapaName = '';
    let nextEtapaNivel = 0;
    for (let i = 0; i < ETAPAS.length; i++) {
      if (ETAPAS[i][1] > nivel) {
        nextEtapaName = ETAPAS[i][0];
        nextEtapaNivel = ETAPAS[i][1];
        break;
      }
    }

    const unlockedColor = TEMAS.filter(t => t.nivel > celebrado.nivel && t.nivel <= nivel).pop();

    return createPortal(
      <>
        <div className="scrim" onClick={cerrarYMarcar} />
        <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="c_n">
          <div className="grab" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0' }}>
            <button className="x" aria-label="Cerrar" onClick={cerrarYMarcar}><X size={20} strokeWidth={2.4} /></button>
          </div>
          <div className="celebody">
            <div className="hero">
              <Llama etapa={etapaLlama} size={120} />
            </div>
            <h2 className="cond celebt" id="c_n" tabIndex={-1}>Subiste al nivel {nivel}</h2>
            <p className="celebs">Cada punto lo ganaste cumpliendo.</p>
            
            {nextEtapaNivel > 0 && (
              <p className="sub" style={{ marginTop: '12px' }}>
                En el nivel {nextEtapaNivel} tu llama pasa a {nextEtapaName}.
              </p>
            )}

            {unlockedColor && (
              <div className="unlock">
                <div className="w-10 h-10 rounded-full flex shrink-0" style={{ background: `var(--sw-${unlockedColor.key})`, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)' }} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <b style={{ color: 'var(--text)' }}>Desbloqueaste el color {unlockedColor.label}</b>
                  <span className="sub" style={{ display: 'block' }}>{prevAcentoForUndo ? 'En uso en tus logros.' : 'Para tus logros, en Perfil › Apariencia'}</span>
                </div>
                <button 
                  className={prevAcentoForUndo ? "link" : "btn2"}
                  style={prevAcentoForUndo ? { minHeight: '44px' } : undefined}
                  onClick={() => {
                    if (prevAcentoForUndo) {
                      setAcento(prevAcentoForUndo);
                      setPrevAcentoForUndo(null);
                    } else {
                      setPrevAcentoForUndo(acento);
                      setAcento(unlockedColor.key as any);
                    }
                  }}
                >
                  {prevAcentoForUndo ? 'Deshacer' : 'Usarlo'}
                </button>
              </div>
            )}

            {tambien && <p className="sub" style={{ marginTop: '10px' }}>{tambien}</p>}

            <button className="btnp full" onClick={cerrarYMarcar}>Seguir</button>
          </div>
        </section>
      </>,
      document.body
    );
  }

  if (activeCeleb.tipo === 'mes') {
    const nMes = parseInt(activeCeleb.mesId.split('_')[1]);
    const mesDef = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const nombreMes = mesDef[nMes - 1] || 'este mes';
    const capMes = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
    
    const mActual = new Date().getMonth(); 
    const nombreActual = mesDef[mActual];

    let pct = 80;
    const entregada = llamasGanadas[activeCeleb.mesId];
    if (entregada) {
      const anio = parseInt(entregada.slice(0, 4)) - (nMes >= parseInt(entregada.slice(5, 7)) ? 1 : 0);
      const desde = `${anio}-${String(nMes).padStart(2, '0')}-01`;
      const hasta = formatDateToString(new Date(anio, nMes, 0));
      pct = Math.round(tasaPeriodo(habitosActivos, registros, diasCongelados, desde, hasta).pct);
    }

    return createPortal(
      <>
        <div className="scrim" onClick={cerrarYMarcar} />
        <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="c_m">
          <div className="grab" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0' }}>
            <button className="x" aria-label="Cerrar" onClick={cerrarYMarcar}><X size={20} strokeWidth={2.4} /></button>
          </div>
          <div className="celebody">
            <div className="hero">
              <LlamaMes mes={nMes} size={130} />
            </div>
            <h2 className="cond celebt" id="c_m" tabIndex={-1}>La llama de {nombreMes} es tuya</h2>
            <p className="celebs">{capMes} terminó en {pct}%.</p>
            <p className="sub" style={{ marginTop: '6px' }}>La de {nombreActual} se gana con el 80% de {nombreActual}.</p>
            {tambien && <p className="sub" style={{ marginTop: '10px' }}>{tambien}</p>}

            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                className="btnp full" 
                style={{ margin: 0 }}
                onClick={() => {
                  cerrarYMarcar();
                  const anioMes = entregada ? parseInt(entregada.slice(0, 4)) - (nMes >= parseInt(entregada.slice(5, 7)) ? 1 : 0) : new Date().getFullYear();
                  setTimeout(() => setActiveCeleb({ tipo: 'resumen', anio: anioMes, mes: nMes, clave: null }), 50);
                }}
              >
                Ver tu mes en Racha
              </button>
              <button className="link quiet center" onClick={cerrarYMarcar}>Seguir</button>
            </div>
          </div>
        </section>
      </>,
      document.body
    );
  }

  if (activeCeleb.tipo === 'insignia') {
    const bd = insignias.find(x => x.id === activeCeleb.insigniaId);
    if (!bd) {
      return null;
    }

    const traeLlama = !!bd.premioLlama;
    const fam = insignias.filter(x => x.familia === bd.familia);
    const mayorLlama = fam.find(x => x.premioLlama && x.meta > bd.meta);

    return createPortal(
      <>
        <div className="scrim" onClick={cerrarYMarcar} />
        <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="c_i">
          <div className="grab" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0' }}>
            <button className="x" aria-label="Cerrar" onClick={cerrarYMarcar}><X size={20} strokeWidth={2.4} /></button>
          </div>
          <div className="celebody">
            <div className="bigbadge">
              <span className="cond">{bd.meta >= 1000 ? '1K' : bd.meta}</span>
            </div>
            
            <h2 className="cond celebt" id="c_i" tabIndex={-1}>Insignia nueva: {bd.nombre}</h2>
            <p className="celebs">{bd.descripcion || 'Cumpliste un gran hito.'}</p>
            
            {traeLlama ? (
              <p className="sub" style={{ marginTop: '6px' }}>Trae además la llama {bd.premioLlama} para tu colección.</p>
            ) : (
              mayorLlama && <p className="sub" style={{ marginTop: '6px' }}>La de {mayorLlama.meta} trae la llama {mayorLlama.premioLlama}.</p>
            )}

            <div className="boxrow" style={{ marginTop: '14px' }}>
              <CajaArte size={36} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <b style={{ color: 'var(--text)' }}>1 caja sorpresa</b>
                <span className="sub" style={{ display: 'block' }}>Queda en tu colección hasta que la abras.</span>
              </div>
              <button 
                className="btn2" 
                onClick={() => {
                  const res = abrirCajas();
                  if (res) setCajasResult(res);
                  cerrarYMarcar();
                }}
              >
                Abrir
              </button>
            </div>

            {tambien && <p className="sub" style={{ marginTop: '10px' }}>{tambien}</p>}

            <button className="btnp full" onClick={cerrarYMarcar}>Seguir</button>
          </div>
        </section>
      </>,
      document.body
    );
  }

  if (activeCeleb.tipo === 'resumen') {
    return (
      <TuMesSheet
        anio={activeCeleb.anio}
        mes={activeCeleb.mes}
        onClose={() => {
          if (activeCeleb.clave) setCelebrado({ ...celebrado, resumenes: [...(celebrado.resumenes || []), activeCeleb.clave] });
          setActiveCeleb(null);
        }}
      />
    );
  }

  return null;
};
