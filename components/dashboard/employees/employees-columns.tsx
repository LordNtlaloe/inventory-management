"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PenIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { Employee } from "@/lib/types"
import { getAllBranches } from "@/actions/branches.actions"
import { useEffect, useState } from "react"

export const useEmployeeColumns = (handleDelete: (id: string) => void, isPending: boolean) => {
  const [branches, setBranches] = useState<{ id: string, branch_name: string }[]>([]);

  // Fetch branches
  const fetchData = async () => {
    const branchData = await getAllBranches();
    setBranches(branchData || []);
  };

  useEffect(() => {
    fetchData();
  }, []); // Added empty dependency array to run only once

  // Create a branch map
  const branchMap = new Map(branches.map(b => [b.id, b.branch_name]));

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "first_name",
      header: "First Name",
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "branch_id",
      header: "Branch Name",
      cell: ({ row }) => {
        const branchId = row.original.branch_id;
        return branchId ? (branchMap.get(branchId) || `Branch (${branchId.slice(-6)})`) : "-"
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const id = row.original._id

        return id ? (
          <div className="flex gap-2 justify-end">
            <Link href={`/employees/edit/${id}`}>
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