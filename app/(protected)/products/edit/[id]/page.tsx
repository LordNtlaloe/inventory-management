"use client"

import React, { use, useEffect, useState } from 'react'
import { getProductById } from '@/actions/products.actions'
import { Product } from '@/lib/types'
import ProductForm from '@/components/dashboard/products/products-form'
import AppLayout from '@/layouts/app-layout'
import ProductsLayout from '@/layouts/products/layout'
import { InitialData } from '@/lib/types'

interface PageProps {

    id: string
}


const formatDate = (date?: Date): string | undefined => {
    return date ? date.toISOString().split('T')[0] : undefined;
};

const transformProductToInitialData = (product: Product | null): InitialData | undefined => {
    if (!product) return undefined;

    return {
        product_name: product.product_name,
        product_price: product.product_price,
        product_quantity: product.product_quantity,
        category: product.category,
        product_type: product.product_type,
        commodity: product.commodity,
        branch_ids: product.branch_ids || [],
        grade: product.grade,
        ...(product.tire_size && { tire_size: product.tire_size }),
        ...(product.tire_type && { tire_type: product.tire_type }),
        ...(product.load_index && { load_index: product.load_index }),
        ...(product.speed_rating && { speed_rating: product.speed_rating }),
        ...(product.warranty_period && { warranty_period: product.warranty_period }),
        ...(product.bale_weight && { bale_weight: product.bale_weight }),
        ...(product.bale_category && { bale_category: product.bale_category }),
        ...(product.origin_country && { origin_country: product.origin_country }),
        import_date: formatDate(product.import_date),
        ...(product.bale_count && { bale_count: product.bale_count })
    };
};

export default function UpdateProductsPage({ params }: { params: Promise<PageProps> }) {
    const resolvedParams = use(params)
    const product_id = resolvedParams.id
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const fetchedData = await getProductById(product_id);
                setProduct(fetchedData);
            } catch (error) {
                console.error('Failed to fetch product:', error);
                setProduct(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [product_id]);

    if (isLoading) {
        return (
            <div className="max-w-full p-6 border rounded-md">
                <div className="flex items-center justify-center py-8">
                    <p>Loading product data...</p>
                </div>
            </div>
        );
    }

    const initialData = transformProductToInitialData(product);

    return (
        <AppLayout>
            <ProductsLayout>
                <ProductForm
                    productId={product_id}
                    initialData={initialData}
                />
            </ProductsLayout>
        </AppLayout>
    );
}