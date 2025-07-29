'use server';

import { connectToDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { Product, ProductFormData } from "@/lib/types";

let dbConnection: any;
let database: any;

const init = async () => {
    try {
        const connection = await connectToDB();
        dbConnection = connection;
        database = await dbConnection?.db("td_holdings_db");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};

// Get all products
export const getAllProducts = async (): Promise<Product[] | null> => {
    if (!dbConnection) await init();
    try {
        const productsCollection = await database?.collection("products");
        const branchesCollection = await database?.collection("branches");
        if (!database || !productsCollection || !branchesCollection) {
            console.log("Failed to connect to collections");
            return null;
        }

        const products = await productsCollection.find({}).toArray();

        return await Promise.all(products.map(async (product: any) => {
            return {
                id: product._id.toString(),
                product_name: product.product_name,
                product_price: product.product_price,
                product_quantity: product.product_quantity,
                category: product.category,
                commodity: product.commodity,
                grade: product.grade,
                branch_ids: (product.branch_ids || []).map((b: any) => b.toString()),
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            };
        }));
    } catch (error: any) {
        console.log("Error getting products:", error.message);
        return null;
    }
};

// Get products by branch name
export const getProductsByBranchName = async (branchName: string): Promise<Product[] | null> => {
    if (!dbConnection) await init();
    try {
        const branchesCollection = await database?.collection("branches");
        const productsCollection = await database?.collection("products");

        if (!database || !branchesCollection || !productsCollection) {
            console.log("Failed to connect to collections");
            return null;
        }

        const branch = await branchesCollection.findOne({ branch_name: branchName });
        if (!branch) return null;

        const products = await productsCollection.find({
            branch_id: branch._id
        }).toArray();

        return products.map((product: { _id: { toString: () => any; }; product_name: any; product_price: any; product_quantity: any; category: any; commodity: any; branch_id: { toString: () => any; }; createdAt: any; updatedAt: any; }) => ({
            id: product._id.toString(),
            product_name: product.product_name,
            product_price: product.product_price,
            product_quantity: product.product_quantity,
            category: product.category,
            commodity: product.commodity,
            branch_id: product.branch_id?.toString(),
            branch_name: branchName,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));
    } catch (error: any) {
        console.log("Error getting products by branch:", error.message);
        return null;
    }
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
    if (!dbConnection) await init();
    try {
        const productsCollection = await database?.collection("products");
        if (!productsCollection) return null;

        const product = await productsCollection.findOne({ _id: new ObjectId(id) });
        if (!product) return null;

        return product;
    } catch (error: any) {
        console.log("Error getting product by ID:", error.message);
        return null;
    }
};

export async function createProduct(data: Partial<ProductFormData>) {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("products");
        
        // Prepare the data for insertion
        const insertData = {
            ...data,
            // Convert branch_ids to ObjectIds if they exist
            branch_ids: data.branch_ids?.map((id: string) => new ObjectId(id)) || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await collection.insertOne(insertData);
        if (result.insertedId) {
            revalidatePath('/products');
            return { success: "Product created successfully" };
        } else {
            return { error: "Failed to create product" };
        }
    }
    catch (error: any) {
        console.log("An Error Occurred...", error.message);
        return { error: error.message }
    }
}

// Update the updateProduct function
export const updateProduct = async (
    id: string, 
    productData: Partial<ProductFormData>
): Promise<{ success?: string; error?: string }> => {
    if (!dbConnection) await init();
    try {
        const productsCollection = await database?.collection("products");
        if (!productsCollection) return { error: "Failed to connect to products collection" };

        const updateFields: any = {
            ...productData,
            updatedAt: new Date()
        };

        // Convert branch_ids to ObjectIds if they exist
        if (productData.branch_ids) {
            updateFields.branch_ids = productData.branch_ids.map((id: string) => new ObjectId(id));
        }

        await productsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        revalidatePath('/products');
        revalidatePath(`/products/edit/${id}`);
        return { success: "Product updated successfully" };
    } catch (error: any) {
        console.error("Error updating product:", error.message);
        return { error: "Failed to update product" };
    }
};

// Delete product
export const deleteProduct = async (id: string): Promise<{ success?: string; error?: string }> => {
    if (!dbConnection) await init();
    try {
        const productsCollection = await database?.collection("products");
        if (!productsCollection) return { error: "Failed to connect to products collection" };

        await productsCollection.deleteOne({ _id: new ObjectId(id) });

        revalidatePath('/products');
        return { success: "Product deleted successfully" };
    } catch (error: any) {
        console.error("Error deleting product:", error.message);
        return { error: "Failed to delete product" };
    }
};

// Get low stock products (quantity below threshold)
export const getLowStockProducts = async (threshold: number = 10): Promise<Product[] | null> => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("products");
        if (!database || !collection) {
            console.log("Failed to connect to products collection");
            return null;
        }

        const products = await collection.find({
            product_quantity: { $lt: threshold }
        }).toArray();

        return products.map((product: { _id: { toString: () => any; }; product_name: any; product_price: any; product_quantity: any; category: any; commodity: any; branch_id: { toString: () => any; }; createdAt: any; updatedAt: any; }) => ({
            id: product._id.toString(),
            product_name: product.product_name,
            product_price: product.product_price,
            product_quantity: product.product_quantity,
            category: product.category,
            commodity: product.commodity,
            branch_id: product.branch_id?.toString(),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));
    } catch (error: any) {
        console.log("Error getting low stock products:", error.message);
        return null;
    }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[] | null> => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("products");
        if (!database || !collection) {
            console.log("Failed to connect to products collection");
            return null;
        }

        const products = await collection.find({
            category: category
        }).toArray();

        return products.map((product: { _id: { toString: () => any; }; product_name: any; product_price: any; product_quantity: any; category: any; commodity: any; branch_id: { toString: () => any; }; createdAt: any; updatedAt: any; }) => ({
            id: product._id.toString(),
            product_name: product.product_name,
            product_price: product.product_price,
            product_quantity: product.product_quantity,
            category: product.category,
            commodity: product.commodity,
            branch_id: product.branch_id?.toString(),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));
    } catch (error: any) {
        console.log("Error getting products by category:", error.message);
        return null;
    }
};