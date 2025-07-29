import { StatCard } from "./StatCards"

export function InventoryKPIs({
    totalStockValue,
    turnoverRate,
    lowStockCount,
    outOfStockCount,
    loading
}: {
    totalStockValue: number
    turnoverRate: number
    lowStockCount: number
    outOfStockCount: number
    loading: boolean
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Stock Value"
                value={`M${totalStockValue.toLocaleString()}`}
                description="Current inventory valuation"
                loading={loading}
            />
            <StatCard
                title="Inventory Turnover"
                value={turnoverRate.toFixed(2)}
                description="Higher is better"
                loading={loading}
            />
            <StatCard
                title="Low Stock Items"
                value={lowStockCount}
                description="Items below threshold"
                loading={loading}
            />
            <StatCard
                title="Out of Stock"
                value={outOfStockCount}
                description="Items needing restock"
                loading={loading}
            />
        </div>
    )
}
