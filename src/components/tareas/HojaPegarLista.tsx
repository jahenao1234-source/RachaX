import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { ListaPegada, PasoPegado, textoConteo, contarPegados, quitarPegado, aplanarPegados } from '../../utils/pegarLista';

export const HojaPegarLista: React.FC<{
  lista: ListaPegada;
  conNombre: boolean;
  tareaNombre?: string;
  escritorio: boolean;
  onAgregar: (pasos: PasoPegado[], nombre: string | null) => void;
  onCancelar: () => void;
}> = ({ lista, conNombre, tareaNombre, escritorio, onAgregar, onCancelar }) => {
  const [pasos, setPasos] = useState<PasoPegado[]>(lista.pasos);
  const [nombre, setNombre] = useState<string>(lista.titulo ?? '');

  const inputRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);

  const alCerrar = useRef(onCancelar);
  alCerrar.current = onCancelar;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrar.current(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (conNombre && lista.titulo) {
      inputRef.current?.focus();
    } else {
      addRef.current?.focus();
    }
  }, [conNombre, lista.titulo]);

  // Si el título no se usa como nombre, se avisa entre lo que quedó por fuera
  const fuera = conNombre || !lista.titulo ? lista.fuera : [lista.titulo, ...lista.fuera];
  const stats = contarPegados(pasos);
  const planos = aplanarPegados(pasos);

  const contenido = (
    <>
      <div className="tsheet-h">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 id="t4h" className="font-heading font-bold m-0" style={{ fontSize: escritorio ? 26 : 24 }}>Pegaste una lista</h2>
          <p className="sub" style={{ marginTop: 4, fontSize: 13 }}>
            {textoConteo(pasos)}. {escritorio && tareaNombre ? `Se agregan al final de ${tareaNombre}. ` : ''}Quita con ✕ lo que no sea un paso.
          </p>
        </div>
        <button type="button" className="closeb" aria-label="Cerrar" onClick={onCancelar}><X size={16} /></button>
      </div>

      {conNombre && lista.titulo && (
        <>
          <label className="t4lab" htmlFor="t4n">Nombre de la tarea</label>
          <input ref={inputRef} id="t4n" className="tedit tnamein" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} />
          <p className="t4nota">Lo tomamos de la lista. Puedes cambiarlo.</p>
        </>
      )}

      <div className="t4caja">
        <ul className="t4lista" aria-label="Así van a quedar">
          {planos.map((p) => (
            <li key={p.id} className={`t4li${p.nivel ? ' sub' : ''}`} style={{ paddingLeft: p.nivel * 26 }}>
              <span className="t4t">{p.texto}</span>
              <button className="t4x" aria-label={`Quitar ${p.texto}`} onClick={() => setPasos(quitarPegado(pasos, p.id))}><X size={16} /></button>
            </li>
          ))}
        </ul>
      </div>

      {fuera.length > 0 && (
        <p className="t4fuera">
          {fuera.length === 1
            ? `Dejamos por fuera 1 renglón que no parecía un paso: “${fuera[0]}”`
            : `Dejamos por fuera ${fuera.length} renglones que no parecían pasos.`}
        </p>
      )}

      <div className="t4pie">
        <button className="tbtnq" onClick={onCancelar}>Cancelar</button>
        <button
          ref={addRef}
          className="btnp sm"
          disabled={stats.total === 0}
          onClick={() => onAgregar(pasos, conNombre && nombre.trim() ? nombre.trim() : null)}
        >
          Agregar {stats.total === 1 ? '1 paso' : `${stats.total} pasos`}
        </button>
      </div>
    </>
  );

  return createPortal(
    <div className="tareas">
      {escritorio ? (
        <>
          <div className="tscrim" onClick={onCancelar} aria-hidden="true" />
          <div className="t4dlg" role="dialog" aria-modal="true" aria-labelledby="t4h">
            {contenido}
          </div>
        </>
      ) : (
        <>
          <div className="tscrim" onClick={onCancelar} aria-hidden="true" />
          <div className="tsheet t4sheet" role="dialog" aria-modal="true" aria-labelledby="t4h">
            <div className="tgrab" aria-hidden="true" />
            {contenido}
          </div>
        </>
      )}
    </div>,
    document.body
  );
};
