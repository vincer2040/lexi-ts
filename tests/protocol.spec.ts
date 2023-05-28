import Protocol from "../src/protocol";
import { expect, it, describe, beforeEach } from "vitest";


describe("protocol", () => {
    let protocol: Protocol;
    beforeEach(() => {
        protocol = new Protocol();
    });

    it("can create simple strings", () => {
        let t = protocol
            .addSimple("ping")
            .out();

        let string = new TextDecoder().decode(t);
        expect(string).toBe("+PING\r\n");
    });

    it("can create bulk strings", () => {
        let t = protocol
            .addBulkString("vince")
            .out();

        let string = new TextDecoder().decode(t);
        expect(string).toBe("$5\r\nvince\r\n");
    });

    it.todo("can create integers");

    it("can create arrays", () => {
        let t = protocol
            .addArray(3)
            .addBulkString("SET")
            .addBulkString("vince")
            .addBulkString("is cool")
            .out();

        let string = new TextDecoder().decode(t);
        expect(string).toBe("*3\r\n$3\r\nSET\r\n$5\r\nvince\r\n$7\r\nis cool\r\n");
    });
});
