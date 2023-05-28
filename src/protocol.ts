export const SimpleStrings = {
    ping: "+PING\r\n",
    none: "+None\r\n",
    ok: "+Ok\r\n",
} as const;

export type SimpleString = keyof typeof SimpleStrings;

const MAX_BUF_LEN = 4096;

export class ProtocolBuilder {
    private insert: number;
    private buf: ArrayBuffer;
    private bufView: Uint8Array;
    constructor() {
        this.buf = new ArrayBuffer(MAX_BUF_LEN);
        this.bufView = new Uint8Array(this.buf).fill(0);
        this.insert = 0;
    }

    public addSimple(s: SimpleString): ProtocolBuilder {
        let add = SimpleStrings[s];
        let len = add.length;
        let i: number;
        // we fill the buffer with 0's to ensure that only the simple string is added
        this.bufView.fill(0);
        this.insert = 0;
        for (i = 0; i < len; ++i, ++this.insert) {
            this.bufView[this.insert] = add[i].charCodeAt(0);
        }
        return this;
    }

    public addBulkString(s: string): ProtocolBuilder {
        let len = s.length;
        let lenToString = len.toString();
        let lenOfLenString = lenToString.length;
        let i: number;
        this.bufView[this.insert] = "$".charCodeAt(0);
        this.insert++;
        for (i = 0; i < lenOfLenString; ++i, ++this.insert) {
            this.bufView[this.insert] = lenToString[i].charCodeAt(0);
        }
        this.bufView[this.insert] = "\r".charCodeAt(0);
        this.insert++;
        this.bufView[this.insert] = "\n".charCodeAt(0);
        this.insert++;
        for (i = 0; i < len; ++i, ++this.insert) {
            this.bufView[this.insert] = s[i].charCodeAt(0);
        }
        this.bufView[this.insert] = "\r".charCodeAt(0);
        this.insert++;
        this.bufView[this.insert] = "\n".charCodeAt(0);
        this.insert++;
        return this;
    }

    public addArray(len: number): ProtocolBuilder {
        let lenToString = len.toString();
        let lenOfLenString = lenToString.length;
        let i: number;
        this.bufView[this.insert] = "*".charCodeAt(0);
        this.insert++;
        for (i = 0; i < lenOfLenString; ++i, ++this.insert) {
            this.bufView[this.insert] = lenToString[i].charCodeAt(0);
        }
        this.bufView[this.insert] = "\r".charCodeAt(0);
        this.insert++;
        this.bufView[this.insert] = "\n".charCodeAt(0);
        this.insert++;
        return this;
    }

    public out(): Uint8Array {
        // remove 0's for length of message sent
        return this.bufView.filter(i => i !== 0);
    }
}

export const ProtocolTypes = ["BulkString", "Array", "Invalid"] as const;
export type ProtocolType = typeof ProtocolTypes[number];

export type UnpackedProtocol = {
    type: ProtocolType,
    value: string | Array<string> | null;
}

export class ProtocolUnpacker {
    private position: number;
    constructor(private data: Uint8Array) {
        this.position = 0;
    }

    private getType(): ProtocolType {
        if (this.data[this.position] === 42) {
            return "Array";
        }
        if (this.data[this.position] === 36) {
            return "BulkString";
        }
        return "Invalid";
    }

    private getLen(): number {
        let len: number = 0;
        for (; this.data[this.position] !== "\r".charCodeAt(0); this.position++) {
            let idx = "0".charCodeAt(0);
            len = (len * 10) + (this.data[this.position] - idx);
        }
        return len;
    }

    private unpackBulk(len: number): string {
        let t = this.data.slice(this.position, this.position + len);
        return new TextDecoder().decode(t);
    }

    private unpackArray(len: number): Array<string> {
        let out = new Array();
        let i: number;
        for (i = 0; i < len; i++) {
            if (this.getType() != "BulkString") {
                throw new Error("invalid");
            }
            this.position++;
            let len = this.getLen();
            this.position++;
            this.position++;
            let t = this.unpackBulk(len);
            out.push(t);
            this.position += len + 2;
        }
        return out;
    }

    public unpack(): UnpackedProtocol {
        if (this.getType() === "Array") {
            this.position++;
            let len = this.getLen();
            this.position++;
            this.position++;
            let out = this.unpackArray(len);
            return {
                type: "Array",
                value: out,
            }
        }
        if (this.getType() === "BulkString") {
            let len: number;
            let out: string;
            this.position++;
            len = this.getLen();
            this.position++;
            this.position++;
            out = this.unpackBulk(len);
            return {
                type: "BulkString",
                value: out,
            }
        }
        return {
            type: "Invalid",
            value: null,
        }
    }
}

