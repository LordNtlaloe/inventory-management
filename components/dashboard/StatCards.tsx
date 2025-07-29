import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatCard({
    title,
    value,
    description,
    loading
}: {
    title: string
    value: string | number
    description?: string
    loading: boolean
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-4xl">
                    {loading ? <Skeleton className="h-8 w-24" /> : value}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
