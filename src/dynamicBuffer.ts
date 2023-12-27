const DYANMIC_BUFFER_INITIAL_CAPACITY = 32

export class DynamicBuffer {
    private buffer: Buffer;
    private len: number;
    private cap: number;
    constructor(capacity?: number) {
        this.len = 0;
        if (capacity) {
            this.cap = capacity
        } else {
            this.cap = DYANMIC_BUFFER_INITIAL_CAPACITY;
        }
        this.buffer = Buffer.alloc(this.cap);
    }

    public pushChar(char: number): void {
        if (this.len >= this.cap) {
            this.reallocBuffer(1);
        }
        this.buffer[this.len] = char;
        this.len++;
    }

    public append(buf: Buffer): void {
        let len = buf.length;
        const needed = this.len + len;
        if (needed >= this.cap) {
            this.reallocBuffer(len);
        }
        this.buffer.copy(buf, this.len);
        this.len += len;
    }

    public pushString(string: string): void {
        const stringLength = string.length;
        const needed = this.len + stringLength;
        if (needed >= this.cap) {
            this.reallocBuffer(stringLength);
        }
        this.buffer.write(string, this.len);
        this.len += stringLength;
    }

    public out(): Buffer {
        return this.buffer;
    }

    public reset(): void {
        this.buffer.fill(0);
        this.len = 0;
    }

    private reallocBuffer(needed: number): void {
        const capacity = (this.cap * 2) + needed;
        const newBuffer = Buffer.alloc(capacity);
        this.buffer.copy(newBuffer);
        this.cap = capacity;
        this.buffer = newBuffer;
    }
}
