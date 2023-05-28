import { ProtocolBuilder, ProtocolUnpacker, UnpackedProtocol } from "../src/protocol";
import { expect, it, describe } from "vitest";

describe("ProtocolUnpacker", () => {
    it("can unpack bulk strings", () => {
        let builder: ProtocolBuilder = new ProtocolBuilder();
        let unpacker: ProtocolUnpacker;
        let t = builder
            .addBulkString("vince")
            .out();
        unpacker = new ProtocolUnpacker(t);
        let out: UnpackedProtocol = unpacker.unpack();
        expect(out.type).toBe("BulkString");
        expect(out.value).toBe("vince");
    });

    it.todo("can unpack integers");

    it("can unpack arrays", () => {
        let builder: ProtocolBuilder = new ProtocolBuilder();
        let unpacker: ProtocolUnpacker;
        let t = builder
            .addArray(3)
            .addBulkString("vince")
            .addBulkString("is")
            .addBulkString("cool")
            .out();

        unpacker = new ProtocolUnpacker(t);
        let out: UnpackedProtocol = unpacker.unpack();
        expect(out.type).toBe("Array");
        expect(out.value).toEqual(["vince", "is", "cool"])
    });
});
