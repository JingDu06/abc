import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", router);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to PETTO Shop & Spa API" });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

export default app;
