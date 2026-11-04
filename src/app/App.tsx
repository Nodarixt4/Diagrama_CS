import { useEffect, useRef, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Compass, Search, X } from 'lucide-react';
import { flow, issues, references } from '../data/flows/atendimento-topdesk';
import { FlowCanvas } from '../features/flow/FlowCanvas';
import { DetailPanel } from '../features/flow/DetailPanel';
import { AssistancePanel } from '../features/assistance/AssistancePanel';
import { ExportPanel } from '../features/export/ExportPanel';
import { createExploration, follow, inspect, resumeAtVisit, retreat } from '../features/flow/exploration';
import { searchSteps } from '../features/flow/graph';
import type { FlowView } from '../features/flow/types';

type Surface = 'menu' | 'search' | 'history' | 'help' | null;
export function App() {
  const [state, setState] = useState(() => createExploration(flow));
  const [overview, setOverview] = useState(false);
  const [view, setView] = useState<FlowView>('complete');
  const [surface, setSurface] = useState<Surface>(null);
  const [details, setDetails] = useState(false);
  const [assistance, setAssistance] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [journeyId, setJourneyId] = useState(() => crypto.randomUUID());
  const [query, setQuery] = useState('');
  const [tools, setTools] = useState(false);
  const [cameraToken, setCameraToken] = useState(0);
  const exploreRef = useRef<HTMLButtonElement>(null);
  const current = state.journey.nodes.at(-1)!;
  const focusedStep = flow.nodes.find(n => n.id === state.focused)!;
  const inspecting = state.focused !== current || (state.focusedVisit !== undefined && state.focusedVisit !== state.journey.nodes.length - 1);
  const complete = flow.nodes.find(n => n.id === current)?.type === 'end';
  const results = query.trim() ? searchSteps(flow.nodes, query) : references;
  const select = (id: string) => { setState(s => inspect(s, id)); setSurface(null); setAssistance(false); setDetails(true); };
  const selectCanvas = (id: string) => {
    if (overview) { select(id); return; }
    const index = Number(id);
    setState(s => ({ ...s, focused: s.journey.nodes[index], focusedVisit: index }));
    setDetails(false); setAssistance(false);
  };
  const move = (id: string) => { setState(s => follow(flow, s, id)); setDetails(false); setAssistance(false); };
  const reset = () => { setState(createExploration(flow)); setJourneyId(crypto.randomUUID()); setExporting(false); setOverview(false); setSurface(null); setDetails(false); setAssistance(false); setCameraToken(t => t + 1); };
  const close = () => { setSurface(null); setDetails(false); exploreRef.current?.focus(); };
  const goBack = () => {
    setState(s => retreat(s));
    setOverview(false); setSurface(null); setDetails(false); setAssistance(false);
    setExporting(false);
    setCameraToken(t => t + 1);
  };
  useEffect(() => {
    if (surface) setAssistance(false);
    const onKey = (e: KeyboardEvent) => {
      const editing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement && e.target.isContentEditable);
      if (e.altKey && e.key === 'ArrowLeft' && !editing && state.journey.edges.length > 0) { e.preventDefault(); goBack(); }
      if (e.key === 'Escape') setAssistance(false);
      if (e.key === 'Escape') setExporting(false);
      if (e.key === 'Escape') close();
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setSurface('search'); setDetails(false); }
      if (e.key === 'Tab' && surface) {
        const controls = document.querySelectorAll<HTMLElement>('.explore-float button, .explore-float input, .explore-float summary');
        const first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [surface, state.journey.edges.length]);
  return <MotionConfig reducedMotion="user"><main className={`experience ${overview ? 'overview-mode' : ''}`}>
    <div className="ambient-light" aria-hidden="true" />
    <header className="identity"><a href="./" aria-label="APTUM FLOW">aptum<span>/</span><strong>flow</strong><i /></a></header>
    <button ref={exploreRef} className={`explore-trigger ${surface ? 'is-open' : ''}`} onClick={() => { setSurface(surface ? null : 'menu'); setDetails(false); }} aria-expanded={Boolean(surface)} aria-controls="explore-surface"><Compass size={16} />Explorar</button>
    <div className="spatial-canvas"><ReactFlowProvider><FlowCanvas state={state} overview={overview} view={view} tools={tools} cameraToken={cameraToken} onInspect={selectCanvas} onFollow={move} onDetails={() => { setDetails(true); setSurface(null); setAssistance(false); }} onExplain={() => { setAssistance(true); setDetails(false); setSurface(null); }} /></ReactFlowProvider></div>
    {overview && <div className="overview-caption"><span>O PROCESSO INTEIRO</span><h2>Uma arquitetura de decisões.</h2><p>Selecione uma etapa para aproximar. Seu percurso permanece onde você o deixou.</p><div className="overview-tabs">{([['complete', 'Completo'], ['service', 'Atendimento'], ['registration', 'Registro']] as const).map(([id, title]) => <button key={id} aria-pressed={view === id} onClick={() => setView(id)}>{title}</button>)}</div></div>}
    <AnimatePresence>{details && <DetailPanel key={focusedStep.id} step={focusedStep} onClose={() => setDetails(false)} />}</AnimatePresence>
    <AnimatePresence>{assistance && <AssistancePanel key={`${focusedStep.id}-${state.journey.edges.join('-')}`} model={flow} state={state} onClose={() => setAssistance(false)} />}</AnimatePresence>
    {complete && !overview && !inspecting && !exporting && <div className="completion-actions"><button onClick={() => { setExporting(true); setDetails(false); setAssistance(false); }}>Exportar PDF</button><button onClick={() => setSurface('history')}>Revisar percurso</button><button onClick={reset}>Iniciar novamente</button></div>}
    {exporting && complete && <ExportPanel model={flow} journey={state.journey} id={journeyId} onClose={() => setExporting(false)} />}
    <AnimatePresence>{surface && <motion.section key={surface} id="explore-surface" className="explore-float floating-surface" role="dialog" aria-label={surface === 'search' ? 'Buscar no processo' : surface === 'history' ? 'Caminho percorrido' : surface === 'help' ? 'Sobre o processo' : 'Opções de exploração'} initial={{ opacity: 0, y: -7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
      <div className="float-heading"><span>{surface === 'search' ? 'Encontrar uma etapa' : surface === 'history' ? 'Seu caminho' : surface === 'help' ? 'Sobre esta experiência' : 'O processo, no seu ritmo.'}</span><button autoFocus={surface !== 'search'} className="icon-button" onClick={close} aria-label="Fechar opções"><X size={17} /></button></div>
      {surface === 'menu' && <div className="menu-list">
        <button onClick={() => { setOverview(!overview); setSurface(null); setDetails(false); }}><span>{overview ? 'Voltar à descoberta' : 'Ver o fluxo completo'}<small>{overview ? 'Retorne ao mesmo ponto de exploração.' : 'Afaste o olhar. Veja as relações do processo.'}</small></span><ArrowRight size={16} /></button>
        <button onClick={() => setSurface('search')}><span>Buscar e consultar<small>Etapas, categorias e referências operacionais.</small></span><Search size={16} /></button>
        <button onClick={() => setSurface('history')}><span>Revisar meu caminho<small>{state.journey.nodes.length} visita(s). Retornos também fazem parte.</small></span><ArrowRight size={16} /></button>
        <button onClick={() => { setTools(!tools); setSurface(null); }}><span>{tools ? 'Ocultar' : 'Mostrar'} controles do mapa<small>Zoom e enquadramento. Minimapa na visão completa.</small></span><ArrowRight size={16} /></button>
        <button onClick={() => setSurface('help')}><span>Como explorar e notas da fonte<small>Gestos, semântica e interpretações documentadas.</small></span><ArrowRight size={16} /></button>
        <button className="reset-option" onClick={reset}>Recomeçar do início</button>
      </div>}
      {surface === 'search' && <><label className="search-field"><Search size={16} /><input autoFocus aria-label="Buscar etapas" placeholder="Uma palavra, etapa ou categoria…" value={query} onChange={e => setQuery(e.target.value)} /></label><div className="result-list">{!query && <p>Referências do processo</p>}{results.map(n => <button key={n.id} onClick={() => select(n.id)}><span>{n.title}</span><ArrowRight size={15} /></button>)}{!results.length && <p>Nenhum resultado. Experimente outra palavra.</p>}</div></>}
      {surface === 'history' && <><p className="surface-copy">Inspecionar uma visita não muda seu percurso. Para seguir outra alternativa, escolha “Retomar daqui”.</p><ol className="visit-list">{state.journey.nodes.map((id, index) => <li key={`${id}-${index}`}><button onClick={() => { setOverview(false); setState(s => ({ ...s, focused: id, focusedVisit: index })); setSurface(null); setDetails(true); }}><span>{String(index + 1).padStart(2, '0')}</span>{flow.nodes.find(n => n.id === id)?.title}</button><button className="resume-visit" onClick={() => { setState(s => resumeAtVisit(s, index)); setExporting(false); setOverview(false); setSurface(null); setDetails(false); }}>Retomar daqui</button></li>)}</ol></>}
      {surface === 'help' && <div className="help-copy"><h2>Menos interface.<br />Mais processo.</h2><p>Comece no ponto de entrada e siga as conexões. Em decisões, escolha uma alternativa. O passado permanece no espaço, mas apenas o presente pede atenção.</p><details className="disclosure"><summary>Gestos e teclado</summary><p>Arraste para explorar e role para aproximar. Tab percorre os elementos disponíveis; Enter ativa uma escolha. “/” abre a busca. Escape fecha informações. “Voltar” desfaz uma transição; revisar uma etapa não conta como visita operacional.</p></details><details className="disclosure"><summary>Linguagem do mapa</summary><p>Texto iluminado: foco atual. Etapas atenuadas: descobertas. Caminhos futuros permanecem ocultos. Alternativas aparecem na decisão; referências não são etapas sequenciais. Linhas tracejadas indicam uma interpretação do original.</p></details><details className="disclosure"><summary>Notas de fidelidade</summary><ul>{issues.map(issue => <li key={issue}>{issue}</li>)}</ul><p>Estas interpretações precisam de homologação operacional. Nenhuma integração TOPdesk está ativa.</p></details></div>}
    </motion.section>}</AnimatePresence>
    <footer className="quiet-footer">
      <div className="return-actions">
        {state.journey.edges.length > 0 && <button className="return-context logical-back" onClick={goBack} title="Voltar etapa (Alt + ←)"><ArrowLeft size={15} />Voltar</button>}
        {overview ? <button className="return-context" onClick={() => setOverview(false)}>Fechar visão geral</button> : inspecting ? <button className="return-context" onClick={() => { setState(s => ({ ...s, focused: current, focusedVisit: undefined })); setDetails(false); setAssistance(false); }}>Retomar meu percurso</button> : !state.journey.edges.length && <span className="initial-hint">Explore o atendimento. Uma etapa de cada vez.</span>}
      </div>
      {state.journey.edges.length > 0 && <button className="journey-link" onClick={() => { setSurface('history'); setDetails(false); }}>{state.journey.nodes.length.toString().padStart(2, '0')}<span>visitas no percurso</span></button>}
    </footer>
  </main></MotionConfig>;
}