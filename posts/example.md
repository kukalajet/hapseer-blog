---
title: "Building a tiny Habit Tracker with Next.js, Prisma, and SQLite"
date: "2025-08-01"
updated: "2025-08-29"
description: "From idea to deploy in a weekend: requirements, schema design, API routes, and UI polish."
slug: "habit-tracker-nextjs-prisma"
draft: false
tags:
  - nextjs
  - typescript
  - prisma
  - sqlite
  - tailwindcss
  - fullstack
categories:
  - engineering
  - walkthrough
author:
  name: "Jeton Kukala"
  url: "https://hapseer.com"
cover:
  image: "/images/posts/habit-tracker/cover.jpg"
  alt: "A minimal habit tracker UI showing streaks and check-ins"
  caption: "First iteration of the habit list with streak indicators."
reading_time: 9
canonical_url: "https://hapseer.com/blog/habit-tracker-nextjs-prisma"
---

I wanted a dead-simple habit tracker I could ship in a weekend. The goal: check off habits once per day, keep a streak, and get a quick pulse on where I’m at.

This post walks through the stack, data model, API, UI, and a few niceties like seed data and tests you can reuse for your own app.

- Stack: Next.js 14 (App Router), TypeScript, Prisma, SQLite, Tailwind CSS
- Auth: Email link or GitHub OAuth (via NextAuth)
- Deploy: Vercel
- DB: SQLite locally, Postgres in prod (via Prisma’s provider swap)

> Tip: Start with SQLite for local dev. It’s frictionless. When you’re ready, switch the Prisma provider to `postgresql`, run a migration, and redeploy.

---

## Table of contents

