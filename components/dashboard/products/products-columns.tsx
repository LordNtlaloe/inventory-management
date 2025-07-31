"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Copy, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Product } from "@/lib/types"
import { deleteProduct } from "@/actions/products.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

// Create a separate component for the actions cell
const ProductActionsCell = ({ product }: { product: Product }) => {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleEdit = () => {
        router.push(`/products/edit/${product.id}`)
    }

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            const result = await deleteProduct(product.id)

            if (result.success) {
                toast.success(result.success)
            } else {
                toast.error(result.error || "Failed to delete product")
            }
        } catch (error) {
            console.error("Delete error:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(product.id)}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy product ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit product
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                            className="text-red-600"
                            onSelect={(e) => e.preventDefault()}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete product
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the product
                                &quot;{product.product_name}&quot; from your inventory.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: ColumnDef<Product>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "product_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Product Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const product = row.original
            return (
                <div className="max-w-[200px]">
                    <div className="font-medium truncate">{product.product_name}</div>
                    <div className="text-sm text-muted-foreground">
                        ID: {product.id.slice(0, 8)}...
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "category",
        header: "Type",
        cell: ({ row }) => {
            const category = row.getValue("category") as string
            return (
                <Badge variant={category === "tire" ? "default" : "secondary"}>
                    {category.toUpperCase()}
                </Badge>
            )
        },
    },
    {
        accessorKey: "commodity",
        header: "Commodity",
        cell: ({ row }) => (
            <div className="capitalize max-w-[120px] truncate">
                {row.getValue("commodity")}
            </div>
        ),
    },
    {
        accessorKey: "product_price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("product_price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(price)

            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "product_quantity",
        header: ({ column }) => {
            return (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Quantity
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const quantity = parseFloat(row.getValue("product_quantity"))
            const product = row.original

            return (
                <div className="text-right">
                    <div className="font-medium">{quantity}</div>
                    {product.category === "bale" && product.bale_weight && (
                        <div className="text-xs text-muted-foreground">
                            {product.bale_weight}kg each
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "grade",
        header: "Grade",
        cell: ({ row }) => {
            const grade = row.getValue("grade") as string
            const getGradeColor = (grade: string) => {
                switch (grade) {
                    case "A": return "bg-green-100 text-green-800"
                    case "B": return "bg-yellow-100 text-yellow-800"
                    case "C": return "bg-red-100 text-red-800"
                    default: return "bg-gray-100 text-gray-800"
                }
            }

            return (
                <Badge className={getGradeColor(grade)}>
                    {grade}
                </Badge>
            )
        },
    },
    {
        id: "specifications",
        header: "Specifications",
        cell: ({ row }) => {
            const product = row.original

            if (product.category === "tire") {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="max-w-[150px] cursor-help">
                                    <div className="text-sm font-medium truncate">
                                        {product.tire_size || "N/A"}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {product.tire_type || "N/A"}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="space-y-1">
                                    <p><strong>Size:</strong> {product.tire_size || "N/A"}</p>
                                    <p><strong>Type:</strong> {product.tire_type || "N/A"}</p>
                                    <p><strong>Load Index:</strong> {product.load_index || "N/A"}</p>
                                    <p><strong>Speed Rating:</strong> {product.speed_rating || "N/A"}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            } else if (product.category === "bale") {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="max-w-[150px] cursor-help">
                                    <div className="text-sm font-medium truncate">
                                        {product.bale_category || "N/A"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {product.origin_country || "N/A"}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="space-y-1">
                                    <p><strong>Category:</strong> {product.bale_category || "N/A"}</p>
                                    <p><strong>Origin:</strong> {product.origin_country || "N/A"}</p>
                                    <p><strong>Weight:</strong> {product.bale_weight || "N/A"}kg</p>
                                    {product.bale_count && (
                                        <p><strong>Piece Count:</strong> {product.bale_count}</p>
                                    )}
                                    {product.import_date && (
                                        <p><strong>Import Date:</strong> {new Date(product.import_date).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }

            return <div className="text-muted-foreground">-</div>
        },
    },
    {
        id: "branches",
        header: "Branches",
        cell: ({ row }) => {
            const product = row.original
            const branchCount = product.branch_ids?.length || 0

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="outline" className="cursor-help">
                                {branchCount} branch{branchCount !== 1 ? 'es' : ''}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Available in {branchCount} branch{branchCount !== 1 ? 'es' : ''}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
    },
    {
        id: "dates",
        header: "Dates",
        cell: ({ row }) => {
            const product = row.original

            return (
                <div className="text-xs">
                    <div className="text-muted-foreground">
                        Added: {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                    {product.updated_at && product.updated_at !== product.created_at && (
                        <div className="text-muted-foreground">
                            Updated: {new Date(product.updated_at).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const product = row.original
            const quantity = product.product_quantity

            let status = "In Stock"
            let variant: "default" | "secondary" | "destructive" | "outline" = "default"

            if (quantity === 0) {
                status = "Out of Stock"
                variant = "destructive"
            } else if (quantity <= 5) {
                status = "Low Stock"
                variant = "secondary"
            }

            return (
                <div className="space-y-1">
                    <Badge variant={variant}>{status}</Badge>
                    {product.category === "tire" && product.warranty_period && (
                        <div className="text-xs text-muted-foreground">
                            Warranty: {product.warranty_period}
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <ProductActionsCell product={row.original} />,
    },
]