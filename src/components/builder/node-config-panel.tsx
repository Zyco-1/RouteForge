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
import { AlertCircle, Database, Lock, Settings2, Code, MessageSquare, Shield, Trash2, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NodeConfigPanel({
  node,
  onClose,
  onUpdate,
  children
}: {
  node: any,
  onClose: () => void,
  onUpdate: (id: string, data: any) => void,
  children?: React.ReactNode
}) {
  const [localData, setLocalData] = useState<any>(null);

  useEffect(() => {
    if (node) setLocalData(node.data);
  }, [node]);

  if (!node || !localData) return null;

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(node.id, updatedData);
  }

  const isDBNode = node.type?.startsWith('db-');
  const isAPINode = node.type?.startsWith('api-');
  const isRespNode = node.type?.startsWith('resp-');
  const isIfNode = node.type === 'logic-if';

  return (
    <Sheet open={!!node} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[450px] border-l border-border/50 bg-card/95 backdrop-blur-xl p-0">
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
                            <Input
                                placeholder="/api/v1/resource"
                                value={localData.path || ""}
                                onChange={(e) => handleChange('path', e.target.value)}
                                className="h-11"
                            />
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

                {isIfNode && (
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Condition (JavaScript Expression)</Label>
                            <div className="relative">
                                <GitBranch className="absolute left-3 top-3 size-4 text-primary" />
                                <textarea
                                    className="w-full min-h-[100px] pl-10 bg-muted/30 border border-border/50 rounded-xl p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                    placeholder="res_user.email === 'admin@routeforge.site'"
                                    value={localData.condition || ""}
                                    onChange={(e) => handleChange('condition', e.target.value)}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Use variables from previous nodes. The workflow will follow the <span className="text-primary font-bold">True</span> branch if this expression evaluates to true.
                            </p>
                        </div>
                    </div>
                )}

                {isDBNode && (
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Table</Label>
                            <Input
                                placeholder="e.g. users"
                                value={localData.table || ""}
                                onChange={(e) => handleChange('table', e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Output Identifier</Label>
                            <div className="relative">
                                <Code className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-primary" />
                                <Input
                                    className="pl-9 h-11 font-mono text-sm bg-muted/30"
                                    placeholder="db_result"
                                    value={localData.outputVar || ""}
                                    onChange={(e) => handleChange('outputVar', e.target.value)}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">
                                Access this node&apos;s data in downstream blocks using {"{{"} {localData.outputVar} {"}}"}.
                            </p>
                        </div>
                    </div>
                )}

                {isRespNode && (
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">HTTP Status Code</Label>
                            <Input
                                type="number"
                                className="h-11"
                                value={localData.status || 200}
                                onChange={(e) => handleChange('status', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">JSON Response Body</Label>
                            <textarea
                                className="w-full min-h-[200px] bg-muted/30 border border-border/50 rounded-xl p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground leading-relaxed"
                                placeholder='{"success": true, "data": {{db_result}}}'
                                value={localData.responseBody || ""}
                                onChange={(e) => handleChange('responseBody', e.target.value)}
                            />
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex gap-3">
                                <AlertCircle className="size-4 text-primary shrink-0" />
                                <p className="text-[10px] text-primary/80 font-medium">
                                    Templating engine is enabled. Use double curly braces to inject variables.
                                </p>
                            </div>
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
