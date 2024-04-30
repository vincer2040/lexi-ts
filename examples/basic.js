import { LexiClient } from "../dist/lexi.js";

async function main() {
    const client = new LexiClient({ ip: "127.0.0.1", port: 5173 });

    client.connect();

    const setRes = await client.set("foo", "bar");

    console.log(setRes);

    const getRes = await client.get("foo");
    console.log(getRes);

    const delRes = await client.del("foo");
    console.log(delRes);

    client.close();
}

main();
