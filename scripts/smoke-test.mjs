/**
 * Production smoke test.
 *
 * Starts `next start` on a spare port, requests every demo state over HTTP and
 * asserts on the rendered markup and the compiled stylesheet. Run it after a
 * build:  npm run build && npm run smoke
 */
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const PORT = Number(process.env.SMOKE_PORT ?? 4321);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const NEXT_CLI = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));

const PAGE_CHECKS = [
  {
    name: 'On-time order (baseline)',
    path: '/?scenario=on_time',
    expect: ['Your order arrives today', 'Delivery progress', 'RVX-48213', 'Out for delivery'],
  },
  {
    name: 'Delayed order',
    path: '/?scenario=delayed',
    expect: [
      'Your delivery is running late',
      'Revised estimate',
      'Why is it late?',
      'Get help with this delay',
      'RVX-47988',
    ],
  },
  {
    name: 'Delivered but not received',
    path: '/?scenario=delivered_not_received',
    expect: [
      'Delivered, but not received',
      'ISS-48213',
      'Report a delivery issue',
      'Nothing is resolved yet',
      'RVX-48102',
    ],
  },
  {
    name: 'Tracking not available yet',
    path: '/?scenario=tracking_unavailable',
    expect: [
      'Tracking is not available yet',
      'Tracking number not issued yet',
      'Notify me when tracking is live',
      'Awaiting dispatch',
      'RVX-48309',
    ],
  },
  {
    name: 'Loading state',
    path: '/?scenario=loading',
    expect: ['Loading tracking updates', 'Loading your tracking updates'],
  },
  {
    name: 'Error state',
    path: '/?scenario=error',
    expect: ['We could not load your tracking updates', 'Try again', 'Contact support'],
  },
  {
    name: 'Not found (empty) state',
    path: '/?scenario=not_found',
    expect: ['We cannot find that order', 'Sample orders', 'RVX-48213'],
  },
  {
    name: 'Unknown scenario falls back to the default',
    path: '/?scenario=does-not-exist',
    expect: ['Your order arrives today', 'Order tracking'],
  },
  {
    name: 'Default route renders the screen',
    path: '/',
    expect: ['Order tracking', 'Need help with this order?', 'Demo states'],
  },
];

/** Utilities that are easy to typo; their absence would break layout/a11y. */
const CSS_CHECKS = [
  { needle: 'max-width:440px', label: 'mobile column width' },
  { needle: 'overflow-x:clip', label: 'horizontal overflow guard' },
  { needle: ':has(:checked)', label: 'radio/checkbox card highlighting' },
  { needle: 'animation:var(--animate-shimmer)', label: 'skeleton shimmer' },
  {
    needle: 'min-height:calc(var(--spacing) * 11)',
    label: '44px touch targets (min-h-11 = 2.75rem)',
  },
  { needle: 'dvh', label: 'dynamic viewport height' },
];

/**
 * Markup-level accessibility sanity checks. They are intentionally simple and
 * run against the server-rendered HTML of every state.
 */
const A11Y_CHECKS = [
  {
    label: 'exactly one h1 per page',
    test: (html) => (html.match(/<h1[\s>]/g) ?? []).length === 1,
  },
  { label: 'main landmark present', test: (html) => html.includes('<main') },
  {
    label: 'polite live region for feedback',
    test: (html) => html.includes('aria-live="polite"'),
  },
  {
    label: 'every image has an alt attribute',
    test: (html) => (html.match(/<img[\s>]/g) ?? []).length === (html.match(/alt="/g) ?? []).length,
  },
  {
    label: 'icon-only controls expose an aria-label',
    test: (html) => !/<button(?![^>]*aria-label)[^>]*>\s*<svg/.test(html),
  },
];

function startServer() {
  /* Spawning the Next CLI with the current Node binary keeps the test
     dependency-free and avoids Windows .cmd quirks. */
  return spawn(process.execPath, [NEXT_CLI, 'start', '--port', String(PORT)], {
    stdio: 'ignore',
    env: { ...process.env, NODE_ENV: 'production' },
  });
}

function stopServer(server) {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }
  server.kill('SIGTERM');
}

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE_URL, { redirect: 'manual' });
      if (response.status < 500) return true;
    } catch {
      /* server not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Server did not answer on ${BASE_URL} within ${timeoutMs}ms`);
}

async function run() {
  const server = startServer();
  const failures = [];

  try {
    await waitForServer();

    for (const check of PAGE_CHECKS) {
      const response = await fetch(`${BASE_URL}${check.path}`);
      const html = await response.text();
      const missing = check.expect.filter((needle) => !html.includes(needle));
      const failedA11y = A11Y_CHECKS.filter((a11yCheck) => !a11yCheck.test(html)).map(
        (a11yCheck) => a11yCheck.label
      );

      if (!response.ok || missing.length > 0 || failedA11y.length > 0) {
        const problems = [
          `status ${response.status}`,
          missing.length > 0 ? `missing copy: ${missing.join(', ')}` : '',
          failedA11y.length > 0 ? `a11y: ${failedA11y.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join('; ');

        failures.push(`${check.name}: ${problems}`);
        console.log(`FAIL  ${check.name} (${problems})`);
      } else {
        console.log(`ok    ${check.name} (${html.length.toLocaleString('en-US')} bytes)`);
      }
    }

    const homeHtml = await (await fetch(BASE_URL)).text();
    const stylesheet = homeHtml.match(/href="([^"]+\.css[^"]*)"/)?.[1];

    if (!stylesheet) {
      failures.push('Stylesheet link not found in the rendered HTML');
    } else {
      const css = await (await fetch(`${BASE_URL}${stylesheet}`)).text();

      for (const check of CSS_CHECKS) {
        if (css.includes(check.needle)) {
          console.log(`ok    CSS: ${check.label}`);
        } else {
          failures.push(`CSS missing ${check.needle} (${check.label})`);
          console.log(`FAIL  CSS: ${check.label}`);
        }
      }
    }
  } finally {
    stopServer(server);
  }

  if (failures.length > 0) {
    console.log(`\n${failures.length} check(s) failed:`);
    failures.forEach((failure) => console.log(` - ${failure}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `\nAll ${PAGE_CHECKS.length} page checks (incl. ${A11Y_CHECKS.length} a11y assertions each) and ${CSS_CHECKS.length} CSS checks passed.`
  );
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
