import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import healthRouter from "./routes/health.route.js";

const app: Express = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://localhost:3000",
        ],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

// ROUTERS
app.use("/api/v1/health", healthRouter);

export default app;
