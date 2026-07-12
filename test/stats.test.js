import test from 'node:test';
import assert from 'node:assert/strict';
import { buildContestStats } from '../src/stats.js';

const sampleContestData = {
  userContestRanking: {
    attendedContestsCount: 4,
    rating: 1812.4,
    globalRanking: 12345,
    totalParticipants: 600000,
    topPercentage: 2.06
  },
  userContestRankingHistory: [
    {
      attended: false,
      problemsSolved: 0,
      totalProblems: 4,
      finishTimeInSeconds: 0,
      rating: 1500,
      ranking: 0,
      contest: { title: 'Weekly Contest 1', startTime: 1000 }
    },
    {
      attended: true,
      problemsSolved: 2,
      totalProblems: 4,
      finishTimeInSeconds: 620,
      rating: 1590,
      ranking: 1424,
      contest: { title: 'Biweekly Contest 147', startTime: 2000 }
    },
    {
      attended: true,
      problemsSolved: 4,
      totalProblems: 4,
      finishTimeInSeconds: 2200,
      rating: 1710,
      ranking: 233,
      contest: { title: 'Weekly Contest 432', startTime: 3000 }
    },
    {
      attended: true,
      problemsSolved: 2,
      totalProblems: 4,
      finishTimeInSeconds: 2041,
      rating: 1680,
      ranking: 1299,
      contest: { title: 'Weekly Contest 433', startTime: 4000 }
    },
    {
      attended: true,
      problemsSolved: 3,
      totalProblems: 4,
      finishTimeInSeconds: 3609,
      rating: 1812.4,
      ranking: 295,
      contest: { title: 'Weekly Contest 435', startTime: 5000 }
    }
  ]
};

test('buildContestStats aggregates attended contests', () => {
  const stats = buildContestStats('RandomUserName554', sampleContestData);

  assert.equal(stats.totalContests, 4);
  assert.equal(stats.averageSolved, 2.75);
  assert.equal(Math.round(stats.averageRank), 813);
  assert.equal(stats.bestFinish.ranking, 233);
  assert.equal(stats.worstFinish.ranking, 1424);
  assert.equal(stats.allKillCount, 1);
  assert.equal(stats.latestContest.title, 'Weekly Contest 435');
  assert.equal(stats.currentRating, 1812.4);
  assert.equal(stats.highestRating, 1812.4);
});

test('buildContestStats handles an empty contest history', () => {
  const stats = buildContestStats('NoContestUser', {
    userContestRanking: null,
    userContestRankingHistory: []
  });

  assert.equal(stats.totalContests, 0);
  assert.equal(stats.bestFinish, null);
  assert.equal(stats.averageSolved, 0);
  assert.equal(stats.allKillCount, 0);
});
