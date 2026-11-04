import { X } from 'lucide-react';
import { motion } from 'motion/react';
import type { FlowStep } from './types';
import { typeLabels } from './FlowCanvas';
import { stepDocumentation } from '../../data/flows/atendimento-topdesk/documentation';

export function DetailPanel({ step, onClose }: { step: FlowStep; onClose: () => void }) {
  const documentation = stepDocumentation[step.id];
  return <motion.aside className={`detail-float floating-surface step-themed theme-${step.type}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} aria-label="Detalhes da etapa">
    <div className="float-heading"><span>{typeLabels[step.type]}</span><button autoFocus className="icon-button" onClick={onClose} aria-label="Fechar detalhes"><X size={17} /></button></div>
    <h2>{step.title}</h2>
    <p className="documentation-disclaimer">Explicação didática do diagrama · não é uma regra oficial.</p>
    <p>{documentation.description}</p>
    <details className="disclosure"><summary>Objetivo</summary><p>{documentation.objective}</p></details>
    <details className="disclosure"><summary>Contexto no processo</summary><p>{documentation.context}</p></details>
    <details className="disclosure"><summary>Orientação e limites</summary><p>{documentation.guidance}</p></details>
    {step.description && <p>{step.description}</p>}
    {step.fields && <><p>{step.type === 'reference' ? 'Valores presentes no diagrama original.' : 'Informações deste preenchimento.'}</p><ul className="field-list">{step.fields.map(field => <li key={field}>{field}</li>)}</ul></>}
    {step.note && <details className="disclosure"><summary>Nota sobre a interpretação</summary><p>{step.note}</p></details>}
    <details className="disclosure"><summary>Fonte e documentação</summary><p>TOPdesk · elementos {step.sourceIds.join(', ')}.</p><p>Documentação complementar ainda não cadastrada. Responsáveis, critérios e exemplos não foram inferidos.</p></details>
  </motion.aside>;
}