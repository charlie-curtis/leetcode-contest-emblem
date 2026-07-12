import { formatDecimal, formatDuration, formatInteger, formatPercent } from './format.js';
import { contestModeLabel } from './contestMode.js';

const CARD_WIDTH = 820;
const CARD_HEIGHT = 430;

const THEMES = {
  dark: {
    background: '#15171c',
    panel: '#1f2229',
    stroke: '#343944',
    text: '#f5f7fb',
    muted: '#b4bbc7',
    accent: '#ff9f1c',
    accent2: '#64d2ff',
    grid: '#373d48'
  },
  light: {
    background: '#f8fafc',
    panel: '#ffffff',
    stroke: '#d9dee8',
    text: '#111827',
    muted: '#626b7a',
    accent: '#ff9f1c',
    accent2: '#2563eb',
    grid: '#e5e7eb'
  }
};

export function renderContestEmblem(stats, { theme = 'dark' } = {}) {
  const colors = THEMES[theme] ?? THEMES.dark;
  const chart = buildRatingChart(stats.contests, 116, 328, 646, 52, colors);
  const latest = stats.latestContest;
  const totalProblems = latest?.totalProblems ?? 4;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(stats.username)} LeetCode contest emblem</title>
  <desc id="desc">Aggregate ${escapeXml(stats.contestMode)} LeetCode contest stats including average solved, average rank, all-kills, average last solve time, best and worst finish, and rating trend.</desc>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="18" fill="${colors.background}"/>
  <rect x="14" y="14" width="792" height="402" rx="14" fill="${colors.panel}" stroke="${colors.stroke}"/>

  <g transform="translate(44 42) scale(0.62)">
    <path d="M34 0 8 26a19 19 0 0 0 0 27l21 21a19 19 0 0 0 27 0l11-11" stroke="${colors.text}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m33 64 27-27" stroke="${colors.accent}" stroke-width="8" stroke-linecap="round"/>
    <path d="M43 23h31" stroke="${colors.muted}" stroke-width="8" stroke-linecap="round"/>
  </g>

  <text x="104" y="64" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="850">${escapeXml(truncateText(stats.username, 27))}</text>
  <text x="105" y="93" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="650">${contestModeLabel(stats.contestMode)}</text>
  <text x="760" y="60" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="23" font-weight="850" text-anchor="end">#${formatInteger(stats.globalRanking)} - top ${formatPercent(stats.topPercentage)}</text>
  <text x="760" y="87" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" text-anchor="end">global contest standing</text>

  <line x1="44" y1="122" x2="776" y2="122" stroke="${colors.stroke}"/>

  ${avgSolvedBlock(58, 154, stats.averageSolved, totalProblems, colors)}
  ${metricBlock(246, 154, 'Avg rank', formatInteger(stats.averageRank), colors, 31)}
  ${metricBlock(434, 154, 'Best finish', latestRank(stats.bestFinish), colors, 31)}
  ${metricBlock(622, 154, 'Worst finish', latestRank(stats.worstFinish), colors, 31)}

  <line x1="44" y1="222" x2="776" y2="222" stroke="${colors.stroke}"/>

  ${smallMetric(58, 260, 'Contests', formatInteger(stats.totalContests), colors)}
  ${smallMetric(180, 260, 'All-kills', `${formatInteger(stats.allKillCount)} / ${formatInteger(stats.totalContests)}`, colors)}
  ${smallMetric(314, 260, 'Avg last solve', formatDuration(stats.averageFinishTimeSeconds), colors)}
  ${smallMetric(484, 260, 'Rating', formatInteger(stats.currentRating), colors)}
  ${smallMetric(654, 260, 'Peak', formatInteger(stats.highestRating), colors)}

  <g opacity="0.95" transform="translate(0 0)">
    <text x="58" y="312" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="750">Rating trend</text>
    <text x="762" y="312" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="650" text-anchor="end">contest rating</text>
    ${chartGrid(colors, chart)}
    ${chart.points ? `<polyline points="${chart.points}" fill="none" stroke="${colors.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    ${chart.circles}
  </g>
</svg>`;
}

function avgSolvedBlock(x, y, averageSolved, totalProblems, colors) {
  const percentage = totalProblems > 0 ? Math.min(Math.max(averageSolved / totalProblems, 0), 1) : 0;
  const barWidth = 112;
  const filledWidth = Math.round(barWidth * percentage);

  return `
  <text x="${x}" y="${y}" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="750">Avg solved</text>
  <text x="${x}" y="${y + 42}" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="850">${formatDecimal(averageSolved)}</text>
  <text x="${x + 76}" y="${y + 42}" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="750">of ${formatInteger(totalProblems)}</text>
  <rect x="${x}" y="${y + 54}" width="${barWidth}" height="6" rx="3" fill="${colors.stroke}"/>
  <rect x="${x}" y="${y + 54}" width="${filledWidth}" height="6" rx="3" fill="${colors.accent}"/>`;
}

function metricBlock(x, y, label, value, colors, valueSize) {
  return `
  <text x="${x}" y="${y}" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="750">${label}</text>
  <text x="${x}" y="${y + 42}" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="${valueSize}" font-weight="850">${escapeXml(value)}</text>`;
}

function smallMetric(x, y, label, value, colors, valueSize = 29) {
  return `
  <text x="${x}" y="${y}" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="750">${label}</text>
  <text x="${x}" y="${y + 34}" fill="${colors.text}" font-family="Inter, Arial, sans-serif" font-size="${valueSize}" font-weight="850">${escapeXml(value)}</text>`;
}

function latestRank(contest) {
  return contest?.ranking ? `#${formatInteger(contest.ranking)}` : 'n/a';
}

function chartGrid(colors, chart) {
  const rows = [
    { y: 328, label: chart.maxLabel },
    { y: 354, label: chart.midLabel },
    { y: 380, label: chart.minLabel }
  ];

  return rows.map((row) => `
    <text x="96" y="${row.y + 4}" fill="${colors.muted}" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="650" text-anchor="end">${row.label}</text>
    <line x1="116" y1="${row.y}" x2="762" y2="${row.y}" stroke="${colors.grid}" stroke-width="1"/>`).join('\n');
}

function buildRatingChart(contests, x, y, width, height, colors) {
  const rated = contests.filter((contest) => Number.isFinite(contest.rating));
  if (rated.length < 2) {
    return {
      points: '',
      circles: '',
      minLabel: 'n/a',
      midLabel: 'n/a',
      maxLabel: 'n/a'
    };
  }

  const values = rated.map((contest) => contest.rating);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 1);

  const coordinates = rated.map((contest, index) => {
    const progress = index / (rated.length - 1);
    const normalized = (contest.rating - min) / spread;
    return {
      x: x + progress * width,
      y: y + height - normalized * height
    };
  });

  const pointEvery = Math.max(Math.ceil(coordinates.length / 14), 1);
  const circles = coordinates
    .filter((_, index) => index % pointEvery === 0 || index === coordinates.length - 1)
    .map((point) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="3.4" fill="${colors.accent}"/>`)
    .join('\n    ');

  return {
    points: coordinates.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' '),
    circles,
    minLabel: formatInteger(min),
    midLabel: formatInteger((min + max) / 2),
    maxLabel: formatInteger(max)
  };
}

function truncateText(value, maxLength) {
  const text = String(value);
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(maxLength - 3, 0))}...`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
