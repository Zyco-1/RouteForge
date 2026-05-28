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
import { getProjectSchema } from '@/app/actions/projects';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Zap, Database, Shield, MessageSquare,
    Code, Activity, Trash2, MousePointer2, Boxes,
    GitBranch, Save, ChevronRight, X, Plus,
    Globe, Lock, FileJson, Bell, Terminal, ExternalLink,
    Layers, Search, FileUp, ListFilter, Workflow, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAvailableVariables } from '@/lib/generation/variables';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

const NODE_CATEGORIES = [
  {
    name: 'Core Architecture',
    nodes: [
      { type: 'api-trigger', label: 'Route Trigger', color: 'bg-blue-500', icon: <Globe size={12} /> },
      { type: 'db-smart', label: 'Database Block', color: 'bg-emerald-500', icon: <Database size={12} /> },
      { type: 'logic-smart', label: 'Logic Block', color: 'bg-indigo-500', icon: <GitBranch size={12} /> },
      { type: 'resp-smart', label: 'Response Block', color: 'bg-purple-500', icon: <FileJson size={12} /> },
    ]
  },
  {
    name: 'Integrations',
    nodes: [
      { type: 'auth-smart', label: 'Auth Guard', color: 'bg-purple-600', icon: <Lock size={12} /> },
      { type: 'ext-http', label: 'HTTP Request', color: 'bg-pink-600', icon: <ExternalLink size={12} /> },
      { type: 'util-transform', label: 'Transform Data', color: 'bg-zinc-500', icon: <Code size={12} /> },
    ]
  }
];

export function WorkflowEditor({ initialData, projectId, endpointId }: { initialData: any, projectId: string, endpointId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [schema, setSchema] = useState<{ tables: any[] }>({ tables: [] });

  const fetchSchema = useCallback(async () => {
      const data = await getProjectSchema(projectId);
      setSchema(data);
  }, [projectId]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

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
        op: type === 'db-smart' ? 'SELECT' : undefined,
        mappings: [],
        queryParams: [],
        routeParams: [],
        bodySchema: []
      },
    }]);
  };

  const deleteNode = useCallback((id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      if (selectedNode?.id === id) setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  const deleteEdge = useCallback((id: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== id));
  }, [setEdges]);

  const availableVariables = selectedNode
    ? getAvailableVariables(nodes as any, edges as any, selectedNode.id)
    : [];

  return (
    <div className="flex h-full w-full overflow-hidden text-foreground bg-zinc-950">
      <aside className="w-80 border-r border-white/5 bg-zinc-900/20 backdrop-blur-3xl flex flex-col z-30 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-2xl shadow-primary/10">
                    <Boxes size={22} />
                </div>
                <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-80 text-white">Engine V4</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Core Primitives</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-white/5" onClick={fetchSchema} title="Refresh Schema">
                <RefreshCw size={14} className="text-zinc-500" />
            </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-12">
            {NODE_CATEGORIES.map((cat) => (
              <div key={cat.name} className="space-y-4">
                <div className="px-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{cat.name}</div>
                <div className="grid gap-2.5">
                  {cat.nodes.map((node) => (
                    <button
                        key={node.type}
                        onClick={() => addNode(node.type, node.label)}
                        className="group flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 hover:bg-primary/10 border border-white/5 hover:border-primary/40 transition-all text-left cursor-pointer active:scale-[0.98] shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110 bg-zinc-950 border border-white/5 text-zinc-400 group-hover:text-white group-hover:border-primary/20", node.color.replace('bg-', 'text-'))}>
                            {node.icon || <Plus size={12} />}
                        </div>
                        <span className="text-xs font-bold tracking-tight text-zinc-300 group-hover:text-white transition-colors">{node.label}</span>
                      </div>
                      <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-6 border-t border-white/5 bg-zinc-950/50">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <Activity className={cn("size-3", isSaving ? 'text-primary animate-pulse' : 'text-emerald-500')} />
                    <span>{isSaving ? 'Syncing...' : 'Synced'}</span>
                </div>
                <Badge variant="outline" className="text-[9px] font-black border-white/5 px-2 py-0 bg-white/5 text-zinc-400 uppercase tracking-tighter">Production Stack</Badge>
             </div>
        </div>
      </aside>

      <div className="flex-1 relative overflow-hidden">
        <ContextMenu>
          <ContextMenuTrigger className="h-full w-full">
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
                snapGrid={[20, 20]}
                onEdgeContextMenu={(e, edge) => {
                    e.preventDefault();
                    if (confirm('Delete this connection?')) deleteEdge(edge.id);
                }}
                onNodeContextMenu={(e, node) => {
                    e.preventDefault();
                    if (confirm('Delete this logic block?')) deleteNode(node.id);
                }}
            >
                <Controls className="bg-zinc-900 border-white/10 rounded-2xl overflow-hidden shadow-2xl m-4" />
                <MiniMap
                    zoomable
                    pannable
                    className="bg-zinc-900 border border-white/5 rounded-3xl shadow-2xl mb-6 mr-6"
                    maskColor="rgba(0,0,0,0.7)"
                />
                <Background gap={40} size={1} color="rgba(255,255,255,0.03)" variant={"dots" as any} />

                <Panel position="top-right" className="bg-zinc-900/80 backdrop-blur-3xl p-2.5 rounded-3xl border border-white/10 flex gap-1.5 shadow-2xl m-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Button variant="ghost" size="sm" className="h-10 px-6 gap-2.5 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-white/5 hover:text-white transition-all">
                        <Save size={14} /> Commit V4
                    </Button>
                    <div className="w-px h-5 bg-white/10 self-center mx-1" />
                    <Button size="sm" className="h-10 px-8 gap-2.5 font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 cursor-pointer transition-all">
                        <Workflow size={16} /> Deploy Logic
                    </Button>
                </Panel>
            </ReactFlow>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64 bg-zinc-950 border-white/10 text-zinc-300 rounded-2xl p-2 shadow-2xl">
            <ContextMenuItem className="gap-3 cursor-pointer py-3 font-bold rounded-xl focus:bg-white/5" onClick={() => addNode('db-smart', 'Database Query')}>
              <Database size={16} className="text-emerald-400" /> New DB Operation
            </ContextMenuItem>
            <ContextMenuItem className="gap-3 cursor-pointer py-3 font-bold rounded-xl focus:bg-white/5" onClick={() => addNode('logic-smart', 'If / Else Logic')}>
              <GitBranch size={16} className="text-indigo-400" /> New Logic Fork
            </ContextMenuItem>
            <ContextMenuItem className="gap-3 cursor-pointer py-3 font-bold rounded-xl focus:bg-white/5" onClick={() => addNode('resp-smart', 'Final Response')}>
              <FileJson size={16} className="text-purple-400" /> New API Response
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <NodeConfigPanel
            node={selectedNode}
            schema={schema}
            variables={availableVariables}
            onClose={() => setSelectedNode(null)}
            onUpdate={(id, data) => {
                setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data } : n));
            }}
        >
            {selectedNode && (
                <div className="mt-12 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="h-px bg-white/5" />
                    <Button
                        variant="destructive"
                        size="lg"
                        className="w-full gap-3 font-black h-14 rounded-2xl shadow-2xl shadow-destructive/10 cursor-pointer text-xs uppercase tracking-widest"
                        onClick={() => deleteNode(selectedNode.id)}
                    >
                        <Trash2 size={18} /> Delete Node Identity
                    </Button>
                </div>
            )}
        </NodeConfigPanel>
      </div>
    </div>
  );
}
