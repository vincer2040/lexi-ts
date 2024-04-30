import { describe, it, expect } from "vitest";
import { Builder } from "../src/builder";

type IntTest = {
    num: number,
    exp: string,
};

describe("builder", () => {
    it("can build strings", () => {
        const buffer = new Builder()
            .addBulkString("foo")
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
            .addBulkString("SET")
            .addBulkString("foo")
            .addBulkString("bar")
            .out();
        const exp = "*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n";
        for (let i = 0; i < exp.length; ++i) {
            const ch = exp.charCodeAt(i);
            expect(ch).toBe(buffer[i]);
        }
    });

    it("can build integers", () => {
        const tests: IntTest[] = [
            { num: 1337, exp: ":1337\r\n" },
            { num: -1337, exp: ":-1337\r\n" },
        ];
        for (let i = 0; i < tests.length; ++i) {
            const t = tests[i];
            let buf = new Builder().addInt(t.num).out();
            for (let j = 0; j < t.exp.length; ++j) {
                const got = buf[j];
                const exp = t.exp.charCodeAt(j);
                expect(got).toBe(exp);
            }
        }
    });
});
