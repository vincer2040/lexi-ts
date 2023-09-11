import { describe, it, expect } from "vitest";
import { Parser } from "../src/parser";
import { LexiTypes, LexiValue } from "../src/lexitypes";
import { Builder } from "../src/builder";

describe("parser", () => {
    it("can parse bulk strings", () => {
        let input = "$7\r\nis cool\r\n";
        let parser = new Parser(Buffer.from(input));
        let lexiVal = parser.parse();
        expect(lexiVal.type).toBe(LexiTypes.bulk);
        expect(lexiVal.value).toBe("is cool");
    });

    it("can parse arrays", () => {
        let input = "*2\r\n$5\r\nvince\r\n$7\r\nis cool\r\n";
        let parser = new Parser(Buffer.from(input));
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
        let parser = new Parser(Buffer.from(input));
        let lexiVal = parser.parse();
        expect(lexiVal.type).toBe(LexiTypes.simple);
        expect(lexiVal.value).toBe("OK");
    });

    it("can parse integers", () => {
        let builder = new Builder();

        let [buf, _] = builder
            .add64BitInt(BigInt(42069))
            .out();

        let parser = new Parser(buf);
        let lexiVal = parser.parse();
        expect(lexiVal.type).toBe(LexiTypes.int);
        expect(lexiVal.value).toBe(BigInt(42069));
    });

    it("can parse nested arrays", () => {
        let builder = new Builder();
        let buf = builder
            .addArr(3)
            .addArr(2)
            .addBulk("vince")
            .add64BitInt(BigInt(42069))
            .addArr(2)
            .addBulk("dom")
            .addBulk("brother")
            .addArr(2)
            .addBulk("madi")
            .addBulk("sister")
            .out();
        let expects = [
            ["vince", BigInt(42069)],
            ["dom", "brother"],
            ["madi", "sister"],
        ];
        let parser = new Parser(buf[0]);
        let lexiVal = parser.parse();
        expect(lexiVal.type).toBe(LexiTypes.array);
        let a = lexiVal.value as Array<LexiValue>;
        a.forEach((x, i) => {
            expect(x.type).toBe(LexiTypes.array);
            let v = x.value as Array<LexiValue>;
            if (i !== 0) {
                expect(v[0].type).toBe(LexiTypes.bulk);
                expect(v[1].type).toBe(LexiTypes.bulk);
                expect(v[0].value).toBe(expects[i][0]);
                expect(v[1].value).toBe(expects[i][1]);
            } else {
                expect(v[0].type).toBe(LexiTypes.bulk);
                expect(v[1].type).toBe(LexiTypes.int);
                expect(v[0].value).toBe(expects[i][0]);
                expect(v[1].value).toBe(expects[i][1]);
            }
        })
    })
});

