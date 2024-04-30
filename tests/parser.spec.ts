import { describe, it, expect } from "vitest";
import { Parser } from "../src/parser";
import { DataType } from "../src/types";

describe("parser", () => {
    function checkError(p: Parser) {
        if (p.hasError()) {
            console.log(p.getError());
        }
        expect(p.hasError()).toBeFalsy();
    }

    it("can parse simple strings", () => {
        const tests = [
            { input: "+OK\r\n", exp: "OK" },
            { input: "+PONG\r\n", exp: "PONG" },
        ];
        for (const test of tests) {
            const input = Buffer.from(test.input);
            const parser = new Parser(input);
            const parsed = parser.parse();
            checkError(parser);
            expect(parsed.type).toBe(DataType.String);
            expect(parsed.data).toBe(test.exp);
        }
    });

    it("can parse bulk strings", () => {
        const tests = [
            { input: "$3\r\nfoo\r\n", exp: "foo" },
            { input: "$10\r\nfoo\r\nfoo\r\n\r\n", exp: "foo\r\nfoo\r\n" },
        ];
        for (const test of tests) {
            const input = Buffer.from(test.input);
            const parser = new Parser(input);
            const parsed = parser.parse();
            checkError(parser);
            expect(parsed.type).toBe(DataType.String);
            expect(parsed.data).toBe(test.exp);
        }
    });

    it("can parse integers", () => {
        const tests = [
            { input: ":123\r\n", exp: 123 },
            { input: ":12345\r\n", exp: 12345 },
        ];
        for (const test of tests) {
            const input = Buffer.from(test.input);
            const parser = new Parser(input);
            const parsed = parser.parse();
            checkError(parser);
            expect(parsed.type).toBe(DataType.Integer);
            expect(parsed.data).toBe(test.exp);
        }
    });

    it("can parse doubles", () => {
        const tests = [
            { input: ",123\r\n", exp: 123 },
            { input: ",12345.1234\r\n", exp: 12345.1234 },
        ];
        for (const test of tests) {
            const input = Buffer.from(test.input);
            const parser = new Parser(input);
            const parsed = parser.parse();
            checkError(parser);
            expect(parsed.type).toBe(DataType.Double);
            expect(parsed.data).toBe(test.exp);
        }
    });

    it("can parse simple errors", () => {
        const tests = [
            { input: "-ERR\r\n", exp: "ERR" },
            { input: "-ENOACCESS\r\n", exp: "ENOACCESS" },
        ];
        for (const test of tests) {
            const input = Buffer.from(test.input);
            const parser = new Parser(input);
            const parsed = parser.parse();
            checkError(parser);
            expect(parsed.type).toBe(DataType.Error);
            expect(parsed.data).toBe(test.exp);
        }
    });

    it("can parse bulk errors", () => {
        const tests = [
            { input: "!3\r\nfoo\r\n", exp: "foo" },
            { input: "!10\r\nfoo\r\nfoo\r\n\r\n", exp: "foo\r\nfoo\r\n" },
        ];
        for (const test of tests) {
            const input = Buffer.from(test.input);
            const parser = new Parser(input);
            const parsed = parser.parse();
            checkError(parser);
            expect(parsed.type).toBe(DataType.Error);
            expect(parsed.data).toBe(test.exp);
        }
    });
});
