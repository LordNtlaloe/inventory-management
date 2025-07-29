"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PenIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { Branch } from "@/lib/types"

export const useBranchColumns = (handleDelete: (id: string) => void, isPending: boolean) => {
  const columns: ColumnDef<Branch>[] = [
    {
      id: "rowNumber",
      header: "ID",
      cell: ({ row }) => row.index + 1, // Display sequential numbers starting at 1
    },
    {
      accessorKey: "branch_name",
      header: "Name",
    },
    {
      accessorKey: "branch_location",
      header: "Location",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const id = row.original.id // Keep real database ID for links & actions

        return id ? (
          <div className="flex gap-2">
            <Link href={`/branches/edit/${id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <PenIcon className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button
              onClick={() => handleDelete(id)}
              variant="destructive"
              disabled={isPending}
            >
              <Trash2Icon className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        ) : null
      },
    },
  ]

  return columns
}
