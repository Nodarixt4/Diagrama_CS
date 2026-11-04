import { describe, expect, it } from 'vitest';
import { flow, nodes } from '../data/flows/atendimento-topdesk';
import { advance, back, outgoing, searchSteps, startJourney, validateGraph } from '../features/flow/graph';
import type { FlowModel } from '../features/flow/types';

describe('integridade e fidelidade', () => {
  it('valida o grafo completo, permitindo ciclos e referências independentes', () => expect(validateGraph(flow)).toEqual([]));
  it('mantém todas as decisões com alternativas identificadas', () => {
    for (const node of nodes.filter(n => n.type === 'decision')) {
      const exits = outgoing(flow, node.id);
      expect(exits.length).toBeGreaterThanOrEqual(2);
      expect(exits.every(e => Boolean(e.label))).toBe(true);
    }
  });
  it('mantém as duas alternativas negativas da resolução', () => expect(outgoing(flow, '303').map(e => e.label)).toEqual(['Sim', 'Não · investigar', 'Não · escalonar']));
  it('segue cada aresta a partir de sua origem', () => {
    for (const edge of flow.edges) expect(advance(flow, { nodes: [edge.source], edges: [] }, edge.id).nodes.at(-1)).toBe(edge.target);
  });
  it('detecta IDs, referências e conexões inválidas', () => {
    const invalid: FlowModel = { ...flow, nodes: [...flow.nodes, { ...nodes[0], documentationRefs: ['missing'] }], edges: [...flow.edges, { id: 'invalid', source: 'missing', target: '221', sourceIds: [] }] };
    expect(validateGraph(invalid).join(' ')).toMatch(/ID duplicado/);
    expect(validateGraph(invalid).join(' ')).toMatch(/Documento inválido/);
    expect(validateGraph(invalid).join(' ')).toMatch(/Conexão inválida/);
  });
  it('detecta decisões sem saídas, condições duplicadas e nós inacessíveis', () => {
    const invalid: FlowModel = { entry: 'a', documents: [], nodes: [{ id: 'a', title: 'a', type: 'decision', section: 'service', sourceIds: [] }, { id: 'b', title: 'b', type: 'action', section: 'service', sourceIds: [] }], edges: [] };
    expect(validateGraph(invalid).join(' ')).toMatch(/Decisão sem saída/);
    expect(validateGraph(invalid).join(' ')).toMatch(/Nó inacessível/);
    invalid.edges = [{ id: 'x', source: 'a', target: 'b', label: 'Sim', sourceIds: [] }, { id: 'y', source: 'a', target: 'b', label: 'Sim', sourceIds: [] }];
    expect(validateGraph(invalid).join(' ')).toMatch(/Condições ambíguas/);
  });
});
describe('percurso e busca', () => {
  it('preserva visitas repetidas e restaura o histórico ao voltar', () => {
    let journey = { nodes: ['285'], edges: [] as string[] };
    journey = advance(flow, journey, '283');
    journey = advance(flow, journey, '291');
    journey = advance(flow, journey, '283');
    expect(journey.nodes).toEqual(['285', '292', '285', '292']);
    expect(back(journey).nodes).toEqual(['285', '292', '285']);
    expect(back(startJourney(flow))).toEqual(startJourney(flow));
  });
  it('recusa transições que não saem da etapa atual', () => expect(() => advance(flow, startJourney(flow), '291')).toThrow());
  it('encontra títulos e campos sem depender de acentos', () => {
    expect(searchSteps(flow.nodes, 'solucao').length).toBeGreaterThan(0);
    expect(searchSteps(flow.nodes, 'prioridade').map(n => n.id)).toContain('264');
    expect(searchSteps(flow.nodes, 'operador').length).toBeGreaterThan(0);
    expect(searchSteps(flow.nodes, 'xyz inexistente')).toEqual([]);
  });
});