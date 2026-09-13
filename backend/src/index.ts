import express from "express";
import cors from "cors";
import { ticketStore } from "./store";
import { ticketsRouter } from "./routes/tickets";

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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});