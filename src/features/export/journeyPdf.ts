import { jsPDF } from 'jspdf';
import type { FlowModel } from '../flow/types';
import type { Journey } from '../flow/graph';
import { journeyReport } from './journeyReport';
import { journeyPosition, journeyMetrics } from '../flow/journeyLayout';

export interface ReportIdentity { collaborator: string; exercise: string; notes: string }
export function createJourneyPdf(model: FlowModel, journey: Journey, identity: ReportIdentity, id: string, date = new Date()) {
  const report = journeyReport(model, journey);
  const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
  let y = 20;
  const text = (value: string, size = 11) => {
    pdf.setFontSize(size); pdf.setTextColor(29, 43, 51);
    // Wrap user text and paginate before writing, never clip long observations.
    for (const line of pdf.splitTextToSize(value.replace(/[\u0000-\u001f]/g, ' '), 176) as string[]) {
      if (y > 270) { pdf.addPage(); y = 22; }
      pdf.text(line, 17, y); y += size * .46 + 1;
    }
    y += 3;
  };
  text('Aptum Tecnologia / APTUM FLOW', 16);
  text('Relatório de Percurso de Atendimento', 18);
  text(`Gerado em ${date.toLocaleString('pt-BR')} | Percurso ${id}`, 9);
  text(`Colaborador: ${identity.collaborator || 'Não informado'}`);
  text(`Exercício: ${identity.exercise || 'Não informado'}`);
  if (identity.notes) text(`Observações: ${identity.notes}`);
  text('Resumo', 15);
  text(`Entrada: ${report.initial}`); text(`Final: ${report.final}`);
  text(`${report.entries.length} etapas percorridas | ${report.decisions} decisões tomadas`);
  text('Resultado: etapa terminal válida alcançada no atendimento simulado.');
  text('Este documento registra o percurso consolidado, não uma avaliação automática. Interpretações do diagrama ainda exigem homologação operacional.', 10);
  // Six vector cards per A4 page. All cards use the same chronological serpentine function.
  for (let start = 0; start < report.entries.length; start += 6) {
    pdf.addPage(); pdf.setFontSize(15); pdf.text('Percurso visual', 17, 20);
    pdf.setFontSize(9); pdf.text(`Etapas ${start + 1} a ${Math.min(start + 6, report.entries.length)} · ${id}`, 17, 28);
    const pageEntries = report.entries.slice(start, start + 6);
    pageEntries.forEach((entry, local) => {
      const p = journeyPosition(local, 3);
      const x = 15 + p.x / (journeyMetrics.width + journeyMetrics.gapX) * 62;
      const top = 48 + p.row * 103;
      pdf.setDrawColor(84, 161, 163); pdf.setFillColor(245, 250, 250); pdf.roundedRect(x, top, 55, 75, 3, 3, 'FD');
      pdf.setFontSize(10); pdf.setTextColor(25, 113, 117); pdf.text(String(entry.index + 1).padStart(2, '0'), x + 4, top + 9);
      pdf.setTextColor(24, 43, 52); pdf.setFontSize(10);
      pdf.text(pdf.splitTextToSize(entry.step.title, 46), x + 4, top + 18);
      pdf.setFontSize(9); pdf.setTextColor(52, 98, 103);
      pdf.text(pdf.splitTextToSize(entry.transition?.label ? `Escolha: ${entry.transition.label}` : entry.step.type === 'end' ? 'Fim do percurso' : entry.index === 0 ? 'Início' : 'Continuidade', 46), x + 4, top + 56);
      if (entry.transition?.inferred) { pdf.setFontSize(8); pdf.text('Conexão interpretada', x + 4, top + 70); }
      if (local < pageEntries.length - 1) {
        const next = journeyPosition(local + 1, 3), down = next.row !== p.row;
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
  pdf.addPage(); y = 22; text('Histórico textual', 16);
  for (const entry of report.entries) {
    text(`${entry.index + 1}. ${entry.step.title}`, 12);
    if (entry.transition) text(`${entry.step.type === 'decision' ? 'Decisão' : 'Transição'}: ${entry.transition.label ?? 'Continuar'} -> ${entry.next?.title}${entry.transition.inferred ? ' (conexão interpretada)' : ''}`, 10);
  }
  if (y > 213) { pdf.addPage(); y = 22; }
  text('Observações do avaliador', 14);
  pdf.setDrawColor(175, 190, 195);
  for (let line = 0; line < 5; line++) { pdf.line(17, y + 8 + line * 9, 193, y + 8 + line * 9); }
  const count = pdf.getNumberOfPages();
  for (let page = 1; page <= count; page++) { pdf.setPage(page); pdf.setFontSize(8); pdf.setTextColor(100, 120, 130); pdf.text(`APTUM FLOW | ${id} | ${page}/${count}`, 17, 288); }
  return pdf;
}
export function reportFilename(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `APTUM_FLOW_Percurso_${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}.pdf`;
}