export const LexiTypes = {
    array: "array",
    bulk: "bulk",
    int: "int",
    simple: "simple",
} as const;

export type LexiType = keyof typeof LexiTypes;

export type LexiValue = {
    type: LexiType,
    value: string | Array<LexiValue> | number | null,
}
