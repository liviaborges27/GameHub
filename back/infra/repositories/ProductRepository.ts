import { db } from "../database/db";
import type { CreateProductDTO } from "../../src/dto/CreateProductDTO";
import type { Product } from "../../src/model/Product";

export interface ProductFilters {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description),
    category: String(row.category),
    price: Number(row.price),
    stock: Number(row.stock)
  };
}

export class ProductRepository {
  async findAll(filters: ProductFilters): Promise<ProductListResult> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    const normalizedSearch = filters.search?.trim();
    const normalizedCategory = filters.category?.trim();

    if (normalizedSearch) {
      values.push(`%${normalizedSearch}%`);
      const parameter = `$${values.length}`;
      conditions.push(`(name ILIKE ${parameter} OR description ILIKE ${parameter})`);
    }

    if (normalizedCategory) {
      values.push(normalizedCategory);
      conditions.push(`category ILIKE $${values.length}`);
    }

    if (typeof filters.minPrice === "number" && Number.isFinite(filters.minPrice)) {
      values.push(filters.minPrice);
      conditions.push(`price >= $${values.length}`);
    }

    if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
      values.push(filters.maxPrice);
      conditions.push(`price <= $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = Math.max(1, Math.min(Number(filters.limit ?? 20), 100));
    const page = Math.max(1, Number(filters.page ?? 1));
    const offset = (page - 1) * limit;

    const orderBy = (() => {
      switch (String(filters.sort ?? "name").toLowerCase()) {
        case "price":
        case "price_asc":
          return "price ASC";
        case "price_desc":
        case "-price":
          return "price DESC";
        default:
          return "name ASC";
      }
    })();

    const countSql = `SELECT COUNT(*) AS total FROM products ${where}`;
    const countResult = await db.query<{ total: string }>(countSql, values);
    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const sql = `SELECT id, name, description, category, price, stock
                 FROM products ${where}
                 ORDER BY ${orderBy}
                 LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

    const result = await db.query(sql, [...values, limit, offset]);

    return {
      items: result.rows.map(mapProduct),
      total,
      page,
      limit,
      totalPages
    };
  }

  async create(input: CreateProductDTO): Promise<Product> {
    const result = await db.query(
      `INSERT INTO products (name, description, category, price, stock)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, category, price, stock`,
      [input.name, input.description, input.category, input.price, input.stock]
    );
    return mapProduct(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    await db.query("DELETE FROM products WHERE id = $1", [id]);
  }

  async getDashboard() {
    const result = await db.query(`
      SELECT
        COUNT(*)::int AS "totalProducts",
        COUNT(*) FILTER (WHERE stock <= 5)::int AS "lowStock",
        COUNT(DISTINCT category)::int AS "categories",
        COALESCE(SUM(price * stock), 0)::numeric AS "inventoryValue"
      FROM products
    `);

    const row = result.rows[0];

    return {
      totalProducts: Number(row.totalProducts),
      lowStock: Number(row.lowStock),
      inventoryValue: Number(row.inventoryValue),
      categories: Number(row.categories)
    };
  }
}
