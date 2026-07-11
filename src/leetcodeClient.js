const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

const USER_STATUS_QUERY = `
  query userStatus {
    globalData {
      userStatus {
        isSignedIn
        username
      }
    }
  }
`;

const CONTEST_HISTORY_QUERY = `
  query userContestRankingInfo($username: String!) {
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
    userContestRankingHistory(username: $username) {
      attended
      trendDirection
      problemsSolved
      totalProblems
      finishTimeInSeconds
      rating
      ranking
      contest {
        title
        startTime
      }
    }
  }
`;

export class LeetCodeClient {
  constructor({ leetcodeSession, csrfToken, fetchImpl = fetch } = {}) {
    this.leetcodeSession = leetcodeSession;
    this.csrfToken = csrfToken;
    this.fetchImpl = fetchImpl;
  }

  async resolveUsername(fallbackUsername) {
    if (fallbackUsername) {
      return fallbackUsername;
    }

    const data = await this.graphql(USER_STATUS_QUERY);
    const userStatus = data.globalData?.userStatus;
    if (!userStatus?.isSignedIn || !userStatus.username) {
      throw new Error('Set LEETCODE_USERNAME or provide a valid LEETCODE_SESSION cookie.');
    }

    return userStatus.username;
  }

  async getContestData(username) {
    return this.graphql(CONTEST_HISTORY_QUERY, { username });
  }

  async graphql(query, variables = {}) {
    if (!this.leetcodeSession) {
      throw new Error('Missing LEETCODE_SESSION. Add it to .env or your process environment.');
    }

    const response = await this.fetchImpl(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ query, variables })
    });

    const responseText = await response.text();
    let payload;
    try {
      payload = JSON.parse(responseText);
    } catch {
      throw new Error(`LeetCode returned a non-JSON response with status ${response.status}.`);
    }

    if (!response.ok) {
      throw new Error(payload.errors?.[0]?.message ?? `LeetCode request failed with ${response.status}.`);
    }

    if (payload.errors?.length) {
      throw new Error(payload.errors.map((error) => error.message).join('; '));
    }

    return payload.data;
  }

  headers() {
    const cookieParts = [`LEETCODE_SESSION=${this.leetcodeSession}`];
    if (this.csrfToken) {
      cookieParts.push(`csrftoken=${this.csrfToken}`);
    }

    return {
      'content-type': 'application/json',
      cookie: cookieParts.join('; '),
      referer: 'https://leetcode.com/contest/',
      'user-agent': 'leetcode-contest-emblem/0.1.0',
      ...(this.csrfToken ? { 'x-csrftoken': this.csrfToken } : {})
    };
  }
}
