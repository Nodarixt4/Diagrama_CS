import source from './catalog.json';
import type { FlowLink, FlowModel, FlowStep, StepType } from '../../../features/flow/types';

const text = (id: string) => source.cells.find(c => c.shortId === id && !c.edge)?.label || id;
const step = (id: string, type: StepType = 'action', section: FlowStep['section'] = 'service', extra: Partial<FlowStep> = {}): FlowStep => ({
  id, title: text(id), type, section, sourceIds: [id], ...extra,
});
const fields = (...ids: string[]) => ids.map(text);
export const nodes: FlowStep[] = [
  step('221', 'start', 'service', { title: 'Início do atendimento', sourceIds: ['221', '422'] }),
  step('224', 'decision'), step('227'), step('229', 'documentation'),
  step('234', 'decision'), step('236'),
  step('237', 'end', 'service', { title: 'Atendimento concluído', sourceIds: ['237', '424'] }),
  step('242', 'decision'), step('245', 'escalation'), step('247', 'action'),
  step('250', 'documentation', 'registration'),
  step('252', 'documentation', 'registration', { title: text('254'), fields: fields('253'), sourceIds: ['252', '254', '253'] }),
  step('256', 'documentation', 'registration', { title: text('258'), fields: fields('257', '259', '260', '261'), sourceIds: ['256', '258', '257', '259', '260', '261'] }),
  step('264', 'documentation', 'registration', { title: text('266'), fields: fields('265', '267', '269'), sourceIds: ['264', '266', '265', '267', '269'] }),
  step('processing', 'documentation', 'registration', { title: text('273'), fields: fields('272', '274', '276'), sourceIds: ['273', '272', '274', '276'] }),
  step('279', 'documentation', 'registration'), step('281', 'documentation', 'registration'),
  step('285', 'decision', 'service', { note: 'O original não conecta explicitamente a entrada desta decisão. A ligação após a leitura é uma interpretação pendente de validação.' }),
  step('292'), step('287', 'documentation'), step('290', 'decision'), step('299'),
  step('296', 'documentation'), step('315', 'decision'), step('317'),
  step('303', 'decision', 'service', { note: 'As arestas 300 e 301 se sobrepõem até Documentar. São uma única alternativa Sim nesta visualização; os dois registros permanecem na fonte.' }),
  step('306', 'documentation'), step('309'), step('311'),
  step('312', 'end', 'service', { title: 'Fluxo finalizado · Resolvido', sourceIds: ['312', '423'], note: 'O fluxo termina em Resolvido. Encerrado aparece apenas na lista de estados; nenhuma transição automática foi acrescentada.' }),
  step('320', 'escalation'), step('322', 'escalation'), step('325', 'escalation'), step('341'), step('327'),
  step('329', 'action', 'service', { description: text('330'), sourceIds: ['329', '330'] }), step('333', 'decision'),
];
const link = (id: string, from: string, to: string, label?: string, inferred = false, sourceIds = [id]): FlowLink => ({ id, source: from, target: to, label, inferred, sourceIds });
export const edges: FlowLink[] = [
  link('225', '221', '224'), link('222', '224', '227', 'Sim'), link('223', '224', '229', 'Não'),
  link('226', '227', '234'), link('232', '234', '236', 'Não'), link('233', '234', '242', 'Sim'),
  link('235', '236', '237', undefined, true), link('240', '242', '245', 'Sim'), link('241', '242', '247', 'Não'),
  link('244', '245', '250'), link('246', '247', '250'), link('249', '250', '252'), link('251', '252', '256'),
  link('255', '256', '264'), link('planning-processing', '264', 'processing', undefined, true, ['268']),
  link('275', 'processing', '279'), link('278', '279', '281'),
  link('teleport', '281', '287', undefined, false, ['4', '9', '339', '419', '420']),
  link('228', '229', '285', undefined, true), link('283', '285', '292', 'Não'), link('284', '285', '287', 'Sim'),
  link('291', '292', '285'), link('286', '287', '290'), link('288', '290', '296', 'Não'), link('289', '290', '299', 'Sim'),
  link('298', '299', '303'), link('295', '296', '315'), link('313', '315', '317', 'Sim'), link('314', '315', '320', 'Não'),
  link('316', '317', '303'), link('300', '303', '306', 'Sim', false, ['300', '301']),
  link('302', '303', '296', 'Não · investigar'), link('218', '303', '320', 'Não · escalonar'),
  link('305', '306', '309'), link('308', '309', '311'), link('310', '311', '312'),
  link('319', '320', '322'), link('321', '322', '325'), link('324', '325', '341'), link('340', '341', '327'),
  link('326', '327', '329'), link('328', '329', '333'), link('331', '333', '311', 'Sim'), link('332', '333', '329', 'Não'),
];

export const references: FlowStep[] = [
  { id: 'groups', title: 'Grupos de operadores', ids: Array.from({ length: 13 }, (_, i) => String(342 + i)) },
  { id: 'impact', title: 'Impacto', ids: ['356', '357', '358'] },
  { id: 'urgency', title: 'Urgência', ids: ['359', '360', '361'] },
  { id: 'states', title: 'Estados do chamado', ids: Array.from({ length: 6 }, (_, i) => String(364 + i)) },
  { id: 'categories', title: 'Categorias e subcategorias', ids: Array.from({ length: 45 }, (_, i) => String(372 + i)) },
].map(group => ({ id: group.id, title: group.title, type: 'reference', section: 'reference', independent: true, sourceIds: group.ids, fields: fields(...group.ids) }));

export const flow: FlowModel = { entry: '221', nodes: [...nodes, ...references], edges, documents: [] };
export const metadata = { title: 'Atendimento a chamados', version: '0.1', source: source.file, hash: source.sha256 };
export const issues = [
  'Leitura → Informações suficientes: ligação interpretada; o destino da seta 228 não está vinculado no XML.',
  'Aplicar solução → Fim: origem da seta 235 não está vinculada; conexão interpretada pela posição.',
  'Planejamento → Processamento: sequência interpretada pelos agrupamentos; a seta 268 conecta campos internos.',
  'Resolveu?: há duas rotas Não (investigar e escalonar), sem critério documentado para escolher entre elas.',
  'Categorias e subcategorias: todos os 45 rótulos foram preservados, mas não se atribuiu hierarquia não explicitada.',
];