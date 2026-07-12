import http from 'node:http';
import { getConfig } from './config.js';
import { LeetCodeClient } from './leetcodeClient.js';
import { buildContestStats } from './stats.js';
import { renderContestEmblem } from './renderSvg.js';
import { renderPng } from './renderPng.js';
import { TimedCache } from './cache.js';

const config = getConfig();
const client = new LeetCodeClient({
  leetcodeSession: config.leetcodeSession,
  csrfToken: config.csrfToken
});
const cache = new TimedCache(config.cacheTtlMs);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

    if (url.pathname === '/health') {
      return sendJson(response, 200, { ok: true });
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return sendHtml(response, renderHomePage(config.port));
    }

    if (url.pathname === '/api/stats') {
      const stats = await loadStats(url.searchParams.get('username'));
      return sendJson(response, 200, stats);
    }

    if (url.pathname === '/emblem.svg' || url.pathname.endsWith('.svg')) {
      const stats = await loadStats(usernameFromPath(url.pathname) ?? url.searchParams.get('username'));
      const svg = renderContestEmblem(stats, { theme: url.searchParams.get('theme') ?? config.theme });
      return send(response, 200, svg, 'image/svg+xml; charset=utf-8');
    }

    if (url.pathname === '/emblem.png' || url.pathname.endsWith('.png')) {
      const stats = await loadStats(usernameFromPath(url.pathname) ?? url.searchParams.get('username'));
      const svg = renderContestEmblem(stats, { theme: url.searchParams.get('theme') ?? config.theme });
      const png = await renderPng(svg);
      return send(response, 200, png, 'image/png');
    }

    return sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    const status = error.statusCode ?? (error.message.includes('LEETCODE_SESSION') ? 401 : 500);
    return sendJson(response, status, { error: error.message });
  }
});

server.listen(config.port, () => {
  console.log(`LeetCode Contest Emblem running at http://localhost:${config.port}`);
});

async function loadStats(requestedUsername) {
  const username = await client.resolveUsername(requestedUsername ?? config.username);
  const cacheKey = username.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const contestData = await client.getContestData(username);
  const stats = buildContestStats(username, contestData);
  cache.set(cacheKey, stats);
  return stats;
}

function usernameFromPath(pathname) {
  const match = pathname.match(/^\/([^/]+)\.(svg|png)$/);
  if (!match || match[1] === 'emblem') {
    return null;
  }

  return decodeURIComponent(match[1]);
}

function sendJson(response, status, payload) {
  return send(response, status, JSON.stringify(payload, null, 2), 'application/json; charset=utf-8');
}

function sendHtml(response, html) {
  return send(response, 200, html, 'text/html; charset=utf-8');
}

function send(response, status, body, contentType) {
  response.writeHead(status, {
    'content-type': contentType,
    'cache-control': 'public, max-age=300'
  });
  response.end(body);
}

function renderHomePage(port) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LeetCode Contest Emblem</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #111318;
        color: #f6f7fb;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
      }

      main {
        width: min(920px, 100%);
      }

      header {
        align-items: center;
        display: flex;
        gap: 16px;
        justify-content: space-between;
        margin-bottom: 18px;
      }

      h1 {
        font-size: 18px;
        line-height: 1.2;
        margin: 0;
      }

      img {
        width: 100%;
        height: auto;
        border-radius: 18px;
        box-shadow: 0 22px 80px rgb(0 0 0 / 0.28);
      }

      nav {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 18px;
      }

      a {
        color: #111318;
        background: #ff9f1c;
        border-radius: 8px;
        padding: 10px 12px;
        font-weight: 800;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>LeetCode Contest Emblem</h1>
      </header>
      <img src="/emblem.svg" alt="LeetCode contest emblem preview" />
      <nav>
        <a href="/emblem.svg">SVG</a>
        <a href="/emblem.png">PNG</a>
        <a href="/api/stats">JSON</a>
        <a href="http://localhost:${port}/health">Health</a>
      </nav>
    </main>
  </body>
</html>`;
}
