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



export const getUserByEmail = async (email: string) => {
    if (!dbConnection) await init();
    
    try {
        const collection = await database?.collection("users");
        if (!database || !collection) {
            console.log("Failed to connect to users collection...");
            return null; // Return null instead of error object
        }
        
        const user = await collection.findOne({ email });
        return user || null;
        
    } catch (error: any) {
        console.log("An error occurred getting user by email:", error.message);
        return null; // Return null instead of error object
    }
}

export const getUserById = async (id: string) => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("users");

        if (!database || !collection) {
            console.log("Failed to connect to users collection...");
            return { error: "Failed to connect to users collection" };
        }

        const user = await collection.findOne({ _id: new ObjectId(id) });
        return user || null;
    } catch (error: any) {
        console.log("An error occurred...", error.message);
        return { error: error.message };
    }
}

export const updateUser = async (id: string, updateData: any) => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("users");

        if (!database || !collection) {
            console.log("Failed to connect to users collection...");
            return { error: "Failed to connect to users collection" };
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );

        return result.modifiedCount > 0 ? { success: true } : { error: "User not found or no changes made" };
    } catch (error: any) {
        console.log("An error occurred...", error.message);
        return { error: error.message };
    }
}

export const getAllUsers = async () => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("users");

        if (!database || !collection) {
            console.log("Failed to connect to users collection...");
            return { error: "Failed to connect to users collection" };
        }

        const user = await collection.find({}).toArray();
        return user || null;
    } catch (error: any) {
        console.log("An error occurred...", error.message);
        return { error: error.message };
    }
}

export const deleteUser = async (id: string) => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("users");

        if (!database || !collection) {
            console.log("Failed to connect to users collection...");
            return { error: "Failed to connect to users collection" };
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        return result.deletedCount > 0
            ? { success: true }
            : { error: "User not found or already deleted" };
    } catch (error: any) {
        console.log("An error occurred...", error.message);
        return { error: error.message };
    }
}
