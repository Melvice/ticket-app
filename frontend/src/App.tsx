import { useState } from 'react';
import './App.css';
import { useTickets } from './hooks/useTickets';
import { TicketForm } from './components/TicketForm';
import { TicketList } from './components/TicketList';
import { updateTicketStatus, deleteTicket} from './api/tickets';
import { Ticket } from './types';

export default function App() {
  const { tickets, isLoading, error, reload, addTicket, replaceTicket, removeTicket } = useTickets();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleToggleStatus(ticket: Ticket) {
    const next = ticket.status === 'open' ? 'closed' : 'open';
    setUpdatingId(ticket.id);
    try {
      const updated = await updateTicketStatus(ticket.id, next);
      replaceTicket(updated);
    } catch {
      // En cas d'echec, on resynchronise avec le backend pour rester coherent.
      await reload();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteTicket(id: string) {
    setUpdatingId(id);
    try {
      await deleteTicket(id);
      removeTicket(id);
    } catch {
      // En cas d'echec, on resynchronise avec le backend pour rester coherent.
      await reload();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="app">
      <h1>Gestion de tickets</h1>

      <TicketForm onCreated={addTicket} />

      <section className="tickets">
        <div className="tickets__header">
          <h2>Tickets ({tickets.length})</h2>
          <button className="link" onClick={reload} disabled={isLoading}>
            Rafraichir
          </button>
        </div>

        {/* Etat : chargement */}
        {isLoading && <p className="loading">Chargement des tickets…</p>}

        {/* Etat : erreur de chargement */}
        {!isLoading && error && (
          <div className="error-block" role="alert">
            <p>{error}</p>
            <button onClick={reload}>Reessayer</button>
          </div>
        )}

        {/* Etat : donnees chargees*/}
        {!isLoading && !error && (
          <TicketList
            tickets={tickets}
            updatingId={updatingId}
            onToggleStatus={handleToggleStatus}
            onDeleteTicket={handleDeleteTicket}
          />
        )}
      </section>
    </main>
  );
}
