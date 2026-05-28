"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteEndpoint } from "@/app/actions/endpoints"
import { useTransition } from "react"
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export function DeleteEndpointButton({ id, projectId }: { id: string, projectId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this endpoint?")) {
      startTransition(async () => {
        try {
          await deleteEndpoint(id, projectId)
        } catch (error) {
          console.error("Failed to delete endpoint:", error)
          alert("Failed to delete endpoint")
        }
      })
    }
  }

  return (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive cursor-pointer font-bold"
      disabled={isPending}
      onClick={handleDelete}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? "Deleting..." : "Delete Endpoint"}
    </DropdownMenuItem>
  )
}
