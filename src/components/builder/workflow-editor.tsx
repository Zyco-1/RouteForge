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
    Code, Activity, Trash2, MousePointer2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NODE_CATEGORIES = [
  {
    name: 'API Nodes',
    nodes: [
      { type: 'api-get', label: 'GET Request', color: 'bg-blue-500' },
      { type: 'api-post', label: 'POST Request', color: 'bg-blue-600' },
    ]
  },
  {
    name: 'Database',
    nodes: [
      { type: 'db-query', label: 'Query Data', color: 'bg-emerald-500' },
      { type: 'db-insert', label: 'Insert Record', color: 'bg-emerald-600' },
    ]
  },
  {
    name: 'Response',
    nodes: [
      { type: 'resp-json', label: 'JSON Response', color: 'bg-purple-500' },
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
    const id = Math.random().toString(36).substr(2, 9);
    setNodes((nds) => [...nds, {
      id,
      type,
      position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 },
      data: { label, path: '/', auth: false, status: 200 },
    }]);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <aside className="w-64 border-r border-border/50 bg-card/50 backdrop-blur flex flex-col z-30">
        <div className="p-4 border-b border-border/50 flex items-center justify-between text-foreground">
           <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nodes</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {NODE_CATEGORIES.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{cat.name}</div>
                <div className="grid gap-1.5">
                  {cat.nodes.map((node) => (
                    <button key={node.type} onClick={() => addNode(node.type, node.label)} className="group flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-primary/10 border border-border/30 hover:border-primary/30 transition-all text-left cursor-pointer">
                      <span className="text-[11px] font-medium text-foreground">{node.label}</span>
                      <div className={`size-1.5 rounded-full ${node.color} opacity-50`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border/50 bg-muted/20">
             <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Activity className={`size-3 ${isSaving ? 'text-primary animate-pulse' : ''}`} />
                <span>{isSaving ? 'Saving...' : 'Saved'}</span>
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
        >
          <Controls />
          <MiniMap zoomable pannable className="bg-card border border-border/50" />
          <Background gap={30} size={1} color="rgba(255,255,255,0.05)" />
        </ReactFlow>

        <NodeConfigPanel node={selectedNode} onClose={() => setSelectedNode(null)} onUpdate={(id, data) => {
            setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data } : n));
        }} />
      </div>
    </div>
  );
}
