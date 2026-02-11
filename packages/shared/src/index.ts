import { z } from "zod";

export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export type Brand = z.infer<typeof BrandSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

export const PhoneSpecSchema = z.object({
  ram: z.number().int().min(1),
  storage: z.number().int().min(1),
  display: z.string(),
  battery: z.number().int().min(1000),
  camera: z.string().optional(),
  os: z.string().optional(),
});

export type PhoneSpec = z.infer<typeof PhoneSpecSchema>;

export const PhoneSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number().nonnegative(),
  imageUrl: z.string(),
  rating: z.number().min(0).max(5).optional(),
  stock: z.number().int().nonnegative(),
  specs: PhoneSpecSchema,
  tags: z.array(z.string()).optional(),
  createdAt: z.string(),
});

export type Phone = z.infer<typeof PhoneSchema>;

export const OrderItemInputSchema = z.object({
  phoneId: z.string(),
  quantity: z.number().int().min(1),
});

export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemInputSchema).min(1),
});

export type CreateOrder = z.infer<typeof CreateOrderSchema>;

export const OrderLineSchema = z.object({
  phoneId: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().nonnegative(),
  lineTotal: z.number().nonnegative(),
});

export type OrderLine = z.infer<typeof OrderLineSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(OrderLineSchema),
  total: z.number().nonnegative(),
  createdAt: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  passwordHash: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const UserPublicSchema = UserSchema.omit({ passwordHash: true });
export type UserPublic = z.infer<typeof UserPublicSchema>;

export const AuthCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;

export const RegisterSchema = AuthCredentialsSchema.extend({
  name: z.string().min(2).max(50).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const FiltersSchema = z.object({
  price: z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
  }),
  ram: z.array(z.number().int()),
  storage: z.array(z.number().int()),
  brands: z.array(BrandSchema),
  categories: z.array(CategorySchema),
});

export type Filters = z.infer<typeof FiltersSchema>;

export type PaginatedResult<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
};
