

export const ARRAY_TYPE_BYTE = 42; // *
export const STRING_TYPE_BYTE = 36; // $
export const SIMPLE_TYPE_BYTE = 43; // +
export const INT_TYPE_BYTE = 58; // :
export const DOUBLE_TYPE_BYTE = 44; // ,
export const ERROR_TYPE_BYTE = 45; // -
export const RET_CAR = 13 // \r
export const NEW_LINE = 10 // \n

const ONE_CHAR = 49;
const NINE_CHAR = 57;

export function isDigit(char: number): boolean {
    return ONE_CHAR <= char && char <= NINE_CHAR;
}

