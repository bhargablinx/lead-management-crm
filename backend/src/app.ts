import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import healthRouter from "./routes/health.route.js";
import authRouter from "./routes/auth.route.js";
import organizationRouter from "./routes/organization.route.js";
import userRouter from "./routes/user.route.js";
import leadRouter from "./routes/lead.route.js";
import noteRouter from "./routes/note.route.js";
import activityRouter from "./routes/activity.route.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app: Express = express();

app.use(
    cors({
        origin: process.env.CORS?.split(","),
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

// ROUTERS
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/leads", leadRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/activities", activityRouter);

app.use(errorHandler)

export default app;
