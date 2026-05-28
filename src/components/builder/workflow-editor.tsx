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
    Layers, Search, FileUp, ListFilter, Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAvailableVariables } from '@/lib/generation/variables';
import { cn } from '@/lib/utils';

const NODE_CATEGORIES = [
  {
    name: 'API Triggers',
    nodes: [
      { type: 'api-get', label: 'GET Route', color: 'bg-blue-500' },
      { type: 'api-post', label: 'POST Route', color: 'bg-blue-600' },
      { type: 'api-put', label: 'PUT Route', color: 'bg-blue-700' },
      { type: 'api-delete', label: 'DELETE Route', color: 'bg-red-600' },
      { type: 'api-webhook', label: 'Webhook Trigger', color: 'bg-indigo-600' },
    ]
  },
  {
    name: 'Database Operations',
    nodes: [
      { type: 'db-query', label: 'Select Data', color: 'bg-emerald-500', icon: <Search size={12} /> },
      { type: 'db-insert', label: 'Insert Record', color: 'bg-emerald-600', icon: <Plus size={12} /> },
      { type: 'db-update', label: 'Update Record', color: 'bg-emerald-700', icon: <Save size={12} /> },
      { type: 'db-delete', label: 'Delete Record', color: 'bg-red-500', icon: <Trash2 size={12} /> },
      { type: 'db-upsert', label: 'Upsert Record', color: 'bg-teal-600', icon: <RefreshCw size={12} /> },
      { type: 'db-count', label: 'Count Records', color: 'bg-emerald-400', icon: <ListFilter size={12} /> },
    ]
  },
  {
    name: 'Logic & Control',
    nodes: [
      { type: 'logic-if', label: 'If / Else', color: 'bg-indigo-500', icon: <GitBranch size={12} /> },
      { type: 'logic-switch', label: 'Switch Case', color: 'bg-indigo-600', icon: <Layers size={12} /> },
      { type: 'logic-transform', label: 'Transform Data', color: 'bg-indigo-700', icon: <Code size={12} /> },
      { type: 'logic-validate', label: 'Validate Input', color: 'bg-amber-600', icon: <Shield size={12} /> },
      { type: 'env-var', label: 'Environment Var', color: 'bg-amber-500', icon: <Zap size={12} /> },
    ]
  },
  {
    name: 'Auth & Security',
    nodes: [
      { type: 'auth-verify', label: 'Require Auth', color: 'bg-purple-600', icon: <Lock size={12} /> },
      { type: 'auth-jwt', label: 'JWT Verify', color: 'bg-purple-700', icon: <Shield size={12} /> },
    ]
  },
  {
    name: 'External & Utils',
    nodes: [
      { type: 'ext-fetch', label: 'Fetch / HTTP', color: 'bg-pink-600', icon: <ExternalLink size={12} /> },
      { type: 'util-logger', label: 'Cloud Logger', color: 'bg-zinc-600', icon: <Terminal size={12} /> },
      { type: 'util-uuid', label: 'UUID Gen', color: 'bg-zinc-500', icon: <Fingerprint size={12} /> },
    ]
  },
  {
    name: 'Response Types',
    nodes: [
      { type: 'resp-json', label: 'JSON Response', color: 'bg-purple-500', icon: <FileJson size={12} /> },
      { type: 'resp-error', label: 'Error Response', color: 'bg-red-500', icon: <Bell size={12} /> },
    ]
  }
];

function RefreshCw(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg> }
function Fingerprint(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12a10 10 0 0 1 18-6"/><path d="M5 8a7 7 0 0 1 12 0"/><path d="M8 10a3.9 3.9 0 0 1 8 0"/><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 12v1a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v3"/><path d="M12 15h0a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v2"/><path d="M12 18h0a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2"/><path d="M12 21v1"/></svg> }

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
        op: type.startsWith('db-') ? (type === 'db-query' ? 'SELECT' : type.replace('db-', '').toUpperCase()) : undefined,
        mappings: [],
        queryParams: [],
        routeParams: [],
        bodySchema: []
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

  const availableVariables = selectedNode
    ? getAvailableVariables(nodes as any, edges as any, selectedNode.id)
    : [];

  return (
    <div className="flex h-full w-full overflow-hidden text-foreground bg-zinc-950">
      <aside className="w-80 border-r border-border/50 bg-card/40 backdrop-blur-3xl flex flex-col z-30 shadow-2xl transition-all duration-500">
        <div className="p-6 border-b border-border/10 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-2xl shadow-primary/10">
                    <Boxes size={22} />
                </div>
                <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Block Engine</h2>
                    <p className="text-[10px] text-muted-foreground font-bold">Build Your Logic</p>
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
                        <div className={cn("size-2 rounded-full shadow-lg transition-transform group-hover:scale-150", node.color)} />
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
        <div className="p-6 border-t border-border/10 bg-zinc-950/50">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Activity className={cn("size-3", isSaving ? 'text-primary animate-pulse' : 'text-emerald-500')} />
                    <span>{isSaving ? 'Syncing Logic...' : 'Engine Synced'}</span>
                </div>
                <Badge variant="outline" className="text-[9px] font-black border-border/20 px-2 py-0 bg-white/5">v3.6.0</Badge>
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
            <Controls className="bg-zinc-900 border-zinc-800 rounded-2xl overflow-hidden shadow-2xl m-4" />
            <MiniMap
                zoomable
                pannable
                className="bg-zinc-900 border border-white/5 rounded-3xl shadow-2xl mb-6 mr-6"
                maskColor="rgba(0,0,0,0.6)"
                nodeColor={(n) => {
                    if (n.type?.startsWith('api-')) return '#3b82f6';
                    if (n.type?.startsWith('db-')) return '#10b981';
                    if (n.type?.startsWith('logic-')) return '#6366f1';
                    return '#a855f7';
                }}
            />
            <Background gap={40} size={1} color="rgba(255,255,255,0.03)" variant={"dots" as any} />

            <Panel position="top-right" className="bg-zinc-900/80 backdrop-blur-3xl p-2.5 rounded-3xl border border-white/10 flex gap-1.5 shadow-2xl m-8">
                <Button variant="ghost" size="sm" className="h-10 px-5 gap-2.5 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-white/5 hover:text-white transition-all">
                    <Save size={14} /> Commit
                </Button>
                <div className="w-px h-5 bg-white/10 self-center mx-1" />
                <Button size="sm" className="h-10 px-8 gap-2.5 font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 cursor-pointer transition-all">
                    <Workflow size={16} /> Deploy API
                </Button>
            </Panel>
        </ReactFlow>

        <NodeConfigPanel
            node={selectedNode}
            schema={schema}
            variables={availableVariables}
            onClose={() => setSelectedNode(null)}
            onUpdate={(id, data) => {
                setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data } : n));
            }}
        >
            {selectedNode && !selectedNode.type?.startsWith('api-') && (
                <div className="mt-12 space-y-4">
                    <div className="h-px bg-white/5" />
                    <Button
                        variant="destructive"
                        size="lg"
                        className="w-full gap-3 font-black h-14 rounded-2xl shadow-2xl shadow-destructive/10 cursor-pointer text-xs uppercase tracking-widest"
                        onClick={() => deleteNode(selectedNode.id)}
                    >
                        <Trash2 size={18} /> Permanently Delete Block
                    </Button>
                </div>
            )}
        </NodeConfigPanel>
      </div>
    </div>
  );
}
