import express from "express";
import cors from "cors";
import authRoutes from "../infra/routes/authRoutes";
import productRoutes from "../infra/routes/productRoutes";
import dashboardRoutes from "../infra/routes/dashboardRoutes";
import { requestLogger } from "../infra/middlewares/requestLogger";
import { errorHandler } from "../infra/middlewares/errorHandler";
import { environment } from "../infra/config/environment";

export const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(requestLogger);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", application: "GameHub API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((_request, response) => {
  response.status(404).json({ message: "Rota não encontrada." });
});

app.use(errorHandler);
