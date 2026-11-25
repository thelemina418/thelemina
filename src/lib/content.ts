import { getCollection, type CollectionEntry } from 'astro:content';
import { byNewest, stateOf, type LogEvent, type WorkState } from './garden.ts';

export type Work = CollectionEntry<'works'> & { current: WorkState };
export type LogEntry = CollectionEntry<'log'>;

const toEvent = (e: LogEntry): LogEvent => ({
  id: e.id,
  date: e.data.date,
  work: e.data.work?.id,
  state: e.data.state,
  waitingOn: e.data.waitingOn,
});

export async function getLog(): Promise<LogEntry[]> {
  const entries = await getCollection('log');
  const order = byNewest(entries.map(toEvent)).map((e) => e.id);
  return order.map((id) => entries.find((e) => e.id === id)!);
}

export async function getGarden(): Promise<Work[]> {
  const [works, log] = await Promise.all([getCollection('works'), getCollection('log')]);
  const events = log.map(toEvent);
  return works
    .map((w) => ({ ...w, current: stateOf(w.id, events) }))
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
