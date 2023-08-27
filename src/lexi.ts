import { Builder } from "./builder.js";
import { Socket } from "net";
import { DynamicBuffer } from "./dynamicBuffer.js";
import { Parser } from "./parser.js";

export class Lexi {
    private addr: string
    private port: number;
    private socket: Socket;

    constructor(addr: string, port: number) {
        this.addr = addr;
        this.port = port;
        this.socket = new Socket();
    }

    /**
     * create a connection to the database
     * @returns Promise<void>
     */
    public connect(): Promise<void> {
        return new Promise((res, rej) => {
            try {
                this.socket.connect(this.port, this.addr, () => {
                    res();
                });
            } catch (e) {
                rej(e);
            }
        })
    }

    /**
     * close the connection
     */
    public close(): void {
        this.socket.destroy();
    }

    /**
     * set a key and value
     * @param {string} key - the key to set
     * @param {string} value - the value to set the key to
     * @returns Promise<void>
     */
    public async set(key: string, value: string): Promise<void> {
        let buf = new Builder()
            .addArr(3)
            .addBulk("SET")
            .addBulk(key)
            .addBulk(value)
            .out();

        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        console.log(lexiVal.value);
    }

    /**
     * get a value
     * @param {string} key - the key to get
     * @returns Promise<void>
     */
    public async get(key: string): Promise<void> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("GET")
            .addBulk(key)
            .out();

        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        console.log(lexiVal);
    }

    /**
     * delete a value
     * @param {string} key - the key to delete
     * @returns Promise<void>
     */
    public async del(key: string): Promise<void> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("DEL")
            .addBulk(key)
            .out();

        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        console.log(lexiVal);
    }

    /**
     * push a value
     * @param {string} value - the value to push
     * @returns Promise<void>
     */
    public async push(value: string): Promise<void> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("PUSH")
            .addBulk(value)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        console.log(lexiVal);
    }

    /**
     * pop a value
     * @returns Promise<void>
     */
    public async pop(): Promise<void> {
        let buf = new Builder()
            .addBulk("POP")
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        console.log(lexiVal);
    }

    /**
     * create a new cluster
     * @param {string} name - the name of the cluster
     * @returns Promise<void>
     */
    public async cluster_new(name: string): Promise<void> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("CLUSTER.NEW")
            .addBulk(name)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        console.log(lexiVal);
    }

    private send(buf: [Buffer, number]): Promise<void> {
        return new Promise((res, rej) => {
            if (!this.socket.writable) {
                rej("socket is not writable");
            }
            let b = buf[0].filter(x => x !== 0);
            this.socket.write(b, () => {
                res();
            });
        })
    }

    private read(): Promise<Buffer> {
        let buf = new DynamicBuffer();
        return new Promise((res, rej) => {
            try {
                this.socket.on('readable', () => {
                    let chunk: Buffer;
                    while ((chunk = this.socket.read()) !== null) {
                        buf.append(chunk);
                    }
                    this.socket.removeAllListeners();
                    res(buf.out());
                })
            } catch (e) {
                rej(e);
            }
        });
    }
}
