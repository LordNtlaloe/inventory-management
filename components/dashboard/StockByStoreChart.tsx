import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface StoreData {
    branch_name: string
    total_value?: number
}

export function StockByStoreChart({ data, loading }: { data: StoreData[], loading: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Stock by Store</CardTitle>
                <CardDescription>Inventory value distribution across locations</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <XAxis dataKey="branch_name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`M${value}`, "Stock Value"]} />
                            <Bar dataKey="total_value" fill="#8884d8" name="Stock Value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
