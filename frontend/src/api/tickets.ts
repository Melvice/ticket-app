import { Ticket, TicketStatus } from '../types';

const API_URL = 'http://localhost:4000';

export async function fetchTickets(search?: string): Promise<Ticket[]> {
  const url = new URL('/api/tickets', API_URL);
  if (search) url.searchParams.set('search', search);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Echec du chargement des tickets (HTTP ${res.status})`);
  }
  return res.json();
}

export async function createTicket(title: string): Promise<Ticket> {
  const res = await fetch(new URL('/api/tickets', API_URL).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    // On tente d'extraire le message d'erreur renvoye par le backend (validation zod).
    let message = `Echec de la creation (HTTP ${res.status})`;
    try {
      const body = await res.json();
      if (body?.details?.title?.length) message = body.details.title[0];
      else if (body?.error) message = body.error;
    } catch {
      // corps non JSON : on garde le message par defaut.
    }
    throw new Error(message);
  }
  return res.json();
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  const res = await fetch(new URL(`/api/tickets/${id}`, API_URL).toString(), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error(`Echec de la mise a jour (HTTP ${res.status})`);
  }
  return res.json();
}

export async function deleteTicket(id: string): Promise<void> {
  const res = await fetch(new URL(`/api/tickets/${id}`, API_URL).toString(), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Echec de la suppression (HTTP ${res.status})`);
  }
}
