import { Router } from 'express';
import { ticketStore } from '../store';
import { z } from 'zod';

export const ticketsRouter = Router();

// validation des données d'entrée pour la création d'un ticket. 
// TypeScript ne valide pas les types à l'exécution, donc on utilise zod pour s'assurer que les données reçues par l'API sont conformes aux attentes.
const createTicketSchema = z.object({
    title: z
        .string({ message: "Le titre est obligatoire" })
        .trim()
        .min(1, { message: "Le titre ne peut pas être vide" })
        .max(200, { message: "Le titre ne peut pas dépasser 200 caractères" }),
});

const updateTicketStatusSchema = z.object({
    status: z.enum(['open', 'closed']),
});

// POST /api/tickets - Crée un nouveau ticket
ticketsRouter.post('/', (req, res) => {
    const parsed = createTicketSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Données invalides",
            details: parsed.error.flatten().fieldErrors
        });
    }
    const tickets = ticketStore.create(parsed.data.title);
    res.status(201).json(tickets);
});

// GET /api/tickets?search=<search_term> - Récupère la liste des tickets
ticketsRouter.get('/', (req, res) => {
    const searchTerm = req.query.search;
    const search = typeof searchTerm === 'string' ? searchTerm.trim().toLowerCase() : '';
    let result = ticketStore.list();
    if (search) {
        result = result.filter((t) => t.title.toLowerCase().includes(search));
    }
    res.status(200).json(result);
});

// PATCH /api/tickets/:id - Met à jour le statut d'un ticket
ticketsRouter.patch('/:id', (req, res) => {
    const parsed = updateTicketStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Données invalides",
            details: parsed.error.flatten().fieldErrors
        });
    }
    const updatedTicket = ticketStore.updateStatus(req.params.id, parsed.data.status);
    if (!updatedTicket) {
        return res.status(404).json({ error: "Ticket non trouvé" });
    }
    return res.status(200).json(updatedTicket);
});

// DELETE /api/tickets/:id - Supprime un ticket
ticketsRouter.delete('/:id', (req, res) => {
    const success = ticketStore.delete(req.params.id);
    if (!success) {
        return res.status(404).json({ error: "Ticket non trouvé" });
    }
    return res.status(204).send();
});
