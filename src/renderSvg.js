import { formatDecimal, formatDuration, formatInteger, formatPercent } from './format.js';

const CARD_WIDTH = 820;
const CARD_HEIGHT = 430;

const THEMES = {
  dark: {
    background: '#15171c',
    panel: '#1f2229',
    stroke: '#343944',
    text: '#f5f7fb',
    muted: '#9aa1ad',
    accent: '#ff9f1c',
    accent2: '#64d2ff',
    grid: '#373d48'
  },
  light: {
    background: '#f8fafc',
    panel: '#ffffff',
    stroke: '#d9dee8',
    text: '#111827',
    muted: '#737b89',
    accent: '#ff9f1c',
    accent2: '#2563eb',
    grid: '#e5e7eb'
  }
};

export function renderContestEmblem(stats, { theme = 'dark' } = {}) {
  const colors = THEMES[theme] ?? THEMES.dark;
  const chartPoints = buildRatingPolyline(stats.contests, 76, 306, 668, 82);
  const latest = stats.latestContest;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(stats.username)} LeetCode contest emblem</title>
  <desc id="desc">Aggregate LeetCode contest stats including average solved, average rank, best finish, and worst finish.</desc>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="18" fill="${colors.background}"/>
  <rect x="14" y="14" width="792" height="402" rx="14" fill="${colors.panel}" stroke="${colors.stroke}"/>

  <g transform="translate(42 36)">
    <path d="M34 0 8 26a19 19 0 0 0 0 27l21 21a19 19 0 0 0 27 0l11-11" stroke="${colors.text}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m33 64 27-27" stroke="${colors.accent}" stroke-width="8" stroke-linecap="round"/>
    <path d="M43 23h31" stroke="${colors.muted}" stroke-width="8" stroke-linecap="round"/>
  </g>

  <text x="132" y="76" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800">${escapeXml(stats.username)}</text>
  <text x="132" y="110" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="17">Contest aggregate emblem</text>
  <text x="744" y="74" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800" text-anchor="end">#${formatInteger(stats.globalRanking)}</text>

  ${metricBlock(58, 156, 'Avg solved', formatDecimal(stats.averageSolved), `/ ${formatInteger(latest?.totalProblems ?? 4)}`, colors)}
  ${metricBlock(260, 156, 'Avg rank', formatInteger(stats.averageRank), '', colors)}
  ${metricBlock(462, 156, 'Best finish', latestRank(stats.bestFinish), contestSubline(stats.bestFinish), colors)}
  ${metricBlock(620, 156, 'Worst finish', latestRank(stats.worstFinish), contestSubline(stats.worstFinish), colors)}

  <line x1="40" y1="246" x2="780" y2="246" stroke="${colors.stroke}"/>

  <text x="58" y="282" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">Contests</text>
  <text x="58" y="322" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="850">${formatInteger(stats.totalContests)}</text>

  <text x="212" y="282" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">Current rating</text>
  <text x="212" y="322" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="850">${formatInteger(stats.currentRating)}</text>

  <text x="404" y="282" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">Highest rating</text>
  <text x="404" y="322" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="850">${formatInteger(stats.highestRating)}</text>

  <text x="620" y="282" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">Top percentage</text>
  <text x="620" y="322" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="850">${formatPercent(stats.topPercentage)}</text>

  <g opacity="0.95">
    ${chartGrid(colors)}
    ${chartPoints ? `<polyline points="${chartPoints}" fill="none" stroke="${colors.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
  </g>

  <text x="58" y="394" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="16">Latest: ${escapeXml(latest?.title ?? 'n/a')} - ${latestRank(latest)} - avg finish ${formatDuration(stats.averageFinishTimeSeconds)}</text>
</svg>`;
}

function metricBlock(x, y, label, value, suffix, colors) {
  return `
  <text x="${x}" y="${y}" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="700">${label}</text>
  <text x="${x}" y="${y + 42}" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="850">${value}</text>
  <text x="${x + 92}" y="${y + 42}" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="750">${escapeXml(suffix)}</text>`;
}

function latestRank(contest) {
  return contest?.ranking ? `#${formatInteger(contest.ranking)}` : 'n/a';
}

function contestSubline(contest) {
  if (!contest) {
    return '';
  }

  return contest.title.replace(/^Weekly Contest /, 'W').replace(/^Biweekly Contest /, 'BW');
}

function chartGrid(colors) {
  return [0, 1, 2].map((index) => {
    const y = 326 + index * 28;
    return `<line x1="78" y1="${y}" x2="746" y2="${y}" stroke="${colors.grid}" stroke-width="1"/>`;
  }).join('\n    ');
}

function buildRatingPolyline(contests, x, y, width, height) {
  const rated = contests.filter((contest) => Number.isFinite(contest.rating));
  if (rated.length < 2) {
    return '';
  }

  const values = rated.map((contest) => contest.rating);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 1);

  return rated.map((contest, index) => {
    const progress = index / (rated.length - 1);
    const normalized = (contest.rating - min) / spread;
    return `${(x + progress * width).toFixed(1)},${(y + height - normalized * height).toFixed(1)}`;
  }).join(' ');
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
