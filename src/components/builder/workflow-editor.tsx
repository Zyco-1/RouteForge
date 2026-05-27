"use client"

import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeConfigPanel } from './node-config-panel';
import { updateProjectWorkflow } from '@/app/actions/projects';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Zap, Database, Shield, Layout, MessageSquare,
    ArrowRight, Code, Key, Activity, Trash2, Save, MousePointer2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NODE_CATEGORIES = [
  {
    name: 'API Nodes',
    icon: <Globe size={14} />,
    nodes: [
      { type: 'api-get', label: 'GET Request', color: 'bg-blue-500' },
      { type: 'api-post', label: 'POST Request', color: 'bg-blue-600' },
      { type: 'api-put', label: 'PUT Request', color: 'bg-blue-700' },
      { type: 'api-delete', label: 'DELETE Request', color: 'bg-blue-800' },
    ]
  },
  {
    name: 'Database',
    icon: <Database size={14} />,
    nodes: [
      { type: 'db-query', label: 'Query Data', color: 'bg-emerald-500' },
      { type: 'db-insert', label: 'Insert Record', color: 'bg-emerald-600' },
      { type: 'db-update', label: 'Update Record', color: 'bg-emerald-700' },
      { type: 'db-delete', label: 'Delete Record', color: 'bg-emerald-800' },
    ]
  },
  {
    name: 'Auth',
    icon: <Shield size={14} />,
    nodes: [
      { type: 'auth-require', label: 'Require Auth', color: 'bg-amber-500' },
      { type: 'auth-jwt', label: 'Verify JWT', color: 'bg-amber-600' },
    ]
  },
  {
    name: 'Response',
    icon: <MessageSquare size={14} />,
    nodes: [
      { type: 'resp-json', label: 'JSON Response', color: 'bg-purple-500' },
      { type: 'resp-error', label: 'Error Response', color: 'bg-red-500' },
      { type: 'resp-redirect', label: 'Redirect', color: 'bg-purple-600' },
    ]
  },
  {
    name: 'Logic',
    icon: <Code size={14} />,
    nodes: [
      { type: 'logic-if', label: 'Condition', color: 'bg-indigo-500' },
      { type: 'logic-transform', label: 'Transform', color: 'bg-indigo-600' },
    ]
  }
];

function Globe({ size }: { size: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
}

export function WorkflowEditor({ initialData, projectId }: { initialData: any, projectId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(async () => {
        if (nodes.length > 0) {
            setIsSaving(true);
            try {
                await updateProjectWorkflow(projectId, { nodes, edges });
            } catch (e) {
                console.error('Autosave failed:', e);
            } finally {
                setTimeout(() => setIsSaving(false), 1000);
            }
        }
    }, 3000);
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

  const addNode = (type: string, label: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNode: Node = {
      id,
      type,
      position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 },
      data: { label, path: '/', auth: false, status: 200 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Node Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/50 backdrop-blur flex flex-col z-30">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
           <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nodes Palette</h2>
           <Badge variant="outline" className="text-[9px] h-4">v0.1</Badge>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {NODE_CATEGORIES.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                    {cat.icon}
                    <span>{cat.name}</span>
                </div>
                <div className="grid gap-1.5">
                  {cat.nodes.map((node) => (
                    <button
                      key={node.type}
                      onClick={() => addNode(node.type, node.label)}
                      className="group flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-primary/10 border border-border/30 hover:border-primary/30 transition-all text-left cursor-pointer"
                    >
                      <span className="text-[11px] font-medium">{node.label}</span>
                      <div className={`size-1.5 rounded-full ${node.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
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
                <span>{isSaving ? 'Saving changes...' : 'All changes saved'}</span>
             </div>
        </div>
      </aside>

      {/* Canvas Area */}
      <div className="flex-1 relative">
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
          snapToGrid
          snapGrid={[15, 15]}
        >
          <Controls />
          <MiniMap zoomable pannable className="bg-card border border-border/50" />
          <Background gap={30} size={1} color="rgba(255,255,255,0.05)" />

          <Panel position="top-left" className="bg-card/80 backdrop-blur border border-border p-1 rounded-md flex gap-1">
              <Button variant="ghost" size="icon" className="size-8"><MousePointer2 size={14} /></Button>
              <Button variant="ghost" size="icon" className="size-8 opacity-50"><Trash2 size={14} /></Button>
          </Panel>

          <Panel position="bottom-center" className="bg-card/50 backdrop-blur px-4 py-2 border border-border/50 rounded-full text-[10px] font-medium text-muted-foreground shadow-2xl">
             Drag nodes from the sidebar • Connect points to define logic • Press <kbd className="bg-muted px-1 rounded">DEL</kbd> to remove
          </Panel>
        </ReactFlow>

        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdate={handleUpdateNodeData}
        />
      </div>
    </div>
  );
}
