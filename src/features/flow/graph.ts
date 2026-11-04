import type { FlowModel, FlowStep } from './types';

export function validateGraph(model: FlowModel): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const node of model.nodes) {
    if (ids.has(node.id)) errors.push(`ID duplicado: ${node.id}`);
    ids.add(node.id);
    for (const ref of node.documentationRefs ?? []) if (!model.documents.includes(ref)) errors.push(`Documento inválido: ${ref}`);
  }
  if (!ids.has(model.entry)) errors.push('Entrada inexistente');
  const edgeIds = new Set<string>();
  for (const edge of model.edges) {
    if (edgeIds.has(edge.id)) errors.push(`Aresta duplicada: ${edge.id}`);
    edgeIds.add(edge.id);
    if (!ids.has(edge.source) || !ids.has(edge.target)) errors.push(`Conexão inválida: ${edge.id}`);
  }
  for (const node of model.nodes.filter(n => n.type === 'decision')) {
    const exits = outgoing(model, node.id);
    if (!exits.length) errors.push(`Decisão sem saída: ${node.id}`);
    const conditions = exits.map(e => normalize(e.label ?? ''));
    if (conditions.includes('') || new Set(conditions).size !== conditions.length) errors.push(`Condições ambíguas: ${node.id}`);
  }
  const visited = new Set<string>();
  const queue = [model.entry];
  while (queue.length) {
    const id = queue.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    queue.push(...outgoing(model, id).map(e => e.target));
  }
  for (const node of model.nodes) if (!visited.has(node.id) && !node.independent) errors.push(`Nó inacessível: ${node.id}`);
  return errors;
}
export const outgoing = (model: FlowModel, id: string) => model.edges.filter(e => e.source === id);
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const searchSteps = (nodes: FlowStep[], query: string) => nodes.filter(node => normalize([node.title, node.description, ...(node.fields ?? [])].join(' ')).includes(normalize(query)));
export interface Journey { nodes: string[]; edges: string[] }
export const startJourney = (model: FlowModel): Journey => ({ nodes: [model.entry], edges: [] });
export function advance(model: FlowModel, journey: Journey, edgeId: string): Journey {
  const edge = outgoing(model, journey.nodes.at(-1)!).find(e => e.id === edgeId);
  if (!edge) throw new Error('Alternativa inválida para a etapa atual');
  return { nodes: [...journey.nodes, edge.target], edges: [...journey.edges, edge.id] };
}
export const back = (journey: Journey): Journey => journey.edges.length ? { nodes: journey.nodes.slice(0, -1), edges: journey.edges.slice(0, -1) } : journey;