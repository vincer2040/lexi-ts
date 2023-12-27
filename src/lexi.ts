import { Socket, createConnection } from "net";
import { Builder } from "./builder";
import { DynamicBuffer } from "./dynamicBuffer";
import { Parser } from "./parser";
import { extractData } from "./lexiData";

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
        this.socket = createConnection({ localAddress: this.address, port: this.port });
        this.connected = true;
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public async set(key: string, value: string): Promise<string | null> {
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

    public async get(key: string): Promise<string | null> {
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

    public async del(key: string): Promise<string | null> {
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

    private parse(buf: Buffer): string | null {
        this.parser.reset(buf);
        const parsed = this.parser.parse();
        const data = extractData(parsed);
        return data;
    }

    private read(): Promise<Buffer> {
        if (!this.socket.readable) {
            throw new Error("socket not readable");
        }
        this.readBuf.reset();
        return new Promise((res, rej) => {
            try {
                let chunk: Buffer;
                while ((chunk = this.socket.read()) !== null) {
                    this.readBuf.append(chunk);
                }
                this.socket.removeAllListeners();
                res(this.readBuf.out());
            } catch (e) {
                rej(e);
            }
        });
    }

    private write(buf: Buffer): Promise<void> {
        if (!this.socket.writable) {
            throw new Error("socket is not writable");
        }
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
