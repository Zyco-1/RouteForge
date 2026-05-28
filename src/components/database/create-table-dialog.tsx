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
import { Plus, Trash2, Database, Shield, Check } from "lucide-react"
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

export function CreateTableDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableName, setTableName] = useState("")
  const [columns, setColumns] = useState([
    { name: "id", type: "uuid", primary: true, nullable: false, default: "gen_random_uuid()" },
    { name: "created_at", type: "timestamptz", primary: false, nullable: false, default: "now()" }
  ])
  const [generatedSql, setGeneratedSql] = useState<string | null>(null)

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
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="gap-2 font-bold shadow-lg shadow-primary/20 cursor-pointer">
          <Plus size={18} /> New Table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card text-foreground border-border/50">
        {!generatedSql ? (
            <>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Visual Table Builder</DialogTitle>
                    <DialogDescription>Define your columns and schema metadata.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Table Name</Label>
                        <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="users_profile" />
                    </div>

                    <div className="rounded-xl border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="text-[10px] uppercase font-bold">Name</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold">Type</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold text-center">PK</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold text-center">Null</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold">Default</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {columns.map((col, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Input className="h-8 text-xs" value={col.name} onChange={(e) => updateColumn(i, 'name', e.target.value)} /></TableCell>
                                        <TableCell>
                                            <select
                                                className="bg-background border border-border/50 rounded h-8 text-xs w-full px-2"
                                                value={col.type}
                                                onChange={(e) => updateColumn(i, 'type', e.target.value)}
                                            >
                                                <option value="uuid">UUID</option>
                                                <option value="text">TEXT</option>
                                                <option value="int8">BIGINT</option>
                                                <option value="bool">BOOLEAN</option>
                                                <option value="timestamptz">TIMESTAMPZ</option>
                                                <option value="jsonb">JSONB</option>
                                            </select>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox checked={col.primary} onCheckedChange={(v) => updateColumn(i, 'primary', !!v)} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox checked={col.nullable} onCheckedChange={(v) => updateColumn(i, 'nullable', !!v)} />
                                        </TableCell>
                                        <TableCell><Input className="h-8 text-xs" value={col.default} onChange={(e) => updateColumn(i, 'default', e.target.value)} /></TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => removeColumn(i)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Button variant="outline" size="sm" className="w-fit gap-2 font-bold" onClick={addColumn}>
                        <Plus size={14} /> Add Column
                    </Button>
                </div>
                <DialogFooter className="border-t border-border/20 pt-6">
                    <Button onClick={handleSubmit} disabled={loading || !tableName} className="font-bold gap-2">
                        {loading ? "Generating..." : "Generate SQL & Sync"}
                    </Button>
                </DialogFooter>
            </>
        ) : (
            <div className="space-y-6">
                <div className="flex flex-col items-center text-center gap-4 py-8">
                    <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500">
                        <Check size={32} />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-foreground">Table Metadata Synced</DialogTitle>
                    <DialogDescription className="max-w-md">
                        The table schema has been saved to RouteForge. Please copy the SQL below and run it in your Supabase SQL Editor to finish creation.
                    </DialogDescription>
                </div>
                <div className="bg-muted p-6 rounded-2xl border border-border/50">
                    <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">{generatedSql}</pre>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-border/20">
                    <Button variant="outline" onClick={() => setGeneratedSql(null)} className="font-bold text-foreground">Back to Editor</Button>
                    <Button onClick={() => setOpen(false)} className="font-bold bg-green-500 hover:bg-green-600 text-white border-none shadow-lg shadow-green-500/20">I've Run the SQL</Button>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
