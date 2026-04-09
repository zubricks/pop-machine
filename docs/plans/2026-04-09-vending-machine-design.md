# Vending Machine Design

**Date:** 2026-04-09
**Concept:** "I used a CMS as a vending machine backend"

## Overview

A CSS-rendered vending machine frontend backed by Payload CMS for inventory. The machine looks like a classic late-80s Coke machine (charcoal body, red branded panel). Users click to insert coins, then select a soda. Purchases hit a real Payload endpoint that decrements stock in MongoDB. The Payload admin panel serves as the restock UI.

## Data Model

One `Products` collection:

| Field      | Type   | Notes                              |
| ---------- | ------ | ---------------------------------- |
| `name`     | text   | "Coke", "Diet Coke", etc.          |
| `color`    | text   | Hex color for button/can rendering |
| `price`    | number | In cents (e.g. `125` = $1.25)      |
| `stock`    | number | Current inventory count            |
| `position` | number | 1–6, determines slot order         |

Six products seeded: Coke, Diet Coke, Sprite, Dr Pepper, Fanta, Root Beer. Starting stock: 10 each.

## Backend

**Endpoint:** `POST /api/purchase`
**File:** `src/app/(payload)/api/purchase/route.ts`
**Auth:** None (public)
**Request:** `{ productId: string }`
**Response (success):** `{ success: true, remaining: number }`
**Response (out of stock):** `{ success: false, reason: 'out_of_stock' }`

Logic:

1. Read product stock
2. If 0 → return out_of_stock
3. If > 0 → `payload.update()` to decrement, return success + new stock

## Frontend

**Page:** `/` — single client component
**Approach:** Option A — client component + REST endpoint

### Layout

```
┌─────────────────────────────────┐
│  ██████████████  │  COIN SLOT   │
│  █            █  │  [$1.25 ▼]  │
│  █  PAYLOAD   █  │  ──────────  │
│  █   POP  🥤  █  │  [■] [■]    │
│  █            █  │  [■] [■]    │
│  ██████████████  │  [■] [■]    │
├─────────────────────────────────┤
│         [ dispense tray ]       │
└─────────────────────────────────┘
```

- **Left panel (~55%):** Charcoal body, large red "Payload Pop" branded section in Coke-style script
- **Right panel (~45%):** Coin acceptor (click = +$0.25), digital balance display, 2×3 selection button grid
- **Bottom tray:** Can animation landing zone

### Interactions

**Happy path:**

1. Click coin slot → balance increments by $0.25 per click
2. Click soda button (enabled when balance ≥ price) → button depresses
3. Optimistic: colored can animates down into tray (~600ms drop + bounce)
4. `POST /api/purchase` fires in parallel → stock count on button updates
5. Balance decrements by price

**Sad path (out of stock):**

1. Click out-of-stock button → machine shakes left-right
2. Display flashes "SOLD OUT"
3. API confirms `out_of_stock`, coins not deducted

**Button visual states:**

- **Disabled** (insufficient balance) — dimmed, no hover
- **Available** — full color, hover brightens
- **Out of stock** — greyed, "SOLD OUT" overlay, shake animation on click

### Animations

- Pure CSS keyframes, no animation library
- Can drop: translate Y from button area into tray + bounce easing
- Machine shake: small translateX oscillation
- Button depress: scale(0.95) + slight translateY

## File Structure

```
src/
├── collections/
│   └── Products.ts
├── app/
│   ├── (payload)/api/
│   │   └── purchase/route.ts
│   └── (frontend)/
│       ├── page.tsx
│       └── styles.css
├── seed.ts
└── payload.config.ts  (updated)
```

## Out of Scope

- Coin persistence (resets on refresh — intentional)
- Transaction history
- Multiple quantity purchase
- Change/refund mechanics beyond not charging on out-of-stock
