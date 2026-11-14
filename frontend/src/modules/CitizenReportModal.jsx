import React, { useState } from 'react';
import { X, Send, MapPin, Camera, AlertCircle } from 'lucide-react';

export default function CitizenReportModal({ isOpen, onClose, onAddReport }) {
  if (!isOpen) return null;

  const [tipo, setTipo] = useState('incendio');
  const [zona, setZona] = useState('');
  const [desc, setDesc] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => {
      if (onAddReport) {
        onAddReport({
          tipo,
          zona: zona || 'Cochabamba - Ubicación GPS',
          desc,
          fecha: new Date().toLocaleTimeString()
        });
      }
      setEnviado(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-red-600/20 p-1.5 text-red-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-neutral-100">Alerta Ciudadana Cochabamba</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {enviado ? (
          <div className="py-8 text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              ✓
            </div>
            <h4 className="font-bold text-emerald-400">¡Alerta enviada con éxito!</h4>
            <p className="text-xs text-neutral-400">Se ha notificado al visor del GAMC y brigadas de rescate.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-300">Tipo de Incidencia:</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-xs text-neutral-200 outline-none focus:border-red-500"
              >
                <option value="incendio">🔥 Foco de Fuego / Columna de Humo (Tunari)</option>
                <option value="torrentera">🌊 Torrentera Colapsada / Peligro de Mazamorra</option>
                <option value="anegamiento">🌧️ Calle Inundada / Colector Tapado</option>
                <option value="quema">⚠️ Quema Agrícola no autorizada</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300">Ubicación / Referencia:</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Cota 2750 frente a Taquiña"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-xs text-neutral-200 outline-none focus:border-red-500"
                  required
                />
                <button
                  type="button"
                  title="Capturar GPS actual"
                  className="rounded-lg border border-neutral-800 bg-neutral-800 px-3 text-neutral-300 hover:bg-neutral-700"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300">Descripción:</label>
              <textarea
                rows="2"
                placeholder="Detalla lo que observas (viento, personas en riesgo, etc.)..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-xs text-neutral-200 outline-none focus:border-red-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white transition hover:bg-red-500 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Enviar Alerta Inmediata</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
