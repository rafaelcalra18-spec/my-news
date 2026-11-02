# My news

My news is a phone-first news app that follows each story over time. A story has a timeline of how it changed day by day, a line saying what changed since the last edition, and coverage from the outlets that reported it. When a Kalshi or Polymarket market exists for the story, the app shows its current odds and how they moved over the past week.

At setup the reader describes what they follow in one sentence. Gemini turns that sentence into topics and asks a couple of follow-up questions.

The app was built in Google AI Studio for a Gemini hackathon.

## What is live and what is seeded

The 13 stories in `src/data/` are seed data. They were researched from real reporting before the demo, and they link to the outlets they came from. The app does not yet build a new edition by itself each morning.

The market prices are live. The server fetches them from the public Kalshi and Polymarket APIs at `/api/markets` and caches them for five minutes. If a request fails, the app shows the price saved on 31 October and labels it as saved.

Gemini runs on the server, so the API key never reaches the browser.

## Running it

You need Node.js 22 and a Gemini API key.

```sh
npm install --legacy-peer-deps
GEMINI_API_KEY=your-key npm run dev
```

Then open http://localhost:3000.

Plain `npm install` fails for now because the pinned `esbuild` version conflicts with Vite 8. The flag gets past it.

Pass the key in the shell as shown. A key in a `.env` file is not picked up yet, because `server.ts` imports the Gemini service before it calls `dotenv.config()`. Without a key the app still runs, and setup falls back to a fixed answer.

## Layout

- `server.ts` is the Express server and its API routes.
- `server/` has the Gemini calls and the market fetcher.
- `src/components/` has the screens and cards.
- `src/data/` has the seed stories, their timelines and the saved market prices.
- `Design.md` is the design spec the app was built from.

## Next step

The real app needs a job that builds the edition every morning. It would search the news with Gemini grounding, extract the facts as JSON, and keep only the facts whose source appears in the grounding results. It would then match each fact to an existing story so the timeline grows, and store the result in Firestore. Cloud Scheduler would run it before breakfast.
