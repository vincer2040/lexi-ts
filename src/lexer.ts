import type { Token } from "./token.js";
import { Tokens } from "./token.js";

export class Lexer {
    private input: string;
    // private pos: number;
    private readPos: number;
    private len: number;
    private ch: number;

    constructor(input: string) {
        this.input = input;
        this.len = input.length;
        this.readPos = 0;
        // this.pos = 0;
        this.readChar();
    }

    private readChar(): void {
        if (this.readPos >= this.len) {
            this.ch = 0;
        } else {
            this.ch = this.input.charCodeAt(this.readPos);
        }
        // this.pos = this.readPos;
        this.readPos++;
    }

    private readSimple(): string {
        let simple: string = "";
        this.readChar();
        while (this.ch != 13) {
            simple += String.fromCharCode(this.ch);
            this.readChar();
        }
        return simple;
    }

    private readInt(): void {
        this.readChar();
        let i: number;
        for (i = 0; i < 8; ++i) {
            this.readChar();
        }
    }

    private isDigit(c: number): boolean {
        return "0".charCodeAt(0) <= c && c <= "9".charCodeAt(0);
    }

    private readLen(): string {
        let len: string = "";

        while (this.ch != 13) {
            len += String.fromCharCode(this.ch);
            this.readChar();
        }

        return len;
    }

    private readBulk(): string {
        let bulk: string = "";

        while (this.ch != 13) {
            bulk += String.fromCharCode(this.ch);
            this.readChar();
        }

        return bulk;
    }

    public lnextToken(): Token {
        let ret: Token = { type: Tokens.illegal, literal: "" };
        switch (this.ch) {
            case 42:  // arr
                ret.literal = "*"
                ret.type = Tokens.type;
                break;
            case 36: // bulk
                ret.literal = "$"
                ret.type = Tokens.type;
                break;
            case 58: // int
                ret.literal = ":"
                this.readInt();
                ret.type = Tokens.type;
                break;
            case 43: // simple
                ret.literal = this.readSimple();
                ret.type = Tokens.simple;
                return ret;
            case 13:
                ret.literal = "\r";
                ret.type = Tokens.retcar;
                break;
            case 10:
                ret.literal = "\n";
                ret.type = Tokens.newl;
                break;
            case 0:
                ret.type = Tokens.eoft;
                break;
            default:
                if (this.isDigit(this.ch)) {
                    ret.type = Tokens.len;
                    ret.literal = this.readLen();
                    return ret;
                } else {
                    ret.type = Tokens.bulk;
                    ret.literal = this.readBulk();
                    return ret;
                }
        }

        this.readChar();

        return ret;
    }
}
