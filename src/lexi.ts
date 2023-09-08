import { Builder } from "./builder.js";
import { DynamicBuffer } from "./dynamicBuffer.js";
import { Parser } from "./parser.js";
import { Socket } from "net";

export default class Lexi {
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
        console.log(lexiVal);
    }

    /**
     * set a key and 64 bit integer value
     * @param {string} key - the key to be set
     * @param {number} value - the number to set - must be a whole number
     * @returns Promise<void>
     */
    public async setInt(key: string, value: number): Promise<void> {
        if (!this.isWholeNumber(value)) {
            throw new Error("invalid integer, must be a whole number");
        }
        let buf = new Builder()
            .addArr(3)
            .addBulk("SET")
            .addBulk(key)
            .add64BitInt(BigInt(value))
            .out();

        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        console.log(lexiVal);
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
     * get all the keys
     * @returns Promise<void>
     */
    public async keys(): Promise<void> {
        let buf = new Builder()
            .addBulk("KEYS")
            .out();
        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        console.log(lexiVal);
    }

    /**
     * get all the values
     * @returns Promise<void>
     */
    public async values(): Promise<void> {
        let buf = new Builder()
            .addBulk("VALUES")
            .out();
        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        console.log(lexiVal);
    }

    /**
     * get all the entries
     * @returns Promise<void>
     */
    public async entries(): Promise<void> {
        let buf = new Builder()
            .addBulk("ENTRIES")
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
     * push an integeer
     * @param {number} value - the integer to push - must be a whole number
     * @returns Promise<void>
     */
    public async pushInt(value: number): Promise<void> {
        if (!this.isWholeNumber(value)) {
            throw new Error("value must be a whole number");
        }
        let buf = new Builder()
            .addArr(2)
            .addBulk("PUSH")
            .add64BitInt(BigInt(value))
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
    public async clusterNew(name: string): Promise<void> {
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

    /**
     * set a value in a cluster
     * @param {string} name - the name of the cluster
     * @param {string} key - the key to set
     * @param {string} value - the value to set
     * @returns Promise<void>
     */
    public async clusterSet(name: string, key: string, value: string): Promise<void> {
        let buf = new Builder()
            .addArr(4)
            .addBulk("CLUSTER.SET")
            .addBulk(name)
            .addBulk(key)
            .addBulk(value)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        console.log(lexiVal);
    }

    /**
     * set an integer in a cluster
     * @param {string} name - the name of the cluster
     * @param {string} key - the key to set
     * @param {number} value - the integer to set - must be a whole number
     * @returns Promise<void>
     */
    public async clusterSetInt(name: string, key: string, value: number): Promise<void> {
        if (!this.isWholeNumber(value)) {
            throw new Error("value must be a whole number");
        }
        let buf = new Builder()
            .addArr(4)
            .addBulk("CLUSTER.SET")
            .addBulk(name)
            .addBulk(key)
            .add64BitInt(BigInt(value))
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        console.log(lexiVal);
    }

    /**
     * get a value from a cluster
     * @param {string} name - the name of the cluster
     * @param {string} key - the key to get
     * @returns Promise<void>
     */
    public async clusterGet(name: string, key: string): Promise<void> {
        let buf = new Builder()
            .addArr(3)
            .addBulk("CLUSTER.GET")
            .addBulk(name)
            .addBulk(key)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        console.log(lexiVal);
    }

    /**
     * delete a value from a cluster
     * @param {string} name - the name of the cluster
     * @param {string} key - the key to delete
     * @returns Promise<void>
     */
    public async clusterDel(name: string, key: string): Promise<void> {
        let buf = new Builder()
            .addArr(3)
            .addBulk("CLUSTER.DEL")
            .addBulk(name)
            .addBulk(key)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        console.log(lexiVal);
    }

    /**
     * drop a cluster - this deletes the while cluster
     * @param {string} name - the name of the cluster
     * @returns Promise<void>
     */
    public async clusterDrop(name: string): Promise<void> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("CLUSTER.DROP")
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
            // why is there no socket.write with a length? what
            // a messy language
            this.socket.write(buf[0], () => {
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

    private isWholeNumber(int: number): boolean {
        return Math.round(int) === int;
    }
}