- [Requirements](#requirements)
- [Data model](#data-model)
- [Sample records](#sample-records)
- [API shape](#api-shape)
- [UI pieces](#ui-pieces)
- [State & optimistic updates](#state--optimistic-updates)
- [Testing](#testing)
- [Deployment notes](#deployment-notes)
- [What I’d do next](#what-id-do-next)

---

## Requirements

- [x] Create/edit/delete habits
- [x] Mark habit done per day (one check-in per habit per day)
- [x] See streaks for each habit
- [x] Filter by active/archived
- [ ] Calendar view
- [ ] Reminders/notifications
- [ ] Insights (success rate, longest streak, missed days)

Constraints:
- Mobile-first layout
- No over-engineering: one table for `Habit`, one for `CheckIn`
- All responses < 200ms p95 locally

---

## Data model

I kept the schema intentionally small. A `Habit` belongs to a `User`. A `CheckIn` is a habit+date tuple; uniqueness is enforced at the DB level.

#### Prisma schema

````prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite" // change to "postgresql" for production
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  habits    Habit[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Habit {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  cadence     String     @default("daily") // future: "weekly", "custom"
  archived    Boolean    @default(false)
  streak      Int        @default(0)
  longestStreak Int      @default(0)
  color       String?    // UI hint (e.g., "#10b981")
  checkIns    CheckIn[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([userId, archived])
}

model CheckIn {
  id        String   @id @default(cuid())
  habitId   String
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  date      DateTime
  note      String?

  @@unique([habitId, date])
  @@index([habitId, date])
}
````

#### SQL equivalent (for reference)

````sql
CREATE TABLE "Habit" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "cadence" TEXT NOT NULL DEFAULT 'daily',
  "archived" INTEGER NOT NULL DEFAULT 0,
  "streak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "color" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "CheckIn" (
  "id" TEXT PRIMARY KEY,
  "habitId" TEXT NOT NULL,
  "date" DATETIME NOT NULL,
  "note" TEXT,
  UNIQUE("habitId", "date")
);
````

---

## Sample records

These are realistic payloads you can use to build the UI and fake the backend.

````json
{
  "user": {
    "id": "usr_01J9C9ZKX6M9PV3G2F2D9X3A1B",
    "email": "demo@hapseer.com",
    "name": "Demo User"
  },
  "habits": [
    {
      "id": "hab_1",
      "name": "Drink water",
      "color": "#10b981",
      "cadence": "daily",
      "archived": false,
      "streak": 5,
      "longestStreak": 12,
      "createdAt": "2025-07-10T08:00:00.000Z",
      "updatedAt": "2025-08-01T08:00:00.000Z",
      "checkIns": [
        { "date": "2025-07-28", "note": "" },
        { "date": "2025-07-29", "note": "" },
        { "date": "2025-07-30", "note": "" },
        { "date": "2025-07-31", "note": "" },
        { "date": "2025-08-01", "note": "Morning glass" }
      ]
    },
    {
      "id": "hab_2",
      "name": "Morning walk",
      "color": "#3b82f6",
      "cadence": "daily",
      "archived": false,
      "streak": 0,
      "longestStreak": 7,
      "createdAt": "2025-06-20T08:00:00.000Z",
      "updatedAt": "2025-08-01T08:00:00.000Z",
      "checkIns": [
        { "date": "2025-07-26" },
        { "date": "2025-07-27" },
        { "date": "2025-07-28" },
        { "date": "2025-07-29" },
        { "date": "2025-07-30" },
        { "date": "2025-07-31" }
      ]
    },
    {
      "id": "hab_3",
      "name": "Read 10 pages",
      "color": "#f59e0b",
      "cadence": "daily",
      "archived": true,
      "streak": 0,
      "longestStreak": 21,
      "createdAt": "2025-05-01T08:00:00.000Z",
      "updatedAt": "2025-07-12T08:00:00.000Z",
      "checkIns": []
    }
  ]
}
````

---

## API shape

The API is intentionally thin. It returns denormalized data for the primary screens to reduce client-side joins.

- GET `/api/habits?archived=false` → list habits with today’s check-in status
- POST `/api/habits` → create
- PATCH `/api/habits/:id` → update fields (`name`, `archived`, `color`)
- DELETE `/api/habits/:id` → archive or hard-delete (configurable)
- POST `/api/habits/:id/check-ins` → create or toggle today
- DELETE `/api/check-ins/:checkInId` → remove a check-in

Example response for GET:

````json
{
  "habits": [
    {
      "id": "hab_1",
      "name": "Drink water",
      "color": "#10b981",
      "today": { "checked": true, "checkInId": "chk_abc123" },
      "streak": 5,
      "longestStreak": 12
    },
    {
      "id": "hab_2",
      "name": "Morning walk",
      "color": "#3b82f6",
      "today": { "checked": false, "checkInId": null },
      "streak": 0,
      "longestStreak": 7
    }
  ],
  "meta": { "date": "2025-08-01" }
}
````

Server route (Next.js App Router):

````ts
// app/api/habits/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const habits = await prisma.habit.findMany({
    where: { userId: user.id, archived: false },
    orderBy: { createdAt: "asc" },
    include: { checkIns: { where: { date: new Date().toISOString().slice(0, 10) } } }
  });

  const payload = habits.map(h => ({
    id: h.id,
    name: h.name,
    color: h.color,
    today: {
      checked: h.checkIns.length > 0,
      checkInId: h.checkIns[0]?.id ?? null
    },
    streak: h.streak,
    longestStreak: h.longestStreak
  }));

  return NextResponse.json({ habits: payload, meta: { date: new Date().toISOString().slice(0, 10) } });
}
````

---

## UI pieces

The UI is a single-column list with sticky header and a bottom sheet for notes.

- Top bar: date picker + “New Habit” button
- Habit row: color dot, name, streak badge, “done” toggle
- Filter chips: All / Active / Archived
- Empty states for each filter

React component snippet:

````tsx
// components/HabitRow.tsx
type HabitRowProps = {
  id: string;
  name: string;
  color?: string | null;
  streak: number;
  todayChecked: boolean;
  onToggle: (id: string, next: boolean) => void;
};

export function HabitRow({ id, name, color = "#10b981", streak, todayChecked, onToggle }: HabitRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{name}</span>
          <span className="text-xs text-gray-500">🔥 {streak} day{streak === 1 ? "" : "s"} streak</span>
        </div>
      </div>
      <button
        onClick={() => onToggle(id, !todayChecked)}
        aria-pressed={todayChecked}
        className={`h-8 w-8 rounded-full border transition ${
          todayChecked ? "bg-green-500 text-white border-green-600" : "bg-white text-gray-400 border-gray-300"
        }`}
        title={todayChecked ? "Mark as not done" : "Mark as done"}
      >
        ✓
      </button>
    </div>
  );
}
````

Example list screen state:

````json
{
  "filter": "active",
  "date": "2025-08-01",
  "habits": [
    { "id": "hab_1", "name": "Drink water", "color": "#10b981", "streak": 5, "todayChecked": true },
    { "id": "hab_2", "name": "Morning walk", "color": "#3b82f6", "streak": 0, "todayChecked": false }
  ]
}
````

---

## State & optimistic updates

- Toggle check-in:
  - Optimistically flip the button state
  - POST to `/api/habits/:id/check-ins`
  - If failure, roll back and show a toast

- Update streaks on the server
  - Increment if the current date is consecutive to the last check-in
  - Reset if there’s a gap
  - Keep `longestStreak` in sync

Edge cases:
- Timezones: compute “today” per user’s TZ[^1]
- Backfill: allow check-ins for prior dates (optional)

---

## Testing

A small set of tests go a long way:

- Unit tests for streak math
- API route tests for auth + toggling
- Component tests for `HabitRow` optimistic UI

Streak unit tests (Jest-style):

````ts
import { updateStreak } from "@/lib/streaks";

test("increments streak on consecutive day", () => {
  const yesterday = "2025-07-31";
  const today = "2025-08-01";
  const result = updateStreak({ current: 3, longest: 5 }, yesterday, today);
  expect(result).toEqual({ current: 4, longest: 5 });
});

test("resets streak on gap", () => {
  const last = "2025-07-29";
  const today = "2025-08-01";
  const result = updateStreak({ current: 7, longest: 10 }, last, today);
  expect(result).toEqual({ current: 1, longest: 10 });
});
````

---

## Deployment notes

| Concern         | Local (SQLite)              | Production (Postgres)            |
|-----------------|-----------------------------|----------------------------------|
| Provider        | sqlite                      | postgresql                       |
| URL             | file:./dev.db               | postgres://user:pass@host/db     |
| Migrations      | prisma migrate dev          | prisma migrate deploy             |
| Auth secrets    | .env.local                  | Vercel project env vars          |
| Preview deploys | Same DB file per branch     | Separate schema or database      |

> Warning: Don’t check in your SQLite file if it contains real user data. Add it to `.gitignore` and seed your dev DB instead.

Seed script (excerpt):

````ts
// prisma/seed.ts
import { prisma } from "@/lib/prisma";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@hapseer.com" },
    update: {},
    create: { email: "demo@hapseer.com", name: "Demo User" }
  });

  const drink = await prisma.habit.create({
    data: { userId: user.id, name: "Drink water", color: "#10b981" }
  });

  const dates = ["2025-07-28", "2025-07-29", "2025-07-30", "2025-07-31", "2025-08-01"];
  await prisma.checkIn.createMany({
    data: dates.map(d => ({ habitId: drink.id, date: new Date(d) }))
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
````

---

## What I’d do next

- Calendar heatmap per habit
- Weekly cadence support
- Notifications (email/push) for missed days
- Insights dashboard (success rate, top habits, longest streaks)
- Export to CSV
- Offline-first with background sync

---

[^1]: Normalize “today” using the user’s timezone, e.g. store `tz` with the user profile and evaluate “is this check-in for today?” in that TZ before writing streaks.