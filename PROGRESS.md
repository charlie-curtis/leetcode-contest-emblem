# Progress

## Task

Create a Node.js repository that reads a local LeetCode cookie, fetches contest history, computes aggregate contest stats, and renders embeddable emblems similar in spirit to LeetCode stat cards.

## Goal

Build a local-first app that can later be deployed easily. It should generate both SVG and PNG output and include stats such as average problems solved, average rank, best finish, worst finish, and related contest summary data.

## Decisions

- Repository name: `leetcode-contest-emblem`.
- GitHub visibility: public.
- Cookie handling: local environment variables only; `.env` is ignored by Git.
- First output formats: SVG and PNG.
- First deployment posture: local-first Node.js HTTP server, with deploy-friendly environment configuration.
- Data source: LeetCode GraphQL endpoint with cookie headers, avoiding browser automation for the initial version.

## Log

- 2026-07-11: Confirmed project requirements and repository name.
- 2026-07-11: Created local project folder at `/Users/charliecurtis/Code/leetcode-contest-emblem`.
- 2026-07-11: Started Node.js app skeleton with stats aggregation, LeetCode client, SVG renderer, PNG conversion, tests, and documentation.
- 2026-07-11: Installed `@resvg/resvg-js` for server-side PNG generation from SVG.
- 2026-07-11: Verified stats aggregation tests pass with `npm test`.
- 2026-07-11: Verified SVG and PNG renderers with sample contest data.
- 2026-07-11: Started the local HTTP server on port `3131` and confirmed `/health` returns OK.
- 2026-07-11: Created public GitHub repository at `https://github.com/charlie-curtis/leetcode-contest-emblem`.
- 2026-07-11: Pushed the initial implementation to GitHub.
- 2026-07-11: Updated the emblem layout to reduce visual collisions, moved the rating chart into its own lower area, removed best/worst contest abbreviations, and added all-kill count.
- 2026-07-11: Took a second UI pass based on review feedback: added chart labeling, safer SVG text truncation, clearer average-solved display, all-kills as count over total contests, stronger label contrast, and `mode=actual|virtual` request handling.
