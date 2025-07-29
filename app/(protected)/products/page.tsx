"use client"

import { ProductTable } from "@/components/dashboard/products/products-table"
import { getAllProducts } from "@/actions/products.actions"
import { useEffect, useState } from "react"
import { Product } from "@/lib/types"
import AppLayout from "@/layouts/app-layout"
import ProductsLayout from "@/layouts/products/layout"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getAllProducts()
        if (data) setProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <AppLayout>
      <ProductsLayout>
          <ProductTable data={products} />
      </ProductsLayout>
    </AppLayout>
  )
}
