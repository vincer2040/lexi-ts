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

