/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductSchema, ProductType } from "@/schemas";
import { getAllBranches } from "@/actions/branches.actions";
import { createProduct, updateProduct, getProductById } from "@/actions/products.actions";
import { InitialData, ProductFormData } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
} from "@/components/ui/form";

interface ProductFormProps {
    productId?: string;
    initialData?: InitialData;
}

enum ProductGrade {
    A = "A",
    B = "B",
    C = "C"
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
    const [branches, setBranches] = useState<
        { id: string; branch_name: string; branch_location: string }[]
    >([]);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const isEditMode = Boolean(productId);

    const getDefaultValues = useCallback((): ProductFormData => {
        if (isEditMode && initialData) {
            return {
                product_name: initialData.product_name || "",
                product_price: initialData.product_price || 0,
                product_quantity: initialData.product_quantity || 0,
                category: initialData.category || "tire",
                product_type: initialData.product_type || ProductType.TIRE,
                commodity: initialData.commodity || "",
                branch_ids: initialData.branch_ids || [],
                grade: initialData.grade || ProductGrade.A,
                tire_size: initialData.tire_size || "",
                tire_type: initialData.tire_type || "",
                load_index: initialData.load_index || "",
                speed_rating: initialData.speed_rating || "",
                warranty_period: initialData.warranty_period || "",
                bale_weight: initialData.bale_weight || 0,
                bale_category: initialData.bale_category || "",
                origin_country: initialData.origin_country || "",
                import_date: initialData.import_date ? new Date(initialData.import_date) : undefined,
                bale_count: initialData.bale_count || undefined,
            };
        }

        return {
            product_name: "",
            product_price: 0,
            product_quantity: 0,
            category: "",
            product_type: ProductType.TIRE,
            commodity: "",
            branch_ids: [],
            grade: ProductGrade.A,
            tire_size: "",
            tire_type: "",
            load_index: "",
            speed_rating: "",
            warranty_period: "",
            bale_weight: 0,
            bale_category: "",
            origin_country: "",
            import_date: undefined,
            bale_count: undefined,
        };
    }, [isEditMode, initialData]);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(ProductSchema),
        defaultValues: getDefaultValues(),
        mode: "onChange",
    });

    // Debug: Log form state - this will show why the button is disabled
    console.log("=== FORM DEBUG INFO ===");
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    console.log("Form is submitting:", form.formState.isSubmitting);
    console.log("Form values:", form.watch());
    console.log("Is loading branches:", isLoadingBranches);
    console.log("Button should be enabled:", !form.formState.isSubmitting && !isLoadingBranches);
    console.log("======================");

    useEffect(() => {
        async function fetchBranches() {
            setIsLoadingBranches(true);
            try {
                const data = await getAllBranches();
                if (data) setBranches(data);
            } catch (error) {
                console.error("Failed to fetch branches:", error);
                toast.error("Failed to load branches");
            } finally {
                setIsLoadingBranches(false);
            }
        }
        fetchBranches();
    }, []);

    useEffect(() => {
        async function fetchProduct() {
            if (isEditMode && productId && !initialData) {
                setIsLoadingProduct(true);
                try {
                    const product = await getProductById(productId);
                    if (product) {
                        form.reset(getDefaultValues());
                    }
                } catch (error) {
                    console.error("Failed to fetch product:", error);
                    toast.error("Failed to load product data");
                } finally {
                    setIsLoadingProduct(false);
                }
            }
        }
        fetchProduct();
    }, [productId, isEditMode, initialData, form, getDefaultValues]);

    const categoryValue = useWatch({ control: form.control, name: "category" });

    useEffect(() => {
        if (!isEditMode && categoryValue && categoryValue !== "") {
            const currentValues = form.getValues();

            if (categoryValue === "tire") {
                form.reset({
                    ...currentValues,
                    category: "tire",
                    product_type: ProductType.TIRE,
                });
            } else if (categoryValue === "bale") {
                form.reset({
                    ...currentValues,
                    category: "bale",
                    product_type: ProductType.BALE,
                });
            }
        }
    }, [categoryValue, form, isEditMode]);

    const handleBranchChange = (branchId: string, checked: boolean, field: any) => {
        const currentValues = Array.isArray(field.value) ? field.value : [];
        const newValues = checked
            ? [...currentValues, branchId]
            : currentValues.filter((id: string) => id !== branchId);
        field.onChange(newValues);
    };

    const onSubmit = async (data: ProductFormData) => {
        console.log("Form submitted with data:", data); // Debug log

        try {
            setIsSubmitting(true);

            let cleanedData: Partial<ProductFormData>;
            if (data.category === "tire") {
                cleanedData = {
                    product_name: data.product_name,
                    product_price: data.product_price,
                    product_quantity: data.product_quantity,
                    category: data.category,
                    product_type: ProductType.TIRE,
                    commodity: data.commodity,
                    branch_ids: data.branch_ids,
                    grade: data.grade,
                    tire_size: data.tire_size,
                    tire_type: data.tire_type,
                    load_index: data.load_index,
                    speed_rating: data.speed_rating,
                    ...(data.warranty_period && { warranty_period: data.warranty_period }),
                };
            } else {
                cleanedData = {
                    product_name: data.product_name,
                    product_price: data.product_price,
                    product_quantity: data.product_quantity,
                    category: data.category,
                    product_type: ProductType.BALE,
                    commodity: data.commodity,
                    branch_ids: data.branch_ids,
                    grade: data.grade,
                    bale_weight: data.bale_weight,
                    bale_category: data.bale_category,
                    origin_country: data.origin_country,
                    ...(data.import_date && { import_date: data.import_date }),
                    ...(data.bale_count && { bale_count: data.bale_count }),
                };
            }

            console.log("Cleaned data:", cleanedData); // Debug log

            let result;
            if (isEditMode && productId) {
                result = await updateProduct(productId, cleanedData);
            } else {
                result = await createProduct(cleanedData);
            }

            console.log("API result:", result); // Debug log

            if (result?.success) {
                toast.success(result.success);
                router.push("/products");
            } else {
                toast.error(result?.error ?? `Failed to ${isEditMode ? 'update' : 'create'} product`);
            }
        } catch (error) {
            console.error(`Product ${isEditMode ? 'update' : 'creation'} error:`, error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Debug function to manually trigger form validation
    const handleDebugSubmit = async () => {
        console.log("Manual validation triggered");
        const isValid = await form.trigger();
        console.log("Form is valid after trigger:", isValid);
        if (!isValid) {
            console.log("Validation errors:", form.formState.errors);
        }
    };

    if (isLoadingProduct) {
        return (
            <div className="max-w-full p-6 border rounded-md">
                <div className="flex items-center justify-center py-8">
                    <p>Loading product data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-full p-6 border rounded-md">
            <h2 className="text-xl font-bold mb-6">
                {isEditMode ? 'Edit Product' : 'Add Product'}
            </h2>

            {/* Debug Section - Enhanced */}
            <div className="mb-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <p>Form Valid: {form.formState.isValid ? 'Yes' : 'No'}</p>
                <p>Is Submitting: {form.formState.isSubmitting ? 'Yes' : 'No'}</p>
                <p>Loading Branches: {isLoadingBranches ? 'Yes' : 'No'}</p>
                <p>Button Disabled: {(form.formState.isSubmitting || isLoadingBranches) ? 'Yes' : 'No'}</p>
                <p>Category: {categoryValue || 'None selected'}</p>

                {Object.keys(form.formState.errors).length > 0 && (
                    <div className="mt-2 p-2 bg-red-100 rounded">
                        <p className="font-semibold text-red-700">Validation Errors:</p>
                        {Object.entries(form.formState.errors).map(([field, error]) => (
                            <p key={field} className="text-red-600 text-sm">
                                {field}: {error?.message || 'Invalid'}
                            </p>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleDebugSubmit}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm mr-2"
                >
                    Debug Validate
                </button>

                <button
                    type="button"
                    onClick={() => console.log("Current form state:", {
                        values: form.getValues(),
                        errors: form.formState.errors,
                        isValid: form.formState.isValid,
                        isDirty: form.formState.isDirty,
                        isSubmitting: form.formState.isSubmitting
                    })}
                    className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                    Log Full State
                </button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Product Name */}
                    <FormField
                        control={form.control}
                        name="product_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Enter product name"
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Category Dropdown */}
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <select
                                        {...field}
                                        className="w-full border rounded p-2 dark:bg-[#2E2E2E]"
                                        disabled={isSubmitting || isEditMode}
                                    >
                                        <option value="">Select a category</option>
                                        <option value="bale">Bale</option>
                                        <option value="tire">Tire</option>
                                    </select>
                                </FormControl>
                                <FormMessage />
                                {isEditMode && (
                                    <p className="text-xs text-muted-foreground">
                                        Category cannot be changed when editing
                                    </p>
                                )}
                            </FormItem>
                        )}
                    />

                    {/* Product Price */}
                    <FormField
                        control={form.control}
                        name="product_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        placeholder="0.00"
                                        min={0}
                                        disabled={isSubmitting}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Product Quantity */}
                    <FormField
                        control={form.control}
                        name="product_quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        placeholder="0"
                                        min={0}
                                        disabled={isSubmitting}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Commodity */}
                    <FormField
                        control={form.control}
                        name="commodity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Commodity</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Enter commodity"
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Grade (Select) */}
                    <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grade</FormLabel>
                                <FormControl>
                                    <select
                                        {...field}
                                        className="w-full border rounded p-2 dark:bg-[#2E2E2E]"
                                        aria-label="Grade select"
                                        disabled={isSubmitting}
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value as ProductGrade)}
                                    >
                                        {Object.values(ProductGrade).map((grade) => (
                                            <option key={grade} value={grade}>
                                                {grade}
                                            </option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Tire-Specific Fields */}
                    {categoryValue === "tire" && (
                        <>
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-4">Tire Information</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="tire_size"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tire Size *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., 205/55 R16"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tire_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tire Type *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., All-season, Performance"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="load_index"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Load Index *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., 91"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="speed_rating"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Speed Rating *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., H"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="warranty_period"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Warranty Period</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., 1 year, 6 months"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {/* Bale-Specific Fields */}
                    {categoryValue === "bale" && (
                        <>
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-4">Bale Information</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="bale_weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bale Weight (kg) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                {...field}
                                                placeholder="e.g., 55"
                                                min={0}
                                                disabled={isSubmitting}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bale_category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bale Category *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., Winter Jackets, Children's Clothes"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="origin_country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Origin Country *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., UK, USA, Germany"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="import_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Import Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bale_count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bale Count (pieces)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                placeholder="e.g., 50"
                                                min={1}
                                                disabled={isSubmitting}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {/* Branches (Checkboxes) */}
                    <Controller
                        name="branch_ids"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Available In Branches</FormLabel>
                                <div className="flex flex-col gap-2 max-h-48 overflow-auto border rounded p-2">
                                    {isLoadingBranches ? (
                                        <p className="text-sm text-gray-500">Loading branches...</p>
                                    ) : branches.length === 0 ? (
                                        <p className="text-sm text-gray-500">No branches available</p>
                                    ) : (
                                        branches.map((branch) => (
                                            <label
                                                key={branch.id}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={field.value?.includes(branch.id) || false}
                                                    onCheckedChange={(checked) =>
                                                        handleBranchChange(branch.id, checked as boolean, field)
                                                    }
                                                    disabled={isSubmitting}
                                                />
                                                {branch.branch_name} ({branch.branch_location})
                                            </label>
                                        ))
                                    )}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit Button - Enhanced for debugging */}
                    <div className="space-y-2">
                        {/* <Button
                            type="submit"
                            disabled={isSubmitting || isLoadingBranches}
                            className="w-full"
                        >
                            {isSubmitting
                                ? (isEditMode ? "Updating..." : "Saving...")
                                : (isEditMode ? "Update Product" : "Save Product")
                            }
                        </Button> */}
                        {/* Force submit button for testing */}
                        <Button
                            type="button"
                            onClick={() => {
                                console.log("Force submit clicked");
                                const values = form.getValues();
                                console.log("Current values:", values);
                                onSubmit(values);
                            }}
                            className="w-full bg-[#1D1D1D] text-white hover:bg-gray-200 dark:bg-white dark:text-[#101010]"
                            disabled={form.formState.isSubmitting}
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}