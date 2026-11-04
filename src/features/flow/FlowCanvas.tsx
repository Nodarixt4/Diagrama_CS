import { useEffect, useState } from 'react';
import { BaseEdge, Controls, EdgeLabelRenderer, getBezierPath, Handle, MarkerType, MiniMap, Position, ReactFlow, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import type { Edge, EdgeProps, Node, NodeProps } from '@xyflow/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { transitionTiming } from './useJourneyTransition';
import type { JourneyTransition } from './useJourneyTransition';
import { flow } from '../../data/flows/atendimento-topdesk';
import { outgoing } from './graph';
import { positions } from './layout';
import { journeyMetrics, journeyOccurrences } from './journeyLayout';
import type { Exploration } from './exploration';
import type { FlowStep, FlowView } from './types';

export const typeLabels = { start: 'O ponto de partida', end: 'Conclusão', action: 'Atendimento', decision: 'Uma decisão no caminho', escalation: 'Mudança de responsabilidade', documentation: 'Registro e conhecimento', reference: 'Referência operacional' };
type SpatialNode = Node<{
  step: FlowStep; level: 'focused' | 'contextual' | 'dormant' | 'overview';
  current: boolean; onFollow: (id: string) => void; onDetails: () => void; onInspect: (id: string) => void; onExplain: () => void;
  visit?: number; input: Position; output: Position;
  entering: boolean; exiting: boolean; busy: boolean; serial: number; reduced: boolean;
}, 'spatial'>;
type SpatialEdge = Edge<{ fresh: boolean; quiet: boolean; inferred: boolean; serial: number; reduced: boolean }>;

function ProcessNode({ data, id }: NodeProps<SpatialNode>) {
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => { updateNodeInternals(id); }, [id, data.input, data.output, updateNodeInternals]);
  const { step, level, current } = data;
  const focused = level === 'focused';
  const exits = outgoing(flow, step.id);
  return <article className={`process-node ${step.type} ${level} ${data.exiting ? 'exiting-visit' : ''}`} onKeyDown={event => {
    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); data.onInspect(step.id); }
  }} tabIndex={!data.exiting && (level === 'contextual' || level === 'overview') ? 0 : -1} aria-label={step.title} aria-hidden={level === 'dormant' || data.exiting}>
    <Handle type="target" position={data.input} />
    <motion.div className="node-content" initial={data.entering && !data.reduced ? { opacity: 0, filter: 'blur(10px)', y: 16, scale: .97 } : false}
      animate={data.exiting ? { opacity: 0, filter: data.reduced ? 'blur(0px)' : 'blur(6px)', y: data.reduced ? 0 : -8, scale: .98 } : { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
      transition={{ duration: data.reduced ? 0 : (data.exiting ? transitionTiming.exit : transitionTiming.reveal) / 1000, delay: data.entering ? transitionTiming.delay / 1000 : 0, ease: [.22, 1, .36, 1] }}>
      <div className="step-kicker">{data.visit !== undefined && <span className="visit-number">{String(data.visit + 1).padStart(2, '0')}</span>}{step.type === 'start' ? <span className="origin-mark" /> : step.type === 'escalation' ? <ArrowUpRight size={15} /> : <span className="step-rule" />}{typeLabels[step.type]}</div>
      <h1>{step.type === 'start' ? <>Todo atendimento<br />começa aqui<span>.</span></> : step.title}</h1>
      {focused && step.type === 'start' && <p className="start-caption">Uma decisão de cada vez.<br />Descubra o processo de atendimento TOPdesk.</p>}
      {focused && step.type === 'end' && <p className="start-caption">Este caminho chegou ao fim.<br />Você pode revisar suas decisões ou recomeçar.</p>}
      {focused && current && exits.length > 0 && <div className={`node-choices nodrag nopan ${step.type === 'decision' ? 'branch-choices' : ''}`}>
        {exits.map(edge => <button disabled={data.busy || data.exiting} key={edge.id} className="path-choice" onClick={e => { e.stopPropagation(); data.onFollow(edge.id); }}>
          <span>{step.type === 'start' ? 'Começar o percurso' : edge.label ?? 'Continuar'}</span><ArrowRight size={17} />
        </button>)}
      </div>}
      {focused && step.type !== 'start' && <div className="context-actions nodrag nopan"><button className="understand" onClick={e => { e.stopPropagation(); data.onDetails(); }}>Detalhes da etapa</button>{step.type !== 'end' && <button className="understand explain-action" onClick={e => { e.stopPropagation(); data.onExplain(); }}>Tirar dúvidas</button>}</div>}
    </motion.div>
    <Handle type="source" position={data.output} />
  </article>;
}
function RevealedEdge(props: EdgeProps<SpatialEdge>) {
  const [path, x, y] = getBezierPath(props);
  return <g className={`spatial-edge ${props.data?.fresh ? 'fresh' : ''} ${props.data?.quiet ? 'quiet' : ''} ${props.data?.inferred ? 'inferred' : ''}`}>
    <BaseEdge path={path} style={{ stroke: 'transparent' }} interactionWidth={0} />
    <motion.path key={props.data?.fresh ? `reveal-${props.data.serial}` : 'settled'} d={path} initial={props.data?.fresh && !props.data.reduced ? { pathLength: 0, opacity: 0 } : false} animate={{ pathLength: 1, opacity: props.data?.quiet ? .35 : .7 }} transition={{ duration: props.data?.reduced ? 0 : transitionTiming.edge / 1000, ease: [.22, 1, .36, 1] }} className="revealed-line" fill="none" markerEnd={props.markerEnd} />
    {props.label && <EdgeLabelRenderer><div className="edge-word" style={{ transform: `translate(-50%, -50%) translate(${x}px,${y}px)` }}>{props.label}</div></EdgeLabelRenderer>}
  </g>;
}
const nodeTypes = { spatial: ProcessNode };
const edgeTypes = { revealed: RevealedEdge };
interface Props {
  state: Exploration; overview: boolean; view: FlowView; tools: boolean; cameraToken: number;
  onInspect: (id: string) => void; onFollow: (id: string) => void; onDetails: () => void; onExplain: () => void;
  transition: JourneyTransition | null; helpOpen: boolean;
}
export function FlowCanvas({ state, overview, view, tools, cameraToken, onInspect, onFollow, onDetails, onExplain, transition, helpOpen }: Props) {
  const { setCenter, fitView, getNodes, viewportInitialized } = useReactFlow();
  const current = state.journey.nodes.at(-1)!;
  const focus = state.focused;
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => { const resize = () => setWidth(window.innerWidth); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize); }, []);
  const columns = width >= 1400 ? 3 : width >= 900 ? 2 : 1;
  const visits = journeyOccurrences(state.journey, columns);
  const reduced = Boolean(useReducedMotion());
  // Exit copies are visual-only: never added back to the active journey or PDF.
  const removed = transition?.kind === 'retreat' && transition.journey.nodes.length === visits.length + 1 && !reduced ? journeyOccurrences(transition.journey, columns).slice(-1) : [];
  const renderedVisits = [...visits, ...removed];
  const focusedIndex = state.focusedVisit ?? state.journey.nodes.lastIndexOf(focus);
  const nodes: SpatialNode[] = (overview ? flow.nodes.map(step => ({ step, occurrence: undefined })) : renderedVisits.map(occurrence => ({ step: flow.nodes.find(n => n.id === occurrence.nodeId)!, occurrence }))).map(({ step, occurrence }) => {
    const inView = view === 'complete' || step.section === (view === 'service' ? 'service' : 'registration');
    const level = overview && inView ? 'overview' : overview ? 'dormant' : occurrence?.index === focusedIndex ? 'focused' : 'contextual';
    const index = occurrence?.index ?? 0;
    const exiting = Boolean(occurrence && index >= visits.length);
    const pos = occurrence?.position;
    const previous = index ? visits[index - 1]?.position : undefined;
    const next = visits[index + 1]?.position;
    const input = previous && pos && previous.row !== pos.row ? Position.Top : pos && pos.row % 2 ? Position.Right : Position.Left;
    const output = next && pos && next.row !== pos.row ? Position.Bottom : pos && pos.row % 2 ? Position.Left : Position.Right;
    return { id: occurrence?.id ?? step.id, type: 'spatial', position: pos ?? positions[step.id], width: journeyMetrics.width, height: journeyMetrics.height, draggable: false,
      focusable: false, selectable: level !== 'dormant', ariaLabel: level === 'dormant' ? undefined : step.title,
      style: { pointerEvents: level === 'dormant' || exiting ? 'none' : 'auto' },
      data: { step, level, current: !exiting && occurrence?.index === visits.length - 1 && current === step.id, onFollow, onDetails, onInspect: () => occurrence ? onInspect(String(occurrence.index)) : onInspect(step.id), onExplain, visit: occurrence?.index, input, output,
        entering: !overview && transition?.kind === 'advance' && index === visits.length - 1, exiting, busy: Boolean(transition), serial: transition?.serial ?? 0, reduced } };
  });
  const edges: SpatialEdge[] = (overview ? flow.edges.filter(edge => nodes.find(n => n.id === edge.source)?.data.level === 'overview' && nodes.find(n => n.id === edge.target)?.data.level === 'overview') : visits.slice(1).map((visit, i) => ({ ...flow.edges.find(e => e.id === visit.via)!, id: `transition-${i}`, source: visits[i].id, target: visit.id }))).map((edge, index, all) => ({ ...edge, type: 'revealed', label: edge.label, markerEnd: { type: MarkerType.Arrow, color: '#59bfb9', width: 12, height: 12 },
    data: { fresh: !overview && transition?.kind === 'advance' && index === all.length - 1, quiet: overview, inferred: Boolean(edge.inferred), serial: transition?.serial ?? 0, reduced } }));
  useEffect(() => {
    if (!viewportInitialized) return;
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 850;
    if (overview) {
      const shown = getNodes().filter(n => view === 'complete' || n.data.step && (n.data.step as FlowStep).section === (view === 'service' ? 'service' : 'registration'));
      void fitView({ nodes: shown, padding: .15, duration });
    } else {
      const p = visits[Math.max(0, focusedIndex)]?.position;
      if (!p) return;
      const zoom = Math.min(1, (width - 32) / journeyMetrics.width);
      const panelOffset = helpOpen && width >= 900 ? 210 / zoom : 0;
      void setCenter(p.x + journeyMetrics.width / 2 + panelOffset, p.y + journeyMetrics.height / 2, { zoom, duration: duration ? transitionTiming.camera : 0 });
    }
  }, [focus, focusedIndex, overview, view, cameraToken, viewportInitialized, setCenter, fitView, getNodes, columns, width, state.journey.nodes.length, helpOpen]);
  return <ReactFlow<SpatialNode, SpatialEdge> nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
    onNodeClick={(_, node) => { if (node.data.level !== 'dormant') node.data.onInspect(node.data.step.id); }}
    nodesDraggable={false} nodesConnectable={false} edgesFocusable={false} deleteKeyCode={null} minZoom={overview ? .045 : .65} maxZoom={1.6}
    defaultViewport={{ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 145, zoom: 1 }} colorMode="dark" aria-label="Processo de atendimento: canvas de descoberta">
    {tools && <Controls showInteractive={false} />}
    {tools && overview && <MiniMap pannable zoomable nodeColor="#68817a" maskColor="#0b0e10dd" />}
  </ReactFlow>;
}