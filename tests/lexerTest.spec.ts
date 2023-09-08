import { describe, it, expect } from "vitest";
import { Lexer } from "../src/lexer";
import { Tokens } from "../src/token";
import { Builder } from "../src/builder";
import type { Token } from "../src/token";

describe("lexer", () => {
    it("can lex bulk strings", () => {
        let input = "$7\r\nis cool\r\n";
        let lex = new Lexer(Buffer.from(input));
        let expTokens: Array<Token> = [
            { type: Tokens.type, literal: "$", },
            { type: Tokens.len, literal: "7", },
            { type: Tokens.retcar, literal: "\r", },
            { type: Tokens.newl, literal: "\n", },
            { type: Tokens.bulk, literal: "is cool", },
            { type: Tokens.retcar, literal: "\r", },
            { type: Tokens.newl, literal: "\n", },
            { type: Tokens.eoft, literal: "", },
        ];

        let i: number, len = expTokens.length;

        for (i = 0; i < len; ++i) {
            let expAt = expTokens[i];
            let tok = lex.lnextToken();
            expect(tok.type).toBe(expAt.type);
            expect(tok.literal).toBe(tok.literal);
        }
    });

    it("can lex simple strings", () => {
        let input = "+Ok\r\n";
        let lex = new Lexer(Buffer.from(input));
        let expTokens: Array<Token> = [
            { type: Tokens.simple, literal: "Ok", },
            { type: Tokens.retcar, literal: "\r", },
            { type: Tokens.newl, literal: "\n", },
        ];

        let i: number, len = expTokens.length;

        for (i = 0; i < len; ++i) {
            let expAt = expTokens[i];
            let tok = lex.lnextToken();
            expect(tok.type).toBe(expAt.type);
            expect(tok.literal).toBe(tok.literal);
        }
    });

    it("can lex arrays", () => {
        let input = "*2\r\n$7\r\nis cool\r\n$5\r\nvince\r\n";
        let lex = new Lexer(Buffer.from(input));
        let expTokens: Array<Token> = [
            { type: Tokens.type, literal: "*", },
            { type: Tokens.len, literal: "2", },
            { type: Tokens.retcar, literal: "\r", },
            { type: Tokens.newl, literal: "\n", },
            { type: Tokens.type, literal: "$", },
            { type: Tokens.len, literal: "7", },
            { type: Tokens.retcar, literal: "\r", },
            { type: Tokens.newl, literal: "\n", },
            { type: Tokens.bulk, literal: "is cool", },
            { type: Tokens.retcar, literal: "\r", },
            { type: Tokens.newl, literal: "\n", },
            { type: Tokens.type, literal: "$", },
            { type: Tokens.len, literal: "5", },
            { type: Tokens.retcar, literal: "\r", },
            { type: Tokens.newl, literal: "\n", },
            { type: Tokens.bulk, literal: "vince", },
            { type: Tokens.retcar, literal: "\r", },
            { type: Tokens.newl, literal: "\n", },
            { type: Tokens.eoft, literal: "", },
        ];

        let i: number, len = expTokens.length;

        for (i = 0; i < len; ++i) {
            let expAt = expTokens[i];
            let tok = lex.lnextToken();
            expect(tok.type).toBe(expAt.type);
            expect(tok.literal).toBe(tok.literal);
        }
    })

    it("can lex integers", () => {
        let builder = new Builder();
        let lit = Buffer.from([0, 0, 0, 0, 0, 0, 0xa4, 0x55,]);
        let tests = [
            { type: Tokens.int, literal: lit },
            { type: Tokens.retcar, literal: "\r" },
            { type: Tokens.newl, literal: "\n" },
        ];

        let [buf, _] = builder
            .add64BitInt(BigInt(42069))
            .out();
        let l = new Lexer(buf);
        let i: number, len = tests.length;
        for (i = 0; i < len; ++i) {
            let expAt = tests[i];
            let tok = l.lnextToken();
            expect(tok.type).toBe(expAt.type);
            expect(tok.literal).toEqual(expAt.literal);
        }
    });
});
