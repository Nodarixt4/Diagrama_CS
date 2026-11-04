import type { Journey } from './graph';
export const journeyMetrics = { width: 380, height: 420, gapX: 88, gapY: 110 };
export function journeyPosition(index: number, columns = 3) {
  if (!Number.isInteger(index) || index < 0 || !Number.isInteger(columns) || columns < 1) throw new Error('Índice ou colunas inválidos');
  const row = Math.floor(index / columns), offset = index % columns;
  const column = row % 2 === 0 ? offset : columns - 1 - offset;
  return { x: column * (journeyMetrics.width + journeyMetrics.gapX), y: row * (journeyMetrics.height + journeyMetrics.gapY), row, column };
}
export function journeyOccurrences(journey: Journey, columns = 3) {
  return journey.nodes.map((nodeId, index) => ({ id: `visit-${index}-${nodeId}`, nodeId, index, position: journeyPosition(index, columns), via: index ? journey.edges[index - 1] : undefined }));
}