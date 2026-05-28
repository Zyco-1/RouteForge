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
import { updateEndpointWorkflow } from '@/app/actions/endpoints';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Zap, Database, Shield, MessageSquare,
    Code, Activity, Trash2, MousePointer2, Boxes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NODE_CATEGORIES = [
  {
    name: 'Database',
    nodes: [
      { type: 'db-query', label: 'Select Data', color: 'bg-emerald-500' },
      { type: 'db-insert', label: 'Insert Record', color: 'bg-emerald-600' },
    ]
  },
  {
    name: 'Logic',
    nodes: [
      { type: 'logic-if', label: 'If / Else', color: 'bg-indigo-500' },
      { type: 'logic-transform', label: 'Transform Data', color: 'bg-indigo-700' },
    ]
  },
  {
    name: 'Response',
    nodes: [
      { type: 'resp-json', label: 'JSON Response', color: 'bg-purple-500' },
      { type: 'resp-error', label: 'Error Response', color: 'bg-red-500' },
    ]
  }
];

export function WorkflowEditor({ initialData, projectId, endpointId }: { initialData: any, projectId: string, endpointId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
        if (nodes.length > 0) {
            setIsSaving(true);
            try {
                await updateEndpointWorkflow(endpointId, { nodes, edges });
            } catch (e) {
                console.error('Autosave failed:', e);
            } finally {
                setTimeout(() => setIsSaving(false), 1000);
            }
        }
    }, 3000);
    return () => clearTimeout(timer);
  }, [nodes, edges, endpointId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = (type: string, label: string) => {
    const id = `node_${Math.random().toString(36).substr(2, 9)}`;
    setNodes((nds) => [...nds, {
      id,
      type,
      position: { x: 250, y: 150 },
      data: { label, status: 200, outputVar: id.replace('node_', 'res_') },
    }]);
  };

  const deleteNode = (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNode(null);
  }

  return (
    <div className="flex h-full w-full overflow-hidden text-foreground">
      <aside className="w-72 border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col z-30">
        <div className="p-5 border-b border-border/50 flex items-center gap-2 text-primary font-bold">
            <Boxes size={18} />
            <h2 className="text-xs font-bold uppercase tracking-widest">Logic Blocks</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-8">
            {NODE_CATEGORIES.map((cat) => (
              <div key={cat.name} className="space-y-3">
                <div className="px-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest opacity-50">{cat.name}</div>
                <div className="grid gap-2">
                  {cat.nodes.map((node) => (
                    <button key={node.type} onClick={() => addNode(node.type, node.label)} className="group flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-primary/10 border border-border/40 hover:border-primary/30 transition-all text-left cursor-pointer active:scale-95">
                      <span className="text-xs font-bold">{node.label}</span>
                      <div className={`size-2 rounded-full ${node.color}`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border/50 bg-muted/20">
             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <Activity className={`size-3 ${isSaving ? 'text-primary animate-pulse' : 'text-green-500'}`} />
                <span>{isSaving ? 'Saving Cloud...' : 'Workflow Synced'}</span>
             </div>
        </div>
      </aside>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, n) => setSelectedNode(n)}
          fitView
          colorMode="dark"
          deleteKeyCode={['Backspace', 'Delete']}
          snapToGrid
          snapGrid={[12, 12]}
        >
          <Controls />
          <MiniMap zoomable pannable className="bg-card border border-border/50 rounded-xl" />
          <Background gap={24} size={1} color="rgba(0,0,0,0.1)" />
        </ReactFlow>

        <NodeConfigPanel node={selectedNode} onClose={() => setSelectedNode(null)} onUpdate={(id, data) => {
            setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data } : n));
        }}>
            {selectedNode && !selectedNode.type?.startsWith('api-') && (
                <Button
                    variant="destructive"
                    size="sm"
                    className="w-full gap-2 font-bold mt-8"
                    onClick={() => deleteNode(selectedNode.id)}
                >
                    <Trash2 size={14} /> Delete Node
                </Button>
            )}
        </NodeConfigPanel>
      </div>
    </div>
  );
}
