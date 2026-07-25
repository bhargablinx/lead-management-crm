import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import healthRouter from "./routes/health.route.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

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

app.use(errorHandler)

export default app;
