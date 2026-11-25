import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { MEDIA, STATES, validateEntry } from './lib/garden.ts';

const works = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    medium: z.array(z.enum(MEDIA)).min(1),
    planted: z.coerce.date(),
    links: z
      .object({ live: z.url().optional(), source: z.url().optional() })
      .optional(),
  }),
});

// A Work's State is not stored on the Work: it is derived from its Log entries (ADR 0002).
const log = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/log' }),
  schema: z
    .object({
      date: z.coerce.date(),
      work: reference('works').optional(),
      state: z.enum(STATES).optional(),
      waitingOn: z.string().optional(),
    })
    .superRefine((e, ctx) => {
      const problem = validateEntry({ work: e.work?.id, state: e.state, waitingOn: e.waitingOn });
      if (problem) ctx.addIssue({ code: 'custom', message: problem });
    }),
});

export const collections = { works, log };
