"use client"

import * as React from "react"
import Head from "next/head"
import { useRouter } from "next/navigation"
import { Branch, type BreadcrumbItem } from "@/lib/types"
import AppLayout from "@/layouts/app-layout"
import OrdersLayout from "@/layouts/orders/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { getAllOrders } from "@/actions/orders.actions"
import { getAllBranches } from "@/actions/branches.actions"
import { useCurrentUser } from "@/hooks/use-current-user"
import { OrderColumns } from "@/components/dashboard/orders/order-columns"
import { Order } from "@/lib/types"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Orders", href: "/orders" }]

export default function OrdersTable() {
    const user = useCurrentUser()
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const columns = OrderColumns()

    useEffect(() => {
        const getOrders = async () => {
            const fetchedOrders = await getAllOrders()
            setOrders(fetchedOrders || []);
        }

        const getBranches = async () => {
            const fetchedBranches = await getAllBranches();
            setBranches(fetchedBranches || [])
        }
        getBranches()
        getOrders()
        setLoading(false)
    }, []);

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [globalFilter, setGlobalFilter] = useState("")
    const [selectedBranch, setSelectedBranch] = useState<string>("all")

    const getBranchName = (branchId: string): string => {
        if (branchId === "all") return "All Branches";
        const branch = branches.find(b => b.id.toString() === branchId);
        return branch ? branch.branch_name : "Select Branch";
    };

    const table = useReactTable({
        data: orders,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnVisibility,
            globalFilter,
        },
    })

    const handleBranchChange = (branchId: string) => {
        setSelectedBranch(branchId)
        router.push(`/orders${branchId === 'all' ? '' : `?branch_id=${branchId}`}`)
    }

    if (loading) return <div>Loading orders...</div>

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head>
                <title>Sales/Orders</title>
            </Head>
            <OrdersLayout>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Input
                            className="w-64"
                            placeholder="Search orders..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                        />

                        <div className="flex items-center gap-2">
                            {user?.role === 'Admin' && (
                                <Select
                                    value={selectedBranch}
                                    onValueChange={handleBranchChange}
                                >
                                    <SelectTrigger className="w-[250px]">
                                        <SelectValue>
                                            {getBranchName(selectedBranch)}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                {branch.branch_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {table.getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="rounded-md border">
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
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            Showing {table.getFilteredRowModel().rows.length} of{' '}
                            {orders.length} orders
                        </div>
                        <div className="space-x-2">
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
                </div>
            </OrdersLayout>
        </AppLayout>
    )
}