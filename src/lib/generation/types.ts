export interface GeneratedFile {
  path: string;
  content: string;
}

export type GeneratedProject = GeneratedFile[];

export interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label: string;
    path?: string;
    auth?: boolean;
    status?: number;
    table?: string;
    op?: string;
    responseBody?: string;
    filters?: any[];
    outputVar?: string;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
