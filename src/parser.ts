import { DataType, LexiData } from "./types.js";
import { NEW_LINE, RET_CAR, SIMPLE_TYPE_BYTE, BULK_STRING_TYPE_BYTE, ZERO_BYTE, INT_TYPE_BYTE, DOUBLE_TYPE_BYTE, BULK_ERROR_BYTE, SIMPLE_ERROR_BYTE } from "./util";

export class Parser {
    private buf: Buffer;
    private pos: number;
    private length: number;
    private byte: number;
    private errorState: boolean;
    private error: string;

    constructor(buf: Buffer) {
        this.buf = buf;
        this.pos = 0;
        this.length = buf.length;
        this.byte = 0;
        this.errorState = false;
        this.error = "";
        this.readByte();
    }

    public hasError(): boolean {
        return this.errorState;
    }

    public getError(): string {
        return this.error;
    }

    public parse(): LexiData {
        return this.parseData();
    }

    private parseData(): LexiData {
        switch (this.byte) {
            case SIMPLE_TYPE_BYTE:
                return this.parseSimpleString();
            case BULK_STRING_TYPE_BYTE:
                return this.parseBulkString();
            case INT_TYPE_BYTE:
                return this.parseInteger();
            case DOUBLE_TYPE_BYTE:
                return this.parseDouble();
            case SIMPLE_ERROR_BYTE:
                return this.parseSimpleError();
            case BULK_ERROR_BYTE:
                return this.parseBulkError();
        }
        return { type: DataType.Illegal, data: "unknown type byte " + String.fromCharCode(this.byte) };
    }

    private parseSimpleString(): LexiData {
        this.readByte();
        let res = "";
        while (this.byte !== RET_CAR && this.byte !== 0) {
            res += String.fromCharCode(this.byte);
            this.readByte();
        }
        if (!this.expectEnd()) {
            return { type: DataType.Illegal, data: "expected clrf after simple string" };
        }
        return { type: DataType.String, data: res };
    }

    private parseBulkString(): LexiData {
        this.readByte();
        const length = this.parseLength();
        if (!this.expectEnd()) {
            return { type: DataType.Illegal, data: "expected clrf after length" };
        }
        this.readByte();
        let res = "";
        for (let i = 0; i < length; ++i) {
            res += String.fromCharCode(this.byte);
            this.readByte();
        }
        if (!this.expectEnd()) {
            return { type: DataType.Illegal, data: "expected clrf after bulk string" };
        }
        return { type: DataType.String, data: res };
    }

    private parseInteger(): LexiData {
        let str = "";
        this.readByte();
        while (this.byte !== RET_CAR && this.byte !== 0) {
            str += String.fromCharCode(this.byte);
            this.readByte();
        }
        if (!this.expectEnd()) {
            return { type: DataType.Illegal, data: "expected clrf after integer" };
        }
        const num = parseInt(str);
        if (isNaN(num)) {
            return { type: DataType.Illegal, data: `expected integer, ${str} is not an integer` };
        }
        return { type: DataType.Integer, data: num };
    }

    private parseDouble(): LexiData {
        let str = "";
        this.readByte();
        while (this.byte !== RET_CAR && this.byte !== 0) {
            str += String.fromCharCode(this.byte);
            this.readByte();
        }
        if (!this.expectEnd()) {
            return { type: DataType.Illegal, data: "expected clrf after integer" };
        }
        const num = parseFloat(str);
        if (isNaN(num)) {
            return { type: DataType.Illegal, data: `expected double, ${str} is not an double` };
        }
        return { type: DataType.Double, data: num };

    }

    private parseSimpleError(): LexiData {
        this.readByte();
        let res = "";
        while (this.byte !== RET_CAR && this.byte !== 0) {
            res += String.fromCharCode(this.byte);
            this.readByte();
        }
        if (!this.expectEnd()) {
            return { type: DataType.Illegal, data: "expected clrf after simple string" };
        }
        return { type: DataType.Error, data: res };
    }

    private parseBulkError(): LexiData {
        this.readByte();
        const length = this.parseLength();
        if (!this.expectEnd()) {
            return { type: DataType.Illegal, data: "expected clrf after length" };
        }
        this.readByte();
        let res = "";
        for (let i = 0; i < length; ++i) {
            res += String.fromCharCode(this.byte);
            this.readByte();
        }
        if (!this.expectEnd()) {
            return { type: DataType.Illegal, data: "expected clrf after bulk string" };
        }
        return { type: DataType.Error, data: res };
    }

    private parseLength(): number {
        let res = 0;
        while (this.byte !== RET_CAR && this.byte !== 0) {
            res = (res * 10) + (this.byte - ZERO_BYTE);
            this.readByte();
        }
        return res;
    }

    private expectEnd(): boolean {
        if (this.byte !== RET_CAR) {
            return false;
        }
        if (!this.expectPeek(NEW_LINE)) {
            return false;
        }
        return true;
    }

    private expectPeek(byte: number): boolean {
        if (this.peek() !== byte) {
            return false;
        }
        this.readByte();
        return true;
    }

    private peek(): number {
        if (this.pos >= this.length) {
            return 0;
        }
        return this.buf[this.pos];
    }

    private readByte() {
        if (this.pos >= this.length) {
            this.byte = 0;
            return;
        }

        this.byte = this.buf[this.pos];
        this.pos++;
    }
}
