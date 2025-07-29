import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface StoreData {
    branch_name: string
    total_sales?: number
}

export function SalesByStoreChart({ data, loading }: { data: StoreData[], loading: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales by Store</CardTitle>
                <CardDescription>Revenue distribution across locations</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <XAxis dataKey="branch_name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`M${value}`, "Sales"]} />
                            <Bar dataKey="total_sales" fill="#4ade80" name="Sales" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
