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
    Settings, Terminal, FileJson, AlertTriangle,
    Search, Activity, Workflow, Box
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
        if (!data.filters) data.filters = [];
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

  const updateItem = (field: string, index: number, itemData: any) => {
      const items = [...localData[field]];
      items[index] = { ...items[index], ...itemData };
      handleChange(field, items);
  }

  const removeItem = (field: string, index: number) => {
      const items = localData[field].filter((_: any, i: number) => i !== index);
      handleChange(field, items);
  }

  const addItem = (field: string, defaultValue: any) => {
      const items = [...(localData[field] || []), defaultValue];
      handleChange(field, items);
  }

  const isDBNode = node.type?.startsWith('db-');
  const isAPINode = node.type?.startsWith('api-');
  const isRespNode = node.type?.startsWith('resp-');
  const isLogicNode = node.type?.startsWith('logic-');
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
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase px-3 py-1">Engine Phase 4</Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-400 font-mono text-[10px] uppercase px-3 py-1 bg-white/5">{node.type}</Badge>
              </div>
              <div className="space-y-1">
                <SheetTitle className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                    {localData.label?.split(':')[0]}
                </SheetTitle>
              </div>
            </SheetHeader>

            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-10 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
                <TabsTrigger value="config" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Configuration</TabsTrigger>
                <TabsTrigger value="modeling" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Workflow Logic</TabsTrigger>
                <TabsTrigger value="advanced" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Display Identity</Label>
                  <Input
                    value={localData.label || ""}
                    onChange={(e) => handleChange('label', e.target.value)}
                    className="bg-zinc-900 border-zinc-800 h-14 text-lg font-black tracking-tight focus:border-primary/40 focus:ring-primary/10 text-white"
                  />
                </div>

                {isAPINode && (
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Request Method</Label>
                            <Select value={localData.method || "GET"} onValueChange={(v) => handleChange("method", v)}>
                                <SelectTrigger className="h-14 bg-zinc-900 border-zinc-800 font-black text-xs uppercase tracking-widest px-5 text-white">
                                    <SelectValue placeholder="Select Method" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                    <SelectItem value="GET" className="font-bold py-3 text-blue-400">GET</SelectItem>
                                    <SelectItem value="POST" className="font-bold py-3 text-emerald-400">POST</SelectItem>
                                    <SelectItem value="PUT" className="font-bold py-3 text-amber-400">PUT</SelectItem>
                                    <SelectItem value="PATCH" className="font-bold py-3 text-orange-400">PATCH</SelectItem>
                                    <SelectItem value="DELETE" className="font-bold py-3 text-red-400">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Deployment Endpoint</Label>
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="/api/users/:id"
                                    value={localData.path || ""}
                                    onChange={(e) => handleChange('path', e.target.value)}
                                    className="h-14 pl-12 font-mono text-zinc-300 bg-zinc-900 border-zinc-800 focus:border-primary/40"
                                />
                            </div>
                        </div>
                        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-sm font-black uppercase tracking-tight text-white">Enforce Authentication</Label>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Verify User JWT Context</p>
                                </div>
                                <Switch
                                    checked={localData.auth}
                                    onCheckedChange={(checked) => handleChange('auth', checked)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isDBNode && (
                    <div className="space-y-8">
                        <div className="grid gap-6 p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Database Operation</Label>
                                <Select value={localData.op || "SELECT"} onValueChange={(v) => handleChange('op', v)}>
                                    <SelectTrigger className="h-14 bg-zinc-900 border-zinc-800 font-black text-xs uppercase tracking-widest px-5 text-white">
                                        <SelectValue placeholder="Select Operation" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                        <SelectItem value="SELECT" className="font-bold py-3 uppercase text-[10px]">SELECT (Fetch)</SelectItem>
                                        <SelectItem value="INSERT" className="font-bold py-3 uppercase text-[10px]">INSERT (Create)</SelectItem>
                                        <SelectItem value="UPDATE" className="font-bold py-3 uppercase text-[10px]">UPDATE (Modify)</SelectItem>
                                        <SelectItem value="DELETE" className="font-bold py-3 uppercase text-[10px]">DELETE (Remove)</SelectItem>
                                        <SelectItem value="UPSERT" className="font-bold py-3 uppercase text-[10px]">UPSERT (Sync)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Target Resource</Label>
                                <Select value={localData.table || ""} onValueChange={(v) => handleChange('table', v)}>
                                    <SelectTrigger className="h-14 bg-zinc-900 border-zinc-800 font-black text-xs px-5 text-white">
                                        <SelectValue placeholder="Select Table Schema" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                        {schema.tables.map(t => (
                                            <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Output Namespace</Label>
                            <Input
                                className="h-14 font-mono text-zinc-300 bg-zinc-900 border-zinc-800"
                                placeholder="db_result"
                                value={localData.outputVar || ""}
                                onChange={(e) => handleChange('outputVar', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {isRespNode && (
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">HTTP Protocol Status</Label>
                            <Input
                                type="number"
                                className="h-14 bg-zinc-900 border-zinc-800 text-xl font-black text-white"
                                value={localData.status || 200}
                                onChange={(e) => handleChange('status', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Atomic JSON Payload</Label>
                                <VariablePicker variables={variables} onSelect={(v) => handleChange('responseBody', (localData.responseBody || '') + '{{' + v + '}}')} />
                            </div>
                            <textarea
                                className="w-full min-h-[350px] bg-zinc-900/50 p-8 font-mono text-xs text-zinc-300 border border-zinc-800 rounded-[32px] resize-none"
                                placeholder='{\n  "success": true,\n  "data": {{db_result}}\n}'
                                value={localData.responseBody || ""}
                                onChange={(e) => handleChange('responseBody', e.target.value)}
                            />
                        </div>
                    </div>
                )}
              </TabsContent>

              <TabsContent value="modeling" className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                  {isAPINode && (
                      <div className="space-y-12">
                          <ModelingSection
                              title="Request Parameters"
                              description="Define validated segments for the URL path."
                              field="routeParams"
                              items={localData.routeParams}
                              onAdd={() => addItem('routeParams', { name: '', type: 'string', required: true })}
                              onUpdate={(i: number, d: any) => updateItem('routeParams', i, d)}
                              onRemove={(i: number) => removeItem('routeParams', i)}
                          />
                          <ModelingSection
                              title="Query Definitions"
                              description="Design accepted query string protocols."
                              field="queryParams"
                              items={localData.queryParams}
                              onAdd={() => addItem('queryParams', { name: '', type: 'string', required: false })}
                              onUpdate={(i: number, d: any) => updateItem('queryParams', i, d)}
                              onRemove={(i: number) => removeItem('queryParams', i)}
                          />
                          {(localData.method === "POST" || localData.method === "PUT" || localData.method === "PATCH") && (
                              <ModelingSection
                                  title="Payload Schema (Body)"
                                  description="Design the incoming JSON payload structure."
                                  field="bodySchema"
                                  items={localData.bodySchema}
                                  onAdd={() => addItem("bodySchema", { name: "", type: "string", required: true })}
                                  onUpdate={(i: number, d: any) => updateItem("bodySchema", i, d)}
                                  onRemove={(i: number) => removeItem("bodySchema", i)}
                              />
                          )}
                      </div>
                  )}

                  {isDBNode && localData.table && (
                      <div className="space-y-12">
                          {(localData.op === 'SELECT' || localData.op === 'UPDATE' || localData.op === 'DELETE') && (
                              <div className="space-y-6">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Conditional Filters (WHERE)</Label>
                                    <Button variant="ghost" size="sm" className="h-8 text-primary font-black text-[10px] uppercase" onClick={() => addItem('filters', { column: '', op: '=', value: '' })}>+ Add Rule</Button>
                                  </div>
                                  <div className="space-y-3 p-8 rounded-3xl bg-zinc-900 border border-white/5">
                                      {localData.filters.length > 0 ? localData.filters.map((f: any, i: number) => (
                                          <div key={i} className="flex gap-2 items-center">
                                              <Select value={f.column} onValueChange={(v) => updateItem('filters', i, { column: v })}>
                                                  <SelectTrigger className="h-11 bg-zinc-950 border-zinc-800 text-[10px] font-black uppercase text-white">
                                                      <SelectValue placeholder="Col" />
                                                  </SelectTrigger>
                                                  <SelectContent className="bg-zinc-950 border-zinc-800">
                                                      {columns.map((c: any) => (<SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>))}
                                                  </SelectContent>
                                              </Select>
                                              <Select value={f.op} onValueChange={(v) => updateItem('filters', i, { op: v })}>
                                                  <SelectTrigger className="h-11 w-16 bg-zinc-950 border-zinc-800 font-black text-white">
                                                      <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent className="bg-zinc-950 border-zinc-800">
                                                      <SelectItem value="=">=</SelectItem>
                                                      <SelectItem value="!=">!=</SelectItem>
                                                      <SelectItem value=">">{'>'}</SelectItem>
                                                      <SelectItem value="<">{'<'}</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                              <div className="flex-1 relative group/f">
                                                <Input className="h-11 text-xs bg-zinc-950 border-zinc-800 text-white pr-8 font-mono" value={f.value} onChange={(e) => updateItem('filters', i, { value: e.target.value })} />
                                                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                                    <VariablePicker variables={variables} onSelect={(v) => updateItem('filters', i, { value: f.value + v })} trigger={<Button variant="ghost" size="icon" className="size-8 hover:bg-white/10"><Braces size={14} className="text-zinc-600 group-hover/f:text-primary transition-colors" /></Button>} />
                                                </div>
                                              </div>
                                              <Button variant="ghost" size="icon" className="size-10 text-zinc-700 hover:text-red-500" onClick={() => removeItem('filters', i)}><X size={16} /></Button>
                                          </div>
                                      )) : (
                                          <div className="text-center py-4 text-[10px] font-black uppercase text-zinc-700 tracking-widest italic">Zero constraints defined. Selects all.</div>
                                      )}
                                  </div>
                              </div>
                          )}

                          {(localData.op === 'INSERT' || localData.op === 'UPDATE') && (
                              <div className="space-y-6">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Atomic Data Mapping</Label>
                                    <Button variant="ghost" size="sm" className="h-8 text-primary font-black text-[10px] uppercase" onClick={() => addItem('mappings', { column: '', value: '' })}>+ Add Link</Button>
                                  </div>
                                  <div className="space-y-3 p-8 rounded-3xl bg-zinc-900 border border-white/5">
                                      {localData.mappings.length > 0 ? localData.mappings.map((m: any, i: number) => (
                                          <div key={i} className="flex gap-4 items-center">
                                              <div className="flex-1">
                                                <Select value={m.column} onValueChange={(v) => updateItem('mappings', i, { column: v })}>
                                                    <SelectTrigger className="h-11 bg-zinc-950 border-zinc-800 text-[10px] font-black uppercase text-white">
                                                        <SelectValue placeholder="Target Col" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-950 border-zinc-800">
                                                        {columns.map((c: any) => (<SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>))}
                                                    </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="text-zinc-700 font-black">=</div>
                                              <div className="flex-[2] relative group/m">
                                                <Input className="h-11 text-xs bg-zinc-950 border-zinc-800 text-white pr-8 font-mono" value={m.value} onChange={(e) => updateItem('mappings', i, { value: e.target.value })} />
                                                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                                    <VariablePicker variables={variables} onSelect={(v) => updateItem('mappings', i, { value: m.value + v })} trigger={<Button variant="ghost" size="icon" className="size-8 hover:bg-white/10"><Braces size={14} className="text-zinc-600 group-hover/m:text-primary transition-colors" /></Button>} />
                                                </div>
                                              </div>
                                              <Button variant="ghost" size="icon" className="size-10 text-zinc-700 hover:text-red-500" onClick={() => removeItem('mappings', i)}><X size={16} /></Button>
                                          </div>
                                      )) : (
                                          <div className="text-center py-4 text-[10px] font-black uppercase text-zinc-700 tracking-widest italic">Zero logic links defined.</div>
                                      )}
                                  </div>
                              </div>
                          )}
                      </div>
                  )}

                  {isLogicNode && (
                       <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Logic Expression (JS)</Label>
                                <VariablePicker variables={variables} onSelect={(v) => handleChange('condition', (localData.condition || '') + v)} />
                            </div>
                            <div className="relative group">
                                <GitBranch className="absolute left-4 top-4 size-5 text-primary" />
                                <textarea
                                    className="w-full min-h-[150px] pl-12 bg-zinc-900 p-6 border border-zinc-800 rounded-3xl font-mono text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="request.params.id === '123' && db_user.active"
                                    value={localData.condition || ""}
                                    onChange={(e) => handleChange('condition', e.target.value)}
                                />
                            </div>
                       </div>
                  )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-10">
                  <div className="p-12 rounded-[40px] bg-zinc-900/50 border border-white/5 text-center space-y-8">
                      <div className="size-24 rounded-3xl bg-zinc-950 border border-zinc-800 mx-auto flex items-center justify-center shadow-2xl">
                        <Terminal size={40} className="text-primary animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-black uppercase text-white">Runtime Pipeline</h4>
                        <p className="text-zinc-500 text-[10px] leading-relaxed max-w-[280px] mx-auto uppercase font-black tracking-[0.1em]">Configure atomic execution thresholds and logging verbosity for this primitive.</p>
                      </div>
                  </div>
              </TabsContent>
            </Tabs>

            {children}
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
                            className="h-10 text-xs font-black uppercase tracking-widest bg-transparent border-none focus:ring-0 text-white"
                            placeholder="NAME"
                            value={item.name}
                            onChange={(e) => onUpdate(i, { name: e.target.value })}
                        />
                        <div className="w-px h-5 bg-zinc-800" />
                        <Select value={item.type} onValueChange={(v) => onUpdate(i, { type: v })}>
                            <SelectTrigger className="h-10 w-[120px] bg-transparent border-none text-[9px] font-black uppercase tracking-widest text-zinc-400">
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
