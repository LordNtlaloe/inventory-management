import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Product } from "@/lib/types"

// Define types for your data structures
interface StoreData {
  branch_name: string
  total_value?: number
  total_sales?: number
}

interface SalesGrowthData {
  period: string
  total_sales: number
}


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
              <li key={p.id || p.id} className="flex items-center justify-between">
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