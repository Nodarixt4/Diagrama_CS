export type StepType = 'start' | 'end' | 'action' | 'decision' | 'escalation' | 'documentation' | 'reference';
export type FlowView = 'complete' | 'service' | 'registration';
export interface FlowStep {
  id: string;
  title: string;
  type: StepType;
  section: 'service' | 'registration' | 'reference';
  sourceIds: string[];
  description?: string;
  fields?: string[];
  note?: string;
  documentationRefs?: string[];
  independent?: boolean;
}
export interface FlowLink {
  id: string;
  source: string;
  target: string;
  label?: string;
  sourceIds: string[];
  inferred?: boolean;
}
export interface FlowModel { entry: string; nodes: FlowStep[]; edges: FlowLink[]; documents: string[] }