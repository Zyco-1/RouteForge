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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { createEndpoint } from "@/app/actions/endpoints"
import { useRouter } from "next/navigation"

export function CreateEndpointDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState("GET")
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const path = formData.get('path') as string

    try {
      const endpoint = await createEndpoint(projectId, name, path, method)
      setOpen(false)
      router.push(`/dashboard/projects/${projectId}/apis/${endpoint.id}`)
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
          <Plus size={18} /> New Endpoint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Endpoint</DialogTitle>
            <DialogDescription>
              Add a new API route to your project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2 text-foreground">
              <Label htmlFor="name">Friendly Name</Label>
              <Input id="name" name="name" placeholder="Get All Users" required />
            </div>
            <div className="grid grid-cols-4 gap-4 text-foreground">
              <div className="col-span-1 grid gap-2">
                <Label>Method</Label>
                <Select value={method} onValueChange={(v) => v && setMethod(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3 grid gap-2 text-foreground">
                <Label htmlFor="path">Route Path</Label>
                <Input id="path" name="path" placeholder="/api/v1/users" required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="cursor-pointer font-bold">
              {loading ? "Creating..." : "Create Endpoint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
