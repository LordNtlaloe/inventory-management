import { Metadata } from "next";
import BranchForm from "@/components/dashboard/branches/braches-form";

export const metadata: Metadata = {
    title: "Create New Branch",
};

export default function NewBranchPage() {
    return (
        <BranchForm />
    );
}