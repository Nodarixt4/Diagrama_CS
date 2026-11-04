import { expect, it } from 'vitest';
import { flow } from '../data/flows/atendimento-topdesk';
import { createExploration, follow, inspect, retreat } from '../features/flow/exploration';
import { answerForStep, faqSources, formatFAQAnswer, questionsForStep, relevantFAQSteps, stepFAQs } from '../data/flows/atendimento-topdesk/faq';
import { journeyPosition, pdfJourneyLayout, webJourneyLayout } from '../features/flow/journeyLayout';

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
it('cobre cada etapa relevante com perguntas editoriais únicas e fontes existentes', () => {
  expect(new Set(stepFAQs.map(faq => faq.id)).size).toBe(stepFAQs.length);
  expect(new Set(stepFAQs.map(faq => faq.question)).size).toBe(stepFAQs.length);
  for (const step of relevantFAQSteps) {
    const questions = questionsForStep(step.id);
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions.length).toBeLessThanOrEqual(5);
    for (const faq of questions) {
      expect(faq.answer.length).toBeGreaterThan(60);
      expect(faq.sourceRefs.every(ref => ref in faqSources)).toBe(true);
      expect(faq.answer).toMatch(/No fluxo:|Boa prática:|Informação não definida:/);
    }
  }
  expect(questionsForStep('221')).toEqual([]);
  expect(questionsForStep('312')).toEqual([]);
});
it('seleciona respostas determinísticas e rejeita perguntas de outra etapa', () => {
  const faq = questionsForStep('287')[0];
  expect(answerForStep('287', faq.id)).toBe(faq);
  expect(answerForStep('320', faq.id)).toBeUndefined();
  expect(answerForStep('287', 'texto livre')).toBeUndefined();
  expect(questionsForStep('309').some(faq => faq.answer.includes('não apresenta uma saída negativa'))).toBe(true);
});
it('mantém o PDF compacto e independente do espaço negativo web', () => {
  expect(webJourneyLayout.gapX).toBe(420);
  expect(webJourneyLayout.gapY).toBe(360);
  expect(journeyPosition(1, 3, pdfJourneyLayout).x).toBe(62);
  expect(journeyPosition(3, 3, pdfJourneyLayout)).toEqual({ x: 124, y: 103, row: 1, column: 2 });
  expect(journeyPosition(1).x).toBe(800);
  expect(journeyPosition(3).y).toBe(780);
});
it('formata respostas prontas em resumo e blocos sem perder o conteúdo', () => {
  for (const faq of stepFAQs) {
    const formatted = formatFAQAnswer(faq.answer);
    expect(formatted.summary.length).toBeGreaterThan(8);
    expect(formatted.sections.map(section => section.content).join(' ')).not.toMatch(/No fluxo:|Boa prática:|Informação não definida:/);
    expect(formatted.sections.every(section => section.title.length > 10)).toBe(true);
  }
  const mixed = formatFAQAnswer(answerForStep('224', '224-faq-2')!.answer);
  expect(mixed.sections.map(section => section.kind)).toEqual(['practice']);
  expect(formatFAQAnswer(answerForStep('309', '309-faq-2')!.answer).sections.map(section => section.kind)).toEqual(['practice']);
});