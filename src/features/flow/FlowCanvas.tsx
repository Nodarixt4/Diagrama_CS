import { useEffect, useState } from 'react';
import { BaseEdge, Controls, EdgeLabelRenderer, getBezierPath, Handle, MarkerType, MiniMap, Position, ReactFlow, useReactFlow } from '@xyflow/react';
import type { Edge, EdgeProps, Node, NodeProps } from '@xyflow/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
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
}, 'spatial'>;
type SpatialEdge = Edge<{ fresh: boolean; quiet: boolean; inferred: boolean }>;

function ProcessNode({ data }: NodeProps<SpatialNode>) {
  const { step, level, current } = data;
  const focused = level === 'focused';
  const exits = outgoing(flow, step.id);
  return <article className={`process-node ${step.type} ${level}`} onKeyDown={event => {
    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); data.onInspect(step.id); }
  }} tabIndex={level === 'contextual' || level === 'overview' ? 0 : -1} aria-label={step.title} aria-hidden={level === 'dormant'}>
    <Handle type="target" position={data.input} />
    <div className="node-content">
      <div className="step-kicker">{data.visit !== undefined && <span className="visit-number">{String(data.visit + 1).padStart(2, '0')}</span>}{step.type === 'start' ? <span className="origin-mark" /> : step.type === 'escalation' ? <ArrowUpRight size={15} /> : <span className="step-rule" />}{typeLabels[step.type]}</div>
      <h1>{step.type === 'start' ? <>Todo atendimento<br />começa aqui<span>.</span></> : step.title}</h1>
      {focused && step.type === 'start' && <p className="start-caption">Uma decisão de cada vez.<br />Descubra o processo de atendimento TOPdesk.</p>}
      {focused && step.type === 'end' && <p className="start-caption">Este caminho chegou ao fim.<br />Você pode revisar suas decisões ou recomeçar.</p>}
      {focused && current && exits.length > 0 && <div className={`node-choices nodrag nopan ${step.type === 'decision' ? 'branch-choices' : ''}`}>
        {exits.map(edge => <button key={edge.id} className="path-choice" onClick={e => { e.stopPropagation(); data.onFollow(edge.id); }}>
          <span>{step.type === 'start' ? 'Começar o percurso' : edge.label ?? 'Continuar'}</span><ArrowRight size={17} />
        </button>)}
      </div>}
      {focused && step.type !== 'start' && <div className="context-actions nodrag nopan"><button className="understand" onClick={e => { e.stopPropagation(); data.onDetails(); }}>Detalhes da etapa</button><button className="understand explain-action" onClick={e => { e.stopPropagation(); data.onExplain(); }}>Explicar com IA</button></div>}
    </div>
    <Handle type="source" position={data.output} />
  </article>;
}
function RevealedEdge(props: EdgeProps<SpatialEdge>) {
  const [path, x, y] = getBezierPath(props);
  return <g className={`spatial-edge ${props.data?.fresh ? 'fresh' : ''} ${props.data?.quiet ? 'quiet' : ''} ${props.data?.inferred ? 'inferred' : ''}`}>
    <BaseEdge path={path} style={{ stroke: 'transparent' }} interactionWidth={0} />
    <path d={path} pathLength={1} className="revealed-line" fill="none" markerEnd={props.markerEnd} />
    {props.label && <EdgeLabelRenderer><div className="edge-word" style={{ transform: `translate(-50%, -50%) translate(${x}px,${y}px)` }}>{props.label}</div></EdgeLabelRenderer>}
  </g>;
}
const nodeTypes = { spatial: ProcessNode };
const edgeTypes = { revealed: RevealedEdge };
interface Props {
  state: Exploration; overview: boolean; view: FlowView; tools: boolean; cameraToken: number;
  onInspect: (id: string) => void; onFollow: (id: string) => void; onDetails: () => void; onExplain: () => void;
}
export function FlowCanvas({ state, overview, view, tools, cameraToken, onInspect, onFollow, onDetails, onExplain }: Props) {
  const { setCenter, fitView, getNodes, viewportInitialized } = useReactFlow();
  const current = state.journey.nodes.at(-1)!;
  const focus = state.focused;
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => { const resize = () => setWidth(window.innerWidth); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize); }, []);
  const columns = width >= 1400 ? 3 : width >= 900 ? 2 : 1;
  const visits = journeyOccurrences(state.journey, columns);
  const focusedIndex = state.focusedVisit ?? state.journey.nodes.lastIndexOf(focus);
  const nodes: SpatialNode[] = (overview ? flow.nodes.map(step => ({ step, occurrence: undefined })) : visits.map(occurrence => ({ step: flow.nodes.find(n => n.id === occurrence.nodeId)!, occurrence }))).map(({ step, occurrence }) => {
    const inView = view === 'complete' || step.section === (view === 'service' ? 'service' : 'registration');
    const level = overview && inView ? 'overview' : overview ? 'dormant' : occurrence?.index === focusedIndex ? 'focused' : 'contextual';
    const index = occurrence?.index ?? 0;
    const pos = occurrence?.position;
    const previous = index ? visits[index - 1]?.position : undefined;
    const next = visits[index + 1]?.position;
    const input = previous && pos && previous.row !== pos.row ? Position.Top : pos && pos.row % 2 ? Position.Right : Position.Left;
    const output = next && pos && next.row !== pos.row ? Position.Bottom : pos && pos.row % 2 ? Position.Left : Position.Right;
    return { id: occurrence?.id ?? step.id, type: 'spatial', position: pos ?? positions[step.id], width: journeyMetrics.width, height: journeyMetrics.height, draggable: false,
      focusable: false, selectable: level !== 'dormant', ariaLabel: level === 'dormant' ? undefined : step.title,
      style: { pointerEvents: level === 'dormant' ? 'none' : 'auto' },
      data: { step, level, current: occurrence?.index === visits.length - 1 && current === step.id, onFollow, onDetails, onInspect: () => occurrence ? onInspect(String(occurrence.index)) : onInspect(step.id), onExplain, visit: occurrence?.index, input, output } };
  });
  const edges: SpatialEdge[] = (overview ? flow.edges.filter(edge => nodes.find(n => n.id === edge.source)?.data.level === 'overview' && nodes.find(n => n.id === edge.target)?.data.level === 'overview') : visits.slice(1).map((visit, i) => ({ ...flow.edges.find(e => e.id === visit.via)!, id: `transition-${i}`, source: visits[i].id, target: visit.id }))).map((edge, index, all) => ({ ...edge, type: 'revealed', label: edge.label, markerEnd: { type: MarkerType.Arrow, color: '#59bfb9', width: 12, height: 12 },
    data: { fresh: !overview && index === all.length - 1, quiet: overview, inferred: Boolean(edge.inferred) } }));
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
      const rowCenter = (columns - 1) * (journeyMetrics.width + journeyMetrics.gapX) / 2 + journeyMetrics.width / 2;
      void setCenter(rowCenter, p.y + journeyMetrics.height / 2, { zoom, duration: duration ? 420 : 0 });
    }
  }, [focus, focusedIndex, overview, view, cameraToken, viewportInitialized, setCenter, fitView, getNodes, columns, width, state.journey.nodes.length]);
  return <ReactFlow<SpatialNode, SpatialEdge> nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
    onNodeClick={(_, node) => { if (node.data.level !== 'dormant') node.data.onInspect(node.data.step.id); }}
    nodesDraggable={false} nodesConnectable={false} edgesFocusable={false} deleteKeyCode={null} minZoom={overview ? .045 : .65} maxZoom={1.6}
    defaultViewport={{ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 145, zoom: 1 }} colorMode="dark" aria-label="Processo de atendimento: canvas de descoberta">
    {tools && <Controls showInteractive={false} />}
    {tools && overview && <MiniMap pannable zoomable nodeColor="#68817a" maskColor="#0b0e10dd" />}
  </ReactFlow>;
}