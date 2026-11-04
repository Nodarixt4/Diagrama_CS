import type { FlowModel, FlowStep } from '../flow/types';
import type { Exploration } from '../flow/exploration';

export interface ExplanationRequest {
  step: Pick<FlowStep, 'id' | 'title' | 'description' | 'type' | 'fields' | 'note'>;
  connections: { id: string; source: string; target: string; condition?: string; inferred: boolean }[];
  journey: { visits: string[]; transitions: string[]; current: string; inspecting: boolean };
  documentation: { id: string }[];
  question: string;
}
export interface Explanation {
  documented: string;
  interpretation: string;
  hypotheticalExample?: string;
  limitations: string;
}
export interface ExplanationService {
  available: boolean;
  explain(request: ExplanationRequest, signal: AbortSignal): Promise<Explanation>;
}
export function buildExplanationRequest(model: FlowModel, state: Exploration, question: string): ExplanationRequest {
  const step = model.nodes.find(node => node.id === state.focused);
  if (!step) throw new Error('Etapa inexistente');
  const { id, title, description, type, fields, note } = step;
  return {
    step: { id, title, description, type, fields, note },
    connections: model.edges.filter(edge => edge.source === id || edge.target === id).map(edge => ({ id: edge.id, source: edge.source, target: edge.target, condition: edge.label, inferred: Boolean(edge.inferred) })),
    journey: { visits: [...state.journey.nodes], transitions: [...state.journey.edges], current: state.journey.nodes.at(-1)!, inspecting: state.focused !== state.journey.nodes.at(-1) },
    documentation: (step.documentationRefs ?? []).filter(ref => model.documents.includes(ref)).map(id => ({ id })),
    question: question.trim(),
  };
}

// No network transport exists until an authorized backend adapter is supplied.
export const explanationService: ExplanationService = {
  available: false,
  async explain() { throw new Error('Assistência indisponível: nenhum serviço foi configurado.'); },
};