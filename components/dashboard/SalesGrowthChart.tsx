import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface SalesGrowthData {
    period: string
    total_sales: number
}

export function SalesGrowthChart({ data, loading }: { data: SalesGrowthData[], loading: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales Growth</CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`M${value}`, "Sales"]} />
                            <Line
                                type="monotone"
                                dataKey="total_sales"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
