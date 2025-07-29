// actions/dashboard.actions.ts
"use server"

import { connectToDB } from "@/lib/db"
import { ObjectId } from "mongodb"

let dbConnection: any
let database: any

const init = async () => {
    const connection = await connectToDB()
    dbConnection = connection
    database = await dbConnection?.db("td_holdings_db")
}

// Total Stock Value
export const getTotalStockValue = async (): Promise<number> => {
    if (!dbConnection) await init()
    const productsCollection = database.collection("products")
    const products = await productsCollection.find({}).toArray()
    return products.reduce((acc: number, p: any) => acc + (p.product_price || 0) * (p.product_quantity || 0), 0)
}

// Stock by Store
export const getStockByStore = async (): Promise<{
    branch_id: string; branch_name: string; total_quantity: number; total_value: number 
}[]> => {
    if (!dbConnection) await init()
    const productsCollection = database.collection("products")
    const branchesCollection = database.collection("branches")

    const branches = await branchesCollection.find({}).toArray()
    const products = await productsCollection.find({}).toArray()

    return branches.map((branch: any) => {
        const branchProducts = products.filter((p: any) => (p.branch_ids || []).map((id: ObjectId) => id.toString()).includes(branch._id.toString()))
        const total_quantity = branchProducts.reduce((sum: number, p: any) => sum + (p.product_quantity || 0), 0)
        const total_value = branchProducts.reduce((sum: number, p: any) => sum + (p.product_quantity || 0) * (p.product_price || 0), 0)
        return {
            branch_name: branch.branch_name,
            total_quantity,
            total_value
        }
    })
}

// Out-of-Stock Products
export const getOutOfStockProducts = async (): Promise<any[]> => {
    if (!dbConnection) await init()
    const productsCollection = database.collection("products")
    return await productsCollection.find({ product_quantity: { $lte: 0 } }).toArray()
}

// Dead Stock (no update in X days)
export const getDeadStock = async (days: number = 90): Promise<any[]> => {
    if (!dbConnection) await init()
    const productsCollection = database.collection("products")
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return await productsCollection.find({ updatedAt: { $lte: cutoff } }).toArray()
}

// Inventory Turnover Rate (mock COGS)
export const getInventoryTurnoverRate = async (): Promise<number> => {
    if (!dbConnection) await init()
    const productsCollection = database.collection("products")
    const products = await productsCollection.find({}).toArray()
    const totalStockValue = products.reduce((acc: number, p: any) => acc + (p.product_price || 0) * (p.product_quantity || 0), 0)
    const COGS = totalStockValue * 0.8 // mock: 80% of stock value (adjust when sales data is added)
    const avgInventory = totalStockValue / 2 // basic assumption
    return avgInventory > 0 ? COGS / avgInventory : 0
}

export const getLowStockProducts = async (threshold: number = 10): Promise<{ count: number, products: any[] }> => {
    if (!dbConnection) await init();
    try {
        const productsCollection = database.collection("products");
        const products = await productsCollection.find({
            product_quantity: { $lt: threshold }
        }).toArray();

        const mappedProducts = products.map((p: any) => ({
            id: p._id.toString(),
            product_name: p.product_name,
            product_price: p.product_price,
            product_quantity: p.product_quantity,
            category: p.category,
            commodity: p.commodity,
            branch_ids: (p.branch_ids || []).map((id: ObjectId) => id.toString()),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        }));

        return { count: mappedProducts.length, products: mappedProducts };
    } catch (error: any) {
        console.error("Error getting low stock products:", error.message);
        return { count: 0, products: [] };
    }
};


// -------------------- SALES & REVENUE METRICS --------------------

// 1. Total sales today
export const getTotalSalesToday = async (): Promise<number> => {
    if (!dbConnection) await init();
    const orders = database.collection("orders");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await orders.aggregate([
        { $match: { created_at: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]).toArray();

    return result[0]?.total || 0;
};

// 2. Total sales this month
export const getTotalSalesThisMonth = async (): Promise<number> => {
    if (!dbConnection) await init();
    const orders = database.collection("orders");

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await orders.aggregate([
        { $match: { created_at: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]).toArray();

    return result[0]?.total || 0;
};

// 3. Sales by store
export const getSalesByStore = async () => {
    if (!dbConnection) await init();
    const orders = database.collection("orders");
    const branches = database.collection("branches");

    const sales = await orders.aggregate([
        { $group: { _id: "$branch_id", total_sales: { $sum: "$total_amount" } } },
        { $sort: { total_sales: -1 } }
    ]).toArray();

    // Add branch names
    return Promise.all(
        sales.map(async (s: any) => {
            const branch = await branches.findOne({ _id: new ObjectId(s._id) });
            return {
                branch_id: s._id,
                branch_name: branch?.branch_name || "Unknown",
                total_sales: s.total_sales
            };
        })
    );
};

// 4. Top selling products
export const getTopSellingProducts = async (limit: number = 5) => {
    if (!dbConnection) await init();
    const orders = database.collection("orders");
    const products = database.collection("products");

    const topProducts = await orders.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.product_id", total_sold: { $sum: "$items.quantity" } } },
        { $sort: { total_sold: -1 } },
        { $limit: limit }
    ]).toArray();

    // Add product names
    return Promise.all(
        topProducts.map(async (p: any) => {
            const product = await products.findOne({ _id: new ObjectId(p._id) });
            return {
                product_id: p._id,
                product_name: product?.product_name || "Unknown",
                total_sold: p.total_sold
            };
        })
    );
};

// 5. Sales growth over time (weekly or monthly)
export const getSalesGrowth = async (period: "weekly" | "monthly" = "weekly") => {
    if (!dbConnection) await init();
    const orders = database.collection("orders");

    let groupFormat = period === "weekly"
        ? { $dateToString: { format: "%Y-%U", date: "$created_at" } } // Year-Week
        : { $dateToString: { format: "%Y-%m", date: "$created_at" } }; // Year-Month

    const result = await orders.aggregate([
        { $group: { _id: groupFormat, total_sales: { $sum: "$total_amount" } } },
        { $sort: { _id: 1 } }
    ]).toArray();

    return result.map((r: { _id: any; total_sales: any }) => ({
        period: r._id,
        total_sales: r.total_sales
    }));
};
