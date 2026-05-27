import { Workflow, GeneratedProject } from "./types";
import { generateConfigs } from "./generators/config-generator";
import { generateRoutes } from "./generators/route-generator";

export function generateProject(workflow: Workflow, projectName: string): GeneratedProject {
  const files: GeneratedProject = [];

  // 1. Generate core Next.js configs
  files.push(...generateConfigs(projectName));

  // 2. Generate API Routes
  files.push(...generateRoutes(workflow));

  // 3. Add .gitignore
  files.push({
    path: '.gitignore',
    content: 'node_modules\n.next\n.env\n.env.local\n.vercel\n'
  });

  return files;
}

export function validateWorkflow(workflow: Workflow) {
  const errors: string[] = [];

  if (!workflow.nodes || workflow.nodes.length === 0) {
    errors.push("Workflow is empty. Add some nodes to begin.");
  }

  const apiNodes = workflow.nodes.filter(n => n.type.startsWith('api-'));
  if (apiNodes.length === 0) {
    errors.push("No API trigger nodes (GET, POST, etc.) found.");
  }

  // Check for duplicate paths
  const paths = new Set();
  apiNodes.forEach(node => {
      const pathKey = `${node.type}:${node.data.path}`;
      if (paths.has(pathKey)) {
          errors.push(`Duplicate endpoint detected: ${node.data.label} at ${node.data.path}`);
      }
      paths.add(pathKey);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
