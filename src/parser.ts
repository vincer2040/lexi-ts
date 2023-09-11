import { Lexer } from "./lexer.js";
import { LexiTypes } from "./lexitypes.js";
import { Tokens } from "./token.js";
import type { Token, TokenT } from "./token.js";
import type { LexiValue } from "./lexitypes.js";

export class Parser extends Lexer {
    private cur: Token;
    private peek: Token;
    constructor(input: Buffer) {
        super(input);
        this.nextToken();
        this.nextToken();
    }

    public parse(): LexiValue {
        return this.parseStatement();
    }

    private parseStatement(): LexiValue {
        let lexiVal: LexiValue = { type: LexiTypes.bulk, value: "" };
        if (this.curTokIs(Tokens.type)) {
            if (this.cur.literal === "*") {
                lexiVal.type = LexiTypes.array;
                lexiVal.value = [];
                if (!this.expectPeek(Tokens.len)) {
                    console.log("handle error");
                    return lexiVal;
                }
                let len = parseInt(this.cur.literal);
                if (!this.expectPeek(Tokens.retcar)) {
                    console.log("handle retcar error");
                    return lexiVal;
                }
                if (!this.expectPeek(Tokens.newl)) {
                    console.log("handle newl error");
                    return lexiVal;
                }

                this.nextToken();

                let i: number;

                for (i = 0; i < len; ++i) {
                    lexiVal.value.push(this.parseStatement());
                }

                return lexiVal;
            }
            if (this.cur.literal === "$") {
                if (!this.expectPeek(Tokens.len)) {
                    console.log("handle error");
                    return lexiVal;
                }
                if (!this.expectPeek(Tokens.retcar)) {
                    console.log("handle retcar error");
                    return lexiVal;
                }
                if (!this.expectPeek(Tokens.newl)) {
                    console.log("handle newl error");
                    return lexiVal;
                }
                if (!this.expectPeek(Tokens.bulk)) {
                    console.log("handle no bulk error");
                    return lexiVal;
                }

                let bulkStr = this.cur.literal;
                lexiVal.value = bulkStr;

                if (!this.expectPeek(Tokens.retcar)) {
                    console.log("handle retcar error");
                    lexiVal.value = null;
                    return lexiVal;
                }
                if (!this.expectPeek(Tokens.newl)) {
                    console.log("handle newl error");
                    lexiVal.value = null;
                    return lexiVal;
                }

                this.nextToken();

                return lexiVal;
            }
        }

        if (this.curTokIs(Tokens.simple)) {
            lexiVal.value = this.cur.literal as string;
            lexiVal.type = LexiTypes.simple;
            return lexiVal;
        }

        if (this.curTokIs(Tokens.int)) {
            let val = BigInt(0);
            let i: number;
            let b = this.cur.literal as Buffer;
            let s = BigInt(8);
            for (i = 0; i < 8; ++i) {
                val = (val << s) | BigInt(b[i]);
            }
            lexiVal.value = val;
            lexiVal.type = LexiTypes.int;
            this.expectPeek(Tokens.retcar);
            this.expectPeek(Tokens.newl);
            this.nextToken();
            return lexiVal;
        }

        return lexiVal;
    }

    private curTokIs(type: TokenT): boolean {
        return this.cur.type === type;
    }

    private peekTokIs(type: TokenT): boolean {
        return this.peek.type === type;
    }

    private expectPeek(type: TokenT): boolean {
        if (this.peekTokIs(type)) {
            this.nextToken();
            return true;
        }
        return false;
    }

    private nextToken() {
        this.cur = this.peek;
        this.peek = this.lnextToken();
    }
}
