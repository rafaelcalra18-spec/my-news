# Design.md — My news (Minimalist Phone-First Architecture & Markets Integration)

## 1. Overview & Vision
*My news* is an intelligent daily news briefing web application designed for mobile phones (390 px viewport, centered at max 640 px on desktop) for readers who want to stay deeply informed without checking notifications throughout the day.
Every morning, the application presents a concise, fact-checked daily briefing anchored in verified reporting, day-by-day story evolution tracking, neutral coverage analysis, and live prediction market expectations embedded directly within relevant stories.

**Publication Date:** Saturday 31 October 2026.

---

## 2. Core Architecture & Navigation

```
┌────────────────────────────────────────────────────────┐
│               One-Line Solid Top Header                │
│  - 100% solid opaque background (no content bleed)     │
│  - App icon & title ("My news")                        │
│  - Date: "Saturday 31 October 2026"                    │
│  - Topics personalization icon button (top right)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Sticky Solid Section Filter Bar          │
│  - 100% solid opaque background (no content bleed)     │
│  - "All" (default)                                     │
│  - Reader-followed sections (e.g. Sport, Tech)         │
│  - Other sections (World, UK)                          │
│  - "Markets" (last tab: shows only market stories      │
│     sorted by 7-day price move magnitude)              │
│  - Sliding underline indicator (shared layoutId)       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Minimalist Today Feed Cards              │
│  - Entire card acts as a single interactive button     │
│  - Pressed animation: whileTap={{ scale: 0.98 }}       │
│  - Section tag (World, UK, Sport, Tech) & Status Tag   │
│  - Serif Headline with Chevron icon at right           │
│  - Plain metadata line: "Day N · X updates · Next"     │
│  - Updated stories: dated "What changed" line          │
│  - New stories: one-sentence summary under meta line   │
│  - Inline Prediction Market Block (if story has one):  │
│    * Platform and exact question on one line           │
│    * 28px Probability with 400ms count-up              │
│    * 7-day change in percentage points (+14.5 pts)     │
│    * 56px step chart spanning 100% full width of box   │
│    * Y-axis zooms to lowest and highest with 2 pts pad │
│    * First price printed left, current price right     │
│    * First date under left, "today" under right        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼ (tap card)
┌────────────────────────────────────────────────────────┐
│            Fullscreen Chronological Story View         │
│  - Single scrollbar for the entire page (no nested     │
│    inner scrollboxes)                                  │
│  - Top-opening view with progress bar & close button   │
│  - Headline & dated "What changed" line                │
│  - Market switchers naming the market ("Title 99%",    │
│    "Mexico win 36%", "House 94%", "Senate 72%")        │
│  - 200px step chart covering last 14 days of history:  │
│    * Line spans full chart width                       │
│    * Story entries inside 14-day range drawn           │
│    * Entries prior to 14 days omitted                  │
│    * Today's marker uses accent colour                 │
│    * Tapping a marker displays entry inspector panel   │
│    * Labels >= 13px, nothing outside chart box         │
│  - Factual background summary & "Why it matters to you"│
│  - Reader feedback buttons (Like & Dislike toggle)     │
│  - Full story comprehensive background reporting       │
│  - Chronological Timeline & Future Segment             │
│  - Neutral journalistic coverage table                 │
│  - Desktop hover navigation arrows outside column      │
└────────────────────────────────────────────────────────┘
```

---

## 3. Navigation System
1. **Header Navigation:**
   - One line containing the app icon, title ("My news"), and the date ("Saturday 31 October 2026").
   - A dedicated Topics button at the top right (`SlidersHorizontal` icon) allows opening the reader's profile and interest customization screen directly without cluttering the bottom.
   - **Solid Background:** Both the header and the sticky section filter bar have completely solid backgrounds (`bg-stone-50`), ensuring zero content bleed-through when scrolling.
2. **Bottom Bar Removal:**
   - The legacy bottom bar dock and the standalone Markets tab are completely removed.
   - Screen space is maximized on mobile for reading content.
3. **"Markets" Section Filter:**
   - "Markets" is placed as the final item in the sticky section filter bar (`All`, followed sections, other sections, `Markets`).
   - When selected, it filters the feed to only stories that have linked prediction markets, sorted strictly by the absolute magnitude of their seven-day move in descending order.

---

