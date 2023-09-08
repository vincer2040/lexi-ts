import Client from "./lexi.js";


let client = new Client("127.0.0.1", 6969);

await client.connect();
await client.set("vince", "is cool");
await client.get("vince");
await client.del("vince");

await client.setInt("vince", 42069);
await client.get("vince");

await client.clusterNew("fam");
await client.clusterSet("fam", "vince", "brother");
await client.clusterSet("fam", "dom", "brother");
await client.clusterSet("fam", "madi", "sister");
await client.clusterSet("fam", "frank", "dog");
await client.clusterSet("fam", "lomein", "kitty");

await client.clusterGet("fam", "vince");

await client.clusterDel("fam", "vince");
await client.clusterDrop("fam");

client.close();

