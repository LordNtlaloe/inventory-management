import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
    id: string | number
    product_name: string
    updated_at?: string
}

export function ProductList({
    title,
    products,
    loading,
    renderItem
}: {
    title: string
    products: Product[]
    loading: boolean
    renderItem?: (product: Product) => React.ReactNode
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-full" />
                        ))}
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {products.map((p) => (
                            <li key={p.id} className="flex items-center justify-between">
                                <span className="text-sm">{p.product_name}</span>
                                {renderItem && renderItem(p)}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
