import { describe, it, expect } from "vitest";
import { Parser } from "../src/parser";
import { Type } from "../src/lexiData";

type SimpleTest = {
    input: Buffer,
    exp: Type,
};

type IntTest = {
    input: Buffer,
    exp: number,
};

type DoubleTest = IntTest;

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

    it("can parse integers", () => {
        const tests: IntTest[] = [
            { input: Buffer.from(":1337\r\n"), exp: 1337 },
            { input: Buffer.from(":-1337\r\n"), exp: -1337 },
        ];

        for (const test of tests) {
            const parser = new Parser(test.input);
            const data = parser.parse();
            expect(data.type).toBe(Type.Int);
            const int = data.data as number;
            expect(int).toBe(test.exp);
        }
    });

    it("can parse doubles", () => {
        const tests: DoubleTest[] = [
            { input: Buffer.from(",1337.1337\r\n"), exp: 1337.1337 },
            { input: Buffer.from(",1337\r\n"), exp: 1337 },
            { input: Buffer.from(",-1337\r\n"), exp: -1337 },
        ];
        for (const test of tests) {
            const parser = new Parser(test.input);
            const data = parser.parse();
            expect(data.type).toBe(Type.Double);
            const dbl = data.data as number;
            expect(dbl).toBe(test.exp);
        }
    });
});
