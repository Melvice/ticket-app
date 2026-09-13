import { randomUUID } from 'crypto';
import { Ticket, TicketStatus } from './types';

/**
 * Stockage en mémoire.
 * Les données sont réinitialisées à chaque redémarrage du serveur (voulu par l'énoncé).
 */

let tickets: Ticket[] = [];

function seedTickets(): Ticket[] {
    const makeTicket = (title: string, status: TicketStatus): Ticket => ({
        id: randomUUID(),
        title,
        status,
        createdAt: new Date(),
    });
    return [
        makeTicket("Ticket 1", "open"),
        makeTicket("Ticket 2", "closed"),
        makeTicket("Ticket 3", "open"),
    ];
}

tickets = seedTickets();

export const ticketStore = {
    list: (): Ticket[] => {
        // Retourne une copie du tableau pour éviter les modifications directes
        return [...tickets];
    },
    create: (title: string): Ticket => {
        const newTicket: Ticket = {
            id: randomUUID(),
            title,
            status: "open",
            createdAt: new Date(),
        };
        // Ajoute le nouveau ticket au début du tableau pour que les tickets récents apparaissent en premier
        tickets.unshift(newTicket);
        return newTicket;
    },

    updateStatus: (id: string, status: TicketStatus): Ticket | undefined => {
        const ticket = tickets.find((t) => t.id === id);
        if (!ticket) return undefined;
        ticket.status = status;
        return ticket;
    },

    delete: (id: string): boolean => {
        const index = tickets.findIndex((t) => t.id === id);
        if (index === -1) return false;
        tickets.splice(index, 1);
        return true;
    },

    reset: (): void => {
        tickets = seedTickets();
    },
};