import { describe, it, expect } from "vitest";
import { Parser } from "../src/parser";
import { LexiTypes, LexiValue } from "../src/lexitypes";

describe("parser", () => {
    it("can parse bulk strings", () => {
        let input = "$7\r\nis cool\r\n";
        let parser = new Parser(input);
        let lexiVal = parser.parse();
        expect(lexiVal.type).toBe(LexiTypes.bulk);
        expect(lexiVal.value).toBe("is cool");
    });

    it("can parse arrays", () => {
        let input = "*2\r\n$5\r\nvince\r\n$7\r\nis cool\r\n";
        let parser = new Parser(input);
        let lexiVal = parser.parse();
        expect(lexiVal.type).toBe(LexiTypes.array);
        let arr = lexiVal.value as Array<LexiValue>;
        let i: number, len = arr.length;

        expect(len).toBe(2);
        for (i = 0; i < len; ++i) {
            let at = arr[i];
            expect(at.type).toBe(LexiTypes.bulk);
        }
    });

    it("can parse simple strings", () => {
        let input = "+OK\r\n";
        let parser = new Parser(input);
        let lexiVal = parser.parse();
        expect(lexiVal.type).toBe(LexiTypes.simple);
        expect(lexiVal.value).toBe("OK");
    });

    it.todo("can parse integers");
});

