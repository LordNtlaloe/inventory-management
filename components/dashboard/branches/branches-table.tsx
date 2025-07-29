"use client"

import { useState, useEffect, useCallback } from "react"
import { useTransition } from "react"
import { deleteBranch, getAllBranches } from "@/actions/branches.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import AppLayout from "@/layouts/app-layout"
import BranchesLayout from "@/layouts/branches/layout"
import { type BreadcrumbItem } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useBranchColumns } from "./branches-columns"
import { Branch } from "@/lib/types"
import Link from "next/link"

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Branches", href: "/branches" },
]

type BranchesProps = {
  branches?: Branch[] // Made optional
}

export default function BranchesTable({ branches: initialBranches = [] }: BranchesProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches)
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(!initialBranches.length)
  const [searchTerm, setSearchTerm] = useState("")

  const columns = useBranchColumns(handleDelete, isPending)

  const table = useReactTable({
    data: branches,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: setSearchTerm,
  })

  const getBranches = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedBranches = await getAllBranches()
      setBranches(fetchedBranches || [])
    } catch (err) {
      setAlert({ message: `Failed to load branches, ${err}`, type: "error" })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialBranches.length) {
      getBranches()
    }
  }, [initialBranches.length, getBranches])

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this branch?")) return

    startTransition(async () => {
      try {
        const result = await deleteBranch(id)

        if (result?.success) {
          setBranches(branches.filter(branch => branch.id !== id))
          setAlert({ message: "Branch deleted successfully.", type: "success" })
        } else {
          setAlert({ message: result?.error || "Failed to delete branch.", type: "error" })
        }
      } catch (err) {
        setAlert({ message: `An unexpected error occurred, ${err}`, type: "error" })
      }

      setTimeout(() => setAlert(null), 5000)
    })
  }

  if (isLoading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <BranchesLayout>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="w-1/4 h-10" />
              <Skeleton className="w-32 h-10" />
            </div>

            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-full h-12" />
              ))}
            </div>
          </div>
        </BranchesLayout>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <BranchesLayout>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Input
              className="w-1/4"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Link href="/branches/create">
              <Button variant="secondary">Add New Branch</Button>
            </Link>
          </div>

          <div className="rounded-md border w-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {searchTerm ? "No matching branches found" : "No branches available"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
              Showing {table.getFilteredRowModel().rows.length} branch(es)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>

          {alert && (
            <div className="fixed bottom-4 right-4 z-50 animate-in fade-in">
              <Alert
                className={`w-96 shadow-lg ${alert.type === "success"
                    ? "bg-green-100 border-green-500"
                    : "bg-red-100 border-red-500"
                  }`}
              >
                <InfoIcon
                  className={`h-4 w-4 ${alert.type === "success" ? "text-green-600" : "text-red-600"
                    }`}
                />
                <AlertTitle
                  className={`${alert.type === "success" ? "text-green-800" : "text-red-800"
                    }`}
                >
                  {alert.type === "success" ? "Success" : "Error"}
                </AlertTitle>
                <AlertDescription
                  className={`${alert.type === "success" ? "text-green-700" : "text-red-700"
                    }`}
                >
                  {alert.message}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </BranchesLayout>
    </AppLayout>
  )
}