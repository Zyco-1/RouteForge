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
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { createProject } from "@/app/actions/projects"

export function CreateProjectDialog({
    children,
    disabled = false
}: {
    children?: React.ReactNode,
    disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")

  // Real-time validation helper
  const sanitizedName = name.toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(event.currentTarget)
    try {
      await createProject(formData)
      setOpen(false)
      setName("")
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to create project.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => {
        if (!disabled) setOpen(o)
        if (!o) {
            setError(null)
            setName("")
        }
    }}>
      <DialogTrigger >
        {children || (
          <Button className="gap-2 font-bold" disabled={disabled}>
            <Plus className="size-4" /> New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              This will create a linked project in your Vercel account automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="my-awesome-api"
                required
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {name && (
                  <p className="text-[10px] text-muted-foreground italic">
                    Vercel ID: <span className="font-mono">{sanitizedName || "..."}</span>
                  </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Optional project description" disabled={loading} />
            </div>

            {error && (
                <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in ">
                    <AlertCircle className="size-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !sanitizedName} className="font-bold w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
