"use client"

import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Panel,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeConfigPanel } from './node-config-panel';
import { updateProjectWorkflow } from '@/app/actions/projects';

const initialNodes: Node[] = [
  { id: '1', position: { x: 100, y: 100 }, data: { label: 'API Route: /hello' }, type: 'input' },
  { id: '2', position: { x: 100, y: 300 }, data: { label: 'Database: Fetch Users' } },
  { id: '3', position: { x: 100, y: 500 }, data: { label: 'Response: 200 OK' }, type: 'output' },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

export function WorkflowEditor({ initialData, projectId }: { initialData: any, projectId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes?.length > 0 ? initialData.nodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges?.length > 0 ? initialData.edges : initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
        if (nodes.length > 0) {
            updateProjectWorkflow(projectId, { nodes, edges }).catch(console.error);
        }
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, projectId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  const handleUpdateNodeData = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: newData };
        }
        return node;
      })
    );
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        colorMode="dark"
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        selectionKeyCode={['Shift']}
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background gap={20} size={1} />

        <Panel position="top-right" className="bg-card/80 backdrop-blur border border-border p-2 rounded-lg flex flex-col gap-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">Add Nodes</p>
            <div className="grid grid-cols-2 gap-1">
                {['Logic', 'Auth', 'Database', 'Response', 'Resend', 'Stripe'].map(cat => (
                    <button
                        key={cat}
                        className="text-[10px] bg-muted hover:bg-primary hover:text-primary-foreground px-2 py-1 rounded transition-colors text-left font-medium cursor-pointer"
                        onClick={() => {
                            const id = (nodes.length + 1).toString();
                            setNodes([...nodes, {
                                id,
                                position: { x: Math.random() * 400, y: Math.random() * 400 },
                                data: { label: `${cat}: New Node` }
                            }]);
                        }}
                    >
                        + {cat}
                    </button>
                ))}
            </div>
        </Panel>

        <Panel position="bottom-center" className="bg-card/50 backdrop-blur px-4 py-2 border rounded-full text-[10px] font-medium text-muted-foreground">
             Tip: Press Backspace to delete selected nodes or edges.
        </Panel>
      </ReactFlow>

      <NodeConfigPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onUpdate={handleUpdateNodeData}
      />
    </div>
  );
}
