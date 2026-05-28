import { Workflow, GeneratedProject, WorkflowNode } from "../types";

export function generateRoutes(workflow: Workflow): GeneratedProject {
  const files: GeneratedProject = [];
  const apiNodes = workflow.nodes.filter(n => n.type.startsWith('api-'));

  for (const node of apiNodes) {
    const method = node.type.split('-')[1].toUpperCase();
    const rawPath = node.data.path || '/';
    const cleanPath = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;
    const finalPath = cleanPath === '' ? 'src/app/api/route.ts' : `src/app/${cleanPath}/route.ts`;

    const chain = traceChain(node.id, workflow);

    let content = `import { NextResponse } from 'next/server';\n`;
    if (chain.some(n => n.type.startsWith('db-'))) {
        content += `import { createClient } from '@/lib/supabase';\n`;
    }
    content += `\n`;

    content += `export async function ${method}(request: Request) {\n`;
    content += `  const context: any = {};\n`;

    if (['POST', 'PUT'].includes(method)) {
        content += `  try { context.body = await request.json(); } catch (e) { context.body = {}; }\n`;
    }

    for (const step of chain) {
        if (step.type.startsWith('db-')) {
            content += generateDBStep(step);
        } else if (step.type.startsWith('resp-')) {
            content += generateResponseStep(step);
        }
    }

    if (!chain.some(n => n.type.startsWith('resp-'))) {
        content += `  return NextResponse.json({ message: 'Success' });\n`;
    }

    content += `}\n`;

    files.push({ path: finalPath, content });
  }

  return files;
}

function traceChain(startId: string, workflow: Workflow): WorkflowNode[] {
    const chain: WorkflowNode[] = [];
    let currentId = startId;
    const visited = new Set();

    while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const edge = workflow.edges.find(e => e.source === currentId);
        if (!edge) break;
        const nextNode = workflow.nodes.find(n => n.id === edge.target);
        if (!nextNode) break;
        chain.push(nextNode);
        currentId = nextNode.id;
    }
    return chain;
}

function generateDBStep(node: WorkflowNode): string {
    const table = node.data.table || 'data';
    const op = (node.data.op || 'select').toLowerCase();
    const outputVar = node.data.outputVar || `db_${node.id}`;

    let code = `  const supabase = createClient();\n`;
    if (op === 'select') {
        code += `  const { data: ${outputVar} } = await supabase.from('${table}').select('*');\n`;
    } else {
        code += `  const { data: ${outputVar} } = await supabase.from('${table}').${op}(context.body);\n`;
    }
    code += `  context.${outputVar} = ${outputVar};\n\n`;
    return code;
}

function generateResponseStep(node: WorkflowNode): string {
    const status = node.data.status || 200;
    let bodyStr = node.data.responseBody || '{"success": true}';

    // Use string manipulation to generate the template literal string for the output code
    const finalBodyCode = bodyStr.replace(/{{(.+?)}}/g, (match, p1) => {
        return "${context." + p1.trim() + "}";
    });

    return `  return NextResponse.json(\`${finalBodyCode}\`, { status: ${status} });\n`;
}
