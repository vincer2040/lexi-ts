# Lexi-ts

a typescript/javascript library for interacting with LexiDB,
an in-memory data structure database.

## Usage

```ts

import Lexi from "lexi-ts";

async function example() {
    let client = new Lexi.default(<addr>, <port>);
    await client.connect();
    let setResult = await client.set("foo", "bar"); // "OK"
    let getResult = await client.get("foo"); // "bar"
    let delResult = await client.del("foo"); // "OK"
    client.close();
}

```
