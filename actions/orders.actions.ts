
"use server"
import { connectToDB } from "@/lib/db";
import { ObjectId } from "mongodb";

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
}

export interface PaymentFormData {
    items: Array<{
        product_id: string;
        quantity: number;
        price: number;
        discount: number;
        subtotal: number;
    }>;
    total_amount: number;
    branch_id: string;
    cashier_id: string;
    payment_method: 'cash' | 'card' | 'mobile';
    amount_received: number;
    change_amount: number;
    payment_reference?: string;
}

export interface Order {
    _id?: string;
    order_number: string;
    items: Array<{
        product_id: string;
        quantity: number;
        price: number;
        discount: number;
        subtotal: number;
    }>;
    total_amount: number;
    branch_id: string;
    cashier_id: string;
    payment_method: string;
    amount_received: number;
    change_amount: number;
    payment_reference?: string;
    created_at: Date;
    status: string;
}

// Generate order number
const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
};

export const processPaymentAction = async (paymentData: PaymentFormData) => {
    if (!dbConnection) await init();

    try {
        const ordersCollection = await database?.collection("orders");

        if (!database || !ordersCollection) {
            console.log("Failed to connect to orders collection...");
            return {
                success: false,
                error: "Failed to connect to orders collection"
            };
        }

        // Validate required fields
        if (!paymentData.items || paymentData.items.length === 0) {
            return {
                success: false,
                error: "Order must contain at least one item"
            };
        }

        if (!paymentData.branch_id || !paymentData.cashier_id) {
            return {
                success: false,
                error: "Branch ID and Cashier ID are required"
            };
        }

        if (!paymentData.payment_method) {
            return {
                success: false,
                error: "Payment method is required"
            };
        }

        // Validate cash payment
        if (paymentData.payment_method === 'cash' && paymentData.amount_received < paymentData.total_amount) {
            return {
                success: false,
                error: "Amount received must be at least equal to the total"
            };
        }

        // Validate card/mobile payment reference
        if ((paymentData.payment_method === 'card' || paymentData.payment_method === 'mobile') && !paymentData.payment_reference) {
            return {
                success: false,
                error: "Reference number is required for card or mobile payments"
            };
        }

        // Create order object
        const order: Order = {
            order_number: generateOrderNumber(),
            items: paymentData.items,
            total_amount: paymentData.total_amount,
            branch_id: paymentData.branch_id,
            cashier_id: paymentData.cashier_id,
            payment_method: paymentData.payment_method,
            amount_received: paymentData.amount_received,
            change_amount: paymentData.change_amount,
            payment_reference: paymentData.payment_reference,
            created_at: new Date(),
            status: 'completed'
        };

        // Insert order into database
        const result = await ordersCollection.insertOne(order);

        if (result.insertedId) {
            // Return the created order with the generated ID
            const createdOrder = {
                ...order,
                _id: result.insertedId.toString()
            };

            return {
                success: true,
                order: createdOrder,
                message: "Payment processed successfully"
            };
        } else {
            return {
                success: false,
                error: "Failed to create order"
            };
        }

    } catch (error: any) {
        console.log("An error occurred during payment processing...", error.message);
        return {
            success: false,
            error: error.message || "An unexpected error occurred"
        };
    }
}

// Additional helper function to get order by ID
export const getOrderById = async (orderId: string) => {
    if (!dbConnection) await init();

    try {
        const ordersCollection = await database?.collection("orders");

        if (!database || !ordersCollection) {
            console.log("Failed to connect to orders collection...");
            return { error: "Failed to connect to orders collection" };
        }

        const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });

        if (order) {
            return order;
        }

        return null;
    } catch (error: any) {
        console.log("An error occurred while fetching order...", error.message);
        return { error: error.message };
    }
}

// Helper function to get orders by branch
export const getOrdersByBranch = async (branchId: string, limit: number = 50) => {
    if (!dbConnection) await init();

    try {
        const ordersCollection = await database?.collection("orders");

        if (!database || !ordersCollection) {
            console.log("Failed to connect to orders collection...");
            return { error: "Failed to connect to orders collection" };
        }

        const orders = await ordersCollection
            .find({ branch_id: branchId })
            .sort({ created_at: -1 })
            .limit(limit)
            .toArray();

        return orders;
    } catch (error: any) {
        console.log("An error occurred while fetching orders...", error.message);
        return { error: error.message };
    }
}

export const getAllOrders = async () => {
    if(!dbConnection) await init();

    try{
        const collection = await database?.collection("orders");

        if (!database || !collection) {
            console.log("Failed to connect to orders collection...");
            return { error: "Failed to connect to orders collection" };
        }

        const orders = await collection.find({}).toArray();
        return orders;
    }
    catch(error: any){
        console.log("An error occurred while fetching orders...", error.message);
        return { error: error.message };
    }
}