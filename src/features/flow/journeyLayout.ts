import type { Journey } from './graph';
export interface JourneyLayout { width: number; height: number; gapX: number; gapY: number }
export const webJourneyLayout: JourneyLayout = { width: 380, height: 420, gapX: 420, gapY: 360 };
export const pdfJourneyLayout: JourneyLayout = { width: 55, height: 75, gapX: 7, gapY: 28 };
export const journeyMetrics = webJourneyLayout;
export function journeyPosition(index: number, columns = 3, layout: JourneyLayout = webJourneyLayout) {
  if (!Number.isInteger(index) || index < 0 || !Number.isInteger(columns) || columns < 1) throw new Error('Índice ou colunas inválidos');
  const row = Math.floor(index / columns), offset = index % columns;
  const column = row % 2 === 0 ? offset : columns - 1 - offset;
  return { x: column * (layout.width + layout.gapX), y: row * (layout.height + layout.gapY), row, column };
}
export function journeyOccurrences(journey: Journey, columns = 3) {
  return journey.nodes.map((nodeId, index) => ({ id: `visit-${index}-${nodeId}`, nodeId, index, position: journeyPosition(index, columns), via: index ? journey.edges[index - 1] : undefined }));
}