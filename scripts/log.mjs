#!/usr/bin/env node
// Post a Log entry: writes the file, commits it, and pushes.
//
//   npm run log -- <work|-> "what happened" [--state <state>] [--waiting "what it waits on"] [--no-push]
//
// Use "-" for a note that belongs to no Work.
import { existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { STATES, validateEntry } from '../src/lib/garden.ts';

const usage = 'Usage: npm run log -- <work|-> "text" [--state <state>] [--waiting "..."] [--no-push]';
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    state: { type: 'string' },
    waiting: { type: 'string' },
    'no-push': { type: 'boolean', default: false },
  },
});
const fail = (msg) => {
  console.error(`${msg}\n${usage}`);
  process.exit(1);
};

const [workArg, ...rest] = positionals;
const text = rest.join(' ').trim();
if (!workArg) fail('Name a Work (or "-").');
const work = workArg === '-' ? undefined : workArg;
if (work && !['md', 'mdx'].some((ext) => existsSync(`src/content/works/${work}.${ext}`))) {
  fail(`No Work called "${work}" in src/content/works/.`);
}
const state = values.state;
if (state && !STATES.includes(state)) fail(`State must be one of: ${STATES.join(', ')}.`);
const problem = validateEntry({ work, state, waitingOn: values.waiting });
if (problem) fail(problem);
if (!text && !state) fail('Say something, or change a State.');

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const offset = -now.getTimezoneOffset();
const tz = `${offset >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

const front = [`date: ${day}T${time}${tz}`];
if (work) front.push(`work: ${work}`);
if (state) front.push(`state: ${state}`);
if (values.waiting) front.push(`waitingOn: ${JSON.stringify(values.waiting)}`);

const file = `src/content/log/${day}-${work ?? 'note'}-${time.replaceAll(':', '')}.md`;
writeFileSync(file, `---\n${front.join('\n')}\n---\n${text ? `\n${text}\n` : ''}`);
console.log(`Wrote ${file}`);

const subject = text.split('\n')[0].slice(0, 60) || `${work} → ${state}`;
execFileSync('git', ['add', file], { stdio: 'inherit' });
execFileSync('git', ['commit', '-q', '-m', `log(${work ?? 'note'}): ${subject}`], { stdio: 'inherit' });
if (!values['no-push']) execFileSync('git', ['push', '-q'], { stdio: 'inherit' });
