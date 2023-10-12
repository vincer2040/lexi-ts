import { Lexer } from "./lexer.js";
import { LexiTypes } from "./lexitypes.js";
import { Tokens } from "./token.js";
import type { Token, TokenT } from "./token.js";
import type { LexiValue } from "./lexitypes.js";

export class Parser extends Lexer {
    private cur: Token;
    private peek: Token;
    private errorArray: Array<string>;
    constructor(input: Buffer) {
        super(input);
        this.nextToken();
        this.nextToken();
        this.errorArray = [];
    }

    public parse(): LexiValue {
        return this.parseStatement();
    }

    public get errors(): Array<string> {
        return this.errorArray;
    }

    public get errorsLen(): number {
        return this.errorArray.length;
    }

    private parseStatement(): LexiValue {
        let lexiVal: LexiValue = { type: LexiTypes.bulk, value: "" };
        if (this.curTokIs(Tokens.type)) {
            if (this.cur.literal === "*") {
                lexiVal.type = LexiTypes.array;
                lexiVal.value = [];
                if (!this.expectPeek(Tokens.len)) {
                    return lexiVal;
                }
                let len = parseInt(this.cur.literal);
                if (!this.expectPeek(Tokens.retcar)) {
                    return lexiVal;
                }
                if (!this.expectPeek(Tokens.newl)) {
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
                    return lexiVal;
                }
                if (!this.expectPeek(Tokens.retcar)) {
                    return lexiVal;
                }
                if (!this.expectPeek(Tokens.newl)) {
                    return lexiVal;
                }
                if (!this.expectPeek(Tokens.bulk)) {
                    return lexiVal;
                }

                let bulkStr = this.cur.literal;
                lexiVal.value = bulkStr;

                if (!this.expectPeek(Tokens.retcar)) {
                    lexiVal.value = null;
                    return lexiVal;
                }
                if (!this.expectPeek(Tokens.newl)) {
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
            if (!this.expectPeek(Tokens.retcar)) {
                lexiVal.value = null;
                return lexiVal;
            }
            if (!this.expectPeek(Tokens.newl)) {
                lexiVal.value = null;
                return lexiVal;
            }

            this.nextToken();

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

        if (this.curTokIs(Tokens.error)) {
            lexiVal.type = LexiTypes.error;
            lexiVal.value = this.cur.literal as string;
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
        this.peekError(type);
        return false;
    }

    private peekError(type: TokenT): void {
        let str = `expected peek token to be ${type}, got ${this.peek.type} instead`;
        this.errors.push(str);
    }

    private nextToken() {
        this.cur = this.peek;
        this.peek = this.lnextToken();
    }
}
