"use client"

import { notFound } from "next/navigation"
import { getBranchById } from "@/actions/branches.actions"
import BranchForm from "@/components/dashboard/branches/braches-form"
import { useEffect, useState, use } from "react"
import { Branch } from "@/lib/types"

interface PageParams {
  id: string
}

type BranchResponse = Branch | { error: string }

export default function EditBranchPage({ params }: { params: Promise<PageParams> }) {
  const [branch, setBranch] = useState<Branch>()
  const [loading, setLoading] = useState(true)
   const resolvedParams = use(params)
      const branch_id = resolvedParams.id

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const data = await getBranchById(branch_id) as BranchResponse
        if ('error' in data) {
          setBranch(undefined)
        } else {
          setBranch(data)
        }
      } catch (error) {
        setBranch(undefined)
        return {error}
      } finally {
        setLoading(false)
      }
    }

    fetchBranch()
  }, [branch_id])

  if (loading) return <div>Loading...</div>
  if (!branch) return notFound()

  return (
    <BranchForm branchId={branch_id} initialData={branch} />
  )
}