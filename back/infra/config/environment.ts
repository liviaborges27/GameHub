import "dotenv/config";

export const environment = {
  port: Number(process.env.PORT ?? 3001),
  frontendOrigins: (process.env.FRONTEND_URL ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET ?? "local-development-only-secret",
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/gamehub"
};
