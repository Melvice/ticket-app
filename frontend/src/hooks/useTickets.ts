import { useCallback, useEffect, useState } from 'react';
import { Ticket } from '../types';
import { fetchTickets } from '../api/tickets';

interface UseTicketsResult {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addTicket: (ticket: Ticket) => void;
  replaceTicket: (ticket: Ticket) => void;
  deleteTicket: (id: string) => void;
}

/**
 * Regroupe l'etat de la liste (chargement / erreur / donnees) au meme endroit.
 * Choix volontaire : pas de librairie type React Query, pour rester simple et ne pas introduire de complexite inutile.
 */
export function useTickets(): UseTicketsResult {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Mise a jour locale apres creation : evite un rechargement complet de la liste.
  const addTicket = useCallback((ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  }, []);

  const replaceTicket = useCallback((updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const deleteTicket = useCallback((id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tickets, isLoading, error, reload, addTicket, replaceTicket, deleteTicket };
}
