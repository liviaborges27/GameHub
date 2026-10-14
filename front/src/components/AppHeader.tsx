"use client";

import Link from "next/link";
import { useAuth } from "@/utils/useAuth";

export function AppHeader() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <Link href="/" className="brand">GameHub</Link>
      <nav>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/products">Produtos</Link>
        {isAuthenticated ? (
          <button type="button" className="button button--danger" onClick={logout}>
            Sair
          </button>
        ) : (
          <Link href="/login">Entrar</Link>
        )}
      </nav>
    </header>
  );
}
