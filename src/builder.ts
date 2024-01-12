import { DynamicBuffer } from "./dynamicBuffer";
import { ARRAY_TYPE_BYTE, STRING_TYPE_BYTE, RET_CAR, NEW_LINE, INT_TYPE_BYTE } from "./util";

export class Builder {
    private buffer: DynamicBuffer;
    constructor() {
        this.buffer = new DynamicBuffer();
    }

    public addArray(length: number): Builder {
        this.buffer.pushChar(ARRAY_TYPE_BYTE);
        this.buffer.pushString(length.toString());
        this.addEnd();
        return this;
    }

    public addString(str: string): Builder {
        const len = str.length;
        this.buffer.pushChar(STRING_TYPE_BYTE);
        this.buffer.pushString(len.toString());
        this.addEnd();
        this.buffer.pushString(str);
        this.addEnd();
        return this;
    }

    public addInt(int: number): Builder {
        if (int % 1 != 0) {
            throw new Error(`${int} should be a whole number`);
        }
        this.buffer.pushChar(INT_TYPE_BYTE);
        this.buffer.add64BitInteger(int);
        this.addEnd();
        return this;
    }

    public out(): Buffer {
        return this.buffer.out();
    }

    public reset(): Builder {
        this.buffer.reset();
        return this;
    }

    private addEnd(): void {
        this.buffer.pushChar(RET_CAR);
        this.buffer.pushChar(NEW_LINE);
    }
}
