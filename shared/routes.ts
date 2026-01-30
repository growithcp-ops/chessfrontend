import { z } from 'zod';
import { insertGameSchema, games } from './schema';

export const api = {
  games: {
    list: {
      method: 'GET' as const,
      path: '/api/games',
      responses: {
        200: z.array(z.custom<typeof games.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/games',
      input: insertGameSchema,
      responses: {
        201: z.custom<typeof games.$inferSelect>(),
      },
    },
  },
};
