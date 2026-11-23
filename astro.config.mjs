import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://thelemina.dev',
  integrations: [mdx()],
  // Dev server is viewed over the tailnet: bind IPv4 loopback, allow *.ts.net.
  server: { host: '127.0.0.1' },
  vite: { server: { allowedHosts: ['.ts.net'] } },
});
