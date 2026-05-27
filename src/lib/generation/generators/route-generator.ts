import { Workflow, GeneratedProject, WorkflowNode } from "../types";

export function generateRoutes(workflow: Workflow): GeneratedProject {
  const files: GeneratedProject = [];

  // Find all API trigger nodes (GET, POST, etc.)
  const apiNodes = workflow.nodes.filter(n => n.type.startsWith('api-'));

  for (const node of apiNodes) {
    const method = node.type.split('-')[1].toUpperCase();
    const rawPath = node.data.path || '/';
    const cleanPath = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;
    const finalPath = cleanPath === '' ? 'route.ts' : `src/app/${cleanPath}/route.ts`;

    // Basic logic: trace edges from this node to find responses
    const nextNodes = getNextNodes(node.id, workflow);
    const responseNode = nextNodes.find(n => n.type.startsWith('resp-'));

    let content = `import { NextResponse } from 'next/server';\n\n`;

    content += `export async function ${method}(request: Request) {\n`;

    if (node.data.auth) {
        content += `  // TODO: Auth check logic\n`;
    }

    if (responseNode) {
        const status = responseNode.data.status || 200;
        content += `  return NextResponse.json({ message: 'Success from ${node.data.label}' }, { status: ${status} });\n`;
    } else {
        content += `  return NextResponse.json({ message: 'No response configured' }, { status: 200 });\n`;
    }

    content += `}\n`;

    files.push({
      path: finalPath,
      content
    });
  }

  return files;
}

function getNextNodes(nodeId: string, workflow: Workflow): WorkflowNode[] {
    const edges = workflow.edges.filter(e => e.source === nodeId);
    return edges.map(e => workflow.nodes.find(n => n.id === e.target)).filter(Boolean) as WorkflowNode[];
}
