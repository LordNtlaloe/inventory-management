"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, EyeIcon } from "lucide-react"
import Link from "next/link"
import { Order } from "@/lib/types"
import { useCurrentUser } from "@/hooks/use-current-user"

export const OrderColumns = () => {
    const user = useCurrentUser()

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "id",
            header: "Order #",
            cell: ({ row }) => `#${row.original.id}`,
        },
        {
            accessorKey: "order_date",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.order_date), 'MMM dd, yyyy HH:mm'),
        },
        ...(user?.role === 'Admin' ? [{
            accessorKey: "branch",
            header: "Branch",
            cell: ({ row }: { row: Row<Order> }) => row.original.branch?.name || "-",
        }] : []),
        {
            accessorKey: "cashier",
            header: "Cashier",
            cell: ({ row }) => row.original.cashier?.name || "-",
        },
        {
            accessorKey: "items",
            header: "Items",
            cell: ({ row }) => (
                <Badge variant="outline">
                    {row.original.items?.length || 0} items
                </Badge>
            ),
        },
        {
            accessorKey: "total_amount",
            header: "Total",
            cell: ({ row }) => `M${(row.original.total || 0).toFixed(2)}`,
        },
        {
            accessorKey: "payment_method",
            header: "Payment Method",
            cell: ({ row }) => row.original.payment_method || "-",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.status === 'completed' ? 'default' :
                            row.original.status === 'pending' ? 'secondary' : 'destructive'
                    }
                    className={
                        row.original.status === 'completed' ? 'bg-green-400 text-green-800' :
                            row.original.status === 'pending' ? 'bg-yellow-400 text-yellow-600' :
                                'bg-red-400 text-red-700'
                    }
                >
                    {row.original.status || 'unknown'}
                </Badge>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/orders/${row.original.id}`}>
                                <EyeIcon className="h-4 w-4 mr-2" /> View
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return columns
}