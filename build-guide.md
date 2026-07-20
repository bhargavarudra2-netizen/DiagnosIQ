# Life-Log App — Step-by-Step Build Guide

This follows your own roadmap: small modular milestones, usable app first, AI layered on top.
Stack: **React Native (Expo) + TypeScript + Supabase + FastAPI + Gemini/OpenAI**.

---

## Phase 0 — Environment & Project Setup

1. **Install tooling**
   ```bash
   node -v        # v18+ recommended
   npm install -g expo-cli eas-cli
   ```
2. **Create the Expo app**
   ```bash
   npx create-expo-app lifelog --template expo-template-blank-typescript
   cd lifelog
   npx expo install react-native-safe-area-context react-native-screens
   npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
   npx expo install react-native-gesture-handler react-native-reanimated
   ```
3. **Folder structure**
   ```
   lifelog/
     app/
       screens/       (Home, Timeline, AI, Analytics, Profile, Login)
       components/
       navigation/
       lib/            (supabase client, api client)
       types/
       hooks/
       store/          (zustand or context)
     assets/
   ```
4. **State management**: install `zustand` (lighter than Redux for this scope).
   ```bash
   npm install zustand
   ```
5. **Create a GitHub repo, commit this skeleton.** This is your first real "commit" — fitting, given the concept.

---

## Phase 1 — Usable MVP (matches your "What We Build First")

Goal: you can log entries and see them, before any AI exists.

### 1.1 Supabase project setup
1. Create a project at supabase.com.
2. Enable **Email** and **Google** providers under Authentication → Providers.
3. Note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
4. Install client in the app:
   ```bash
   npx expo install @supabase/supabase-js react-native-url-polyfill
   ```
5. `app/lib/supabase.ts`:
   ```ts
   import 'react-native-url-polyfill/auto';
   import { createClient } from '@supabase/supabase-js';
   import AsyncStorage from '@react-native-async-storage/async-storage';

   export const supabase = createClient(
     process.env.EXPO_PUBLIC_SUPABASE_URL!,
     process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
     {
       auth: {
         storage: AsyncStorage,
         autoRefreshToken: true,
         persistSession: true,
         detectSessionInUrl: false,
       },
     }
   );
   ```
6. Store keys in `.env` (never commit) and reference via `app.config.ts` `extra` field.

### 1.2 Database schema (run in Supabase SQL editor)
```sql
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  timestamp timestamptz default now(),
  raw_text text not null,
  ai_summary jsonb,
  activity text,
  project_id uuid,
  tags text[],
  metadata jsonb,
  created_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);

alter table entries enable row level security;
alter table projects enable row level security;

create policy "Users manage their own entries"
  on entries for all using (auth.uid() = user_id);

create policy "Users manage their own projects"
  on projects for all using (auth.uid() = user_id);
```
RLS is essential here — this is personal life data, lock it down from day one.

### 1.3 Auth screens
- Build `LoginScreen.tsx`: email/password fields + "Continue with Google" button.
- Google login on native requires `expo-auth-session` + Supabase's OAuth redirect flow (or `expo-web-browser` for the redirect). Use Supabase's official React Native OAuth guide for the exact redirect URI config — this part is fiddly and worth getting right early.
- On successful auth, store session; use `supabase.auth.onAuthStateChange` to drive navigation (Login stack vs Main tab stack).

### 1.4 Home screen — the single input box
- One `TextInput` (multiline), placeholder `"What's happening?"`, and a **Commit** button.
- On submit:
  ```ts
  async function commitEntry(text: string) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('entries').insert({
      user_id: user!.id,
      raw_text: text,
      timestamp: new Date().toISOString(),
    });
  }
  ```
- Clear the input, show a lightweight success state (not a modal — keep it fast, matching your "speed > effects" principle).

### 1.5 Timeline screen
- Query entries ordered by timestamp:
  ```ts
  const { data } = await supabase
    .from('entries')
    .select('*')
    .order('timestamp', { ascending: true });
  ```
- Render as a `FlatList` of simple cards: time, raw text. Group by day with sticky section headers (WhatsApp-style).
- Add pull-to-refresh and realtime subscription (`supabase.channel(...).on('postgres_changes', ...)`) so new commits appear instantly — this gets you "cloud sync" for free since Supabase is the source of truth.

**✅ End of Phase 1: you have a working, syncing, authenticated commit-log app.** This is your daily-use checkpoint — start actually using it before moving on.

---

## Phase 2 — AI Structuring Layer

Goal: raw text → structured data, without ever touching or overwriting the original.

### 2.1 Backend service
```bash
mkdir lifelog-api && cd lifelog-api
python3 -m venv venv && source venv/bin/activate
pip install fastapi uvicorn supabase python-dotenv google-generativeai
```
- `main.py`: a FastAPI app with one endpoint `POST /process-entry` that:
  1. Accepts `entry_id`.
  2. Fetches the raw entry from Supabase (using a service-role key, backend-only).
  3. Sends the raw text to Gemini/OpenAI with a structured-output prompt.
  4. Writes the structured result back into `ai_summary`, `activity`, `tags`, `metadata` on that row.

