"use client"

import { getAllBranches } from '@/actions/branches.actions';
import EmployeeForm from '@/components/dashboard/employees/employees-form';
import { useEffect, useState } from 'react';
import { Branch } from '@/lib/types';

export default function CreateEmployeePage() {
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    const getBranches = async () => {
      const fetchedBranches = await getAllBranches()
      setBranches(fetchedBranches || [])
    }
    getBranches()
  }, [])
  
  return (
    <EmployeeForm branches={branches} />
  )
}