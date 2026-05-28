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
  OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeConfigPanel } from './node-config-panel';
import { updateEndpointWorkflow } from '@/app/actions/endpoints';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Zap, Database, Shield, MessageSquare,
    Code, Activity, Trash2, MousePointer2, Boxes,
    GitBranch, Save, ChevronRight, X, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NODE_CATEGORIES = [
  {
    name: 'Database',
    nodes: [
      { type: 'db-query', label: 'Select Data', color: 'bg-emerald-500' },
      { type: 'db-insert', label: 'Insert Record', color: 'bg-emerald-600' },
      { type: 'db-update', label: 'Update Record', color: 'bg-emerald-700' },
    ]
  },
  {
    name: 'Logic',
    nodes: [
      { type: 'logic-if', label: 'If / Else', color: 'bg-indigo-500' },
      { type: 'logic-transform', label: 'Transform Data', color: 'bg-indigo-700' },
      { type: 'logic-loop', label: 'Loop (Map)', color: 'bg-indigo-900' },
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

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep' }, eds)),
    [setEdges],
  );

  const addNode = (type: string, label: string) => {
    const id = `node_${Math.random().toString(36).substr(2, 9)}`;
    setNodes((nds) => [...nds, {
      id,
      type,
      position: { x: 400, y: 200 },
      data: {
        label,
        status: 200,
        outputVar: id.replace('node_', 'res_'),
        condition: type === 'logic-if' ? 'data.id === 1' : undefined
      },
    }]);
  };

  const deleteNode = useCallback((id: string) => {
      setNodes((nds) => nds.filter((n) => !n.type?.startsWith('api-') && n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      if (selectedNode?.id === id) setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  const deleteEdge = useCallback((id: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== id));
  }, [setEdges]);

  return (
    <div className="flex h-full w-full overflow-hidden text-foreground bg-zinc-950">
      <aside className="w-80 border-r border-border/50 bg-card/40 backdrop-blur-3xl flex flex-col z-30 shadow-2xl">
        <div className="p-6 border-b border-border/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Boxes size={20} />
                </div>
                <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Components</h2>
                    <p className="text-[10px] text-muted-foreground font-bold">Drag & Drop Blocks</p>
                </div>
            </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-10">
            {NODE_CATEGORIES.map((cat) => (
              <div key={cat.name} className="space-y-4">
                <div className="px-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{cat.name}</div>
                <div className="grid gap-2.5">
                  {cat.nodes.map((node) => (
                    <button
                        key={node.type}
                        onClick={() => addNode(node.type, node.label)}
                        className="group flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-primary/10 border border-border/20 hover:border-primary/40 transition-all text-left cursor-pointer active:scale-[0.98] shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`size-2.5 rounded-full ${node.color} group-hover:scale-125 transition-transform`} />
                        <span className="text-xs font-bold tracking-tight">{node.label}</span>
                      </div>
                      <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-6 border-t border-border/10 bg-muted/5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Activity className={`size-3 ${isSaving ? 'text-primary animate-pulse' : 'text-green-500'}`} />
                    <span>{isSaving ? 'Saving Changes...' : 'All Changes Saved'}</span>
                </div>
                <Badge variant="outline" className="text-[9px] font-black border-border/20 px-2 py-0">v1.0.4</Badge>
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
            snapGrid={[16, 16]}
            onEdgeContextMenu={(e, edge) => {
                e.preventDefault();
                if (confirm('Delete this connection?')) deleteEdge(edge.id);
            }}
            onNodeContextMenu={(e, node) => {
                e.preventDefault();
                if (!node.type?.startsWith('api-')) {
                    if (confirm('Delete this block?')) deleteNode(node.id);
                }
            }}
        >
            <Controls className="bg-card border-border/50 rounded-xl overflow-hidden shadow-2xl" />
            <MiniMap
                zoomable
                pannable
                className="bg-zinc-900 border border-border/20 rounded-2xl shadow-2xl mb-4 mr-4"
                maskColor="rgba(0,0,0,0.4)"
            />
            <Background gap={32} size={1} color="rgba(255,255,255,0.03)" variant="dots" />

            <Panel position="top-right" className="bg-card/80 backdrop-blur-xl p-2 rounded-2xl border border-border/20 flex gap-1 shadow-2xl m-6">
                <Button variant="ghost" size="sm" className="h-9 px-4 gap-2 font-bold text-xs cursor-pointer hover:bg-primary/10 hover:text-primary">
                    <Save size={14} /> Commit Changes
                </Button>
                <Button size="sm" className="h-9 px-6 gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 cursor-pointer">
                    <GitBranch size={14} /> Deploy v1.0.5
                </Button>
            </Panel>
        </ReactFlow>

        <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={(id, data) => {
                setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data } : n));
            }}
        >
            {selectedNode && !selectedNode.type?.startsWith('api-') && (
                <div className="mt-12 space-y-4">
                    <div className="h-px bg-border/10" />
                    <Button
                        variant="destructive"
                        size="lg"
                        className="w-full gap-3 font-bold h-12 rounded-2xl shadow-xl shadow-destructive/10 cursor-pointer"
                        onClick={() => deleteNode(selectedNode.id)}
                    >
                        <Trash2 size={18} /> Delete This Block
                    </Button>
                </div>
            )}
        </NodeConfigPanel>
      </div>
    </div>
  );
}
