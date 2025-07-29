"use client"
import React, { useState } from "react"
import { InventoryKPIs } from "@/components/dashboard/InventoryKPIs"
import { SalesKPIs } from "@/components/dashboard/SalesKPIs"
import { StockByStoreChart } from "@/components/dashboard/StockByStoreChart"
import { SalesByStoreChart } from "@/components/dashboard/SalesByStoreChart"
import { SalesGrowthChart } from "@/components/dashboard/SalesGrowthChart"
import { ProductList } from "@/components/dashboard/ProductList"
import { DeadStockList } from "@/components/dashboard/DeadStockList"


export default function DashboardPage() {
    const [loading, setLoading] = useState(false)
    setLoading(true)

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Inventory Overview</h2>
                <InventoryKPIs
                    totalStockValue={0}
                    turnoverRate={0}
                    lowStockCount={0}
                    outOfStockCount={0}
                    loading={loading}
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Sales Overview</h2>
                <SalesKPIs todaySales={0} monthSales={0} loading={true} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StockByStoreChart data={[]} loading={true} />
                <SalesByStoreChart data={[]} loading={true} />
            </div>

            <SalesGrowthChart data={[]} loading={true} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProductList
                    title="Top Products"
                    products={[]}
                    loading={true}
                    renderItem={(product) => (
                        <span className="text-sm text-muted-foreground">
                            Last updated: {product.updated_at}
                        </span>
                    )}
                />
                <DeadStockList products={[]} loading={true} />
            </div>
        </div>
    )
}
