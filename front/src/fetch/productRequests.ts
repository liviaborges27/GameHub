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
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (typeof filters.minPrice === "number" && Number.isFinite(filters.minPrice)) params.set("minPrice", String(filters.minPrice));
  if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) params.set("maxPrice", String(filters.maxPrice));

  const payload = await apiRequest<unknown>(`/products?${params.toString()}`);
  const fallbackPage = filters.page ?? 1;
  const fallbackLimit = filters.limit ?? 12;

  if (Array.isArray(payload)) {
    const total = payload.length;
    return {
      items: payload as ProductDTO[],
      total,
      page: fallbackPage,
      limit: fallbackLimit,
      totalPages: Math.max(1, Math.ceil(total / fallbackLimit))
    };
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("A API retornou uma resposta inválida para o catálogo.");
  }

  const response = payload as Record<string, unknown>;
  const items = Array.isArray(response.items)
    ? response.items
    : Array.isArray(response.products)
      ? response.products
      : Array.isArray(response.data)
        ? response.data
        : null;

  if (!items) {
    throw new Error("A resposta da API não contém uma lista de produtos.");
  }

  const page = Number(response.page ?? fallbackPage);
  const limit = Number(response.limit ?? fallbackLimit);
  const total = Number(response.total ?? response.totalCount ?? items.length);
  const validPage = Number.isFinite(page) && page > 0 ? page : fallbackPage;
  const validLimit = Number.isFinite(limit) && limit > 0 ? limit : fallbackLimit;
  const validTotal = Number.isFinite(total) && total >= 0 ? total : items.length;

  return {
    items: items as ProductDTO[],
    total: validTotal,
    page: validPage,
    limit: validLimit,
    totalPages: Math.max(
      1,
      Number(response.totalPages) || Math.ceil(validTotal / validLimit)
    )
  };
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
