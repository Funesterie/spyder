# @funeste38/spyder

`spyder` packages the lightweight local assistant primitives of the Funesterie ecosystem.

It focuses on a small programmable server surface rather than a giant framework: start a TCP-aware runtime, keep a simple in-memory state, and bridge packets or events to another service such as A11.

## Install

```bash
npm install @funeste38/spyder
```

## What You Get

- `createSpyderServer(...)` to start a small Spyder runtime in-process
- a simple memory object attached to the running server
- a custom `sendToA11` bridge hook so A11 integration stays explicit
- a package that is small enough to embed into local tooling or automation

## Quick Example

```ts
import { createSpyderServer } from "@funeste38/spyder";

const server = createSpyderServer({
  port: 4500,
  sendToA11: async (payload) => {
    console.log("bridge payload", payload);
    return new Uint8Array();
  }
});

await server.start();
await server.stop();
```

## Development

```bash
npm install
npm run build
npm test
```

## Notes

- this package is intentionally local-first
- deeper socket and protocol integrations can be layered on top
- if you need the larger orchestration stack, use `@funeste38/qflush`
