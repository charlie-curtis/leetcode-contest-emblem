import fs from 'node:fs';
import path from 'node:path';

export function loadDotEnv(filePath = path.join(process.cwd(), '.env')) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function getConfig() {
  loadDotEnv();

  return {
    port: Number.parseInt(process.env.PORT ?? '3000', 10),
    username: process.env.LEETCODE_USERNAME,
    leetcodeSession: process.env.LEETCODE_SESSION,
    csrfToken: process.env.LEETCODE_CSRF_TOKEN,
    cacheTtlMs: Number.parseInt(process.env.CACHE_TTL_MINUTES ?? '30', 10) * 60 * 1000,
    theme: process.env.THEME === 'light' ? 'light' : 'dark'
  };
}
