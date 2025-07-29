"use client"

import { notFound } from "next/navigation"
import { getEmployeeById } from "@/actions/employees.actions"
import EmployeeForm from "@/components/dashboard/employees/employees-form"
import { use, useEffect, useState } from "react"
import { Employee } from "@/lib/types"

interface PageParams {
    id: string
}

export default function EditEmployeePage({ params }: { params: Promise<PageParams> }) {
    const [employee, setEmployee] = useState<Employee | null>(null) // Allow null here
    const [loading, setLoading] = useState(true)

    // Use React's `use` hook to unwrap the Promise
    const resolvedParams = use(params)
    const employee_id = resolvedParams.id

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const data = await getEmployeeById(employee_id)
                setEmployee(data || null)
            } catch (error) {
                setEmployee(null)
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchEmployee()
    }, [employee_id])

    if (loading) return <div>Loading...</div>
    if (!employee) return notFound()

    return (
        <EmployeeForm
            employeeId={employee_id}
            initialData={{
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                phone_number: employee.phone_number || '',
                role: employee.role,
                branch_id: employee.branch_id || '',
                position: employee.position || '',
            }}
        />
    )
}