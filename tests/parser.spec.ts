import { describe, it, expect } from "vitest";
import { Parser } from "../src/parser";
import { Type } from "../src/lexiData";

type SimpleTest = {
    input: Buffer,
    exp: Type,
};

describe("parser", () => {
    it("can parse strings", () => {
        const input = Buffer.from("$3\r\nfoo\r\n");
        const parser = new Parser(input);
        const data = parser.parse();
        expect(data.type).toBe(Type.String);
        expect(data.data).toBeTypeOf("string");
        expect(data.data).toBe("foo");
    });

    it("can parse simple strings", () => {
        const tests: SimpleTest[] = [
            { input: Buffer.from("+OK\r\n"), exp: Type.Ok },
            { input: Buffer.from("+NONE\r\n"), exp: Type.None },
        ];

        for (const test of tests) {
            const parser = new Parser(test.input);
            const data = parser.parse();
            expect(data.type).toBe(test.exp);
            expect(data.data).toBeNull();
        }
    });
});
