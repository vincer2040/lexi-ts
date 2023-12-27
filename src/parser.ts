import { DynamicBuffer } from "./dynamicBuffer";
import { Type, type LexiData } from "./lexiData";
import { NEW_LINE, RET_CAR, SIMPLE_TYPE_BYTE, STRING_TYPE_BYTE, isDigit } from "./util";

type SimpleLookup = {
    str: string,
    type: Type,
}

const SIMPLE_LOOKUPS: SimpleLookup[] = [
    { str: "OK", type: Type.Ok },
    { str: "NONE", type: Type.None },
];

const SIMPLE_LOOKUPS_LEN = SIMPLE_LOOKUPS.length;

export class Parser {
    private input: Buffer;
    private pos: number;
    private ch: number;

    constructor(input?: Buffer) {
        if (input) {
            this.input = input;
        }
        this.pos = 0;
        this.ch = 0;
        this.readChar();
    }

    public parse(): LexiData {
        switch (this.ch) {
            case STRING_TYPE_BYTE:
                return this.parseString();
            case SIMPLE_TYPE_BYTE:
                return this.parseSimple();
            default:
                break;
        }
        return { type: Type.Unkown, data: null };
    }

    public reset(input: Buffer): void {
        this.input = input;
        this.ch = 0;
        this.pos = 0;
        this.readChar();
    }

    private parseString(): LexiData {
        this.readChar();
        const length = this.parseLength();
        if (!this.curCharIs(RET_CAR)) {
            return { type: Type.Unkown, data: null };
        }
        if (!this.expectPeek(NEW_LINE)) {
            return { type: Type.Unkown, data: null };
        }
        this.readChar();

        let string = Buffer.alloc(length);
        for (let i = 0; i < length; ++i) {
            string[i] = this.ch;
            this.readChar();
        }
        if (!this.curCharIs(RET_CAR)) {
            return { type: Type.Unkown, data: null };
        }
        if (!this.expectPeek(NEW_LINE)) {
            return { type: Type.Unkown, data: null };
        }
        this.readChar();
        return { type: Type.String, data: string.toString() };
    }

    private parseSimple(): LexiData {
        this.readChar();
        let buf = new DynamicBuffer();
        while (this.ch != 0 && this.ch != RET_CAR) {
            buf.pushChar(this.ch);
            this.readChar();
        }
        if (!this.curCharIs(RET_CAR)) {
            return { type: Type.Unkown, data: null };
        }
        if (!this.expectPeek(NEW_LINE)) {
            return { type: Type.Unkown, data: null };
        }
        let type = this.lookupSimple(buf.out().toString());
        return { type, data: null };
    }

    private parseLength(): number {
        let res = 0;
        while (isDigit(this.ch)) {
            res = (res * 10) + (this.ch - 48);
            this.readChar();
        }
        return res;
    }

    private lookupSimple(str: string): Type {
        for (let i = 0; i < SIMPLE_LOOKUPS_LEN; ++i) {
            const simpleLookup = SIMPLE_LOOKUPS[i];
            if (simpleLookup.str.localeCompare(str) === 0) {
                return simpleLookup.type;
            }
        }
        return Type.Unkown;
    }

    private peekChar(): number {
        if (this.pos >= this.input.length) {
            return 0;
        }
        return this.input[this.pos];
    }

    private curCharIs(char: number): boolean {
        return this.ch === char;
    }

    private peekCharIs(char: number): boolean {
        return this.peekChar() === char;
    }

    private expectPeek(char: number): boolean {
        if (this.peekCharIs(char)) {
            this.readChar();
            return true;
        }

        return false;
    }

    private readChar(): void {
        if (this.pos >= this.input.length) {
            this.ch = 0;
            return;
        }
        this.ch = this.input[this.pos];
        this.pos++;
    }
}
