import express from "express";
import cors from "cors";
import { ticketsRouter } from "./routes/tickets";

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.status(200).json({ status: "ok" });
    });

    app.use("/api/tickets", ticketsRouter);
    // Middleware pour gérer les routes non trouvées
    app.use((req, res) => {
        res.status(404).json({ error: "Route non trouvée" });
    });

    return app;
}
