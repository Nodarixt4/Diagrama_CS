import { describe, expect, it } from 'vitest';
import { flow } from '../../data/flows/atendimento-topdesk';
import { stepDocumentation } from '../../data/flows/atendimento-topdesk/documentation';
import { createExploration, follow, retreat } from '../flow/exploration';
import { journeyOccurrences, journeyPosition } from '../flow/journeyLayout';
import { journeyReport } from './journeyReport';
import { createJourneyPdf, reportFilename } from './journeyPdf';

function longJourney(cycles = 0) {
  let state = createExploration(flow);
  for (const edge of ['225', '223', '228']) state = follow(flow, state, edge);
  for (let i = 0; i < cycles; i++) { state = follow(flow, state, '283'); state = follow(flow, state, '291'); }
  for (const edge of ['284', '286', '289', '298', '300', '305', '308', '310']) state = follow(flow, state, edge);
  return state;
}
describe('Percurso de ocorrências e relatório', () => {
  it('alterna linhas sem alterar o prefixo', () => {
    expect(Array.from({ length: 9 }, (_, i) => journeyPosition(i).column)).toEqual([0, 1, 2, 2, 1, 0, 0, 1, 2]);
    expect(journeyPosition(3).row).toBe(1);
    expect(journeyPosition(4, 2).column).toBe(0);
    expect(journeyPosition(4, 1).column).toBe(0);
  });
  it('preserva repetições como ocorrências únicas e remove o último retorno', () => {
    const state = longJourney(4), visits = journeyOccurrences(state.journey);
    expect(new Set(visits.map(v => v.id)).size).toBe(visits.length);
    expect(visits.filter(v => v.nodeId === '285')).toHaveLength(5);
    const back = retreat(state);
    expect(journeyOccurrences(back.journey)).toEqual(visits.slice(0, -1));
    expect(() => journeyReport(flow, back.journey)).toThrow();
  });
  it('rejeita início, sequência inválida e inspeção de terminal', () => {
    expect(() => journeyReport(flow, createExploration(flow).journey)).toThrow();
    expect(() => journeyReport(flow, { nodes: ['221', '312'], edges: ['225'] })).toThrow();
    expect(() => journeyReport(flow, { nodes: ['312'], edges: [] })).toThrow();
  });
  it('remove ramo abandonado ao voltar e bifurcar', () => {
    let state = createExploration(flow);
    for (const edge of ['225', '223']) state = follow(flow, state, edge);
    state = follow(flow, retreat(state), '222');
    expect(state.journey.nodes).not.toContain('229');
    expect(state.discovered).toContain('229');
    expect(state.journey.nodes.at(-1)).toBe('227');
  });
  it('documenta todos os nós sem depender de geração em tempo real', () => {
    expect(Object.keys(stepDocumentation)).toHaveLength(flow.nodes.length);
    for (const doc of Object.values(stepDocumentation)) for (const value of Object.values(doc)) expect(value.length).toBeGreaterThan(20);
  });
  it('exporta somente resumo e páginas do diagrama vetorial', () => {
    const state = longJourney(20), report = journeyReport(flow, state.journey);
    expect(report.entries.length).toBe(state.journey.nodes.length);
    expect(report.decisions).toBeGreaterThan(20);
    const pdf = createJourneyPdf(flow, state.journey, { collaborator: 'João', ticket: 'CH-123' }, 'teste-id');
    expect(pdf.getNumberOfPages()).toBe(1 + Math.ceil(report.entries.length / 6));
    expect(pdf.output()).toContain('%PDF-');
    expect(pdf.output()).toContain('teste-id');
    expect(reportFilename(new Date(2026, 3, 22, 9, 5))).toBe('APTUM_FLOW_Percurso_2026-04-22_09-05.pdf');
  });
});