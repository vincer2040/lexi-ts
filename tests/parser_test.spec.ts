import { describe, it, expect } from "vitest";
import { Parser } from "../src/parser";

describe("parser", () => {
    it("can parse bulk strings", () => {
        let input = "$7\r\nis cool\r\n";
        let parser = new Parser(input);
        parser.parse();
    });
});

