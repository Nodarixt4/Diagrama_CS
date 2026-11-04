import type { FlowModel } from '../flow/types';
import type { Journey } from '../flow/graph';
export function journeyReport(model: FlowModel, journey: Journey) {
  if (journey.nodes[0] !== model.entry || journey.edges.length !== journey.nodes.length - 1) throw new Error('Percurso inconsistente');
  const entries = journey.nodes.map((id, index) => {
    const step = model.nodes.find(n => n.id === id);
    if (!step) throw new Error('Etapa inexistente');
    const transition = index < journey.edges.length ? model.edges.find(e => e.id === journey.edges[index] && e.source === id && e.target === journey.nodes[index + 1]) : undefined;
    if (index < journey.edges.length && !transition) throw new Error('Transição inválida');
    return { index, step, transition, next: journey.nodes[index + 1] ? model.nodes.find(n => n.id === journey.nodes[index + 1]) : undefined };
  });
  const last = entries.at(-1)!.step;
  if (last.type !== 'end' || model.edges.some(e => e.source === last.id)) throw new Error('O percurso ainda não foi concluído');
  return { entries, initial: entries[0].step.title, final: last.title, decisions: entries.filter(e => e.step.type === 'decision' && e.transition).length };
}