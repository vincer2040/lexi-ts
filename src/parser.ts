import { Lexer } from "./lexer.js";
import { LexiTypes } from "./lexitypes.js";
import type { LexiValue } from "./lexitypes.js";
import { Tokens } from "./token.js";
import type { Token, TokenT } from "./token.js";

export class Parser extends Lexer {
    private cur: Token;
    private peek: Token;
    constructor(input: string) {
        super(input);
        this.nextToken();
        this.nextToken();
    }

    public parse(): void {
        this.parseStatement();
    }

    private parseStatement(): void {
        if (this.curTokIs(Tokens.type)) {
            if (this.cur.literal === "*") {
                console.log("array");
            }
            if (this.cur.literal === "$") {
                let lexiVal: LexiValue = { type: LexiTypes.bulk, value: "" };
                if (!this.expectPeek(Tokens.len)) {
                    console.log("handle error");
                    return;
                }
                if (!this.expectPeek(Tokens.retcar)) {
                    console.log("handle retcar error");
                    return;
                }
                if (!this.expectPeek(Tokens.newl)) {
                    console.log("handle newl error");
                    return;
                }
                if (!this.expectPeek(Tokens.bulk)) {
                    console.log("handle no bulk error");
                    return;
                }

                let bulkStr = this.cur.literal;
                lexiVal.value = bulkStr;

                if (!this.expectPeek(Tokens.retcar)) {
                    console.log("handle retcar error");
                    lexiVal.value = null;
                    return;
                }
                if (!this.expectPeek(Tokens.newl)) {
                    console.log("handle newl error");
                    lexiVal.value = null;
                    return;
                }

                console.log(lexiVal);
            }
        }
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
