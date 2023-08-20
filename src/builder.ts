const TypeBytes = {
    Array: "*".charCodeAt(0),
    Bulk: "$".charCodeAt(0),
    RetCar: "\r".charCodeAt(0),
    NewLine: "\n".charCodeAt(0),
} as const;

export class Builder {

    private buf: Buffer;
    private ins: number;
    private capacity: number;

    constructor() {
        this.capacity = 32;
        this.buf = Buffer.alloc(this.capacity, 0);
        this.ins = 0;
    }

    private checkForRealloc(needed: number): boolean {
        let newLen = this.ins + needed;
        if (newLen >= this.capacity) {
            let buf: Buffer;
            let i: number;
            this.capacity += newLen;
            try {
                buf = Buffer.alloc(this.capacity, 0);
            } catch (_) {
                return false;
            }

            for (i = 0; i < this.ins; ++i) {
                buf[i] = this.buf[i];
            }

            this.buf = buf;
        }

        return true;
    }

    private addLength(len: string, lenOfLen: number): void {
        let i: number;
        for (i = 0; i < lenOfLen; ++i, ++this.ins) {
            this.buf[this.ins] = len.charCodeAt(i);
        }
    }

    private addEnd(): void {
        this.buf[this.ins] = TypeBytes.RetCar;
        this.ins++;
        this.buf[this.ins] = TypeBytes.NewLine;
        this.ins++;
    }

    public addArr(len: number): Builder {
        let lenToString = len.toString();
        let lenOfLenString = lenToString.length;
        let lenToAppend = lenOfLenString + 3;

        this.checkForRealloc(lenToAppend)

        this.buf[this.ins] = TypeBytes.Array;
        this.ins++;

        this.addLength(lenToString, lenOfLenString);

        this.addEnd();

        return this;
    }

    public addBulk(bulk: string): Builder {
        let len = bulk.length;
        let lenToString = len.toString();
        let lenOfLenString = lenToString.length;
        let lenToAppend = len + lenOfLenString + 5;
        let i: number;

        this.checkForRealloc(lenToAppend);

        this.buf[this.ins] = TypeBytes.Bulk;
        this.ins++;

        this.addLength(lenToString, lenOfLenString);
        this.addEnd();

        for (i = 0; i < len; ++i, ++this.ins) {
            this.buf[this.ins] = bulk.charCodeAt(i);
        }

        this.addEnd();

        return this;
    }

    public out(): [Buffer, number] {
        return [this.buf, this.ins];
    }
}
