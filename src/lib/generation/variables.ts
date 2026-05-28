import { WorkflowNode, WorkflowEdge } from './types';

export interface Variable {
  id: string;
  name: string;
  category: 'Request' | 'Database' | 'Auth' | 'Environment' | 'Custom';
  description?: string;
  type?: string;
  children?: Variable[];
}

export function getAvailableVariables(nodes: WorkflowNode[], edges: WorkflowEdge[], currentNodeId?: string): Variable[] {
  const variables: Variable[] = [
    {
        id: 'request',
        name: 'request',
        category: 'Request',
        children: [
            { id: 'request.query', name: 'request.query', category: 'Request' },
            { id: 'request.body', name: 'request.body', category: 'Request' },
            { id: 'request.headers', name: 'request.headers', category: 'Request' },
        ]
    },
    {
        id: 'auth',
        name: 'auth',
        category: 'Auth',
        children: [
            { id: 'auth.user', name: 'auth.user', category: 'Auth' },
            { id: 'auth.user.id', name: 'auth.user.id', category: 'Auth' },
            { id: 'auth.user.email', name: 'auth.user.email', category: 'Auth' },
        ]
    },
  ];

  // Find the trigger node to extract route params
  const triggerNode = nodes.find(n => n.type?.startsWith('api-'));
  if (triggerNode?.data.path) {
    const params = triggerNode.data.path.match(/:[a-zA-Z0-9_]+/g);
    if (params) {
      const requestVar = variables.find(v => v.id === 'request');
      if (requestVar && !requestVar.children?.find(c => c.id === 'request.params')) {
          requestVar.children?.push({
              id: 'request.params',
              name: 'request.params',
              category: 'Request',
              children: params.map(p => ({
                  id: `request.params.${p.substring(1)}`,
                  name: `request.params.${p.substring(1)}`,
                  category: 'Request'
              }))
          });
      }
    }
  }

  if (!currentNodeId) return variables;

  const predecessors = new Set<string>();
  const queue = [currentNodeId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const incomingEdges = edges.filter(e => e.target === id);
    for (const edge of incomingEdges) {
      predecessors.add(edge.source);
      queue.push(edge.source);
    }
  }

  for (const node of nodes) {
    if (predecessors.has(node.id)) {
        if (node.data.outputVar) {
            const category = node.type.startsWith('db-') ? 'Database' : 'Custom';
            variables.push({
                id: node.data.outputVar,
                name: node.data.outputVar,
                category,
                description: `Output from ${node.data.label}`
            });
        }

        if (node.type === 'env-var' && node.data.envKey) {
            variables.push({
                id: `env.${node.data.envKey}`,
                name: `env.${node.data.envKey}`,
                category: 'Environment',
                description: 'Server-side environment variable'
            });
        }
    }
  }

  return variables;
}
