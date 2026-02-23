# Crown & Shadows — Backend

Node.js game server powering real-time multiplayer via **Fastify** and **Socket.IO**.

## Architecture

```
src/
├── index.ts          # Fastify server entry, Socket.IO setup, CORS
├── roomService.ts    # Socket event handlers (room lifecycle, match actions)
├── matchState.ts     # In-memory match registry & state serialization
├── gameActions.ts    # Authoritative turn phase engine (Draw → Play → Declare → Respond → Resolve)
├── types.ts          # Shared TypeScript types (CardClass, TurnPhase, MatchState, …)
└── zkHelper.ts       # Card commitment helper & public input encoder (ZK integration path)
```

## Socket Events

### Room Events
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `room:create` | Client→Server | `{ walletAddress }` | Create a new room; returns `{ roomId }` |
| `room:join` | Client→Server | `{ roomId, walletAddress }` | Join existing room |
| `room:get` | Client→Server | `{ roomId }` | Fetch room state |
| `room:update` | Server→Client | `Room` | Room state changed |
| `room:start_match` | Client→Server | `{ roomId }` | Host starts the match |
| `room:reconnect` | Client→Server | `{ roomId, walletAddress }` | Reconnect after disconnect |

### Match Events
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `match:started` | Server→Client | — | Match has begun |
| `match:state` | Server→Client | `ClientMatchState` | Per-player match snapshot |
| `match:draw` | Client→Server | `{ roomId }` | Draw a card |
| `match:play_card_face_down` | Client→Server | `{ roomId, cardId }` | Play card face-down |
| `match:declare_card` | Client→Server | `{ roomId, declaredClass, targetSlot?, targetGuess? }` | Declare card effect |
| `match:respond` | Client→Server | `{ roomId, response }` | Accept / Challenge / Counter |
| `match:error` | Server→Client | `string` | Action error message |
| `match:ended` | Server→Client | — | Match is over; navigate to result |

## Running Locally

```bash
npm install
npm run dev          # ts-node-dev hot reload on port 3001
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server listen port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
