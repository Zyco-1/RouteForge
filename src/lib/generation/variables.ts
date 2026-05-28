import { WorkflowNode, WorkflowEdge } from './types';

export interface Variable {
  id: string;
  name: string;
  category: 'Request' | 'Database' | 'Auth' | 'Environment' | 'Custom';
  description?: string;
}

export function getAvailableVariables(nodes: WorkflowNode[], edges: WorkflowEdge[], currentNodeId?: string): Variable[] {
  const variables: Variable[] = [
    { id: 'request.query', name: 'request.query', category: 'Request' },
    { id: 'request.body', name: 'request.body', category: 'Request' },
    { id: 'request.headers', name: 'request.headers', category: 'Request' },
    { id: 'auth.user', name: 'auth.user', category: 'Auth' },
    { id: 'auth.user.id', name: 'auth.user.id', category: 'Auth' },
    { id: 'auth.user.email', name: 'auth.user.email', category: 'Auth' },
  ];

  // Find the trigger node to extract route params
  const triggerNode = nodes.find(n => n.type?.startsWith('api-'));
  if (triggerNode?.data.path) {
    const params = triggerNode.data.path.match(/:[a-zA-Z0-9_]+/g);
    if (params) {
      params.forEach(p => {
        const name = p.substring(1);
        variables.push({
          id: `request.params.${name}`,
          name: `request.params.${name}`,
          category: 'Request',
          description: `Route parameter: ${name}`
        });
      });
    }
  }

  if (!currentNodeId) return variables;

  // Simple path finding: find all nodes that can reach currentNodeId
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

  // Add outputs from predecessor nodes
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
