import { describe, it, expect } from "vitest";
import { Builder } from "../src/builder";

describe("builder", () => {
    it("can build bulk strings", () => {
        let builder = new Builder();

        let [buf, len] = builder
            .addBulk("vince")
            .out();

        expect(len).toBe(11);
        expect(buf.filter(x => x !== 0).toString()).toBe("$5\r\nvince\r\n");
    });

    it("can build arrays strings", () => {
        let builder = new Builder();

        let [buf, len] = builder
            .addArr(3)
            .addBulk("SET")
            .addBulk("vince")
            .addBulk("is cool")
            .out();
        let expString ="*3\r\n$3\r\nSET\r\n$5\r\nvince\r\n$7\r\nis cool\r\n";

        let ts = buf.filter(x => x !== 0).toString();

        expect(len).toBe(expString.length);
        expect(ts).toBe(expString);
    });

    it("can build big ints", () => {
        let builder = new Builder();
        let num = BigInt(42069);

        let [buf, len] = builder
            .add64BitInt(num)
            .out();

        expect(len).toBe(11);
        expect(buf[0]).toBe(":".charCodeAt(0));
        expect(buf[1]).toBe("\0".charCodeAt(0));
        expect(buf[2]).toBe("\0".charCodeAt(0));
        expect(buf[3]).toBe("\0".charCodeAt(0));
        expect(buf[4]).toBe("\0".charCodeAt(0));
        expect(buf[5]).toBe("\0".charCodeAt(0));
        expect(buf[6]).toBe("\0".charCodeAt(0));
        expect(buf[7]).toBe(164);
        expect(buf[8]).toBe(85);
        expect(buf[9]).toBe("\r".charCodeAt(0));
        expect(buf[10]).toBe("\n".charCodeAt(0));
    })
});
