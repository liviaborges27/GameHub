"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import type { ProductDTO } from "@/dto/ProductDTO";
import { createProduct, deleteProduct, getProducts } from "@/fetch/productRequests";
import { measurePerformance } from "@/utils/measurePerformance";

const DEFAULT_PAGE_SIZE = 12;

export function ProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const token = window.localStorage.getItem("gamehub-token");
    if (!token) return;
    try {
      const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(encoded));
      setIsAdmin(payload.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / Math.max(limit, 1))),
    [totalItems, limit]
  );

  useEffect(() => {
    setPage(1);
  }, [search, category, minPrice, maxPrice, limit, sort]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await measurePerformance(
        "carregamento de produtos",
        () => getProducts({
          search,
          category,
          sort,
          page,
          limit,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined
        })
      );
      setProducts(result.items);
      setTotalItems(result.total);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sort, page, limit]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const productPayload = {
      name: String(data.get("name") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      category: String(data.get("category") ?? "Jogos") as ProductDTO["category"],
      price: Number(data.get("price")),
      stock: Number(data.get("stock"))
    };

    setCreating(true);
    setCreateMessage("");
    setError("");

    try {
      const createdProduct = await createProduct(productPayload);
      setProducts((currentProducts) => [createdProduct, ...currentProducts].slice(0, limit));
      setTotalItems((currentTotal) => currentTotal + 1);
      setCreateMessage("Produto cadastrado. Catálogo atualizado.");
      form.reset();
      setPage(1);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível cadastrar o produto.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Deseja excluir este produto?")) return;

    try {
      await deleteProduct(id);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
      setTotalItems((currentTotal) => Math.max(0, currentTotal - 1));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir.");
    }
  }

  const visibleProducts = products
    .filter((product) => {
      const term = search.toLowerCase();
      return (product.name.toLowerCase().includes(term) || product.description.toLowerCase().includes(term))
        && (!category || product.category === category);
    })
    .sort((a, b) => sort === "price"
      ? String(a.price).localeCompare(String(b.price))
      : a.name.localeCompare(b.name));

  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CATÁLOGO</span>
          <h1>Produtos</h1>
          <p>Pesquise e consulte o estoque da loja.</p>
        </div>
        <span className="result-count">{totalItems} produtos • página {page}/{totalPages}</span>
      </div>

      {isAdmin && (
        <form className="product-create-form" onSubmit={handleCreate}>
          <h2>Cadastrar produto</h2>
          <div className="product-create-form__grid">
            <label>Nome<input name="name" required minLength={2} maxLength={100} placeholder="Nome do produto" /></label>
            <label>Descrição<input name="description" required minLength={3} maxLength={500} placeholder="Descrição curta" /></label>
            <label>Categoria<select name="category" defaultValue="Jogos"><option value="Consoles">Consoles</option><option value="Jogos">Jogos</option><option value="Acessórios">Acessórios</option></select></label>
            <label>Preço<input name="price" type="number" min="0.01" step="0.01" required defaultValue="199.90" /></label>
            <label>Estoque<input name="stock" type="number" min="0" step="1" required defaultValue="10" /></label>
            <button className="button" disabled={creating}>{creating ? "Cadastrando..." : "Cadastrar produto"}</button>
          </div>
          {createMessage && <p className="form-success" role="status">{createMessage}</p>}
        </form>
      )}

      <div className="filters">
        <label>
          Buscar
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Nome do produto..." />
        </label>
        <label>
          Categoria
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Todas</option>
            <option value="Consoles">Consoles</option>
            <option value="Jogos">Jogos</option>
            <option value="Acessórios">Acessórios</option>
          </select>
        </label>
        <label>
          Preço mínimo
          <input type="number" min="0" step="0.01" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0,00" />
        </label>
        <label>
          Preço máximo
          <input type="number" min="0" step="0.01" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="5000" />
        </label>
        <label>
          Ordenar
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="name">Nome</option>
            <option value="price">Preço crescente</option>
            <option value="price_desc">Preço decrescente</option>
          </select>
        </label>
        <label>
          Itens por página
          <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </label>
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={loadProducts} /> : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={handleDelete} />
            ))}
            {products.length === 0 && <p>Nenhum produto encontrado.</p>}
          </div>

          {totalPages > 1 && (
            <div className="pagination" aria-label="Paginação do catálogo">
              <button type="button" disabled={page === 1} onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}>
                Anterior
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={pageNumber === page ? "active" : ""}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button type="button" disabled={page === totalPages} onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}>
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProductsPage;
