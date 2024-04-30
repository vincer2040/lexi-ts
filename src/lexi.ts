import { Socket, createConnection } from "net";
import { Builder } from "./builder.js";
import { DataType, LexiConfig, LexiData } from "./types.js";
import { DynamicBuffer } from "./dynamicBuffer.js";
import { Parser } from "./parser.js";

export class LexiClient {
    private ip: string;
    private port: number;
    private builder: Builder;
    private socket: Socket;
    private connected: boolean;
    private onConnect: () => void | null | undefined;
    private readBuf: DynamicBuffer;

    constructor(config: LexiConfig) {
        this.ip = config.ip;
        this.port = config.port;
        this.builder = new Builder();
        this.connected = false;
        this.readBuf = new DynamicBuffer();
        this.onConnect = config.onConnect;
    }

    public connect() {
        this.socket = createConnection({ port: this.port, host: this.ip }, this.onConnect);
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public async set(key: string, value: string): Promise<string> {
        const buf = this.builder
            .reset()
            .addArray(3)
            .addSimpleString("SET")
            .addBulkString(key)
            .addBulkString(value)
            .out();
        this.write(buf);
        const received = await this.read();
        const parsed = this.parse(received);
        if (parsed.type === DataType.Error) {
            return parsed.data;
        }
        if (parsed.type !== DataType.String) {
            throw new Error("expected string, got " + parsed.type);
        }
        return parsed.data;
    }

    public async get(key: string): Promise<string> {
        const buf = this.builder
            .reset()
            .addArray(2)
            .addSimpleString("GET")
            .addBulkString(key)
            .out();
        this.write(buf);
        const received = await this.read();
        const parsed = this.parse(received);
        if (parsed.type === DataType.Error) {
            return parsed.data;
        }
        if (parsed.type !== DataType.String) {
            throw new Error("expected string, got " + parsed.type);
        }
        return parsed.data;
    }

    public async del(key: string): Promise<number | string> {
        const buf = this.builder
            .reset()
            .addArray(2)
            .addSimpleString("DEL")
            .addBulkString(key)
            .out();
        this.write(buf);
        const received = await this.read();
        const parsed = this.parse(received);
        if (parsed.type === DataType.Error) {
            return parsed.data;
        }
        if (parsed.type !== DataType.Integer) {
            throw new Error("expected integer, got " + parsed.type);
        }
        return parsed.data;

    }

    public close() {
        this.socket.destroy();
    }

    private parse(buf: Buffer): LexiData {
        const parser = new Parser(buf);
        return parser.parse();
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

    private write(buf: Buffer) {
        if (!this.socket.writable) {
            throw new Error("socket not writable");
        }
        this.socket.write(buf);
    }
}
