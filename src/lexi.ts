import { Socket, createConnection } from "net";
import { Builder } from "./builder";
import { DynamicBuffer } from "./dynamicBuffer";
import { Parser } from "./parser";
import { LexiDataT, extractData } from "./lexiData";

export class LexiClient {
    private builder: Builder;
    private socket: Socket | undefined;
    private connected: boolean;
    private address: string;
    private port: number;
    private readBuf: DynamicBuffer;
    private parser: Parser;

    constructor(address: string, port: number) {
        this.builder = new Builder();
        this.connected = false;
        this.address = address;
        this.port = port;
        this.socket = undefined;
        this.readBuf = new DynamicBuffer();
        this.parser = new Parser();
    }

    public connect(): void {
        this.socket = createConnection(this.port, this.address);
        this.connected = true;
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public async authenticate(username: string, password: string): Promise<LexiDataT> {
        const buf = this.builder
            .reset()
            .addArray(3)
            .addString("AUTH")
            .addString(username)
            .addString(password)
            .out();
        await this.write(buf);
        const read = await this.read();
        return this.parse(read);
    }

    public async set(key: string, value: string): Promise<LexiDataT> {
        const buf = this.builder
            .reset()
            .addArray(3)
            .addString("SET")
            .addString(key)
            .addString(value)
            .out();
        await this.write(buf);
        const read = await this.read();
        return this.parse(read);
    }

    public async get(key: string): Promise<LexiDataT> {
        const buf = this.builder
            .reset()
            .addArray(2)
            .addString("GET")
            .addString(key)
            .out();
        await this.write(buf);
        const read = await this.read();
        return this.parse(read);
    }

    public async del(key: string): Promise<LexiDataT> {
        const buf = this.builder
            .reset()
            .addArray(2)
            .addString("DEL")
            .addString(key)
            .out();
        await this.write(buf);
        const read = await this.read();
        return this.parse(read);
    }

    public async push(value: string): Promise<LexiDataT> {
        const buf = this.builder
            .reset()
            .addArray(2)
            .addString("PUSH")
            .addString(value)
            .out();
        await this.write(buf);
        const read = await this.read();
        return this.parse(read);
    }

    public async pop(): Promise<LexiDataT> {
        const buf = this.builder
            .reset()
            .addString("POP")
            .out();
        await this.write(buf);
        const read = await this.read();
        return this.parse(read);
    }

    public async enque(value: string): Promise<LexiDataT> {
        const buf = this.builder
            .reset()
            .addArray(2)
            .addString("ENQUE")
            .addString(value)
            .out();
        await this.write(buf);
        const read = await this.read();
        return this.parse(read);
    }

    public async deque(): Promise<LexiDataT> {
        const buf = this.builder
            .reset()
            .addString("Deque")
            .out();
        await this.write(buf);
        const read = await this.read();
        return this.parse(read);
    }

    public close() {
        this.socket.destroy();
    }

    private parse(buf: Buffer): LexiDataT {
        this.parser.reset(buf);
        const parsed = this.parser.parse();
        const data = extractData(parsed);
        return data;
    }

    private read(): Promise<Buffer> {
        this.readBuf.reset();
        return new Promise((res, rej) => {
            try {
                this.socket.on('readable', () => {
                    let chunk: Buffer;
                    while ((chunk = this.socket.read()) !== null) {
                        this.readBuf.append(chunk);
                    }
                    this.socket.removeAllListeners();
                    res(this.readBuf.out());
                })
            } catch (e) {
                rej(e);
            }
        });
    }

    private write(buf: Buffer): Promise<void> {
        return new Promise((res, rej) => {
            try {
                // I really hate that there is not write method with a length to write
                this.socket.write(buf, () => {
                    res();
                });
            } catch (e) {
                rej(e);
            }
        });
    }
}
