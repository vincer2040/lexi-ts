const INITIAL_CAP = 32;

export class DynamicBuffer {
    private buf: Buffer;
    private ins: number;
    private cap: number;

    constructor(initialCap?: number) {
        if (initialCap) {
            this.cap = initialCap;
        } else {
            this.cap = INITIAL_CAP;
        }
        this.buf = Buffer.alloc(this.cap, 0);
        this.ins = 0;
    }

    public append(src: Buffer) {
        let srcLen = src.length;
        let needed = this.ins + srcLen;
        if (needed > this.cap) {
            this.reallocBuf(needed);
        }
        src.copy(this.buf, this.ins);
        this.ins += srcLen;
    }

    public out(): Buffer {
        return this.buf;
    }

    private reallocBuf(needed: number): boolean {
        let buf: Buffer;
        this.cap += needed;
        try {
            buf = Buffer.alloc(this.cap, 0);
        } catch (_) {
            return false;
        }

        this.buf.copy(buf);

        this.buf = buf;

        return true;
    }
}
