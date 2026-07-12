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
  const chartPoints = buildRatingPolyline(stats.contests, 314, 312, 448, 58);
  const latest = stats.latestContest;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(stats.username)} LeetCode contest emblem</title>
  <desc id="desc">Aggregate LeetCode contest stats including average solved, average rank, best finish, and worst finish.</desc>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="18" fill="${colors.background}"/>
  <rect x="14" y="14" width="792" height="402" rx="14" fill="${colors.panel}" stroke="${colors.stroke}"/>

  <g transform="translate(44 42) scale(0.62)">
    <path d="M34 0 8 26a19 19 0 0 0 0 27l21 21a19 19 0 0 0 27 0l11-11" stroke="${colors.text}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m33 64 27-27" stroke="${colors.accent}" stroke-width="8" stroke-linecap="round"/>
    <path d="M43 23h31" stroke="${colors.muted}" stroke-width="8" stroke-linecap="round"/>
  </g>

  <text x="104" y="64" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="850">${escapeXml(stats.username)}</text>
  <text x="105" y="93" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="650">LeetCode contest stats</text>
  <text x="760" y="64" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="850" text-anchor="end">#${formatInteger(stats.globalRanking)}</text>

  <line x1="44" y1="122" x2="776" y2="122" stroke="${colors.stroke}"/>

  ${metricBlock(58, 154, 'Avg solved', `${formatDecimal(stats.averageSolved)} / ${formatInteger(latest?.totalProblems ?? 4)}`, colors, 31)}
  ${metricBlock(246, 154, 'Avg rank', formatInteger(stats.averageRank), colors, 31)}
  ${metricBlock(434, 154, 'Best finish', latestRank(stats.bestFinish), colors, 31)}
  ${metricBlock(622, 154, 'Worst finish', latestRank(stats.worstFinish), colors, 31)}

  <line x1="44" y1="222" x2="776" y2="222" stroke="${colors.stroke}"/>

  ${smallMetric(58, 260, 'Contests', formatInteger(stats.totalContests), colors)}
  ${smallMetric(180, 260, 'All-kills', formatInteger(stats.allKillCount), colors)}
  ${smallMetric(314, 260, 'Current rating', formatInteger(stats.currentRating), colors)}
  ${smallMetric(484, 260, 'Highest rating', formatInteger(stats.highestRating), colors)}
  ${smallMetric(654, 260, 'Top %', formatPercent(stats.topPercentage), colors)}

  <g transform="translate(44 294)">
    <text x="0" y="14" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="750">Latest contest</text>
    <text x="0" y="42" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(latest?.title ?? 'n/a')}</text>
    <text x="0" y="66" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="15">${latestRank(latest)} - avg finish ${formatDuration(stats.averageFinishTimeSeconds)}</text>
  </g>

  <g opacity="0.95" transform="translate(0 0)">
    ${chartGrid(colors)}
    ${chartPoints ? `<polyline points="${chartPoints}" fill="none" stroke="${colors.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
  </g>
</svg>`;
}

function metricBlock(x, y, label, value, colors, valueSize) {
  return `
  <text x="${x}" y="${y}" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="750">${label}</text>
  <text x="${x}" y="${y + 42}" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="${valueSize}" font-weight="850">${escapeXml(value)}</text>`;
}

function smallMetric(x, y, label, value, colors) {
  return `
  <text x="${x}" y="${y}" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="750">${label}</text>
  <text x="${x}" y="${y + 34}" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="29" font-weight="850">${escapeXml(value)}</text>`;
}

function latestRank(contest) {
  return contest?.ranking ? `#${formatInteger(contest.ranking)}` : 'n/a';
}

function chartGrid(colors) {
  return [0, 1, 2, 3].map((index) => {
    const y = 312 + index * 19;
    return `<line x1="314" y1="${y}" x2="762" y2="${y}" stroke="${colors.grid}" stroke-width="1"/>`;
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
