import { jsPDF } from 'jspdf';
import type { FlowModel } from '../flow/types';
import type { Journey } from '../flow/graph';
import { journeyReport } from './journeyReport';
import { journeyPosition, pdfJourneyLayout } from '../flow/journeyLayout';

export interface ReportIdentity { collaborator: string; ticket: string }
export function createJourneyPdf(model: FlowModel, journey: Journey, identity: ReportIdentity, id: string, date = new Date()) {
  const report = journeyReport(model, journey);
  const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
  let y = 20;
  const text = (value: string, size = 11) => {
    pdf.setFontSize(size); pdf.setTextColor(29, 43, 51);
    // The compact identification block fits on one page by design.
    for (const line of pdf.splitTextToSize(value.replace(/[\u0000-\u001f]/g, ' '), 176) as string[]) {
      if (y > 270) { pdf.addPage(); y = 22; }
      pdf.text(line, 17, y); y += size * .46 + 1;
    }
    y += 3;
  };
  text('APTUM FLOW', 14);
  text('Percurso de atendimento', 18);
  text(`Gerado em ${date.toLocaleString('pt-BR')} | Percurso ${id}`, 9);
  text(`Colaborador: ${identity.collaborator || 'Não informado'}`);
  text(`Chamado: ${identity.ticket || 'Não informado'}`);
  text('Resumo', 14);
  text(`${report.entries.length} etapas | ${report.decisions} decisões | ${report.initial} -> ${report.final}`, 10);
  text('Percurso concluído em uma etapa terminal válida.', 10);
  // Six vector cards per A4 page. All cards use the same chronological serpentine function.
  for (let start = 0; start < report.entries.length; start += 6) {
    pdf.addPage(); pdf.setFontSize(15); pdf.text('Percurso visual', 17, 20);
    pdf.setFontSize(9); pdf.text(`Etapas ${start + 1} a ${Math.min(start + 6, report.entries.length)} · ${id}`, 17, 28);
    const pageEntries = report.entries.slice(start, start + 6);
    pageEntries.forEach((entry, local) => {
      const p = journeyPosition(local, 3, pdfJourneyLayout);
      const x = 15 + p.x;
      const top = 48 + p.y;
      pdf.setDrawColor(84, 161, 163); pdf.setFillColor(245, 250, 250); pdf.roundedRect(x, top, 55, 75, 3, 3, 'FD');
      pdf.setFontSize(10); pdf.setTextColor(25, 113, 117); pdf.text(String(entry.index + 1).padStart(2, '0'), x + 4, top + 9);
      pdf.setTextColor(24, 43, 52); pdf.setFontSize(10);
      pdf.text(pdf.splitTextToSize(entry.step.title, 46), x + 4, top + 18);
      pdf.setFontSize(9); pdf.setTextColor(52, 98, 103);
      pdf.text(pdf.splitTextToSize(entry.transition?.label ? `Escolha: ${entry.transition.label}` : entry.step.type === 'end' ? 'Fim do percurso' : entry.index === 0 ? 'Início' : 'Continuidade', 46), x + 4, top + 56);
      if (entry.transition?.inferred) { pdf.setFontSize(8); pdf.text('Conexão interpretada', x + 4, top + 70); }
      if (local < pageEntries.length - 1) {
        const next = journeyPosition(local + 1, 3, pdfJourneyLayout), down = next.row !== p.row;
        const sx = down ? x + 27.5 : next.column > p.column ? x + 55 : x;
        const sy = down ? top + 75 : top + 36;
        const ex = down ? sx : sx + (next.column > p.column ? 7 : -7);
        const ey = down ? sy + 28 : sy;
        pdf.setLineWidth(.6); pdf.setDrawColor(40, 137, 145); pdf.line(sx, sy, ex, ey);
        if (down) { pdf.line(ex, ey, ex - 2, ey - 3); pdf.line(ex, ey, ex + 2, ey - 3); }
        else { const d = ex > sx ? -1 : 1; pdf.line(ex, ey, ex + 2 * d, ey - 2); pdf.line(ex, ey, ex + 2 * d, ey + 2); }
      }
    });
    pdf.setFontSize(10); pdf.setTextColor(40, 70, 80);
    pdf.text(start + 6 < report.entries.length ? `Continua na próxima página: etapa ${start + 7}.` : 'Fim do percurso visual.', 17, 257);
  }
  const count = pdf.getNumberOfPages();
  for (let page = 1; page <= count; page++) { pdf.setPage(page); pdf.setFontSize(8); pdf.setTextColor(100, 120, 130); pdf.text(`APTUM FLOW | ${id} | ${page}/${count}`, 17, 288); }
  return pdf;
}
export function reportFilename(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `APTUM_FLOW_Percurso_${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}.pdf`;
}