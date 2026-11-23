// The Garden's rules, kept free of Astro so they can be tested and reused by scripts.

export const STATES = ['seed', 'growing', 'living', 'on-ice', 'fallow', 'finished'] as const;
export type State = (typeof STATES)[number];

export const STATE_LABELS: Record<State, string> = {
  seed: 'Seed',
  growing: 'Growing',
  living: 'Living',
  'on-ice': 'On ice',
  fallow: 'Fallow',
  finished: 'Finished',
};

/** Order Works are shown in on the Garden page. */
export const STATE_ORDER: readonly State[] = ['growing', 'living', 'finished', 'seed', 'on-ice', 'fallow'];

export const MEDIA = ['code', 'music', 'writing', 'video', 'art'] as const;
export type Medium = (typeof MEDIA)[number];

export interface LogEvent {
  id: string;
  date: Date;
  work?: string;
  state?: State;
  waitingOn?: string;
}

export interface WorkState {
  state: State;
  since: Date | null;
  waitingOn?: string;
}

/** Newest first; ties broken by id so ordering is stable. */
export function byNewest<T extends Pick<LogEvent, 'id' | 'date'>>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) => b.date.getTime() - a.date.getTime() || b.id.localeCompare(a.id));
}

/** A Work's State is the State set by its most recent State-changing Log entry. */
export function stateOf(workId: string, entries: readonly LogEvent[]): WorkState {
  const latest = byNewest(entries).find((e) => e.work === workId && e.state);
  if (!latest?.state) return { state: 'seed', since: null };
  return { state: latest.state, since: latest.date, waitingOn: latest.waitingOn };
}

/** Returns a problem description, or null if the Log entry is valid. */
export function validateEntry(e: Pick<LogEvent, 'work' | 'state' | 'waitingOn'>): string | null {
  if (e.state && !e.work) return 'A State change must belong to a Work.';
  if (e.state === 'on-ice' && !e.waitingOn?.trim()) return 'On ice needs a Waiting on note.';
  if (e.waitingOn && e.state !== 'on-ice') return 'Waiting on only belongs with On ice.';
  return null;
}
