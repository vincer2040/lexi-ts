export const Tokens = {
    eoft: "eoft",
    type: "type",
    simple: "simple",
    len: "len",
    retcar: "retcar",
    newl: "newl",
    bulk: "bulk",
    int: "int",
    illegal: "illegal"
} as const;

export type TokenT = keyof typeof Tokens;

export type Token = {
    type: TokenT,
    literal: string,
}
