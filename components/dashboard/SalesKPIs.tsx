import { StatCard } from "./StatCards"

export function SalesKPIs({
    todaySales,
    monthSales,
    loading
}: {
    todaySales: number
    monthSales: number
    loading: boolean
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Sales Today"
                value={`M${todaySales.toLocaleString()}`}
                description="Total revenue today"
                loading={loading}
            />
            <StatCard
                title="Sales This Month"
                value={`M${monthSales.toLocaleString()}`}
                description="Monthly revenue"
                loading={loading}
            />
        </div>
    )
}
