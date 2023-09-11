import { Builder } from "./builder.js";
import { DynamicBuffer } from "./dynamicBuffer.js";
import { LexiVal } from "./lexitypes.js";
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
     * @throws error if socket fails to connect
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
     * @throws error if node fails to destory socket
     */
    public close(): void {
        this.socket.destroy();
    }

    /**
     * set a key and value
     * @param {string} key - the key to set
     * @param {string} value - the value to set the key to
     * @returns Promise<LexiVal>
     */
    public async set(key: string, value: string): Promise<LexiVal> {
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
        return lexiVal.value;
    }

    /**
     * set a key and 64 bit integer value
     * @param {string} key - the key to be set
     * @param {number} value - the number to set - must be a whole number
     * @returns Promise<LexiVal>
     */
    public async setInt(key: string, value: number): Promise<LexiVal> {
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
        return lexiVal.value;
    }

    /**
     * get a value
     * @param {string} key - the key to get
     * @returns Promise<LexiVal>
     */
    public async get(key: string): Promise<LexiVal> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("GET")
            .addBulk(key)
            .out();

        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        return lexiVal.value;
    }

    /**
     * delete a value
     * @param {string} key - the key to delete
     * @returns Promise<LexiVal>
     */
    public async del(key: string): Promise<LexiVal> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("DEL")
            .addBulk(key)
            .out();

        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        return lexiVal.value;
    }

    /**
     * get all the keys
     * @returns Promise<LexiVal>
     */
    public async keys(): Promise<LexiVal> {
        let buf = new Builder()
            .addBulk("KEYS")
            .out();
        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        return lexiVal.value;
    }

    /**
     * get all the values
     * @returns Promise<LexiVal>
     */
    public async values(): Promise<LexiVal> {
        let buf = new Builder()
            .addBulk("VALUES")
            .out();
        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        return lexiVal.value;
    }

    /**
     * get all the entries
     * @returns Promise<LexiVal>
     */
    public async entries(): Promise<LexiVal> {
        let buf = new Builder()
            .addBulk("ENTRIES")
            .out();
        await this.send(buf);
        let d = await this.read();
        let parser = new Parser(d);
        let lexiVal = parser.parse();
        return lexiVal.value;
    }

    /**
     * push a value
     * @param {string} value - the value to push
     * @returns Promise<LexiVal>
     */
    public async push(value: string): Promise<LexiVal> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("PUSH")
            .addBulk(value)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        return lexiVal.value;
    }

    /**
     * push an integeer
     * @param {number} value - the integer to push - must be a whole number
     * @returns Promise<LexiVal>
     */
    public async pushInt(value: number): Promise<LexiVal> {
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
        return lexiVal.value;
    }

    /**
     * pop a value
     * @returns Promise<LexiVal>
     */
    public async pop(): Promise<LexiVal> {
        let buf = new Builder()
            .addBulk("POP")
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        return lexiVal.value;
    }

    /**
     * create a new cluster
     * @param {string} name - the name of the cluster
     * @returns Promise<LexiVal>
     */
    public async clusterNew(name: string): Promise<LexiVal> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("CLUSTER.NEW")
            .addBulk(name)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        return lexiVal.value;
    }

    /**
     * set a value in a cluster
     * @param {string} name - the name of the cluster
     * @param {string} key - the key to set
     * @param {string} value - the value to set
     * @returns Promise<LexiVal>
     */
    public async clusterSet(name: string, key: string, value: string): Promise<LexiVal> {
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
        return lexiVal.value;
    }

    /**
     * set an integer in a cluster
     * @param {string} name - the name of the cluster
     * @param {string} key - the key to set
     * @param {number} value - the integer to set - must be a whole number
     * @returns Promise<LexiVal>
     */
    public async clusterSetInt(name: string, key: string, value: number): Promise<LexiVal> {
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
        return lexiVal.value;
    }

    /**
     * get a value from a cluster
     * @param {string} name - the name of the cluster
     * @param {string} key - the key to get
     * @returns Promise<LexiVal>
     */
    public async clusterGet(name: string, key: string): Promise<LexiVal> {
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
        return lexiVal.value;
    }

    /**
     * delete a value from a cluster
     * @param {string} name - the name of the cluster
     * @param {string} key - the key to delete
     * @returns Promise<LexiVal>
     */
    public async clusterDel(name: string, key: string): Promise<LexiVal> {
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
        return lexiVal.value;
    }

    /**
     * drop a cluster - this deletes the while cluster
     * @param {string} name - the name of the cluster
     * @returns Promise<LexiVal>
     */
    public async clusterDrop(name: string): Promise<LexiVal> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("CLUSTER.DROP")
            .addBulk(name)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        return lexiVal.value;
    }

    public async clusterKeys(name: string): Promise<LexiVal> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("CLUSTER.KEYS")
            .addBulk(name)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        return lexiVal.value;
    }

    public async clusterValues(name: string): Promise<LexiVal> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("CLUSTER.VALUES")
            .addBulk(name)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        return lexiVal.value;
    }

    public async clusterEntries(name: string): Promise<LexiVal> {
        let buf = new Builder()
            .addArr(2)
            .addBulk("CLUSTER.ENTRIES")
            .addBulk(name)
            .out();
        await this.send(buf);
        let d = await this.read();
        let p = new Parser(d);
        let lexiVal = p.parse();
        return lexiVal.value;
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
