# Lexi-ts

a typescript/javascript library for interacting with [LexiDB](https://github.com/vincer2040/lexidb),
an in-memory data structure database.

## Install

### npm

```console
npm i lexi-ts
```

### pnpm

```console
pnpm add lexi-ts
```

### yarn

```console
yarn add lexi-ts
```

## Usage

```ts

import { LexiClient } from "lexi-ts";

async function example() {
    let client = new LexiClient("<addr>", <port>);
    client.connect();
    let setResult = await client.set("foo", "bar");
    console.log(setResult); // "OK"
    let getResult = await client.get("foo");
    console.log(getResult);
    let delResult = await client.del("foo");
    console.log(delResult);
    client.close();
}

example()
```

for a more thorough example, see examples/main.js
