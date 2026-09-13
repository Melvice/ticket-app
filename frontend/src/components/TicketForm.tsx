import { SubmitEvent, useState } from 'react';
import { Ticket } from '../types';
import { createTicket } from '../api/tickets';

interface TicketFormProps {
  onCreated: (ticket: Ticket) => void;
}

export function TicketForm({ onCreated }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setError(null);

    // Validation cote client
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Le titre est obligatoire.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await createTicket(trimmed);
      onCreated(ticket);
      setTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <label htmlFor="title">Nouveau ticket</label>
      <div className="ticket-form__row">
        <input
          id="title"
          type="text"
          value={title}
          placeholder="Titre du ticket"
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting || title.trim() === ''}>
          {isSubmitting ? 'Creation…' : 'Creer'}
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
