import ProductsForm from '@/components/dashboard/products/products-form'
import AppLayout from '@/layouts/app-layout'
import ProductsLayout from '@/layouts/products/layout'
import React from 'react'

export default function Products() {
    return (
        <AppLayout>
            <ProductsLayout>
                <ProductsForm />
            </ProductsLayout>
        </AppLayout>

    )
}
