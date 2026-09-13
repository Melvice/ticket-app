export type TicketStatus = 'open' | 'closed';

export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  createdAt: Date;
}
