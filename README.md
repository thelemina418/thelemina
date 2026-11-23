# thelemina.dev

The garden of Thelemina. Astro + MDX, deployed on Vercel. Domain language lives in [GLOSSARY.md](GLOSSARY.md); decisions in [docs/adr](docs/adr).

```sh
npm install
npm run dev      # http://127.0.0.1:4321
npm test         # Garden rules (node:test)
npm run check    # types + content schemas
npm run log -- flowsynth "grid pulses now"
npm run log -- flowsynth --state on-ice --waiting "a free weekend"
```

- **Works**: `src/content/works/<id>.md`. The body is the Work's page.
- **Log entries**: `src/content/log/*.md`. A `state:` in an entry changes its Work's State (ADR 0002).
