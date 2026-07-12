export function buildContestStats(username, contestData) {
  const history = contestData.userContestRankingHistory ?? [];
  const attended = history
    .filter((entry) => entry.attended && Number.isFinite(entry.ranking) && entry.ranking > 0)
    .map(normalizeContest)
    .sort((a, b) => a.startTime - b.startTime);

  if (attended.length === 0) {
    return {
      username,
      totalContests: 0,
      averageSolved: 0,
      averageRank: 0,
      bestFinish: null,
      worstFinish: null,
      allKillCount: 0,
      averageFinishTimeSeconds: 0,
      latestContest: null,
      currentRating: null,
      highestRating: null,
      topPercentage: null,
      globalRanking: null,
      totalParticipants: null,
      contests: []
    };
  }

  const ranking = contestData.userContestRanking ?? {};
  const ratings = attended.map((contest) => contest.rating).filter(Number.isFinite);

  return {
    username,
    totalContests: attended.length,
    averageSolved: average(attended.map((contest) => contest.problemsSolved)),
    averageRank: average(attended.map((contest) => contest.ranking)),
    bestFinish: minBy(attended, (contest) => contest.ranking),
    worstFinish: maxBy(attended, (contest) => contest.ranking),
    allKillCount: attended.filter(isAllKill).length,
    averageFinishTimeSeconds: average(attended.map((contest) => contest.finishTimeInSeconds)),
    latestContest: attended.at(-1),
    currentRating: numberOrNull(ranking.rating),
    highestRating: ratings.length ? Math.max(...ratings) : null,
    topPercentage: numberOrNull(ranking.topPercentage),
    globalRanking: numberOrNull(ranking.globalRanking),
    totalParticipants: numberOrNull(ranking.totalParticipants),
    contests: attended
  };
}

function normalizeContest(entry) {
  return {
    title: entry.contest?.title ?? 'Contest',
    startTime: Number(entry.contest?.startTime ?? 0),
    date: entry.contest?.startTime
      ? new Date(entry.contest.startTime * 1000).toISOString().slice(0, 10)
      : null,
    problemsSolved: Number(entry.problemsSolved ?? 0),
    totalProblems: Number(entry.totalProblems ?? 0),
    finishTimeInSeconds: Number(entry.finishTimeInSeconds ?? 0),
    rating: numberOrNull(entry.rating),
    ranking: Number(entry.ranking)
  };
}

function average(values) {
  const finiteValues = values.filter(Number.isFinite);
  if (finiteValues.length === 0) {
    return 0;
  }

  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}

function minBy(items, selector) {
  return items.reduce((best, item) => (selector(item) < selector(best) ? item : best), items[0]);
}

function maxBy(items, selector) {
  return items.reduce((worst, item) => (selector(item) > selector(worst) ? item : worst), items[0]);
}

function numberOrNull(value) {
  return Number.isFinite(value) ? Number(value) : null;
}

function isAllKill(contest) {
  return contest.totalProblems > 0 && contest.problemsSolved >= contest.totalProblems;
}
