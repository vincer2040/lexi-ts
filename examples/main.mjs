import Lexi from "../dist/lexi.mjs";

let client = new Lexi("127.0.0.1", 6969);

await client.connect();

let x = client.multi()
    .addSet("vince", "is cool")
    .addGet("vince")
    .addEntries();

let v = await x.done();

console.log(v);

client.close();
