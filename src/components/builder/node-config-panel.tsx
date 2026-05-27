"use client"

import React from 'react'
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

export function NodeConfigPanel({
  node,
  onClose,
  onUpdate
}: {
  node: any,
  onClose: () => void,
  onUpdate: (id: string, data: any) => void
}) {
  if (!node) return null;

  const handleChange = (field: string, value: any) => {
    onUpdate(node.id, { ...node.data, [field]: value });
  }

  return (
    <Sheet open={!!node} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                Configure {node.data?.label?.split(':')[0]}
              </SheetTitle>
              <SheetDescription>
                Node ID: {node.id}
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="settings">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={node.data?.label || ""}
                    onChange={(e) => handleChange('label', e.target.value)}
                  />
                </div>

                {node.data?.label?.includes('API Route') && (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Endpoint Path</Label>
                            <Input placeholder="/api/v1/users" defaultValue={node.data?.path || ""} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Authentication Required</Label>
                            <Switch defaultChecked={node.data?.auth} />
                        </div>
                    </div>
                )}

                {node.data?.label?.includes('Database') && (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Table Name</Label>
                            <Input placeholder="users" defaultValue={node.data?.table || ""} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Operation</Label>
                            <Input placeholder="SELECT" defaultValue={node.data?.op || ""} />
                        </div>
                    </div>
                )}

                {node.data?.label?.includes('Response') && (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Status Code</Label>
                            <Input type="number" placeholder="200" defaultValue={node.data?.status || 200} />
                        </div>
                    </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                 <div className="rounded-lg border border-border/50 p-4 bg-muted/30">
                    <p className="text-xs text-muted-foreground italic text-center">
                        Advanced metadata and schema mapping coming in Phase 3.
                    </p>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
