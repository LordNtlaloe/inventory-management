import * as z from "zod";


export const LoginSchema = z.object({
  email: z.string()
    .email({ message: "Email Is Required" })
    .transform(val => val.trim().toLowerCase()),
  password: z.string({ message: "Password Is Required" })
})

export const SignUpSchema = z.object({
  first_name: z.string({ message: "First Name Is Required" }),
  last_name: z.string({ message: "Last Name Is Required" }),
  phone_number: z.string({ message: "Phone Number Is Required" }),
  email: z.string().email({ message: "Email Is Required" }),
  password: z.string({ message: "Password Is Required" }),
  role: z.string()
})

export const PasswordResetSchema = z.object({
  email: z.string().email({ message: "Email Is Required" }),
})

export const NewPasswordSchema = z.object({
  password: z.string().min(6, { message: "Email Is Required" }),
})

export const UpdatePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  password_confirmation: z.string().min(1, "Password confirmation is required")
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"]
});

export const BranchSchema = z.object({
  branch_name: z
    .string({ message: "Branch name is required" })
    .min(2, { message: "Branch name must be at least 2 characters" }),
  branch_location: z
    .string({ message: "Please select a location" })
    .min(1, { message: "Please select a location" }),
});

export enum ProductType {
  TIRE = "tire",
  BALE = "bale"
}

export enum TyreGrade {
  A = "A",
  B = "B",
  C = "C"
}

// Base schema with common fields
export const ProductSchema = z.object({
  product_name: z
    .string({ message: "Product name is required" })
    .min(2, { message: "Product name must be at least 2 characters" }),
  product_price: z
    .number({ message: "Product price is required" })
    .nonnegative({ message: "Price must be 0 or greater" }),
  product_quantity: z
    .number({ message: "Product quantity is required" })
    .int({ message: "Quantity must be an integer" })
    .nonnegative({ message: "Quantity must be 0 or greater" }),
  category: z
    .string({ message: "Category is required" })
    .min(1, { message: "Category is required" }),
  product_type: z.nativeEnum(ProductType),
  commodity: z
    .string({ message: "Commodity is required" })
    .min(1, { message: "Commodity is required" }),
  branch_ids: z
    .array(z.string())
    .min(1, { message: "Select at least one branch" }),
  grade: z.enum(["A", "B", "C"]),

  // Optional tire fields
  tire_size: z.string().optional(),
  tire_type: z.string().optional(),
  load_index: z.string().optional(),
  speed_rating: z.string().optional(),
  warranty_period: z.string().optional(),

  // Optional bale fields
  bale_weight: z.number().positive().optional(),
  bale_category: z.string().optional(),
  origin_country: z.string().optional(),
  import_date: z.date().optional(),
  bale_count: z.number().int().positive().optional(),
}).refine((data) => {
  // Validate tire-specific required fields
  if (data.category === "tire") {
    return !!(data.tire_size && data.tire_type && data.load_index && data.speed_rating);
  }
  // Validate bale-specific required fields
  if (data.category === "bale") {
    return !!(data.bale_weight && data.bale_category && data.origin_country);
  }
  return true;
}, {
  message: "Missing required fields for the selected category",
});

export type ProductFormValues = z.infer<typeof ProductSchema>;