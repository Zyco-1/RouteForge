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
    Zap, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VariablePicker } from "./variable-picker"
import { Variable } from "@/lib/generation/variables"

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
        setLocalData(data);
    }
  }, [node]);

  if (!node || !localData) return null;

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(node.id, updatedData);
  }

  const addMapping = () => {
      const mappings = [...(localData.mappings || []), { column: '', value: '' }];
      handleChange('mappings', mappings);
  }

  const updateMapping = (index: number, field: string, value: string) => {
      const mappings = [...localData.mappings];
      mappings[index] = { ...mappings[index], [field]: value };
      handleChange('mappings', mappings);
  }

  const removeMapping = (index: number) => {
      const mappings = localData.mappings.filter((_: any, i: number) => i !== index);
      handleChange('mappings', mappings);
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
      <SheetContent className="w-[550px] border-l border-border/50 bg-card/95 backdrop-blur-xl p-0">
        <ScrollArea className="h-full">
          <div className="p-8">
            <SheetHeader className="mb-8">
              <div className="flex items-center gap-2 mb-2 text-foreground">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-tighter font-bold">Node</Badge>
                <Badge variant="outline" className="text-[10px] uppercase tracking-tighter font-mono border-primary/20 text-primary">{node.type}</Badge>
              </div>
              <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">
                {localData.label?.split(':')[0]} Settings
              </SheetTitle>
              <SheetDescription className="text-xs font-mono opacity-50">
                ID: {node.id}
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="general" className="w-full text-foreground">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="general" className="rounded-md font-bold">Configuration</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-md font-bold">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-8 animate-in fade-in duration-300">
                <div className="grid gap-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
                  <Input
                    value={localData.label || ""}
                    onChange={(e) => handleChange('label', e.target.value)}
                    className="bg-muted/30 border-border/50 h-11"
                  />
                </div>

                {isAPINode && (
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Route Path</Label>
                            <div className="relative">
                                <Input
                                    placeholder="/api/v1/resource/:id"
                                    value={localData.path || ""}
                                    onChange={(e) => handleChange('path', e.target.value)}
                                    className="h-11 font-mono"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">Support route params using colon syntax, e.g. /users/:id</p>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Require Authentication</Label>
                                <p className="text-[10px] text-muted-foreground">Verify Supabase JWT on every request.</p>
                            </div>
                            <Switch
                                checked={localData.auth}
                                onCheckedChange={(checked) => handleChange('auth', checked)}
                            />
                        </div>
                    </div>
                )}

                {isEnvNode && (
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Environment Key</Label>
                            <div className="relative">
                                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-amber-500" />
                                <Input
                                    placeholder="STRIPE_SECRET_KEY"
                                    value={localData.envKey || ""}
                                    onChange={(e) => handleChange('envKey', e.target.value)}
                                    className="h-11 pl-10 font-mono"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isIfNode && (
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Condition (JS)</Label>
                                <VariablePicker variables={variables} onSelect={(v) => handleChange('condition', (localData.condition || '') + v)} />
                            </div>
                            <div className="relative">
                                <GitBranch className="absolute left-3 top-3 size-4 text-primary" />
                                <textarea
                                    className="w-full min-h-[100px] pl-10 bg-muted/30 border border-border/50 rounded-xl p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                    placeholder="request.params.id === '123'"
                                    value={localData.condition || ""}
                                    onChange={(e) => handleChange('condition', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isDBNode && (
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Operation</Label>
                            <Select value={localData.op || "SELECT"} onValueChange={(v) => handleChange('op', v)}>
                                <SelectTrigger className="h-11 bg-muted/30 border-border/50 font-bold text-foreground">
                                    <SelectValue placeholder="Select Operation" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                    <SelectItem value="SELECT">SELECT (Fetch Records)</SelectItem>
                                    <SelectItem value="INSERT">INSERT (Create Record)</SelectItem>
                                    <SelectItem value="UPDATE">UPDATE (Modify Record)</SelectItem>
                                    <SelectItem value="DELETE">DELETE (Remove Record)</SelectItem>
                                    <SelectItem value="UPSERT">UPSERT (Create or Update)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Table</Label>
                            <Select value={localData.table || ""} onValueChange={(v) => handleChange('table', v)}>
                                <SelectTrigger className="h-11 bg-muted/30 border-border/50 font-bold text-foreground">
                                    <SelectValue placeholder="Select Table" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                    {schema.tables.map(t => (
                                        <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {localData.table && (
                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        {localData.op === 'SELECT' || localData.op === 'DELETE' ? 'Filters (WHERE)' : 'Data Mapping'}
                                    </Label>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest gap-1 hover:bg-primary/10" onClick={addMapping}>
                                        <Plus size={12} /> Add Field
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {localData.mappings.map((m: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2 group animate-in slide-in-from-right-2 duration-200">
                                            <div className="flex-1">
                                                <Select value={m.column} onValueChange={(v) => updateMapping(i, 'column', v)}>
                                                    <SelectTrigger className="h-9 text-xs bg-muted/20 border-border/40 text-foreground">
                                                        <SelectValue placeholder="Column" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                                        {columns.map((c: any) => (
                                                            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="text-zinc-500 font-bold">=</div>
                                            <div className="flex-[2] relative">
                                                <Input
                                                    className="h-9 pr-8 text-xs font-mono bg-muted/20 border-border/40 text-foreground"
                                                    placeholder="value or variable"
                                                    value={m.value}
                                                    onChange={(e) => updateMapping(i, 'value', e.target.value)}
                                                />
                                                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                                    <VariablePicker variables={variables} onSelect={(v) => updateMapping(i, 'value', m.value + v)} trigger={<Button variant="ghost" size="icon" className="size-6 cursor-pointer hover:bg-white/10"><Braces size={12} /></Button>} />
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => removeMapping(i)}>
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                    {localData.mappings.length === 0 && (
                                        <div className="p-8 rounded-xl border border-dashed border-border/50 bg-muted/5 flex flex-col items-center text-center">
                                            <Filter className="size-6 text-muted-foreground opacity-20 mb-2" />
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">No mapping defined</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Output Identifier</Label>
                            <div className="relative">
                                <Code className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-primary" />
                                <Input
                                    className="pl-9 h-11 font-mono text-sm bg-muted/30 border-border/50 text-foreground"
                                    placeholder="db_result"
                                    value={localData.outputVar || ""}
                                    onChange={(e) => handleChange('outputVar', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isRespNode && (
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">HTTP Status Code</Label>
                            <Input
                                type="number"
                                className="h-11 bg-muted/30 border-border/50 text-foreground"
                                value={localData.status || 200}
                                onChange={(e) => handleChange('status', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">JSON Response Body</Label>
                                <VariablePicker variables={variables} onSelect={(v) => handleChange('responseBody', (localData.responseBody || '') + '{{' + v + '}}')} />
                            </div>
                            <textarea
                                className="w-full min-h-[200px] bg-muted/30 border border-border/50 rounded-xl p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground leading-relaxed"
                                placeholder='{"success": true, "data": {{db_result}}}'
                                value={localData.responseBody || ""}
                                onChange={(e) => handleChange('responseBody', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {children}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                 <div className="rounded-2xl border border-dashed border-border/50 p-8 bg-muted/5 flex flex-col items-center text-center gap-6">
                    <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                        <Settings2 className="size-8 text-muted-foreground opacity-30" />
                    </div>
                    <div>
                        <p className="text-sm font-bold tracking-tight text-foreground">Advanced Node Logic</p>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-[250px]">
                            Custom middleware, execution timeouts, and retry policies for this specific block.
                        </p>
                    </div>
                    <Button variant="secondary" size="sm" className="font-bold opacity-50 cursor-not-allowed">Configure Advanced</Button>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
