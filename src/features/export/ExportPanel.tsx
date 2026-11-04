import { useState } from 'react';
import { X } from 'lucide-react';
import type { FlowModel } from '../flow/types';
import type { Journey } from '../flow/graph';
export function ExportPanel({ model, journey, id, onClose }: { model: FlowModel; journey: Journey; id: string; onClose: () => void }) {
  const [collaborator, setCollaborator] = useState(''), [ticket, setTicket] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(false);
  const download = async () => {
    setBusy(true); setError(false);
    try {
      const { createJourneyPdf, reportFilename } = await import('./journeyPdf');
      const date = new Date();
      const url = URL.createObjectURL(createJourneyPdf(model, journey, { collaborator, ticket }, id, date).output('blob'));
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = reportFilename(date);
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
    catch { setError(true); } finally { setBusy(false); }
  };
  return <aside className="detail-float floating-surface export-panel" aria-label="Exportar percurso"><div className="float-heading"><span>Relatório do percurso</span><button autoFocus className="icon-button" onClick={onClose} aria-label="Fechar exportação"><X size={18} /></button></div><h2>Exportar PDF</h2><p>Relatório enxuto com identificação, resumo e diagrama do percurso.</p><label>Colaborador<input value={collaborator} onChange={e => setCollaborator(e.target.value)} maxLength={120} /></label><label>Chamado<input value={ticket} onChange={e => setTicket(e.target.value)} maxLength={160} /></label><button className="path-choice" disabled={busy} onClick={() => void download()}>{busy ? 'Gerando…' : 'Baixar PDF'}</button>{error && <p role="alert">Não foi possível gerar o relatório. Tente novamente.</p>}</aside>;
}