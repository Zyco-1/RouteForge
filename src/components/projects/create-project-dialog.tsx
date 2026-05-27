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
import { Plus, Loader2 } from "lucide-react"
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(event.currentTarget)
    try {
      await createProject(formData)
      setOpen(false)
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
        if (!o) setError(null)
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
              Launch a new visual API backend. This will automatically create a project in your Vercel account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" name="name" placeholder="my-awesome-api" required disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="A brief description of your API" disabled={loading} />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="font-bold">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
