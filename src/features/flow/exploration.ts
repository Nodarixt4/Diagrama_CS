import { advance, back, startJourney } from './graph';
import type { Journey } from './graph';
import type { FlowModel } from './types';

export interface Exploration { journey: Journey; discovered: string[]; focused: string; focusedVisit?: number }
export function createExploration(model: FlowModel): Exploration {
  return { journey: startJourney(model), discovered: [model.entry], focused: model.entry };
}
export function follow(model: FlowModel, state: Exploration, edgeId: string): Exploration {
  // Inspection does not change the operational position of this journey.
  const journey = advance(model, state.journey, edgeId);
  const focused = journey.nodes.at(-1)!;
  return { journey, focused, discovered: [...new Set([...state.discovered, focused])] };
}
export function retreat(state: Exploration): Exploration {
  const journey = back(state.journey);
  return { ...state, journey, focused: journey.nodes.at(-1)!, focusedVisit: undefined };
}
export function inspect(state: Exploration, id: string): Exploration {
  return { ...state, focused: id, focusedVisit: undefined, discovered: [...new Set([...state.discovered, id])] };
}
export function resumeAtVisit(state: Exploration, index: number): Exploration {
  if (index < 0 || index >= state.journey.nodes.length) return state;
  return { ...state, focused: state.journey.nodes[index], focusedVisit: undefined, journey: { nodes: state.journey.nodes.slice(0, index + 1), edges: state.journey.edges.slice(0, index) } };
}