### 2.2 Structured-output prompt design
Ask the model to return **strict JSON only**:
```
Given this personal log entry, extract:
- activity_finished (string or null)
- activity_started (string or null)
- category (Study/Coding/Reading/Break/Exercise/Idea/Other)
- confidence (0-100)
- suggested_project (string or null)
Return JSON only, no prose.
```
Parse defensively — strip markdown fences, validate with a schema (e.g. `pydantic`) before writing to the DB.

### 2.3 Trigger mechanism
Two options, pick one for MVP:
- **Simple**: after `commitEntry()` in the app, call your FastAPI endpoint directly (fire-and-forget).
- **Robust**: use a Supabase Database Webhook or Edge Function triggered on `insert` into `entries`, which calls your FastAPI service. This decouples the app from AI latency/failures.
Start simple, migrate to the webhook once Phase 1 usage patterns are clear.

### 2.4 Update Timeline UI
- Show AI tags as small chips under each entry once `ai_summary` is populated (poll or realtime-subscribe to the update).
- If `ai_summary` is null, show nothing extra — the raw text is still the source of truth, per your "never lose the original" rule.

**✅ End of Phase 2: every commit is auto-tagged and categorized.**

---

## Phase 3 — Summaries, Planning, Search

### 3.1 Daily Summary
- New FastAPI endpoint `POST /daily-summary` — pulls all entries for a `user_id` + date, sends them to the model with a prompt asking for: Completed / Pending / Ideas / Time Spent / Suggested Tomorrow.
- Store result in a new `summaries` table (`id, user_id, date, content jsonb`).
- Trigger via a scheduled job (cron on the backend, or Supabase scheduled Edge Function) run nightly, plus an on-demand "Generate Summary" button in the AI screen.

### 3.2 AI Planner
- Reuse the daily summary's "Suggested Tomorrow" field, or a separate prompt that looks at the last N days plus open/pending items.
- Store as a `plans` table keyed by date; show at the top of Home screen next morning ("Today's Plan").

### 3.3 Search
- MVP: full-text search via Postgres (`raw_text` + `ai_summary` columns with a `tsvector` index).
  ```sql
  alter table entries add column search_vector tsvector
    generated always as (to_tsvector('english', raw_text)) stored;
  create index entries_search_idx on entries using gin(search_vector);
  ```
- Later: semantic search via embeddings (pgvector extension in Supabase) for natural-language queries like "when did I start React."

### 3.4 AI chat screen
- Simple chat UI; each message triggers a backend call that combines: user question + relevant retrieved entries (via search/embeddings) + conversation history → model → answer.

**✅ End of Phase 3: the AI layer described in section 3 of your doc is functional.**

---

## Phase 4 — Projects, Tags, Analytics

1. **Projects**: CRUD screen; when AI structures an entry, if `suggested_project` doesn't match an existing project, show a one-tap "Link to new project?" confirmation (matches your "auto-link or suggest" spec).
2. **Tags**: already generated in Phase 2 — surface a tag-filter view on Timeline.
3. **Analytics**:
   - Aggregate queries (Postgres `group by` on category/day/week/month) exposed via a FastAPI `/analytics` endpoint.
   - Render with `react-native-svg` + `victory-native` or `react-native-gifted-charts` for heatmaps/graphs.
   - Compute streaks/most-active-time server-side, cache in a table refreshed nightly alongside the daily summary job.

---

## Phase 5 — Guardian Mode, Notifications, Media, Export

1. **Export**: backend endpoints that serialize a user's entries to JSON/CSV directly from Postgres; Markdown/PDF via a templating step (reuse your PDF/DOCX generation approach if building this in-house).
2. **Notifications**: Expo push notifications for nightly summary-ready alerts and planner reminders.
3. **Images/Voice/Files**: enable Supabase Storage bucket, add attachment picker to Home screen, store storage path in `entries.metadata`. Voice notes can be transcribed via the same AI pipeline before structuring.
4. **Guardian Mode**: new `guardian_access` table (`owner_id, guardian_id, scope jsonb`) with RLS policies granting scoped read access — this is the most security-sensitive feature, build and test it last, in isolation.

---

## Build Order Cheat Sheet

| Order | Deliverable | You can start using it after this |
|---|---|---|
| 1 | Expo skeleton + navigation | — |
| 2 | Supabase auth + schema + RLS | — |
| 3 | Home (commit) + Timeline + sync | ✅ Yes |
| 4 | FastAPI structuring service | — |
| 5 | AI tags visible in Timeline | ✅ Better |
| 6 | Daily summary + planner | ✅ Much better |
| 7 | Search + AI chat | — |
| 8 | Projects/tags UI + analytics | — |
| 9 | Export, notifications, media | — |
| 10 | Guardian mode | — |

## Practical notes for AI-assisted coding
- Feed the AI (Claude Code, etc.) **one phase, one file at a time** — e.g. "build LoginScreen.tsx per this spec" rather than "build the app."
- Give it the schema and the RLS policies up front in every backend-related session so it doesn't guess at table shapes.
- After each phase, commit to git and manually smoke-test on a real device via Expo Go before moving to the next phase.
