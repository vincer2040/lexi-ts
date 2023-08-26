import { Lexi } from "./lexi.js";


let client = new Lexi("127.0.0.1", 6969);

await client.connect();
await client.set("vince", "is cool");
await client.get("vince");
await client.del("vince");
client.close();

