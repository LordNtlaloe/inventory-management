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

type BranchPayload = {
    branch_name: string;
    branch_location: string;
};

export const getAllBranches = async () => {
    if (!dbConnection) await init();

    try {
        const collection = await database?.collection("branches")

        if (!database || !collection) {
            console.log("Failed To Connect To Collection");
            return { error: "Failed To Connect To Branches Collection" }
        }

        const branches = await collection.find({}).toArray();
        return branches.map((branch: { _id: { toString: () => string; }; branch_name: string; branch_location: string; }) => ({
            id: branch._id.toString(), // Important!
            branch_name: branch.branch_name,
            branch_location: branch.branch_location,
        }));
    }
    catch (error: any) {
        console.log("An Error Occured...", error.message);
        return { error: error.message }
    }
}



export async function createBranch(data: BranchPayload) {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("branches")
        const result = await collection.insertOne(data);
        if (result.insertedId) {
            return { success: "Branch created successfully" };
        } else {
            return { error: "Failed to create branch" };
        }
    }
    catch (error: any) {
        console.log("An Error Occured...", error.message);
        return { error: error.message }
    }

}

export async function updateBranch(branchId: string, data: BranchPayload) {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("branches")
        const result = await collection.updateOne(
            { _id: new ObjectId(branchId) },
            { $set: data }
        );

        if (result.modifiedCount > 0) {
            return { success: "Branch updated successfully" };
        } else {
            return { error: "No changes were made" };
        }
    }
    catch (error: any) {
        console.log("An Error Occured...", error.message);
        return { error: error.message }
    }
}


export const getBranchById = async (id: string) => {
    if (!dbConnection) await init();

    try {
        const collection = await database?.collection("branches")

        if (!database || !collection) {
            console.log("Failed To Connect To Collection")
            return { error: "Failed To Connect To Branches Collection" }
        }

        const branch = await collection.findOne({ _id: new ObjectId(id) });

        return {
            id: branch._id.toString(),
            branch_name: branch.branch_name,
            branch_location: branch.branch_location,
        };
    }
    catch (error: any) {
        console.log("An Error Occured...", error.message)
        return { error: error.message }
    }
}


export const deleteBranch = async (id: string) => {
    if (!dbConnection) await init();

    try {
        const collection = await database?.collection("branches")

        if (!collection || !database) {
            console.log("Failed To Connect To Collection")
            return { errror: "Failed To Connect To Branches Collection" }
        }

        await collection.deleteOne({ _id: new ObjectId(id) });

        return { success: "Branch Deleted Successfully" }
    }
    catch (error: any) {
        console.log("An Error Occured...", error.message)
        return { error: error.message }
    }
}