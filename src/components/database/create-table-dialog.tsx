"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Plus, Trash2, Database, Shield, Check,
    Copy, Layout, GripVertical, AlertTriangle,
    RefreshCw, Settings
} from "lucide-react"
import { createTableInSupabase } from "@/app/actions/projects"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { TABLE_TEMPLATES } from "./table-templates"
import { cn } from "@/lib/utils"

export function CreateTableDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableName, setTableName] = useState("")
  const [columns, setColumns] = useState<any[]>([
    { name: "id", type: "uuid", primary: true, unique: true, nullable: false, default: "gen_random_uuid()" },
    { name: "created_at", type: "timestamptz", primary: false, unique: false, nullable: false, default: "now()" }
  ])
  const [status, setStatus] = useState<'editing' | 'executing' | 'success' | 'error'>('editing')
  const [generatedSql, setGeneratedSql] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const applyTemplate = (templateKey: keyof typeof TABLE_TEMPLATES) => {
    const template = TABLE_TEMPLATES[templateKey];
    setTableName(template.name);
    setColumns(template.columns.map(c => ({ ...c, unique: c.primary })));
  }

  const addColumn = () => {
    setColumns([...columns, { name: "", type: "text", primary: false, unique: false, nullable: true, default: "" }])
  }

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index))
  }

  const updateColumn = (index: number, field: string, value: any) => {
    const newCols = [...columns]
    newCols[index] = { ...newCols[index], [field]: value }
    setColumns(newCols)
  }

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;
    const newCols = [...columns];
    const temp = newCols[index];
    newCols[index] = newCols[newIndex];
    newCols[newIndex] = temp;
    setColumns(newCols);
  }

  async function handleSubmit() {
    setLoading(true)
    setStatus('executing')
    try {
      const result = await createTableInSupabase(projectId, tableName, columns)
      setGeneratedSql(result.sql)
      setStatus('success')
    } catch (error: any) {
      console.error(error)
      setErrorMessage(error.message || "Failed to create table automatically. You might need to run the SQL manually.")
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
            setStatus('editing');
            setGeneratedSql(null);
            setErrorMessage(null);
        }
    }}>
      <DialogTrigger>
        <Button className="gap-2 font-bold shadow-lg shadow-primary/20 cursor-pointer">
          <Plus size={18} /> New Table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] overflow-hidden flex flex-col p-0 bg-zinc-950 text-foreground border-zinc-800">
        {status === 'editing' ? (
            <>
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <Database className="text-primary size-8" />
                            Visual Schema Designer
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1 font-medium">Design your Supabase table. RouteForge will handle the DDL execution.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mr-3">Pre-sets</span>
                         <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest px-4 cursor-pointer bg-zinc-900 border-zinc-800 hover:bg-zinc-800" onClick={() => applyTemplate('users')}>Users</Button>
                         <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest px-4 cursor-pointer bg-zinc-900 border-zinc-800 hover:bg-zinc-800" onClick={() => applyTemplate('products')}>Products</Button>
                         <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest px-4 cursor-pointer bg-zinc-900 border-zinc-800 hover:bg-zinc-800" onClick={() => applyTemplate('profiles')}>Profiles</Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Sidebar Settings */}
                    <div className="w-80 border-r border-white/5 p-8 space-y-8 bg-zinc-900/20">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Table Configuration</Label>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-zinc-400 ml-1">Table Name</Label>
                                <Input
                                    value={tableName}
                                    onChange={(e) => setTableName(e.target.value)}
                                    placeholder="e.g. app_settings"
                                    className="h-12 text-lg font-bold bg-zinc-900 border-zinc-800 focus:border-primary/50"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="flex gap-3">
                                <Shield className="size-5 text-primary shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Automatic Sync</p>
                                    <p className="text-[10px] text-primary/70 leading-relaxed">
                                        Tables created here are instantly synced to your Supabase project and available in the Workflow Builder.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Advanced Options</Label>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 opacity-50">
                                <span className="text-xs font-bold">Enable RLS</span>
                                <Checkbox checked disabled />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 opacity-50">
                                <span className="text-xs font-bold">Realtime</span>
                                <Checkbox checked={false} disabled />
                            </div>
                        </div>
                    </div>

                    {/* Main Editor */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="flex items-center justify-between mb-6">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Columns ({columns.length})</Label>
                            <Button variant="secondary" size="sm" className="h-9 gap-2 font-black text-[10px] uppercase tracking-widest px-4" onClick={addColumn}>
                                <Plus size={14} /> Add Column
                            </Button>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-2xl">
                            <Table>
                                <TableHeader className="bg-zinc-900">
                                    <TableRow className="border-zinc-800 hover:bg-transparent">
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500 py-5">Name</TableHead>
                                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500 py-5">Type</TableHead>
                                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500 py-5 text-center">PK</TableHead>
                                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500 py-5 text-center">Unique</TableHead>
                                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500 py-5 text-center">Null</TableHead>
                                        <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500 py-5">Default</TableHead>
                                        <TableHead className="w-20"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {columns.map((col, i) => (
                                        <TableRow key={i} className="border-zinc-800 hover:bg-white/5 transition-colors group">
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => moveColumn(i, 'up')} className="hover:text-primary"><GripVertical size={12} className="rotate-90" /></button>
                                                    <button onClick={() => moveColumn(i, 'down')} className="hover:text-primary"><GripVertical size={12} className="-rotate-90" /></button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Input
                                                    className="h-10 text-sm font-bold bg-zinc-900 border-zinc-800 focus:ring-primary/20"
                                                    value={col.name}
                                                    placeholder="column_name"
                                                    onChange={(e) => updateColumn(i, 'name', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <select
                                                    className="bg-zinc-900 border border-zinc-800 rounded-xl h-10 text-xs w-full px-4 focus:border-primary/50 transition-colors cursor-pointer font-bold text-zinc-300"
                                                    value={col.type}
                                                    onChange={(e) => updateColumn(i, 'type', e.target.value)}
                                                >
                                                    <optgroup label="Common">
                                                        <option value="uuid">UUID</option>
                                                        <option value="text">TEXT</option>
                                                        <option value="int8">BIGINT (int8)</option>
                                                        <option value="bool">BOOLEAN</option>
                                                        <option value="timestamptz">TIMESTAMPZ</option>
                                                        <option value="jsonb">JSONB</option>
                                                    </optgroup>
                                                    <optgroup label="Other">
                                                        <option value="varchar">VARCHAR</option>
                                                        <option value="int4">INTEGER (int4)</option>
                                                        <option value="float8">DECIMAL (float8)</option>
                                                        <option value="date">DATE</option>
                                                    </optgroup>
                                                </select>
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                <Checkbox checked={col.primary} onCheckedChange={(v) => updateColumn(i, 'primary', !!v)} className="size-5 rounded-md" />
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                <Checkbox checked={col.unique} onCheckedChange={(v) => updateColumn(i, 'unique', !!v)} className="size-5 rounded-md" />
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                <Checkbox checked={col.nullable} onCheckedChange={(v) => updateColumn(i, 'nullable', !!v)} className="size-5 rounded-md" />
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Input
                                                    className="h-10 text-xs font-mono bg-zinc-900 border-zinc-800 text-zinc-400"
                                                    value={col.default}
                                                    placeholder="NULL"
                                                    onChange={(e) => updateColumn(i, 'default', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right py-4 pr-6">
                                                <Button variant="ghost" size="icon" className="size-10 text-zinc-600 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => removeColumn(i)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-4">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="font-bold text-zinc-500 hover:text-white cursor-pointer px-8 h-12">Discard Changes</Button>
                    <Button onClick={handleSubmit} disabled={loading || !tableName} className="font-black gap-3 px-10 h-12 shadow-2xl shadow-primary/20 cursor-pointer text-sm uppercase tracking-widest">
                        {loading ? (
                            <>
                                <RefreshCw className="size-5 animate-spin" />
                                Deploying to Supabase...
                            </>
                        ) : (
                            <>
                                <Database size={20} /> Deploy Table Schema
                            </>
                        )}
                    </Button>
                </div>
            </>
        ) : status === 'executing' ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-zinc-950">
                <div className="relative">
                    <div className="size-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Database size={40} className="text-primary animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black tracking-tight uppercase tracking-[0.1em]">Executing Schema Sync</h3>
                    <p className="text-zinc-500 font-medium">Provisioning table `{tableName}` on your Supabase instance...</p>
                </div>
            </div>
        ) : status === 'success' ? (
            <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-zinc-950 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center text-center gap-6">
                    <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-2xl shadow-emerald-500/10">
                        <Check size={48} strokeWidth={3} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black tracking-tight">Deployment Successful</h2>
                        <p className="text-zinc-500 text-lg max-w-lg mx-auto font-medium">
                            Table `{tableName}` has been created and synced. You can now use it in your API workflows.
                        </p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">PostgreSQL Schema Executed</Label>
                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white" onClick={() => {
                             if (generatedSql) {
                                navigator.clipboard.writeText(generatedSql);
                                alert("SQL copied!");
                              }
                        }}>
                            <Copy size={12} /> Copy DDL
                        </Button>
                    </div>
                    <div className="relative group">
                        <pre className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 text-xs font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner max-h-[300px]">
                            {generatedSql}
                        </pre>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex gap-4">
                    <Shield className="size-6 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-emerald-500">Security Note</p>
                        <p className="text-xs text-emerald-500/70 mt-1 leading-relaxed font-medium">
                            Row Level Security (RLS) has been enabled automatically. Read access is allowed for all users by default. You can customize policies in Project Settings or Supabase Dashboard.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <Button onClick={() => setOpen(false)} className="font-black h-14 px-12 bg-zinc-100 hover:bg-white text-black border-none shadow-2xl text-base uppercase tracking-widest">
                        Continue to Dashboard
                    </Button>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-8 bg-zinc-950">
                <div className="size-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 shadow-2xl">
                    <AlertTriangle size={48} />
                </div>
                <div className="text-center space-y-3 max-w-lg">
                    <h2 className="text-3xl font-black tracking-tight text-white">Execution Failed</h2>
                    <p className="text-zinc-500 font-medium leading-relaxed">
                        {errorMessage}
                    </p>
                </div>

                <div className="w-full max-w-2xl space-y-4">
                    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Required Action</p>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            To enable automatic schema creation, ensure your Supabase `exec_sql` RPC is configured correctly. Alternatively, copy the SQL below and run it in your Supabase SQL Editor.
                        </p>
                        <Button variant="outline" className="w-full mt-4 h-10 font-bold border-zinc-800 text-xs" onClick={() => {
                             if (generatedSql) navigator.clipboard.writeText(generatedSql);
                        }}>Copy Generated SQL</Button>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={() => setStatus('editing')} className="flex-1 h-12 font-bold uppercase tracking-widest text-xs">Back to Editor</Button>
                        <Button onClick={handleSubmit} className="flex-1 h-12 font-bold uppercase tracking-widest text-xs">Retry Execution</Button>
                    </div>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
