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
import { AlertCircle, Database, Lock, Settings2, Code, MessageSquare, Shield, Trash2 } from "lucide-react"
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

  return (
    <Sheet open={!!node} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[450px] border-l border-border/50 bg-card/95 backdrop-blur-xl p-0">
        <ScrollArea className="h-full">
          <div className="p-8">
            <SheetHeader className="mb-8">
              <div className="flex items-center gap-2 mb-2 text-foreground">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-tighter">Node</Badge>
                <Badge variant="outline" className="text-[10px] uppercase tracking-tighter font-mono">{node.type}</Badge>
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
                <TabsTrigger value="general" className="rounded-md">Logic</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-md">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-8 animate-in fade-in duration-300">
                <div className="grid gap-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Node Label</Label>
                  <Input
                    value={localData.label || ""}
                    onChange={(e) => handleChange('label', e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>

                {isAPINode && (
                    <div className="space-y-6">
                        <div className="grid gap-3 text-foreground">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Route Path</Label>
                            <Input
                                placeholder="/api/v1/resource"
                                value={localData.path || ""}
                                onChange={(e) => handleChange('path', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30 text-foreground">
                            <Label className="text-sm font-bold">Authentication</Label>
                            <Switch
                                checked={localData.auth}
                                onCheckedChange={(checked) => handleChange('auth', checked)}
                            />
                        </div>
                    </div>
                )}

                {isDBNode && (
                    <div className="space-y-6 text-foreground">
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Supabase Table</Label>
                            <Input
                                placeholder="e.g. users"
                                value={localData.table || ""}
                                onChange={(e) => handleChange('table', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Output Variable</Label>
                            <div className="relative">
                                <Code className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                <Input
                                    className="pl-9 font-mono text-xs"
                                    placeholder="db_result"
                                    value={localData.outputVar || ""}
                                    onChange={(e) => handleChange('outputVar', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isRespNode && (
                    <div className="space-y-6 text-foreground">
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">HTTP Status</Label>
                            <Input
                                type="number"
                                value={localData.status || 200}
                                onChange={(e) => handleChange('status', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">JSON Response Body</Label>
                            <textarea
                                className="w-full min-h-[150px] bg-muted/30 border border-border/50 rounded-md p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                placeholder='{"success": true, "data": {{db_result}}}'
                                value={localData.responseBody || ""}
                                onChange={(e) => handleChange('responseBody', e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground italic">
                                Tip: Use {"{{variable_name}}"} to inject data from previous nodes.
                            </p>
                        </div>
                    </div>
                )}

                {children}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 text-foreground">
                 <div className="rounded-2xl border border-dashed border-border p-8 bg-muted/5 flex flex-col items-center text-center gap-4">
                    <Settings2 className="size-8 text-muted-foreground opacity-20" />
                    <div>
                        <p className="text-sm font-bold tracking-tight">Middleware & Headers</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Custom HTTP headers, rate-limit settings, and validation schemas coming soon.
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
