import { config } from "dotenv";

config({ path: ".env.local" });

export const PORT = Number(process.env.PORT) || 3000;
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_USER = process.env.DB_USER || "postgres";
export const DB_PORT = Number(process.env.DB_PORT) || 5432;
export const DB_DATABASE = process.env.DB_DATABASE || "dashboard_flota";
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const TOKEN_SECRET = process.env.TOKEN_SECRET;