## 4. Minimalist Story Card Design
Each Today card is a single, unified button with clear affordance:
- **Button Behavior:** Tapping anywhere on the card scales it smoothly to `0.98` and opens the fullscreen story view.
- **Displayed Fields:**
  1. Section tag (World, UK, Sport, Tech) and status tag (Updated or New).
  2. Headline in serif typography with a right chevron (`ChevronRight`).
  3. Progression line: `"Day N · X updates · Next: <label>"`:
     - Canonical short labels:
       * Midterms: `"Next: Tue 3 Nov"`
       * Iran: `"Next: Iran's reply due"`
       * Mahmood: `"Next: decision next week"` (never "Next: Next week")
       * F1: `"Next: race Sun 8pm"`
       * Israel: `"Next: Wed 4 Nov"`
       * Patriot missile: `"Next: early 2030s"`
       * Canada & EU: `"Next: June 2027"`
       * Stories without upcoming events omit `"Next: ..."`.
  4. Content line:
     - For **Updated** stories: dated `"What changed · <Date>: <summary>"` in accent colour (`#c05621`).
     - For **New** stories: the story's one-sentence summary directly under the meta line.
  5. Prediction Market Block (if applicable).
- **Moved to Story View:** Full summary paragraphs, coverage rows, and like/dislike buttons are cleanly housed within the story deep dive.
- **Removed:** "Tap card to view timeline" helper text is eliminated.

---

## 5. Market Ingestion & Server Proxy (`/api/markets`)
1. **Server-Side Fetching:**
   - Market prices, daily candlestick histories, and 7-day momentum are ingested exclusively through Express server route `/api/markets` (never from client browser).
   - In-memory cache retains results for 5 minutes (300,000 ms) to avoid redundant requests and rate-limiting.
2. **Verified Contracts:**
   - **Story 1 (Iran ceasefire):** Polymarket (`us-iran-ceasefire-continues-throughptptpt`), "US x Iran ceasefire continues through November 8?".
   - **Story 5 (US midterms):** Kalshi House (`CONTROLH-2026-D`) & Senate (`CONTROLS-2026-D`).
   - **Story 11 (F1):** Kalshi Drivers Champion (`KXF1-26-KA`) & Mexico GP Winner (`KXF1RACE-MEX26-ANT`).
3. **Data Integrity & Fallback Protocol:**
   - If live API request succeeds:
     * Probability formatted cleanly.
     * 7-day change shown in **percentage points** (e.g. `+11.5 pts` or `+2.5 pts`), only if history reaches back at least 7 days.
     * Checked time displayed (e.g. `"checked 14:02"`).
   - If live API request fails or times out:
     * Displays saved price with label `"Saved price, 31 Oct"` and **nothing else** (no change, no volume, no chart).
4. **Volume Removal:**
   - Trading volume is completely removed everywhere in the application.

---

## 6. Chart Geometry & Visualizations
### A. In-Card Step Chart
- Full width, **56 px tall**.
- The step line spans the **100% full width** of its box (from left edge to right edge).
- The y-range **zooms to the line's own lowest and highest values, with 2 points (0.02) of padding**.
- First price percentage is printed at the left and current price percentage at the right.
- First date is printed under the left (e.g. "24 Oct") and `"today"` under the right.
- If history has fewer than 3 data points or if in fallback mode, no chart is shown.

### B. Story View Step Chart
- Full width, **200 px tall**.
- The x-axis covers the market's **last 14 days of history** (or all of it if shorter), rather than starting at the story's first entry.
- The step line spans the **full chart width**.
- Story entries inside this 14-day range are drawn as thin dashed vertical lines with dots on the x-axis; any entries falling before this window are omitted.
- Today's marker uses the accent colour (`#c05621`).
- Tapping any marker displays that day's entry in a small interactive panel under the chart with its date, description, and reported sources.
- **Market Switcher Buttons:** When a story has multiple markets (e.g. Story 11 and Story 5), switcher buttons name the market, taking live prices:
  * Story 11: `"Title 99%"` and `"Mexico win 36%"`
  * Story 5: `"House 94%"` and `"Senate 72%"`
- All elements sit strictly inside the chart box.
- All typography and labels are strictly ≥ 13 px.

---

## 7. Single Scrollbar & Responsive Discipline
- The fullscreen Story View scrolls as one continuous page from top to bottom.
- Inner scrolling containers and secondary scrollbars are eliminated.
- Keyboard navigation (Left, Right, Escape) and touch swipe gestures are supported.
- Floating next/previous arrows appear on desktop mouse hover outside the 640px text column only (never on touch screens).
