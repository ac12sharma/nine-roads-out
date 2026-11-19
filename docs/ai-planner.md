# AI answers in the trip planner

**Status: off** (`chat.ai: false` in `site.config.mjs`). The trip planner answers from the site's own data in the browser. That is the version measured in the [planner evaluation](planner-eval.md), and it costs nothing to run. The AI back end is an optional extra for the questions the planner can't answer itself, the ones that would otherwise get "Try one of these" (the `fallback` answer).

## How it works

- The browser sends the last eight messages of the conversation, each cut to 600 characters, to `/api/chat` on this site. A Cloudflare Pages Function, built from `src/functions/chat.js` only when `chat.ai` is on, passes them to the Claude Messages API.
- The model is `claude-haiku-5-5` (set in `site.config.mjs`, or overridden with a `CHAT_MODEL` variable). The request uses API version `2026-10-21` and low effort, because these are short answers from data in the prompt. Haiku 5.5 thinks before answering, and thinking counts towards the token limit, so the limit is 2,000 tokens; the system prompt keeps the visible reply under 120 words.
- The system prompt holds the nine drives and the places to eat (about 4,000 tokens by a rough estimate) and tells the model to recommend only those, use their exact names, never invent opening hours or prices, and stay on the topic of day drives from Dublin.
- If the model declines a request (`stop_reason: "refusal"`), the visitor gets a short "I can only help with day drives…" message rather than an empty reply.
- The function only accepts requests from the site's own pages.

It calls the API with `fetch` rather than the Anthropic SDK, because the site has no runtime dependencies and the function is deployed as a single file.

## Rate limits

You asked for per-IP limits, so they are keyed on the visitor's IP address. One caution: Cloudflare's own rate-limiting documentation advises against limiting by IP address, because one address can be shared by a whole office or mobile network. That's why the limits are generous.

| Limit | Default | Where it's counted | Needs |
| --- | --- | --- | --- |
| Per visitor per minute | 5 | In the memory of each running copy of the function | Nothing |
| Per visitor per day | 40 | Cloudflare KV | A KV binding called `CHAT_LIMITS` |
| Whole site per day | 500 AI answers | Cloudflare KV | The same binding. Override with a `CHAT_DAILY_CAP` variable. |

Change the defaults in `chat.limits` in `site.config.mjs`.

- **The per-minute limit is approximate.** Cloudflare runs many copies of the function, each with its own memory, so it stops someone hammering the endpoint from one place but isn't a hard guarantee. Cloudflare's Rate Limiting binding would be better, but it is for Workers, and Pages Functions' list of bindings doesn't include it.
- **The daily limits are a cost brake.** KV is eventually consistent, so a sudden burst can go a little over. The site-wide cap is what keeps the bill predictable. Set it to what you're willing to spend.
- **IP addresses are never stored.** The counter key is a SHA-256 hash of the IP address, the date and a secret salt (`RATE_SALT`), so it changes every day and can't be reversed without the salt. KV entries expire after two days.
- When a limit is hit, the API returns HTTP 429 and the planner tells the visitor it can still help with the drives from its own data.

For a hard limit at Cloudflare's edge as well, add a rate limiting rule in the dashboard (**Security > WAF > Rate limiting rules**) for `/api/chat`, if your plan includes one.

## Cost

Anthropic's listed price for Claude Haiku 5.5 (prompts up to 100,000 tokens, at the time of writing) is $0.10 per million input tokens and $0.50 per million output tokens; check the [pricing page](https://platform.claude.com/docs/en/about-claude/pricing) before you rely on it. One answer is roughly 4,500 input tokens and at most 2,000 output tokens, including thinking, so **about $0.0015 at most**. At the default cap of 500 answers a day, that is under $1 a day at most. These are estimates: the token count is approximate and real answers are usually far shorter than the limit. Set a monthly spend limit in the Claude Console as well, so the cost is capped regardless.

## Switching it on

Everything below happens in dashboards. Never put the API key in the repository, in `site.config.mjs` or in a chat message.

1. **API key.** In the [Claude Console](https://platform.claude.com/), create an API key and set a monthly spend limit for it.
2. **Secret.** In Cloudflare, open the Pages project, then **Settings > Variables and Secrets**, and add:
   - `ANTHROPIC_API_KEY`, type **Secret**, value: the key.
   - `RATE_SALT`, type **Secret**, value: any long random string.
   - Optionally `CHAT_DAILY_CAP` (a number) and `CHAT_MODEL`.
3. **KV for the daily limits.** In Cloudflare, create a KV namespace (for example `nineroadsout-chat-limits`). Then, in the Pages project, open **Settings > Bindings > Add > KV namespace**, set **Variable name** to `CHAT_LIMITS` and choose the namespace.
4. **Turn it on.** Set `chat.ai: true` in `site.config.mjs`, build and deploy. It has to be a deploy that includes the `functions/` folder: Git integration or `wrangler pages deploy`, not a drag-and-drop upload of `dist`. The build writes `functions/api/chat.js` with the site's data built in.
5. **Check it.** Ask the planner something it can't answer from its data and confirm you get an AI reply. Then check the Privacy page: with `chat.ai` on, it says that unanswered planner questions are sent to Anthropic.

## What's tested

`tests/chat.test.mjs` runs the function with `fetch` and KV replaced by stand-ins, so no real API call is made. It checks:

- it refuses without a key, and refuses other sites
- the request's endpoint, version header, model, effort and messages, and that no sampling parameters are sent
- refusals are handled
- each limit: per minute without affecting other visitors, per day, and the site-wide cap
- no IP address ends up in a stored key

What isn't tested is a live call: it needs a real key and costs money, so do step 5 yourself.
