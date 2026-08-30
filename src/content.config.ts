import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    series: reference('series').optional(),
    seriesOrder: z.number().int().positive().optional()
  })
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/series' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    status: z.enum(['ongoing', 'completed', 'planned']).default('ongoing'),
    volume: z.number().int().positive(),
    started: z.coerce.date(),
    updated: z.coerce.date(),
    featured: z.boolean().default(false)
  })
});

export const collections = { posts, series };
