import { expect, it } from 'vitest';
import { flow } from '../data/flows/atendimento-topdesk';
import { createExploration, follow, inspect, retreat } from '../features/flow/exploration';
import { buildExplanationRequest, explanationService } from '../features/assistance/service';

it('volta da decisão escolhida e segue alternativa sem manter o caminho desfeito', () => {
  let state = follow(flow, createExploration(flow), '225');
  state = follow(flow, state, '222');
  state = retreat(inspect(state, '303'));
  expect(state.focused).toBe('224');
  state = follow(flow, state, '223');
  expect(state.journey.edges).toEqual(['225', '223']);
  expect(state.discovered).toContain('227');
  expect(retreat(retreat(state)).journey.edges).toEqual([]);
});
it('monta contexto real sem confundir inspeção com visita e sem inventar documentos', () => {
  const state = inspect(follow(flow, createExploration(flow), '225'), '303');
  const context = buildExplanationRequest(flow, state, '  Qual caminho? ');
  expect(context.step.id).toBe('303');
  expect(context.connections.filter(e => e.source === '303').map(e => e.condition)).toEqual(['Sim', 'Não · investigar', 'Não · escalonar']);
  expect(context.journey).toEqual({ visits: ['221', '224'], transitions: ['225'], current: '224', inspecting: true });
  expect(context.documentation).toEqual([]);
  expect(context.question).toBe('Qual caminho?');
  expect(explanationService.available).toBe(false);
});