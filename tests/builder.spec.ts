import { describe, it, expect } from "vitest";
import { Builder } from "../src/builder";

describe("builder", () => {
    it("can build strings", () => {
        const buffer = new Builder()
            .addString("foo")
            .out();
        const exp = "$3\r\nfoo\r\n";
        for (let i = 0; i < exp.length; ++i) {
            const ch = exp.charCodeAt(i);
            expect(ch).toBe(buffer[i]);
        }
    });

    it("can build arrays", () => {
        const buffer = new Builder()
            .addArray(3)
            .addString("SET")
            .addString("foo")
            .addString("bar")
            .out();
        const exp = "*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n";
        for (let i = 0; i < exp.length; ++i) {
            const ch = exp.charCodeAt(i);
            expect(ch).toBe(buffer[i]);
        }
    });
});
