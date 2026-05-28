"use client"

import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    AlertCircle, Database, Lock, Settings2,
    Code, MessageSquare, Shield, Trash2,
    GitBranch, Braces, Plus, Filter, ChevronDown,
    Zap, X, Globe, ListFilter, HelpCircle, Save,
    Settings, Terminal, FileJson, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VariablePicker } from "./variable-picker"
import { Variable } from "@/lib/generation/variables"
import { cn } from "@/lib/utils"

interface NodeConfigPanelProps {
  node: any;
  schema: { tables: any[] };
  variables: Variable[];
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
  children?: React.ReactNode;
}

export function NodeConfigPanel({
  node,
  schema,
  variables,
  onClose,
  onUpdate,
  children
}: NodeConfigPanelProps) {
  const [localData, setLocalData] = useState<any>(null);

  useEffect(() => {
    if (node) {
        const data = { ...node.data };
        if (!data.mappings) data.mappings = [];
        if (!data.queryParams) data.queryParams = [];
        if (!data.routeParams) data.routeParams = [];
        if (!data.bodySchema) data.bodySchema = [];
        setLocalData(data);
    }
  }, [node]);

  if (!node || !localData) return null;

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(node.id, updatedData);
  }

  const addItem = (field: string, defaultValue: any) => {
      const items = [...(localData[field] || []), defaultValue];
      handleChange(field, items);
  }

  const updateItem = (field: string, index: number, itemData: any) => {
      const items = [...localData[field]];
      items[index] = { ...items[index], ...itemData };
      handleChange(field, items);
  }

  const removeItem = (field: string, index: number) => {
      const items = localData[field].filter((_: any, i: number) => i !== index);
      handleChange(field, items);
  }

  const isDBNode = node.type?.startsWith('db-');
  const isAPINode = node.type?.startsWith('api-');
  const isRespNode = node.type?.startsWith('resp-');
  const isIfNode = node.type === 'logic-if';
  const isEnvNode = node.type === 'env-var';

  const selectedTable = schema.tables.find(t => t.name === localData.table);
  const columns = selectedTable?.columns || [];

  return (
    <Sheet open={!!node} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[600px] border-l border-white/5 bg-zinc-950/95 backdrop-blur-3xl p-0 shadow-2xl">
        <ScrollArea className="h-full">
          <div className="p-10 space-y-10">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase px-3 py-1">Engine Node</Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-400 font-mono text-[10px] uppercase px-3 py-1 bg-white/5">{node.type}</Badge>
              </div>
              <div className="space-y-1">
                <SheetTitle className="text-3xl font-black tracking-tight text-white uppercase">
                    {localData.label?.split(':')[0]}
                </SheetTitle>
                <SheetDescription className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                    Internal Engine ID: {node.id}
                </SheetDescription>
              </div>
            </SheetHeader>

            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-10 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
                <TabsTrigger value="config" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Configuration</TabsTrigger>
                <TabsTrigger value="modeling" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Data Modeling</TabsTrigger>
                <TabsTrigger value="advanced" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Execution</TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Display Identity</Label>
                  <Input
                    value={localData.label || ""}
                    onChange={(e) => handleChange('label', e.target.value)}
                    className="bg-zinc-900 border-zinc-800 h-14 text-lg font-black tracking-tight focus:border-primary/40 focus:ring-primary/10"
                    placeholder="Enter block name..."
                  />
                </div>

                {isAPINode && (
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Deployment Path</Label>
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="/api/v1/resource/:id"
                                    value={localData.path || ""}
                                    onChange={(e) => handleChange('path', e.target.value)}
                                    className="h-14 pl-12 font-mono text-zinc-300 bg-zinc-900 border-zinc-800 focus:border-primary/40"
                                />
                            </div>
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3">
                                <HelpCircle size={16} className="text-primary shrink-0 mt-0.5" />
                                <p className="text-[11px] text-primary/80 font-medium leading-relaxed">
                                    Define dynamic segments with colons (e.g. <code className="bg-primary/20 px-1 rounded">:id</code>). These will automatically be mapped to <code className="bg-primary/20 px-1 rounded">request.params</code>.
                                </p>
                            </div>
                        </div>
                        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-sm font-black uppercase tracking-tight">Access Control</Label>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Enforce JWT Security</p>
                                </div>
                                <Switch
                                    checked={localData.auth}
                                    onCheckedChange={(checked) => handleChange('auth', checked)}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isDBNode && (
                    <div className="space-y-8">
                        <div className="grid gap-6 p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Operation Mode</Label>
                                <Select value={localData.op || "SELECT"} onValueChange={(v) => handleChange('op', v)}>
                                    <SelectTrigger className="h-14 bg-zinc-900 border-zinc-800 font-black text-xs uppercase tracking-widest px-5">
                                        <SelectValue placeholder="Select Operation" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                        <SelectItem value="SELECT" className="font-bold py-3 uppercase text-[10px] tracking-widest">SELECT (Read Data)</SelectItem>
                                        <SelectItem value="INSERT" className="font-bold py-3 uppercase text-[10px] tracking-widest text-emerald-400">INSERT (Create Data)</SelectItem>
                                        <SelectItem value="UPDATE" className="font-bold py-3 uppercase text-[10px] tracking-widest text-blue-400">UPDATE (Modify Data)</SelectItem>
                                        <SelectItem value="DELETE" className="font-bold py-3 uppercase text-[10px] tracking-widest text-red-400">DELETE (Remove Data)</SelectItem>
                                        <SelectItem value="UPSERT" className="font-bold py-3 uppercase text-[10px] tracking-widest text-teal-400">UPSERT (Sync Data)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Target Resource (Supabase)</Label>
                                <Select value={localData.table || ""} onValueChange={(v) => handleChange('table', v)}>
                                    <SelectTrigger className="h-14 bg-zinc-900 border-zinc-800 font-black text-xs px-5">
                                        <div className="flex items-center gap-3">
                                            <Database size={16} className="text-primary" />
                                            <SelectValue placeholder="Select Schema Table" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                        {schema.tables.length > 0 ? schema.tables.map(t => (
                                            <SelectItem key={t.name} value={t.name} className="font-bold py-3">{t.name}</SelectItem>
                                        )) : (
                                            <div className="p-4 text-[10px] font-black uppercase text-zinc-600 text-center tracking-widest">No tables found. Check connection.</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Node Output Identifier</Label>
                            <div className="relative group">
                                <Code className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-600 group-focus-within:text-primary" />
                                <Input
                                    className="pl-12 h-14 font-mono text-zinc-300 bg-zinc-900 border-zinc-800 focus:border-primary/40"
                                    placeholder="db_result"
                                    value={localData.outputVar || ""}
                                    onChange={(e) => handleChange('outputVar', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isRespNode && (
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">HTTP Status Protocol</Label>
                            <Input
                                type="number"
                                className="h-14 bg-zinc-900 border-zinc-800 text-xl font-black tracking-tight focus:ring-primary/10"
                                value={localData.status || 200}
                                onChange={(e) => handleChange('status', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Atomic Response Body (JSON)</Label>
                                <VariablePicker variables={variables} onSelect={(v) => handleChange('responseBody', (localData.responseBody || '') + '{{' + v + '}}')} />
                            </div>
                            <div className="relative rounded-3xl overflow-hidden border border-zinc-800 group">
                                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Validation Active</span>
                                </div>
                                <textarea
                                    className="w-full min-h-[300px] bg-zinc-900/50 p-8 font-mono text-xs text-zinc-300 focus:outline-none leading-relaxed resize-none"
                                    placeholder='{\n  "status": "success",\n  "data": {{db_result}}\n}'
                                    value={localData.responseBody || ""}
                                    onChange={(e) => handleChange('responseBody', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
              </TabsContent>

              <TabsContent value="modeling" className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  {isAPINode && (
                      <div className="space-y-10">
                           <ModelingSection
                              title="Route Schema Modeling"
                              description="Define expected route parameters and their types for runtime validation."
                              field="routeParams"
                              items={localData.routeParams}
                              onAdd={() => addItem('routeParams', { name: '', type: 'string', required: true })}
                              onUpdate={(i: number, d: any) => updateItem('routeParams', i, d)}
                              onRemove={(i: number) => removeItem('routeParams', i)}
                          />
                           <ModelingSection
                              title="Query Protocol Definition"
                              description="Explicitly define allowed query strings (e.g. ?id=123) and their validation rules."
                              field="queryParams"
                              items={localData.queryParams}
                              onAdd={() => addItem('queryParams', { name: '', type: 'string', required: false })}
                              onUpdate={(i: number, d: any) => updateItem('queryParams', i, d)}
                              onRemove={(i: number) => removeItem('queryParams', i)}
                          />
                          {node.type === 'api-post' || node.type === 'api-put' && (
                               <ModelingSection
                                  title="Payload Schema (Body)"
                                  description="Design the incoming JSON payload structure. Required for type-safe data flow."
                                  field="bodySchema"
                                  items={localData.bodySchema}
                                  onAdd={() => addItem('bodySchema', { name: '', type: 'string', required: true })}
                                  onUpdate={(i: number, d: any) => updateItem('bodySchema', i, d)}
                                  onRemove={(i: number) => removeItem('bodySchema', i)}
                              />
                          )}
                      </div>
                  )}

                  {isDBNode && localData.table && (
                      <div className="space-y-8">
                          <div className="space-y-1">
                            <h4 className="text-lg font-black uppercase tracking-tight text-white">Dynamic Data Flow</h4>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Map Workflow Variables to DB Columns</p>
                          </div>

                          <div className="space-y-4 p-8 rounded-3xl bg-zinc-900 border border-white/5">
                            {localData.mappings.map((m: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 group animate-in slide-in-from-left-2 duration-200">
                                    <div className="flex-1">
                                        <Select value={m.column} onValueChange={(v) => updateItem('mappings', i, { column: v })}>
                                            <SelectTrigger className="h-12 bg-zinc-950 border-zinc-800 font-bold text-xs">
                                                <SelectValue placeholder="Column" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                                {columns.map((c: any) => (
                                                    <SelectItem key={c.name} value={c.name} className="font-bold">{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="text-zinc-700 font-black text-lg">=</div>
                                    <div className="flex-[2] relative group/input">
                                        <Input
                                            className="h-12 pr-12 font-mono text-xs bg-zinc-950 border-zinc-800 focus:border-primary/50"
                                            placeholder="value or {{variable}}"
                                            value={m.value}
                                            onChange={(e) => updateItem('mappings', i, { value: e.target.value })}
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <VariablePicker variables={variables} onSelect={(v) => updateItem('mappings', i, { value: m.value + v })} trigger={<Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-white/10 transition-all"><Braces size={14} className="text-zinc-500 group-hover/input:text-primary transition-colors" /></Button>} />
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="size-10 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem('mappings', i)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}

                            <Button variant="ghost" size="lg" className="w-full h-14 border border-dashed border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:bg-white/5 hover:text-white transition-all mt-4" onClick={() => addItem('mappings', { column: '', value: '' })}>
                                <Plus size={16} className="mr-2" /> Add Logic Link
                            </Button>

                            {localData.mappings.length === 0 && (
                                <div className="py-10 flex flex-col items-center text-center space-y-3 opacity-30">
                                    <ListFilter size={40} className="text-zinc-600" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Zero Logic Links Defined</p>
                                </div>
                            )}
                          </div>
                      </div>
                  )}

                  {!isAPINode && !isDBNode && (
                      <div className="p-20 text-center space-y-6 opacity-40 grayscale">
                          <Settings size={60} className="mx-auto text-zinc-600 animate-spin-slow" />
                          <div className="space-y-2">
                            <h4 className="text-lg font-black uppercase tracking-widest">Modeling Unavailable</h4>
                            <p className="text-xs font-bold uppercase text-zinc-500">This node type does not support advanced schema modeling.</p>
                          </div>
                      </div>
                  )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                  <div className="rounded-[40px] border border-zinc-800 p-12 bg-zinc-900/20 text-center space-y-8 shadow-inner">
                      <div className="size-24 rounded-[30px] bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto shadow-2xl">
                          <Terminal size={40} className="text-primary animate-pulse" />
                      </div>
                      <div className="space-y-3">
                          <h3 className="text-2xl font-black tracking-tight text-white uppercase">Cloud Runtime Pipeline</h3>
                          <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-[320px] mx-auto">
                              Configure runtime timeouts, logging verbosity, and edge-function specific settings for this node execution.
                          </p>
                      </div>
                      <div className="flex flex-col gap-3 pt-4 max-w-[280px] mx-auto">
                        <Button disabled className="h-14 rounded-2xl bg-zinc-800 border-zinc-700 font-black uppercase tracking-widest text-[10px] opacity-50 grayscale">Configure Pipeline</Button>
                        <Button variant="ghost" disabled className="h-14 font-black uppercase tracking-widest text-[10px] text-zinc-600">View Runtime Metrics</Button>
                      </div>
                  </div>

                  <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex gap-5">
                      <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-1" />
                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-amber-500">Safety System Active</p>
                        <p className="text-[11px] font-medium text-amber-500/70 leading-relaxed">
                            Engine version 3.6 restricts some advanced execution features to prevent infinite loops and memory leaks in serverless environments.
                        </p>
                      </div>
                  </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function ModelingSection({ title, description, field, items, onAdd, onUpdate, onRemove }: any) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black uppercase tracking-tight text-white">{title}</h4>
                    <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg hover:bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest" onClick={onAdd}>
                        <Plus size={14} className="mr-1.5" /> Add Rule
                    </Button>
                </div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{description}</p>
            </div>

            <div className="space-y-2 p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                {items.length > 0 ? items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 group/item transition-all hover:border-zinc-700">
                        <Input
                            className="h-10 text-xs font-black uppercase tracking-widest bg-transparent border-none focus:ring-0"
                            placeholder="NAME"
                            value={item.name}
                            onChange={(e) => onUpdate(i, { name: e.target.value })}
                        />
                        <div className="w-px h-5 bg-zinc-800" />
                        <Select value={item.type} onValueChange={(v) => onUpdate(i, { type: v })}>
                            <SelectTrigger className="h-10 w-[120px] bg-transparent border-none text-[9px] font-black uppercase tracking-widest">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                <SelectItem value="string" className="font-black text-[9px] uppercase tracking-widest">STRING</SelectItem>
                                <SelectItem value="number" className="font-black text-[9px] uppercase tracking-widest">NUMBER</SelectItem>
                                <SelectItem value="boolean" className="font-black text-[9px] uppercase tracking-widest">BOOLEAN</SelectItem>
                                <SelectItem value="uuid" className="font-black text-[9px] uppercase tracking-widest">UUID</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="w-px h-5 bg-zinc-800" />
                        <Button variant="ghost" size="icon" className="size-8 text-zinc-700 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all" onClick={() => onRemove(i)}>
                            <X size={14} />
                        </Button>
                    </div>
                )) : (
                    <div className="py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 italic">No rules defined</div>
                )}
            </div>
        </div>
    )
}
