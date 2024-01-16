import { LexiClient } from "lexi-ts"

async function main() {
    const client = new LexiClient("127.0.0.1", 6969);
    client.connect();
    await client.authenticate("root", "root");

    const setRes = await client.set("foo", "bar");
    console.log(setRes);

    const getRes = await client.get("foo");
    console.log(getRes);

    const delRes = await client.del("foo");
    console.log(delRes);

    client.close();
}

main();
