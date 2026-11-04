import { describe, expect, it } from 'vitest';
import { flow } from '../data/flows/atendimento-topdesk';
import { createExploration, follow, inspect, resumeAtVisit, retreat } from '../features/flow/exploration';

describe('descoberta e percurso sao estados distintos', () => {
  it('inicia com somente a entrada descoberta', () => {
    const state = createExploration(flow);
    expect(state.discovered).toEqual([flow.entry]);
    expect(state.journey.edges).toEqual([]);
  });
  it('inspecionar e buscar nao registram transicoes nem visitas operacionais', () => {
    const state = createExploration(flow);
    const inspected = inspect(state, '303');
    expect(inspected.focused).toBe('303');
    expect(inspected.journey).toEqual(state.journey);
    expect(inspected.discovered).toContain('303');
    expect(follow(flow, inspected, '225').journey.nodes).toEqual(['221', '224']);
    expect(() => follow(flow, inspected, '300')).toThrow();
  });
  it('preserva descobertas ao voltar e ao retomar uma visita anterior', () => {
    const start = createExploration(flow);
    const next = follow(flow, start, '225');
    expect(retreat(next).journey).toEqual(start.journey);
    expect(retreat(next).discovered).toContain('224');
    expect(resumeAtVisit(next, 0).journey).toEqual(start.journey);
    expect(resumeAtVisit(next, -1)).toEqual(next);
  });
  it('ciclos guardam cada ocorrencia sem duplicar o conjunto descoberto', () => {
    let state = createExploration(flow);
    for (const edge of ['225', '223', '228', '283', '291', '283']) state = follow(flow, state, edge);
    expect(state.journey.nodes).toEqual(['221', '224', '229', '285', '292', '285', '292']);
    expect(state.discovered.filter(id => id === '285')).toHaveLength(1);
    const fork = resumeAtVisit(state, 3);
    expect(follow(flow, fork, '284').journey.nodes.at(-1)).toBe('287');
    expect(fork.discovered).toContain('292');
  });
});