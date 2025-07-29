/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"
import React, { useState, useEffect } from "react"
import {
    getTotalStockValue,
    getStockByStore,
    getOutOfStockProducts,
    getDeadStock,
    getInventoryTurnoverRate,
    getLowStockProducts,
    getTotalSalesToday,
    getTotalSalesThisMonth,
    getSalesByStore,
    getTopSellingProducts,
    getSalesGrowth
} from "@/actions/dashboard.actions"
import { InventoryKPIs } from "@/components/dashboard/InventoryKPIs"
import { SalesKPIs } from "@/components/dashboard/SalesKPIs"
import { StockByStoreChart } from "@/components/dashboard/StockByStoreChart"
import { SalesByStoreChart } from "@/components/dashboard/SalesByStoreChart"
import { SalesGrowthChart } from "@/components/dashboard/SalesGrowthChart"
import { ProductList } from "@/components/dashboard/ProductList"
import { DeadStockList } from "@/components/dashboard/DeadStockList"
import { Alert } from "@/components/ui/alert"
import AppLayout from "@/layouts/app-layout"

export default function DashboardPage() {
    // Inventory States
    const [totalStockValue, setTotalStockValue] = useState(0)
    const [turnoverRate, setTurnoverRate] = useState(0)
    const [lowStockCount, setLowStockCount] = useState(0)
    const [outOfStockCount, setOutOfStockCount] = useState(0)
    const [stockByStore, setStockByStore] = useState<any[]>([])

    // Sales States
    const [todaySales, setTodaySales] = useState(0)
    const [monthSales, setMonthSales] = useState(0)
    const [salesByStore, setSalesByStore] = useState<any[]>([])
    const [salesGrowth, setSalesGrowth] = useState<any[]>([])

    // Product States
    const [topProducts, setTopProducts] = useState<any[]>([])
    const [deadStock, setDeadStock] = useState<any[]>([])

    // UI States
    const [loading, setLoading] = useState(true)
    const [alert, setAlert] = useState<{ message: string; type: 'default' | 'destructive' } | null>(null)

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch all data in parallel
            const [
                totalValue,
                stockData,
                outOfStock,
                deadStockData,
                turnover,
                lowStockData,
                todaySalesData,
                monthSalesData,
                salesStoreData,
                topProductsData,
                salesGrowthData
            ] = await Promise.all([
                getTotalStockValue(),
                getStockByStore(),
                getOutOfStockProducts(),
                getDeadStock(),
                getInventoryTurnoverRate(),
                getLowStockProducts(),
                getTotalSalesToday(),
                getTotalSalesThisMonth(),
                getSalesByStore(),
                getTopSellingProducts(),
                getSalesGrowth()
            ])

            // Set inventory states
            setTotalStockValue(totalValue)
            setTurnoverRate(turnover)
            setLowStockCount(lowStockData.count)
            setOutOfStockCount(outOfStock.length)
            setStockByStore(stockData.map((s: any) => ({
                branch_name: s.branch_name,
                total_value: s.total_value
            })))

            // Set sales states
            setTodaySales(todaySalesData)
            setMonthSales(monthSalesData)
            setSalesByStore(salesStoreData.map((s: any) => ({
                branch_name: s.branch_name,
                total_sales: s.total_sales
            })))
            setSalesGrowth(salesGrowthData)

            // Set product states
            setTopProducts(topProductsData.map((p: any) => ({
                id: p.product_id,
                product_name: p.product_name,
                updated_at: new Date().toISOString()
            })))
            setDeadStock(deadStockData.map((p: any) => ({
                id: p._id.toString(),
                product_name: p.product_name,
                last_sold: p.updatedAt?.toISOString()
            })))

            setAlert(null)
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error)
            setAlert({
                message: `Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <p>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                {alert && (
                    <Alert variant={alert.type}>
                        {alert.message}
                        <button
                            onClick={fetchDashboardData}
                            className="ml-2 underline"
                        >
                            Retry
                        </button>
                    </Alert>
                )}

                <h1 className="text-3xl font-bold">Dashboard</h1>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Inventory Overview</h2>
                    <InventoryKPIs
                        totalStockValue={totalStockValue}
                        turnoverRate={turnoverRate}
                        lowStockCount={lowStockCount}
                        outOfStockCount={outOfStockCount}
                        loading={loading}
                    />
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Sales Overview</h2>
                    <SalesKPIs
                        todaySales={todaySales}
                        monthSales={monthSales}
                        loading={loading}
                    />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StockByStoreChart
                        data={stockByStore}
                        loading={loading}
                    />
                    <SalesByStoreChart
                        data={salesByStore}
                        loading={loading}
                    />
                </div>

                <SalesGrowthChart
                    data={salesGrowth}
                    loading={loading}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ProductList
                        title="Top Products"
                        products={topProducts}
                        loading={loading}
                        renderItem={(product) => (
                            <span className="text-sm text-muted-foreground">
                                Last updated: {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A'}
                            </span>
                        )}
                    />
                    <DeadStockList
                        products={deadStock}
                        loading={loading}
                    />
                </div>
            </div>
        </AppLayout>

    )
}