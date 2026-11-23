import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stateOf, validateEntry, byNewest, type LogEvent } from '../src/lib/garden.ts';

const d = (s: string) => new Date(s);

test('a Work with no State changes is a Seed', () => {
  assert.deepEqual(stateOf('flowsynth', []), { state: 'seed', since: null });
});

test('the latest State change wins, regardless of file order', () => {
  const entries: LogEvent[] = [
    { id: 'b', date: d('2026-12-08'), work: 'flowsynth', state: 'on-ice', waitingOn: 'Lem Reader updates' },
    { id: 'a', date: d('2026-11-23'), work: 'flowsynth', state: 'growing' },
    { id: 'c', date: d('2026-12-09'), work: 'flowsynth' }, // plain note, no State change
    { id: 'd', date: d('2026-12-10'), work: 'lem-reader', state: 'living' },
  ];
  assert.deepEqual(stateOf('flowsynth', entries), {
    state: 'on-ice',
    since: d('2026-12-08'),
    waitingOn: 'Lem Reader updates',
  });
});

test('newest first, stable on equal dates', () => {
  const same = d('2026-11-23');
  const ids = byNewest([
    { id: 'a', date: same },
    { id: 'b', date: same },
    { id: 'c', date: d('2026-11-24') },
  ]).map((e) => e.id);
  assert.deepEqual(ids, ['c', 'b', 'a']);
});

test('On ice requires a Waiting on note, and only On ice may have one', () => {
  assert.match(validateEntry({ work: 'x', state: 'on-ice' })!, /Waiting on/);
  assert.equal(validateEntry({ work: 'x', state: 'on-ice', waitingOn: 'a free weekend' }), null);
  assert.match(validateEntry({ work: 'x', state: 'growing', waitingOn: 'nope' })!, /only belongs/);
});

test('a State change must belong to a Work', () => {
  assert.match(validateEntry({ state: 'growing' })!, /belong to a Work/);
  assert.equal(validateEntry({}), null);
});
