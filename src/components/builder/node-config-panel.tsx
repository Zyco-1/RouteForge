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
import { AlertCircle, Database, Lock, Settings2 } from "lucide-react"

export function NodeConfigPanel({
  node,
  onClose,
  onUpdate
}: {
  node: any,
  onClose: () => void,
  onUpdate: (id: string, data: any) => void
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

  return (
    <Sheet open={!!node} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] border-l border-border/50 bg-card/95 backdrop-blur-xl p-0">
        <ScrollArea className="h-full">
          <div className="p-8">
            <SheetHeader className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-tighter">Node</Badge>
                <Badge variant="outline" className="text-[10px] uppercase tracking-tighter font-mono">{node.type}</Badge>
              </div>
              <SheetTitle className="text-2xl font-bold tracking-tight">
                {localData.label?.split(':')[0]} Settings
              </SheetTitle>
              <SheetDescription className="text-xs font-mono opacity-50">
                ID: {node.id}
              </SheetDescription>
            </SheetHeader>

            {isDBNode && (
                <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex gap-3">
                    <AlertCircle size={18} className="shrink-0" />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-tight">Supabase Connection Required</p>
                        <p className="text-[10px] opacity-80 mt-1">Please connect your Supabase project in Dashboard Settings to enable live database operations.</p>
                    </div>
                </div>
            )}

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="general" className="rounded-md">General</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-md">Config</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-8 animate-in fade-in duration-300">
                <div className="grid gap-3">
                  <Label htmlFor="node-label" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
                  <Input
                    id="node-label"
                    value={localData.label || ""}
                    onChange={(e) => handleChange('label', e.target.value)}
                    className="bg-muted/30 border-border/50 focus:ring-primary/20"
                  />
                </div>

                {node.type?.startsWith('api-') && (
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Endpoint Path</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">/</span>
                                <Input
                                    className="pl-6 bg-muted/30 border-border/50"
                                    placeholder="api/v1/resource"
                                    value={localData.path || ""}
                                    onChange={(e) => handleChange('path', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Authentication</Label>
                                <p className="text-[10px] text-muted-foreground">Require user session</p>
                            </div>
                            <Switch
                                checked={localData.auth}
                                onCheckedChange={(checked) => handleChange('auth', checked)}
                            />
                        </div>
                    </div>
                )}

                {isDBNode && (
                    <div className="space-y-6 opacity-50 pointer-events-none">
                        <div className="grid gap-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Table</Label>
                            <Input placeholder="users" value={localData.table || ""} />
                        </div>
                        <div className="grid gap-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Operation</Label>
                            <Input placeholder="SELECT" value={localData.op || ""} />
                        </div>
                    </div>
                )}

                {node.type?.startsWith('resp-') && (
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">HTTP Status Code</Label>
                            <Input
                                type="number"
                                placeholder="200"
                                value={localData.status || 200}
                                onChange={(e) => handleChange('status', parseInt(e.target.value))}
                                className="bg-muted/30 border-border/50"
                            />
                        </div>
                    </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                 <div className="rounded-2xl border border-dashed border-border p-8 bg-muted/5 flex flex-col items-center text-center gap-4">
                    <Settings2 className="size-8 text-muted-foreground opacity-20" />
                    <div>
                        <p className="text-sm font-bold tracking-tight">Advanced Mapping</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Input/Output schema mapping and environment variable injection coming in Phase 3.
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
