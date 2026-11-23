import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getEntry } from 'astro:content';
import { getLog } from '../lib/content.ts';
import { STATE_LABELS } from '../lib/garden.ts';

export async function GET(context: APIContext) {
  const log = await getLog();
  const items = await Promise.all(
    log.map(async (entry) => {
      const work = entry.data.work ? await getEntry(entry.data.work) : undefined;
      const change = entry.data.state ? ` is now ${STATE_LABELS[entry.data.state]}` : '';
      return {
        title: work ? `${work.data.title}${change}` : 'Note',
        pubDate: entry.data.date,
        link: work ? `/works/${work.id}#${entry.id}` : `/log#${entry.id}`,
        description: entry.body?.trim() || undefined,
      };
    }),
  );
  return rss({
    title: "Thelemina's log",
    description: 'What is growing in the garden of Thelemina.',
    site: context.site!,
    items,
  });
}
