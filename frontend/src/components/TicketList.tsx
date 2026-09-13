import { Ticket } from "../types";

interface TicketListProps {
  tickets: Ticket[];
  updatingId: string | null;
  onToggleStatus: (ticket: Ticket) => void;
  onDeleteTicket: (id: string) => void;
}

const dateFormatter = new Intl.DateTimeFormat("fr-CA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function TicketList({
  tickets,
  updatingId,
  onToggleStatus,
  onDeleteTicket,
}: TicketListProps) {
  if (tickets.length === 0) {
    return <p className="empty">Aucun ticket pour le moment.</p>;
  }

  return (
    <ul className="ticket-list">
      {tickets.map((ticket) => (
        <li key={ticket.id} className="ticket">
          <div className="ticket__main">
            <span className="ticket__title">{ticket.title}</span>
            <span className={`badge badge--${ticket.status}`}>
              {ticket.status === "open" ? "Ouvert" : "Ferme"}
            </span>
          </div>
          <div className="ticket__meta">
            <time
              className="ticket__date"
              dateTime={new Date(ticket.createdAt).toISOString()}
            >
              {dateFormatter.format(new Date(ticket.createdAt))}
            </time>
            <button
              className="link"
              onClick={() => onToggleStatus(ticket)}
              disabled={updatingId === ticket.id}
            >
              {updatingId === ticket.id
                ? "Mise a jour…"
                : ticket.status === "open"
                  ? "Marquer ferme"
                  : "Rouvrir"}
            </button>
            <button
              className="link link--danger"
              onClick={() => onDeleteTicket(ticket.id)}
              disabled={updatingId === ticket.id}
            >
              {updatingId === ticket.id ? "Suppression…" : "Supprimer"}
            </button>
          </div>
          <div className="ticket__footer">
            <span className="ticket__id">ID: {ticket.id}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
