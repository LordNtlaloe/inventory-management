"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBranch, updateBranch, deleteBranch } from "@/actions/branches.actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LoaderCircle, InfoIcon, Trash2 } from "lucide-react";
import BranchesLayout from "@/layouts/branches/layout";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/lib/types";
import { BranchSchema } from "@/schemas"; // Import schema

const lesothoDistricts = [
    "Berea", "Butha-Buthe", "Leribe", "Mafeteng", "Maseru",
    "Mohale's Hoek", "Mokhotlong", "Qacha's Nek", "Quthing", "Thaba-Tseka"
];

type BranchFormValues = z.infer<typeof BranchSchema>;

type BranchFormProps = {
    initialData?: BranchFormValues;
    branchId?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Branches", href: "/branches" },
];

export default function BranchForm({ initialData, branchId }: BranchFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const form = useForm<BranchFormValues>({
        resolver: zodResolver(BranchSchema),
        defaultValues: initialData || {
            branch_name: "",
            branch_location: "",
        },
    });

    const onSubmit = async (data: BranchFormValues) => {
        try {
            setLoading(true);
            let result;

            if (branchId) {
                result = await updateBranch(branchId, data);
            } else {
                result = await createBranch(data);
            }

            if (result?.success) {
                setAlert({ type: "success", message: result.success });
                if (!branchId) form.reset();
            } else {
                setAlert({ type: "error", message: result?.error || "An error occurred" });
            }
        } catch (err) {
            setAlert({ type: "error", message: `An unexpected error occurred, ${err}` });
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        if (!branchId) return;

        try {
            setLoading(true);
            const result = await deleteBranch(branchId);

            if (result?.success) {
                router.push("/branches");
            } else {
                setAlert({ type: "error", message: result?.error || "Delete failed" });
            }
        } catch (err) {
            setAlert({ type: "error", message: `An unexpected error occurred, ${err}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <BranchesLayout>
                <div className="space-y-6 w-full w-max-full">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border p-5 rounded-md max-w-xl">
                            <FormField
                                control={form.control}
                                name="branch_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Branch Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={loading}
                                                placeholder="Enter branch name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="branch_location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Branch Location</FormLabel>
                                        <Select
                                            disabled={loading}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a district" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {lesothoDistricts.map((district) => (
                                                    <SelectItem key={district} value={district}>
                                                        {district}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">
                                <Button type="submit" disabled={loading} className="w-32">
                                    {loading && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                    {branchId ? "Update" : "Create"}
                                </Button>

                                {branchId && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={onDelete}
                                        disabled={loading}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>

                    {alert && (
                        <Alert className={`fixed bottom-4 right-4 w-96 text-white ${alert.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                            <InfoIcon className="h-4 w-4" />
                            <AlertTitle>{alert.type.toUpperCase()}</AlertTitle>
                            <AlertDescription>{alert.message}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </BranchesLayout>
        </AppLayout>
    );
}