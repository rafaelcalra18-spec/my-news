# My news

My news is a phone-first news app that follows each story over time. A story has a timeline of how it changed day by day, a line saying what changed since the last edition, and coverage from the outlets that reported it. When a Kalshi or Polymarket market exists for the story, the app shows its odds and how they moved over the past week.

At setup the reader describes what they follow in one sentence. Gemini turns that sentence into topics and asks a couple of follow-up questions.

The app was built in Google AI Studio for a Gemini hackathon. This repository keeps the demo as it was shown: the morning edition for Saturday 31 October 2026.

## What is in the demo

The 13 stories in `src/data/` were researched from real reporting before the demo, and they link to the outlets they came from. The app does not build a new edition by itself each morning.

The market prices are the ones Kalshi and Polymarket showed at 8am London time on 31 October, with one price per day back to 24 October. They are saved in `src/data/marketSnapshot.ts`, so the odds still match the stories after the markets have closed. `scripts/snapshot-markets.ts` rebuilds that file from the public APIs.

Gemini runs on the server, so the API key never reaches the browser.

## Running it

You need Node.js 22 and a Gemini API key.

```sh
npm install
cp .env.example .env    # then put your key in .env
npm run dev
```

Then open http://localhost:3000.

Without a key the app still runs, but setup falls back to a fixed answer.

## Layout

- `server.ts` is the Express server and its API routes.
- `server/` has the Gemini calls and the market data service.
- `src/components/` has the screens and cards.
- `src/data/` has the seed stories, their timelines and the market snapshot.
- `scripts/` has the script that saved the market prices.
- `Design.md` is the design spec the app was built from.

## Next step

The real app needs a job that builds the edition every morning. It would search the news with Gemini grounding, extract the facts as JSON, and keep only the facts whose source appears in the grounding results. It would then match each fact to an existing story so the timeline grows, and store the result in Firestore. Cloud Scheduler would run it before breakfast.
