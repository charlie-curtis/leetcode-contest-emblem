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
- 2026-07-11: Took a second UI pass based on review feedback: added chart labeling, safer SVG text truncation, clearer average-solved display, all-kills as count over total contests, and stronger label contrast.
- 2026-07-12: Clarified the rating trend by replacing the ambiguous min-max text with y-axis labels, paired global rank with top percentage in the header, removed the latest-contest block from the emblem, and used the freed space for a wider chart.
- 2026-07-12: Added home page shortcut links for easier access to the emblem's SVG, PNG, and JSON outputs.
- 2026-07-12: Renamed the misleading `Avg finish` label to `Avg last solve`, added an `Avg bugs` stat with unavailable-data handling, and documented that LeetCode's rated contest-history GraphQL response does not currently include failed-attempt counts.
- 2026-07-12: Removed `Avg bugs` because it cannot be populated from the current LeetCode contest-history response, and split rating display into separate `Rating` and `Peak` stats instead of `current / peak`.
- 2026-07-11: Removed the unused alternate contest-mode support end-to-end (it always returned a 501, since LeetCode doesn't expose that contest history via the rated-history GraphQL query) — dropped the mode switcher, its shortcut routes, `?mode=` query handling, the `CONTEST_MODE` env var, and the `contestMode.js` module. Also enlarged the rating trend chart and fixed the header/axis-label overlap it had.
