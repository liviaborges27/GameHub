import type { ProductDTO } from "@/dto/ProductDTO";
import { apiRequest } from "@/fetch/api";

export interface ProductFilters {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductListResponse {
  items: ProductDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort) params.set("sort", filters.sort);

  return apiRequest<ProductDTO[]>(`/products?${params.toString()}`);
}

export function createProduct(product: Omit<ProductDTO, "id">) {
  return apiRequest<ProductDTO>("/products", {
    method: "POST",
    body: JSON.stringify(product)
  });
}

export function deleteProduct(id: number) {
  return apiRequest<{ message: string }>(`/products/${id}`, {
    method: "DELETE"
  });
}
