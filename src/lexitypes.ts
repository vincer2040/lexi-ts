export const LexiTypes = {
    array: "array",
    bulk: "bulk",
    int: "int",
    simple: "simple",
} as const;

export type LexiType = keyof typeof LexiTypes;

export type LexiVal = Array<LexiValue> | string | number | bigint | null;

export type LexiValue = {
    type: LexiType,
    value: LexiVal,
}

