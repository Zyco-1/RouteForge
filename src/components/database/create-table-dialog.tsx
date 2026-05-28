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
import { Plus, Trash2, Database, Shield, Check, Copy, Layout } from "lucide-react"
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

export function CreateTableDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableName, setTableName] = useState("")
  const [columns, setColumns] = useState([
    { name: "id", type: "uuid", primary: true, nullable: false, default: "gen_random_uuid()" },
    { name: "created_at", type: "timestamptz", primary: false, nullable: false, default: "now()" }
  ])
  const [generatedSql, setGeneratedSql] = useState<string | null>(null)

  const applyTemplate = (templateKey: keyof typeof TABLE_TEMPLATES) => {
    const template = TABLE_TEMPLATES[templateKey];
    setTableName(template.name);
    setColumns([...template.columns]);
  }

  const addColumn = () => {
    setColumns([...columns, { name: "", type: "text", primary: false, nullable: true, default: "" }])
  }

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index))
  }

  const updateColumn = (index: number, field: string, value: any) => {
    const newCols = [...columns]
    newCols[index] = { ...newCols[index], [field]: value }
    setColumns(newCols)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const result = await createTableInSupabase(projectId, tableName, columns)
      setGeneratedSql(result.sql)
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Failed to generate table")
    } finally {
      setLoading(false)
    }
  }

  const copySql = () => {
    if (generatedSql) {
      navigator.clipboard.writeText(generatedSql);
      alert("SQL copied to clipboard!");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-bold shadow-lg shadow-primary/20 cursor-pointer">
          <Plus size={18} /> New Table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-card text-foreground border-border/50">
        {!generatedSql ? (
            <>
                <DialogHeader className="p-8 border-b border-border/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-3xl font-extrabold tracking-tight">Visual Table Builder</DialogTitle>
                            <DialogDescription className="text-base mt-1">Define your columns, types, and constraints visually.</DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">Templates:</span>
                             <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest px-3 cursor-pointer" onClick={() => applyTemplate('users')}>Users</Button>
                             <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest px-3 cursor-pointer" onClick={() => applyTemplate('products')}>Products</Button>
                             <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest px-3 cursor-pointer" onClick={() => applyTemplate('profiles')}>Profiles</Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid gap-3 max-w-sm">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Table Name</Label>
                        <Input
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            placeholder="e.g. customer_orders"
                            className="h-12 text-lg font-bold bg-muted/20 border-border/50 focus:border-primary/50"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Schema Definition</Label>
                            <Button variant="ghost" size="sm" className="h-8 gap-2 font-bold text-primary hover:bg-primary/5" onClick={addColumn}>
                                <Plus size={14} /> Add Column
                            </Button>
                        </div>
                        <div className="rounded-2xl border border-border/50 bg-muted/5 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-border/10">
                                        <TableHead className="text-[10px] uppercase font-bold text-foreground/70 py-4">Column Name</TableHead>
                                        <TableHead className="text-[10px] uppercase font-bold text-foreground/70 py-4">Data Type</TableHead>
                                        <TableHead className="text-[10px] uppercase font-bold text-foreground/70 py-4 text-center">PK</TableHead>
                                        <TableHead className="text-[10px] uppercase font-bold text-foreground/70 py-4 text-center">Nullable</TableHead>
                                        <TableHead className="text-[10px] uppercase font-bold text-foreground/70 py-4">Default Value</TableHead>
                                        <TableHead className="py-4"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {columns.map((col, i) => (
                                        <TableRow key={i} className="border-border/5 hover:bg-primary/5 transition-colors group">
                                            <TableCell className="py-3">
                                                <Input
                                                    className="h-9 text-sm font-medium bg-transparent border-none focus:ring-0 focus:bg-muted/50 transition-colors"
                                                    value={col.name}
                                                    placeholder="column_name"
                                                    onChange={(e) => updateColumn(i, 'name', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <select
                                                    className="bg-transparent border border-border/30 rounded-lg h-9 text-xs w-full px-3 focus:border-primary/50 transition-colors cursor-pointer"
                                                    value={col.type}
                                                    onChange={(e) => updateColumn(i, 'type', e.target.value)}
                                                >
                                                    <option value="uuid">UUID</option>
                                                    <option value="text">TEXT</option>
                                                    <option value="varchar">VARCHAR</option>
                                                    <option value="int8">BIGINT (int8)</option>
                                                    <option value="int4">INTEGER (int4)</option>
                                                    <option value="float8">DECIMAL (float8)</option>
                                                    <option value="bool">BOOLEAN</option>
                                                    <option value="timestamptz">TIMESTAMPZ</option>
                                                    <option value="jsonb">JSONB</option>
                                                </select>
                                            </TableCell>
                                            <TableCell className="text-center py-3">
                                                <Checkbox checked={col.primary} onCheckedChange={(v) => updateColumn(i, 'primary', !!v)} className="size-5 rounded-md" />
                                            </TableCell>
                                            <TableCell className="text-center py-3">
                                                <Checkbox checked={col.nullable} onCheckedChange={(v) => updateColumn(i, 'nullable', !!v)} className="size-5 rounded-md" />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Input
                                                    className="h-9 text-xs font-mono bg-transparent border-none focus:ring-0 focus:bg-muted/50"
                                                    value={col.default}
                                                    placeholder="NULL"
                                                    onChange={(e) => updateColumn(i, 'default', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right py-3 pr-6">
                                                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => removeColumn(i)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 border-t border-border/10 bg-muted/10">
                    <Button variant="outline" onClick={() => setOpen(false)} className="font-bold cursor-pointer">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || !tableName} className="font-bold gap-2 px-8 h-11 shadow-xl shadow-primary/20 cursor-pointer">
                        {loading ? (
                            <>
                                <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
                                Syncing Schema...
                            </>
                        ) : (
                            <>
                                <Check size={18} /> Generate & Sync
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </>
        ) : (
            <div className="p-12 space-y-8 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="size-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500 shadow-2xl shadow-green-500/20">
                        <Check size={40} />
                    </div>
                    <DialogTitle className="text-3xl font-extrabold tracking-tight">Schema Synced Successfully</DialogTitle>
                    <DialogDescription className="text-base max-w-lg">
                        The table metadata is saved in RouteForge. Now, run the generated SQL in your Supabase dashboard to create the physical table.
                    </DialogDescription>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Generated SQL Migration</Label>
                        <Button variant="ghost" size="sm" className="h-7 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-muted" onClick={copySql}>
                            <Copy size={12} /> Copy SQL
                        </Button>
                    </div>
                    <div className="relative group">
                        <pre className="bg-zinc-950 p-8 rounded-2xl border border-border/50 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                            {generatedSql}
                        </pre>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-zinc-700">PostgreSQL</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 text-primary">
                        <Shield size={18} className="shrink-0" />
                        <p className="text-xs font-bold leading-tight">
                            RouteForge uses your provided Service Role key server-side only. RLS is enabled by default on all generated tables for maximum security.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setGeneratedSql(null)} className="font-bold h-11 px-6 cursor-pointer">Modify Schema</Button>
                        <Button onClick={() => setOpen(false)} className="font-bold h-11 px-8 bg-green-500 hover:bg-green-600 text-white border-none shadow-xl shadow-green-500/20 cursor-pointer">Done, I've run the SQL</Button>
                    </div>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Badge({ children, variant, className }: any) {
    return <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${className}`}>{children}</span>
}
