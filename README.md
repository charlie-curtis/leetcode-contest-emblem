# LeetCode Contest Emblem

Generate embeddable SVG and PNG emblems for aggregate LeetCode contest stats.

The app reads your LeetCode cookie from local environment variables, fetches contest history, computes aggregate stats, and renders a compact card for READMEs, dashboards, or local sharing.

![Example emblem](docs/emblem-example.png)

## Output

- `SVG`: vector, text-based, crisp at any size, ideal for GitHub READMEs.
- `PNG`: pixel image, fixed resolution, useful where SVG is unsupported.

## Stats Included

- Total attended contests
- Average problems solved
- Average rank
- Best finish
- Worst finish
- All-kill count
- Average last solve time
- Current and highest contest rating when available
- Rating trend line

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```bash
LEETCODE_USERNAME=your_leetcode_username
LEETCODE_SESSION=your_leetcode_session_cookie_value
LEETCODE_CSRF_TOKEN=your_csrftoken_cookie_value
```

`LEETCODE_CSRF_TOKEN` is optional, but recommended if LeetCode rejects authenticated requests without it.

## Run

```bash
npm run dev
```

Open:

- `http://localhost:3000/emblem.svg`
- `http://localhost:3000/emblem.png`
- `http://localhost:3000/api/stats`

You can override the username per request:

```text
http://localhost:3000/your_username.svg
http://localhost:3000/your_username.png
```

Stats are backed by LeetCode's rated contest history GraphQL data.

## GitHub README Example

```md
![LeetCode contest emblem](http://localhost:3000/emblem.svg)
```

For a public README, deploy this service first and use the deployed URL. Do not put your LeetCode cookie in a public client-side app.

## Environment Variables

| Name | Required | Description |
| --- | --- | --- |
| `LEETCODE_SESSION` | Yes | Value of your `LEETCODE_SESSION` cookie. |
| `LEETCODE_USERNAME` | No | Username to render by default. If omitted, the app tries to resolve it from the authenticated cookie. |
| `LEETCODE_CSRF_TOKEN` | No | Value of your `csrftoken` cookie. |
| `PORT` | No | Server port. Defaults to `3000`. |
| `CACHE_TTL_MINUTES` | No | In-memory cache duration. Defaults to `30`. |
| `THEME` | No | `dark` or `light`. Defaults to `dark`. |

## Security Notes

- Never commit `.env`.
- Treat `LEETCODE_SESSION` like a password.
- If you deploy this later, store cookies as private server-side environment variables.
- Avoid exposing endpoints that let arbitrary users fetch private authenticated data.

## Development

```bash
npm test
```
