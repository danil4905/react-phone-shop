import { z } from "zod";
import {
  BrandSchema,
  CategorySchema,
  OrderSchema,
  PhoneSchema,
  UserSchema,
  type Brand,
  type Category,
  type Order,
  type Phone,
  type User,
} from "@repo/shared";
import { readJsonFile, writeJsonFile } from "./files";

const BrandsSchema = z.array(BrandSchema);
const CategoriesSchema = z.array(CategorySchema);
const PhonesSchema = z.array(PhoneSchema);
const UsersSchema = z.array(UserSchema);
const OrdersSchema = z.array(OrderSchema);

export function getBrands() {
  return readJsonFile<Brand[]>("brands.json", [], BrandsSchema);
}

export function saveBrands(brands: Brand[]) {
  return writeJsonFile("brands.json", brands, BrandsSchema);
}

export function getCategories() {
  return readJsonFile<Category[]>("categories.json", [], CategoriesSchema);
}

export function saveCategories(categories: Category[]) {
  return writeJsonFile("categories.json", categories, CategoriesSchema);
}

export function getPhones() {
  return readJsonFile<Phone[]>("phones.json", [], PhonesSchema);
}

export function savePhones(phones: Phone[]) {
  return writeJsonFile("phones.json", phones, PhonesSchema);
}

export function getUsers() {
  return readJsonFile<User[]>("users.json", [], UsersSchema);
}

export function saveUsers(users: User[]) {
  return writeJsonFile("users.json", users, UsersSchema);
}

export function getOrders() {
  return readJsonFile<Order[]>("orders.json", [], OrdersSchema);
}

export function saveOrders(orders: Order[]) {
  return writeJsonFile("orders.json", orders, OrdersSchema);
}

export async function warmupStore() {
  await Promise.all([getBrands(), getCategories(), getPhones(), getUsers(), getOrders()]);
}
