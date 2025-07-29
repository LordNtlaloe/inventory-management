import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
    id: string | number
    product_name: string
    updated_at?: string
}

export function DeadStockList({ products, loading }: { products: Product[], loading: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Dead Stock (90+ days)</CardTitle>
                <CardDescription>Items not sold in last 3 months</CardDescription>
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
                                <span className="text-xs text-muted-foreground">
                                    {p.updated_at ? `Last sold: ${new Date(p.updated_at).toLocaleDateString()}` : 'Never sold'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
