const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3001/api" : "")
).trim().replace(/\/+$/, "");

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("Configure NEXT_PUBLIC_API_URL antes de gerar o build do frontend.");
  }

  const token = typeof window !== "undefined"
    ? window.localStorage.getItem("gamehub-token")
    : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? "Não foi possível concluir a requisição.");
  }

  return response.json() as Promise<T>;
}
