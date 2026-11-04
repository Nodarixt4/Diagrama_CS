import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import type { FlowModel } from '../flow/types';
import type { Exploration } from '../flow/exploration';
import { buildExplanationRequest, explanationService } from './service';
import type { Explanation, ExplanationService } from './service';

export function AssistancePanel({ model, state, onClose, service = explanationService }: { model: FlowModel; state: Exploration; onClose: () => void; service?: ExplanationService }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<Explanation | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const context = buildExplanationRequest(model, state, question);
  const ask = async () => {
    if (!service.available || !question.trim()) return;
    controller.current?.abort();
    const request = new AbortController(); controller.current = request;
    setStatus('loading'); setAnswer(null);
    try {
      const result = await service.explain(context, request.signal);
      if (!request.signal.aborted) { setAnswer(result); setStatus('idle'); }
    } catch { if (!request.signal.aborted) setStatus('error'); }
  };
  return <motion.aside className="detail-float floating-surface assistance-panel" aria-label="Assistência contextual com IA" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <div className="float-heading"><span>Assistência contextual · IA</span><button autoFocus className="icon-button" onClick={onClose} aria-label="Fechar assistência"><X size={17} /></button></div>
    <h2>{context.step.title}</h2>
    <p className="assistance-context">{context.journey.visits.length} visitas no percurso{context.journey.inspecting ? ' · etapa em inspeção' : ' · etapa atual'}</p>
    {!service.available && <div className="service-unavailable" role="status"><strong>IA ainda não configurada</strong><p>Nenhum provedor ou backend está conectado. Nenhuma pergunta ou informação do processo será enviada.</p></div>}
    <label className="question-label">Sua dúvida<textarea maxLength={1500} value={question} onChange={e => setQuestion(e.target.value)} placeholder="O que você gostaria de entender?" /></label>
    <div className="question-suggestions">{['Por que esta etapa é necessária?', context.step.type === 'decision' ? 'Como diferenciar os caminhos?' : 'Mostre um exemplo hipotético.'].map(text => <button key={text} onClick={() => setQuestion(text)}>{text}</button>)}</div>
    <button className="path-choice ask-button" disabled={!service.available || !question.trim() || status === 'loading'} onClick={() => void ask()}>{status === 'loading' ? 'Consultando…' : 'Pedir explicação'}</button>
    <div aria-live="polite">{status === 'error' && <p role="alert">Não foi possível obter a explicação. Tente novamente.</p>}{answer && <div className="explanation-answer">{([['Informação documentada', answer.documented], ['Interpretação da IA', answer.interpretation], ['Exemplo hipotético', answer.hypotheticalExample], ['Limitações e conteúdo não confirmado', answer.limitations]] as const).map(([label, text]) => text && <section key={label}><h3>{label}</h3><p>{text}</p></section>)}</div>}</div>
    <details className="disclosure"><summary>Contexto e confiabilidade</summary><p>A solicitação considera esta etapa, suas conexões, condições e a ordem real do percurso. {context.documentation.length ? 'Há referências documentais cadastradas.' : 'Não há documentação complementar cadastrada.'}</p><p>Explicações e exemplos não substituem procedimentos homologados. Não inclua dados pessoais, senhas ou informações confidenciais na pergunta.</p></details>
  </motion.aside>;
}