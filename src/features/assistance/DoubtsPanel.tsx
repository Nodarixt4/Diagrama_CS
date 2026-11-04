import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { answerForStep, faqSources, questionsForStep } from '../../data/flows/atendimento-topdesk/faq';
import type { StepFAQ } from '../../data/flows/atendimento-topdesk/faq';
import type { FlowStep } from '../flow/types';

export function DoubtsPanel({ step, onClose }: { step: FlowStep; onClose: () => void }) {
  const [messages, setMessages] = useState<{ faq: StepFAQ; answered: boolean }[]>([]);
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined), locked = useRef(false);
  const end = useRef<HTMLDivElement>(null), reduced = useReducedMotion();
  const questions = questionsForStep(step.id);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest' }); }, [messages, reduced]);
  const ask = (id: string) => {
    const faq = answerForStep(step.id, id);
    if (!faq || locked.current) return;
    locked.current = true; setPending(true);
    setMessages(items => [...items, { faq, answered: false }]);
    timer.current = setTimeout(() => {
      setMessages(items => items.map(item => item.faq.id === id ? { ...item, answered: true } : item));
      locked.current = false; setPending(false);
    }, reduced ? 0 : 260);
  };
  return <motion.aside className={`floating-surface doubts-panel step-themed theme-${step.type}`} aria-label="Ajuda nesta etapa" initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <div className="float-heading"><span>Ajuda nesta etapa</span><button autoFocus className="icon-button" onClick={onClose} aria-label="Fechar dúvidas"><X size={17} /></button></div>
    <h2>{step.title}</h2><p className="doubts-disclaimer">Respostas locais baseadas no fluxo operacional e em boas práticas de gerenciamento de serviços. Sem IA generativa.</p>
    <div className="conversation" role="log" aria-label={`Conversa sobre ${step.title}`} aria-live="polite" aria-relevant="additions text">
      {!messages.length && <p className="conversation-empty">Selecione uma dúvida abaixo.</p>}
      {messages.map(({ faq, answered }) => <div className="conversation-turn" key={faq.id}>
        <div className="chat-question"><span>Você</span><p>{faq.question}</p></div>
        {answered ? <motion.div className="chat-answer" initial={{ opacity: 0, y: reduced ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }}><span>Orientação contextual</span><p>{faq.answer}</p><details className="faq-source"><summary>Base desta resposta</summary>{faq.sourceRefs.map(ref => { const source = faqSources[ref as keyof typeof faqSources]; return <p key={ref}>{source.url.startsWith('https:') ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : source.title}</p>; })}</details></motion.div> : <div className="chat-pending" role="status">Preparando resposta<span aria-hidden="true">…</span></div>}
      </div>)}<div ref={end} />
    </div>
    <div className="faq-suggestions" aria-label="Perguntas disponíveis">{questions.filter(faq => !messages.some(m => m.faq.id === faq.id)).map(faq => <button disabled={pending} key={faq.id} onClick={() => ask(faq.id)}>{faq.question}</button>)}{!questions.length && <p>Este marcador não possui dúvidas cadastradas. Consulte os detalhes da etapa.</p>}{questions.length > 0 && messages.length === questions.length && <p>Você consultou todas as dúvidas desta etapa.</p>}</div>
  </motion.aside>;
}