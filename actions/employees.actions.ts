'use server';

import { connectToDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { Employee } from "@/lib/types";

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

// Get all employees
export const getAllEmployees = async (): Promise<Employee[] | null> => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("employees");
        if (!database || !collection) {
            console.log("Failed to connect to collection...");
            return null;
        }

        const employees = await collection.find({}).toArray();
        return employees.map((emp: any) => ({
            id: emp._id.toString(),
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            phone_number: emp.phone_number,
            role: emp.role,
            branch_id: emp.branch_id?.toString(),
            position: emp.position,
            createdAt: emp.createdAt,
            updatedAt: emp.updatedAt
        }));
    } catch (error: any) {
        console.log("An error occurred:", error.message);
        return null;
    }
};

// Get employee by ID
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("employees");
        if (!database || !collection) {
            console.log("Failed to connect to collection...");
            return null;
        }

        const employee = await collection.findOne({ _id: new ObjectId(id) });
        if (!employee) return null;

        return employee;
    } catch (error: any) {
        console.log("An error occurred:", error.message);
        return null;
    }
};

// Create employee
export const createEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success?: string; error?: string }> => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("employees");
        if (!database || !collection) {
            return { error: "Failed to connect to database" };
        }

        // Check if employee already exists
        const existingEmployee = await collection.findOne({
            email: employeeData.email.toLowerCase()
        });
        if (existingEmployee) {
            return { error: "Employee with this email already exists" };
        }

        const now = new Date();
        await collection.insertOne({
            first_name: employeeData.first_name,
            last_name: employeeData.last_name,
            email: employeeData.email.toLowerCase(),
            phone_number: employeeData.phone_number,
            role: employeeData.role,
            branch_id: employeeData.branch_id ? new ObjectId(employeeData.branch_id) : null,
            position: employeeData.position,
            password: employeeData.password,
            createdAt: now,
            updatedAt: now
        });

        revalidatePath('/employees');
        return { success: "Employee created successfully" };
    } catch (error: any) {
        console.error("Error creating employee:", error.message);
        return { error: "Failed to create employee" };
    }
};

// Update employee
export const updateEmployee = async (id: string, employeeData: Partial<Omit<Employee, 'id' | 'createdAt'>>): Promise<{ success?: string; error?: string }> => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("employees");
        if (!database || !collection) {
            return { error: "Failed to connect to database" };
        }

        const updateFields: any = {
            updatedAt: new Date()
        };

        if (employeeData.first_name) updateFields.first_name = employeeData.first_name;
        if (employeeData.last_name) updateFields.last_name = employeeData.last_name;
        if (employeeData.email) updateFields.email = employeeData.email.toLowerCase();
        if (employeeData.phone_number) updateFields.phone_number = employeeData.phone_number;
        if (employeeData.role) updateFields.role = employeeData.role;
        if (employeeData.branch_id) updateFields.branch_id = new ObjectId(employeeData.branch_id);
        if (employeeData.position) updateFields.position = employeeData.position;
        if (employeeData.password) updateFields.password = employeeData.password;

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        revalidatePath('/employees');
        revalidatePath(`/employees/edit/${id}`);
        return { success: "Employee updated successfully" };
    } catch (error: any) {
        console.error("Error updating employee:", error.message);
        return { error: "Failed to update employee" };
    }
};

// Delete employee
export const deleteEmployee = async (id: string): Promise<{ success?: string; error?: string }> => {
    if (!dbConnection) await init();
    try {
        const collection = await database?.collection("employees");
        if (!database || !collection) {
            return { error: "Failed to connect to database" };
        }

        await collection.deleteOne({ _id: new ObjectId(id) });

        revalidatePath('/employees');
        return { success: "Employee deleted successfully" };
    } catch (error: any) {
        console.error("Error deleting employee:", error.message);
        return { error: "Failed to delete employee" };
    }
};