import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { ticketStore } from '../src/store';

const app = createApp();

// On repart d'un jeu de donnees propre avant chaque test.
beforeEach(() => {
  ticketStore.reset();
});

describe('GET /api/tickets', () => {
  it('retourne la liste des tickets initiaux', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('filtre par titre via ?search', async () => {
    const res = await request(app).get('/api/tickets?search=Ticket 2');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title.toLowerCase()).toContain('ticket 2');
  });

  it('ignore la casse et les espaces du terme de recherche', async () => {
    const res = await request(app).get('/api/tickets?search=  TICKET 1  ');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Ticket 1');
  });

  it('retourne un tableau vide si aucun ticket ne correspond', async () => {
    const res = await request(app).get('/api/tickets?search=inexistant');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/tickets', () => {
  it('cree un ticket avec un titre valide (201)', async () => {
    const res = await request(app).post('/api/tickets').send({ title: 'Nouveau bug' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Nouveau bug', status: 'open' });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  it('refuse un titre vide (400)', async () => {
    const res = await request(app).post('/api/tickets').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('refuse une requete sans titre (400)', async () => {
    const res = await request(app).post('/api/tickets').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('refuse un titre de plus de 200 caracteres (400)', async () => {
    const res = await request(app).post('/api/tickets').send({ title: 'a'.repeat(201) });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('supprime les espaces superflus du titre', async () => {
    const res = await request(app).post('/api/tickets').send({ title: '  Espaces autour  ' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Espaces autour');
  });

  it('ajoute le nouveau ticket en tete de liste', async () => {
    await request(app).post('/api/tickets').send({ title: 'Dernier arrive' });
    const res = await request(app).get('/api/tickets');
    expect(res.body[0].title).toBe('Dernier arrive');
  });
});

describe('PATCH /api/tickets/:id', () => {
  it('renvoie 404 pour un id inexistant', async () => {
    const res = await request(app).patch('/api/tickets/inexistant').send({ status: 'closed' });
    expect(res.status).toBe(404);
  });

  it('met a jour le statut d\'un ticket existant (200)', async () => {
    const list = await request(app).get('/api/tickets');
    const ticket = list.body.find((t: { status: string }) => t.status === 'open');

    const res = await request(app).patch(`/api/tickets/${ticket.id}`).send({ status: 'closed' });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ticket.id);
    expect(res.body.status).toBe('closed');
  });

  it('permet de rouvrir un ticket ferme', async () => {
    const list = await request(app).get('/api/tickets');
    const ticket = list.body.find((t: { status: string }) => t.status === 'closed');

    const res = await request(app).patch(`/api/tickets/${ticket.id}`).send({ status: 'open' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('open');
  });

  it('refuse un statut invalide (400)', async () => {
    const list = await request(app).get('/api/tickets');
    const ticket = list.body[0];

    const res = await request(app).patch(`/api/tickets/${ticket.id}`).send({ status: 'archived' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('refuse une requete sans statut (400)', async () => {
    const list = await request(app).get('/api/tickets');
    const ticket = list.body[0];

    const res = await request(app).patch(`/api/tickets/${ticket.id}`).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('DELETE /api/tickets/:id', () => {
  it('supprime un ticket existant (204)', async () => {
    const list = await request(app).get('/api/tickets');
    const ticket = list.body[0];

    const res = await request(app).delete(`/api/tickets/${ticket.id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get('/api/tickets');
    expect(after.body.find((t: { id: string }) => t.id === ticket.id)).toBeUndefined();
  });

  it('reduit le nombre de tickets d\'une unite apres suppression', async () => {
    const before = await request(app).get('/api/tickets');
    const ticket = before.body[0];

    await request(app).delete(`/api/tickets/${ticket.id}`);

    const after = await request(app).get('/api/tickets');
    expect(after.body.length).toBe(before.body.length - 1);
  });

  it('renvoie 404 pour un id inexistant', async () => {
    const res = await request(app).delete('/api/tickets/inexistant');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
